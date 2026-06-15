import { PAYOUT_MULTIPLIERS } from "../gameConfig.js";

export function getMiddleLine(grid) {
  return grid.map((reel) => reel[1]);
}

export function getLeftStreak(symbolLine) {
  if (!symbolLine.length) {
    return 0;
  }

  const firstSymbolId = symbolLine[0].id;
  let streak = 1;

  while (
    streak < symbolLine.length &&
    symbolLine[streak].id === firstSymbolId
  ) {
    streak += 1;
  }

  return streak;
}

export function calculateWin(grid, bet) {
  const middleLine = getMiddleLine(grid);
  const streak = getLeftStreak(middleLine);

  if (streak < 3) {
    return {
      payout: 0,
      winningSymbol: null,
      winningStreak: streak,
      winningLine: middleLine,
    };
  }

  const winningSymbol = middleLine[0];
  const lineMultiplier = PAYOUT_MULTIPLIERS[streak] || 0;
  const payout = bet * lineMultiplier * winningSymbol.multiplier;

  return {
    payout,
    winningSymbol,
    winningStreak: streak,
    winningLine: middleLine,
  };
}