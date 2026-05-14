from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from PIL import Image, UnidentifiedImageError

BackgroundMode = Literal["preserve-alpha", "local-rembg"]

SCHEMA_VERSION = "0.1.0"
FRAME_SIZE = 256
SUBJECT_MAX_SIZE = 220
SPRITESHEET_COLUMNS = 8
SPRITESHEET_ROWS = 5
SPRITESHEET_WIDTH = FRAME_SIZE * SPRITESHEET_COLUMNS
SPRITESHEET_HEIGHT = FRAME_SIZE * SPRITESHEET_ROWS
DEFAULT_PET_NAME = "My Pet"


class PipelineError(ValueError):
    """Raised when the input cannot be converted into a Stage 5 pet package."""


@dataclass(frozen=True)
class PipelineOptions:
    canvas_size: int = FRAME_SIZE
    subject_max_size: int = SUBJECT_MAX_SIZE
    background_mode: BackgroundMode = "preserve-alpha"
    name: str = DEFAULT_PET_NAME


@dataclass(frozen=True)
class PipelineResult:
    output_dir: Path
    manifest_path: Path
    spritesheet_path: Path
    preview_path: Path


@dataclass(frozen=True)
class StateSpec:
    name: str
    row: int
    frames: int
    fps: int
    loop: bool
    next_state: str | None = None


STATE_SPECS: tuple[StateSpec, ...] = (
    StateSpec("idle", row=0, frames=8, fps=8, loop=True),
    StateSpec("bounce", row=1, frames=8, fps=8, loop=True),
    StateSpec("click", row=2, frames=6, fps=12, loop=False, next_state="idle"),
    StateSpec("sleep", row=3, frames=8, fps=6, loop=True),
    StateSpec("drag", row=4, frames=1, fps=1, loop=True),
)


def describe_pipeline() -> str:
    return (
        "AutoPet image pipeline: transparent PNG baseline, Pillow-only Stage 5 "
        "normalization, deterministic transform-only v0.1 package output."
    )


def build_pet_package(
    input_image: str | Path,
    output_dir: str | Path,
    options: PipelineOptions | None = None,
    *,
    name: str | None = None,
) -> PipelineResult:
    source = Path(input_image)
    target = Path(output_dir)
    selected_options = options or PipelineOptions()

    _validate_options(selected_options)

    image = _load_transparent_png(source)
    normalized = _normalize_subject(image, selected_options)
    frames_by_state = _generate_state_frames(normalized)

    target.mkdir(parents=True, exist_ok=True)
    spritesheet_path = target / "spritesheet.png"
    preview_path = target / "preview.gif"
    manifest_path = target / "pet.json"

    _write_spritesheet(frames_by_state, spritesheet_path)
    _write_preview(frames_by_state["idle"], preview_path)
    _write_manifest(
        manifest_path,
        name=_normalize_name(name if name is not None else selected_options.name),
    )

    return PipelineResult(
        output_dir=target,
        manifest_path=manifest_path,
        spritesheet_path=spritesheet_path,
        preview_path=preview_path,
    )


def _validate_options(options: PipelineOptions) -> None:
    if options.background_mode != "preserve-alpha":
        raise PipelineError(
            "Stage 5 supports only preserve-alpha transparent PNG input; "
            "local rembg/background removal is not included."
        )

    if options.canvas_size != FRAME_SIZE:
        raise PipelineError(f"Stage 5 supports only a {FRAME_SIZE} px canvas.")

    if options.subject_max_size != SUBJECT_MAX_SIZE:
        raise PipelineError(
            f"Stage 5 supports only a {SUBJECT_MAX_SIZE} px subject max dimension."
        )


def _load_transparent_png(source: Path) -> Image.Image:
    if not source.exists():
        raise FileNotFoundError(source)

    try:
        with Image.open(source) as image:
            if image.format != "PNG":
                raise PipelineError("Input must be a transparent PNG.")
            rgba = image.convert("RGBA")
    except UnidentifiedImageError as exc:
        raise PipelineError("Input must be a readable transparent PNG.") from exc

    alpha = rgba.getchannel("A")
    min_alpha, max_alpha = alpha.getextrema()

    if max_alpha == 0:
        raise PipelineError("Input PNG is fully transparent; a visible subject is required.")

    if min_alpha > 0:
        raise PipelineError(
            "Input PNG must include useful transparency. Opaque images need "
            "background removal, which is not included in Stage 5."
        )

    return rgba


def _normalize_subject(image: Image.Image, options: PipelineOptions) -> Image.Image:
    alpha_bbox = image.getchannel("A").getbbox()
    if alpha_bbox is None:
        raise PipelineError("Input PNG is fully transparent; a visible subject is required.")

    subject = image.crop(alpha_bbox)
    scale = options.subject_max_size / max(subject.size)
    resized_size = (
        max(1, int(round(subject.width * scale))),
        max(1, int(round(subject.height * scale))),
    )
    resized = subject.resize(resized_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (options.canvas_size, options.canvas_size), (0, 0, 0, 0))
    offset = (
        (options.canvas_size - resized.width) // 2,
        (options.canvas_size - resized.height) // 2,
    )
    canvas.alpha_composite(resized, offset)
    return canvas


def _generate_state_frames(base: Image.Image) -> dict[str, list[Image.Image]]:
    frames_by_state = {
        "idle": [
            _transform(base, scale_x=1.000, scale_y=1.000, offset_y=0),
            _transform(base, scale_x=0.998, scale_y=1.006, offset_y=-1),
            _transform(base, scale_x=0.996, scale_y=1.012, offset_y=-2),
            _transform(base, scale_x=0.998, scale_y=1.006, offset_y=-1),
            _transform(base, scale_x=1.000, scale_y=1.000, offset_y=0),
            _transform(base, scale_x=1.002, scale_y=0.996, offset_y=1),
            _transform(base, scale_x=1.004, scale_y=0.992, offset_y=2),
            _transform(base, scale_x=1.002, scale_y=0.996, offset_y=1),
        ],
        "bounce": [
            _transform(base, offset_y=0),
            _transform(base, offset_y=-5),
            _transform(base, offset_y=-10),
            _transform(base, offset_y=-6),
            _transform(base, scale_x=1.030, scale_y=0.970, offset_y=4),
            _transform(base, scale_x=0.985, scale_y=1.020, offset_y=-1),
            _transform(base, offset_y=0),
            _transform(base, offset_y=-2),
        ],
        "click": [
            _transform(base),
            _transform(base, scale_x=1.080, scale_y=0.900, offset_y=9),
            _transform(base, scale_x=1.110, scale_y=0.840, offset_y=13),
            _transform(base, scale_x=0.940, scale_y=1.120, offset_y=-8),
            _transform(base, scale_x=1.020, scale_y=0.980, offset_y=2),
            _transform(base),
        ],
        "sleep": [
            _transform(base, scale_x=1.000, scale_y=0.990, offset_y=2, opacity=0.62),
            _transform(base, scale_x=1.001, scale_y=0.994, offset_y=1, opacity=0.62),
            _transform(base, scale_x=0.998, scale_y=1.000, offset_y=0, opacity=0.62),
            _transform(base, scale_x=0.996, scale_y=1.006, offset_y=-1, opacity=0.62),
            _transform(base, scale_x=0.998, scale_y=1.000, offset_y=0, opacity=0.62),
            _transform(base, scale_x=1.001, scale_y=0.994, offset_y=1, opacity=0.62),
            _transform(base, scale_x=1.000, scale_y=0.990, offset_y=2, opacity=0.62),
            _transform(base, scale_x=1.002, scale_y=0.986, offset_y=3, opacity=0.62),
        ],
        "drag": [
            _transform(base, offset_x=3, offset_y=-2, rotation_degrees=-7.0),
        ],
    }

    for spec in STATE_SPECS:
        actual_frames = len(frames_by_state[spec.name])
        if actual_frames != spec.frames:
            raise RuntimeError(
                f"State {spec.name} generated {actual_frames} frames; expected {spec.frames}."
            )

    return frames_by_state


def _transform(
    base: Image.Image,
    *,
    scale_x: float = 1.0,
    scale_y: float = 1.0,
    offset_x: int = 0,
    offset_y: int = 0,
    rotation_degrees: float = 0.0,
    opacity: float = 1.0,
) -> Image.Image:
    transformed = base.resize(
        (
            max(1, int(round(base.width * scale_x))),
            max(1, int(round(base.height * scale_y))),
        ),
        Image.Resampling.BICUBIC,
    )

    if rotation_degrees != 0.0:
        transformed = transformed.rotate(
            rotation_degrees,
            resample=Image.Resampling.BICUBIC,
            expand=True,
        )

    if opacity < 1.0:
        red, green, blue, alpha = transformed.split()
        alpha = alpha.point(lambda value: int(round(value * opacity)))
        transformed = Image.merge("RGBA", (red, green, blue, alpha))

    frame = Image.new("RGBA", base.size, (0, 0, 0, 0))
    left = (base.width - transformed.width) // 2 + offset_x
    top = (base.height - transformed.height) // 2 + offset_y
    _alpha_composite_clipped(frame, transformed, left, top)
    return frame


def _alpha_composite_clipped(
    base: Image.Image,
    overlay: Image.Image,
    left: int,
    top: int,
) -> None:
    source_left = max(0, -left)
    source_top = max(0, -top)
    source_right = min(overlay.width, base.width - left)
    source_bottom = min(overlay.height, base.height - top)

    if source_right <= source_left or source_bottom <= source_top:
        return

    cropped = overlay.crop((source_left, source_top, source_right, source_bottom))
    base.alpha_composite(cropped, (max(0, left), max(0, top)))


def _write_spritesheet(frames_by_state: dict[str, list[Image.Image]], path: Path) -> None:
    sheet = Image.new("RGBA", (SPRITESHEET_WIDTH, SPRITESHEET_HEIGHT), (0, 0, 0, 0))

    for spec in STATE_SPECS:
        for column, frame in enumerate(frames_by_state[spec.name]):
            sheet.alpha_composite(frame, (column * FRAME_SIZE, spec.row * FRAME_SIZE))

    sheet.save(path, format="PNG", optimize=False, compress_level=9)


def _write_preview(frames: list[Image.Image], path: Path) -> None:
    preview_frames = [
        frame.resize((FRAME_SIZE // 2, FRAME_SIZE // 2), Image.Resampling.LANCZOS)
        for frame in frames
    ]
    preview_frames[0].save(
        path,
        format="GIF",
        save_all=True,
        append_images=preview_frames[1:],
        duration=125,
        loop=0,
        disposal=2,
        optimize=False,
    )


def _write_manifest(path: Path, *, name: str) -> None:
    manifest = {
        "schemaVersion": SCHEMA_VERSION,
        "name": name,
        "version": SCHEMA_VERSION,
        "sprite": "spritesheet.png",
        "preview": "preview.gif",
        "frameWidth": FRAME_SIZE,
        "frameHeight": FRAME_SIZE,
        "defaultState": "idle",
        "states": {
            spec.name: _manifest_state(spec)
            for spec in STATE_SPECS
        },
        "hitbox": {
            "x": 32,
            "y": 32,
            "width": 192,
            "height": 192,
        },
    }
    path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def _manifest_state(spec: StateSpec) -> dict[str, int | bool | str]:
    state: dict[str, int | bool | str] = {
        "row": spec.row,
        "frames": spec.frames,
        "fps": spec.fps,
        "loop": spec.loop,
    }
    if spec.next_state is not None:
        state["next"] = spec.next_state
    return state


def _normalize_name(name: str) -> str:
    cleaned_name = name.strip()
    return cleaned_name or DEFAULT_PET_NAME
