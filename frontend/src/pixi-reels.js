import { Application, Container, Graphics, Text } from "pixi.js";

let pixiApp = null;
let reelsLayer = null;
let overlayLayer = null;
let resizeObserver = null;
let currentContainer = null;
let currentGrid = null;
let isInitialized = false;

const SYMBOL_STYLE_MAP = {
  AI: {
    fill: 0x60d7ff,
    glow: 0x60d7ff,
    accent: 0xffffff,
  },
  "⚡": {
    fill: 0xff9a3d,
    glow: 0xffc45c,
    accent: 0xff5a6e,
  },
  "⭐": {
    fill: 0xffd95e,
    glow: 0xffe77a,
    accent: 0xffffff,
  },
  "💎": {
    fill: 0x69a7ff,
    glow: 0x8fc4ff,
    accent: 0xffffff,
  },
  "🤖": {
    fill: 0xf0b7ff,
    glow: 0x78d8ff,
    accent: 0xff5bd6,
  },
  "☁": {
    fill: 0xe8e5ff,
    glow: 0xded9ff,
    accent: 0xffffff,
  },
  "♡": {
    fill: 0x5ff5ff,
    glow: 0x5ff5ff,
    accent: 0xffffff,
  },
};

function getSymbolLabel(symbol) {
  return symbol?.label || "";
}

function getSymbolStyle(symbol) {
  const label = getSymbolLabel(symbol);
  const isBlank =
    symbol?.className?.includes("blank") ||
    symbol?.payout === 0 ||
    label.trim() === "";

  if (isBlank) {
    return {
      fill: 0x10203f,
      glow: 0x28476f,
      accent: 0x23395c,
      isBlank: true,
    };
  }

  return (
    SYMBOL_STYLE_MAP[label] || {
      fill: 0x85e8ff,
      glow: 0x66d7ff,
      accent: 0xffffff,
    }
  );
}

function clearLayer(layer) {
  if (!layer) return;

  layer.removeChildren().forEach((child) => {
    child.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  });
}

function drawRoundedPanel(parent, x, y, width, height, radius, fill, stroke) {
  const panel = new Graphics();

  panel.roundRect(x, y, width, height, radius);
  panel.fill(fill);

  if (stroke) {
    panel.stroke(stroke);
  }

  parent.addChild(panel);

  return panel;
}

function createSymbolText(label, x, y, width, height, isBlank = false) {
  const text = new Text({
    text: label,
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: Math.max(24, Math.min(width, height) * 0.38),
      fontWeight: "900",
      fill: isBlank ? 0x405a82 : 0xffffff,
      align: "center",
      dropShadow: {
        color: 0x000000,
        blur: 8,
        distance: 3,
        alpha: 0.75,
      },
    },
  });

  text.anchor.set(0.5);
  text.x = x + width / 2;
  text.y = y + height / 2;

  return text;
}

function drawSymbolTile(parent, symbol, x, y, width, height, options = {}) {
  const { isWinning = false, isDimmed = false } = options;
  const symbolStyle = getSymbolStyle(symbol);
  const label = getSymbolLabel(symbol);

  const tile = new Container();
  tile.x = x;
  tile.y = y;
  tile.alpha = isDimmed ? 0.42 : 1;

  const base = new Graphics();

  base.roundRect(0, 0, width, height, 14);
  base.fill({
    color: symbolStyle.isBlank ? 0x071126 : 0x142856,
    alpha: symbolStyle.isBlank ? 0.72 : 0.92,
  });

  base.roundRect(4, 4, width - 8, height - 8, 12);
  base.stroke({
    width: 1,
    color: isWinning ? 0xffd76a : 0x2e6da8,
    alpha: isWinning ? 0.92 : 0.34,
  });

  tile.addChild(base);

  const innerGlow = new Graphics();
  innerGlow.ellipse(width * 0.5, height * 0.5, width * 0.42, height * 0.36);
  innerGlow.fill({
    color: isWinning ? 0xffd76a : symbolStyle.glow,
    alpha: isWinning ? 0.24 : symbolStyle.isBlank ? 0.06 : 0.14,
  });
  tile.addChild(innerGlow);

  const topShine = new Graphics();
  topShine.roundRect(8, 7, width - 16, height * 0.28, 11);
  topShine.fill({
    color: 0xffffff,
    alpha: symbolStyle.isBlank ? 0.035 : 0.09,
  });
  tile.addChild(topShine);

  if (isWinning) {
    const winRing = new Graphics();
    winRing.roundRect(2, 2, width - 4, height - 4, 14);
    winRing.stroke({
      width: 2,
      color: 0xffd76a,
      alpha: 0.95,
    });
    tile.addChild(winRing);
  }

  const text = createSymbolText(label, 0, 0, width, height, symbolStyle.isBlank);
  text.tint = symbolStyle.isBlank ? 0x405a82 : symbolStyle.fill;
  tile.addChild(text);

  parent.addChild(tile);

  return tile;
}

function drawGlassOverlay(width, height) {
  if (!overlayLayer) return;

  clearLayer(overlayLayer);

  const topMask = new Graphics();
  topMask.rect(0, 0, width, height);
  topMask.fill({
    color: 0x000818,
    alpha: 0.02,
  });
  overlayLayer.addChild(topMask);

  const shine = new Graphics();
  shine.moveTo(width * 0.08, 0);
  shine.lineTo(width * 0.42, 0);
  shine.lineTo(width * 0.22, height);
  shine.lineTo(width * -0.08, height);
  shine.closePath();
  shine.fill({
    color: 0xffffff,
    alpha: 0.055,
  });
  overlayLayer.addChild(shine);

  const centerLine = new Graphics();
  centerLine.rect(0, height * 0.485, width, 2);
  centerLine.fill({
    color: 0xffd76a,
    alpha: 0.34,
  });
  overlayLayer.addChild(centerLine);

  const centerLineGlow = new Graphics();
  centerLineGlow.rect(0, height * 0.47, width, height * 0.06);
  centerLineGlow.fill({
    color: 0xffd76a,
    alpha: 0.07,
  });
  overlayLayer.addChild(centerLineGlow);

  const topShadow = new Graphics();
  topShadow.rect(0, 0, width, height * 0.18);
  topShadow.fill({
    color: 0x000614,
    alpha: 0.32,
  });
  overlayLayer.addChild(topShadow);

  const bottomShadow = new Graphics();
  bottomShadow.rect(0, height * 0.82, width, height * 0.18);
  bottomShadow.fill({
    color: 0x000614,
    alpha: 0.36,
  });
  overlayLayer.addChild(bottomShadow);
}

function drawReelSeparators(parent, width, height, columns) {
  const gapX = width / columns;

  for (let index = 1; index < columns; index += 1) {
    const x = gapX * index;

    const separator = new Graphics();
    separator.rect(x - 1, 8, 2, height - 16);
    separator.fill({
      color: 0x000000,
      alpha: 0.38,
    });

    separator.rect(x, 8, 1, height - 16);
    separator.fill({
      color: 0x75d7ff,
      alpha: 0.14,
    });

    parent.addChild(separator);
  }
}

function getWinningPositionKey(position) {
  return `${position.reelIndex}:${position.rowIndex}`;
}

function getWinningPositionSet(winningPositions = []) {
  return new Set(winningPositions.map(getWinningPositionKey));
}

function renderGridInternal(grid, options = {}) {
  if (!pixiApp || !reelsLayer || !grid) return;

  currentGrid = grid;

  clearLayer(reelsLayer);

  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  const columns = grid.length;
  const rows = grid[0]?.length || 3;

  if (!columns || !rows) return;

  const padding = 10;
  const columnGap = 8;
  const rowGap = 8;

  const tileWidth =
    (width - padding * 2 - columnGap * (columns - 1)) / columns;
  const tileHeight = (height - padding * 2 - rowGap * (rows - 1)) / rows;

  const winningSet = getWinningPositionSet(options.winningPositions);
  const stoppedReels =
    typeof options.stoppedReels === "number" ? options.stoppedReels : columns;

  const background = new Graphics();
  background.roundRect(0, 0, width, height, 18);
  background.fill({
    color: 0x061127,
    alpha: 0.96,
  });
  background.stroke({
    width: 1,
    color: 0x50cfff,
    alpha: 0.28,
  });
  reelsLayer.addChild(background);

  drawReelSeparators(reelsLayer, width, height, columns);

  grid.forEach((reel, reelIndex) => {
    reel.forEach((symbol, rowIndex) => {
      const x = padding + reelIndex * (tileWidth + columnGap);
      const y = padding + rowIndex * (tileHeight + rowGap);

      const isWinning = winningSet.has(`${reelIndex}:${rowIndex}`);
      const isDimmed = options.dimUnstopped && reelIndex >= stoppedReels;

      drawSymbolTile(reelsLayer, symbol, x, y, tileWidth, tileHeight, {
        isWinning,
        isDimmed,
      });
    });
  });

  drawGlassOverlay(width, height);
}

function createRandomSymbol(symbols) {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

export async function initPixiReels(options = {}) {
  const { container, grid, winningPositions = [] } = options;

  if (!container) {
    console.warn("[PixiReels] Container is missing.");
    return null;
  }

  currentContainer = container;

  if (!pixiApp) {
    pixiApp = new Application();

    await pixiApp.init({
      width: Math.max(1, Math.floor(container.clientWidth)),
      height: Math.max(1, Math.floor(container.clientHeight)),
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });

    pixiApp.canvas.className = "pixi-reels-canvas";
    pixiApp.canvas.setAttribute("aria-hidden", "true");

    reelsLayer = new Container();
    overlayLayer = new Container();

    pixiApp.stage.addChild(reelsLayer);
    pixiApp.stage.addChild(overlayLayer);
  }

  if (pixiApp.canvas.parentElement !== container) {
    container.appendChild(pixiApp.canvas);
  }

  resizePixiReels();

  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  resizeObserver = new ResizeObserver(() => {
    resizePixiReels();

    if (currentGrid) {
      renderGridInternal(currentGrid, {
        winningPositions,
      });
    }
  });

  resizeObserver.observe(container);

  isInitialized = true;

  if (grid) {
    renderGridInternal(grid, {
      winningPositions,
    });
  }

  console.info("[PixiReels] PixiJS reel renderer initialized.");

  return pixiApp;
}

export function resizePixiReels() {
  if (!pixiApp || !currentContainer) return;

  const width = Math.max(1, Math.floor(currentContainer.clientWidth));
  const height = Math.max(1, Math.floor(currentContainer.clientHeight));

  pixiApp.renderer.resize(width, height);
}

export function renderPixiReelsGrid(grid, options = {}) {
  if (!isInitialized || !pixiApp) return;

  if (pixiApp.canvas.parentElement !== currentContainer) {
    currentContainer.appendChild(pixiApp.canvas);
  }

  renderGridInternal(grid, options);
}

export function renderPixiReelsSpinning(symbols, options = {}) {
  if (!isInitialized || !pixiApp || !currentGrid) return;

  const columns = currentGrid.length || 5;
  const rows = currentGrid[0]?.length || 3;

  const randomGrid = Array.from({ length: columns }, () =>
    Array.from({ length: rows }, () => createRandomSymbol(symbols)),
  );

  renderGridInternal(randomGrid, {
    dimUnstopped: false,
    ...options,
  });
}

export function destroyPixiReels() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (pixiApp) {
    pixiApp.destroy(true, {
      children: true,
      texture: true,
      textureSource: true,
    });
  }

  pixiApp = null;
  reelsLayer = null;
  overlayLayer = null;
  currentContainer = null;
  currentGrid = null;
  isInitialized = false;
}