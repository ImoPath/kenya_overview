import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pgPool?: Pool };

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set.");
  }
  return databaseUrl;
}

export const pgPool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pgPool;
}
