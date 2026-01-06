import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { default as Bun } from "bun";
import type { AppRouter } from "../src/server/router";

const CSV_PATH = process.argv[2];
const API_URL = process.env.API_URL || "http://localhost:3000";
const API_KEY = process.env.API_KEY;

if (!CSV_PATH) {
  console.error("Usage: bun scripts/import-csv.ts <csv-file> [--dry-run]");
  console.error("Environment variables: API_URL, API_KEY");
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");

interface CsvRow {
  id: string;
  createdAt: string;
  content: string;
  userId: string;
  type: string;
  contentId: string;
  searchContent: string;
  timelineTime: string;
}

function parseCSV(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    header.forEach((key, i) => {
      row[key] = values[i] || "";
    });
    return row as unknown as CsvRow;
  });
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function transformToHistoryItem(row: CsvRow) {
  let content: Record<string, unknown> = {};
  try {
    content = JSON.parse(row.content.replace(/""/g, '"'));
  } catch {
    content = { raw: row.content };
  }

  const timelineTime = row.timelineTime.includes(" ")
    ? row.timelineTime.replace(" ", "T") + "Z"
    : row.timelineTime;

  return {
    timelineTime: new Date(timelineTime).toISOString(),
    type: row.type,
    contentId: row.contentId,
    content,
    searchContent: row.searchContent || undefined,
  };
}

async function main() {
  if (!API_KEY) {
    console.error("Error: API_KEY environment variable is required");
    process.exit(1);
  }

  console.log(`Reading CSV from: ${CSV_PATH}`);
  const file = Bun.file(CSV_PATH);
  if (!(await file.exists())) {
    console.error(`Error: File not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const csvText = await file.text();
  const rows = parseCSV(csvText);
  console.log(`Parsed ${rows.length} rows from CSV`);

  const historyItems = rows.map(transformToHistoryItem);
  console.log(`Transformed ${historyItems.length} history items`);

  if (isDryRun) {
    console.log("\n[Dry run] Would import items:");
    historyItems.slice(0, 3).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${item.type} - ${item.contentId} (${item.timelineTime})`,
      );
    });
    if (historyItems.length > 3) {
      console.log(`  ... and ${historyItems.length - 3} more`);
    }
    console.log(`\nTotal: ${historyItems.length} items`);
    return;
  }

  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }),
    ],
  });

  const BATCH_SIZE = 100;
  let imported = 0;

  for (let i = 0; i < historyItems.length; i += BATCH_SIZE) {
    const batch = historyItems.slice(i, i + BATCH_SIZE);
    const result = await client.importHistory.mutate(batch);
    imported += result.imported;
    console.log(`Imported ${imported}/${historyItems.length} items`);
  }

  console.log(`\nSuccessfully imported ${imported} history items`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
