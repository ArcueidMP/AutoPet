import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validatePetManifest } from "../dist/index.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixtureManifestPath = path.resolve(
  testDirectory,
  "../../../examples/sample-pet/pet.json"
);

test("examples/sample-pet/pet.json is a valid v0.1 pet manifest", async () => {
  const manifest = JSON.parse(await readFile(fixtureManifestPath, "utf8"));
  const result = validatePetManifest(manifest);

  assert.equal(result.ok, true, result.ok ? undefined : result.errors.join("\n"));

  if (!result.ok) {
    return;
  }

  assert.equal(result.manifest.schemaVersion, "0.1.0");
  assert.equal(result.manifest.sprite, "spritesheet.png");
  assert.equal(result.manifest.preview, undefined);
  assert.equal(result.manifest.frameWidth, 256);
  assert.equal(result.manifest.frameHeight, 256);
  assert.equal(result.manifest.defaultState, "idle");
});
