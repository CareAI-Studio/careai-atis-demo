export function createHeroSection() {
  const section = document.createElement("main");
  section.className = "hero-section";
  section.id = "atis-demo";

  section.innerHTML = `
    <div class="hero-section__inner">
      <section class="hero-copy">
        <div class="hero-copy__badge">DEMO PROJEKT</div>

        <h1 class="hero-copy__title">
          <span class="hero-copy__title-main">CareAI</span>
          <span class="hero-copy__title-accent">Slot Demo</span>
        </h1>

        <div class="hero-copy__line"></div>

        <p class="hero-copy__text">
          Interaktivní herní prototyp vytvořený v JavaScriptu pomocí PixiJS.
          Ukázka herního UI, animací a frontend logiky na pozici
          <strong>Frontend Game Developer</strong>.
        </p>

        <div class="hero-copy__actions">
          <button class="btn btn--primary" type="button" data-action="open-demo">
            <span>Spustit demo</span>
            <span class="btn__icon">▶</span>
          </button>

          <button class="btn btn--secondary" type="button" data-action="show-code">
            <span>Zobrazit kód</span>
            <span class="btn__icon">&lt;/&gt;</span>
          </button>
        </div>

        <div class="tech-stack">
          <div class="tech-stack__item">
            <span class="tech-stack__tag tech-stack__tag--js">JS</span>
            JavaScript
          </div>

          <div class="tech-stack__item">
            <span class="tech-stack__tag tech-stack__tag--pixi">PXI</span>
            PixiJS
          </div>

          <div class="tech-stack__item">
            <span class="tech-stack__tag tech-stack__tag--pack">⚡</span>
            Vite
          </div>

          <div class="tech-stack__item">
            <span class="tech-stack__tag tech-stack__tag--node">API</span>
            Node.js API
          </div>
        </div>

        <div class="info-card">
          <div class="info-card__icon">◎</div>
          <div class="info-card__content">
            <h2 class="info-card__title">Demo jednoho titulu</h2>
            <p class="info-card__text">
              Tento koncept představuje jeden plně funkční herní prototyp – CareAI Slot.
              Všechny prvky UI, animace a logika jsou součástí jediné demo hry.
            </p>
          </div>
        </div>
      </section>

      <section class="hero-preview" aria-label="Náhled herního automatu">
        <div class="preview-slot">
          <div class="preview-slot__title">CAREAI SLOT</div>

          <div class="preview-slot__board">
            <div class="preview-slot__lines preview-slot__lines--left">
              <span>25</span>
              <small>LINES</small>
            </div>

            <div class="preview-slot__reels">
              <div class="preview-slot__reel">
                <div class="preview-slot__symbol symbol--robot">🤖</div>
                <div class="preview-slot__symbol symbol--chat">💬</div>
                <div class="preview-slot__symbol symbol--star">★</div>
              </div>

              <div class="preview-slot__reel">
                <div class="preview-slot__symbol symbol--heart">♥</div>
                <div class="preview-slot__symbol symbol--ai">AI</div>
                <div class="preview-slot__symbol symbol--diamond">◆</div>
              </div>

              <div class="preview-slot__reel">
                <div class="preview-slot__symbol symbol--star">★</div>
                <div class="preview-slot__symbol symbol--ai">AI</div>
                <div class="preview-slot__symbol symbol--bolt">⚡</div>
              </div>

              <div class="preview-slot__reel">
                <div class="preview-slot__symbol symbol--chat">💬</div>
                <div class="preview-slot__symbol symbol--robot">🤖</div>
                <div class="preview-slot__symbol symbol--heart">♥</div>
              </div>

              <div class="preview-slot__reel">
                <div class="preview-slot__symbol symbol--ai">AI</div>
                <div class="preview-slot__symbol symbol--star">★</div>
                <div class="preview-slot__symbol symbol--diamond">◆</div>
              </div>
            </div>

            <div class="preview-slot__lines preview-slot__lines--right">
              <span>25</span>
              <small>LINES</small>
            </div>
          </div>

          <div class="preview-slot__controls">
            <div class="preview-slot__panel">
              <span class="preview-slot__label">KREDITY</span>
              <strong>12 450</strong>
            </div>

            <div class="preview-slot__panel">
              <span class="preview-slot__label">SÁZKA</span>
              <strong>100</strong>
            </div>

            <div class="preview-slot__spin">
              <span class="preview-slot__spin-icon">↻</span>
            </div>

            <div class="preview-slot__panel">
              <span class="preview-slot__label">MAX BET</span>
              <strong>500</strong>
            </div>

            <div class="preview-slot__panel preview-slot__panel--win">
              <span class="preview-slot__label">VÝHRA</span>
              <strong>250</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return section;
}