import { contextBridge, ipcRenderer } from "electron";

import { RUNTIME_WINDOW_IPC } from "../shared/ipc";

if (process.env.AUTOPET_DEBUG_DRAG === "1") {
  console.log("[AutoPet Runtime drag] preload:loaded");
}

contextBridge.exposeInMainWorld("autopet", {
  appName: "runtime",
  version: "0.1.0",
  runtimeWindow: {
    startDrag: async () => {
      await ipcRenderer.invoke(RUNTIME_WINDOW_IPC.dragStart);
    },
    endDrag: async () => {
      return ipcRenderer.invoke(RUNTIME_WINDOW_IPC.dragEnd) as Promise<{
        didMove: boolean;
      }>;
    }
  }
});
