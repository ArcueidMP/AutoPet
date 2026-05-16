import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { PetAnimationPlayer } from "@autopet/pet-engine";
import { validatePetManifest } from "@autopet/pet-format";

import samplePetManifestInput from "../../../../../examples/sample-pet/pet.json";
import samplePetSpritesheetUrl from "../../../../../examples/sample-pet/spritesheet.png?url";

interface ActiveDrag {
  pointerId: number;
  runtimeWindow: AutoPetBridge["runtimeWindow"];
  startDrag: Promise<void>;
}

function getRuntimeWindowApi(): AutoPetBridge["runtimeWindow"] | null {
  const runtimeWindow = window.autopet?.runtimeWindow;

  if (runtimeWindow === undefined) {
    console.warn(
      "AutoPet Runtime drag API is unavailable; window dragging is disabled."
    );
    return null;
  }

  return runtimeWindow;
}

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
  const activeDrag = useRef<ActiveDrag | null>(null);

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
      if (event.button !== 0) {
        return;
      }

      const runtimeWindow = getRuntimeWindowApi();

      if (runtimeWindow === null) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      activeDrag.current = {
        pointerId: event.pointerId,
        runtimeWindow,
        startDrag: runtimeWindow.startDrag()
      };
    },
    []
  );

  const handlePetPointerUp = useCallback(
    async (event: PointerEvent<HTMLButtonElement>) => {
      const drag = activeDrag.current;

      if (drag === null || drag.pointerId !== event.pointerId) {
        return;
      }

      const shouldReleasePointerCapture = event.currentTarget.hasPointerCapture(
        event.pointerId
      );
      activeDrag.current = null;

      if (shouldReleasePointerCapture) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      await drag.startDrag;
      const endDragResult = await drag.runtimeWindow.endDrag();

      if (endDragResult.didMove) {
        return;
      }

      if (samplePet.ok && samplePet.player.setState("click")) {
        setSnapshot(samplePet.player.snapshot());
      }
    },
    [samplePet]
  );

  const handlePetPointerCancel = useCallback(
    async (event: PointerEvent<HTMLButtonElement>) => {
      const drag = activeDrag.current;

      if (drag === null || drag.pointerId !== event.pointerId) {
        return;
      }

      const shouldReleasePointerCapture = event.currentTarget.hasPointerCapture(
        event.pointerId
      );
      activeDrag.current = null;

      if (shouldReleasePointerCapture) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      await drag.startDrag;
      await drag.runtimeWindow.endDrag();
    },
    []
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
        onPointerUp={handlePetPointerUp}
        onPointerCancel={handlePetPointerCancel}
      />
    </main>
  );
}
