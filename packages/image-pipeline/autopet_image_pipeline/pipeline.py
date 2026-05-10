from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

BackgroundMode = Literal["preserve-alpha", "local-rembg"]


@dataclass(frozen=True)
class PipelineOptions:
    canvas_size: int = 256
    subject_max_size: int = 220
    background_mode: BackgroundMode = "preserve-alpha"


@dataclass(frozen=True)
class PipelineResult:
    output_dir: Path
    manifest_path: Path
    spritesheet_path: Path
    preview_path: Path


def describe_pipeline() -> str:
    return (
        "AutoPet image pipeline scaffold: transparent PNG baseline, optional local "
        "rembg later, transform-only v0.1 animation output."
    )


def build_pet_package(
    input_image: str | Path,
    output_dir: str | Path,
    options: PipelineOptions | None = None,
) -> PipelineResult:
    source = Path(input_image)
    target = Path(output_dir)
    selected_options = options or PipelineOptions()

    if selected_options.background_mode not in ("preserve-alpha", "local-rembg"):
        raise ValueError(f"Unsupported background mode: {selected_options.background_mode}")

    if not source.exists():
        raise FileNotFoundError(source)

    # TODO(v0.1): Implement Pillow-based crop, resize, padding, sprite sheet, and manifest export.
    raise NotImplementedError(
        "AutoPet v0.1 image package generation is scaffolded but not implemented yet. "
        f"Input={source}, output={target}, canvas={selected_options.canvas_size}."
    )
