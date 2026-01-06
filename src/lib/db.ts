import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/historian2";
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool);
