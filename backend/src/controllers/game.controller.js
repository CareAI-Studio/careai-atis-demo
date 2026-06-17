const ACTIVE_PAYLINES = 25;

const DEMO_SYMBOLS = [
  {
    id: "robot",
    label: "🤖",
    className: "symbol--robot",
    payouts: {
      3: 4,
      4: 18,
      5: 80,
    },
  },
  {
    id: "heart",
    label: "♥",
    className: "symbol--heart",
    payouts: {
      3: 2,
      4: 8,
      5: 30,
    },
  },
  {
    id: "star",
    label: "★",
    className: "symbol--star",
    payouts: {
      3: 3,
      4: 10,
      5: 40,
    },
  },
  {
    id: "chat",
    label: "💬",
    className: "symbol--chat",
    payouts: {
      3: 1,
      4: 4,
      5: 15,
    },
  },
  {
    id: "ai",
    label: "AI",
    className: "symbol--ai",
    payouts: {
      3: 5,
      4: 25,
      5: 120,
    },
  },
  {
    id: "diamond",
    label: "◆",
    className: "symbol--diamond",
    payouts: {
      3: 4,
      4: 16,
      5: 70,
    },
  },
  {
    id: "bolt",
    label: "⚡",
    className: "symbol--bolt",
    payouts: {
      3: 3,
      4: 14,
      5: 60,
    },
  },
];

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

const BLANK_SYMBOL_WEIGHT = 5;

const PAYLINES = [
  { id: 1, label: "Linie 1", rows: [1, 1, 1, 1, 1] },
  { id: 2, label: "Linie 2", rows: [0, 0, 0, 0, 0] },
  { id: 3, label: "Linie 3", rows: [2, 2, 2, 2, 2] },
  { id: 4, label: "Linie 4", rows: [0, 1, 2, 1, 0] },
  { id: 5, label: "Linie 5", rows: [2, 1, 0, 1, 2] },
  { id: 6, label: "Linie 6", rows: [0, 0, 1, 0, 0] },
  { id: 7, label: "Linie 7", rows: [2, 2, 1, 2, 2] },
  { id: 8, label: "Linie 8", rows: [1, 0, 0, 0, 1] },
  { id: 9, label: "Linie 9", rows: [1, 2, 2, 2, 1] },
  { id: 10, label: "Linie 10", rows: [0, 1, 1, 1, 0] },
  { id: 11, label: "Linie 11", rows: [2, 1, 1, 1, 2] },
  { id: 12, label: "Linie 12", rows: [1, 0, 1, 0, 1] },
  { id: 13, label: "Linie 13", rows: [1, 2, 1, 2, 1] },
  { id: 14, label: "Linie 14", rows: [0, 1, 0, 1, 0] },
  { id: 15, label: "Linie 15", rows: [2, 1, 2, 1, 2] },
  { id: 16, label: "Linie 16", rows: [0, 0, 1, 2, 2] },
  { id: 17, label: "Linie 17", rows: [2, 2, 1, 0, 0] },
  { id: 18, label: "Linie 18", rows: [0, 1, 2, 2, 2] },
  { id: 19, label: "Linie 19", rows: [2, 1, 0, 0, 0] },
  { id: 20, label: "Linie 20", rows: [1, 1, 0, 1, 1] },
  { id: 21, label: "Linie 21", rows: [1, 1, 2, 1, 1] },
  { id: 22, label: "Linie 22", rows: [0, 1, 1, 1, 2] },
  { id: 23, label: "Linie 23", rows: [2, 1, 1, 1, 0] },
  { id: 24, label: "Linie 24", rows: [0, 2, 0, 2, 0] },
  { id: 25, label: "Linie 25", rows: [2, 0, 2, 0, 2] },
];

const DEFAULT_WIN_CHANCE = 0.04;

function createWeightedSymbolPool(symbols) {
  const blankSymbols = Array.from(
    { length: BLANK_SYMBOL_WEIGHT },
    () => BLANK_SYMBOL,
  );

  return [...symbols, ...blankSymbols];
}

function isPayingSymbol(symbol) {
  return Boolean(symbol?.payouts?.[3] && symbol.payouts[3] > 0);
}

function getRandomSymbol(symbols) {
  const weightedSymbols = createWeightedSymbolPool(symbols);
  const index = Math.floor(Math.random() * weightedSymbols.length);

  return weightedSymbols[index];
}

function getRandomPayingSymbol(symbols) {
  const payingSymbols = symbols.filter(isPayingSymbol);
  const index = Math.floor(Math.random() * payingSymbols.length);

  return payingSymbols[index];
}

function createRandomGrid(symbols, reelsCount = 5, rowsCount = 3) {
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

function createDemoFinalGrid(symbols, winChance = DEFAULT_WIN_CHANCE) {
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

function getSymbolLineByRows(grid, rows) {
  return rows.map((rowIndex, reelIndex) => grid[reelIndex]?.[rowIndex]);
}

function getLineBet(totalBet) {
  return totalBet / ACTIVE_PAYLINES;
}

function getSymbolPayoutMultiplier(symbol, streak) {
  if (!symbol?.payouts) {
    return 0;
  }

  return symbol.payouts[streak] || 0;
}

function getLeftStreak(symbolLine) {
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

function createWinningPositions(payline, winningStreak) {
  if (!payline || winningStreak < 3) {
    return [];
  }

  return Array.from({ length: winningStreak }, (_, reelIndex) => ({
    reelIndex,
    rowIndex: payline.rows[reelIndex],
  }));
}

function calculateLineWin(grid, bet, payline) {
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

function calculateWin(grid, bet) {
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

export function spinDemoGame(req, res) {
  const bet = Number(req.body?.bet || 100);

  if (!Number.isFinite(bet) || bet <= 0) {
    return res.status(400).json({
      error: "Invalid bet value.",
    });
  }

  const grid = createDemoFinalGrid(DEMO_SYMBOLS, DEFAULT_WIN_CHANCE);
  const result = calculateWin(grid, bet);

  return res.json({
    mode: "demo",
    bet,
    activeLines: PAYLINES.length,
    lineBet: getLineBet(bet),
    paytableVersion: "v1.4.1-line-bet",
    grid,
    result,
    timestamp: new Date().toISOString(),
  });
}