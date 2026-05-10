import type { PetManifest, PetStateName } from "@autopet/pet-format";

export interface AnimationSnapshot {
  state: PetStateName;
  frameIndex: number;
  elapsedInFrameMs: number;
}

export class PetAnimationPlayer {
  private currentState: PetStateName;
  private frameIndex = 0;
  private elapsedInFrameMs = 0;

  constructor(private readonly manifest: PetManifest) {
    this.currentState = manifest.defaultState;
  }

  snapshot(): AnimationSnapshot {
    return {
      state: this.currentState,
      frameIndex: this.frameIndex,
      elapsedInFrameMs: this.elapsedInFrameMs
    };
  }

  setState(nextState: PetStateName): void {
    if (!this.manifest.states[nextState]) {
      throw new Error(`Unknown pet animation state: ${nextState}`);
    }

    this.currentState = nextState;
    this.frameIndex = 0;
    this.elapsedInFrameMs = 0;
  }

  tick(deltaMs: number): AnimationSnapshot {
    const state = this.manifest.states[this.currentState];
    const frameDurationMs = 1000 / Math.max(state.fps, 1);
    this.elapsedInFrameMs += Math.max(deltaMs, 0);

    while (this.elapsedInFrameMs >= frameDurationMs) {
      this.elapsedInFrameMs -= frameDurationMs;
      this.frameIndex += 1;

      if (this.frameIndex < state.frames) {
        continue;
      }

      if (state.loop) {
        this.frameIndex = 0;
        continue;
      }

      if (state.next) {
        this.setState(state.next);
        break;
      }

      this.frameIndex = Math.max(state.frames - 1, 0);
      this.elapsedInFrameMs = 0;
      break;
    }

    return this.snapshot();
  }
}

// TODO(v0.1): Connect sprite-sheet frame coordinates and pointer-driven state changes.
