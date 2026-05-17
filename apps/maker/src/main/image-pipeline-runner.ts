import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validatePetManifest } from "@autopet/pet-format";

const DEFAULT_PET_NAME = "My Pet";
const MAX_CAPTURED_OUTPUT_LENGTH = 512 * 1024;

export interface MakerImagePipelineExportOptions {
  inputImagePath: string;
  outputFolderPath: string;
  petName: string;
}

export type MakerImagePipelineExportResult =
  | {
      ok: true;
      packageFolderPath: string;
      manifestPath: string;
      spritesheetPath: string;
      previewPath: string;
      stdout: string;
      stderr: string;
    }
  | {
      ok: false;
      errors: string[];
      exitCode?: number;
      stdout?: string;
      stderr?: string;
    };

interface CapturedProcessOutput {
  append(chunk: Buffer | string): void;
  text(): string;
}

interface ImagePipelineProcessResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

interface GeneratedPackageVerificationResult {
  ok: boolean;
  errors: string[];
  manifestPath: string;
  spritesheetPath: string;
  previewPath: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown error.";
}

function getFileSystemErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

function createCapturedProcessOutput(): CapturedProcessOutput {
  let output = "";
  let truncated = false;

  return {
    append(chunk: Buffer | string): void {
      if (output.length >= MAX_CAPTURED_OUTPUT_LENGTH) {
        truncated = true;
        return;
      }

      const text = chunk.toString();
      const remainingLength = MAX_CAPTURED_OUTPUT_LENGTH - output.length;

      if (text.length > remainingLength) {
        output += text.slice(0, remainingLength);
        truncated = true;
        return;
      }

      output += text;
    },
    text(): string {
      if (!truncated) {
        return output;
      }

      return `${output}\n[AutoPet truncated captured output after ${MAX_CAPTURED_OUTPUT_LENGTH} characters.]`;
    }
  };
}

function normalizePetName(petName: string): string {
  const trimmedPetName = petName.trim();

  return trimmedPetName.length > 0 ? trimmedPetName : DEFAULT_PET_NAME;
}

async function isFile(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);

    return stats.isFile();
  } catch {
    return false;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);

    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function isRepositoryRoot(candidatePath: string): Promise<boolean> {
  const workspaceConfigPath = join(candidatePath, "pnpm-workspace.yaml");
  const imagePipelinePath = join(candidatePath, "packages", "image-pipeline");

  return (await isFile(workspaceConfigPath)) && (await isDirectory(imagePipelinePath));
}

async function findRepositoryRoot(): Promise<string | undefined> {
  const moduleDirectory = dirname(fileURLToPath(import.meta.url));
  const startDirectories = [process.cwd(), moduleDirectory];
  const visitedDirectories = new Set<string>();

  for (const startDirectory of startDirectories) {
    let currentDirectory = resolve(startDirectory);

    while (!visitedDirectories.has(currentDirectory)) {
      visitedDirectories.add(currentDirectory);

      if (await isRepositoryRoot(currentDirectory)) {
        return currentDirectory;
      }

      const parentDirectory = dirname(currentDirectory);
      if (parentDirectory === currentDirectory) {
        break;
      }

      currentDirectory = parentDirectory;
    }
  }

  return undefined;
}

async function resolvePythonExecutable(repositoryRoot: string): Promise<string> {
  const environmentPython = process.env.AUTOPET_PYTHON?.trim();

  if (environmentPython !== undefined && environmentPython.length > 0) {
    return environmentPython;
  }

  if (process.platform === "win32") {
    const windowsVenvPython = join(repositoryRoot, ".venv", "Scripts", "python.exe");

    if (await isFile(windowsVenvPython)) {
      return windowsVenvPython;
    }

    return "python";
  }

  const posixVenvPython = join(repositoryRoot, ".venv", "bin", "python");

  if (await isFile(posixVenvPython)) {
    return posixVenvPython;
  }

  return "python3";
}

function runImagePipelineProcess(
  pythonExecutable: string,
  imagePipelinePackagePath: string,
  inputImagePath: string,
  outputFolderPath: string,
  petName: string
): Promise<ImagePipelineProcessResult> {
  const stdout = createCapturedProcessOutput();
  const stderr = createCapturedProcessOutput();
  const args = [
    "-m",
    "autopet_image_pipeline",
    "--input",
    inputImagePath,
    "--output",
    outputFolderPath,
    "--name",
    petName
  ];

  return new Promise((resolveProcess) => {
    let didResolve = false;

    function resolveOnce(result: ImagePipelineProcessResult): void {
      if (didResolve) {
        return;
      }

      didResolve = true;
      resolveProcess(result);
    }

    try {
      const subprocess = spawn(pythonExecutable, args, {
        cwd: imagePipelinePackagePath,
        shell: false,
        windowsHide: true
      });

      subprocess.stdout?.on("data", (chunk: Buffer) => {
        stdout.append(chunk);
      });

      subprocess.stderr?.on("data", (chunk: Buffer) => {
        stderr.append(chunk);
      });

      subprocess.once("error", (error) => {
        stderr.append(getErrorMessage(error));
        resolveOnce({
          exitCode: null,
          signal: null,
          stdout: stdout.text(),
          stderr: stderr.text()
        });
      });

      subprocess.once("close", (exitCode, signal) => {
        resolveOnce({
          exitCode,
          signal,
          stdout: stdout.text(),
          stderr: stderr.text()
        });
      });
    } catch (error) {
      stderr.append(getErrorMessage(error));
      resolveOnce({
        exitCode: null,
        signal: null,
        stdout: stdout.text(),
        stderr: stderr.text()
      });
    }
  });
}

async function verifyFileExists(path: string, label: string): Promise<string[]> {
  try {
    const stats = await stat(path);

    if (!stats.isFile()) {
      return [`Generated ${label} must be a file: ${path}.`];
    }

    return [];
  } catch (error) {
    const code = getFileSystemErrorCode(error);

    if (code === "ENOENT") {
      return [`Generated package is missing ${label}: ${path}.`];
    }

    return [`Could not open generated ${label}: ${path}. ${getErrorMessage(error)}`];
  }
}

async function verifyGeneratedPackage(
  packageFolderPath: string
): Promise<GeneratedPackageVerificationResult> {
  const manifestPath = join(packageFolderPath, "pet.json");
  const spritesheetPath = join(packageFolderPath, "spritesheet.png");
  const previewPath = join(packageFolderPath, "preview.gif");
  const errors = [
    ...(await verifyFileExists(manifestPath, "pet.json")),
    ...(await verifyFileExists(spritesheetPath, "spritesheet.png")),
    ...(await verifyFileExists(previewPath, "preview.gif"))
  ];

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      manifestPath,
      spritesheetPath,
      previewPath
    };
  }

  let manifestInput: unknown;

  try {
    manifestInput = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    return {
      ok: false,
      errors: [`pet.json is not valid JSON: ${getErrorMessage(error)}`],
      manifestPath,
      spritesheetPath,
      previewPath
    };
  }

  const manifestValidation = validatePetManifest(manifestInput);

  if (!manifestValidation.ok) {
    return {
      ok: false,
      errors: manifestValidation.errors.map((error) => `pet.json: ${error}`),
      manifestPath,
      spritesheetPath,
      previewPath
    };
  }

  return {
    ok: true,
    errors: [],
    manifestPath,
    spritesheetPath,
    previewPath
  };
}

export async function runImagePipelineExport(
  options: MakerImagePipelineExportOptions
): Promise<MakerImagePipelineExportResult> {
  const inputImagePath = options.inputImagePath.trim();
  const outputFolderPath = options.outputFolderPath.trim();
  const petName = normalizePetName(options.petName);
  const inputErrors: string[] = [];

  if (inputImagePath.length === 0) {
    inputErrors.push("Input image path is required.");
  }

  if (outputFolderPath.length === 0) {
    inputErrors.push("Output folder path is required.");
  }

  if (inputErrors.length > 0) {
    return {
      ok: false,
      errors: inputErrors
    };
  }

  const resolvedInputImagePath = resolve(inputImagePath);
  const resolvedOutputFolderPath = resolve(outputFolderPath);

  try {
    const inputStats = await stat(resolvedInputImagePath);

    if (!inputStats.isFile()) {
      return {
        ok: false,
        errors: [`Input image path must point to a file: ${resolvedInputImagePath}.`]
      };
    }
  } catch (error) {
    const code = getFileSystemErrorCode(error);
    const missingMessage =
      code === "ENOENT"
        ? `Input image file was not found: ${resolvedInputImagePath}.`
        : `Could not open input image file: ${resolvedInputImagePath}. ${getErrorMessage(error)}`;

    return {
      ok: false,
      errors: [missingMessage]
    };
  }

  const repositoryRoot = await findRepositoryRoot();

  if (repositoryRoot === undefined) {
    return {
      ok: false,
      errors: ["Could not locate the AutoPet repository root from the current process."]
    };
  }

  const imagePipelinePackagePath = join(repositoryRoot, "packages", "image-pipeline");

  if (!(await isDirectory(imagePipelinePackagePath))) {
    return {
      ok: false,
      errors: [`Could not locate packages/image-pipeline: ${imagePipelinePackagePath}.`]
    };
  }

  const pythonExecutable = await resolvePythonExecutable(repositoryRoot);
  const processResult = await runImagePipelineProcess(
    pythonExecutable,
    imagePipelinePackagePath,
    resolvedInputImagePath,
    resolvedOutputFolderPath,
    petName
  );

  if (processResult.exitCode !== 0 || processResult.signal !== null) {
    const errors =
      processResult.signal !== null
        ? [`Image pipeline stopped after receiving signal ${processResult.signal}.`]
        : [
            processResult.exitCode === null
              ? `Could not start Python image pipeline with command: ${pythonExecutable}.`
              : `Image pipeline failed with exit code ${processResult.exitCode}.`
          ];

    return {
      ok: false,
      errors,
      ...(processResult.exitCode === null ? {} : { exitCode: processResult.exitCode }),
      stdout: processResult.stdout,
      stderr: processResult.stderr
    };
  }

  const generatedPackage = await verifyGeneratedPackage(resolvedOutputFolderPath);

  if (!generatedPackage.ok) {
    return {
      ok: false,
      errors: generatedPackage.errors,
      exitCode: processResult.exitCode ?? undefined,
      stdout: processResult.stdout,
      stderr: processResult.stderr
    };
  }

  return {
    ok: true,
    packageFolderPath: resolvedOutputFolderPath,
    manifestPath: generatedPackage.manifestPath,
    spritesheetPath: generatedPackage.spritesheetPath,
    previewPath: generatedPackage.previewPath,
    stdout: processResult.stdout,
    stderr: processResult.stderr
  };
}
