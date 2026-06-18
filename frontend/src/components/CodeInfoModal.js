export function createCodeInfoModal() {
  const element = document.createElement("div");
  element.className = "code-modal";

  let previouslyFocusedElement = null;

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
          25 výherních linií, vlastní PNG asset symboly, paytable, Web Audio API,
          Screen Wake Lock API, backend API v Node.js / Express, bezpečný frontend fallback
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
            <p>SlotGame řeší hlavní stav hry, kredity, sázku, výhru, spin, AUTO, TURBO, SOUND, paytable a napojení DOM i PixiJS rendereru.</p>
            <code>src/game/SlotGame.js</code>
          </div>

          <div class="code-modal__card">
            <h3>PixiJS reel renderer</h3>
            <p>Samostatný canvas renderer vykresluje válce, plynulé točení, zastavení zleva doprava, symboly, glass overlay a win highlight.</p>
            <code>src/pixi-reels.js</code>
          </div>

          <div class="code-modal__card">
            <h3>PixiJS efekty</h3>
            <p>Oddělená canvas vrstva přidává ambient glow, částice, win flash, burst efekt, jiskry, výherní linky a úrovně výherních efektů.</p>
            <code>src/pixi-effects.js</code>
          </div>

          <div class="code-modal__card">
            <h3>PNG asset symboly</h3>
            <p>Symboly automatu jsou vlastní PNG assety. PixiJS používá asset loading a texture cache, paytable používá stejné symboly jako válce.</p>
            <code>src/assets/symbols/</code>
          </div>

          <div class="code-modal__card">
            <h3>Paytable</h3>
            <p>Výherní tabulka vysvětluje 25 line-bet systém, hodnoty symbolů pro 3×, 4× a 5× shodu a funguje i v mobilním zobrazení.</p>
            <code>PAYTABLE UI + line bet</code>
          </div>

          <div class="code-modal__card">
            <h3>Win lines</h3>
            <p>Výherní symboly se zvýrazní podle konkrétní payline. PixiJS overlay vykreslí světelnou linku i pro různé tvary výherních linií.</p>
            <code>winningPositions + PixiJS overlay</code>
          </div>

          <div class="code-modal__card">
            <h3>Win level effects</h3>
            <p>3×, 4× a 5× výhry mají rozdílnou intenzitu efektů, částic, glow, flash, zvuků a u větší výhry i silnější impact feedback.</p>
            <code>winLevel 3 / 4 / 5</code>
          </div>

          <div class="code-modal__card">
            <h3>Web Audio API</h3>
            <p>Zvuky jsou generované přímo v prohlížeči bez externích audio souborů. Demo má zvuk tlačítek, spinu, zastavení válců, výhry a no-credit stavu.</p>
            <code>src/audio/soundManager.js</code>
          </div>

          <div class="code-modal__card">
            <h3>Screen Wake Lock</h3>
            <p>Na podporovaných mobilních prohlížečích demo brání zamknutí telefonu během hraní nebo AUTO režimu.</p>
            <code>src/utils/wakeLockManager.js</code>
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
            <p>Výhra se nepočítá jen na jedné prostřední linii. Demo používá 25 připravených payline patternů a line-bet výpočet.</p>
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
            <h3>Veřejné demo</h3>
            <p>Demo je dostupné přes veřejnou doménu a běží jako prezentovatelný portfolio projekt pro desktop i mobilní prohlížeč.</p>
            <code>atis.careai.cz</code>
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
          <strong>Web Audio API</strong>
          <strong>Wake Lock API</strong>
          <strong>PNG Assets</strong>
          <strong>25 Paylines</strong>
          <strong>Paytable</strong>
          <strong>Win Effects</strong>
          <strong>Backend API</strong>
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

    if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus({
        preventScroll: true,
      });
    }
  };

  const open = () => {
    previouslyFocusedElement = document.activeElement;

    element.classList.add("is-open");
    document.body.classList.add("body--locked");

    window.setTimeout(() => {
      closeButton?.focus?.({
        preventScroll: true,
      });
    }, 0);
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