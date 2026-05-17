import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { PetAnimationPlayer } from "@autopet/pet-engine";
import type { PetManifestV010 } from "@autopet/pet-format";
import { validatePetManifest } from "@autopet/pet-format";

import samplePetManifestInput from "../../../../../examples/sample-pet/pet.json";
import samplePetSpritesheetUrl from "../../../../../examples/sample-pet/spritesheet.png?url";

interface ActivePet {
  manifest: PetManifestV010;
  player: PetAnimationPlayer;
  spriteUrl: string;
}

type SamplePetResult =
  | {
      ok: true;
      pet: ActivePet;
    }
  | {
      ok: false;
      errors: string[];
    };

interface ActiveDrag {
  pointerId: number;
  runtimeWindow: AutoPetBridge["runtimeWindow"];
  startDrag: Promise<void>;
}

function createActivePet(
  manifest: PetManifestV010,
  spriteUrl: string
): ActivePet {
  return {
    manifest,
    player: new PetAnimationPlayer(manifest),
    spriteUrl
  };
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

function getRuntimePetApi(): AutoPetBridge["runtimePet"] | null {
  const runtimePet = window.autopet?.runtimePet;

  if (runtimePet === undefined) {
    console.warn(
      "AutoPet Runtime pet API is unavailable; package loading is disabled."
    );
    return null;
  }

  return runtimePet;
}

export function App() {
  const samplePet = useMemo<SamplePetResult>(() => {
    const validation = validatePetManifest(samplePetManifestInput);

    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors
      };
    }

    return {
      ok: true,
      pet: createActivePet(validation.manifest, samplePetSpritesheetUrl)
    };
  }, []);

  const [activePet, setActivePet] = useState<ActivePet | null>(() =>
    samplePet.ok ? samplePet.pet : null
  );
  const [snapshot, setSnapshot] = useState(() =>
    samplePet.ok ? samplePet.pet.player.snapshot() : null
  );
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const activePetRef = useRef<ActivePet | null>(
    samplePet.ok ? samplePet.pet : null
  );
  const activeDrag = useRef<ActiveDrag | null>(null);

  useEffect(() => {
    const runtimePet = getRuntimePetApi();

    if (runtimePet === null) {
      return;
    }

    const unsubscribeLoaded = runtimePet.onLoaded((payload) => {
      const validation = validatePetManifest(payload.manifest);

      if (!validation.ok) {
        setLoadErrors([
          "Loaded pet manifest failed renderer validation.",
          ...validation.errors
        ]);
        return;
      }

      const nextPet = createActivePet(
        validation.manifest,
        payload.spriteUrl
      );

      activePetRef.current = nextPet;
      setActivePet(nextPet);
      setSnapshot(nextPet.player.snapshot());
      setLoadErrors([]);
    });

    const unsubscribeLoadError = runtimePet.onLoadError((payload) => {
      setLoadErrors(
        payload.errors.length > 0
          ? payload.errors
          : ["The pet package could not be loaded."]
      );
    });

    return () => {
      unsubscribeLoaded();
      unsubscribeLoadError();
    };
  }, []);

  useEffect(() => {
    if (activePet === null) {
      return;
    }

    activePetRef.current = activePet;

    let animationFrameId = 0;
    let previousTimestamp: number | undefined;

    const animate = (timestamp: number) => {
      if (activePetRef.current !== activePet) {
        return;
      }

      if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
        setSnapshot(activePet.player.snapshot());
      } else {
        const deltaMs = timestamp - previousTimestamp;
        previousTimestamp = timestamp;
        setSnapshot(activePet.player.advance(deltaMs));
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [activePet]);

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

      const pet = activePetRef.current;

      if (pet !== null && pet.player.setState("click")) {
        setSnapshot(pet.player.snapshot());
      }
    },
    []
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

  if (activePet === null) {
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

    return null;
  }

  if (snapshot === null) {
    return null;
  }

  const frameStyle = {
    width: `${snapshot.frameWidth}px`,
    height: `${snapshot.frameHeight}px`,
    backgroundImage: `url("${activePet.spriteUrl}")`,
    backgroundPosition: `-${snapshot.frameRect.x}px -${snapshot.frameRect.y}px`
  } satisfies CSSProperties;

  return (
    <main
      className="runtime-shell"
      aria-label={`AutoPet runtime pet: ${activePet.manifest.name}`}
    >
      <button
        type="button"
        className="pet-sprite"
        style={frameStyle}
        aria-label={`${activePet.manifest.name}: ${snapshot.stateName} frame ${
          snapshot.frameIndex + 1
        }`}
        onPointerDown={handlePetPointerDown}
        onPointerUp={handlePetPointerUp}
        onPointerCancel={handlePetPointerCancel}
      />
      {loadErrors.length > 0 ? (
        <section className="runtime-load-error" role="alert">
          <strong>Load Pet failed</strong>
          <ul>
            {loadErrors.map((error, index) => (
              <li key={`${index}-${error}`}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
