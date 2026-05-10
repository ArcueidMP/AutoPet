import { useMemo } from "react";
import { PetAnimationPlayer } from "@autopet/pet-engine";
import { createDraftPetManifest } from "@autopet/pet-format";

export function App() {
  const manifest = useMemo(() => createDraftPetManifest("Scaffold Pet"), []);
  const player = useMemo(() => new PetAnimationPlayer(manifest), [manifest]);
  const snapshot = player.snapshot();

  return (
    <main className="runtime-shell" aria-label="AutoPet runtime scaffold">
      <div className="pet-placeholder" aria-label={`${manifest.name} placeholder`}>
        <span>AP</span>
      </div>
      <div className="runtime-status">
        {snapshot.state} / {snapshot.frameIndex + 1}
      </div>
    </main>
  );
}
