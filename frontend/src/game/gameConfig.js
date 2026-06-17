export const INITIAL_CREDITS = 12450;
export const DEFAULT_BET = 100;
export const MIN_BET = 10;
export const MAX_BET = 500;
export const SPIN_DURATION = 1000;

export const ACTIVE_PAYLINES = 25;

/**
 * Paytable system v1.4.1
 *
 * Standard line-slot style:
 * - total bet is split across 25 active paylines
 * - line bet = total bet / active paylines
 * - payout = line bet × symbol payout for 3 / 4 / 5 matching symbols
 * - wins are evaluated from left to right
 * - minimum winning streak is 3 matching paying symbols
 */

export const DEMO_SYMBOLS = [
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
  {
    id: "blank",
    label: "",
    className: "symbol--blank",
    payouts: {
      3: 0,
      4: 0,
      5: 0,
    },
  },
];