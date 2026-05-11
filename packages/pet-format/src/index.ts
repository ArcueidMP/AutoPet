export const PET_MANIFEST_SCHEMA_VERSION = "0.1.0" as const;

export const SUPPORTED_PET_MANIFEST_SCHEMA_VERSIONS = [
  PET_MANIFEST_SCHEMA_VERSION
] as const;

export const V010_RECOMMENDED_STATE_NAMES = [
  "idle",
  "bounce",
  "click",
  "sleep",
  "drag"
] as const;

export const PET_SCHEMA_VERSION = PET_MANIFEST_SCHEMA_VERSION;
export const V01_STATE_NAMES = V010_RECOMMENDED_STATE_NAMES;

export type PetManifestSchemaVersion =
  (typeof SUPPORTED_PET_MANIFEST_SCHEMA_VERSIONS)[number];

export type PetRecommendedStateName =
  (typeof V010_RECOMMENDED_STATE_NAMES)[number];

export type PetStateName = string;

export interface PetAnimationStateV010<StateName extends string = string> {
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
  next?: StateName;
}

export interface PetHitboxV010 {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PetManifestV010<StateName extends string = string> {
  schemaVersion: typeof PET_MANIFEST_SCHEMA_VERSION;
  name: string;
  version: string;
  sprite: string;
  preview?: string;
  frameWidth: number;
  frameHeight: number;
  defaultState: StateName;
  states: Record<StateName, PetAnimationStateV010<StateName>>;
  hitbox?: PetHitboxV010;
}

export type PetAnimationState<StateName extends string = string> =
  PetAnimationStateV010<StateName>;
export type PetHitbox = PetHitboxV010;
export type PetManifest<StateName extends string = string> =
  PetManifestV010<StateName>;

export type ValidatePetManifestResult =
  | { ok: true; manifest: PetManifestV010 }
  | { ok: false; errors: string[] };

const URL_OR_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function validateRequiredNonEmptyString(
  record: Record<string, unknown>,
  key: string,
  errors: string[]
): string | undefined {
  if (!hasOwn(record, key)) {
    errors.push(`${key} is required.`);
    return undefined;
  }

  const value = record[key];
  if (!isNonEmptyString(value)) {
    errors.push(`${key} must be a non-empty string.`);
    return undefined;
  }

  return value;
}

function validatePositiveIntegerField(
  record: Record<string, unknown>,
  key: string,
  errors: string[]
): void {
  if (!hasOwn(record, key)) {
    errors.push(`${key} is required.`);
    return;
  }

  if (!isPositiveInteger(record[key])) {
    errors.push(`${key} must be a positive integer.`);
  }
}

function validatePortableAssetPath(
  value: string,
  fieldName: string,
  errors: string[]
): void {
  if (URL_OR_SCHEME_PATTERN.test(value)) {
    errors.push(`${fieldName} must be a relative local asset path, not a URL or absolute path.`);
    return;
  }

  if (
    value.startsWith("/") ||
    value.startsWith("\\") ||
    value.includes("\\")
  ) {
    errors.push(`${fieldName} must use a relative path with forward slashes.`);
    return;
  }

  const segments = value.split("/");
  if (segments.some((segment) => segment === "..")) {
    errors.push(`${fieldName} must not contain parent-directory traversal.`);
  }

  if (segments.some((segment) => segment === "" || segment === ".")) {
    errors.push(`${fieldName} must be a normalized relative asset path.`);
  }
}

function validateOptionalAssetPath(
  record: Record<string, unknown>,
  key: string,
  errors: string[]
): void {
  if (!hasOwn(record, key) || record[key] === undefined) {
    return;
  }

  const value = record[key];
  if (!isNonEmptyString(value)) {
    errors.push(`${key} must be a non-empty string when provided.`);
    return;
  }

  validatePortableAssetPath(value, key, errors);
}

function validateState(
  stateName: string,
  value: unknown,
  knownStates: Set<string>,
  errors: string[]
): void {
  const prefix = `states.${stateName}`;

  if (!isRecord(value)) {
    errors.push(`${prefix} must be an object.`);
    return;
  }

  if (!hasOwn(value, "row")) {
    errors.push(`${prefix}.row is required.`);
  } else if (!isNonNegativeInteger(value.row)) {
    errors.push(`${prefix}.row must be a non-negative integer.`);
  }

  if (!hasOwn(value, "frames")) {
    errors.push(`${prefix}.frames is required.`);
  } else if (!isPositiveInteger(value.frames)) {
    errors.push(`${prefix}.frames must be a positive integer.`);
  }

  if (!hasOwn(value, "fps")) {
    errors.push(`${prefix}.fps is required.`);
  } else if (!isPositiveInteger(value.fps)) {
    errors.push(`${prefix}.fps must be a positive integer.`);
  }

  if (!hasOwn(value, "loop")) {
    errors.push(`${prefix}.loop is required.`);
  } else if (typeof value.loop !== "boolean") {
    errors.push(`${prefix}.loop must be a boolean.`);
  }

  if (hasOwn(value, "next") && value.next !== undefined) {
    if (!isNonEmptyString(value.next)) {
      errors.push(`${prefix}.next must be a non-empty string when provided.`);
    } else if (!knownStates.has(value.next)) {
      errors.push(`${prefix}.next must point to an existing state.`);
    }
  }
}

function validateHitbox(value: unknown, errors: string[]): void {
  if (value === undefined) {
    return;
  }

  if (!isRecord(value)) {
    errors.push("hitbox must be an object when provided.");
    return;
  }

  if (!hasOwn(value, "x")) {
    errors.push("hitbox.x is required when hitbox is provided.");
  } else if (!isNonNegativeNumber(value.x)) {
    errors.push("hitbox.x must be a non-negative number.");
  }

  if (!hasOwn(value, "y")) {
    errors.push("hitbox.y is required when hitbox is provided.");
  } else if (!isNonNegativeNumber(value.y)) {
    errors.push("hitbox.y must be a non-negative number.");
  }

  if (!hasOwn(value, "width")) {
    errors.push("hitbox.width is required when hitbox is provided.");
  } else if (!isPositiveNumber(value.width)) {
    errors.push("hitbox.width must be a positive number.");
  }

  if (!hasOwn(value, "height")) {
    errors.push("hitbox.height is required when hitbox is provided.");
  } else if (!isPositiveNumber(value.height)) {
    errors.push("hitbox.height must be a positive number.");
  }
}

export function isPetRecommendedStateName(
  value: string
): value is PetRecommendedStateName {
  return V010_RECOMMENDED_STATE_NAMES.includes(
    value as PetRecommendedStateName
  );
}

export function isPetStateName(value: string): value is PetStateName {
  return isNonEmptyString(value);
}

export function validatePetManifest(
  input: unknown
): ValidatePetManifestResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["manifest must be an object."] };
  }

  const schemaVersion = validateRequiredNonEmptyString(
    input,
    "schemaVersion",
    errors
  );
  if (
    schemaVersion !== undefined &&
    schemaVersion !== PET_MANIFEST_SCHEMA_VERSION
  ) {
    errors.push(
      `schemaVersion must be ${PET_MANIFEST_SCHEMA_VERSION}.`
    );
  }

  validateRequiredNonEmptyString(input, "name", errors);
  validateRequiredNonEmptyString(input, "version", errors);

  const sprite = validateRequiredNonEmptyString(input, "sprite", errors);
  if (sprite !== undefined) {
    validatePortableAssetPath(sprite, "sprite", errors);
  }

  validateOptionalAssetPath(input, "preview", errors);
  validatePositiveIntegerField(input, "frameWidth", errors);
  validatePositiveIntegerField(input, "frameHeight", errors);

  const defaultState = validateRequiredNonEmptyString(
    input,
    "defaultState",
    errors
  );

  if (!hasOwn(input, "states")) {
    errors.push("states is required.");
  } else if (!isRecord(input.states)) {
    errors.push("states must be a non-empty object.");
  } else {
    const stateEntries = Object.entries(input.states);
    const knownStates = new Set(stateEntries.map(([stateName]) => stateName));

    if (stateEntries.length === 0) {
      errors.push("states must be a non-empty object.");
    }

    for (const [stateName, state] of stateEntries) {
      if (stateName.trim().length === 0) {
        errors.push("states must not contain an empty state name.");
        continue;
      }

      validateState(stateName, state, knownStates, errors);
    }

    if (
      defaultState !== undefined &&
      !Object.prototype.hasOwnProperty.call(input.states, defaultState)
    ) {
      errors.push("defaultState must point to an existing state.");
    }
  }

  if (hasOwn(input, "hitbox")) {
    validateHitbox(input.hitbox, errors);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, manifest: input as unknown as PetManifestV010 };
}

export function assertPetManifest(input: unknown): PetManifestV010 {
  const result = validatePetManifest(input);
  if (result.ok) {
    return result.manifest;
  }

  throw new Error(
    `Invalid AutoPet manifest:\n${result.errors
      .map((error) => `- ${error}`)
      .join("\n")}`
  );
}

export const EXAMPLE_PET_MANIFEST_V010 = {
  schemaVersion: PET_MANIFEST_SCHEMA_VERSION,
  name: "My Pet",
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
} satisfies PetManifestV010<PetRecommendedStateName>;

export function createDraftPetManifest(name = "My Pet"): PetManifestV010 {
  return {
    ...EXAMPLE_PET_MANIFEST_V010,
    name,
    states: {
      ...EXAMPLE_PET_MANIFEST_V010.states,
      idle: { ...EXAMPLE_PET_MANIFEST_V010.states.idle },
      bounce: { ...EXAMPLE_PET_MANIFEST_V010.states.bounce },
      click: { ...EXAMPLE_PET_MANIFEST_V010.states.click },
      sleep: { ...EXAMPLE_PET_MANIFEST_V010.states.sleep },
      drag: { ...EXAMPLE_PET_MANIFEST_V010.states.drag }
    },
    hitbox: { ...EXAMPLE_PET_MANIFEST_V010.hitbox }
  };
}
