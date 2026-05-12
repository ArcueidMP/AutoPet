import type {
  PetAnimationStateV010,
  PetManifestV010
} from "@autopet/pet-format";

export interface PetSpriteFrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PetAnimationSnapshot<StateName extends string = string> {
  stateName: StateName;
  state: StateName;
  frameIndex: number;
  elapsedInFrameMs: number;
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
  next?: StateName;
  frameWidth: number;
  frameHeight: number;
  frameRect: PetSpriteFrameRect;
}

export type AnimationSnapshot<StateName extends string = string> =
  PetAnimationSnapshot<StateName>;

export class PetAnimationPlayer<StateName extends string = string> {
  private currentStateName: StateName;
  private currentFrameIndex = 0;
  private elapsedInFrameMs = 0;

  constructor(private readonly manifest: PetManifestV010<StateName>) {
    this.currentStateName = manifest.defaultState;
  }

  get stateName(): StateName {
    return this.currentStateName;
  }

  get state(): StateName {
    return this.currentStateName;
  }

  get frameIndex(): number {
    return this.currentFrameIndex;
  }

  get row(): number {
    return this.currentState.row;
  }

  get currentState(): PetAnimationStateV010<StateName> {
    return this.manifest.states[this.currentStateName];
  }

  snapshot(): PetAnimationSnapshot<StateName> {
    const state = this.currentState;
    const frameRect = this.frameRect(state);
    const snapshot = {
      stateName: this.currentStateName,
      state: this.currentStateName,
      frameIndex: this.currentFrameIndex,
      elapsedInFrameMs: this.elapsedInFrameMs,
      row: state.row,
      frames: state.frames,
      fps: state.fps,
      loop: state.loop,
      frameWidth: this.manifest.frameWidth,
      frameHeight: this.manifest.frameHeight,
      frameRect
    };

    if (state.next === undefined) {
      return snapshot;
    }

    return {
      ...snapshot,
      next: state.next
    };
  }

  reset(): PetAnimationSnapshot<StateName> {
    this.resetFrame();
    return this.snapshot();
  }

  setState(nextStateName: string): boolean {
    if (!this.hasState(nextStateName)) {
      return false;
    }

    this.switchToState(nextStateName);
    return true;
  }

  advance(deltaMs: number): PetAnimationSnapshot<StateName> {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
      return this.snapshot();
    }

    const state = this.currentState;
    const frameDurationMs = this.frameDurationMs(state);
    this.elapsedInFrameMs += deltaMs;

    while (this.elapsedInFrameMs >= frameDurationMs) {
      this.elapsedInFrameMs -= frameDurationMs;

      if (this.currentFrameIndex < state.frames - 1) {
        this.currentFrameIndex += 1;
        continue;
      }

      if (state.loop) {
        this.currentFrameIndex = 0;
        continue;
      }

      if (state.next !== undefined && this.hasState(state.next)) {
        this.switchToState(state.next);
        break;
      }

      this.currentFrameIndex = state.frames - 1;
      this.elapsedInFrameMs = 0;
      break;
    }

    return this.snapshot();
  }

  tick(deltaMs: number): PetAnimationSnapshot<StateName> {
    return this.advance(deltaMs);
  }

  private frameDurationMs(state: PetAnimationStateV010<StateName>): number {
    return 1000 / state.fps;
  }

  private frameRect(state: PetAnimationStateV010<StateName>): PetSpriteFrameRect {
    return {
      x: this.currentFrameIndex * this.manifest.frameWidth,
      y: state.row * this.manifest.frameHeight,
      width: this.manifest.frameWidth,
      height: this.manifest.frameHeight
    };
  }

  private hasState(stateName: string): stateName is StateName {
    return Object.prototype.hasOwnProperty.call(this.manifest.states, stateName);
  }

  private resetFrame(): void {
    this.currentFrameIndex = 0;
    this.elapsedInFrameMs = 0;
  }

  private switchToState(stateName: StateName): void {
    this.currentStateName = stateName;
    this.resetFrame();
  }
}
