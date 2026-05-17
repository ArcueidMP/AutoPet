# AutoPet Development Log

## Current Handoff State

Date: 2026-05-17

AutoPet is still in the v0.1 scaffold / implementation stage. This is not a
v0.1 release.

Local repository:

```text
D:\dev\AutoPet
```

GitHub repository:

```text
https://github.com/ArcueidMP/AutoPet
```

Current branch:

```text
docs/stage6-handoff-refresh
```

Current Git state:

```text
Stage 6.5 is a docs-only source-of-truth refresh after completed Stage 5 and
Stage 6 work. The working tree was clean before this docs task began.
```

Known merged pull requests documented in this log:

```text
PR #1: Scaffold v0.1 project structure
PR #2: Add v0.1 pet manifest schema and validator
PR #3: Add manifest-driven pet-engine player
```

Completed stages:

- Stage 1: Initial repository and v0.1 scaffold.
- Stage 2: v0.1 pet manifest schema and validator.
- Stage 3: Manifest-driven pet-engine animation/player foundation.
- Stage 4: Checked-in sample pet fixture for future Runtime loading and smoke
  testing.
- Stage 4.5: PR template and Codex Mode A / Implement Only workflow docs.
- Stage 5: Python transparent PNG image-pipeline package MVP.
- Stage 6.1: Runtime sample-pet playback.
- Stage 6.2 + 6.3: Runtime transparent draggable window and minimal context
  menu.

Latest known verification:

```powershell
.\.venv\Scripts\python.exe -m compileall packages\image-pipeline\autopet_image_pipeline
.\.venv\Scripts\python.exe -m unittest discover -s packages\image-pipeline
corepack pnpm typecheck
corepack pnpm build
```

Result:

```text
Passed during Stage 5 / Stage 6 work.
Runtime manual smoke passed for sample playback, drag, right-click menu, Reset
Position, Always on Top toggle, and Exit.
```

Current source-of-truth files for future ChatGPT / Codex threads:

```text
README.md
AGENTS.md
docs/dev-log.md
docs/pet-schema.md
docs/workflows/codex-pr-workflow.md
```

Current recommended next task:

```text
Stage 7 should implement Runtime Load Pet folder support.
```

Stage 7 should let the Runtime select a local folder containing `pet.json` and
`spritesheet.png`, validate the manifest, load the package assets, and replace
the checked-in sample pet with the selected local package.

Stage 7 should not implement Maker export integration, rembg, package zip
support, persistent settings, system tray, multi-pet support, or a plugin
system.

---

## Stage 1 Summary - Initial Repository and v0.1 Scaffold

Date: 2026-05-10

Stage 1 initialized AutoPet as a Git/GitHub project and created the v0.1
scaffold.

Historical Stage 1 branch:

```text
chore/v0.1-scaffold
```

Pull request:

```text
PR #1: Scaffold v0.1 project structure
https://github.com/ArcueidMP/AutoPet/pull/1
```

Status:

```text
Merged into main.
```

### Repository setup

The following base project files were created and committed:

```text
README.md
AGENTS.md
LICENSE
.gitignore
.gitattributes
```

The repository uses the MIT License.

The project is currently private on GitHub.

### Development environment

Development is Windows-first.

Last recorded local environment:

```text
OS: Windows
Shell: PowerShell
Project path: D:\dev\AutoPet
Node.js: v24.15.0
npm: 11.12.1
pnpm: 11.0.9
Python: 3.13.13
```

Codex is being used in Windows native mode with conservative permissions:

```text
Permissions: Default permissions
Terminal: PowerShell
Mode: Work locally
```

Full Access and broad Computer Use are intentionally not enabled.

### Workspace scaffold

The initial v0.1 monorepo scaffold was generated.

Root workspace files:

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
tsconfig.base.json
```

Workspace layout:

```text
apps/
  maker/
  runtime/

packages/
  pet-format/
  pet-engine/
  image-pipeline/
```

### Maker app

The Maker scaffold exists at:

```text
apps/maker
```

It is an Electron + React + TypeScript app.

Current behavior:

- Starts successfully in development mode.
- Shows a placeholder AutoPet Maker window.
- Displays the planned v0.1 pipeline:
  - import transparent PNG
  - trim empty bounds
  - normalize to 256 x 256
  - generate transform frames
  - export pet package
- Does not yet implement real image import or export.

Verified command during Stage 1:

```powershell
pnpm dev:maker
```

### Runtime app

The Runtime scaffold exists at:

```text
apps/runtime
```

It is an Electron + React + TypeScript app.

Current behavior:

- Starts successfully in development mode.
- Shows a simple placeholder desktop pet window.
- Uses a transparent / always-on-top runtime concept.
- Displays a placeholder AutoPet mascot.

Verified command during Stage 1:

```powershell
pnpm dev:runtime
```

### Shared TypeScript packages

The following shared packages were created:

```text
packages/pet-format
packages/pet-engine
```

`pet-format` contains the shared pet manifest format and validator.

`pet-engine` contains the initial basic animation/player scaffold.

A TypeScript monorepo issue occurred during setup:

```text
TS6059: File from packages/pet-format was outside packages/pet-engine rootDir
```

This was fixed by adjusting the TypeScript configuration for `pet-engine`.

Verified command during Stage 1:

```powershell
pnpm typecheck
```

Result:

```text
Passed
```

### Python image pipeline

The Python image pipeline placeholder exists at:

```text
packages/image-pipeline
```

Current dependency baseline:

```text
Pillow>=10.0,<12.0
```

Optional background removal dependencies are separated into:

```text
packages/image-pipeline/requirements-rembg.txt
```

Important decision:

- Pillow is the only required image-processing dependency for the v0.1 scaffold.
- `rembg` remains optional and must not become a required dependency unless explicitly requested.
- No cloud background-removal service is used.

Verified commands during Stage 1:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r packages\image-pipeline\requirements.txt
.\.venv\Scripts\python.exe -m compileall packages\image-pipeline\autopet_image_pipeline
```

Result:

```text
Passed
```

`.venv/` is ignored by Git and was not staged.

### Build and verification

The following commands passed during Stage 1:

```powershell
pnpm typecheck
pnpm build
pnpm dev:maker
pnpm dev:runtime
```

`pnpm approve-builds` was used to approve install/build scripts for:

```text
electron
esbuild
```

This added the following to `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  electron: true
  esbuild: true
```

This is intentional and acceptable for the current Electron/Vite scaffold.

---

## Stage 2 Summary - v0.1 Pet Manifest Schema and Validator

Date: 2026-05-11

Stage 2 implemented the v0.1 pet manifest schema and validator. This is still
part of the scaffold / implementation stage and is not a v0.1 release.

Stage 2 branch:

```text
feat/pet-format-schema
```

Pull request:

```text
PR #2: Add v0.1 pet manifest schema and validator
```

Status:

```text
Merged into main.
Feature branch deleted locally and on GitHub.
```

Changed files in PR #2:

```text
packages/pet-format/src/index.ts
docs/pet-schema.md
docs/dev-log.md
```

### Added in packages/pet-format

`packages/pet-format` added the v0.1 manifest types, constants, example data,
and runtime-safe validation helpers.

Added exports:

- `PetManifestV010`
- `PetAnimationStateV010`
- `PetHitboxV010`
- `PET_MANIFEST_SCHEMA_VERSION`
- `EXAMPLE_PET_MANIFEST_V010`
- `validatePetManifest`
- `assertPetManifest`

The validator checks:

- supported `schemaVersion`
- required non-empty strings
- safe relative asset paths
- positive frame dimensions
- non-empty `states`
- valid `defaultState` reference
- valid optional `next` state references
- animation state values:
  - `row`
  - `frames`
  - `fps`
  - `loop`
- optional hitbox bounds

The validator allows additional fields for now. It validates the v0.1 surface
without adding heavy schema dependencies.

No heavy validation dependency was added. In particular, Stage 2 did not add:

```text
zod
ajv
```

### Added docs/pet-schema.md

`docs/pet-schema.md` documents the implemented v0.1 `pet.json` schema.

It records:

- the planned package layout
- supported schema version `"0.1.0"`
- manifest fields
- animation state fields
- optional hitbox fields
- recommended v0.1 states:
  - `idle`
  - `bounce`
  - `click`
  - `sleep`
  - `drag`
- safe package-relative asset path rules
- validator exports from `@autopet/pet-format`

The validator does not require exactly the recommended five states. It allows
any non-empty state names as long as `defaultState` and `next` references point
to existing states.

### Stage 2 verification

Codex reported that direct `pnpm` was not available on PATH in its shell, so it
used `corepack pnpm`, which runs the same project scripts.

Verified commands:

```powershell
corepack pnpm typecheck
corepack pnpm build
```

Result:

```text
Passed
```

After PR #2 was merged, the user also verified the latest `main` with:

```powershell
git status
git log --oneline --decorate --max-count=5
corepack pnpm typecheck
corepack pnpm build
```

Result:

```text
Passed
```

Codex did not push to GitHub directly. The user committed and pushed
`feat/pet-format-schema`, opened PR #2, merged it into `main`, and deleted the
feature branch locally and on GitHub.

---

## Stage 3 Summary - Manifest-Driven Pet-Engine Player

Date: 2026-05-14

Stage 3 implemented a manifest-driven animation/player foundation in
`packages/pet-engine`. This is still part of the scaffold / implementation
stage and is not a v0.1 release.

Stage 3 branch:

```text
feat/pet-engine-manifest-player
```

Status:

```text
Merged into main.
```

Changed files in Stage 3:

```text
packages/pet-engine/src/index.ts
```

### Added in packages/pet-engine

`packages/pet-engine` now consumes already-validated `PetManifestV010` data from
`@autopet/pet-format` instead of duplicating manifest validation.

The player starts from `manifest.defaultState` with frame index `0` and exposes
a small deterministic API for animation state progression.

The snapshot data includes:

- current state name
- zero-based frame index
- active manifest state row
- state frame count, fps, loop flag, and optional next state
- manifest frame width and frame height
- computed sprite frame rectangle:
  - `x = frameIndex * frameWidth`
  - `y = row * frameHeight`
  - `width = frameWidth`
  - `height = frameHeight`

Animation advancement is driven by elapsed milliseconds using the active state's
`frames`, `fps`, `loop`, and optional `next` values.

Stage 3 did not render anything, load files from disk, or implement Runtime
package loading UI.

### Stage 3 verification

Verified commands:

```powershell
corepack pnpm typecheck
corepack pnpm build
```

Result:

```text
Passed
```

---

## Stage 4 Summary - Sample Pet Fixture

Date: 2026-05-14

Stage 4 added a small checked-in sample pet fixture for future Runtime loading
and smoke testing. This is still part of the scaffold / implementation stage
and is not a v0.1 release.

Stage 4 branch:

```text
feat/sample-pet-fixture
```

Status:

```text
Completed locally.
Not pushed to GitHub in this thread.
```

Changed files in Stage 4:

```text
examples/sample-pet/pet.json
examples/sample-pet/spritesheet.png
examples/sample-pet/README.md
packages/pet-format/test/sample-pet-fixture.test.mjs
packages/pet-format/package.json
```

### Added fixture

`examples/sample-pet` now contains a deterministic sample fixture using the
v0.1 pet manifest schema. The fixture includes:

- `pet.json` with schema version `"0.1.0"`, `spritesheet.png`, `256 x 256`
  frames, default state `idle`, the recommended v0.1 states, and a simple
  `192 x 192` hitbox.
- `spritesheet.png`, a transparent `2048 x 1280` sprite sheet arranged as
  `8` columns by `5` rows of `256 x 256` frames.
- `README.md` documenting that the fixture is deterministic placeholder data
  for Runtime loading and smoke tests, not an output of the image pipeline yet.

The fixture does not include `preview.gif`.

### Added validation coverage

`packages/pet-format/test/sample-pet-fixture.test.mjs` validates
`examples/sample-pet/pet.json` with the existing `@autopet/pet-format`
validator.

The `packages/pet-format` test script now uses Node built-in tests:

```json
"test": "pnpm build && node --test test/*.test.mjs"
```

No new npm dependencies or test framework were added.

### Stage 4 verification

Verified commands:

```powershell
corepack pnpm --filter @autopet/pet-format test
corepack pnpm typecheck
corepack pnpm build
```

PNG dimension check:

```text
2048 x 1280
```

Result:

```text
Passed
```

---

## Stage 5 Summary - Python Transparent PNG Package MVP

Stage 5 implemented the Pillow-only transparent PNG package MVP in:

```text
packages/image-pipeline
```

The pipeline accepts transparent PNG input as the reliable baseline. It
preserves alpha, trims alpha bounds, normalizes the subject into a fixed
`256 x 256` canvas, resizes the subject to a maximum `220 px`, generates
deterministic transform-only frames for the v0.1 states, and writes a local pet
package folder.

Generated package outputs:

```text
pet.json
spritesheet.png
preview.gif
```

The generated spritesheet is arranged as eight `256 x 256` columns by five
state rows:

- `idle`
- `bounce`
- `click`
- `sleep`
- `drag`

Stage 5 uses Python 3.13 locally and Pillow as the required image dependency.
It does not include `rembg`, background removal, Maker UI integration, Runtime
loading UI, or generated sample outputs.

Stage 5 verification:

```powershell
.\.venv\Scripts\python.exe -m compileall packages\image-pipeline\autopet_image_pipeline
.\.venv\Scripts\python.exe -m unittest discover -s packages\image-pipeline
corepack pnpm typecheck
corepack pnpm build
```

Result:

```text
Passed
```

---

## Stage 6.1 Summary - Runtime Sample Pet Playback

Stage 6.1 wired the Runtime to the checked-in sample pet fixture:

```text
examples/sample-pet/pet.json
examples/sample-pet/spritesheet.png
```

The Runtime validates the sample manifest with `@autopet/pet-format`, advances
animation frames with `@autopet/pet-engine`, and renders the active frame from
the sample spritesheet.

Stage 6.1 did not add user package selection or Maker export integration. The
Runtime still uses the checked-in sample pet until Stage 7 adds Load Pet folder
support.

---

## Stage 6.2 + 6.3 Summary - Runtime Window Shell, Drag, and Context Menu

Stage 6.2 + 6.3 completed the minimal Runtime window shell for current smoke
testing. The Runtime window is transparent, frameless, fixed at `256 x 256`,
and always-on-top by default.

Runtime interaction now includes:

- drag-to-move
- right-click context menu
- Reset Position
- Always on Top toggle
- Exit

Important implementation note: electron-vite outputs the preload bundle as
`out/preload/index.mjs`, so the Runtime `BrowserWindow` loads
`../preload/index.mjs`. The preload bridge runs with `contextIsolation: true`,
`nodeIntegration: false`, and `sandbox: false`.

Stage 6 verification:

```powershell
corepack pnpm typecheck
corepack pnpm build
```

Manual Runtime smoke passed for sample playback, drag, right-click menu, Reset
Position, Always on Top toggle, and Exit.

---

## Important Project Boundaries

The v0.1 scope remains intentionally small.

Included in v0.1:

- Maker scaffold
- Runtime sample-pet playback in a transparent draggable window
- Transparent PNG as the reliable baseline input
- Pillow-only transparent PNG image-pipeline package MVP
- Simple transform-based animation direction
- Pet package / manifest direction
- Windows-first development
- Runtime-safe pet manifest validation
- Small documented `pet.json` schema
- Manifest-driven pet-engine animation/player foundation
- Checked-in sample pet fixture for future Runtime loading and smoke testing
- Minimal Runtime context menu with Reset Position, Always on Top toggle, and
  Exit

Not included in v0.1:

- blinking
- waving
- walking animation
- talking animation
- eye detection
- hand detection
- pose estimation
- skeleton rigging
- Live2D-style animation
- image-to-video generation
- cloud APIs
- paid background-removal services
- complex CV
- multi-pet support
- plugin system
- system tray, unless explicitly requested later
- auto-start on boot
- screen-edge physics

The most important v0.1 rule remains:

```text
Build the simplest reliable image-to-pet pipeline before attempting intelligent
animation.
```

---

## Known Warnings / Non-blocking Issues

Git produced repeated line-ending warnings such as:

```text
LF will be replaced by CRLF the next time Git touches it
```

This was not fixed during Stage 1 through Stage 6.5.

This is not currently blocking because:

- The scaffold builds successfully.
- Typecheck passes.
- The project already has `.gitattributes`.
- The warning can be handled later with a housekeeping commit if needed.

Possible future cleanup:

```text
Add LF rules for *.html, *.css, *.txt
Run git add --renormalize .
Commit line-ending normalization separately
```

This cleanup should be kept separate from feature work.

---

## Recommended Stage 7 Task

Stage 7 should focus on Runtime Load Pet folder support.

Recommended task:

```text
Implement Runtime Load Pet folder support for local pet packages.
```

Expected Stage 7 direction:

- Let the Runtime select a folder containing `pet.json` and `spritesheet.png`.
- Validate `pet.json` with `@autopet/pet-format`.
- Load package assets from the selected local folder.
- Replace the checked-in sample pet with the selected local package.
- Keep the current transparent draggable window and minimal context menu.
- Do not add Maker export integration, rembg, package zip support, persistent
  settings, system tray, multi-pet support, or a plugin system in Stage 7.

---

## Context Management Note

For future ChatGPT or Codex threads, use this file as the project handoff
summary.

Each future Codex thread should read:

```text
README.md
AGENTS.md
docs/dev-log.md
docs/pet-schema.md
docs/workflows/codex-pr-workflow.md
```

Each Codex thread should handle only one small task.

Do not expand scope without updating the README, docs, and roadmap.
