import { randomInt } from "node:crypto";

const ADJECTIVES = [
  "Amber",
  "Brave",
  "Calm",
  "Clever",
  "Cosmic",
  "Daring",
  "Echo",
  "Gentle",
  "Golden",
  "Hidden",
  "Jolly",
  "Kind",
  "Lucky",
  "Misty",
  "Nimble",
  "Quiet",
  "Rapid",
  "Silver",
  "Solar",
  "Swift",
  "Vivid",
  "Wise",
];

const NOUNS = [
  "Bishop",
  "Castle",
  "Comet",
  "Falcon",
  "Fox",
  "Gambit",
  "Knight",
  "Lynx",
  "Nebula",
  "Otter",
  "Owl",
  "Pawn",
  "Phoenix",
  "Queen",
  "Raven",
  "Rook",
  "Sparrow",
  "Tempo",
  "Tiger",
  "Wolf",
];

const HANDLE_PATTERN = /^[A-Za-z0-9_]{3,24}$/;

/** Generates a friendly anonymous handle like "QuietKnight482". */
export function generateHandle(): string {
  const adj = ADJECTIVES[randomInt(ADJECTIVES.length)] ?? "Quiet";
  const noun = NOUNS[randomInt(NOUNS.length)] ?? "Knight";
  const num = randomInt(100, 999);
  return `${adj}${noun}${num}`;
}

export function isValidHandle(value: string): boolean {
  return HANDLE_PATTERN.test(value);
}
