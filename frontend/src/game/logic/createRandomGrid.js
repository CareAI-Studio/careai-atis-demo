export function getRandomSymbol(symbols) {
  const index = Math.floor(Math.random() * symbols.length);
  return symbols[index];
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

export function createDemoFinalGrid(symbols, winChance = 0.35) {
  const grid = createRandomGrid(symbols);
  const shouldForceWin = Math.random() < winChance;

  if (!shouldForceWin) {
    return grid;
  }

  const winningSymbol = getRandomSymbol(symbols);
  const possibleStreaks = [3, 4, 5];
  const winningStreak =
    possibleStreaks[Math.floor(Math.random() * possibleStreaks.length)];

  for (let reelIndex = 0; reelIndex < winningStreak; reelIndex += 1) {
    grid[reelIndex][1] = winningSymbol;
  }

  return grid;
}