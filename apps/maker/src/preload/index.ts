import { contextBridge, ipcRenderer } from "electron";

import { MAKER_IPC } from "../shared/ipc";
import type {
  MakerExportPetPackageRequest,
  MakerExportPetPackageResult,
  MakerSelectedInputImageResult,
  MakerSelectedOutputFolderResult
} from "../shared/ipc";

contextBridge.exposeInMainWorld("autopet", {
  appName: "maker",
  version: "0.1.0",
  maker: {
    selectInputImage: () => {
      return ipcRenderer.invoke(
        MAKER_IPC.selectInputImage
      ) as Promise<MakerSelectedInputImageResult>;
    },
    selectOutputFolder: () => {
      return ipcRenderer.invoke(
        MAKER_IPC.selectOutputFolder
      ) as Promise<MakerSelectedOutputFolderResult>;
    },
    exportPetPackage: (request: MakerExportPetPackageRequest) => {
      return ipcRenderer.invoke(MAKER_IPC.exportPetPackage, {
        petName:
          typeof request === "object" &&
          request !== null &&
          typeof request.petName === "string"
            ? request.petName
            : ""
      }) as Promise<MakerExportPetPackageResult>;
    }
  }
});
