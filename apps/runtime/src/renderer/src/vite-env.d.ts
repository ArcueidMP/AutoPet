/// <reference types="vite/client" />

interface AutoPetBridge {
  appName: string;
  version: string;
  runtimeWindow: {
    startDrag: () => Promise<void>;
    endDrag: () => Promise<{
      didMove: boolean;
    }>;
  };
}

interface Window {
  autopet?: AutoPetBridge;
}
