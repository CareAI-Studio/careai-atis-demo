import { Application, Container, Graphics } from "pixi.js";

let pixiApp = null;
let rootLayer = null;
let particlesLayer = null;
let glowLayer = null;
let flashLayer = null;
let winLayer = null;
let resizeObserver = null;
let rafReady = false;

const particles = [];
const winBursts = [];
const winSparks = [];
const symbolHighlights = [];
const paylineGlows = [];
const winSweeps = [];

let flashAlpha = 0;

const WIN_LEVEL_EFFECTS = {
  3: {
    name: "small",
    flashAlpha: 0.95,
    burstStartScale: 0.22,
    burstScaleSpeed: 0.026,
    burstFadeSpeed: 0.017,
    sparkCount: 30,
    lineSparkCount: 16,
    rectSparkCount: 4,
    sparkSizeMin: 1.8,
    sparkSizeMax: 5.2,
    sparkSpeedMin: 1.8,
    sparkSpeedMax: 5.0,
    lineSparkSizeMin: 1.6,
    lineSparkSizeMax: 4.0,
    lineSparkSpeedMin: 2.2,
    lineSparkSpeedMax: 5.2,
    rectSparkSizeMin: 1.7,
    rectSparkSizeMax: 4.2,
    rectSparkSpeedMin: 1.2,
    rectSparkSpeedMax: 3.4,
    highlightFillAlpha: 0.12,
    highlightOuterWidth: 8,
    highlightOuterAlpha: 0.2,
    highlightMainWidth: 5,
    highlightBlueAlpha: 0.34,
    highlightMaxLife: 180,
    highlightPulseMin: 0.13,
    highlightPulseMax: 0.18,
    paylineMaxLife: 58,
    paylineOuterWidth: 10,
    paylineCoreWidth: 5,
    sweepMaxLife: 96,
    sweepOuterWidth: 18,
    sweepMiddleWidth: 11,
    sweepCoreWidth: 6,
    sweepHeadMultiplier: 0.075,
    shakePower: 0,
    shakeLife: 0,
  },
  4: {
    name: "medium",
    flashAlpha: 1.75,
    burstStartScale: 0.29,
    burstScaleSpeed: 0.033,
    burstFadeSpeed: 0.014,
    sparkCount: 76,
    lineSparkCount: 42,
    rectSparkCount: 7,
    sparkSizeMin: 2.4,
    sparkSizeMax: 6.8,
    sparkSpeedMin: 2.4,
    sparkSpeedMax: 6.7,
    lineSparkSizeMin: 2.0,
    lineSparkSizeMax: 5.0,
    lineSparkSpeedMin: 3.0,
    lineSparkSpeedMax: 6.8,
    rectSparkSizeMin: 2.2,
    rectSparkSizeMax: 5.2,
    rectSparkSpeedMin: 1.6,
    rectSparkSpeedMax: 4.4,
    highlightFillAlpha: 0.19,
    highlightOuterWidth: 12,
    highlightOuterAlpha: 0.31,
    highlightMainWidth: 7,
    highlightBlueAlpha: 0.56,
    highlightMaxLife: 220,
    highlightPulseMin: 0.16,
    highlightPulseMax: 0.22,
    paylineMaxLife: 82,
    paylineOuterWidth: 15,
    paylineCoreWidth: 7,
    sweepMaxLife: 118,
    sweepOuterWidth: 24,
    sweepMiddleWidth: 15,
    sweepCoreWidth: 8,
    sweepHeadMultiplier: 0.095,
    shakePower: 0,
    shakeLife: 0,
  },
  5: {
    name: "big",
    flashAlpha: 2.65,
    burstStartScale: 0.36,
    burstScaleSpeed: 0.04,
    burstFadeSpeed: 0.011,
    sparkCount: 150,
    lineSparkCount: 86,
    rectSparkCount: 11,
    sparkSizeMin: 3.0,
    sparkSizeMax: 8.2,
    sparkSpeedMin: 2.9,
    sparkSpeedMax: 8.0,
    lineSparkSizeMin: 2.5,
    lineSparkSizeMax: 5.8,
    lineSparkSpeedMin: 3.8,
    lineSparkSpeedMax: 8.2,
    rectSparkSizeMin: 2.8,
    rectSparkSizeMax: 6.4,
    rectSparkSpeedMin: 2.0,
    rectSparkSpeedMax: 5.5,
    highlightFillAlpha: 0.26,
    highlightOuterWidth: 15,
    highlightOuterAlpha: 0.42,
    highlightMainWidth: 9,
    highlightBlueAlpha: 0.72,
    highlightMaxLife: 260,
    highlightPulseMin: 0.2,
    highlightPulseMax: 0.28,
    paylineMaxLife: 106,
    paylineOuterWidth: 22,
    paylineCoreWidth: 10,
    sweepMaxLife: 142,
    sweepOuterWidth: 31,
    sweepMiddleWidth: 20,
    sweepCoreWidth: 10,
    sweepHeadMultiplier: 0.12,
    shakePower: 4.5,
    shakeLife: 32,
  },
};

const shakeState = {
  life: 0,
  maxLife: 0,
  power: 0,
};

function getWinLevelKey(winLevel = 3) {
  if (winLevel >= 5) return 5;
  if (winLevel >= 4) return 4;
  return 3;
}

function getWinLevelConfig(winLevel = 3) {
  return WIN_LEVEL_EFFECTS[getWinLevelKey(winLevel)] || WIN_LEVEL_EFFECTS[3];
}

function startScreenShake(config) {
  if (!config?.shakePower || !config?.shakeLife) return;

  shakeState.life = 0;
  shakeState.maxLife = config.shakeLife;
  shakeState.power = config.shakePower;
}

function resetScreenShake() {
  if (!rootLayer) return;

  rootLayer.x = 0;
  rootLayer.y = 0;
  rootLayer.rotation = 0;
}

function updateScreenShake(deltaTime) {
  if (!rootLayer) return;

  if (shakeState.life <= 0 && shakeState.maxLife <= 0) {
    resetScreenShake();
    return;
  }

  shakeState.life += deltaTime;

  const progress = Math.min(1, shakeState.life / shakeState.maxLife);
  const strength = (1 - progress) * shakeState.power;

  rootLayer.x = getRandom(-strength, strength);
  rootLayer.y = getRandom(-strength, strength);
  rootLayer.rotation = getRandom(-strength, strength) * 0.0009;

  if (progress >= 1) {
    shakeState.life = 0;
    shakeState.maxLife = 0;
    shakeState.power = 0;
    resetScreenShake();
  }
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(width, height) {
  const particle = new Graphics();

  const radius = getRandom(1.1, 3.1);
  const alpha = getRandom(0.14, 0.46);

  particle.circle(0, 0, radius);
  particle.fill({ color: 0xffffff, alpha });

  particle.x = getRandom(0, width);
  particle.y = getRandom(0, height);
  particle.vx = getRandom(-0.18, 0.18);
  particle.vy = getRandom(-0.34, -0.08);
  particle.baseAlpha = alpha;
  particle.lifeOffset = getRandom(0, Math.PI * 2);

  return particle;
}

function resizePixiCanvas(container) {
  if (!pixiApp || !container) return;

  const rect = container.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  pixiApp.renderer.resize(width, height);
  drawAmbientGlow(width, height);
  drawFlash(width, height);
}

function drawAmbientGlow(width, height) {
  if (!glowLayer) return;

  glowLayer.clear();

  glowLayer
    .ellipse(width * 0.5, height * 0.5, width * 0.42, height * 0.28)
    .fill({ color: 0x48bfff, alpha: 0.055 });

  glowLayer
    .ellipse(width * 0.5, height * 0.22, width * 0.34, height * 0.12)
    .fill({ color: 0xffffff, alpha: 0.035 });

  glowLayer
    .ellipse(width * 0.5, height * 0.82, width * 0.48, height * 0.16)
    .fill({ color: 0x9f5cff, alpha: 0.045 });
}

function drawFlash(width, height) {
  if (!flashLayer) return;

  flashLayer.clear();

  if (flashAlpha <= 0) return;

  const strength = Math.min(1.8, flashAlpha);

  flashLayer
    .rect(0, 0, width, height)
    .fill({ color: 0xffffff, alpha: strength * 0.11 });

  flashLayer
    .ellipse(width * 0.5, height * 0.48, width * 0.42, height * 0.2)
    .fill({ color: 0xffd76a, alpha: strength * 0.18 });

  flashLayer
    .ellipse(width * 0.5, height * 0.48, width * 0.62, height * 0.31)
    .stroke({ width: 4, color: 0xffd76a, alpha: strength * 0.42 });

  if (flashAlpha > 1.4) {
    flashLayer
      .ellipse(width * 0.5, height * 0.48, width * 0.74, height * 0.38)
      .stroke({
        width: 2,
        color: 0xffffff,
        alpha: (flashAlpha - 1.2) * 0.18,
      });
  }
}

function createWinBurst(width, height, winLevel = 3) {
  const config = getWinLevelConfig(winLevel);
  const burst = new Graphics();

  burst.x = width * 0.5;
  burst.y = height * 0.48;
  burst.scale.set(config.burstStartScale);
  burst.alpha = 0.95;
  burst.life = 0;
  burst.scaleSpeed = config.burstScaleSpeed;
  burst.fadeSpeed = config.burstFadeSpeed;

  burst.circle(0, 0, 42).stroke({
    width: winLevel >= 5 ? 7 : winLevel >= 4 ? 5 : 4,
    color: 0xffffff,
    alpha: 0.88,
  });

  burst.circle(0, 0, 78).stroke({
    width: winLevel >= 5 ? 5 : winLevel >= 4 ? 3 : 2,
    color: 0xffd76a,
    alpha: 0.72,
  });

  burst.circle(0, 0, 118).stroke({
    width: winLevel >= 5 ? 4 : 2,
    color: 0x62d6ff,
    alpha: winLevel >= 4 ? 0.52 : 0.42,
  });

  if (winLevel >= 4) {
    burst.circle(0, 0, 148).stroke({
      width: winLevel >= 5 ? 3 : 2,
      color: 0xfff0a8,
      alpha: winLevel >= 5 ? 0.44 : 0.3,
    });
  }

  if (winLevel >= 5) {
    burst.circle(0, 0, 188).stroke({
      width: 2,
      color: 0xffffff,
      alpha: 0.28,
    });
  }

  return burst;
}

function createWinSpark(width, height, winLevel = 3) {
  const config = getWinLevelConfig(winLevel);
  const spark = new Graphics();

  const size = getRandom(config.sparkSizeMin, config.sparkSizeMax);
  const angle = getRandom(0, Math.PI * 2);
  const speed = getRandom(config.sparkSpeedMin, config.sparkSpeedMax);
  const color = Math.random() > 0.45 ? 0xffd76a : 0xffffff;

  spark.circle(0, 0, size);
  spark.fill({ color, alpha: 0.95 });

  spark.x = width * 0.5 + getRandom(-70, 70);
  spark.y = height * 0.48 + getRandom(-25, 25);
  spark.vx = Math.cos(angle) * speed;
  spark.vy = Math.sin(angle) * speed;
  spark.life = 0;
  spark.maxLife =
    winLevel >= 5
      ? getRandom(48, 82)
      : winLevel >= 4
        ? getRandom(38, 68)
        : getRandom(32, 58);
  spark.rotationSpeed = getRandom(-0.08, 0.08);

  return spark;
}

function createLineSpark(width, height, winLevel = 3) {
  const config = getWinLevelConfig(winLevel);
  const spark = new Graphics();

  const size = getRandom(config.lineSparkSizeMin, config.lineSparkSizeMax);
  const direction = Math.random() > 0.5 ? 1 : -1;

  spark.circle(0, 0, size);
  spark.fill({ color: 0xfff0a8, alpha: 0.92 });

  spark.x = width * 0.5 + getRandom(-width * 0.25, width * 0.25);
  spark.y = height * 0.48 + getRandom(-12, 12);
  spark.vx =
    direction * getRandom(config.lineSparkSpeedMin, config.lineSparkSpeedMax);
  spark.vy = getRandom(-0.7, 0.7);
  spark.life = 0;
  spark.maxLife =
    winLevel >= 5
      ? getRandom(36, 60)
      : winLevel >= 4
        ? getRandom(28, 48)
        : getRandom(24, 42);
  spark.rotationSpeed = getRandom(-0.12, 0.12);

  return spark;
}

function normalizeSymbolRect(rect) {
  if (!pixiApp || !rect) return null;

  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  const x = Number(rect.x);
  const y = Number(rect.y);
  const rectWidth = Number(rect.width);
  const rectHeight = Number(rect.height);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(rectWidth) ||
    !Number.isFinite(rectHeight) ||
    rectWidth <= 0 ||
    rectHeight <= 0
  ) {
    return null;
  }

  const looksNormalized =
    x >= 0 &&
    x <= 1 &&
    y >= 0 &&
    y <= 1 &&
    rectWidth > 0 &&
    rectWidth <= 1 &&
    rectHeight > 0 &&
    rectHeight <= 1;

  if (looksNormalized) {
    return {
      x: x * width,
      y: y * height,
      width: rectWidth * width,
      height: rectHeight * height,
    };
  }

  return {
    x,
    y,
    width: rectWidth,
    height: rectHeight,
  };
}

function getRectCenter(rect) {
  return {
    x: rect.x + rect.width * 0.5,
    y: rect.y + rect.height * 0.5,
  };
}

function getOrderedNormalizedRects(symbolRects = []) {
  return symbolRects
    .map(normalizeSymbolRect)
    .filter(Boolean)
    .sort((a, b) => {
      const ax = a.x + a.width * 0.5;
      const bx = b.x + b.width * 0.5;

      if (Math.abs(ax - bx) > 2) {
        return ax - bx;
      }

      return a.y - b.y;
    });
}

function createSymbolHighlight(rect, index = 0, winLevel = 3) {
  const normalizedRect = normalizeSymbolRect(rect);

  if (!normalizedRect) return null;

  const config = getWinLevelConfig(winLevel);
  const highlight = new Graphics();

  const centerX = normalizedRect.x + normalizedRect.width * 0.5;
  const centerY = normalizedRect.y + normalizedRect.height * 0.5;
  const width = normalizedRect.width;
  const height = normalizedRect.height;
  const radius = Math.max(14, Math.min(width, height) * 0.18);

  highlight.x = centerX;
  highlight.y = centerY;
  highlight.life = index * -7;
  highlight.maxLife = config.highlightMaxLife;
  highlight.baseScale = 1;
  highlight.pulseSpeed = getRandom(
    config.highlightPulseMin,
    config.highlightPulseMax,
  );
  highlight.visible = index === 0;

  highlight
    .roundRect(
      -width * 0.52,
      -height * 0.52,
      width * 1.04,
      height * 1.04,
      radius,
    )
    .fill({ color: 0xffd76a, alpha: config.highlightFillAlpha });

  highlight
    .roundRect(
      -width * 0.57,
      -height * 0.57,
      width * 1.14,
      height * 1.14,
      radius + 3,
    )
    .stroke({
      width: config.highlightOuterWidth,
      color: 0xffd76a,
      alpha: config.highlightOuterAlpha,
    });

  highlight
    .roundRect(
      -width * 0.53,
      -height * 0.53,
      width * 1.06,
      height * 1.06,
      radius + 2,
    )
    .stroke({
      width: config.highlightMainWidth,
      color: 0xffd76a,
      alpha: 0.95,
    });

  highlight
    .roundRect(
      -width * 0.48,
      -height * 0.48,
      width * 0.96,
      height * 0.96,
      radius,
    )
    .stroke({
      width: winLevel >= 5 ? 3 : 2,
      color: 0xffffff,
      alpha: 0.88,
    });

  highlight
    .roundRect(
      -width * 0.64,
      -height * 0.64,
      width * 1.28,
      height * 1.28,
      radius + 7,
    )
    .stroke({
      width: winLevel >= 5 ? 4 : winLevel >= 4 ? 3 : 2,
      color: 0x62d6ff,
      alpha: config.highlightBlueAlpha,
    });

  return highlight;
}

function createPaylineGlow(options = {}) {
  if (!pixiApp) return null;

  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  const y =
    Number.isFinite(Number(options.y)) && Number(options.y) >= 0
      ? Number(options.y)
      : height * 0.48;

  const winLevel = options.winLevel || 3;
  const config = getWinLevelConfig(winLevel);
  const glow = new Graphics();

  glow.life = 0;
  glow.maxLife = config.paylineMaxLife;
  glow.alpha = 0.95;

  glow
    .moveTo(width * 0.12, y)
    .lineTo(width * 0.88, y)
    .stroke({
      width: config.paylineOuterWidth,
      color: 0xffd76a,
      alpha: 0.18,
    });

  glow
    .moveTo(width * 0.12, y)
    .lineTo(width * 0.88, y)
    .stroke({
      width: Math.max(5, config.paylineCoreWidth + 2),
      color: 0xffd76a,
      alpha: 0.54,
    });

  glow
    .moveTo(width * 0.12, y)
    .lineTo(width * 0.88, y)
    .stroke({
      width: config.paylineCoreWidth,
      color: 0xffffff,
      alpha: 0.84,
    });

  return glow;
}

function createWinSweep(symbolRects = [], winLevel = 3) {
  const normalizedRects = getOrderedNormalizedRects(symbolRects);

  if (normalizedRects.length < 2) {
    return null;
  }

  const points = normalizedRects.map(getRectCenter);
  const sweep = new Graphics();

  const config = getWinLevelConfig(winLevel);

  sweep.points = points;
  sweep.life = 0;
  sweep.maxLife = config.sweepMaxLife;
  sweep.alpha = 1;
  sweep.winLevel = winLevel;
  sweep.headRadius = Math.max(
    5,
    Math.min(normalizedRects[0].width, normalizedRects[0].height) *
      config.sweepHeadMultiplier,
  );

  drawWinSweep(sweep, 0);

  return sweep;
}

function drawWinSweep(sweep, progress) {
  if (!sweep?.points?.length) return;

  const points = sweep.points;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const winLevel = sweep.winLevel || 3;

  sweep.clear();

  if (points.length < 2) return;

  const segmentCount = points.length - 1;
  const rawPosition = clampedProgress * segmentCount;
  const fullSegments = Math.floor(rawPosition);
  const partial = rawPosition - fullSegments;

  const visiblePoints = [];

  visiblePoints.push(points[0]);

  for (
    let index = 1;
    index <= fullSegments && index < points.length;
    index += 1
  ) {
    visiblePoints.push(points[index]);
  }

  if (fullSegments < segmentCount) {
    const from = points[fullSegments];
    const to = points[fullSegments + 1];

    visiblePoints.push({
      x: from.x + (to.x - from.x) * partial,
      y: from.y + (to.y - from.y) * partial,
    });
  }

  if (visiblePoints.length < 2) {
    return;
  }

  const drawPolyline = (width, color, alpha) => {
    sweep.moveTo(visiblePoints[0].x, visiblePoints[0].y);

    for (let index = 1; index < visiblePoints.length; index += 1) {
      sweep.lineTo(visiblePoints[index].x, visiblePoints[index].y);
    }

    sweep.stroke({
      width,
      color,
      alpha,
      cap: "round",
      join: "round",
    });
  };

  const config = getWinLevelConfig(winLevel);

  drawPolyline(config.sweepOuterWidth, 0xffd76a, 0.16);
  drawPolyline(config.sweepMiddleWidth, 0xffd76a, 0.34);
  drawPolyline(config.sweepCoreWidth, 0xfff0a8, 0.92);
  drawPolyline(winLevel >= 5 ? 4 : winLevel >= 4 ? 3 : 2.5, 0xffffff, 0.96);

  const head = visiblePoints[visiblePoints.length - 1];

  sweep.circle(head.x, head.y, sweep.headRadius * 2.2);
  sweep.fill({ color: 0xffd76a, alpha: 0.24 });

  sweep.circle(head.x, head.y, sweep.headRadius * 1.25);
  sweep.fill({ color: 0xffffff, alpha: 0.9 });
}

function createRectSpark(rect, winLevel = 3) {
  const normalizedRect = normalizeSymbolRect(rect);

  if (!normalizedRect) return null;

  const config = getWinLevelConfig(winLevel);
  const spark = new Graphics();

  const size = getRandom(config.rectSparkSizeMin, config.rectSparkSizeMax);
  const angle = getRandom(0, Math.PI * 2);
  const speed = getRandom(config.rectSparkSpeedMin, config.rectSparkSpeedMax);
  const color = Math.random() > 0.35 ? 0xffd76a : 0xffffff;

  spark.circle(0, 0, size);
  spark.fill({ color, alpha: 0.95 });

  spark.x = normalizedRect.x + normalizedRect.width * getRandom(0.22, 0.78);
  spark.y = normalizedRect.y + normalizedRect.height * getRandom(0.22, 0.78);
  spark.vx = Math.cos(angle) * speed;
  spark.vy = Math.sin(angle) * speed;
  spark.life = 0;
  spark.maxLife =
    winLevel >= 5
      ? getRandom(48, 82)
      : winLevel >= 4
        ? getRandom(38, 70)
        : getRandom(34, 62);
  spark.rotationSpeed = getRandom(-0.1, 0.1);

  return spark;
}

function updateParticles(deltaTime) {
  if (!pixiApp || !particlesLayer) return;

  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;
  const time = performance.now() * 0.001;

  for (const particle of particles) {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;

    particle.alpha =
      particle.baseAlpha * (0.65 + Math.sin(time + particle.lifeOffset) * 0.35);

    if (particle.y < -10) {
      particle.y = height + 10;
      particle.x = getRandom(0, width);
    }

    if (particle.x < -10) {
      particle.x = width + 10;
    }

    if (particle.x > width + 10) {
      particle.x = -10;
    }
  }
}

function updateFlash(deltaTime) {
  if (!pixiApp || !flashLayer) return;

  if (flashAlpha > 0) {
    flashAlpha = Math.max(0, flashAlpha - 0.028 * deltaTime);
    drawFlash(pixiApp.renderer.width, pixiApp.renderer.height);
  }
}

function updateWinBursts(deltaTime) {
  if (!winLayer) return;

  for (let index = winBursts.length - 1; index >= 0; index -= 1) {
    const burst = winBursts[index];

    burst.life += deltaTime;

    const scaleSpeed = burst.scaleSpeed || 0.028;
    const fadeSpeed = burst.fadeSpeed || 0.016;

    burst.scale.x += scaleSpeed * deltaTime;
    burst.scale.y += scaleSpeed * deltaTime;
    burst.alpha -= fadeSpeed * deltaTime;

    if (burst.alpha <= 0) {
      winLayer.removeChild(burst);
      burst.destroy();
      winBursts.splice(index, 1);
    }
  }
}

function updateWinSparks(deltaTime) {
  if (!winLayer) return;

  for (let index = winSparks.length - 1; index >= 0; index -= 1) {
    const spark = winSparks[index];

    spark.life += deltaTime;
    spark.x += spark.vx * deltaTime;
    spark.y += spark.vy * deltaTime;
    spark.vy += 0.035 * deltaTime;
    spark.rotation += spark.rotationSpeed * deltaTime;
    spark.alpha = Math.max(0, 1 - spark.life / spark.maxLife);

    if (spark.life >= spark.maxLife) {
      winLayer.removeChild(spark);
      spark.destroy();
      winSparks.splice(index, 1);
    }
  }
}

function updateSymbolHighlights(deltaTime) {
  if (!winLayer) return;

  for (let index = symbolHighlights.length - 1; index >= 0; index -= 1) {
    const highlight = symbolHighlights[index];

    highlight.life += deltaTime;

    if (highlight.life < 0) {
      highlight.visible = false;
      continue;
    }

    highlight.visible = true;

    const progress = Math.min(1, highlight.life / highlight.maxLife);
    const pulse = Math.sin(highlight.life * highlight.pulseSpeed) * 0.075;

    highlight.scale.set(highlight.baseScale + pulse);
    highlight.alpha =
      progress < 0.78 ? 1 : Math.max(0, 1 - (progress - 0.78) / 0.22);

    if (highlight.life >= highlight.maxLife) {
      winLayer.removeChild(highlight);
      highlight.destroy();
      symbolHighlights.splice(index, 1);
    }
  }
}

function updatePaylineGlows(deltaTime) {
  if (!winLayer) return;

  for (let index = paylineGlows.length - 1; index >= 0; index -= 1) {
    const glow = paylineGlows[index];

    glow.life += deltaTime;

    const progress = glow.life / glow.maxLife;
    const pulse = 0.92 + Math.sin(glow.life * 0.18) * 0.08;

    glow.scale.y = pulse;
    glow.alpha = Math.max(0, 1 - progress);

    if (glow.life >= glow.maxLife) {
      winLayer.removeChild(glow);
      glow.destroy();
      paylineGlows.splice(index, 1);
    }
  }
}

function updateWinSweeps(deltaTime) {
  if (!winLayer) return;

  for (let index = winSweeps.length - 1; index >= 0; index -= 1) {
    const sweep = winSweeps[index];

    sweep.life += deltaTime;

    const progress = Math.min(1, sweep.life / sweep.maxLife);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    drawWinSweep(sweep, easedProgress);

    sweep.alpha =
      progress < 0.82 ? 1 : Math.max(0, 1 - (progress - 0.82) / 0.18);

    if (sweep.life >= sweep.maxLife) {
      winLayer.removeChild(sweep);
      sweep.destroy();
      winSweeps.splice(index, 1);
    }
  }
}

export async function initPixiEffects(options = {}) {
  const {
    containerSelector = "[data-pixi-effects-layer]",
    particleCount = 46,
  } = options;

  const container = document.querySelector(containerSelector);

  if (!container) {
    console.warn("[PixiEffects] Container not found:", containerSelector);
    return null;
  }

  if (pixiApp) {
    return pixiApp;
  }

  pixiApp = new Application();

  await pixiApp.init({
    width: Math.max(1, Math.floor(container.clientWidth)),
    height: Math.max(1, Math.floor(container.clientHeight)),
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  pixiApp.canvas.className = "pixi-effects-canvas";
  pixiApp.canvas.setAttribute("aria-hidden", "true");

  container.appendChild(pixiApp.canvas);

  rootLayer = new Container();
  glowLayer = new Graphics();
  particlesLayer = new Container();
  flashLayer = new Graphics();
  winLayer = new Container();

  rootLayer.addChild(glowLayer);
  rootLayer.addChild(particlesLayer);
  rootLayer.addChild(flashLayer);
  rootLayer.addChild(winLayer);

  pixiApp.stage.addChild(rootLayer);

  resizePixiCanvas(container);

  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = createParticle(width, height);
    particles.push(particle);
    particlesLayer.addChild(particle);
  }

  resizeObserver = new ResizeObserver(() => {
    resizePixiCanvas(container);
  });

  resizeObserver.observe(container);

  if (!rafReady) {
    pixiApp.ticker.add((ticker) => {
      updateParticles(ticker.deltaTime);
      updateFlash(ticker.deltaTime);
      updateWinBursts(ticker.deltaTime);
      updateWinSparks(ticker.deltaTime);
      updateSymbolHighlights(ticker.deltaTime);
      updatePaylineGlows(ticker.deltaTime);
      updateWinSweeps(ticker.deltaTime);
      updateScreenShake(ticker.deltaTime);
    });

    rafReady = true;
  }

  console.info("[PixiEffects] PixiJS effect layer initialized.");

  return pixiApp;
}

export function playPixiWinEffect(options = {}) {
  if (!pixiApp || !winLayer) return;

  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  const {
    symbolRects = [],
    showPayline = false,
    showSweep = true,
    paylineY = height * 0.48,
    winLevel = 3,
  } = options;

  const config = getWinLevelConfig(winLevel);
  const sparkCount = config.sparkCount;
  const lineSparkCount = config.lineSparkCount;
  const orderedRects = getOrderedNormalizedRects(symbolRects);

  flashAlpha = config.flashAlpha;
  startScreenShake(config);

  const burst = createWinBurst(width, height, winLevel);
  winBursts.push(burst);
  winLayer.addChild(burst);

  if (showPayline) {
    const paylineGlow = createPaylineGlow({
      y: paylineY,
      winLevel,
    });

    if (paylineGlow) {
      paylineGlows.push(paylineGlow);
      winLayer.addChild(paylineGlow);
    }
  }

  orderedRects.forEach((rect, index) => {
    const highlight = createSymbolHighlight(rect, index, winLevel);

    if (highlight) {
      symbolHighlights.push(highlight);
      winLayer.addChild(highlight);
    }
  });

  if (showSweep && orderedRects.length >= 2) {
    const sweep = createWinSweep(orderedRects, winLevel);

    if (sweep) {
      winSweeps.push(sweep);
      winLayer.addChild(sweep);
    }
  }

  const rectSparkCount = config.rectSparkCount;

  for (const rect of orderedRects) {
    for (let index = 0; index < rectSparkCount; index += 1) {
      const spark = createRectSpark(rect, winLevel);

      if (spark) {
        winSparks.push(spark);
        winLayer.addChild(spark);
      }
    }
  }

  for (let index = 0; index < sparkCount; index += 1) {
    const spark = createWinSpark(width, height, winLevel);
    winSparks.push(spark);
    winLayer.addChild(spark);
  }

  for (let index = 0; index < lineSparkCount; index += 1) {
    const spark = createLineSpark(width, height, winLevel);
    winSparks.push(spark);
    winLayer.addChild(spark);
  }
}

export function destroyPixiEffects() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  particles.length = 0;
  winBursts.length = 0;
  winSparks.length = 0;
  symbolHighlights.length = 0;
  paylineGlows.length = 0;
  winSweeps.length = 0;
  flashAlpha = 0;
  shakeState.life = 0;
  shakeState.maxLife = 0;
  shakeState.power = 0;
  resetScreenShake();

  if (pixiApp) {
    pixiApp.destroy(true, {
      children: true,
      texture: true,
      textureSource: true,
    });
  }

  pixiApp = null;
  rootLayer = null;
  particlesLayer = null;
  glowLayer = null;
  flashLayer = null;
  winLayer = null;
  rafReady = false;
}
