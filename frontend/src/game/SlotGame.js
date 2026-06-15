import {
  INITIAL_CREDITS,
  DEFAULT_BET,
  MIN_BET,
  MAX_BET,
  SPIN_DURATION,
  DEMO_SYMBOLS,
} from "./gameConfig.js";

import {
  createRandomGrid,
  createDemoFinalGrid,
} from "./logic/createRandomGrid.js";
import { calculateWin } from "./logic/winCalculator.js";
import { formatNumber } from "./logic/formatNumber.js";

import { requestBackendSpin } from "../api/gameApi.js";

const USE_BACKEND_SPIN = true;

const REEL_STOP_DELAY = 320;
const REEL_STOP_BOUNCE_TIME = 420;
const STRIP_SYMBOL_COUNT = 18;

export class SlotGame {
  constructor(rootElement) {
    this.rootElement = rootElement;

    this.state = {
      credits: INITIAL_CREDITS,
      bet: DEFAULT_BET,
      win: 0,
      isSpinning: false,
      grid: [],
      winningResult: null,
      status: "Připraveno ke hře. Výhra se počítá na prostřední linii.",
    };

    this.reelTimers = [];
    this.elements = {};
  }

  mount() {
    this.state.grid = createRandomGrid(DEMO_SYMBOLS);
    this.renderShell();
    this.cacheElements();
    this.bindEvents();
    this.renderGrid(this.state.grid);
    this.updateUi();
  }

  renderShell() {
    this.rootElement.innerHTML = `
      <div class="slot-game slot-game--premium">
        <div class="slot-game__frame">
          <div class="slot-game__top">
            <div class="slot-game__mode">DEMO REŽIM</div>
            <div class="slot-game__title">
              <span class="slot-game__title-mark">✦</span>
              <span>CAREAI SLOT</span>
              <span class="slot-game__title-mark">✦</span>
            </div>
          </div>

          <div class="slot-game__premium-bar">
            <div class="slot-game__info-panel slot-game__info-panel--credits">
              <span class="slot-game__info-label">KREDITY</span>
              <strong data-credits>0</strong>
            </div>

            <div class="slot-game__premium-brand">
              <span class="slot-game__premium-crown">♛</span>
              <span class="slot-game__premium-name">CAREAI</span>
            </div>

            <div class="slot-game__bet-box">
              <span class="slot-game__info-label">SÁZKA</span>
              <div class="slot-game__bet-controls">
                <button type="button" class="slot-game__small-btn" data-action="decrease-bet">−</button>
                <strong data-bet>0</strong>
                <button type="button" class="slot-game__small-btn" data-action="increase-bet">+</button>
              </div>
            </div>
          </div>

          <div class="slot-game__machine">
            <div class="slot-game__lines slot-game__lines--left">
              <span>25</span>
              <small>LINES</small>
            </div>

            <div class="slot-game__reels-wrap">
              <button type="button" class="slot-game__side-arrow slot-game__side-arrow--left" aria-label="Dekorativní levá šipka">
                ‹
              </button>

              <div class="slot-game__reels" data-reels></div>

              <button type="button" class="slot-game__side-arrow slot-game__side-arrow--right" aria-label="Dekorativní pravá šipka">
                ›
              </button>
            </div>

            <div class="slot-game__lines slot-game__lines--right">
              <span>25</span>
              <small>LINES</small>
            </div>
          </div>

          <div class="slot-game__premium-controls">
            <button type="button" class="slot-game__feature-btn" aria-label="Dekorativní Turbo">
              ⚡ TURBO
            </button>

            <button type="button" class="slot-game__feature-btn" aria-label="Dekorativní Auto">
              ↻ AUTO
            </button>

            <button type="button" class="slot-game__spin-btn" data-action="spin" aria-label="Spustit spin">
              <span class="slot-game__spin-icon">↻</span>
              <span class="slot-game__spin-text">SPIN</span>
            </button>

            <button type="button" class="slot-game__max-btn" data-action="max-bet">
              MAX BET
            </button>

            <div class="slot-game__info-panel slot-game__info-panel--win">
              <span class="slot-game__info-label">VÝHRA</span>
              <strong data-win>0</strong>
            </div>
          </div>

          <div class="slot-game__status" data-status>
            Připraveno ke hře.
          </div>
        </div>
      </div>
    `;
  }

  cacheElements() {
    this.elements.reels = this.rootElement.querySelector("[data-reels]");
    this.elements.credits = this.rootElement.querySelector("[data-credits]");
    this.elements.bet = this.rootElement.querySelector("[data-bet]");
    this.elements.win = this.rootElement.querySelector("[data-win]");
    this.elements.status = this.rootElement.querySelector("[data-status]");
    this.elements.spinButton = this.rootElement.querySelector(
      '[data-action="spin"]',
    );
    this.elements.maxBetButton = this.rootElement.querySelector(
      '[data-action="max-bet"]',
    );
    this.elements.decreaseBetButton = this.rootElement.querySelector(
      '[data-action="decrease-bet"]',
    );
    this.elements.increaseBetButton = this.rootElement.querySelector(
      '[data-action="increase-bet"]',
    );
    this.elements.frame = this.rootElement.querySelector(".slot-game__frame");
  }

  bindEvents() {
    this.elements.spinButton.addEventListener("click", () => this.spin());
    this.elements.maxBetButton.addEventListener("click", () =>
      this.setMaxBet(),
    );
    this.elements.decreaseBetButton.addEventListener("click", () =>
      this.changeBet(-10),
    );
    this.elements.increaseBetButton.addEventListener("click", () =>
      this.changeBet(10),
    );
  }

  renderGrid(grid, options = {}) {
    const { suppressWinHighlight = false } = options;

    this.elements.reels.innerHTML = "";

    grid.forEach((reel, reelIndex) => {
      const reelElement = document.createElement("div");
      reelElement.className = "slot-game__reel";
      reelElement.dataset.reelIndex = String(reelIndex);
      reelElement.style.setProperty("--reel-delay", `${reelIndex * 70}ms`);

      this.renderReelSymbols(reelElement, reel, reelIndex, {
        suppressWinHighlight,
      });

      this.elements.reels.append(reelElement);
    });
  }

  renderReelSymbols(reelElement, reel, reelIndex, options = {}) {
    const { suppressWinHighlight = false } = options;
    const winningIndexes = suppressWinHighlight
      ? []
      : this.getWinningMiddleIndexes();

    reelElement.innerHTML = "";

    reel.forEach((symbol, rowIndex) => {
      const symbolElement = this.createSymbolElement(symbol);

      const isWinningSymbol =
        rowIndex === 1 && winningIndexes.includes(reelIndex);

      if (isWinningSymbol) {
        symbolElement.classList.add("slot-game__symbol--win");
      }

      reelElement.append(symbolElement);
    });
  }

  createSymbolElement(symbol) {
    const symbolElement = document.createElement("div");

    symbolElement.className = ["slot-game__symbol", symbol.className]
      .filter(Boolean)
      .join(" ");

    symbolElement.textContent = symbol.label;

    return symbolElement;
  }

  renderSingleReel(reelIndex, reel, options = {}) {
    const reelElement = this.elements.reels.querySelector(
      `[data-reel-index="${reelIndex}"]`,
    );

    if (!reelElement) return;

    reelElement.className = "slot-game__reel";
    reelElement.style.setProperty("--reel-delay", `${reelIndex * 70}ms`);

    this.renderReelSymbols(reelElement, reel, reelIndex, options);
  }

  renderReelStrip(reelElement, reelIndex) {
    reelElement.innerHTML = "";
    reelElement.classList.add("slot-game__reel--spinning");

    const stripElement = document.createElement("div");
    stripElement.className = "slot-game__reel-strip";
    stripElement.style.setProperty("--strip-speed", `${0.62 + reelIndex * 0.08}s`);

    for (let index = 0; index < STRIP_SYMBOL_COUNT; index += 1) {
      const randomSymbol =
        DEMO_SYMBOLS[Math.floor(Math.random() * DEMO_SYMBOLS.length)];

      stripElement.append(this.createSymbolElement(randomSymbol));
    }

    reelElement.append(stripElement);
  }

  getWinningMiddleIndexes() {
    const result = this.state.winningResult;

    if (!result || result.payout <= 0 || result.winningStreak < 3) {
      return [];
    }

    return Array.from({ length: result.winningStreak }, (_, index) => index);
  }

  updateUi() {
    this.elements.credits.textContent = formatNumber(this.state.credits);
    this.elements.bet.textContent = formatNumber(this.state.bet);
    this.elements.win.textContent = formatNumber(this.state.win);
    this.elements.status.textContent = this.state.status;

    this.elements.spinButton.disabled = this.state.isSpinning;
    this.elements.maxBetButton.disabled = this.state.isSpinning;
    this.elements.decreaseBetButton.disabled = this.state.isSpinning;
    this.elements.increaseBetButton.disabled = this.state.isSpinning;

    this.elements.frame.classList.toggle("is-spinning", this.state.isSpinning);
    this.elements.frame.classList.toggle(
      "has-win",
      Boolean(this.state.winningResult && this.state.winningResult.payout > 0),
    );
  }

  changeBet(step) {
    if (this.state.isSpinning) return;

    const nextBet = this.state.bet + step;
    this.state.bet = Math.max(MIN_BET, Math.min(MAX_BET, nextBet));
    this.state.status = `Sázka nastavena na ${formatNumber(this.state.bet)}.`;
    this.updateUi();
  }

  setMaxBet() {
    if (this.state.isSpinning) return;

    this.state.bet = MAX_BET;
    this.state.status = `Maximální sázka nastavena na ${formatNumber(MAX_BET)}.`;
    this.updateUi();
  }

  async getFinalSpinGrid() {
    if (!USE_BACKEND_SPIN) {
      const localGrid = createDemoFinalGrid(DEMO_SYMBOLS, 0.28);
      const localWinResult = calculateWin(localGrid, this.state.bet);

      return {
        grid: localGrid,
        winResult: localWinResult,
        source: "frontend",
      };
    }

    try {
      const backendResponse = await requestBackendSpin({
        bet: this.state.bet,
      });

      return {
        grid: backendResponse.grid,
        winResult: backendResponse.result,
        source: "backend",
      };
    } catch (error) {
      console.warn("Backend spin failed, using local frontend spin.", error);

      const fallbackGrid = createDemoFinalGrid(DEMO_SYMBOLS, 0.28);
      const fallbackWinResult = calculateWin(fallbackGrid, this.state.bet);

      return {
        grid: fallbackGrid,
        winResult: fallbackWinResult,
        source: "frontend fallback",
      };
    }
  }

  getResultSourceLabel(source) {
    if (source === "backend") {
      return "backend API";
    }

    return "lokální demo";
  }

  clearReelTimers() {
    this.reelTimers.forEach((timerId) => {
      window.clearTimeout(timerId);
    });

    this.reelTimers = [];
  }

  sleep(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  startReelAnimation() {
    this.clearReelTimers();

    const initialGrid = createRandomGrid(DEMO_SYMBOLS);
    this.renderGrid(initialGrid, {
      suppressWinHighlight: true,
    });

    const reelElements = Array.from(
      this.elements.reels.querySelectorAll(".slot-game__reel"),
    );

    reelElements.forEach((reelElement, reelIndex) => {
      this.renderReelStrip(reelElement, reelIndex);
    });
  }

  async stopReelsOneByOne(finalGrid) {
    const reelElements = Array.from(
      this.elements.reels.querySelectorAll(".slot-game__reel"),
    );

    for (let reelIndex = 0; reelIndex < finalGrid.length; reelIndex += 1) {
      await this.sleep(REEL_STOP_DELAY);

      const reelElement = reelElements[reelIndex];

      if (!reelElement) continue;

      reelElement.classList.remove("slot-game__reel--spinning");
      reelElement.classList.add("slot-game__reel--stopping");

      this.renderReelSymbols(reelElement, finalGrid[reelIndex], reelIndex, {
        suppressWinHighlight: true,
      });

      const timerId = window.setTimeout(() => {
        reelElement.classList.remove("slot-game__reel--stopping");
      }, REEL_STOP_BOUNCE_TIME);

      this.reelTimers.push(timerId);
    }

    this.clearReelTimers();
  }

  async spin() {
    if (this.state.isSpinning) return;

    if (this.state.credits < this.state.bet) {
      this.state.status = "Nedostatek kreditů. Sniž sázku nebo obnov hru.";
      this.updateUi();
      return;
    }

    this.state.isSpinning = true;
    this.state.win = 0;
    this.state.winningResult = null;
    this.state.credits -= this.state.bet;
    this.state.status = USE_BACKEND_SPIN
      ? "Točíme... výsledek připravuje herní API."
      : "Točíme...";
    this.updateUi();

    this.startReelAnimation();

    const spinResult = await Promise.all([
      this.getFinalSpinGrid(),
      this.sleep(SPIN_DURATION),
    ]).then(([result]) => result);

    const { grid: finalGrid, winResult, source } = spinResult;

    await this.stopReelsOneByOne(finalGrid);

    const resultSourceLabel = this.getResultSourceLabel(source);

    this.state.grid = finalGrid;
    this.state.win = winResult.payout;
    this.state.credits += winResult.payout;
    this.state.isSpinning = false;
    this.state.winningResult = winResult;

    this.renderGrid(finalGrid);

    if (winResult.payout > 0) {
      this.state.status = `Výhra ${formatNumber(winResult.payout)} kreditů. Symbol ${winResult.winningSymbol.label} × ${winResult.winningStreak} na prostřední linii. Výsledek připravilo ${resultSourceLabel}.`;
    } else {
      this.state.status = `Tentokrát bez výhry. Zkus další spin. Výsledek připravilo ${resultSourceLabel}.`;
    }

    this.updateUi();
  }
}