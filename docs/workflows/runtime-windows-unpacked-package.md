# Runtime Windows Unpacked Package Smoke

## Purpose

This workflow is the local Runtime Windows unpacked packaging smoke for Step
10.1. It verifies that the Runtime app can be built into a launchable unpacked
Windows directory.

## Scope

This workflow covers Runtime packaging only.

## Non-Goals

- No Maker packaging.
- No Python bundling.
- No installer.
- No portable single exe.
- No GitHub Release binary.
- No artifact publishing.
- No auto-updater.
- No new Runtime features.

## Preconditions

- Use Windows 10/11.
- Use PowerShell from the repository root.
- Install JavaScript dependencies before packaging.
- Start from clean `main`, then create a task-specific branch.

## Build Command

```powershell
corepack pnpm package:runtime:win:dir
```

## Expected Output

```text
release/runtime/win-unpacked/
```

The unpacked directory should contain `AutoPet Runtime.exe` or an equivalent
Runtime exe.

## Latest Manual Smoke Result

Step 10.4 external generated package load smoke passed on 2026-05-28.

Environment:

- Commit: `c7ed360`
- Generated external package path:
  `C:\Users\AozakiAolo\AppData\Local\Temp\autopet-step10-external-package-smoke\generated-pet`
- Runtime exe path:
  `release\runtime\win-unpacked\AutoPet Runtime.exe`

Passed:

- Generated package files existed:
  - `pet.json`
  - `spritesheet.png`
  - `preview.gif`
- `pet.json` referenced `spritesheet.png`.
- Runtime exe launched.
- Sample pet displayed.
- `Load Pet...` opened the folder picker.
- Generated external package loaded.
- Generated pet displayed.
- Generated pet animation advanced.
- Drag.
- `Reset Position`.
- `Always on Top` toggle.
- `Exit`.

Notes:

- Release output was ignored.
- No release artifact was committed.
- No installer, portable single exe, GitHub Release binary, tag, release, or
  artifact publishing was created.

## Previous Package Command Smoke

Step 10.2 passed on 2026-05-25.

Environment:

- Commit: `9efbf1b`
- PowerShell: `5.1.26100.8457`
- Node: `v24.15.0`
- pnpm: `10.33.4`
- electron-builder: `24.13.3`
- Electron: `33.4.11`

Output:

```text
release\runtime\win-unpacked
release\runtime\win-unpacked\AutoPet Runtime.exe
```

Passed:

- Package command.
- Exe launch.
- Sample pet display.
- Visible animation.
- Right-click menu.
- `Load Pet...` folder picker.
- Drag.
- `Reset Position`.
- `Always on Top` toggle.
- `Exit`.

Notes:

- Release output was ignored.
- No release artifact was committed.
- The electron-builder description/author warning did not block packaging.
- Step 10.4 filled the external generated package load coverage that Step 10.2
  skipped.

## Manual Smoke Checklist

- [ ] Confirm the working tree is clean before packaging.
- [ ] Run the package command.
- [ ] Confirm `release/runtime/win-unpacked` exists.
- [ ] Confirm the Runtime exe exists.
- [ ] Launch the Runtime exe manually.
- [ ] Confirm the sample pet displays.
- [ ] Confirm animation advances.
- [ ] Confirm the right-click menu opens.
- [ ] Confirm `Load Pet...` opens the folder picker.
- [ ] Optionally load a generated pet package from outside the repo.
- [ ] Drag the pet window.
- [ ] Use `Reset Position`.
- [ ] Toggle `Always on Top` off and on.
- [ ] Exit.
- [ ] Confirm no release output is staged or committed.

## Pass/Fail Result Template

```text
Date:
OS:
Branch:
Commit:
Node:
pnpm:
electron-builder version:
Command run:
Output path:
Exe path:
Result:
Failures observed:
Notes:
```
