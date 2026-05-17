import type { PetManifestV010 } from "@autopet/pet-format";

export const RUNTIME_WINDOW_IPC = {
  dragStart: "runtime-window:drag-start",
  dragEnd: "runtime-window:drag-end"
} as const;

export const RUNTIME_PET_IPC = {
  loaded: "runtime-pet:loaded",
  loadError: "runtime-pet:load-error"
} as const;

export interface RuntimePetLoadedPayload {
  manifest: PetManifestV010;
  spriteUrl: string;
}

export interface RuntimePetLoadErrorPayload {
  errors: string[];
}
