from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence

from .pipeline import PipelineError, build_pet_package, describe_pipeline


def build_parser() -> argparse.ArgumentParser:
    return argparse.ArgumentParser(
        prog="python -m autopet_image_pipeline",
        description=describe_pipeline(),
        epilog=(
            "When running from the monorepo without installing the package, run this "
            "command from packages/image-pipeline."
        ),
    )


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    parser.add_argument("--input", required=True, help="Path to a transparent PNG input.")
    parser.add_argument("--output", required=True, help="Output pet package folder.")
    parser.add_argument("--name", default="My Pet", help="Pet name written to pet.json.")

    args = parser.parse_args(argv)

    try:
        result = build_pet_package(args.input, args.output, name=args.name)
    except (OSError, PipelineError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(f"Generated AutoPet package: {result.output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
