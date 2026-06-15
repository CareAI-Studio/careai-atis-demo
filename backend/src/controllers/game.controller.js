const DEMO_SYMBOLS = [
  {
    id: "robot",
    label: "🤖",
    className: "symbol--robot",
    multiplier: 4,
  },
  {
    id: "heart",
    label: "♥",
    className: "symbol--heart",
    multiplier: 3,
  },
  {
    id: "star",
    label: "★",
    className: "symbol--star",
    multiplier: 3,
  },
  {
    id: "chat",
    label: "💬",
    className: "symbol--chat",
    multiplier: 2,
  },
  {
    id: "ai",
    label: "AI",
    className: "symbol--ai",
    multiplier: 5,
  },
  {
    id: "diamond",
    label: "◆",
    className: "symbol--diamond",
    multiplier: 4,
  },
  {
    id: "bolt",
    label: "⚡",
    className: "symbol--bolt",
    multiplier: 4,
  },
];

const PAYOUT_MULTIPLIERS = {
  3: 2,
  4: 5,
  5: 12,
};

const DEFAULT_WIN_CHANCE = 0.28;

function getRandomSymbol(symbols) {
  const index = Math.floor(Math.random() * symbols.length);
  return symbols[index];
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

  const winningSymbol = getRandomSymbol(symbols);
  const possibleStreaks = [3, 4, 5];
  const winningStreak =
    possibleStreaks[Math.floor(Math.random() * possibleStreaks.length)];

  for (let reelIndex = 0; reelIndex < winningStreak; reelIndex += 1) {
    grid[reelIndex][1] = winningSymbol;
  }

  return grid;
}

function getMiddleLine(grid) {
  return grid.map((reel) => reel[1]);
}

function getLeftStreak(symbolLine) {
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

function calculateWin(grid, bet) {
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
    grid,
    result,
    timestamp: new Date().toISOString(),
  });
}