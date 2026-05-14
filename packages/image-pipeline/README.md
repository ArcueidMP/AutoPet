# AutoPet Image Pipeline

Local Python package for the Stage 5 v0.1 transparent PNG package pipeline.

The reliable v0.1 path is a transparent PNG with a useful alpha background. The
pipeline uses Pillow only, preserves alpha, trims the alpha bounding box,
normalizes the subject into a `256 x 256` canvas, generates deterministic
transform-only animation frames, and writes a local pet package folder.

`rembg` and background removal are not included in Stage 5. Opaque images are
rejected with a helpful error instead of attempting automatic background
removal.

## Setup

From the repository root, use the project-local virtual environment:

```powershell
.\.venv\Scripts\python.exe -m pip install -r packages\image-pipeline\requirements.txt
```

The required dependency file installs Pillow only.

## CLI

When running from the monorepo without installing the package, run the module
from this package directory:

```powershell
cd packages\image-pipeline
..\..\.venv\Scripts\python.exe -m autopet_image_pipeline --input <transparent-png> --output <output-folder> --name "My Pet"
```

If the package is installed into the active environment, the same module command
can be run from any directory where Python can import `autopet_image_pipeline`.

## Output Package

```text
output-folder/
  pet.json
  spritesheet.png
  preview.gif
```

Generated assets use package-relative paths in `pet.json`:

- `sprite`: `spritesheet.png`
- `preview`: `preview.gif`

The spritesheet is `2048 x 1280`, arranged as eight `256 x 256` columns by five
rows:

- row 0: `idle`
- row 1: `bounce`
- row 2: `click`
- row 3: `sleep`
- row 4: `drag`
