import { SlotGame } from "../game/SlotGame.js";

export function createDemoModal() {
  const element = document.createElement("div");
  element.className = "demo-modal";

  element.innerHTML = `
    <div class="demo-modal__backdrop" data-close="true"></div>

    <div class="demo-modal__panel" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
      <button class="demo-modal__close" type="button" aria-label="Zavřít demo">
        ✕
      </button>

      <div class="demo-modal__content">
        <h2 id="demo-modal-title" class="sr-only">CareAI Slot Demo</h2>
        <div class="demo-modal__game" data-slot-root></div>
      </div>
    </div>
  `;

  const backdrop = element.querySelector(".demo-modal__backdrop");
  const closeButton = element.querySelector(".demo-modal__close");
  const slotRoot = element.querySelector("[data-slot-root]");

  const game = new SlotGame(slotRoot);
  let mounted = false;

  const close = () => {
    element.classList.remove("is-open");
    document.body.classList.remove("body--locked");
  };

  const open = () => {
    if (!mounted) {
      game.mount();
      mounted = true;
    }

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