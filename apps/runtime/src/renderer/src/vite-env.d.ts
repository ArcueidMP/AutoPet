/// <reference types="vite/client" />

import type {
  RuntimePetLoadedPayload,
  RuntimePetLoadErrorPayload
} from "../../shared/ipc";

declare global {
  interface AutoPetBridge {
    appName: string;
    version: string;
    runtimeWindow: {
      startDrag: () => Promise<void>;
      endDrag: () => Promise<{
        didMove: boolean;
      }>;
    };
    runtimePet: {
      onLoaded: (
        callback: (payload: RuntimePetLoadedPayload) => void
      ) => () => void;
      onLoadError: (
        callback: (payload: RuntimePetLoadErrorPayload) => void
      ) => () => void;
    };
  }

  interface Window {
    autopet?: AutoPetBridge;
  }
}

export {};
