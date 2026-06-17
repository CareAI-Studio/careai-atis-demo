# CareAI Slot Demo

Portfolio projekt vytvořený jako ukázka pro pozici **Frontend Game Developer / PixiJS Developer**.

Projekt představuje jednoduchý interaktivní herní prototyp ve stylu slot hry. Cílem není vytvořit reálnou hazardní hru, ale ukázat práci s frontendovým UI, herní logikou, animací, stavem aplikace, komunikací s backendem, základní integrací PixiJS, postupným canvas refaktorem a čistou strukturou projektu.

Demo je postavené tak, aby šlo jednoduše spustit lokálně, ukázat u pohovoru a dál rozšiřovat například přes PixiJS canvas, GSAP animace, asset-based symboly nebo pokročilejší backendovou logiku.

## Co demo ukazuje

* responzivní frontend layout
* hlavní prezentační stránku
* modal s herním automatem
* herní stav: kredity, sázka, výhra a spin
* AUTO režim pro automatické spiny
* TURBO režim pro rychlejší spin a rychlejší zastavení válců
* 25 výherních linií
* výpočet výhry přes payline systém
* vyvážený line-bet výpočet výher přes 25 aktivních linií
* paytable modal s vysvětlením výpočtu výher
* zvýraznění výherních symbolů podle konkrétní vítězné linie
* non-paying / blank symboly pro vyvážení četnosti výher
* DOM reel strip animaci válců jako základ/fallback
* postupné zastavení válců zleva doprava
* zvukové efekty generované přes Web Audio API
* přepínač SOUND / MUTED s uložením nastavení do localStorage
* delší pauzu po výhře v AUTO režimu, aby byla výhra čitelná
* Screen Wake Lock API pro zabránění zamknutí telefonu během hraní
* PixiJS canvas efektovou vrstvu
* ambient glow efekt
* particle efekty v pozadí
* PixiJS win efekt při výhře
* CSS screen shake / win impact feedback
* PixiJS renderer válců jako samostatný canvas prototyp
* plynulé PixiJS točení válců
* postupné PixiJS zastavování válců zleva doprava
* vektorově kreslené PixiJS symboly
* asset-based PNG symboly
* PixiJS texture loading systém
* vlastní grafické assety pro symboly
* fallback vykreslení při nenalezení assetu
* vizuální polish PixiJS reel rendereru
* oddělení UI od herní logiky
* oddělení vizuálních efektů od herních výpočtů
* oddělení PixiJS rendereru od backendového výsledku
* základní backend API v Node.js / Express
* propojení frontendu s backendem přes `POST /api/game/spin`
* fallback režim, kdy hra běží dál lokálně, pokud backend není dostupný
* připravenost na další rozšíření přes PixiJS, GSAP a backend


## Použitý stack

* Vite
* JavaScript
* HTML / CSS
* PixiJS
* Web Audio API
* Screen Wake Lock API
* Node.js
* Express
* Git
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
│  │  ├─ audio/
│  │  │  └─ soundManager.js
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
│  │  │     ├─ paylines.js
│  │  │     ├─ winCalculator.js
│  │  │     └─ formatNumber.js
│  │  ├─ styles/
│  │  │  └─ main.css
│  │  ├─ utils/
│  │  │  └─ wakeLockManager.js
│  │  ├─ pixi-effects.js
│  │  ├─ pixi-reels.js
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

Backend vrací:

* výslednou mřížku symbolů
* výherní výsledek
* výherní symbol
* počet stejných symbolů zleva
* vítěznou linii
* vítězné pozice v gridu
* seznam všech výherních linií
* počet aktivních linií
* line bet
* verzi paytable systému
* čas odpovědi

Frontend během spinu volá backend API. Pokud backend není dostupný, frontend zachytí chybu a automaticky použije lokální fallback výpočet, aby demo zůstalo funkční i bez spuštěného backendu.

## Herní mechaniky

### Spin

Hráč spustí spin tlačítkem `SPIN`. Z kreditů se odečte aktuální sázka, frontend zavolá backend API a během čekání spustí animaci válců.

Po dokončení spinu se zobrazí finální výsledek, aktualizují se kredity a případně se zvýrazní výherní symboly.

Pokud spin skončí výhrou, spustí se také vizuální win feedback složený z PixiJS efektů, CSS animace a zvukového efektu.

### AUTO režim

Tlačítko `AUTO` funguje jako přepínač. Pokud je zapnuté, hra po dokončení jednoho spinu automaticky spustí další spin.

AUTO režim se vypne:

* dalším kliknutím na AUTO
* při nedostatku kreditů
* při ručním spuštění spinu

Pokud v AUTO režimu padne výhra, další spin se spustí až po krátké pauze. Díky tomu má hráč čas výhru přečíst a všimnout si výherních symbolů.

### TURBO režim

Tlačítko `TURBO` funguje jako přepínač. Pokud je zapnuté, spin a zastavování válců běží rychleji.

TURBO režim je čistě frontendová herní/UX mechanika. Nemění výsledek hry, pouze rychlost animace a čekání na dokončení spinu.

Při kombinaci `TURBO + AUTO` zůstává zachovaná stejná pauza po výhře jako v běžném AUTO režimu, aby byla výhra pořád čitelná.

### SOUND / MUTED

Demo obsahuje zvukové efekty generované přes Web Audio API. Nejsou potřeba žádné externí audio soubory.

Zvuky jsou použité pro:

* kliknutí tlačítek
* start spinu
* zastavení válců
* menší výhru
* větší výhru
* nedostatek kreditů

Tlačítko `SOUND / MUTED` umožňuje zvuky vypnout nebo zapnout. Nastavení se ukládá do `localStorage`.

### 25 LINES

Demo obsahuje systém 25 výherních linií. Výhra se nepočítá jen na prostřední řadě, ale přes připravené payline patterny.

Každá linie definuje, kterou řadu má v jednotlivých válcích sledovat. Výpočet zkontroluje všechny linie a vyhodnotí výherní kombinace zleva doprava.

Pokud padne více výherních linií najednou, celková výhra se sečte.

### Paytable a výpočet výhry

Součástí automatu je tlačítko `PAYTABLE`, které otevře výherní tabulku přímo v herním modalu.

Paytable ukazuje hodnoty symbolů pro:

* 3 stejné symboly
* 4 stejné symboly
* 5 stejných symbolů

Výpočet je postavený na line-bet systému:

```txt
line bet = celková sázka / 25 linií
výhra na linii = line bet × hodnota symbolu
celková výhra = součet všech výherních linií
```

Díky tomu nejsou výhry přepálené ani při 25 aktivních liniích a demo působí uvěřitelněji.

### Blank symboly

Kvůli 25 aktivním liniím by čistě náhodný grid dával výhry příliš často. Proto demo obsahuje i non-paying / blank symboly, které snižují četnost výher a dělají demo uvěřitelnější.

Blank symbol nemá výplatní hodnotu a nepočítá se jako výherní symbol.

### Screen Wake Lock

Na podporovaných mobilních prohlížečích používá demo Screen Wake Lock API.

Cílem je, aby se telefon během hraní nebo běžícího AUTO režimu nezamykal. Wake lock se aktivuje po uživatelské interakci se hrou a při návratu stránky do popředí se pokusí znovu obnovit.

Pokud prohlížeč Wake Lock API nepodporuje, demo pokračuje dál bez chyby.

## Animace válců

Projekt má dvě vrstvy vykreslení válců.

První vrstva je původní DOM/CSS reel strip animace. Ta zůstává v projektu jako stabilní základ a fallback. Při spinu se každý sloupec vykreslí jako svislý pás symbolů a zastavuje se postupně zleva doprava.

Druhá vrstva je PixiJS reel renderer v souboru `frontend/src/pixi-reels.js`. Ten postupně přebírá vizuální odpovědnost za samotné válce. Umí vykreslit slot grid do canvasu, spustit plynulé točení válců, zastavovat válce zleva doprava a zobrazit finální výsledek podle dat z backendu nebo lokálního fallbacku.

Výsledek hry stále neurčuje animace. Výsledek připraví backend API nebo fallback výpočet a vizuální vrstva ho pouze zobrazí. Díky tomu zůstává oddělená herní logika od vykreslení.

## PixiJS integrace

Projekt obsahuje dvě oddělené PixiJS části.

První část je samostatná efektová canvas vrstva v souboru `frontend/src/pixi-effects.js`. Ta doplňuje DOM/CSS slot o ambient glow, částice v pozadí, win flash, burst efekt a další vizuální feedback při výhře.

Druhá část je PixiJS renderer válců v souboru `frontend/src/pixi-reels.js`. Ten slouží jako prototyp postupného převodu samotných slot válců z DOM/CSS do canvasu. Aktuální verze už umí vykreslit grid symbolů, spustit plynulé točení válců, zastavovat jednotlivé válce zleva doprava a zobrazit finální výsledek podle dat z backendu nebo fallback výpočtu.

PixiJS renderer válců je navržený tak, aby pořád respektoval existující herní logiku. Výsledek hry nepočítá PixiJS, ale backend API nebo lokální fallback. PixiJS řeší pouze vizuální vykreslení, animaci a polish.

Soubor `frontend/src/pixi-effects.js` řeší:

* inicializaci PixiJS efektové aplikace
* vložení transparentního canvasu do slot frame
* ambient glow efekt
* jemné částice v pozadí
* win flash efekt
* kruhový burst při výhře
* spark / particle efekt při výhře
* resize canvasu podle velikosti slotu
* bezpečné oddělení efektové vrstvy od klikatelného UI

Soubor `frontend/src/pixi-reels.js` řeší:

* inicializaci PixiJS rendereru válců
* vykreslení slot gridu do canvasu
* plynulé točení válců
* postupné zastavování válců zleva doprava
* napojení finálního výsledku na backend/fallback grid
* vektorově kreslené symboly
* blank symboly
* výherní zvýraznění symbolů
* glass overlay přes válce
* jemný settle/bounce efekt při zastavení válce
* resize canvasu podle velikosti reel containeru

DOM/CSS vrstva zatím zůstává jako základní fallback a současně jako jistota, že herní logika, tlačítka, AUTO režim, TURBO režim, backend komunikace a výpočet výher zůstávají stabilní i při postupném přechodu na PixiJS.

Tento přístup ukazuje bezpečný refaktor: místo jednorázového přepsání celé hry do canvasu se nejdřív vytvořila paralelní PixiJS vrstva, která postupně přebírá vizuální odpovědnost.

## Aktuální stav

Aktuální verze obsahuje:

* hotovou homepage
* funkční tlačítko „Spustit demo“
* modal s automatem
* premium slot layout
* funkční spin
* kredity, sázku a výhru
* funkční AUTO režim
* funkční TURBO režim
* 25 výherních linií
* vyvážený line-bet výpočet výher
* výpočty výher na různých liniích
* zvýraznění výherních symbolů podle vítězné linie
* blank symboly pro vyvážení výher
* DOM reel strip animaci jako základ/fallback
* postupné zastavování válců
* plynulejší reel strip animaci
* zvukové efekty pro tlačítka, spin, zastavení válců, výhru a nedostatek kreditů
* přepínač SOUND / MUTED
* paytable modal dostupný přímo z horní části automatu
* vysvětlení výpočtu výher: line bet = sázka / 25 linií
* vyváženější paytable systém napříč frontendem i backendem
* delší pauza po výhře v AUTO režimu
* Screen Wake Lock API, aby se telefon během hraní nezamykal
* PixiJS canvas efektovou vrstvu
* ambient glow efekt
* particle efekty
* PixiJS win efekt
* CSS win impact / screen shake
* PixiJS renderer válců v souboru `frontend/src/pixi-reels.js`
* plynulé PixiJS točení válců
* PixiJS zastavování válců zleva doprava
* vektorově kreslené PixiJS symboly (fallback)
* asset-based PNG symboly
* AI symbol
* Robot symbol
* Lightning symbol
* Diamond symbol
* Heart symbol
* Chat symbol
* Star symbol
* PixiJS texture cache
* vlastní asset loading pipeline
* jemný glass overlay přes PixiJS válce
* settle/bounce efekt při zastavení válce
* vizuální polish PixiJS symbolů a reel rendereru
* panel „Zobrazit kód“ s vysvětlením architektury
* backend API endpoint `GET /api/health`
* backend API endpoint `POST /api/game/spin`
* frontend při spinu volá backend
* pokud backend není dostupný, frontend použije lokální fallback výpočet
* veřejné demo připravené pro prezentaci přes doménu `atis.careai.cz`

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
* `1.1.3` – premium slot layout
* `1.1.4` – premium layout cleanup / hotové DOM-CSS premium demo
* `1.1.5` – AUTO režim a TURBO režim
* `1.1.6` – 25 payline win system a vyvážení výher pomocí blank symbolů
* `1.2.0` – PixiJS foundation efektová canvas vrstva
* `1.2.1` – PixiJS win polish, particle efekty a CSS win impact
* `1.2.2` – README update for PixiJS effects
* `1.2.3` – interview polish / code info modal
* `1.2.4` – realistic slot reel polish
* `1.3.0` – PixiJS reel renderer prototype
* `1.3.1` – PixiJS smooth reel spin prototype
* `1.3.2` – PixiJS left-to-right reel stop
* `1.3.3` – PixiJS symbol visual polish
* `1.3.4` – PixiJS reel visual polish
* `1.3.8` – mobile public polish a veřejné demo přes atis.careai.cz
* `1.4.0` – zvukové efekty, SOUND/MUTED a úprava premium control layoutu
* `1.4.1` – rebalance paytable systému, sjednocení výpočtu výher mezi frontendem a backendem
* `1.4.2` – paytable modal, delší AUTO pauza po výhře a Screen Wake Lock pro mobilní hraní
* `1.4.3` – asset-based symbol system, PNG symboly, texture cache a PixiJS asset loader

## Další plán

Další možné kroky:

* dokončit přechod samotných válců z DOM/CSS na PixiJS jako hlavní renderer
* zachovat DOM vrstvu pouze jako fallback
* zvýraznit výherní symboly a výherní linie přímo přes PixiJS overlay
* přidat silnější efekt pro vyšší výhry
* přidat pokročilejší easing při zastavování jednotlivých válců
* přidat GSAP animace pro UI přechody
* připravit jednoduché nasazení na careai.cz / KAI.cz
* přidat odkaz na GitHub do panelu „Zobrazit kód“
* doplnit produkční konfiguraci pro frontend a backend

## Jak bych projekt popsal u pohovoru

Nejdřív jsem vytvořil jednoduchý frontendový prototyp slot hry ve Vite. Potom jsem oddělil herní logiku, výpočet výhry a formátování hodnot do samostatných modulů. Následně jsem přidal backend v Node.js / Express a napojil spin na endpoint `POST /api/game/spin`.

Frontend zároveň obsahuje fallback, takže když backend neběží, hra se nezastaví a použije lokální výpočet. V další fázi jsem zlepšil animaci válců tak, že během spinu nevykresluji jen statické symboly, ale samostatný svislý reel strip, který se postupně zastavuje po sloupcích.

Potom jsem doplnil herní režimy AUTO a TURBO a rozšířil výpočet výher z jedné prostřední linie na 25 payline systém. Demo tak ukazuje nejen UI a animaci, ale i základní herní mechaniky, stav aplikace, backend komunikaci a připravenost na další rozšiřování.

V další fázi jsem přidal PixiJS jako samostatnou canvas efektovou vrstvu. Nezasahovala do hotové DOM/CSS logiky automatu, ale doplnila ji o ambient glow, částice a výherní efekty. Díky tomu bylo možné začít s PixiJS bezpečně, bez rizika rozbití hotové hry.

Následně jsem začal převádět samotné válce do PixiJS. Neudělal jsem to jako riskantní jednorázový přepis, ale jako samostatný renderer vedle existující DOM vrstvy. PixiJS renderer dnes umí vykreslit grid, animovat plynulé točení válců, zastavit je zleva doprava a zobrazit finální výsledek řízený backendem. Díky tomu zůstává herní logika oddělená od vizuální vrstvy a projekt je připravený na další rozšíření například o asset-based symboly, pokročilejší easing nebo GSAP animace.

Nakonec jsem doplnil zvuky přes Web Audio API, přepínač SOUND/MUTED, paytable modal s vysvětlením výpočtu výher a Screen Wake Lock API pro lepší mobilní testování. Demo tak není jen statická ukázka, ale plně klikatelné portfolio demo, které se dá ukázat přímo v prohlížeči na desktopu i telefonu.

## Poznámka

Projekt vzniká jako portfolio ukázka. Důraz je kladený na přemýšlení nad strukturou, rozdělení odpovědností v kódu, schopnost rychle vytvořit funkční frontendový prototyp a připravit ho na backendové i canvasové rozšíření.

Výherní pravděpodobnost a výplatní poměry jsou nastavené pro demo režim tak, aby bylo během krátké prezentace dobře vidět, že spin, paylines, paytable, zvýraznění výher, AUTO, TURBO, zvuky, PixiJS efekty, PixiJS reel renderer a backend komunikace fungují.

Nejde o reálnou hazardní hru ani produkt určený k sázení. Jde o demonstrační technický prototyp pro portfolio.
