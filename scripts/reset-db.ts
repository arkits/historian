import { Pool } from "pg";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/historian2";

async function resetDatabase() {
  console.log("Resetting database tables...\n");

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(`DROP TABLE IF EXISTS "session" CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS "account" CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS "verification" CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS "user" CASCADE`);

    console.log("✓ Dropped all existing tables");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        "image" TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        "password" TEXT,
        "scope" TEXT,
        "idToken" TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL
      )
    `);

    await pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user"("email")`,
    );

    console.log("✓ Created all tables with correct schema");

    console.log("\n" + "=".repeat(50));
    console.log("Database reset complete! ✓");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n✗ Failed to reset database:");
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
