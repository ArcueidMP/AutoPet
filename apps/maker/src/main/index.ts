import { BrowserWindow, app, dialog, ipcMain } from "electron";
import type {
  IpcMainInvokeEvent,
  OpenDialogOptions,
  OpenDialogReturnValue
} from "electron";
import { join } from "node:path";

import { MAKER_IPC } from "../shared/ipc";
import type {
  MakerExportPetPackageRequest,
  MakerExportPetPackageResult,
  MakerSelectedInputImageResult,
  MakerSelectedOutputFolderResult
} from "../shared/ipc";
import { runImagePipelineExport } from "./image-pipeline-runner";

let selectedInputImagePath: string | undefined;
let selectedOutputFolderPath: string | undefined;
let didRegisterMakerIpcHandlers = false;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown error.";
}

function getPetNameFromRequest(request: unknown): string {
  if (
    typeof request === "object" &&
    request !== null &&
    "petName" in request &&
    typeof request.petName === "string"
  ) {
    return request.petName;
  }

  return "";
}

async function showOpenDialogForEvent(
  event: IpcMainInvokeEvent,
  options: OpenDialogOptions
): Promise<OpenDialogReturnValue> {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (window === null) {
    return dialog.showOpenDialog(options);
  }

  return dialog.showOpenDialog(window, options);
}

function registerMakerIpcHandlers(): void {
  if (didRegisterMakerIpcHandlers) {
    return;
  }

  didRegisterMakerIpcHandlers = true;

  ipcMain.handle(
    MAKER_IPC.selectInputImage,
    async (event): Promise<MakerSelectedInputImageResult> => {
      try {
        const result = await showOpenDialogForEvent(event, {
          title: "Choose Transparent PNG",
          properties: ["openFile"],
          filters: [
            {
              name: "PNG Images",
              extensions: ["png"]
            }
          ]
        });

        if (result.canceled) {
          return {
            ok: true,
            canceled: true
          };
        }

        const inputImagePath = result.filePaths[0];

        if (inputImagePath === undefined) {
          return {
            ok: true,
            canceled: true
          };
        }

        selectedInputImagePath = inputImagePath;

        return {
          ok: true,
          canceled: false,
          inputImagePath
        };
      } catch (error) {
        return {
          ok: false,
          canceled: false,
          errors: [`Could not open PNG picker: ${getErrorMessage(error)}`]
        };
      }
    }
  );

  ipcMain.handle(
    MAKER_IPC.selectOutputFolder,
    async (event): Promise<MakerSelectedOutputFolderResult> => {
      try {
        const result = await showOpenDialogForEvent(event, {
          title: "Choose Output Folder",
          properties: ["openDirectory"]
        });

        if (result.canceled) {
          return {
            ok: true,
            canceled: true
          };
        }

        const outputFolderPath = result.filePaths[0];

        if (outputFolderPath === undefined) {
          return {
            ok: true,
            canceled: true
          };
        }

        selectedOutputFolderPath = outputFolderPath;

        return {
          ok: true,
          canceled: false,
          outputFolderPath
        };
      } catch (error) {
        return {
          ok: false,
          canceled: false,
          errors: [`Could not open output folder picker: ${getErrorMessage(error)}`]
        };
      }
    }
  );

  ipcMain.handle(
    MAKER_IPC.exportPetPackage,
    async (
      _event,
      request: MakerExportPetPackageRequest
    ): Promise<MakerExportPetPackageResult> => {
      const inputImagePath = selectedInputImagePath;
      const outputFolderPath = selectedOutputFolderPath;
      if (inputImagePath === undefined || outputFolderPath === undefined) {
        const errors = [
          ...(inputImagePath === undefined
            ? ["Choose a transparent PNG before exporting."]
            : []),
          ...(outputFolderPath === undefined
            ? ["Choose an output folder before exporting."]
            : [])
        ];

        return {
          ok: false,
          errors
        };
      }

      try {
        return await runImagePipelineExport({
          inputImagePath,
          outputFolderPath,
          petName: getPetNameFromRequest(request)
        });
      } catch (error) {
        return {
          ok: false,
          errors: [`Could not export pet package: ${getErrorMessage(error)}`]
        };
      }
    }
  );
}

async function loadRenderer(window: BrowserWindow): Promise<void> {
  const devServerUrl = process.env.ELECTRON_RENDERER_URL;

  if (devServerUrl) {
    await window.loadURL(devServerUrl);
    return;
  }

  await window.loadFile(join(__dirname, "../renderer/index.html"));
}

function createMakerWindow(): void {
  const preloadPath = join(__dirname, "../preload/index.mjs");
  const window = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    show: false,
    title: "AutoPet Maker",
    backgroundColor: "#f7f5ef",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.webContents.on("preload-error", (_event, failedPreloadPath, error) => {
    console.error("Failed to load AutoPet Maker preload.", {
      preloadPath: failedPreloadPath,
      error: error.message,
      stack: error.stack
    });
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  void loadRenderer(window).catch((error) => {
    console.error("Failed to load AutoPet Maker renderer.", error);
    app.quit();
  });
}

app.whenReady().then(() => {
  registerMakerIpcHandlers();
  createMakerWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMakerWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
