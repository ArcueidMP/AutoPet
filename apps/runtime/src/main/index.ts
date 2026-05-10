import { BrowserWindow, app } from "electron";
import { join } from "node:path";

async function loadRenderer(window: BrowserWindow): Promise<void> {
  const devServerUrl = process.env.ELECTRON_RENDERER_URL;

  if (devServerUrl) {
    await window.loadURL(devServerUrl);
    return;
  }

  await window.loadFile(join(__dirname, "../renderer/index.html"));
}

function createRuntimeWindow(): void {
  const window = new BrowserWindow({
    width: 280,
    height: 280,
    minWidth: 180,
    minHeight: 180,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    show: false,
    title: "AutoPet Runtime",
    backgroundColor: "#00000000",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.setAlwaysOnTop(true);

  window.once("ready-to-show", () => {
    window.show();
  });

  // TODO(v0.1): Load a local pet package and add the minimal runtime context menu.
  void loadRenderer(window).catch((error) => {
    console.error("Failed to load AutoPet Runtime renderer.", error);
    app.quit();
  });
}

app.whenReady().then(() => {
  createRuntimeWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createRuntimeWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
