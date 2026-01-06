const CSV_PATH = process.argv[2];
const API_URL = process.env.API_URL || "https://historian-api.archit.xyz";
const API_KEY = process.env.API_KEY;

if (!CSV_PATH) {
  console.error("Usage: bun scripts/import-csv.ts <csv-file> [--dry-run]");
  console.error("Environment variables: API_URL, API_KEY");
  process.exit(1);
}

if (!API_KEY) {
  console.error("Error: API_KEY environment variable is required");
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

interface HistoryItem {
  id: string;
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent?: string;
}

function parseCSV(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length === 0) return [];
  const header = lines[0]!.split(",").map((h) => h.replace(/^"|"$/g, ""));

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

function transformToHistoryItem(row: CsvRow): HistoryItem {
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
    id: row.id || crypto.randomUUID(),
    timelineTime,
    type: row.type,
    contentId: row.contentId || crypto.randomUUID(),
    content,
    searchContent: row.searchContent || undefined,
  };
}

async function importHistory(
  items: HistoryItem[],
): Promise<{ imported: number }> {
  const response = await fetch(`${API_URL}/api/extension/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY!,
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Import failed: ${response.status} - ${error}`);
  }

  return response.json();
}

async function main() {
  console.log(`Reading CSV from: ${CSV_PATH}`);
  const file = Bun.file(CSV_PATH!);
  if (!(await file.exists())) {
    console.error(`Error: File not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const csvText = await file.text();
  const rows = parseCSV(csvText);
  console.log(`Parsed ${rows.length} rows from CSV`);

  const items = rows.map(transformToHistoryItem);

  const typeCounts = items.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log(`Transformed ${items.length} history items by type:`, typeCounts);

  if (isDryRun) {
    console.log("\n[Dry run] Would import history items:");
    items.slice(0, 5).forEach((item, i) => {
      console.log(
        `  ${i + 1}. [${item.type}] ${(item.content as any).url || item.contentId} (${item.timelineTime})`,
      );
    });
    if (items.length > 5) {
      console.log(`  ... and ${items.length - 5} more`);
    }
    console.log(`\nTotal: ${items.length} items`);
    return;
  }

  const BATCH_SIZE = 100;
  let imported = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const result = await importHistory(batch);
    imported += result.imported;
    console.log(`Imported ${imported}/${items.length} items`);
  }

  console.log(`\nSuccessfully imported ${imported} history items`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
