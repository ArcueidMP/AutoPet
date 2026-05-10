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

function createMakerWindow(): void {
  const window = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    show: false,
    title: "AutoPet Maker",
    backgroundColor: "#f7f5ef",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  // TODO(v0.1): Expose safe preload APIs for importing images and invoking the local Python pipeline.
  void loadRenderer(window).catch((error) => {
    console.error("Failed to load AutoPet Maker renderer.", error);
    app.quit();
  });
}

app.whenReady().then(() => {
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
