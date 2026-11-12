import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  avatarSeed: text("avatar_seed").notNull(),
  chessRating: integer("chess_rating").notNull().default(1200),
  chessWins: integer("chess_wins").notNull().default(0),
  chessLosses: integer("chess_losses").notNull().default(0),
  chessDraws: integer("chess_draws").notNull().default(0),
  puzzleRating: integer("puzzle_rating").notNull().default(1200),
  dailyStreak: integer("daily_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastPuzzleDate: text("last_puzzle_date"),
  puzzlesSolved: integer("puzzles_solved").notNull().default(0),
  weekKey: text("week_key"),
  weeklyEloGain: integer("weekly_elo_gain").notNull().default(0),
  bannedUntil: timestamp("banned_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dailyPuzzleSolves = pgTable(
  "daily_puzzle_solves",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    puzzleId: text("puzzle_id").notNull(),
    solveDate: text("solve_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.puzzleId, table.solveDate] }),
  ],
);

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userLow: text("user_low")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userHigh: text("user_high")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestedBy: text("requested_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("friendships_pair_idx").on(table.userLow, table.userHigh),
  ],
);

export const directMessages = pgTable(
  "direct_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("dm_pair_time_idx").on(table.senderId, table.recipientId, table.createdAt),
  ],
);

export const userBlocks = pgTable(
  "user_blocks",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.blockerId, table.blockedId] })],
);

export const userReports = pgTable("user_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reportedId: text("reported_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chessGames = pgTable("chess_games", {
  id: uuid("id").defaultRandom().primaryKey(),
  whiteId: text("white_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blackId: text("black_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  result: text("result").notNull(),
  reason: text("reason").notNull(),
  moves: text("moves").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
