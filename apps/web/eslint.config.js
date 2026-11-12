import { nextJsConfig } from "@funstranger/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  { ignores: ["public/stockfish/**"] },
];
