export const PET_SCHEMA_VERSION = "0.1.0" as const;

export const V01_STATE_NAMES = ["idle", "bounce", "click", "sleep", "drag"] as const;

export type PetStateName = (typeof V01_STATE_NAMES)[number];

export interface PetAnimationState {
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
  next?: PetStateName;
}

export interface PetHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PetManifest {
  schemaVersion: typeof PET_SCHEMA_VERSION;
  name: string;
  version: string;
  sprite: string;
  preview: string;
  frameWidth: number;
  frameHeight: number;
  defaultState: PetStateName;
  states: Record<PetStateName, PetAnimationState>;
  hitbox: PetHitbox;
}

export function isPetStateName(value: string): value is PetStateName {
  return V01_STATE_NAMES.includes(value as PetStateName);
}

export function createDraftPetManifest(name = "My Pet"): PetManifest {
  return {
    schemaVersion: PET_SCHEMA_VERSION,
    name,
    version: "0.1.0",
    sprite: "spritesheet.png",
    preview: "preview.gif",
    frameWidth: 256,
    frameHeight: 256,
    defaultState: "idle",
    states: {
      idle: {
        row: 0,
        frames: 8,
        fps: 8,
        loop: true
      },
      bounce: {
        row: 1,
        frames: 8,
        fps: 8,
        loop: true
      },
      click: {
        row: 2,
        frames: 6,
        fps: 12,
        loop: false,
        next: "idle"
      },
      sleep: {
        row: 3,
        frames: 8,
        fps: 6,
        loop: true
      },
      drag: {
        row: 4,
        frames: 1,
        fps: 1,
        loop: true
      }
    },
    hitbox: {
      x: 32,
      y: 32,
      width: 192,
      height: 192
    }
  };
}

// TODO(v0.1): Add small manifest validation helpers without expanding the schema surface.
