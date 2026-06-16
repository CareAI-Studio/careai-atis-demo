import { Application, Container, Graphics } from "pixi.js";

let pixiApp = null;
let rootLayer = null;
let particlesLayer = null;
let glowLayer = null;
let winLayer = null;
let resizeObserver = null;
let rafReady = false;

const particles = [];
const winBursts = [];

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(width, height) {
  const particle = new Graphics();

  const radius = getRandom(1.2, 3.2);
  const alpha = getRandom(0.18, 0.55);

  particle.circle(0, 0, radius);
  particle.fill({ color: 0xffffff, alpha });

  particle.x = getRandom(0, width);
  particle.y = getRandom(0, height);
  particle.vx = getRandom(-0.18, 0.18);
  particle.vy = getRandom(-0.35, -0.08);
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

function createWinBurst(width, height) {
  const burst = new Graphics();

  burst.x = width * 0.5;
  burst.y = height * 0.5;
  burst.scale.set(0.2);
  burst.alpha = 0.95;
  burst.life = 0;

  burst
    .circle(0, 0, 42)
    .stroke({ width: 4, color: 0xffffff, alpha: 0.85 });

  burst
    .circle(0, 0, 74)
    .stroke({ width: 2, color: 0x62d6ff, alpha: 0.55 });

  return burst;
}

function spawnWinSpark(width, height) {
  const spark = new Graphics();

  const size = getRandom(2, 5);
  const angle = getRandom(0, Math.PI * 2);
  const speed = getRandom(1.4, 4.2);

  spark.circle(0, 0, size);
  spark.fill({ color: 0xffffff, alpha: 0.95 });

  spark.x = width * 0.5;
  spark.y = height * 0.5;
  spark.vx = Math.cos(angle) * speed;
  spark.vy = Math.sin(angle) * speed;
  spark.life = 0;
  spark.maxLife = getRandom(26, 48);
  spark.isWinSpark = true;

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

function updateWinBursts(deltaTime) {
  if (!winLayer) return;

  for (let index = winBursts.length - 1; index >= 0; index -= 1) {
    const burst = winBursts[index];

    burst.life += deltaTime;
    burst.scale.x += 0.025 * deltaTime;
    burst.scale.y += 0.025 * deltaTime;
    burst.alpha -= 0.018 * deltaTime;

    if (burst.alpha <= 0) {
      winLayer.removeChild(burst);
      burst.destroy();
      winBursts.splice(index, 1);
    }
  }

  for (let index = winLayer.children.length - 1; index >= 0; index -= 1) {
    const child = winLayer.children[index];

    if (!child.isWinSpark) continue;

    child.life += deltaTime;
    child.x += child.vx * deltaTime;
    child.y += child.vy * deltaTime;
    child.vy += 0.045 * deltaTime;
    child.alpha = 1 - child.life / child.maxLife;

    if (child.life >= child.maxLife) {
      winLayer.removeChild(child);
      child.destroy();
    }
  }
}

export async function initPixiEffects(options = {}) {
  const {
    containerSelector = "[data-pixi-effects-layer]",
    particleCount = 42,
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
  winLayer = new Container();

  rootLayer.addChild(glowLayer);
  rootLayer.addChild(particlesLayer);
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
      updateWinBursts(ticker.deltaTime);
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

  const burst = createWinBurst(width, height);
  winBursts.push(burst);
  winLayer.addChild(burst);

  for (let index = 0; index < 26; index += 1) {
    winLayer.addChild(spawnWinSpark(width, height));
  }
}

export function destroyPixiEffects() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  particles.length = 0;
  winBursts.length = 0;

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
  winLayer = null;
  rafReady = false;
}