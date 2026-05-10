# AutoPet Image Pipeline

Placeholder Python package for the local v0.1 image-to-pet pipeline.

Baseline setup from this directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Optional local background removal can be installed later:

```powershell
python -m pip install -r requirements-rembg.txt
```

TODO(v0.1):

- Preserve transparent PNG alpha.
- Trim transparent or empty bounds.
- Normalize the subject into a 256 x 256 canvas.
- Generate transform-only animation frames.
- Assemble `spritesheet.png`, `preview.gif`, and `pet.json`.
