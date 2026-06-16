import { PAYOUT_MULTIPLIERS } from "../gameConfig.js";
import { PAYLINES } from "./paylines.js";

export function getSymbolLineByRows(grid, rows) {
  return rows.map((rowIndex, reelIndex) => grid[reelIndex]?.[rowIndex]);
}

export function getLeftStreak(symbolLine) {
  if (!symbolLine.length || !symbolLine[0]) {
    return 0;
  }

  const firstSymbol = symbolLine[0];

  if (!firstSymbol.multiplier || firstSymbol.multiplier <= 0) {
    return 0;
  }

  const firstSymbolId = firstSymbol.id;
  let streak = 1;

  while (
    streak < symbolLine.length &&
    symbolLine[streak] &&
    symbolLine[streak].id === firstSymbolId
  ) {
    streak += 1;
  }

  return streak;
}

export function createWinningPositions(payline, winningStreak) {
  if (!payline || winningStreak < 3) {
    return [];
  }

  return Array.from({ length: winningStreak }, (_, reelIndex) => ({
    reelIndex,
    rowIndex: payline.rows[reelIndex],
  }));
}

export function calculateLineWin(grid, bet, payline) {
  const symbolLine = getSymbolLineByRows(grid, payline.rows);
  const streak = getLeftStreak(symbolLine);

  if (streak < 3) {
    return {
      payout: 0,
      winningSymbol: null,
      winningStreak: streak,
      winningLine: symbolLine,
      winningLineId: payline.id,
      winningLineLabel: payline.label,
      winningPositions: [],
    };
  }

  const winningSymbol = symbolLine[0];

  if (!winningSymbol.multiplier || winningSymbol.multiplier <= 0) {
    return {
      payout: 0,
      winningSymbol: null,
      winningStreak: 0,
      winningLine: symbolLine,
      winningLineId: payline.id,
      winningLineLabel: payline.label,
      winningPositions: [],
    };
  }

  const lineMultiplier = PAYOUT_MULTIPLIERS[streak] || 0;
  const payout = bet * lineMultiplier * winningSymbol.multiplier;

  return {
    payout,
    winningSymbol,
    winningStreak: streak,
    winningLine: symbolLine,
    winningLineId: payline.id,
    winningLineLabel: payline.label,
    winningPositions: createWinningPositions(payline, streak),
  };
}

export function calculateWin(grid, bet) {
  const lineResults = PAYLINES.map((payline) =>
    calculateLineWin(grid, bet, payline),
  );

  const bestResult = lineResults.reduce((best, current) => {
    if (current.payout > best.payout) {
      return current;
    }

    if (
      current.payout === best.payout &&
      current.winningStreak > best.winningStreak
    ) {
      return current;
    }

    return best;
  }, lineResults[0]);

  const winningLines = lineResults.filter((result) => result.payout > 0);
  const totalPayout = winningLines.reduce(
    (sum, result) => sum + result.payout,
    0,
  );

  if (!winningLines.length) {
    return {
      payout: 0,
      winningSymbol: null,
      winningStreak: bestResult?.winningStreak || 0,
      winningLine: null,
      winningLineId: null,
      winningLineLabel: null,
      winningPositions: [],
      winningLines: [],
      evaluatedLines: PAYLINES.length,
    };
  }

  return {
    payout: totalPayout,
    winningSymbol: bestResult.winningSymbol,
    winningStreak: bestResult.winningStreak,
    winningLine: bestResult.winningLine,
    winningLineId: bestResult.winningLineId,
    winningLineLabel: bestResult.winningLineLabel,
    winningPositions: bestResult.winningPositions,
    winningLines,
    evaluatedLines: PAYLINES.length,
  };
}