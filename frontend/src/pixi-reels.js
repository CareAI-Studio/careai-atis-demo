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
  settleAnimations: [],
};

const SYMBOL_STYLE_MAP = {
  AI: {
    fill: 0x63ddff,
    glow: 0x4cd3ff,
    accent: 0xffffff,
    shadow: 0x0b1834,
  },
  "⚡": {
    fill: 0xffb248,
    glow: 0xffd16c,
    accent: 0xff6a7d,
    shadow: 0x2c1322,
  },
  "⭐": {
    fill: 0xffdd64,
    glow: 0xffef98,
    accent: 0xffffff,
    shadow: 0x2d2108,
  },
  "💎": {
    fill: 0x75b6ff,
    glow: 0xa8d8ff,
    accent: 0xffffff,
    shadow: 0x0d2147,
  },
  "🤖": {
    fill: 0xf0b9ff,
    glow: 0x77ddff,
    accent: 0xff63dc,
    shadow: 0x25123a,
  },
  "☁": {
    fill: 0xe8e8ff,
    glow: 0xdadfff,
    accent: 0xffffff,
    shadow: 0x101b3d,
  },
  "♡": {
    fill: 0x65efff,
    glow: 0x6ef7ff,
    accent: 0xffffff,
    shadow: 0x0b2a35,
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
      fill: 0x0c1732,
      glow: 0x213a60,
      accent: 0x294263,
      shadow: 0x020813,
      isBlank: true,
    };
  }

  return (
    SYMBOL_STYLE_MAP[label] || {
      fill: 0x88eaff,
      glow: 0x66d7ff,
      accent: 0xffffff,
      shadow: 0x0b1834,
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

function resetSettleAnimations() {
  spinState.settleAnimations = [];
}

function addSettleAnimation(target, options = {}) {
  if (!target) return;

  const duration = options.duration || 18;
  const distance = options.distance || 8;

  target.settleElapsed = 0;
  target.settleDuration = duration;
  target.settleDistance = distance;
  target.baseY = target.y;
  target.baseScaleY = target.scale.y;

  spinState.settleAnimations.push(target);
}

function updateSettleAnimations(deltaTime) {
  if (!spinState.settleAnimations.length) return;

  spinState.settleAnimations = spinState.settleAnimations.filter((target) => {
    target.settleElapsed += deltaTime;

    const progress = Math.min(1, target.settleElapsed / target.settleDuration);
    const elastic = Math.sin(progress * Math.PI) * (1 - progress);

    target.y = target.baseY + elastic * target.settleDistance;
    target.scale.y = target.baseScaleY + elastic * 0.018;

    if (progress >= 1) {
      target.y = target.baseY;
      target.scale.y = target.baseScaleY;
      return false;
    }

    return true;
  });
}

function createSymbolText(label, width, height, isBlank = false) {
  const text = new Text({
    text: label,
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: Math.max(22, Math.min(width, height) * 0.34),
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

function drawGlyphGlow(parent, cx, cy, radiusX, radiusY, color, alpha = 0.16) {
  const glow = new Graphics();

  glow.ellipse(cx, cy, radiusX, radiusY);
  glow.fill({
    color,
    alpha,
  });

  parent.addChild(glow);
}

function drawStarGlyph(parent, width, height, color, glowColor) {
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) * 0.235;
  const innerRadius = outerRadius * 0.46;
  const points = [];

  drawGlyphGlow(parent, cx, cy, outerRadius * 1.55, outerRadius * 1.28, glowColor, 0.18);

  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;

    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }

  const starShadow = new Graphics();
  starShadow.moveTo(points[0].x + 2, points[0].y + 3);

  for (let index = 1; index < points.length; index += 1) {
    starShadow.lineTo(points[index].x + 2, points[index].y + 3);
  }

  starShadow.closePath();
  starShadow.fill({
    color: 0x000000,
    alpha: 0.2,
  });
  parent.addChild(starShadow);

  const star = new Graphics();
  star.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    star.lineTo(points[index].x, points[index].y);
  }

  star.closePath();
  star.fill({
    color,
    alpha: 1,
  });
  star.stroke({
    width: 2,
    color: 0xffffff,
    alpha: 0.42,
  });

  parent.addChild(star);
}

function drawDiamondGlyph(parent, width, height, color, glowColor) {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.265;

  drawGlyphGlow(parent, cx, cy, size * 1.45, size * 1.25, glowColor, 0.18);

  const shadow = new Graphics();
  shadow.moveTo(cx + 2, cy - size + 3);
  shadow.lineTo(cx + size * 0.95 + 2, cy + 3);
  shadow.lineTo(cx + 2, cy + size + 3);
  shadow.lineTo(cx - size * 0.95 + 2, cy + 3);
  shadow.closePath();
  shadow.fill({
    color: 0x000000,
    alpha: 0.2,
  });
  parent.addChild(shadow);

  const diamond = new Graphics();
  diamond.moveTo(cx, cy - size);
  diamond.lineTo(cx + size * 0.95, cy);
  diamond.lineTo(cx, cy + size);
  diamond.lineTo(cx - size * 0.95, cy);
  diamond.closePath();
  diamond.fill({
    color,
    alpha: 1,
  });
  diamond.stroke({
    width: 2,
    color: 0xffffff,
    alpha: 0.36,
  });
  parent.addChild(diamond);

  const shine = new Graphics();
  shine.moveTo(cx, cy - size * 0.72);
  shine.lineTo(cx + size * 0.36, cy - size * 0.08);
  shine.lineTo(cx, cy + size * 0.14);
  shine.lineTo(cx - size * 0.32, cy - size * 0.08);
  shine.closePath();
  shine.fill({
    color: 0xffffff,
    alpha: 0.22,
  });
  parent.addChild(shine);
}

function drawLightningGlyph(parent, width, height, color, glowColor) {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.305;

  drawGlyphGlow(parent, cx, cy, size * 1.35, size * 1.25, glowColor, 0.18);

  const shadow = new Graphics();
  shadow.moveTo(cx + size * 0.08 + 2, cy - size + 3);
  shadow.lineTo(cx - size * 0.46 + 2, cy + size * 0.08 + 3);
  shadow.lineTo(cx - size * 0.08 + 2, cy + size * 0.08 + 3);
  shadow.lineTo(cx - size * 0.22 + 2, cy + size + 3);
  shadow.lineTo(cx + size * 0.5 + 2, cy - size * 0.2 + 3);
  shadow.lineTo(cx + size * 0.12 + 2, cy - size * 0.2 + 3);
  shadow.closePath();
  shadow.fill({
    color: 0x000000,
    alpha: 0.2,
  });
  parent.addChild(shadow);

  const bolt = new Graphics();
  bolt.moveTo(cx + size * 0.08, cy - size);
  bolt.lineTo(cx - size * 0.46, cy + size * 0.08);
  bolt.lineTo(cx - size * 0.08, cy + size * 0.08);
  bolt.lineTo(cx - size * 0.22, cy + size);
  bolt.lineTo(cx + size * 0.5, cy - size * 0.2);
  bolt.lineTo(cx + size * 0.12, cy - size * 0.2);
  bolt.closePath();
  bolt.fill({
    color,
    alpha: 1,
  });
  bolt.stroke({
    width: 2,
    color: 0xffffff,
    alpha: 0.3,
  });
  parent.addChild(bolt);
}

function drawHeartGlyph(parent, width, height, color, glowColor) {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.22;

  drawGlyphGlow(parent, cx, cy, size * 1.8, size * 1.55, glowColor, 0.17);

  const shadow = new Graphics();
  shadow.moveTo(cx + 2, cy + size * 0.72 + 3);
  shadow.bezierCurveTo(
    cx - size * 1.35 + 2,
    cy - size * 0.25 + 3,
    cx - size * 0.72 + 2,
    cy - size * 1.25 + 3,
    cx + 2,
    cy - size * 0.48 + 3,
  );
  shadow.bezierCurveTo(
    cx + size * 0.72 + 2,
    cy - size * 1.25 + 3,
    cx + size * 1.35 + 2,
    cy - size * 0.25 + 3,
    cx + 2,
    cy + size * 0.72 + 3,
  );
  shadow.fill({
    color: 0x000000,
    alpha: 0.2,
  });
  parent.addChild(shadow);

  const heart = new Graphics();
  heart.moveTo(cx, cy + size * 0.72);
  heart.bezierCurveTo(
    cx - size * 1.35,
    cy - size * 0.25,
    cx - size * 0.72,
    cy - size * 1.25,
    cx,
    cy - size * 0.48,
  );
  heart.bezierCurveTo(
    cx + size * 0.72,
    cy - size * 1.25,
    cx + size * 1.35,
    cy - size * 0.25,
    cx,
    cy + size * 0.72,
  );
  heart.fill({
    color,
    alpha: 1,
  });
  heart.stroke({
    width: 2,
    color: 0xffffff,
    alpha: 0.32,
  });
  parent.addChild(heart);
}

function drawCloudGlyph(parent, width, height, color, glowColor) {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.2;

  drawGlyphGlow(parent, cx, cy, size * 1.95, size * 1.18, glowColor, 0.16);

  const shadow = new Graphics();
  shadow.circle(cx - size * 0.7 + 2, cy + size * 0.12 + 3, size * 0.72);
  shadow.circle(cx + 2, cy - size * 0.16 + 3, size);
  shadow.circle(cx + size * 0.78 + 2, cy + size * 0.08 + 3, size * 0.74);
  shadow.roundRect(
    cx - size * 1.48 + 2,
    cy + 3,
    size * 2.96,
    size * 0.8,
    size * 0.34,
  );
  shadow.fill({
    color: 0x000000,
    alpha: 0.18,
  });
  parent.addChild(shadow);

  const cloud = new Graphics();
  cloud.circle(cx - size * 0.7, cy + size * 0.12, size * 0.72);
  cloud.circle(cx, cy - size * 0.16, size);
  cloud.circle(cx + size * 0.78, cy + size * 0.08, size * 0.74);
  cloud.roundRect(cx - size * 1.48, cy, size * 2.96, size * 0.8, size * 0.34);
  cloud.fill({
    color,
    alpha: 0.94,
  });
  cloud.stroke({
    width: 2,
    color: 0xffffff,
    alpha: 0.28,
  });
  parent.addChild(cloud);
}

function drawRobotGlyph(parent, width, height, color, glowColor, accentColor) {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.265;

  drawGlyphGlow(parent, cx, cy, size * 1.56, size * 1.42, glowColor, 0.19);

  const shadow = new Graphics();
  shadow.roundRect(cx - size + 2, cy - size * 0.88 + 3, size * 2, size * 1.7, 10);
  shadow.fill({
    color: 0x000000,
    alpha: 0.2,
  });
  parent.addChild(shadow);

  const antenna = new Graphics();
  antenna.rect(cx - 1, cy - size * 1.45, 2, size * 0.32);
  antenna.circle(cx, cy - size * 1.52, 4);
  antenna.fill({
    color: accentColor,
    alpha: 1,
  });
  parent.addChild(antenna);

  const head = new Graphics();
  head.roundRect(cx - size, cy - size * 0.88, size * 2, size * 1.7, 10);
  head.fill({
    color,
    alpha: 1,
  });
  head.stroke({
    width: 2,
    color: 0xffffff,
    alpha: 0.34,
  });
  parent.addChild(head);

  const visor = new Graphics();
  visor.roundRect(cx - size * 0.66, cy - size * 0.42, size * 1.32, size * 0.48, 8);
  visor.fill({
    color: 0x0d1a38,
    alpha: 0.82,
  });
  parent.addChild(visor);

  const eyeLeft = new Graphics();
  eyeLeft.circle(cx - size * 0.34, cy - size * 0.17, 3.8);
  eyeLeft.fill({
    color: 0x60d7ff,
    alpha: 1,
  });
  parent.addChild(eyeLeft);

  const eyeRight = new Graphics();
  eyeRight.circle(cx + size * 0.34, cy - size * 0.17, 3.8);
  eyeRight.fill({
    color: 0xff5bd6,
    alpha: 1,
  });
  parent.addChild(eyeRight);

  const mouth = new Graphics();
  mouth.roundRect(cx - size * 0.36, cy + size * 0.36, size * 0.72, 3, 2);
  mouth.fill({
    color: 0xffffff,
    alpha: 0.5,
  });
  parent.addChild(mouth);
}

function drawAiGlyph(parent, width, height, color, glowColor) {
  const cx = width / 2;
  const cy = height / 2;

  drawGlyphGlow(parent, cx, cy, width * 0.3, height * 0.22, glowColor, 0.18);

  const textShadow = new Text({
    text: "AI",
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: Math.max(28, Math.min(width, height) * 0.4),
      fontWeight: "900",
      fill: 0x000000,
      align: "center",
    },
  });

  textShadow.anchor.set(0.5);
  textShadow.x = cx + 2;
  textShadow.y = cy + 3;
  textShadow.alpha = 0.26;
  parent.addChild(textShadow);

  const text = new Text({
    text: "AI",
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: Math.max(28, Math.min(width, height) * 0.4),
      fontWeight: "900",
      fill: color,
      align: "center",
      dropShadow: {
        color: 0x000000,
        blur: 8,
        distance: 3,
        alpha: 0.78,
      },
    },
  });

  text.anchor.set(0.5);
  text.x = cx;
  text.y = cy;

  parent.addChild(text);
}

function drawSymbolGlyph(parent, symbol, width, height, symbolStyle) {
  const label = getSymbolLabel(symbol);

  if (symbolStyle.isBlank) {
    const ghost = new Graphics();

    ghost.ellipse(width / 2, height / 2, width * 0.28, height * 0.19);
    ghost.fill({
      color: 0x172949,
      alpha: 0.32,
    });

    const ghostLine = new Graphics();
    ghostLine.roundRect(width * 0.28, height * 0.5 - 1, width * 0.44, 2, 2);
    ghostLine.fill({
      color: 0x395a82,
      alpha: 0.18,
    });

    parent.addChild(ghost);
    parent.addChild(ghostLine);
    return;
  }

  if (label === "AI") {
    drawAiGlyph(parent, width, height, symbolStyle.fill, symbolStyle.glow);
    return;
  }

  if (label === "⭐") {
    drawStarGlyph(parent, width, height, symbolStyle.fill, symbolStyle.glow);
    return;
  }

  if (label === "💎") {
    drawDiamondGlyph(parent, width, height, symbolStyle.fill, symbolStyle.glow);
    return;
  }

  if (label === "⚡") {
    drawLightningGlyph(parent, width, height, symbolStyle.fill, symbolStyle.glow);
    return;
  }

  if (label === "♡") {
    drawHeartGlyph(parent, width, height, symbolStyle.fill, symbolStyle.glow);
    return;
  }

  if (label === "☁") {
    drawCloudGlyph(parent, width, height, symbolStyle.fill, symbolStyle.glow);
    return;
  }

  if (label === "🤖") {
    drawRobotGlyph(
      parent,
      width,
      height,
      symbolStyle.fill,
      symbolStyle.glow,
      symbolStyle.accent,
    );
    return;
  }

  const text = createSymbolText(label, width, height, symbolStyle.isBlank);
  text.tint = symbolStyle.fill;
  parent.addChild(text);
}

function drawSymbolTileContent(tile, symbol, width, height, options = {}) {
  const { isWinning = false, isDimmed = false, isSpinning = false } = options;
  const symbolStyle = getSymbolStyle(symbol);

  clearLayer(tile);

  tile.alpha = isDimmed ? 0.48 : 1;

  const base = new Graphics();

  base.roundRect(0, 0, width, height, 15);
  base.fill({
    color: symbolStyle.isBlank ? 0x071126 : 0x10214b,
    alpha: symbolStyle.isBlank ? 0.74 : 0.96,
  });

  base.stroke({
    width: 1,
    color: symbolStyle.isBlank ? 0x1a355a : 0x2e79b9,
    alpha: symbolStyle.isBlank ? 0.18 : 0.34,
  });

  tile.addChild(base);

  const innerPanel = new Graphics();
  innerPanel.roundRect(5, 5, width - 10, height - 10, 12);
  innerPanel.fill({
    color: symbolStyle.isBlank ? 0x08152d : 0x13295a,
    alpha: symbolStyle.isBlank ? 0.7 : 0.86,
  });
  innerPanel.stroke({
    width: isWinning ? 2 : 1,
    color: isWinning ? 0xffd76a : 0x62cfff,
    alpha: isWinning ? 0.94 : symbolStyle.isBlank ? 0.12 : 0.22,
  });
  tile.addChild(innerPanel);

  const innerGlow = new Graphics();
  innerGlow.ellipse(width * 0.5, height * 0.52, width * 0.42, height * 0.34);
  innerGlow.fill({
    color: isWinning ? 0xffd76a : symbolStyle.glow,
    alpha: isWinning ? 0.24 : symbolStyle.isBlank ? 0.045 : 0.13,
  });
  tile.addChild(innerGlow);

  const bottomShade = new Graphics();
  bottomShade.roundRect(7, height * 0.58, width - 14, height * 0.32, 10);
  bottomShade.fill({
    color: 0x000000,
    alpha: symbolStyle.isBlank ? 0.11 : 0.15,
  });
  tile.addChild(bottomShade);

  const topShine = new Graphics();
  topShine.roundRect(8, 7, width - 16, height * 0.28, 12);
  topShine.fill({
    color: 0xffffff,
    alpha: symbolStyle.isBlank ? 0.03 : 0.095,
  });
  tile.addChild(topShine);

  const edgeLight = new Graphics();
  edgeLight.roundRect(7, 7, width - 14, height - 14, 12);
  edgeLight.stroke({
    width: 1,
    color: 0xffffff,
    alpha: symbolStyle.isBlank ? 0.025 : 0.08,
  });
  tile.addChild(edgeLight);

  const glyphLayer = new Container();
  glyphLayer.x = 0;
  glyphLayer.y = 0;
  tile.addChild(glyphLayer);

  drawSymbolGlyph(glyphLayer, symbol, width, height, symbolStyle);

  if (isSpinning) {
    const motionShade = new Graphics();
    motionShade.rect(0, 0, width, height);
    motionShade.fill({
      color: 0x000000,
      alpha: 0.07,
    });
    tile.addChild(motionShade);

    const motionLine = new Graphics();
    motionLine.roundRect(10, height * 0.5, width - 20, 2, 2);
    motionLine.fill({
      color: 0xffffff,
      alpha: 0.08,
    });
    tile.addChild(motionLine);
  }

  if (isWinning) {
    const winGlow = new Graphics();
    winGlow.roundRect(-2, -2, width + 4, height + 4, 17);
    winGlow.stroke({
      width: 3,
      color: 0xffd76a,
      alpha: 0.92,
    });
    tile.addChild(winGlow);

    const winWash = new Graphics();
    winWash.ellipse(width / 2, height / 2, width * 0.44, height * 0.38);
    winWash.fill({
      color: 0xffd76a,
      alpha: 0.12,
    });
    tile.addChild(winWash);
  }
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

  const padding = Math.max(8, Math.min(12, width * 0.025));
  const columnGap = Math.max(7, Math.min(10, width * 0.018));
  const rowGap = Math.max(7, Math.min(10, height * 0.035));

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

  background.roundRect(0, 0, width, height, 20);
  background.fill({
    color: 0x050e22,
    alpha: 0.98,
  });
  background.stroke({
    width: 1,
    color: 0x60d7ff,
    alpha: 0.32,
  });

  reelsLayer.addChild(background);

  const inner = new Graphics();
  inner.roundRect(5, 5, width - 10, height - 10, 17);
  inner.fill({
    color: 0x071733,
    alpha: 0.72,
  });
  inner.stroke({
    width: 1,
    color: 0xffffff,
    alpha: 0.045,
  });
  reelsLayer.addChild(inner);

  const centerGlow = new Graphics();
  centerGlow.roundRect(7, height * 0.34, width - 14, height * 0.32, 14);
  centerGlow.fill({
    color: 0x143263,
    alpha: 0.32,
  });
  reelsLayer.addChild(centerGlow);
}

function drawReelSeparators(parent, width, height, columns) {
  const gapX = width / columns;

  for (let index = 1; index < columns; index += 1) {
    const x = gapX * index;

    const separatorShadow = new Graphics();
    separatorShadow.rect(x - 2, 8, 3, height - 16);
    separatorShadow.fill({
      color: 0x000000,
      alpha: 0.36,
    });
    parent.addChild(separatorShadow);

    const separatorLight = new Graphics();
    separatorLight.rect(x + 1, 10, 1, height - 20);
    separatorLight.fill({
      color: 0x75d7ff,
      alpha: 0.13,
    });
    parent.addChild(separatorLight);
  }
}

function drawGlassOverlay(width, height) {
  if (!overlayLayer) return;

  clearLayer(overlayLayer);

  const softGlass = new Graphics();
  softGlass.roundRect(0, 0, width, height, 20);
  softGlass.fill({
    color: 0xffffff,
    alpha: 0.018,
  });
  overlayLayer.addChild(softGlass);

  const shine = new Graphics();
  shine.moveTo(width * 0.08, 0);
  shine.lineTo(width * 0.38, 0);
  shine.lineTo(width * 0.2, height);
  shine.lineTo(width * -0.08, height);
  shine.closePath();
  shine.fill({
    color: 0xffffff,
    alpha: 0.045,
  });
  overlayLayer.addChild(shine);

  const secondShine = new Graphics();
  secondShine.moveTo(width * 0.68, 0);
  secondShine.lineTo(width * 0.78, 0);
  secondShine.lineTo(width * 0.58, height);
  secondShine.lineTo(width * 0.48, height);
  secondShine.closePath();
  secondShine.fill({
    color: 0xffffff,
    alpha: 0.022,
  });
  overlayLayer.addChild(secondShine);

  const centerLineGlow = new Graphics();
  centerLineGlow.rect(0, height * 0.47, width, height * 0.06);
  centerLineGlow.fill({
    color: 0xffd76a,
    alpha: 0.055,
  });
  overlayLayer.addChild(centerLineGlow);

  const centerLine = new Graphics();
  centerLine.rect(0, height * 0.492, width, 1.5);
  centerLine.fill({
    color: 0xffd76a,
    alpha: 0.25,
  });
  overlayLayer.addChild(centerLine);

  const topShadow = new Graphics();
  topShadow.rect(0, 0, width, height * 0.18);
  topShadow.fill({
    color: 0x000614,
    alpha: 0.3,
  });
  overlayLayer.addChild(topShadow);

  const bottomShadow = new Graphics();
  bottomShadow.rect(0, height * 0.82, width, height * 0.18);
  bottomShadow.fill({
    color: 0x000614,
    alpha: 0.34,
  });
  overlayLayer.addChild(bottomShadow);

  const border = new Graphics();
  border.roundRect(0.5, 0.5, width - 1, height - 1, 20);
  border.stroke({
    width: 1,
    color: 0xffffff,
    alpha: 0.07,
  });
  overlayLayer.addChild(border);
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
  const { padding, columnGap, rowGap, tileWidth, tileHeight } = layout;

  const winningSet = getWinningPositionSet(options.winningPositions);
  const reelX = padding + reelIndex * (tileWidth + columnGap);
  const reelGroup = new Container();

  reelGroup.x = reelX;
  reelGroup.y = 0;

  reel.forEach((symbol, rowIndex) => {
    const y = padding + rowIndex * (tileHeight + rowGap);
    const isWinning = winningSet.has(`${reelIndex}:${rowIndex}`);
    const isDimmed = Boolean(options.isDimmed);

    const tile = createSymbolTile(symbol, 0, y, tileWidth, tileHeight, {
      isWinning,
      isDimmed,
    });

    reelGroup.addChild(tile);
  });

  reelsLayer.addChild(reelGroup);

  if (options.shouldSettle) {
    addSettleAnimation(reelGroup, {
      duration: options.isTurbo ? 12 : 18,
      distance: options.isTurbo ? 4 : 8,
    });
  }
}

function createSpinningReel(reelIndex, layout, symbols, options = {}) {
  const { padding, columnGap, tileWidth, tileHeight, stepY } = layout;

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
  resetSettleAnimations();

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

  resetSettleAnimations();
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

  resetSettleAnimations();
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
  const justStoppedReel = stoppedReels - 1;

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
        shouldSettle: reelIndex === justStoppedReel,
        isTurbo,
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
  }
}

function updateSpinningReels(deltaTime) {
  updateSettleAnimations(deltaTime);

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
  resetSettleAnimations();

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