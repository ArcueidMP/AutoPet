# Sample Pet Fixture

This directory contains a deterministic sample fixture for future Runtime
loading and smoke tests.

The fixture is hand-authored placeholder data. It is not produced by the
AutoPet image pipeline yet, and it should not be treated as a real Maker export.

## Files

- `pet.json`: v0.1 manifest validated by `@autopet/pet-format`.
- `spritesheet.png`: transparent placeholder sprite sheet.

## Sprite Sheet

- Size: `2048 x 1280`.
- Layout: `8` columns by `5` rows.
- Frame size: `256 x 256`.
- Background: transparent.

## Rows

| Row | State | Frames | FPS | Loop | Next |
|---:|---|---:|---:|---|---|
| 0 | `idle` | 8 | 8 | yes | |
| 1 | `bounce` | 8 | 8 | yes | |
| 2 | `click` | 6 | 12 | no | `idle` |
| 3 | `sleep` | 8 | 6 | yes | |
| 4 | `drag` | 1 | 1 | yes | |

Unused frames are intentionally transparent:

- row 2, columns 6-7
- row 4, columns 1-7
