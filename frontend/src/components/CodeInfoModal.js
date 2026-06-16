export function createCodeInfoModal() {
  const element = document.createElement("div");
  element.className = "code-modal";

  element.innerHTML = `
    <div class="code-modal__backdrop" data-close="true"></div>

    <div class="code-modal__panel" role="dialog" aria-modal="true" aria-labelledby="code-modal-title">
      <button class="code-modal__close" type="button" aria-label="Zavřít informace">
        ✕
      </button>

      <div class="code-modal__content">
        <div class="code-modal__badge">ARCHITEKTURA PROJEKTU</div>

        <h2 id="code-modal-title" class="code-modal__title">
          CareAI Slot Demo
        </h2>

        <p class="code-modal__text">
          Ukázkový frontend herní prototyp pro pozici Frontend Game Developer / PixiJS Developer.
          Projekt kombinuje responzivní UI, herní logiku, stav aplikace, AUTO/TURBO režim,
          25 výherních linií, backend API v Node.js / Express, bezpečný frontend fallback
          a postupný přechod vizuální vrstvy z DOM/CSS do PixiJS canvasu.
        </p>

        <div class="code-modal__grid">
          <div class="code-modal__card">
            <h3>Frontend UI</h3>
            <p>Header, hero sekce, demo modal, informační panel a samostatné komponenty pro prezentaci projektu.</p>
            <code>src/components/</code>
          </div>

          <div class="code-modal__card">
            <h3>Herní automat</h3>
            <p>SlotGame řeší hlavní stav hry, kredity, sázku, výhru, spin, AUTO, TURBO a napojení DOM i PixiJS rendereru.</p>
            <code>src/game/SlotGame.js</code>
          </div>

          <div class="code-modal__card">
            <h3>PixiJS reel renderer</h3>
            <p>Samostatný canvas renderer vykresluje válce, plynulé točení, zastavení zleva doprava, symboly, glass overlay a win highlight.</p>
            <code>src/pixi-reels.js</code>
          </div>

          <div class="code-modal__card">
            <h3>PixiJS efekty</h3>
            <p>Oddělená canvas vrstva přidává ambient glow, částice, win flash, burst efekt, jiskry a výherní feedback.</p>
            <code>src/pixi-effects.js</code>
          </div>

          <div class="code-modal__card">
            <h3>Bezpečný canvas refaktor</h3>
            <p>PixiJS byl přidaný postupně vedle existující DOM vrstvy. Herní logika zůstává stabilní a vizuální renderer se dá dál rozšiřovat.</p>
            <code>DOM fallback + PixiJS layer</code>
          </div>

          <div class="code-modal__card">
            <h3>Backend spin API</h3>
            <p>Spin volá backend endpoint, který vrací výslednou mřížku symbolů, výhru, vítězný symbol a informace o výherních liniích.</p>
            <code>POST /api/game/spin</code>
          </div>

          <div class="code-modal__card">
            <h3>Fallback režim</h3>
            <p>Když backend neběží, frontend zachytí chybu a použije lokální výpočet, takže demo zůstává funkční i bez serveru.</p>
            <code>src/api/gameApi.js</code>
          </div>

          <div class="code-modal__card">
            <h3>25 paylines</h3>
            <p>Výhra se nepočítá jen na jedné prostřední linii. Demo používá 25 připravených payline patternů.</p>
            <code>src/game/logic/paylines.js</code>
          </div>

          <div class="code-modal__card">
            <h3>Herní logika</h3>
            <p>Výpočet výhry, generování symbolů, paylines a formátování hodnot jsou oddělené od UI a vizuálních efektů.</p>
            <code>src/game/logic/</code>
          </div>

          <div class="code-modal__card">
            <h3>AUTO / TURBO</h3>
            <p>AUTO spouští další spiny automaticky. TURBO zrychluje spin a zastavování válců bez změny výsledku hry.</p>
            <code>frontend state / UX logic</code>
          </div>

          <div class="code-modal__card">
            <h3>DOM reel fallback</h3>
            <p>Původní DOM/CSS reel strip animace zůstává v projektu jako stabilní základ a fallback při postupném převodu do PixiJS.</p>
            <code>DOM / CSS animation</code>
          </div>

          <div class="code-modal__card">
            <h3>Win feedback</h3>
            <p>Při výhře se kombinuje PixiJS particle efekt, výherní zvýraznění symbolů a CSS animace frame, například krátký screen shake.</p>
            <code>PixiJS + CSS animation</code>
          </div>

          <div class="code-modal__card">
            <h3>Blank symboly</h3>
            <p>Non-paying symboly vyvažují četnost výher při 25 aktivních liniích a dělají demo uvěřitelnější.</p>
            <code>src/game/gameConfig.js</code>
          </div>

          <div class="code-modal__card">
            <h3>Struktura projektu</h3>
            <p>Frontend a backend jsou oddělené části projektu, které lze spustit společně z kořene přes jeden příkaz.</p>
            <code>npm run dev</code>
          </div>
        </div>

        <div class="code-modal__footer">
          <span>Stack:</span>
          <strong>Vite</strong>
          <strong>JavaScript</strong>
          <strong>PixiJS</strong>
          <strong>Node.js</strong>
          <strong>Express</strong>
          <strong>25 Paylines</strong>
          <strong>API fallback</strong>
          <strong>Canvas refactor</strong>
        </div>
      </div>
    </div>
  `;

  const backdrop = element.querySelector(".code-modal__backdrop");
  const closeButton = element.querySelector(".code-modal__close");

  const close = () => {
    element.classList.remove("is-open");
    document.body.classList.remove("body--locked");
  };

  const open = () => {
    element.classList.add("is-open");
    document.body.classList.add("body--locked");
  };

  backdrop.addEventListener("click", close);
  closeButton.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && element.classList.contains("is-open")) {
      close();
    }
  });

  return {
    element,
    open,
    close,
  };
}