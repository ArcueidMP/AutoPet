/// <reference types="vite/client" />

interface AutoPetBridge {
  appName: string;
  version: string;
}

interface Window {
  autopet?: AutoPetBridge;
}
