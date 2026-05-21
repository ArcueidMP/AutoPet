# v0.1 Release Readiness Notes

## Status

- AutoPet is not a v0.1 release yet.
- These notes summarize readiness for a human v0.1 release decision.
- This document does not create a tag, release, installer, binary, or artifact.

## Current v0.1 Implemented Baseline

- Maker transparent PNG selection.
- Maker output folder selection.
- Maker local Python image pipeline invocation.
- Generated pet package folder containing `pet.json`, `spritesheet.png`, and
  `preview.gif`.
- Runtime `Load Pet...` local folder support.
- Runtime manifest validation and sprite display.
- Runtime transparent draggable always-on-top window.
- Runtime right-click menu with `Load Pet...`, `Reset Position`,
  `Always on Top`, and `Exit`.

## Evidence

Stage 9.2 manual E2E smoke passed on 2026-05-21.

Environment:

- Branch: `test/stage9-e2e-smoke-run`
- Commit: `6bf3eeb`
- Node: `v24.15.0`
- pnpm: `10.33.4`
- Python: `3.13.13`

Local baseline commands passed:

```powershell
git diff --check
corepack pnpm typecheck
corepack pnpm build
corepack pnpm --filter @autopet/image-pipeline typecheck
corepack pnpm --filter @autopet/image-pipeline test
.\.venv\Scripts\python.exe -m compileall packages\image-pipeline\autopet_image_pipeline
.\.venv\Scripts\python.exe -m unittest discover -s packages\image-pipeline
```

The pnpm image-pipeline test and Python unittest suite each reported 4 tests
OK.

The manual Maker export -> generated package -> Runtime `Load Pet...` path
passed. Maker exported a transparent PNG package outside the repository under
`%TEMP%\autopet-v0.1-e2e-smoke`; the generated package contained `pet.json`,
`spritesheet.png`, and `preview.gif`; and `pet.json` referenced
`spritesheet.png`.

Runtime launch, right-click menu, `Load Pet...`, generated pet display, visible
animation advancement, drag, `Reset Position`, `Always on Top` toggle, and
`Exit` passed by human manual confirmation.

No bugfix PR was needed from the smoke run.

Stage 9.3 minimal CI:

- PR #18: `ci: add stage 9 validation workflow`
- Merge commit: `7e4bd77`
- Scope: Windows non-GUI baseline validation.
- `pull_request` CI run: green.
- `main` push CI run for `7e4bd77`: green.

Stage 9.4 release-readiness notes:

- PR #19: `docs: add v0.1 release readiness notes`
- Feature commit: `a0c3dd0`
- Merge commit: `e765531`
- `pull_request` CI run: green.
- `main` push CI run for `e765531`: green, confirmed by the human via GitHub
  Actions screenshot.

## CI Scope

- CI validates non-GUI baseline checks on Windows.
- CI runs TypeScript typecheck/build checks.
- CI runs Python image-pipeline compile/test checks.
- CI does not launch Maker or Runtime.
- CI does not perform manual GUI smoke.
- CI does not build installers or release artifacts.

## Known Limitations / Explicit Non-Goals

- No installer.
- No GitHub Release binary.
- No release publishing.
- No auto-updater.
- No zip export.
- No persistent settings.
- No Runtime launch-from-Maker.
- No `rembg`.
- No cloud APIs.
- No system tray.
- No multi-pet support.
- No plugin system.
- No blinking.
- No waving.
- No walking.
- No talking.
- No skeleton rigging.
- No Live2D.
- No image-to-video.
- No complex CV.

## Release Decision Checklist

- [x] Source-of-truth docs updated through Stage 9.4.
- [x] Manual Stage 9.2 E2E smoke passed.
- [x] Minimal Stage 9.3 CI workflow exists.
- [x] CI run status recorded accurately.
- [x] Known limitations documented.
- [ ] Human still needs to decide whether to tag v0.1.
- [ ] Human still needs to decide whether any release artifact is required.
- [x] No release action has been performed by this PR.

## Recommended Next Decision

If the human accepts the current v0.1 baseline, the next step is a human release
decision.

If the human wants more assurance first, rerun the manual E2E smoke checklist
from `docs/workflows/v0.1-e2e-smoke-checklist.md`.

Do not add new features before the release decision.
