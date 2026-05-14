from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

from autopet_image_pipeline import PipelineError, PipelineOptions, build_pet_package


EXPECTED_STATES = {
    "idle": {"row": 0, "frames": 8, "fps": 8, "loop": True},
    "bounce": {"row": 1, "frames": 8, "fps": 8, "loop": True},
    "click": {"row": 2, "frames": 6, "fps": 12, "loop": False, "next": "idle"},
    "sleep": {"row": 3, "frames": 8, "fps": 6, "loop": True},
    "drag": {"row": 4, "frames": 1, "fps": 1, "loop": True},
}


class BuildPetPackageTests(unittest.TestCase):
    def test_transparent_png_produces_pet_package(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workspace = Path(temp_dir)
            input_path = workspace / "input.png"
            output_dir = workspace / "pet"
            _write_transparent_input(input_path)

            result = build_pet_package(
                input_path,
                output_dir,
                PipelineOptions(name="Test Pet"),
            )

            self.assertEqual(result.output_dir, output_dir)
            self.assertTrue(result.manifest_path.is_file())
            self.assertTrue(result.spritesheet_path.is_file())
            self.assertTrue(result.preview_path.is_file())

            with Image.open(result.spritesheet_path) as spritesheet:
                self.assertEqual(spritesheet.size, (2048, 1280))

            manifest = json.loads(result.manifest_path.read_text(encoding="utf-8"))
            self.assertEqual(manifest["schemaVersion"], "0.1.0")
            self.assertEqual(manifest["name"], "Test Pet")
            self.assertEqual(manifest["sprite"], "spritesheet.png")
            self.assertEqual(manifest["preview"], "preview.gif")
            self.assertEqual(manifest["frameWidth"], 256)
            self.assertEqual(manifest["frameHeight"], 256)
            self.assertEqual(manifest["defaultState"], "idle")
            self.assertEqual(manifest["states"], EXPECTED_STATES)
            self.assertEqual(
                manifest["hitbox"],
                {"x": 32, "y": 32, "width": 192, "height": 192},
            )

    def test_fully_transparent_input_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workspace = Path(temp_dir)
            input_path = workspace / "empty.png"
            Image.new("RGBA", (64, 64), (0, 0, 0, 0)).save(input_path)

            with self.assertRaisesRegex(PipelineError, "fully transparent"):
                build_pet_package(input_path, workspace / "pet")

    def test_opaque_input_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workspace = Path(temp_dir)
            input_path = workspace / "opaque.png"
            Image.new("RGB", (64, 64), (255, 255, 255)).save(input_path)

            with self.assertRaisesRegex(PipelineError, "useful transparency"):
                build_pet_package(input_path, workspace / "pet")

    def test_alpha_is_preserved_in_generated_spritesheet(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workspace = Path(temp_dir)
            input_path = workspace / "transparent.png"
            output_dir = workspace / "pet"
            _write_transparent_input(input_path, subject_alpha=128)

            result = build_pet_package(input_path, output_dir)

            with Image.open(result.spritesheet_path) as spritesheet:
                self.assertEqual(spritesheet.mode, "RGBA")
                min_alpha, max_alpha = spritesheet.getchannel("A").getextrema()

            self.assertEqual(min_alpha, 0)
            self.assertGreater(max_alpha, 0)
            self.assertLess(max_alpha, 255)


def _write_transparent_input(path: Path, *, subject_alpha: int = 255) -> None:
    image = Image.new("RGBA", (96, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.ellipse((18, 8, 78, 72), fill=(230, 90, 45, subject_alpha))
    draw.rectangle((38, 42, 58, 70), fill=(60, 140, 220, subject_alpha))
    image.save(path, format="PNG")


if __name__ == "__main__":
    unittest.main()
