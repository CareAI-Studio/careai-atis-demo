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
          Projekt je rozdělený na samostatné UI komponenty, herní konfiguraci a čistou logiku výpočtu výsledků.
        </p>

        <div class="code-modal__grid">
          <div class="code-modal__card">
            <h3>Komponenty</h3>
            <p>Header, hero sekce, demo modal a samostatný informační panel.</p>
            <code>src/components/</code>
          </div>

          <div class="code-modal__card">
            <h3>Herní UI</h3>
            <p>SlotGame řeší vykreslení automatu, stav hry, sázky, kredity a interakce.</p>
            <code>src/game/SlotGame.js</code>
          </div>

          <div class="code-modal__card">
            <h3>Herní logika</h3>
            <p>Výpočet výhry, generování symbolů a formátování jsou oddělené od UI.</p>
            <code>src/game/logic/</code>
          </div>

          <div class="code-modal__card">
            <h3>Další rozšíření</h3>
            <p>Projekt je připravený na PixiJS canvas, backend, statistiky nebo leaderboard.</p>
            <code>Node.js / Express později</code>
          </div>
        </div>

        <div class="code-modal__footer">
          <span>Stack:</span>
          <strong>Vite</strong>
          <strong>JavaScript</strong>
          <strong>PixiJS ready</strong>
          <strong>GSAP ready</strong>
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