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
    .fill({ color: 0xffffff, alpha: flashAlpha * 0.12 });

  flashLayer
    .ellipse(width * 0.5, height * 0.48, width * 0.4, height * 0.18)
    .fill({ color: 0xffd76a, alpha: flashAlpha * 0.18 });

  flashLayer
    .ellipse(width * 0.5, height * 0.48, width * 0.58, height * 0.28)
    .stroke({ width: 3, color: 0xffd76a, alpha: flashAlpha * 0.45 });
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
    flashAlpha = Math.max(0, flashAlpha - 0.035 * deltaTime);
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
    });

    rafReady = true;
  }

  console.info("[PixiEffects] PixiJS effect layer initialized.");

  return pixiApp;
}

export function playPixiWinEffect() {
  if (!pixiApp || !winLayer) return;

  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  flashAlpha = 1;

  const burst = createWinBurst(width, height);
  winBursts.push(burst);
  winLayer.addChild(burst);

  for (let index = 0; index < 32; index += 1) {
    const spark = createWinSpark(width, height);
    winSparks.push(spark);
    winLayer.addChild(spark);
  }

  for (let index = 0; index < 18; index += 1) {
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
