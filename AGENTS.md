# AutoPet - Codex Working Instructions

## Project scope

AutoPet v0.1 is a Windows-first, cross-platform-aware desktop project.

The first version includes:
- Maker: turn one image into a simple desktop pet package.
- Runtime: display the pet as a transparent always-on-top desktop window.
- Basic transform-based animations only: idle, bounce, click, sleep, drag.
- Transparent PNG support as the reliable baseline.
- Optional local background removal via rembg.

Do not implement in v0.1:
- blinking
- waving
- skeleton rigging
- Live2D-style animation
- image-to-video generation
- cloud background-removal services
- plugin systems
- multi-pet support
- system tray unless explicitly requested later

## Technical stack

Use:
- Electron + TypeScript
- React for UI
- pnpm for JavaScript package management
- Python 3.12 or 3.13 for the image pipeline
- Pillow for basic image processing
- rembg[cpu] only as an optional local background-removal dependency

Avoid:
- hard-coded Windows-only paths
- global Python package installs
- GPU/CUDA assumptions
- WSL-specific setup for v0.1
- paid APIs
- cloud image processing

## Development environment

Assume Windows native development using PowerShell.

Expected project location:
D:\dev\AutoPet

Use a local Python virtual environment:
.venv/

Use project-local dependencies whenever possible.

## Default Codex Workflow

Default mode is Mode A / Implement Only.
Codex should not stage files, commit, push, create pull requests, merge pull
requests, delete branches, force push, or use `git add .` unless explicitly
instructed later.
After implementation, Codex should summarize changed files, commands run,
results, risks, follow-up tasks, and suggested PR title/body text.
The human user performs final review and Git/GitHub operations.

## Coding rules

Prefer small, reviewable changes.
Keep the repository structure simple.
Create clear npm/pnpm scripts.
Use cross-platform Node path APIs instead of string-concatenating paths.
Keep generated files out of source control unless they are examples.

## Verification

After code changes, run the most relevant available checks.
At minimum, keep the app able to start in development mode.
Before large changes, explain the plan briefly.
After implementation, summarize changed files and remaining risks.
