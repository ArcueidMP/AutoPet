export const MAKER_IPC = {
  selectInputImage: "maker:select-input-image",
  selectOutputFolder: "maker:select-output-folder",
  exportPetPackage: "maker:export-pet-package"
} as const;

export type MakerSelectedInputImageResult =
  | {
      ok: true;
      canceled: true;
    }
  | {
      ok: true;
      canceled: false;
      inputImagePath: string;
    }
  | {
      ok: false;
      canceled: false;
      errors: string[];
    };

export type MakerSelectedOutputFolderResult =
  | {
      ok: true;
      canceled: true;
    }
  | {
      ok: true;
      canceled: false;
      outputFolderPath: string;
    }
  | {
      ok: false;
      canceled: false;
      errors: string[];
    };

export interface MakerExportPetPackageRequest {
  petName: string;
}

export type MakerExportPetPackageResult =
  | {
      ok: true;
      packageFolderPath: string;
      manifestPath: string;
      spritesheetPath: string;
      previewPath: string;
      stdout: string;
      stderr: string;
    }
  | {
      ok: false;
      errors: string[];
      exitCode?: number;
      stdout?: string;
      stderr?: string;
    };
