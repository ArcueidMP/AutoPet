# AutoPet Codex PR Workflow

This workflow keeps AutoPet changes small, reviewable, and human-controlled.
The default Codex mode is Mode A / Implement Only.

## Mode A / Implement Only

Mode A allows Codex to:

- Read source-of-truth files.
- Confirm the current branch and working tree state.
- Briefly explain an implementation plan.
- Implement one small task.
- Run relevant verification commands.
- Summarize changed files.
- Summarize commands run and results.
- Summarize risks and follow-up tasks.
- Suggest PR title and body text.

Mode A does not allow Codex to:

- Stage files.
- Commit.
- Push.
- Create pull requests.
- Merge pull requests.
- Delete branches.
- Force push.
- Use `git add .`.
- Make broad unrelated changes.

A different mode requires explicit human instruction later. Mode A remains the
default for routine AutoPet work.

## Recommended Human Workflow

Start from a clean `main` branch:

```powershell
git switch main
git pull --ff-only
git status --short --untracked-files=all
```

Create a feature branch manually:

```powershell
git switch -c chore/small-task-name
```

Give Codex one small task prompt. Ask Codex to read the source-of-truth files,
confirm the branch, explain the plan briefly, implement only that task, and run
verification.

Review Codex changes manually:

```powershell
git status --short --untracked-files=all
git diff --stat
git diff
```

Run standard verification:

```powershell
corepack pnpm typecheck
corepack pnpm build
```

For Python image-pipeline changes, also run:

```powershell
.\.venv\Scripts\python.exe -m compileall packages\image-pipeline\autopet_image_pipeline
.\.venv\Scripts\python.exe -m unittest discover -s packages\image-pipeline
```

Python image-pipeline work should use Python 3.13 and Pillow as the required
image dependency. `rembg` remains optional and must not be introduced by this
workflow task.

Stage explicit paths only:

```powershell
git add AGENTS.md
git add docs\workflows\codex-pr-workflow.md
git add .github\PULL_REQUEST_TEMPLATE.md
git add docs\dev-log.md
```

Commit manually:

```powershell
git commit -m "docs: add codex mode a workflow"
```

Push manually:

```powershell
git push -u origin chore/small-task-name
```

Open the PR manually in GitHub. Use Codex's suggested PR title and body only
after reviewing the diff.

Merge manually after review and checks pass.

Clean up branches manually:

```powershell
git switch main
git pull --ff-only
git branch -d chore/small-task-name
git push origin --delete chore/small-task-name
```

## Codex Final Summary Checklist

Codex should summarize:

- Files changed.
- What workflow documentation was added.
- Commands run and results.
- Remaining risks or follow-up tasks.
- Suggested PR title.
- Suggested PR body.
