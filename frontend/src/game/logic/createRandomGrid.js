import { PAYLINES } from "./paylines.js";

const BLANK_SYMBOL = {
  id: "blank",
  label: "",
  className: "symbol--blank",
  payouts: {
    3: 0,
    4: 0,
    5: 0,
  },
};

const BLANK_SYMBOL_WEIGHT = 0;

function createWeightedSymbolPool(symbols) {
  const payingSymbols = symbols.filter((symbol) => symbol.id !== "blank");

  const blankSymbols = Array.from(
    { length: BLANK_SYMBOL_WEIGHT },
    () => BLANK_SYMBOL,
  );

  return [...payingSymbols, ...blankSymbols];
}

function isPayingSymbol(symbol) {
  return Boolean(symbol?.payouts?.[3] && symbol.payouts[3] > 0);
}

export function getRandomSymbol(symbols) {
  const weightedSymbols = createWeightedSymbolPool(symbols);
  const index = Math.floor(Math.random() * weightedSymbols.length);

  return weightedSymbols[index];
}

export function getRandomPayingSymbol(symbols) {
  const payingSymbols = symbols.filter(isPayingSymbol);

  if (!payingSymbols.length) {
    return null;
  }

  const index = Math.floor(Math.random() * payingSymbols.length);

  return payingSymbols[index];
}

export function createRandomGrid(symbols, reelsCount = 5, rowsCount = 3) {
  const grid = [];

  for (let reelIndex = 0; reelIndex < reelsCount; reelIndex += 1) {
    const reel = [];

    for (let rowIndex = 0; rowIndex < rowsCount; rowIndex += 1) {
      reel.push(getRandomSymbol(symbols));
    }

    grid.push(reel);
  }

  return grid;
}

export function createDemoFinalGrid(symbols, winChance = 0.10) {
  const grid = createRandomGrid(symbols);
  const shouldForceWin = Math.random() < winChance;

  if (!shouldForceWin) {
    return grid;
  }

  const winningSymbol = getRandomPayingSymbol(symbols);

  if (!winningSymbol) {
    return grid;
  }

  const possibleStreaks = [3, 4, 5];
  const winningStreak =
    possibleStreaks[Math.floor(Math.random() * possibleStreaks.length)];
  const winningPayline =
    PAYLINES[Math.floor(Math.random() * PAYLINES.length)];

  for (let reelIndex = 0; reelIndex < winningStreak; reelIndex += 1) {
    const rowIndex = winningPayline.rows[reelIndex];
    grid[reelIndex][rowIndex] = winningSymbol;
  }

  return grid;
}