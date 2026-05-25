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
