export interface ChessPuzzle {
  id: string;
  title: string;
  theme: string;
  rating: number;
  fen: string;
  /** Winning SAN move sequence starting from the side to move in `fen`. */
  solution: string[];
}

export const CHESS_PUZZLES: readonly ChessPuzzle[] = [
  {
    id: "back-rank-1",
    title: "Back-Rank Weakness",
    theme: "Mate in 1",
    rating: 900,
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    solution: ["Ra8#"],
  },
  {
    id: "smothered-1",
    title: "Smothered Knight",
    theme: "Mate in 1",
    rating: 1100,
    fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1",
    solution: ["Nf7#"],
  },
  {
    id: "f7-strike",
    title: "Target f7",
    theme: "Mate in 1",
    rating: 850,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["Qxf7#"],
  },
  {
    id: "arabian-mate",
    title: "Arabian Mate",
    theme: "Mate in 1",
    rating: 1150,
    fen: "7k/5N2/6K1/8/8/8/8/R7 w - - 0 1",
    solution: ["Ra8#"],
  },
  {
    id: "fork-queen",
    title: "Royal Knight Fork",
    theme: "Winning Fork",
    rating: 1200,
    fen: "4k3/8/3q4/8/4N3/8/8/4K3 w - - 0 1",
    solution: ["Nxd6+"],
  },
  {
    id: "anastasia-mate",
    title: "Corner Trap",
    theme: "Mate in 1",
    rating: 1250,
    fen: "7k/4N1pp/8/8/8/8/8/R5K1 w - - 0 1",
    solution: ["Ra8#"],
  },
  {
    id: "ladder-mate",
    title: "Rook Roller",
    theme: "Mate in 1",
    rating: 800,
    fen: "3k4/R7/1R6/8/8/8/8/4K3 w - - 0 1",
    solution: ["Rb8#"],
  },
  {
    id: "bishop-battery",
    title: "Diagonal Mate",
    theme: "Mate in 1",
    rating: 1050,
    fen: "6k1/5ppp/8/8/8/1B6/4Q3/6K1 w - - 0 1",
    solution: ["Qe8#"],
  },
  {
    id: "black-back-rank",
    title: "Black Back-Rank",
    theme: "Mate in 1",
    rating: 950,
    fen: "6k1/8/8/8/8/8/r4PPP/6K1 b - - 0 1",
    solution: ["Ra1#"],
  },
  {
    id: "opera-mate",
    title: "Opera Mate Net",
    theme: "Mate in 1",
    rating: 1200,
    fen: "4kr2/4ppp1/8/B7/8/8/8/3R2K1 w - - 0 1",
    solution: ["Rd8#"],
  },
  {
    id: "skewer-queen",
    title: "Royal Rook Skewer",
    theme: "Winning Skewer",
    rating: 1180,
    fen: "4q3/8/8/4k3/8/8/8/R5K1 w - - 0 1",
    solution: ["Re1+"],
  },
  {
    id: "mate-in-2-corridor",
    title: "Corridor Clearance",
    theme: "Mate in 2",
    rating: 1350,
    fen: "r5k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1",
    solution: ["Qe8+", "Rxe8", "Rxe8#"],
  },
] as const;

export const CHESS_PUZZLE_BY_ID: ReadonlyMap<string, ChessPuzzle> = new Map(
  CHESS_PUZZLES.map((p) => [p.id, p]),
);
