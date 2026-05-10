# AutoPet Development Log

## Stage 1 Summary - Initial Repository and v0.1 Scaffold

Date: 2026-05-10

## Current repository state

AutoPet has been initialized as a Git/GitHub project.

Local repository:

```text
D:\dev\AutoPet
```

GitHub repository:

```text
https://github.com/ArcueidMP/AutoPet
```

Current development branch:

```text
chore/v0.1-scaffold
```

Pull request:

```text
PR #1: Scaffold v0.1 project structure
https://github.com/ArcueidMP/AutoPet/pull/1
```

The initial branch has been pushed successfully and tracks:

```text
origin/chore/v0.1-scaffold
```

## Completed in Stage 1

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

Development is Windows-first and currently uses:

```text
OS: Windows
Shell: PowerShell
Project path: D:\dev\AutoPet
Node.js: v24.15.0
npm: 11.12.1
pnpm: 11.0.9
Python: 3.13.13
```

Codex is being used in Windows native mode with:

```text
Permissions: Default permissions
Terminal: PowerShell
Branch: chore/v0.1-scaffold
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

Verified command:

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

Verified command:

```powershell
pnpm dev:runtime
```

### Shared TypeScript packages

The following shared packages were created:

```text
packages/pet-format
packages/pet-engine
```

`pet-format` contains initial pet manifest/type definitions.

`pet-engine` contains an initial basic animation/player scaffold.

A TypeScript monorepo issue occurred during setup:

```text
TS6059: File from packages/pet-format was outside packages/pet-engine rootDir
```

This was fixed by adjusting the TypeScript configuration for `pet-engine`.

Verified command:

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

Verified commands:

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

The following commands passed:

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

## Important project boundaries

The v0.1 scope remains intentionally small.

Included in v0.1:

- Maker scaffold
- Runtime scaffold
- Transparent PNG as the reliable baseline input
- Local image-processing pipeline placeholder
- Simple transform-based animation direction
- Pet package / manifest direction
- Windows-first development

Not included in v0.1:

- blinking
- waving
- skeleton rigging
- Live2D-style animation
- image-to-video generation
- cloud APIs
- paid background-removal services
- complex CV
- multi-pet support
- plugin system
- system tray, unless requested later

## Known warnings / non-blocking issues

Git produced repeated line-ending warnings such as:

```text
LF will be replaced by CRLF the next time Git touches it
```

This was not fixed during Stage 1.

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

## Current Git status after Stage 1

Branch pushed:

```text
chore/v0.1-scaffold
```

Pull request created:

```text
PR #1
```

Recommended next action:

1. Review PR #1 on GitHub.
2. Merge it into `main` if the diff looks correct.
3. Pull latest `main` locally.
4. Start the next feature branch.

Suggested commands after merging PR #1:

```powershell
cd D:\dev\AutoPet
git checkout main
git pull
git checkout -b feat/pet-format-schema
```

## Recommended Stage 2 task

Stage 2 should focus on the pet package format, not on image generation yet.

Recommended next Codex task:

```text
Implement the v0.1 pet manifest schema and validation only.
```

Stage 2 should include:

- Define `pet.json` / manifest TypeScript types.
- Add a simple runtime-safe validator.
- Add example valid manifest data.
- Add tests or typecheck coverage if appropriate.
- Keep the schema small and stable.
- Do not implement complex animation generation yet.

Suggested Stage 2 Codex prompt:

```text
Read README.md, AGENTS.md, and docs/dev-log.md first.

Check the current git branch and working tree status.

Continue AutoPet v0.1 with this task only:
implement the initial pet manifest schema and validation in packages/pet-format.

Requirements:
- Define a small v0.1 pet manifest format.
- Include fields for name, version, sprite path, frame width, frame height, default state, states, fps, loop, and optional next state.
- Add TypeScript types.
- Add a lightweight runtime validator without adding heavy dependencies.
- Add one example valid manifest.
- Keep the schema compatible with a future pet.json file.
- Do not implement image import, spritesheet generation, blinking, waving, Live2D, image-to-video, cloud APIs, plugin systems, or multi-pet support.

Before changing files, briefly explain your plan.
After changing files, run pnpm typecheck and summarize:
- files changed
- validation behavior
- commands run
- remaining risks

Do not push to GitHub.
```

## Context management note

For future ChatGPT or Codex threads, use this file as the project handoff summary.

Each future Codex thread should read:

```text
README.md
AGENTS.md
docs/dev-log.md
```

Each Codex thread should handle only one small task.
