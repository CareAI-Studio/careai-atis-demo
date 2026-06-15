# CareAI Slot Demo

Portfolio projekt vytvořený jako ukázka pro pozici **Frontend Game Developer / PixiJS Developer**.

Projekt představuje jednoduchý interaktivní herní prototyp ve stylu slot hry. Cílem není vytvořit reálnou hazardní hru, ale ukázat práci s frontendovým UI, herní logikou, animací, stavem aplikace, komunikací s backendem a čistou strukturou projektu.

Demo je postavené tak, aby šlo jednoduše spustit lokálně, ukázat u pohovoru a dál rozšiřovat například přes PixiJS canvas, GSAP animace, zvukové efekty nebo pokročilejší backendovou logiku.

## Co demo ukazuje

* responzivní frontend layout
* hlavní prezentační stránku
* modal s herním automatem
* jednoduchou herní logiku
* kredity, sázku, výhru a spin
* výpočet výhry na prostřední linii
* zvýraznění výherní linie
* DOM reel strip animaci válců
* postupné zastavení válců zleva doprava
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

Projekt má frontend i backend. Obě části lze spustit samostatně, nebo z kořene projektu najednou.

### Spuštění z kořene projektu

```bash
npm install
npm run dev
```

Frontend běží typicky na:

```txt
http://localhost:5173/
```

Backend běží typicky na:

```txt
http://localhost:3001/
```

Ověření backendu:

```txt
http://localhost:3001/api/health
```

### Samostatné spuštění frontendu

```bash
cd frontend
npm install
npm run dev
```

Frontend běží typicky na:

```txt
http://localhost:5173/
```

### Samostatné spuštění backendu

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

Frontend během spinu volá backend API. Pokud backend není dostupný, frontend zachytí chybu a automaticky použije lokální fallback výpočet, aby demo zůstalo funkční i bez spuštěného backendu.

## Animace válců

Aktuální verze obsahuje DOM animaci válců bez použití PixiJS.

Při spinu se ve frontendu nejdřív spustí samostatná animační vrstva. Každý sloupec se během točení vykreslí jako svislý pás symbolů, který se pohybuje nahoru. Výsledek ze serveru se nepoužije hned vizuálně, ale až při postupném zastavování válců.

Zastavení probíhá po jednotlivých sloupcích zleva doprava. Po dokončení animace se zobrazí finální výsledek, aktualizují se kredity a případně se zvýrazní výherní symboly na prostřední linii.

Tato část je záměrně řešená zatím přes HTML/CSS/JavaScript, aby bylo možné rychle vytvořit funkční prototyp. Další přirozený krok je převést vykreslení válců na PixiJS canvas.

## Aktuální stav

Aktuální verze obsahuje:

* hotovou homepage
* funkční tlačítko „Spustit demo“
* modal s automatem
* funkční spin
* kredity, sázku a výhru
* demo výherní režim
* zvýraznění výherních symbolů
* postupné zastavování válců
* plynulejší reel strip animaci
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
* `1.0` – stabilní demo verze s frontendem, backendem a fallbackem
* `1.1.1` – reel strip animace válců a postupné zastavování sloupců

## Další plán

Další možné kroky:

* převést vykreslení válců na PixiJS canvas
* přidat jemnější easing při zastavování jednotlivých válců
* přidat particle efekty při výhře
* přidat zvukové efekty
* přidat krátký win efekt pro vyšší výhry
* připravit jednoduché nasazení na careai.cz
* přidat odkaz na GitHub do panelu „Zobrazit kód“
* doplnit produkční konfiguraci pro frontend a backend

## Jak bych projekt popsal u pohovoru

Nejdřív jsem vytvořil jednoduchý frontendový prototyp slot hry ve Vite. Potom jsem oddělil herní logiku, výpočet výhry a formátování hodnot do samostatných modulů. Následně jsem přidal backend v Node.js / Express a napojil spin na endpoint `POST /api/game/spin`.

Frontend zároveň obsahuje fallback, takže když backend neběží, hra se nezastaví a použije lokální výpočet. V další fázi jsem zlepšil animaci válců tak, že během spinu nevykresluji jen statické symboly, ale samostatný svislý reel strip, který se postupně zastavuje po sloupcích.

Projekt zatím běží přes DOM/CSS/JavaScript, ale struktura je připravená na další krok: převést samotné vykreslení válců a efektů na PixiJS.

## Poznámka

Projekt vzniká jako portfolio ukázka. Důraz je kladený na přemýšlení nad strukturou, rozdělení odpovědností v kódu, schopnost rychle vytvořit funkční frontendový prototyp a připravit ho na backendové rozšíření.
