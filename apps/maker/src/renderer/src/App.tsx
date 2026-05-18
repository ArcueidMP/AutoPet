import { useState } from "react";

import type { MakerExportPetPackageResult } from "../../shared/ipc";

const DEFAULT_PET_NAME = "My Pet";
const OUTPUT_SNIPPET_LENGTH = 2400;

type SuccessfulExportResult = Extract<
  MakerExportPetPackageResult,
  { ok: true }
>;

type ExportStatus =
  | {
      kind: "idle";
      message: string;
    }
  | {
      kind: "exporting";
      message: string;
    }
  | {
      kind: "success";
      result: SuccessfulExportResult;
    }
  | {
      kind: "error";
      errors: string[];
      stdout?: string;
      stderr?: string;
    };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown error.";
}

function createOutputSnippet(output: string | undefined): string | undefined {
  const trimmedOutput = output?.trim();

  if (trimmedOutput === undefined || trimmedOutput.length === 0) {
    return undefined;
  }

  if (trimmedOutput.length <= OUTPUT_SNIPPET_LENGTH) {
    return trimmedOutput;
  }

  return `${trimmedOutput.slice(0, OUTPUT_SNIPPET_LENGTH)}\n[Output truncated in Maker.]`;
}

function PathValue({ value, placeholder }: { value?: string; placeholder: string }) {
  return (
    <p className={value === undefined ? "path-value path-value-empty" : "path-value"}>
      {value ?? placeholder}
    </p>
  );
}

function StatusPanel({ status }: { status: ExportStatus }) {
  if (status.kind === "success") {
    return (
      <section className="status-panel status-success" aria-live="polite">
        <h2>Export Complete</h2>
        <dl className="result-list">
          <div>
            <dt>Package folder</dt>
            <dd>{status.result.packageFolderPath}</dd>
          </div>
          <div>
            <dt>pet.json</dt>
            <dd>{status.result.manifestPath}</dd>
          </div>
          <div>
            <dt>spritesheet.png</dt>
            <dd>{status.result.spritesheetPath}</dd>
          </div>
          <div>
            <dt>preview.gif</dt>
            <dd>{status.result.previewPath}</dd>
          </div>
        </dl>
      </section>
    );
  }

  if (status.kind === "error") {
    const stderrSnippet = createOutputSnippet(status.stderr);
    const stdoutSnippet = createOutputSnippet(status.stdout);

    return (
      <section className="status-panel status-error" aria-live="assertive">
        <h2>Export Failed</h2>
        <ul className="error-list">
          {status.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>

        {stderrSnippet !== undefined && (
          <div className="output-block">
            <h3>stderr</h3>
            <pre>{stderrSnippet}</pre>
          </div>
        )}

        {stdoutSnippet !== undefined && (
          <div className="output-block">
            <h3>stdout</h3>
            <pre>{stdoutSnippet}</pre>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className={`status-panel ${status.kind === "exporting" ? "status-exporting" : ""}`}
      aria-live="polite"
    >
      <h2>Status</h2>
      <p>{status.message}</p>
    </section>
  );
}

export function App() {
  const makerApi = window.autopet?.maker;
  const [petName, setPetName] = useState(DEFAULT_PET_NAME);
  const [selectedInputImagePath, setSelectedInputImagePath] = useState<string>();
  const [selectedOutputFolderPath, setSelectedOutputFolderPath] = useState<string>();
  const [status, setStatus] = useState<ExportStatus>({
    kind: "idle",
    message: "Choose a transparent PNG and an output folder."
  });
  const isExporting = status.kind === "exporting";
  const canExport =
    makerApi !== undefined &&
    selectedInputImagePath !== undefined &&
    selectedOutputFolderPath !== undefined &&
    !isExporting;

  async function selectInputImage(): Promise<void> {
    if (makerApi === undefined) {
      setStatus({
        kind: "error",
        errors: ["Maker preload API is unavailable."]
      });
      return;
    }

    try {
      const result = await makerApi.selectInputImage();

      if (!result.ok) {
        setStatus({
          kind: "error",
          errors: result.errors
        });
        return;
      }

      if (result.canceled) {
        setStatus({
          kind: "idle",
          message: "PNG selection canceled."
        });
        return;
      }

      setSelectedInputImagePath(result.inputImagePath);
      setStatus({
        kind: "idle",
        message: "Transparent PNG selected."
      });
    } catch (error) {
      setStatus({
        kind: "error",
        errors: [`Could not choose PNG: ${getErrorMessage(error)}`]
      });
    }
  }

  async function selectOutputFolder(): Promise<void> {
    if (makerApi === undefined) {
      setStatus({
        kind: "error",
        errors: ["Maker preload API is unavailable."]
      });
      return;
    }

    try {
      const result = await makerApi.selectOutputFolder();

      if (!result.ok) {
        setStatus({
          kind: "error",
          errors: result.errors
        });
        return;
      }

      if (result.canceled) {
        setStatus({
          kind: "idle",
          message: "Output folder selection canceled."
        });
        return;
      }

      setSelectedOutputFolderPath(result.outputFolderPath);
      setStatus({
        kind: "idle",
        message: "Output folder selected."
      });
    } catch (error) {
      setStatus({
        kind: "error",
        errors: [`Could not choose output folder: ${getErrorMessage(error)}`]
      });
    }
  }

  async function exportPetPackage(): Promise<void> {
    if (makerApi === undefined) {
      setStatus({
        kind: "error",
        errors: ["Maker preload API is unavailable."]
      });
      return;
    }

    setStatus({
      kind: "exporting",
      message: "Exporting pet package..."
    });

    try {
      const result = await makerApi.exportPetPackage({ petName });

      if (result.ok) {
        setStatus({
          kind: "success",
          result
        });
        return;
      }

      setStatus({
        kind: "error",
        errors: result.errors,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (error) {
      setStatus({
        kind: "error",
        errors: [`Could not export pet package: ${getErrorMessage(error)}`]
      });
    }
  }

  return (
    <main className="maker-shell">
      <header className="maker-header">
        <div>
          <p className="eyebrow">AutoPet v{window.autopet?.version ?? "0.1.0"}</p>
          <h1>Maker</h1>
        </div>
      </header>

      <section className="maker-grid" aria-label="Maker export">
        <form
          className="panel export-panel"
          onSubmit={(event) => {
            event.preventDefault();

            if (canExport) {
              void exportPetPackage();
            }
          }}
        >
          <div className="field">
            <label htmlFor="pet-name">Pet name</label>
            <input
              id="pet-name"
              type="text"
              value={petName}
              disabled={isExporting}
              onChange={(event) => {
                setPetName(event.target.value);
              }}
            />
          </div>

          <div className="picker-block">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => {
                void selectInputImage();
              }}
            >
              Choose Transparent PNG
            </button>
            <PathValue
              value={selectedInputImagePath}
              placeholder="No transparent PNG selected"
            />
          </div>

          <div className="picker-block">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => {
                void selectOutputFolder();
              }}
            >
              Choose Output Folder
            </button>
            <PathValue
              value={selectedOutputFolderPath}
              placeholder="No output folder selected"
            />
          </div>

          <button type="submit" className="primary-button" disabled={!canExport}>
            {isExporting ? "Exporting..." : "Export Pet Package"}
          </button>
        </form>

        <aside className="panel pipeline-panel">
          <h2>Pipeline</h2>
          <ol className="steps">
            <li>Trim transparent bounds</li>
            <li>Normalize to 256 x 256</li>
            <li>Generate transform frames</li>
            <li>Write pet package files</li>
          </ol>
        </aside>

        <StatusPanel status={status} />
      </section>
    </main>
  );
}
