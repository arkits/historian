import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./src/lib/db";

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
