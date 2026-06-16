export function createHeader() {
  const GITHUB_PROJECT_URL = "https://github.com/CareAI-Studio/careai-atis-demo";
  const CONTACT_EMAIL = "info@careai.cz";
  const FACEBOOK_URL = "https://www.facebook.com/careai.cz";

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

        <a
          href="${GITHUB_PROJECT_URL}"
          class="site-nav__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Portfolio
        </a>

        <a href="#atis-demo" class="site-nav__link site-nav__link--pill">
          ATIS Demo
        </a>

        <div class="site-nav__dropdown">
          <button
            class="site-nav__link site-nav__dropdown-button"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Kontakt
          </button>

          <div class="site-nav__dropdown-menu" aria-label="Kontaktní odkazy">
            <a href="mailto:${CONTACT_EMAIL}" class="site-nav__dropdown-link">
              E-mail
              <span>${CONTACT_EMAIL}</span>
            </a>

            <a
              href="${FACEBOOK_URL}"
              class="site-nav__dropdown-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
              <span>CareAI.cz</span>
            </a>
          </div>
        </div>

        <button class="site-nav__theme" type="button" aria-label="Přepnout motiv">
          ☼
        </button>
      </nav>
    </div>
  `;

  return header;
}