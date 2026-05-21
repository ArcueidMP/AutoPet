# AutoPet

AutoPet is an open-source, Windows-first desktop application that turns a
user-provided image into a lightweight animated desktop pet.

The v0.1 goal is deliberately simple:

```text
image in -> simple animated pet package out -> run it as a desktop pet
```

AutoPet v0.1 does not attempt to infer eyes, hands, skeletons, facial
expressions, or natural character motion. It focuses on a reliable local flow
for creating a simple 2D desktop pet from one image.

---

## Current Status

AutoPet is in the v0.1 implementation stage. It is not a v0.1 release yet.

The repository now includes a basic MVP for the transparent-PNG flow:

- shared pet manifest schema and validator
- manifest-driven pet animation player
- checked-in sample pet fixture
- Pillow-only transparent PNG image-pipeline package
- Maker UI for selecting a transparent PNG and output folder
- Maker main-process helper that invokes the local Python image pipeline
- Maker export of `pet.json`, `spritesheet.png`, and `preview.gif`
- Runtime `Load Pet...` folder support for local pet packages
- Runtime `pet.json` validation and loaded-package sprite display
- transparent, draggable, always-on-top Runtime window with a minimal context
  menu

AutoPet is still not a v0.1 release. Stage 9.2 manual E2E smoke has passed,
Stage 9.3 minimal non-GUI Windows CI exists, and Stage 9.4 release-decision
readiness notes summarize evidence for a human release decision. No tag,
release, installer, binary, or artifact has been created.

The first implementation target is Windows 10/11, developed with the Windows
Codex App workflow in mind. The architecture should avoid unnecessary
Windows-only assumptions so that macOS and Debian/Ubuntu Linux support can be
added later.

---

## What AutoPet Does in v0.1

AutoPet v0.1 contains two desktop apps:

1. Maker - converts a transparent PNG into a desktop pet package.
2. Runtime - loads a local pet package and displays it as a simple desktop pet.

### Maker

The current Maker MVP supports the transparent-PNG path:

1. Choose one local transparent PNG.
2. Choose a local output folder.
3. Enter or edit a pet name.
4. Invoke the local Python image pipeline as a subprocess.
5. Export a local pet package folder containing:
   - `pet.json`
   - `spritesheet.png`
   - `preview.gif`

The Maker does not currently include drag-and-drop import, image preview,
persistent settings, zip export, Runtime launching, rembg integration, or cloud
background removal.

### Runtime

The current Runtime supports:

1. Loading a local pet package folder through `Load Pet...`.
2. Validating `pet.json` with `@autopet/pet-format`.
3. Resolving package-relative sprite and optional preview paths safely.
4. Displaying the loaded sprite package.
5. Playing the manifest-driven animation states.
6. Dragging the transparent pet window.
7. Opening a minimal right-click menu.
8. Exiting cleanly.

---

## v0.1 Feature Scope

### Included

- Transparent PNG import in Maker.
- Local Python image pipeline invocation from Maker.
- Automatic transparent-bound trim, resize, padding, and canvas normalization.
- Simple transform-based generated animation states.
- Sprite sheet generation.
- `pet.json` generation and validation.
- `preview.gif` generation.
- Local pet package folder export.
- Runtime loading for local pet package folders.
- Transparent frameless Runtime window.
- Always-on-top Runtime display.
- Runtime drag-to-move interaction.
- Minimal Runtime right-click menu.
- Local-first processing.

### Optional / Future

- Local background removal with `rembg` may be added later as an optional,
  experimental feature.
- Package zip export may be considered later.

### Not Included in v0.1

- Blinking.
- Waving.
- Walking animation.
- Talking animation.
- Eye detection.
- Hand detection.
- Pose estimation.
- Skeleton binding.
- Live2D-style rigging.
- Image-to-video generation.
- Cloud image generation.
- Paid or remote background-removal services.
- Multi-pet mode.
- Plugin system.
- CLI control.
- System tray integration.
- Auto-start on boot.
- Screen-edge physics.

These may be considered in later versions, but they are explicitly out of scope
for the current v0.1 work.

---

## Background Removal Policy

AutoPet should support two background modes over time.

### Transparent PNG Mode

This is the reliable v0.1 path and the currently implemented required flow.

If the input image already has a useful transparent background, AutoPet
preserves the alpha channel, trims transparent bounds, normalizes the subject,
generates transform-only frames, and writes a pet package.

### Local Background Removal Mode

AutoPet may optionally use a local background removal pipeline based on
open-source tooling such as `rembg`.

This mode is not part of the current required flow. It should remain optional
and experimental when introduced.

Important rules:

- AutoPet should not require a paid background removal service.
- AutoPet should not upload images to a remote server by default.
- If local background removal is unavailable, the app should fall back to
  asking the user for a transparent PNG.
- Any future paid or remote background removal integration must be opt-in,
  clearly labeled, and disabled by default.

---

## Animation Model

AutoPet v0.1 uses programmatic 2D transform animation, not semantic character
animation.

The input image is treated as one foreground subject. Animation frames are
generated by applying simple transforms such as:

- vertical translation
- scale
- squash/stretch
- rotation
- opacity changes

### v0.1 Animation States

| State | Description | Loop |
|---|---|---|
| `idle` | Gentle breathing animation | Yes |
| `bounce` | Subtle vertical bounce | Yes |
| `click` | Short squash-and-pop reaction | No, returns to `idle` |
| `sleep` | Slower breathing with reduced opacity | Yes |
| `drag` | Static or slight tilt while being dragged | Yes |

The animation system should be deterministic enough to generate the same output
for the same input and settings.

---

## Pet Package Format

The detailed schema lives in:

```text
docs/pet-schema.md
```

### Package Layout

A generated pet package folder looks like this:

```text
my-pet/
  pet.json
  spritesheet.png
  preview.gif
```

The Runtime baseline is `pet.json` plus `spritesheet.png`. Maker-generated
packages also include `preview.gif`.

### Draft `pet.json`

```json
{
  "schemaVersion": "0.1.0",
  "name": "My Pet",
  "version": "0.1.0",
  "sprite": "spritesheet.png",
  "preview": "preview.gif",
  "frameWidth": 256,
  "frameHeight": 256,
  "defaultState": "idle",
  "states": {
    "idle": {
      "row": 0,
      "frames": 8,
      "fps": 8,
      "loop": true
    },
    "bounce": {
      "row": 1,
      "frames": 8,
      "fps": 8,
      "loop": true
    },
    "click": {
      "row": 2,
      "frames": 6,
      "fps": 12,
      "loop": false,
      "next": "idle"
    },
    "sleep": {
      "row": 3,
      "frames": 8,
      "fps": 6,
      "loop": true
    },
    "drag": {
      "row": 4,
      "frames": 1,
      "fps": 1,
      "loop": true
    }
  },
  "hitbox": {
    "x": 32,
    "y": 32,
    "width": 192,
    "height": 192
  }
}
```

The schema should remain small in v0.1. Do not introduce plugin fields,
behavior scripts, physics configuration, skeleton data, or complex rigging data.

---

## Image Processing Pipeline

The v0.1 image pipeline is a local Python package called by Maker as a
subprocess.

Current pipeline:

```text
transparent PNG
-> preserve alpha
-> trim transparent bounds
-> resize subject to target size
-> place subject on fixed canvas
-> generate transform-only animation frames
-> assemble sprite sheet
-> generate preview.gif
-> write pet.json
-> export pet package folder
```

### Defaults

| Setting | Default |
|---|---:|
| Canvas size | `256 x 256` |
| Subject max size | `220 px` |
| Frame format | PNG frames assembled into one sprite sheet |
| Sprite sheet layout | One animation state per row |
| Default FPS | `8` |
| Export package | Folder |

---

## Technical Stack

### Desktop Apps

- Electron
- TypeScript
- React
- pnpm workspace

### Image Pipeline

- Python 3.12 or 3.13
- Pillow as the required image dependency
- Optional future `rembg[cpu]` support for local background removal

### Why This Stack

Electron gives AutoPet a practical path for transparent frameless desktop
windows, always-on-top behavior, drag interaction, and cross-platform desktop
packaging.

Python keeps the image processing pipeline simple and gives access to mature
image tooling. The Python side should remain local and replaceable.

---

## Repository Structure

```text
AutoPet/
  apps/
    maker/                  # Electron + React Maker app
      src/
        main/               # Maker main process and image-pipeline runner
        preload/            # Safe Maker preload bridge
        renderer/           # Maker React UI
        shared/             # Maker IPC types/channels
    runtime/                # Electron + React Runtime app
      src/
        main/               # Runtime window, loading, asset protocol
        preload/            # Safe Runtime preload bridge
        renderer/           # Runtime React UI
        shared/             # Runtime IPC types/channels
  packages/
    pet-format/             # v0.1 pet manifest types and validator
    pet-engine/             # Manifest-driven animation player
    image-pipeline/         # Local Python transparent PNG pipeline
  examples/
    sample-pet/             # Checked-in sample pet fixture
  docs/
    workflows/
    dev-log.md
    pet-schema.md
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

---

## Platform Support Plan

| Platform | v0.1 Status | Notes |
|---|---|---|
| Windows 10/11 | Target platform | Primary development and testing target |
| macOS | Planned | Should be considered when designing APIs and paths |
| Debian/Ubuntu Linux | Planned | X11 should be investigated before Wayland-heavy assumptions |
| Linux Wayland | Future investigation | Transparent, always-on-top, and global window behavior may need special handling |

AutoPet should avoid hard-coded Windows paths and Windows-only assumptions
wherever practical.

Use platform-safe APIs for:

- file paths
- config directories
- app data directories
- temporary directories
- process spawning
- window behavior abstractions

---

## Local Processing and Privacy

AutoPet should be local-first.

Default privacy principles:

- User images are processed locally.
- User images are not uploaded to remote servers by default.
- The image pipeline runs locally as a Python subprocess.
- Any future cloud feature must be opt-in.
- The UI must clearly indicate when a remote service is being used.

---

## Development Setup

### Prerequisites

- Windows 10/11
- Git
- Node.js LTS
- Corepack / pnpm
- Python 3.12 or 3.13

For any future optional `rembg` pipeline, use a Python version supported by the
installed `rembg` and `onnxruntime` versions.

### Install JavaScript Dependencies

```powershell
corepack pnpm install
```

### Set Up Python Image Pipeline

From the repository root:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r packages\image-pipeline\requirements.txt
```

The required dependency file installs Pillow only.

### Run in Development

```powershell
corepack pnpm dev:maker
corepack pnpm dev:runtime
```

Expected development behavior:

- Maker opens the export form for transparent PNG package generation.
- Runtime opens the transparent desktop pet window.
- Runtime can load a local package folder with `Load Pet...`.

### Verify

```powershell
corepack pnpm typecheck
corepack pnpm build
corepack pnpm --filter @autopet/image-pipeline typecheck
corepack pnpm --filter @autopet/image-pipeline test
.\.venv\Scripts\python.exe -m compileall packages\image-pipeline\autopet_image_pipeline
.\.venv\Scripts\python.exe -m unittest discover -s packages\image-pipeline
```

### CI

The repository includes a minimal GitHub Actions workflow that validates the
non-GUI baseline checks on Windows. It runs the TypeScript typecheck/build
checks and the Python image-pipeline compile/test checks.

CI does not replace the manual Stage 9 E2E smoke checklist. It does not launch
the Electron GUI apps or build release installers.

AutoPet is still not a v0.1 release yet. Release-decision readiness notes live
in `docs/release-readiness.md`. That document is not release instructions and
does not imply installers or GitHub Release binaries exist.

---

## Runtime Window Requirements

The pet runtime window should be:

- transparent
- frameless
- always on top
- draggable
- small by default
- excluded from complex app UI
- controlled by the Electron main process

Platform-specific window behavior should remain isolated where practical. Do not
scatter platform checks across the codebase.

---

## Runtime Context Menu

The current Runtime right-click menu exposes:

```text
Load Pet...
Reset Position
Always on Top
Exit
```

System tray support is not required in v0.1.

---

## Testing Strategy

v0.1 should include tests for the core pipeline and manifest contracts rather
than trying to test every desktop behavior.

Current useful checks:

- Validate `pet.json` against the v0.1 schema.
- Verify generated sprite sheets have expected dimensions.
- Verify transparent PNG input preserves alpha.
- Verify opaque or fully transparent input is rejected with helpful errors.
- Verify sample pet package loads in the Runtime.

Manual smoke tests should cover:

- launching Maker on Windows
- generating a pet from a transparent PNG
- loading the generated package in Runtime
- dragging the pet
- opening the right-click menu
- using `Load Pet...`
- resetting position
- toggling always-on-top
- exiting cleanly

Detailed Stage 9 manual E2E smoke checklist:
`docs/workflows/v0.1-e2e-smoke-checklist.md`

---

## Roadmap

### v0.1 - Minimal Image-to-Pet Pipeline

- Maker transparent PNG export flow.
- Local image pipeline.
- Transparent PNG support.
- Simple transform-based animation generation.
- Pet package folder export.
- Runtime local package loading.
- Runtime transparent window.
- Runtime drag interaction.
- Runtime right-click menu.
- MIT license.
- Stage 9 end-to-end smoke, docs, CI consideration, and release readiness.

### v0.2 - Usability Improvements

Possible future features:

- Optional local background removal.
- Better package import/export.
- User-configurable animation speed.
- Better preview editor.
- Click-through mode.
- Persistent settings.
- Startup position persistence.

### v0.3 - Developer Integrations

Possible future features:

- CLI state control.
- Local API for changing pet states.
- VS Code or terminal integration.
- Simple external status hooks.

### Future Research

Possible later research topics:

- Semi-automatic blinking.
- Semi-automatic waving.
- Simple 2D puppet rigging.
- User-assisted anchor point editing.
- Better segmentation models.
- macOS runtime polishing.
- Debian/Ubuntu packaging.

---

## AI Coding Agent Notes

When using Codex or another AI coding agent to work on AutoPet, follow these
constraints:

1. Keep v0.1 minimal.
2. Do not add blinking, waving, walking, pose detection, or skeleton rigging in
   v0.1.
3. Do not add cloud dependencies by default.
4. Do not require paid background removal services.
5. Prefer transparent PNG support as the reliable baseline.
6. Treat local background removal as optional.
7. Keep the pet package schema small.
8. Place schema details in `docs/pet-schema.md`.
9. Avoid hard-coded Windows paths.
10. Use cross-platform path and app-data APIs.
11. Keep Maker and Runtime logically separate.
12. Keep the image pipeline deterministic where practical.
13. Add tests for generated package validity.
14. Do not expand scope without updating this README and the roadmap.

The most important v0.1 rule:

```text
Build the simplest reliable image-to-pet pipeline before attempting intelligent animation.
```

---

## License

AutoPet is planned to be released under the MIT License.

See `LICENSE` for details.
