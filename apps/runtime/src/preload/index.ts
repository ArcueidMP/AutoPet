import { contextBridge, ipcRenderer } from "electron";

import {
  RUNTIME_PET_IPC,
  RUNTIME_WINDOW_IPC
} from "../shared/ipc";
import type {
  RuntimePetLoadedPayload,
  RuntimePetLoadErrorPayload
} from "../shared/ipc";

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
  },
  runtimePet: {
    onLoaded: (callback: (payload: RuntimePetLoadedPayload) => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        payload: RuntimePetLoadedPayload
      ) => {
        callback(payload);
      };

      ipcRenderer.on(RUNTIME_PET_IPC.loaded, listener);

      return () => {
        ipcRenderer.removeListener(RUNTIME_PET_IPC.loaded, listener);
      };
    },
    onLoadError: (callback: (payload: RuntimePetLoadErrorPayload) => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        payload: RuntimePetLoadErrorPayload
      ) => {
        callback(payload);
      };

      ipcRenderer.on(RUNTIME_PET_IPC.loadError, listener);

      return () => {
        ipcRenderer.removeListener(RUNTIME_PET_IPC.loadError, listener);
      };
    }
  }
});
