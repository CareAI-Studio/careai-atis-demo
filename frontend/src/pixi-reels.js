import { Application, Container, Graphics, Text } from "pixi.js";

let pixiApp = null;
let reelsLayer = null;
let overlayLayer = null;
let resizeObserver = null;
let currentContainer = null;
let currentGrid = null;
let isInitialized = false;
let tickerReady = false;

const spinState = {
  active: false,
  symbols: [],
  reels: [],
  layout: null,
  isTurbo: false,
};

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

function getRandomSymbol(symbols) {
  return symbols[Math.floor(Math.random() * symbols.length)];
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

function createSymbolText(label, width, height, isBlank = false) {
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
  text.x = width / 2;
  text.y = height / 2;

  return text;
}

function drawSymbolTileContent(tile, symbol, width, height, options = {}) {
  const { isWinning = false, isDimmed = false, isSpinning = false } = options;
  const symbolStyle = getSymbolStyle(symbol);
  const label = getSymbolLabel(symbol);

  clearLayer(tile);

  tile.alpha = isDimmed ? 0.42 : 1;

  const base = new Graphics();

  base.roundRect(0, 0, width, height, 14);
  base.fill({
    color: symbolStyle.isBlank ? 0x071126 : 0x142856,
    alpha: symbolStyle.isBlank ? 0.72 : 0.92,
  });

  base.roundRect(4, 4, width - 8, height - 8, 12);
  base.stroke({
    width: isWinning ? 2 : 1,
    color: isWinning ? 0xffd76a : 0x2e6da8,
    alpha: isWinning ? 0.95 : 0.34,
  });

  tile.addChild(base);

  const innerGlow = new Graphics();
  innerGlow.ellipse(width * 0.5, height * 0.5, width * 0.42, height * 0.36);
  innerGlow.fill({
    color: isWinning ? 0xffd76a : symbolStyle.glow,
    alpha: isWinning ? 0.25 : symbolStyle.isBlank ? 0.06 : 0.16,
  });
  tile.addChild(innerGlow);

  const topShine = new Graphics();
  topShine.roundRect(8, 7, width - 16, height * 0.28, 11);
  topShine.fill({
    color: 0xffffff,
    alpha: symbolStyle.isBlank ? 0.035 : 0.09,
  });
  tile.addChild(topShine);

  if (isSpinning) {
    const motionShade = new Graphics();
    motionShade.rect(0, 0, width, height);
    motionShade.fill({
      color: 0x000000,
      alpha: 0.1,
    });
    tile.addChild(motionShade);
  }

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

  const text = createSymbolText(label, width, height, symbolStyle.isBlank);
  text.tint = symbolStyle.isBlank ? 0x405a82 : symbolStyle.fill;
  tile.addChild(text);
}

function createSymbolTile(symbol, x, y, width, height, options = {}) {
  const tile = new Container();

  tile.x = x;
  tile.y = y;
  tile.symbol = symbol;

  drawSymbolTileContent(tile, symbol, width, height, options);

  return tile;
}

function getLayout(grid) {
  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  const columns = grid?.length || 5;
  const rows = grid?.[0]?.length || 3;

  const padding = 10;
  const columnGap = 8;
  const rowGap = 8;

  const tileWidth =
    (width - padding * 2 - columnGap * (columns - 1)) / columns;
  const tileHeight = (height - padding * 2 - rowGap * (rows - 1)) / rows;
  const stepY = tileHeight + rowGap;

  return {
    width,
    height,
    columns,
    rows,
    padding,
    columnGap,
    rowGap,
    tileWidth,
    tileHeight,
    stepY,
  };
}

function drawBackground(width, height) {
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

function drawGlassOverlay(width, height) {
  if (!overlayLayer) return;

  clearLayer(overlayLayer);

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

  const centerLineGlow = new Graphics();
  centerLineGlow.rect(0, height * 0.47, width, height * 0.06);
  centerLineGlow.fill({
    color: 0xffd76a,
    alpha: 0.07,
  });
  overlayLayer.addChild(centerLineGlow);

  const centerLine = new Graphics();
  centerLine.rect(0, height * 0.485, width, 2);
  centerLine.fill({
    color: 0xffd76a,
    alpha: 0.34,
  });
  overlayLayer.addChild(centerLine);

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

function getWinningPositionKey(position) {
  return `${position.reelIndex}:${position.rowIndex}`;
}

function getWinningPositionSet(winningPositions = []) {
  return new Set(winningPositions.map(getWinningPositionKey));
}

function stopSpinInternal() {
  spinState.active = false;
  spinState.reels = [];
  spinState.layout = null;
}

function drawStaticReel(reel, reelIndex, layout, options = {}) {
  const {
    padding,
    columnGap,
    rowGap,
    tileWidth,
    tileHeight,
  } = layout;

  const winningSet = getWinningPositionSet(options.winningPositions);
  const reelX = padding + reelIndex * (tileWidth + columnGap);

  reel.forEach((symbol, rowIndex) => {
    const y = padding + rowIndex * (tileHeight + rowGap);
    const isWinning = winningSet.has(`${reelIndex}:${rowIndex}`);
    const isDimmed = Boolean(options.isDimmed);

    const tile = createSymbolTile(symbol, reelX, y, tileWidth, tileHeight, {
      isWinning,
      isDimmed,
    });

    reelsLayer.addChild(tile);
  });
}

function createSpinningReel(reelIndex, layout, symbols, options = {}) {
  const {
    padding,
    columnGap,
    tileWidth,
    tileHeight,
    stepY,
  } = layout;

  const reelContainer = new Container();
  const reelX = padding + reelIndex * (tileWidth + columnGap);
  const isTurbo = Boolean(options.isTurbo);

  reelContainer.x = reelX;
  reelContainer.y = 0;
  reelContainer.speed = (isTurbo ? 31 : 19) + reelIndex * (isTurbo ? 2 : 1.5);
  reelContainer.tiles = [];

  const visibleTiles = 6;

  for (let tileIndex = 0; tileIndex < visibleTiles; tileIndex += 1) {
    const y = padding + (tileIndex - 1) * stepY;
    const symbol = getRandomSymbol(symbols);

    const tile = createSymbolTile(symbol, 0, y, tileWidth, tileHeight, {
      isSpinning: true,
      isDimmed: options.isDimmed,
    });

    reelContainer.tiles.push(tile);
    reelContainer.addChild(tile);
  }

  reelsLayer.addChild(reelContainer);

  return reelContainer;
}

function renderGridInternal(grid, options = {}) {
  if (!pixiApp || !reelsLayer || !grid) return;

  stopSpinInternal();

  currentGrid = grid;

  clearLayer(reelsLayer);

  const layout = getLayout(grid);
  const { width, height, columns, rows } = layout;

  if (!columns || !rows) return;

  const stoppedReels =
    typeof options.stoppedReels === "number" ? options.stoppedReels : columns;

  drawBackground(width, height);
  drawReelSeparators(reelsLayer, width, height, columns);

  grid.forEach((reel, reelIndex) => {
    drawStaticReel(reel, reelIndex, layout, {
      winningPositions: options.winningPositions,
      isDimmed: options.dimUnstopped && reelIndex >= stoppedReels,
    });
  });

  drawGlassOverlay(width, height);
}

function buildSpinningReels(symbols, options = {}) {
  if (!pixiApp || !reelsLayer || !currentGrid) return;

  clearLayer(reelsLayer);

  const layout = getLayout(currentGrid);
  const { width, height, columns } = layout;

  drawBackground(width, height);
  drawReelSeparators(reelsLayer, width, height, columns);

  spinState.active = true;
  spinState.symbols = symbols;
  spinState.reels = [];
  spinState.layout = layout;
  spinState.isTurbo = Boolean(options.isTurbo);

  for (let reelIndex = 0; reelIndex < columns; reelIndex += 1) {
    const reelContainer = createSpinningReel(reelIndex, layout, symbols, {
      isTurbo: spinState.isTurbo,
    });

    spinState.reels.push(reelContainer);
  }

  drawGlassOverlay(width, height);
}

function renderStoppingReelsInternal(finalGrid, options = {}) {
  if (!pixiApp || !reelsLayer || !finalGrid) return;

  currentGrid = finalGrid;

  clearLayer(reelsLayer);

  const layout = getLayout(finalGrid);
  const { width, height, columns, rows } = layout;

  if (!columns || !rows) return;

  const stoppedReels = Math.max(
    0,
    Math.min(
      columns,
      typeof options.stoppedReels === "number" ? options.stoppedReels : 0,
    ),
  );

  const symbols = options.symbols || spinState.symbols || [];
  const isTurbo = Boolean(options.isTurbo);

  drawBackground(width, height);
  drawReelSeparators(reelsLayer, width, height, columns);

  spinState.active = stoppedReels < columns;
  spinState.symbols = symbols;
  spinState.reels = [];
  spinState.layout = layout;
  spinState.isTurbo = isTurbo;

  finalGrid.forEach((reel, reelIndex) => {
    if (reelIndex < stoppedReels) {
      drawStaticReel(reel, reelIndex, layout, {
        winningPositions: [],
      });
      return;
    }

    const reelContainer = createSpinningReel(reelIndex, layout, symbols, {
      isTurbo,
      isDimmed: false,
    });

    spinState.reels.push(reelContainer);
  });

  drawGlassOverlay(width, height);

  if (stoppedReels >= columns) {
    stopSpinInternal();
    renderGridInternal(finalGrid, {
      winningPositions: options.winningPositions || [],
    });
  }
}

function updateSpinningReels(deltaTime) {
  if (!spinState.active || !spinState.layout) return;

  const { height, padding, tileHeight, stepY } = spinState.layout;
  const maxY = height + tileHeight;
  const minY = padding - stepY;

  for (const reel of spinState.reels) {
    for (const tile of reel.tiles) {
      tile.y += reel.speed * deltaTime;

      if (tile.y > maxY) {
        let topTileY = Infinity;

        for (const otherTile of reel.tiles) {
          if (otherTile !== tile && otherTile.y < topTileY) {
            topTileY = otherTile.y;
          }
        }

        tile.y = Math.min(minY, topTileY - stepY);

        const nextSymbol = getRandomSymbol(spinState.symbols);
        tile.symbol = nextSymbol;

        drawSymbolTileContent(
          tile,
          nextSymbol,
          spinState.layout.tileWidth,
          spinState.layout.tileHeight,
          {
            isSpinning: true,
          },
        );
      }
    }
  }
}

function ensureTicker() {
  if (!pixiApp || tickerReady) return;

  pixiApp.ticker.add((ticker) => {
    updateSpinningReels(ticker.deltaTime);
  });

  tickerReady = true;
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

    ensureTicker();
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

    if (spinState.active) {
      buildSpinningReels(spinState.symbols, {
        isTurbo: spinState.isTurbo,
      });
      return;
    }

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

  if (spinState.active) {
    spinState.isTurbo = Boolean(options.isTurbo);
    return;
  }

  buildSpinningReels(symbols, options);
}

export function renderPixiReelsStopping(finalGrid, options = {}) {
  if (!isInitialized || !pixiApp || !finalGrid) return;

  if (pixiApp.canvas.parentElement !== currentContainer) {
    currentContainer.appendChild(pixiApp.canvas);
  }

  renderStoppingReelsInternal(finalGrid, options);
}

export function destroyPixiReels() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  stopSpinInternal();

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
  tickerReady = false;
}