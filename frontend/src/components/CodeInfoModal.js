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
          Projekt kombinuje responzivní UI, herní logiku, DOM animaci válců, PixiJS canvas efektovou vrstvu,
          backend API v Node.js / Express a bezpečný frontend fallback při nedostupném serveru.
        </p>

        <div class="code-modal__grid">
          <div class="code-modal__card">
            <h3>Frontend UI</h3>
            <p>Header, hero sekce, demo modal, informační panel a samostatné komponenty pro prezentaci projektu.</p>
            <code>src/components/</code>
          </div>

          <div class="code-modal__card">
            <h3>Herní automat</h3>
            <p>SlotGame řeší vykreslení automatu, stav hry, kredity, sázku, výhru, spin, AUTO, TURBO a postupné zastavení válců.</p>
            <code>src/game/SlotGame.js</code>
          </div>

          <div class="code-modal__card">
            <h3>PixiJS efekty</h3>
            <p>Samostatná canvas vrstva přidává ambient glow, částice, win flash, jiskry a výherní feedback bez zásahu do DOM logiky.</p>
            <code>src/pixi-effects.js</code>
          </div>

          <div class="code-modal__card">
            <h3>Win feedback</h3>
            <p>Při výhře se kombinuje PixiJS particle efekt s CSS animací frame, například krátký screen shake / win impact.</p>
            <code>PixiJS + CSS animation</code>
          </div>

          <div class="code-modal__card">
            <h3>Backend spin API</h3>
            <p>Spin volá backend endpoint, který vrací výslednou mřížku symbolů, výhru a informace o výherní linii.</p>
            <code>POST /api/game/spin</code>
          </div>

          <div class="code-modal__card">
            <h3>Fallback režim</h3>
            <p>Když backend neběží, frontend zachytí chybu a použije lokální výpočet, takže demo zůstává funkční.</p>
            <code>src/api/gameApi.js</code>
          </div>

          <div class="code-modal__card">
            <h3>25 paylines</h3>
            <p>Výhra se nepočítá jen na jedné prostřední linii. Demo používá 25 připravených payline patternů.</p>
            <code>src/game/logic/paylines.js</code>
          </div>

          <div class="code-modal__card">
            <h3>Herní logika</h3>
            <p>Výpočet výhry, generování symbolů, paylines a formátování hodnot jsou oddělené od UI a efektové vrstvy.</p>
            <code>src/game/logic/</code>
          </div>

          <div class="code-modal__card">
            <h3>AUTO / TURBO</h3>
            <p>AUTO spouští další spiny automaticky. TURBO zrychluje spin a zastavování válců bez změny výsledku hry.</p>
            <code>frontend state / UX logic</code>
          </div>

          <div class="code-modal__card">
            <h3>Reel strip animace</h3>
            <p>Během spinu se každý sloupec vykreslí jako svislý pás symbolů a zastavuje se postupně zleva doprava.</p>
            <code>DOM / CSS animation</code>
          </div>

          <div class="code-modal__card">
            <h3>Canvas-ready přístup</h3>
            <p>PixiJS je přidaný bezpečně jako efektová vrstva. Další krok může být postupný převod válců do canvasu.</p>
            <code>PixiJS foundation</code>
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