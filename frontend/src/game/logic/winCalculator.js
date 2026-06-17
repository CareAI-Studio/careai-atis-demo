import { ACTIVE_PAYLINES } from "../gameConfig.js";
import { PAYLINES } from "./paylines.js";

export function getSymbolLineByRows(grid, rows) {
  return rows.map((rowIndex, reelIndex) => grid[reelIndex]?.[rowIndex]);
}

export function getLineBet(totalBet) {
  return totalBet / ACTIVE_PAYLINES;
}

export function getSymbolPayoutMultiplier(symbol, streak) {
  if (!symbol?.payouts) {
    return 0;
  }

  return symbol.payouts[streak] || 0;
}

export function isPayingSymbol(symbol) {
  return Boolean(symbol?.payouts?.[3] && symbol.payouts[3] > 0);
}

export function getLeftStreak(symbolLine) {
  if (!symbolLine.length || !symbolLine[0]) {
    return 0;
  }

  const firstSymbol = symbolLine[0];

  if (!isPayingSymbol(firstSymbol)) {
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
  const lineBet = getLineBet(bet);

  if (streak < 3) {
    return {
      payout: 0,
      lineBet,
      payoutMultiplier: 0,
      winningSymbol: null,
      winningStreak: streak,
      winningLine: symbolLine,
      winningLineId: payline.id,
      winningLineLabel: payline.label,
      winningPositions: [],
    };
  }

  const winningSymbol = symbolLine[0];
  const payoutMultiplier = getSymbolPayoutMultiplier(winningSymbol, streak);

  if (!payoutMultiplier || payoutMultiplier <= 0) {
    return {
      payout: 0,
      lineBet,
      payoutMultiplier: 0,
      winningSymbol: null,
      winningStreak: 0,
      winningLine: symbolLine,
      winningLineId: payline.id,
      winningLineLabel: payline.label,
      winningPositions: [],
    };
  }

  const rawPayout = lineBet * payoutMultiplier;
  const payout = Math.max(1, Math.round(rawPayout));

  return {
    payout,
    lineBet,
    payoutMultiplier,
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
      lineBet: getLineBet(bet),
      payoutMultiplier: 0,
      winningSymbol: null,
      winningStreak: bestResult?.winningStreak || 0,
      winningLine: null,
      winningLineId: null,
      winningLineLabel: null,
      winningPositions: [],
      winningLines: [],
      evaluatedLines: PAYLINES.length,
      activePaylines: ACTIVE_PAYLINES,
    };
  }

  return {
    payout: totalPayout,
    lineBet: getLineBet(bet),
    payoutMultiplier: bestResult.payoutMultiplier,
    winningSymbol: bestResult.winningSymbol,
    winningStreak: bestResult.winningStreak,
    winningLine: bestResult.winningLine,
    winningLineId: bestResult.winningLineId,
    winningLineLabel: bestResult.winningLineLabel,
    winningPositions: bestResult.winningPositions,
    winningLines,
    evaluatedLines: PAYLINES.length,
    activePaylines: ACTIVE_PAYLINES,
  };
}