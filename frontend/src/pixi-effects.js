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

  flashLayer
    .rect(0, 0, width, height)
    .fill({ color: 0xffffff, alpha: flashAlpha * 0.1 });

  flashLayer
    .ellipse(width * 0.5, height * 0.48, width * 0.4, height * 0.18)
    .fill({ color: 0xffd76a, alpha: flashAlpha * 0.16 });

  flashLayer
    .ellipse(width * 0.5, height * 0.48, width * 0.58, height * 0.28)
    .stroke({ width: 3, color: 0xffd76a, alpha: flashAlpha * 0.38 });
}

function createWinBurst(width, height) {
  const burst = new Graphics();

  burst.x = width * 0.5;
  burst.y = height * 0.48;
  burst.scale.set(0.22);
  burst.alpha = 0.95;
  burst.life = 0;

  burst
    .circle(0, 0, 42)
    .stroke({ width: 4, color: 0xffffff, alpha: 0.85 });

  burst
    .circle(0, 0, 78)
    .stroke({ width: 2, color: 0xffd76a, alpha: 0.7 });

  burst
    .circle(0, 0, 118)
    .stroke({ width: 2, color: 0x62d6ff, alpha: 0.42 });

  return burst;
}

function createWinSpark(width, height) {
  const spark = new Graphics();

  const size = getRandom(2, 5.5);
  const angle = getRandom(0, Math.PI * 2);
  const speed = getRandom(1.8, 5.2);
  const color = Math.random() > 0.45 ? 0xffd76a : 0xffffff;

  spark.circle(0, 0, size);
  spark.fill({ color, alpha: 0.95 });

  spark.x = width * 0.5 + getRandom(-70, 70);
  spark.y = height * 0.48 + getRandom(-25, 25);
  spark.vx = Math.cos(angle) * speed;
  spark.vy = Math.sin(angle) * speed;
  spark.life = 0;
  spark.maxLife = getRandom(32, 58);
  spark.rotationSpeed = getRandom(-0.08, 0.08);

  return spark;
}

function createLineSpark(width, height) {
  const spark = new Graphics();

  const size = getRandom(1.6, 4.2);
  const direction = Math.random() > 0.5 ? 1 : -1;

  spark.circle(0, 0, size);
  spark.fill({ color: 0xfff0a8, alpha: 0.92 });

  spark.x = width * 0.5 + getRandom(-width * 0.25, width * 0.25);
  spark.y = height * 0.48 + getRandom(-12, 12);
  spark.vx = direction * getRandom(2.4, 5.8);
  spark.vy = getRandom(-0.7, 0.7);
  spark.life = 0;
  spark.maxLife = getRandom(24, 42);
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

function createSymbolHighlight(rect, index = 0) {
  const normalizedRect = normalizeSymbolRect(rect);

  if (!normalizedRect) return null;

  const highlight = new Graphics();

  const centerX = normalizedRect.x + normalizedRect.width * 0.5;
  const centerY = normalizedRect.y + normalizedRect.height * 0.5;
  const width = normalizedRect.width;
  const height = normalizedRect.height;
  const radius = Math.max(14, Math.min(width, height) * 0.18);

  highlight.x = centerX;
  highlight.y = centerY;
  highlight.life = index * -7;
  highlight.maxLife = 180;
  highlight.baseScale = 1;
  highlight.pulseSpeed = getRandom(0.13, 0.18);
  highlight.visible = index === 0;

  highlight
    .roundRect(-width * 0.52, -height * 0.52, width * 1.04, height * 1.04, radius)
    .fill({ color: 0xffd76a, alpha: 0.12 });

  highlight
    .roundRect(-width * 0.55, -height * 0.55, width * 1.1, height * 1.1, radius + 3)
    .stroke({ width: 9, color: 0xffd76a, alpha: 0.2 });

  highlight
    .roundRect(-width * 0.53, -height * 0.53, width * 1.06, height * 1.06, radius + 2)
    .stroke({ width: 5, color: 0xffd76a, alpha: 0.95 });

  highlight
    .roundRect(-width * 0.48, -height * 0.48, width * 0.96, height * 0.96, radius)
    .stroke({ width: 2, color: 0xffffff, alpha: 0.88 });

  highlight
    .roundRect(-width * 0.62, -height * 0.62, width * 1.24, height * 1.24, radius + 7)
    .stroke({ width: 2, color: 0x62d6ff, alpha: 0.34 });

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

  const glow = new Graphics();

  glow.life = 0;
  glow.maxLife = 58;
  glow.alpha = 0.95;

  glow
    .moveTo(width * 0.12, y)
    .lineTo(width * 0.88, y)
    .stroke({ width: 10, color: 0xffd76a, alpha: 0.16 });

  glow
    .moveTo(width * 0.12, y)
    .lineTo(width * 0.88, y)
    .stroke({ width: 5, color: 0xffd76a, alpha: 0.5 });

  glow
    .moveTo(width * 0.12, y)
    .lineTo(width * 0.88, y)
    .stroke({ width: 2, color: 0xffffff, alpha: 0.8 });

  return glow;
}

function createWinSweep(symbolRects = []) {
  const normalizedRects = getOrderedNormalizedRects(symbolRects);

  if (normalizedRects.length < 2) {
    return null;
  }

  const points = normalizedRects.map(getRectCenter);
  const sweep = new Graphics();

  sweep.points = points;
  sweep.life = 0;
  sweep.maxLife = 96;
  sweep.alpha = 1;
  sweep.headRadius = Math.max(
    5,
    Math.min(normalizedRects[0].width, normalizedRects[0].height) * 0.075,
  );

  drawWinSweep(sweep, 0);

  return sweep;
}

function drawWinSweep(sweep, progress) {
  if (!sweep?.points?.length) return;

  const points = sweep.points;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  sweep.clear();

  if (points.length < 2) return;

  const segmentCount = points.length - 1;
  const rawPosition = clampedProgress * segmentCount;
  const fullSegments = Math.floor(rawPosition);
  const partial = rawPosition - fullSegments;

  const visiblePoints = [];

  visiblePoints.push(points[0]);

  for (let index = 1; index <= fullSegments && index < points.length; index += 1) {
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

  drawPolyline(18, 0xffd76a, 0.16);
  drawPolyline(11, 0xffd76a, 0.34);
  drawPolyline(6, 0xfff0a8, 0.92);
  drawPolyline(2.5, 0xffffff, 0.96);

  const head = visiblePoints[visiblePoints.length - 1];

  sweep.circle(head.x, head.y, sweep.headRadius * 2.2);
  sweep.fill({ color: 0xffd76a, alpha: 0.24 });

  sweep.circle(head.x, head.y, sweep.headRadius * 1.25);
  sweep.fill({ color: 0xffffff, alpha: 0.9 });
}

function createRectSpark(rect) {
  const normalizedRect = normalizeSymbolRect(rect);

  if (!normalizedRect) return null;

  const spark = new Graphics();

  const size = getRandom(1.8, 4.4);
  const angle = getRandom(0, Math.PI * 2);
  const speed = getRandom(1.2, 3.6);
  const color = Math.random() > 0.35 ? 0xffd76a : 0xffffff;

  spark.circle(0, 0, size);
  spark.fill({ color, alpha: 0.95 });

  spark.x = normalizedRect.x + normalizedRect.width * getRandom(0.22, 0.78);
  spark.y = normalizedRect.y + normalizedRect.height * getRandom(0.22, 0.78);
  spark.vx = Math.cos(angle) * speed;
  spark.vy = Math.sin(angle) * speed;
  spark.life = 0;
  spark.maxLife = getRandom(34, 62);
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
    burst.scale.x += 0.028 * deltaTime;
    burst.scale.y += 0.028 * deltaTime;
    burst.alpha -= 0.016 * deltaTime;

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
    sparkCount = 32,
    lineSparkCount = 18,
  } = options;

  const orderedRects = getOrderedNormalizedRects(symbolRects);

  flashAlpha = 1;

  const burst = createWinBurst(width, height);
  winBursts.push(burst);
  winLayer.addChild(burst);

  if (showPayline) {
    const paylineGlow = createPaylineGlow({ y: paylineY });

    if (paylineGlow) {
      paylineGlows.push(paylineGlow);
      winLayer.addChild(paylineGlow);
    }
  }

  orderedRects.forEach((rect, index) => {
    const highlight = createSymbolHighlight(rect, index);

    if (highlight) {
      symbolHighlights.push(highlight);
      winLayer.addChild(highlight);
    }
  });

  if (showSweep && orderedRects.length >= 2) {
    const sweep = createWinSweep(orderedRects);

    if (sweep) {
      winSweeps.push(sweep);
      winLayer.addChild(sweep);
    }
  }

  for (const rect of orderedRects) {
    for (let index = 0; index < 4; index += 1) {
      const spark = createRectSpark(rect);

      if (spark) {
        winSparks.push(spark);
        winLayer.addChild(spark);
      }
    }
  }

  for (let index = 0; index < sparkCount; index += 1) {
    const spark = createWinSpark(width, height);
    winSparks.push(spark);
    winLayer.addChild(spark);
  }

  for (let index = 0; index < lineSparkCount; index += 1) {
    const spark = createLineSpark(width, height);
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