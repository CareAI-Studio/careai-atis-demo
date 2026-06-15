export const INITIAL_CREDITS = 12450;
export const DEFAULT_BET = 100;
export const MIN_BET = 10;
export const MAX_BET = 500;
export const SPIN_DURATION = 1000;

export const PAYOUT_MULTIPLIERS = {
  3: 2,
  4: 5,
  5: 12,
};

export const DEMO_SYMBOLS = [
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