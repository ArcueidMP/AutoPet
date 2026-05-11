# AutoPet Development Log

## Current Handoff State

Date: 2026-05-11

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
main
```

Current Git state:

```text
main is up to date with origin/main.
Working tree is clean.
```

Merged pull requests:

```text
PR #1: Scaffold v0.1 project structure
PR #2: Add v0.1 pet manifest schema and validator
```

Completed stages:

- Stage 1: Initial repository and v0.1 scaffold.
- Stage 2: v0.1 pet manifest schema and validator.

The Stage 2 feature branch has been cleaned up:

```text
feat/pet-format-schema
```

Status:

```text
Deleted locally.
Deleted on GitHub.
```

Latest verification on `main`:

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

Current source-of-truth files for future ChatGPT / Codex threads:

```text
README.md
AGENTS.md
docs/dev-log.md
docs/pet-schema.md
```

Current recommended next task:

```text
Stage 3 should focus on making packages/pet-engine consume validated manifests
from packages/pet-format.
```

Stage 3 should not implement image import, spritesheet generation, package
export, Maker UI changes, Runtime package loading UI, blinking, waving, Live2D,
image-to-video, cloud APIs, plugin systems, multi-pet support, system tray, or
complex CV.

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

## Important Project Boundaries

The v0.1 scope remains intentionally small.

Included in v0.1:

- Maker scaffold
- Runtime scaffold
- Transparent PNG as the reliable baseline input
- Local image-processing pipeline placeholder
- Simple transform-based animation direction
- Pet package / manifest direction
- Windows-first development
- Runtime-safe pet manifest validation
- Small documented `pet.json` schema

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

This was not fixed during Stage 1 or Stage 2.

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

## Recommended Stage 3 Task

Stage 3 should focus on `packages/pet-engine`, not on image generation yet.

Recommended task:

```text
Make packages/pet-engine consume validated pet manifests from packages/pet-format.
```

Stage 3 should use the Stage 2 manifest format and validator as the source of
truth.

Expected Stage 3 direction:

- Import the relevant types from `@autopet/pet-format`.
- Accept a validated `PetManifestV010`.
- Initialize the player from `manifest.defaultState`.
- Use state definitions from `manifest.states`.
- Use `row`, `frames`, `fps`, `loop`, and optional `next` to drive simple frame
  progression.
- Keep behavior deterministic and small.
- Avoid duplicating the manifest validator inside `pet-engine`.
- Add typecheck/build coverage.
- Add tests only if the repository already has a test setup.

Stage 3 should not implement:

- image import
- background removal
- spritesheet generation
- pet package export
- Maker UI changes
- Runtime package loading UI
- desktop window behavior changes
- blinking
- waving
- Live2D
- image-to-video
- cloud APIs
- plugin systems
- multi-pet support
- system tray
- complex CV

Suggested Stage 3 branch:

```powershell
cd D:\dev\AutoPet
git switch main
git pull --ff-only origin main
git switch -c feat/pet-engine-manifest-player
```

Suggested Stage 3 Codex prompt:

```text
Read README.md, AGENTS.md, docs/dev-log.md, and docs/pet-schema.md first.
Treat them as the source of truth.

Repository:
D:\dev\AutoPet

Current state:
- PR #1 scaffold has been merged into main.
- PR #2 pet manifest schema and validator has been merged into main.
- main contains the v0.1 scaffold plus the v0.1 pet manifest schema.
- corepack pnpm typecheck passes.
- corepack pnpm build passes.
- This is not a v0.1 release yet; it is still a scaffold / implementation stage.

Before changing files:
1. Run:
   git status
   git branch --show-current
2. Confirm you are on the Stage 3 feature branch.
3. Briefly explain your implementation plan.

Task:
Implement Stage 3 only: make packages/pet-engine consume validated pet manifests
from packages/pet-format.

Requirements:
- Keep the task small and limited to packages/pet-engine unless a tiny export
  adjustment is required.
- Use the v0.1 manifest types from @autopet/pet-format.
- Do not duplicate the manifest validator in pet-engine.
- Add or update a small deterministic animation/player API that can:
  - initialize from a PetManifestV010
  - start at manifest.defaultState
  - expose the current state name
  - expose the current frame index
  - expose the current row from the active manifest state
  - advance frames according to frames, fps, loop, and optional next
  - switch states by name
- Keep non-looping state behavior simple and documented.
- Add typecheck/build coverage.
- Add tests only if the repository already has a test setup.
- Do not introduce a new test framework just for this task.

Do not implement:
- image import
- spritesheet generation
- pet package export
- Maker UI changes
- Runtime package loading behavior
- Electron window changes
- blinking
- waving
- Live2D
- image-to-video
- cloud APIs
- plugin systems
- multi-pet support
- system tray
- complex CV

After changing files, run:
corepack pnpm typecheck
corepack pnpm build

Then summarize:
- files changed
- pet-engine behavior implemented
- commands run and results
- any remaining risks or follow-up tasks

Do not push to GitHub.
```

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
```

Each Codex thread should handle only one small task.

Do not expand scope without updating the README, docs, and roadmap.