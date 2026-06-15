import "./styles/main.css";
import { createHeader } from "./components/Header.js";
import { createHeroSection } from "./components/HeroSection.js";
import { createDemoModal } from "./components/DemoModal.js";

const app = document.querySelector("#app");

const pageShell = document.createElement("div");
pageShell.className = "page-shell";

const header = createHeader();
const heroSection = createHeroSection();
const demoModal = createDemoModal();

const footer = document.createElement("footer");
footer.className = "page-footer";
footer.innerHTML = `
  <div class="page-footer__inner">
    <span class="page-footer__icon">✦</span>
    <span>Portfolio koncept pro pohovor – Frontend Game Developer / PixiJS Developer</span>
  </div>
`;

const openDemoButton = heroSection.querySelector('[data-action="open-demo"]');
const showCodeButton = heroSection.querySelector('[data-action="show-code"]');

openDemoButton.addEventListener("click", () => {
  demoModal.open();
});

showCodeButton.addEventListener("click", () => {
  window.alert(
    "Sem později napojíme GitHub nebo README projektu. Teď stavíme hlavní UI a demo."
  );
});

pageShell.append(header, heroSection, footer);
app.append(pageShell, demoModal.element);