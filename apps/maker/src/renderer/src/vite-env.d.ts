/// <reference types="vite/client" />

import type {
  MakerExportPetPackageRequest,
  MakerExportPetPackageResult,
  MakerSelectedInputImageResult,
  MakerSelectedOutputFolderResult
} from "../../shared/ipc";

declare global {
  interface AutoPetBridge {
    appName: string;
    version: string;
    maker: {
      selectInputImage: () => Promise<MakerSelectedInputImageResult>;
      selectOutputFolder: () => Promise<MakerSelectedOutputFolderResult>;
      exportPetPackage: (
        request: MakerExportPetPackageRequest
      ) => Promise<MakerExportPetPackageResult>;
    };
  }

  interface Window {
    autopet?: AutoPetBridge;
  }
}

export {};
