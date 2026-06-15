export function createHeader() {
  const header = document.createElement("header");
  header.className = "site-header";

  header.innerHTML = `
    <div class="site-header__inner">
      <a href="#" class="brand" aria-label="CareAI.cz">
        <div class="brand__icon">AI</div>
        <div class="brand__text">
          <div class="brand__title">CareAI<span>.cz</span></div>
          <div class="brand__subtitle">by ATIS</div>
        </div>
      </a>

      <nav class="site-nav" aria-label="Hlavní navigace">
        <a href="#" class="site-nav__link site-nav__link--active">Domů</a>
        <a href="#" class="site-nav__link">Portfolio</a>
        <a href="#" class="site-nav__link site-nav__link--pill">ATIS Demo</a>
        <a href="#" class="site-nav__link">Kontakt</a>
        <button class="site-nav__theme" type="button" aria-label="Přepnout motiv">
          ☼
        </button>
      </nav>
    </div>
  `;

  return header;
}