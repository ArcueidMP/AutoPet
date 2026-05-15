import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { PetAnimationPlayer } from "@autopet/pet-engine";
import { validatePetManifest } from "@autopet/pet-format";

import samplePetManifestInput from "../../../../../examples/sample-pet/pet.json";
import samplePetSpritesheetUrl from "../../../../../examples/sample-pet/spritesheet.png?url";

export function App() {
  const samplePet = useMemo(() => {
    const validation = validatePetManifest(samplePetManifestInput);

    if (!validation.ok) {
      return {
        ok: false as const,
        errors: validation.errors
      };
    }

    return {
      ok: true as const,
      manifest: validation.manifest,
      player: new PetAnimationPlayer(validation.manifest)
    };
  }, []);

  const [snapshot, setSnapshot] = useState(() =>
    samplePet.ok ? samplePet.player.snapshot() : null
  );

  useEffect(() => {
    if (!samplePet.ok) {
      return;
    }

    let animationFrameId = 0;
    let previousTimestamp: number | undefined;

    const animate = (timestamp: number) => {
      if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
        setSnapshot(samplePet.player.snapshot());
      } else {
        const deltaMs = timestamp - previousTimestamp;
        previousTimestamp = timestamp;
        setSnapshot(samplePet.player.advance(deltaMs));
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [samplePet]);

  const handlePetPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || !samplePet.ok) {
        return;
      }

      if (samplePet.player.setState("click")) {
        setSnapshot(samplePet.player.snapshot());
      }
    },
    [samplePet]
  );

  if (!samplePet.ok) {
    return (
      <main className="runtime-shell" aria-label="AutoPet runtime sample pet">
        <section className="runtime-error" role="alert">
          <strong>Sample pet validation failed</strong>
          <ul>
            {samplePet.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  if (snapshot === null) {
    return null;
  }

  const frameStyle = {
    width: `${snapshot.frameWidth}px`,
    height: `${snapshot.frameHeight}px`,
    backgroundImage: `url(${samplePetSpritesheetUrl})`,
    backgroundPosition: `-${snapshot.frameRect.x}px -${snapshot.frameRect.y}px`
  } satisfies CSSProperties;

  return (
    <main className="runtime-shell" aria-label="AutoPet runtime sample pet">
      <button
        type="button"
        className="pet-sprite"
        style={frameStyle}
        aria-label={`${samplePet.manifest.name}: ${snapshot.stateName} frame ${
          snapshot.frameIndex + 1
        }`}
        onPointerDown={handlePetPointerDown}
      />
      <div className="runtime-status">
        {snapshot.stateName} / {snapshot.frameIndex + 1}
      </div>
    </main>
  );
}
