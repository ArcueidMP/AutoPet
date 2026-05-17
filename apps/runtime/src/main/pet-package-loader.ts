import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

import type { PetManifestV010 } from "@autopet/pet-format";
import { validatePetManifest } from "@autopet/pet-format";

export interface RuntimePetPackage {
  folderPath: string;
  manifestPath: string;
  manifest: PetManifestV010;
  spritePath: string;
  previewPath?: string;
}

export type RuntimePetPackageLoadResult =
  | {
      ok: true;
      package: RuntimePetPackage;
    }
  | {
      ok: false;
      errors: string[];
    };

interface PackageAssetFileResult {
  path?: string;
  errors: string[];
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

function isPathInside(parentPath: string, candidatePath: string): boolean {
  const relativePath = relative(parentPath, candidatePath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !isAbsolute(relativePath))
  );
}

async function verifyPackageAssetFile(
  folderPath: string,
  realFolderPath: string,
  assetPath: string,
  assetLabel: "sprite" | "preview"
): Promise<PackageAssetFileResult> {
  const resolvedAssetPath = resolve(folderPath, assetPath);

  if (!isPathInside(folderPath, resolvedAssetPath)) {
    return {
      errors: [
        `${assetLabel} must resolve inside the pet package folder: ${assetPath}.`
      ]
    };
  }

  try {
    const assetStats = await stat(resolvedAssetPath);

    if (!assetStats.isFile()) {
      return {
        errors: [
          `${assetLabel} must point to a file: ${resolvedAssetPath}.`
        ]
      };
    }

    const realAssetPath = await realpath(resolvedAssetPath);

    if (!isPathInside(realFolderPath, realAssetPath)) {
      return {
        errors: [
          `${assetLabel} must resolve inside the pet package folder: ${assetPath}.`
        ]
      };
    }
  } catch (error) {
    const code = getFileSystemErrorCode(error);
    const missingMessage =
      code === "ENOENT"
        ? `${assetLabel} file was not found: ${resolvedAssetPath}.`
        : `Could not open ${assetLabel} file: ${resolvedAssetPath}. ${getErrorMessage(error)}`;

    return {
      errors: [missingMessage]
    };
  }

  return {
    path: resolvedAssetPath,
    errors: []
  };
}

export async function loadRuntimePetPackage(
  folderPath: string
): Promise<RuntimePetPackageLoadResult> {
  if (folderPath.trim().length === 0) {
    return {
      ok: false,
      errors: ["Pet package folder path is required."]
    };
  }

  const resolvedFolderPath = resolve(folderPath);
  let realFolderPath: string;

  try {
    const folderStats = await stat(resolvedFolderPath);

    if (!folderStats.isDirectory()) {
      return {
        ok: false,
        errors: [`Pet package path must be a folder: ${resolvedFolderPath}.`]
      };
    }

    realFolderPath = await realpath(resolvedFolderPath);
  } catch (error) {
    const code = getFileSystemErrorCode(error);
    const missingMessage =
      code === "ENOENT"
        ? `Pet package folder was not found: ${resolvedFolderPath}.`
        : `Could not open pet package folder: ${resolvedFolderPath}. ${getErrorMessage(error)}`;

    return {
      ok: false,
      errors: [missingMessage]
    };
  }

  const manifestPath = join(resolvedFolderPath, "pet.json");
  let manifestText: string;

  try {
    manifestText = await readFile(manifestPath, "utf8");
  } catch (error) {
    const code = getFileSystemErrorCode(error);
    const missingMessage =
      code === "ENOENT"
        ? `Pet package is missing pet.json: ${manifestPath}.`
        : `Could not read pet.json: ${manifestPath}. ${getErrorMessage(error)}`;

    return {
      ok: false,
      errors: [missingMessage]
    };
  }

  let manifestInput: unknown;

  try {
    manifestInput = JSON.parse(manifestText);
  } catch (error) {
    return {
      ok: false,
      errors: [`pet.json is not valid JSON: ${getErrorMessage(error)}`]
    };
  }

  const manifestValidation = validatePetManifest(manifestInput);

  if (!manifestValidation.ok) {
    return {
      ok: false,
      errors: manifestValidation.errors.map((error) => `pet.json: ${error}`)
    };
  }

  const { manifest } = manifestValidation;
  const spriteResult = await verifyPackageAssetFile(
    resolvedFolderPath,
    realFolderPath,
    manifest.sprite,
    "sprite"
  );
  const errors = [...spriteResult.errors];
  let previewPath: string | undefined;

  if (manifest.preview !== undefined) {
    const previewResult = await verifyPackageAssetFile(
      resolvedFolderPath,
      realFolderPath,
      manifest.preview,
      "preview"
    );

    errors.push(...previewResult.errors);
    previewPath = previewResult.path;
  }

  if (errors.length > 0 || spriteResult.path === undefined) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    package: {
      folderPath: resolvedFolderPath,
      manifestPath,
      manifest,
      spritePath: spriteResult.path,
      ...(previewPath === undefined ? {} : { previewPath })
    }
  };
}
