import { createDraftPetManifest } from "@autopet/pet-format";

const draftManifest = createDraftPetManifest("Untitled Pet");

export function App() {
  return (
    <main className="maker-shell">
      <header className="maker-header">
        <div>
          <p className="eyebrow">AutoPet v{window.autopet?.version ?? "0.1.0"}</p>
          <h1>Maker</h1>
        </div>
        <button type="button" disabled>
          Import PNG
        </button>
      </header>

      <section className="maker-grid" aria-label="Maker scaffold">
        <div className="panel import-panel">
          <h2>Source Image</h2>
          <div className="drop-zone">Transparent PNG baseline</div>
          <p>TODO(v0.1): Import one local image and preserve existing alpha by default.</p>
        </div>

        <div className="panel">
          <h2>Pipeline</h2>
          <ol className="steps">
            <li>Trim empty bounds</li>
            <li>Normalize to 256 x 256</li>
            <li>Generate transform frames</li>
            <li>Export pet package</li>
          </ol>
          <p>TODO(v0.1): Call the local Python image pipeline as a subprocess.</p>
        </div>

        <div className="panel manifest-panel">
          <h2>Draft Manifest</h2>
          <dl>
            <div>
              <dt>Schema</dt>
              <dd>{draftManifest.schemaVersion}</dd>
            </div>
            <div>
              <dt>Default</dt>
              <dd>{draftManifest.defaultState}</dd>
            </div>
            <div>
              <dt>Frame</dt>
              <dd>
                {draftManifest.frameWidth} x {draftManifest.frameHeight}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
