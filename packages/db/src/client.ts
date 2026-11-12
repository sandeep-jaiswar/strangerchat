import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

export type Database = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;
let db: Database | undefined;
let schemaReady: Promise<void> | undefined;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Returns a Drizzle Postgres client, or null when DATABASE_URL is not configured. */
export async function getDb(): Promise<Database | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 10 });
    db = drizzle(pool, { schema });
  }
  await ensureSchema(pool);
  return db!;
}

/** Idempotently ensures core tables exist so containers start without manual migrations. */
function ensureSchema(pgPool: Pool): Promise<void> {
  schemaReady ??= pgPool
    .query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        handle TEXT NOT NULL UNIQUE,
        avatar_seed TEXT NOT NULL,
        chess_rating INTEGER NOT NULL DEFAULT 1200,
        chess_wins INTEGER NOT NULL DEFAULT 0,
        chess_losses INTEGER NOT NULL DEFAULT 0,
        chess_draws INTEGER NOT NULL DEFAULT 0,
        puzzle_rating INTEGER NOT NULL DEFAULT 1200,
        daily_streak INTEGER NOT NULL DEFAULT 0,
        best_streak INTEGER NOT NULL DEFAULT 0,
        last_puzzle_date TEXT,
        puzzles_solved INTEGER NOT NULL DEFAULT 0,
        week_key TEXT,
        weekly_elo_gain INTEGER NOT NULL DEFAULT 0,
        banned_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS puzzle_rating INTEGER NOT NULL DEFAULT 1200;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_streak INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_puzzle_date TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS puzzles_solved INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS week_key TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_elo_gain INTEGER NOT NULL DEFAULT 0;

      CREATE TABLE IF NOT EXISTS daily_puzzle_solves (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        puzzle_id TEXT NOT NULL,
        solve_date TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, puzzle_id, solve_date)
      );

      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_low TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_high TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        requested_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_idx
        ON friendships (user_low, user_high);

      CREATE TABLE IF NOT EXISTS direct_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS dm_pair_time_idx
        ON direct_messages (sender_id, recipient_id, created_at);

      CREATE TABLE IF NOT EXISTS user_blocks (
        blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (blocker_id, blocked_id)
      );

      CREATE TABLE IF NOT EXISTS user_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reported_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chess_games (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        white_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        black_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        result TEXT NOT NULL,
        reason TEXT NOT NULL,
        moves TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    .then(() => undefined)
    .catch((err: unknown) => {
      schemaReady = undefined;
      throw err;
    });
  return schemaReady;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
    db = undefined;
    schemaReady = undefined;
  }
}
