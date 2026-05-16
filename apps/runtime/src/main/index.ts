import { BrowserWindow, Menu, app, ipcMain, screen } from "electron";
import type {
  IpcMainInvokeEvent,
  MenuItemConstructorOptions,
  Rectangle
} from "electron";
import { join } from "node:path";

import { RUNTIME_WINDOW_IPC } from "../shared/ipc";

const RUNTIME_WINDOW_SIZE = 256;
const RUNTIME_WINDOW_MARGIN = 24;
const DRAG_POLL_INTERVAL_MS = 16;
const DRAG_START_THRESHOLD_PX = 4;

interface DragSession {
  cursorStart: {
    x: number;
    y: number;
  };
  windowStartBounds: Rectangle;
  timerId: ReturnType<typeof setInterval>;
  didMove: boolean;
}

const dragSessions = new WeakMap<BrowserWindow, DragSession>();
const activeDragWindows = new Set<BrowserWindow>();

async function loadRenderer(window: BrowserWindow): Promise<void> {
  const devServerUrl = process.env.ELECTRON_RENDERER_URL;

  if (devServerUrl) {
    await window.loadURL(devServerUrl);
    return;
  }

  await window.loadFile(join(__dirname, "../renderer/index.html"));
}

function getDefaultRuntimeBounds(): Rectangle {
  const { workArea } = screen.getPrimaryDisplay();
  const x = Math.max(
    workArea.x,
    workArea.x + workArea.width - RUNTIME_WINDOW_SIZE - RUNTIME_WINDOW_MARGIN
  );
  const y = Math.max(
    workArea.y,
    workArea.y + workArea.height - RUNTIME_WINDOW_SIZE - RUNTIME_WINDOW_MARGIN
  );

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: RUNTIME_WINDOW_SIZE,
    height: RUNTIME_WINDOW_SIZE
  };
}

function resetRuntimePosition(window: BrowserWindow): void {
  window.setBounds(getDefaultRuntimeBounds());
}

function openRuntimeContextMenu(window: BrowserWindow): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: "Reset Position",
      click: () => {
        resetRuntimePosition(window);
      }
    },
    {
      label: "Always on Top",
      type: "checkbox",
      checked: window.isAlwaysOnTop(),
      click: (menuItem) => {
        window.setAlwaysOnTop(menuItem.checked);
      }
    },
    {
      type: "separator"
    },
    {
      label: "Exit",
      click: () => {
        app.quit();
      }
    }
  ];

  Menu.buildFromTemplate(template).popup({ window });
}

interface EndDragResult {
  didMove: boolean;
}

function debugDrag(message: string, details?: Record<string, unknown>): void {
  if (process.env.AUTOPET_DEBUG_DRAG !== "1") {
    return;
  }

  if (details === undefined) {
    console.log(`[AutoPet Runtime drag] ${message}`);
    return;
  }

  console.log(`[AutoPet Runtime drag] ${message}`, details);
}

function getWindowFromIpcEvent(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender);
}

function endRuntimeWindowDrag(window: BrowserWindow): EndDragResult {
  const dragSession = dragSessions.get(window);

  if (dragSession === undefined) {
    debugDrag("drag:end-without-session");
    return {
      didMove: false
    };
  }

  clearInterval(dragSession.timerId);
  dragSessions.delete(window);
  activeDragWindows.delete(window);

  debugDrag("drag:end", {
    didMove: dragSession.didMove
  });

  return {
    didMove: dragSession.didMove
  };
}

function updateRuntimeWindowDrag(window: BrowserWindow): void {
  if (window.isDestroyed()) {
    endRuntimeWindowDrag(window);
    return;
  }

  const dragSession = dragSessions.get(window);

  if (dragSession === undefined) {
    return;
  }

  const cursor = screen.getCursorScreenPoint();
  const deltaX = cursor.x - dragSession.cursorStart.x;
  const deltaY = cursor.y - dragSession.cursorStart.y;

  if (!dragSession.didMove) {
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < DRAG_START_THRESHOLD_PX) {
      return;
    }

    dragSession.didMove = true;
    debugDrag("drag:tick-crossed-threshold", {
      deltaX,
      deltaY,
      distance
    });
  }

  window.setBounds(
    {
      x: Math.round(dragSession.windowStartBounds.x + deltaX),
      y: Math.round(dragSession.windowStartBounds.y + deltaY),
      width: dragSession.windowStartBounds.width,
      height: dragSession.windowStartBounds.height
    },
    false
  );
}

function startRuntimeWindowDrag(window: BrowserWindow): void {
  if (window.isDestroyed()) {
    return;
  }

  endRuntimeWindowDrag(window);

  const cursorStart = screen.getCursorScreenPoint();
  const windowStartBounds = window.getBounds();
  const dragSession: DragSession = {
    cursorStart,
    windowStartBounds,
    timerId: setInterval(() => {
      updateRuntimeWindowDrag(window);
    }, DRAG_POLL_INTERVAL_MS),
    didMove: false
  };

  dragSessions.set(window, dragSession);
  activeDragWindows.add(window);
  debugDrag("drag:start", {
    cursorStart,
    windowStartBounds
  });
  updateRuntimeWindowDrag(window);
}

ipcMain.handle(RUNTIME_WINDOW_IPC.dragStart, (event) => {
  const window = getWindowFromIpcEvent(event);

  if (window === null) {
    debugDrag("drag:missing-window", {
      phase: "start"
    });
    return;
  }

  startRuntimeWindowDrag(window);
});

ipcMain.handle(RUNTIME_WINDOW_IPC.dragEnd, (event): EndDragResult => {
  const window = getWindowFromIpcEvent(event);

  if (window === null) {
    debugDrag("drag:missing-window", {
      phase: "end"
    });
    return {
      didMove: false
    };
  }

  return endRuntimeWindowDrag(window);
});

function createRuntimeWindow(): void {
  const defaultBounds = getDefaultRuntimeBounds();
  const preloadPath = join(__dirname, "../preload/index.mjs");

  debugDrag("runtime:preload-path", {
    preloadPath
  });

  const window = new BrowserWindow({
    ...defaultBounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    show: false,
    title: "AutoPet Runtime",
    backgroundColor: "#00000000",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.setAlwaysOnTop(true);

  window.webContents.on("preload-error", (_event, failedPreloadPath, error) => {
    debugDrag("preload:error", {
      preloadPath: failedPreloadPath,
      error: error.message,
      stack: error.stack
    });
  });

  window.webContents.on(
    "console-message",
    (_event, level, message, line, sourceId) => {
      debugDrag("renderer:console-message", {
        level,
        message,
        line,
        sourceId
      });
    }
  );

  window.webContents.on("context-menu", (event) => {
    event.preventDefault();
    openRuntimeContextMenu(window);
  });

  window.on("closed", () => {
    endRuntimeWindowDrag(window);
  });

  window.once("ready-to-show", () => {
    window.show();
  });

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

app.on("before-quit", () => {
  for (const window of Array.from(activeDragWindows)) {
    endRuntimeWindowDrag(window);
  }
});
