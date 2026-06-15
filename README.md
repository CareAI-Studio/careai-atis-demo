# CareAI Slot Demo

Portfolio projekt vytvořený jako ukázka pro pozici **Frontend Game Developer / PixiJS Developer**.

Projekt představuje jednoduchý interaktivní herní prototyp ve stylu slot hry. Cílem není vytvořit reálnou hazardní hru, ale ukázat práci s frontendovým UI, herní logikou, animací, stavem aplikace, komunikací s backendem a čistou strukturou projektu.

## Co demo ukazuje

* responzivní frontend layout
* hlavní prezentační stránku
* modal s herním automatem
* jednoduchou herní logiku
* kredity, sázku, výhru a spin
* zvýraznění výherní linie
* oddělení UI od herní logiky
* základní backend API v Node.js / Express
* propojení frontendu s backendem přes `POST /api/game/spin`
* fallback režim, kdy hra běží dál lokálně, pokud backend není dostupný
* připravenost na další rozšíření přes PixiJS, GSAP a backend

## Použitý stack

* Vite
* JavaScript
* HTML / CSS
* Node.js
* Express
* Git
* připraveno pro PixiJS
* připraveno pro GSAP

## Struktura projektu

```txt
careai-atis-demo/
├─ backend/
│  ├─ src/
│  │  ├─ server.js
│  │  ├─ controllers/
│  │  │  └─ game.controller.js
│  │  └─ routes/
│  │     ├─ health.routes.js
│  │     └─ game.routes.js
│  ├─ package.json
│  └─ .env.example
│
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  │  └─ gameApi.js
│  │  ├─ components/
│  │  │  ├─ Header.js
│  │  │  ├─ HeroSection.js
│  │  │  ├─ DemoModal.js
│  │  │  └─ CodeInfoModal.js
│  │  ├─ game/
│  │  │  ├─ SlotGame.js
│  │  │  ├─ gameConfig.js
│  │  │  └─ logic/
│  │  │     ├─ createRandomGrid.js
│  │  │     ├─ winCalculator.js
│  │  │     └─ formatNumber.js
│  │  ├─ styles/
│  │  │  └─ main.css
│  │  └─ main.js
│  ├─ index.html
│  └─ package.json
│
├─ README.md
└─ .gitignore
```

## Spuštění projektu

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend běží typicky na:

```txt
http://localhost:5173/
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend běží na:

```txt
http://localhost:3001/
```

Ověření backendu:

```txt
http://localhost:3001/api/health
```

## Backend API

### Health check

```txt
GET /api/health
```

Vrací základní informaci, že backend běží.

### Spin endpoint

```txt
POST /api/game/spin
```

Ukázkové tělo požadavku:

```json
{
  "bet": 100
}
```

Backend vrací výslednou mřížku symbolů, výherní výsledek, výherní symbol, počet symbolů v linii a čas odpovědi.

## Aktuální stav

Aktuální verze obsahuje:

* hotovou homepage
* funkční tlačítko „Spustit demo“
* modal s automatem
* funkční spin
* demo výherní režim
* zvýraznění výherních symbolů
* panel „Zobrazit kód“ s vysvětlením architektury
* backend API endpoint `GET /api/health`
* backend API endpoint `POST /api/game/spin`
* frontend při spinu volá backend
* pokud backend není dostupný, frontend použije lokální fallback výpočet

## Vývojové checkpointy

* `0.2` – základ layoutu a herní logika
* `0.3` – spin animace a zvýraznění výhry
* `0.4` – architektonický panel a demo režim
* `0.5` – README pro prezentaci projektu
* `0.6` – backend API foundation
* `0.7` – frontend spin napojený na backend API s fallbackem
* `0.8` – README a prezentační panel odpovídají backend integraci

## Další plán

Další možné kroky:

* převést vykreslení válců na PixiJS canvas
* přidat plynulejší animaci zastavování jednotlivých válců
* přidat zvukové efekty
* přidat particle efekty při výhře
* připravit jednoduché nasazení na careai.cz
* přidat odkaz na GitHub do panelu „Zobrazit kód“
* doplnit produkční konfiguraci pro frontend a backend

## Poznámka

Projekt vzniká jako portfolio ukázka. Důraz je kladený na přemýšlení nad strukturou, rozdělení odpovědností v kódu, schopnost rychle vytvořit funkční frontendový prototyp a připravit ho na backendové rozšíření.
