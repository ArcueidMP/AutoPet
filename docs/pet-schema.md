# AutoPet Pet Manifest Schema

AutoPet v0.1 pet packages are planned around a small `pet.json` manifest.
The only supported schema version is `"0.1.0"`.

## Package Layout

```text
my-pet/
  pet.json
  spritesheet.png
  preview.gif
```

`preview.gif` is optional. The runtime baseline is the sprite sheet plus the
manifest.

## Manifest Fields

```ts
interface PetManifestV010 {
  schemaVersion: "0.1.0";
  name: string;
  version: string;
  sprite: string;
  preview?: string;
  frameWidth: number;
  frameHeight: number;
  defaultState: string;
  states: Record<string, PetAnimationStateV010>;
  hitbox?: PetHitboxV010;
}

interface PetAnimationStateV010 {
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
  next?: string;
}

interface PetHitboxV010 {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

The recommended v0.1 states are `idle`, `bounce`, `click`, `sleep`, and `drag`.
The validator allows any non-empty state names as long as `defaultState` and
`next` references point to existing states.

Asset paths such as `sprite` and `preview` must be portable package-relative
paths using forward slashes, for example `spritesheet.png` or
`assets/spritesheet.png`. Absolute paths, URLs, backslash paths, `.` segments,
and `..` traversal are rejected.

## Validation

The TypeScript package `@autopet/pet-format` exports:

- `PetManifestV010`, `PetAnimationStateV010`, and `PetHitboxV010`
- `PET_MANIFEST_SCHEMA_VERSION`
- `EXAMPLE_PET_MANIFEST_V010`
- `validatePetManifest(input)`
- `assertPetManifest(input)`

The runtime validator checks required fields, supported schema version, portable
asset paths, positive frame sizes, a non-empty `states` object, valid state
references, animation state numbers, boolean `loop`, and optional hitbox bounds.
