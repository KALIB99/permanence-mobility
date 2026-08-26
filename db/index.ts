import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

declare global {
  var __permanenceDb: Database | undefined;
  var __permanenceSql: ReturnType<typeof postgres> | undefined;
}

function createDatabase(connectionString: string): Database {
  const client = postgres(connectionString, {
    prepare: false,
    max: 10,
  });
  globalThis.__permanenceSql = client;
  return drizzle(client, { schema });
}

/**
 * Typed Drizzle client when `DATABASE_URL` is set.
 * Remains `null` in environments without a database connection string
 * (e.g. local UI work, unit tests that do not touch Postgres).
 */
export const db: Database | null = (() => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__permanenceDb) {
      globalThis.__permanenceDb = createDatabase(url);
    }
    return globalThis.__permanenceDb;
  }
  return createDatabase(url);
})();

export function requireDb(): Database {
  if (!db) {
    throw new Error(
      "DATABASE_URL is not set. Configure a Postgres connection string to use the Drizzle client.",
    );
  }
  return db;
}

/** Alias for callers that expect `getDb()`. */
export function getDb(): Database {
  return requireDb();
}

export { schema };
