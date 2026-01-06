import "dotenv/config";
import { db, pool } from "../src/lib/db";
import { user, history } from "../src/lib/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface CsvHistoryRecord {
  id: string;
  createdAt: string;
  content: string;
  userId: string;
  type: string;
  contentId: string;
  searchContent: string | null;
  timelineTime: string;
}

function parseCSV(filePath: string): CsvHistoryRecord[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  const headers = lines[0]!.split(",").map((h) => h.replace(/^"|"$/g, ""));

  const records: CsvHistoryRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);

    const record: CsvHistoryRecord = {
      id: values[0]?.replace(/^"|"$/g, "") || "",
      createdAt: values[1]?.replace(/^"|"$/g, "") || "",
      content: values[2]?.replace(/^"|"$/g, "") || "",
      userId: values[3]?.replace(/^"|"$/g, "") || "",
      type: values[4]?.replace(/^"|"$/g, "") || "",
      contentId: values[5]?.replace(/^"|"$/g, "") || "",
      searchContent: values[6] ? values[6].replace(/^"|"$/g, "") : null,
      timelineTime: values[7]?.replace(/^"|"$/g, "") || "",
    };

    records.push(record);
  }

  return records;
}

async function importHistory() {
  const csvPath = path.resolve("./History.csv");
  console.log(`Reading history from ${csvPath}...`);

  const csvRecords = parseCSV(csvPath);
  console.log(`Found ${csvRecords.length} records in CSV`);

  console.log("Finding arkits user...");
  const arkits = await db
    .select()
    .from(user)
    .where(eq(user.name, "arkits"))
    .limit(1);

  if (arkits.length === 0) {
    console.error("User 'arkits' not found in database");
    process.exit(1);
  }

  const arkitsUser = arkits[0];
  if (!arkitsUser) {
    console.error("User 'arkits' not found in database");
    process.exit(1);
  }

  const arkitsUserId = arkitsUser.id;
  console.log(`Found arkits user with id: ${arkitsUserId}`);

  console.log("Importing history records...");
  let imported = 0;
  let skipped = 0;

  for (const record of csvRecords) {
    try {
      const parsedContent = JSON.parse(record.content);

      await db.insert(history).values({
        id: record.id,
        createdAt: record.createdAt,
        timelineTime: record.timelineTime,
        type: record.type,
        contentId: record.contentId,
        content: parsedContent,
        searchContent: record.searchContent,
        userId: arkitsUserId,
      });

      imported++;
    } catch (error) {
      if ((error as Error).message.includes("duplicate key")) {
        skipped++;
      } else {
        console.error(`Error inserting record ${record.id}:`, error);
      }
    }
  }

  console.log(
    `Import completed: ${imported} imported, ${skipped} skipped (duplicates)`,
  );

  return { imported, skipped };
}

async function main() {
  try {
    await importHistory();
    console.log("All tasks completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
