// src/audio/soundManager.js

let audioContext = null;
let masterGain = null;
let soundEnabled = true;
let audioUnlocked = false;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(audioContext.destination);
  }

  return audioContext;
}

export async function unlockAudio() {
  const ctx = getAudioContext();

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  audioUnlocked = true;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getWinLevelKey(winLevel = 3) {
  if (winLevel >= 5) return 5;
  if (winLevel >= 4) return 4;
  return 3;
}

function playTone({
  frequency = 440,
  duration = 0.12,
  type = "sine",
  volume = 0.25,
  attack = 0.01,
  release = 0.05,
  delay = 0,
}) {
  if (!soundEnabled || !audioUnlocked) return;

  const ctx = getAudioContext();
  const startTime = ctx.currentTime + delay;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    startTime + duration + release,
  );

  oscillator.connect(gain);
  gain.connect(masterGain);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + release + 0.02);
}

function playNoise({
  duration = 0.15,
  volume = 0.18,
  delay = 0,
  filterFrequency = 900,
}) {
  if (!soundEnabled || !audioUnlocked) return;

  const ctx = getAudioContext();
  const startTime = ctx.currentTime + delay;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFrequency, startTime);

  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  source.buffer = buffer;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  source.start(startTime);
  source.stop(startTime + duration);
}

function playWinSmallSequence() {
  playTone({
    frequency: 420,
    duration: 0.08,
    type: "triangle",
    volume: 0.16,
  });

  playTone({
    frequency: 560,
    duration: 0.09,
    type: "triangle",
    volume: 0.17,
    delay: 0.08,
  });

  playTone({
    frequency: 720,
    duration: 0.12,
    type: "triangle",
    volume: 0.19,
    delay: 0.16,
  });
}

function playWinMediumSequence() {
  playTone({
    frequency: 440,
    duration: 0.08,
    type: "triangle",
    volume: 0.2,
  });

  playTone({
    frequency: 590,
    duration: 0.09,
    type: "triangle",
    volume: 0.21,
    delay: 0.07,
  });

  playTone({
    frequency: 760,
    duration: 0.11,
    type: "triangle",
    volume: 0.23,
    delay: 0.14,
  });

  playTone({
    frequency: 980,
    duration: 0.14,
    type: "triangle",
    volume: 0.22,
    delay: 0.23,
  });

  playNoise({
    duration: 0.22,
    volume: 0.08,
    delay: 0.12,
    filterFrequency: 1700,
  });
}

function playWinBigSequence() {
  const notes = [520, 660, 780, 1040, 1320, 1560];

  notes.forEach((note, index) => {
    playTone({
      frequency: note,
      duration: index >= 4 ? 0.15 : 0.11,
      type: "triangle",
      volume: index >= 4 ? 0.26 : 0.23,
      delay: index * 0.085,
    });
  });

  playTone({
    frequency: 260,
    duration: 0.22,
    type: "sawtooth",
    volume: 0.08,
    attack: 0.015,
    release: 0.12,
    delay: 0.02,
  });

  playNoise({
    duration: 0.42,
    volume: 0.14,
    delay: 0.12,
    filterFrequency: 1900,
  });

  playNoise({
    duration: 0.28,
    volume: 0.09,
    delay: 0.28,
    filterFrequency: 2800,
  });
}

export function playButtonSound() {
  playTone({
    frequency: 520,
    duration: 0.06,
    type: "triangle",
    volume: 0.14,
  });
}

export function playSpinStartSound() {
  playNoise({
    duration: 0.22,
    volume: 0.2,
    filterFrequency: 700,
  });

  playTone({
    frequency: 160,
    duration: 0.12,
    type: "sawtooth",
    volume: 0.08,
  });
}

export function playReelStopSound(index = 0) {
  playTone({
    frequency: 260 + index * 40,
    duration: 0.08,
    type: "square",
    volume: 0.12,
  });
}

export function playSmallWinSound() {
  playWinSmallSequence();
}

export function playBigWinSound() {
  playWinBigSequence();
}

export function playWinLevelSound(winLevel = 3) {
  const level = getWinLevelKey(winLevel);

  if (level >= 5) {
    playWinBigSequence();
    return;
  }

  if (level >= 4) {
    playWinMediumSequence();
    return;
  }

  playWinSmallSequence();
}

export function playNoCreditSound() {
  playTone({
    frequency: 180,
    duration: 0.12,
    type: "sawtooth",
    volume: 0.16,
  });

  playTone({
    frequency: 120,
    duration: 0.14,
    type: "sawtooth",
    volume: 0.13,
    delay: 0.11,
  });
}