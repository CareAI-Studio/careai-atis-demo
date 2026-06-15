# CareAI Slot Demo

Portfolio projekt vytvořený jako ukázka pro pozici **Frontend Game Developer / PixiJS Developer**.

Projekt představuje jednoduchý interaktivní herní prototyp ve stylu slot hry. Cílem není vytvořit reálnou hazardní hru, ale ukázat práci s frontendovým UI, herní logikou, animací, stavem aplikace a čistou strukturou projektu.

## Co demo ukazuje

- responzivní frontend layout
- hlavní prezentační stránku
- modal s herním automatem
- jednoduchou herní logiku
- kredity, sázku, výhru a spin
- zvýraznění výherní linie
- oddělení UI od herní logiky
- připravenost na další rozšíření přes PixiJS, GSAP a backend

## Použitý stack

- Vite
- JavaScript
- HTML / CSS
- připraveno pro PixiJS
- připraveno pro GSAP
- Git

## Struktura projektu

```txt
frontend/
├─ src/
│  ├─ components/
│  │  ├─ Header.js
│  │  ├─ HeroSection.js
│  │  ├─ DemoModal.js
│  │  └─ CodeInfoModal.js
│  ├─ game/
│  │  ├─ SlotGame.js
│  │  ├─ gameConfig.js
│  │  └─ logic/
│  │     ├─ createRandomGrid.js
│  │     ├─ winCalculator.js
│  │     └─ formatNumber.js
│  ├─ styles/
│  │  └─ main.css
│  └─ main.js
└─ index.html