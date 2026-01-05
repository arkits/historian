#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  lstatSync,
} from "fs";
import { rm, readFile, writeFile } from "fs/promises";
import path from "path";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🏗️  Bun Build Script

Usage: bun run build.ts [options]

Common Options:
  --outdir <path>          Output directory (default: "dist")
  --minify                 Enable minification (or --minify.whitespace, --minify.syntax, etc)
  --sourcemap <type>      Sourcemap type: none|linked|inline|external
  --target <target>        Build target: browser|bun|node
  --format <format>        Output format: esm|cjs|iife
  --splitting              Enable code splitting
  --packages <type>        Package handling: bundle|external
  --public-path <path>     Public path for assets
  --env <mode>             Environment handling: inline|disable|prefix*
  --conditions <list>      Package.json export conditions (comma separated)
  --external <list>        External packages (comma separated)
  --banner <text>          Add banner text to output
  --footer <text>          Add footer text to output
  --help, -h               Show this help message

Extension Options:
  --extension              Build Chrome extension only
  --extension-out <path>   Extension output directory (default: "extension")

Example:
  bun run build.ts --outdir=dist --minify --sourcemap=linked --external=react,react-dom
  bun run build.ts --extension
`);
  process.exit(0);
}

const toCamelCase = (str: string): string =>
  str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

const parseValue = (value: string): any => {
  if (value === "true") return true;
  if (value === "false") return false;

  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d*\.\d+$/.test(value)) return parseFloat(value);

  if (value.includes(",")) return value.split(",").map((v) => v.trim());

  return value;
};

function parseArgs(): Partial<Bun.BuildConfig> {
  const config: Partial<Bun.BuildConfig> = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (!arg.startsWith("--")) continue;

    if (arg.startsWith("--no-")) {
      const key = toCamelCase(arg.slice(5));
      config[key] = false;
      continue;
    }

    if (
      !arg.includes("=") &&
      (i === args.length - 1 || args[i + 1]?.startsWith("--"))
    ) {
      const key = toCamelCase(arg.slice(2));
      config[key] = true;
      continue;
    }

    let key: string;
    let value: string;

    if (arg.includes("=")) {
      [key, value] = arg.slice(2).split("=", 2) as [string, string];
    } else {
      key = arg.slice(2);
      value = args[++i] ?? "";
    }

    key = toCamelCase(key);

    if (key.includes(".")) {
      const [parentKey, childKey] = key.split(".");
      config[parentKey] = config[parentKey] || {};
      config[parentKey][childKey] = parseValue(value);
    } else {
      config[key] = parseValue(value);
    }
  }

  return config;
}

const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

console.log("\n🚀 Starting build process...\n");

const cliConfig = parseArgs();
const outdir = cliConfig.outdir || path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

const start = performance.now();

const entrypoints = Array.from(new Bun.Glob("**/*.html").scanSync("src"))
  .map((a) => path.resolve("src", a))
  .filter((dir) => !dir.includes("node_modules") && !dir.includes("extension"));
console.log(
  `📄 Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? "file" : "files"} to process\n`,
);

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  ...cliConfig,
});

const end = performance.now();

const outputTable = result.outputs.map((output) => ({
  File: path.relative(process.cwd(), output.path),
  Type: output.kind,
  Size: formatFileSize(output.size),
}));

console.table(outputTable);
const buildTime = (end - start).toFixed(2);

console.log(`\n✅ Build completed in ${buildTime}ms\n`);

async function buildExtension(): Promise<void> {
  const extensionOut =
    cliConfig.extensionOut || path.join(process.cwd(), "extension");

  console.log("\n🔧 Building Chrome extension...\n");

  if (existsSync(extensionOut)) {
    console.log(`🗑️ Cleaning previous extension build at ${extensionOut}`);
    await rm(extensionOut, { recursive: true, force: true });
  }

  mkdirSync(extensionOut, { recursive: true });

  const extSrc = path.join(process.cwd(), "src", "extension");

  console.log("📦 Compiling TypeScript files...");

  const tsFiles = [
    { src: "background.ts", out: "background.js" },
    { src: "content.ts", out: "content.js" },
    { src: "popup.ts", out: "popup.js" },
  ];

  for (const file of tsFiles) {
    const srcPath = path.join(extSrc, file.src);
    const outPath = path.join(extensionOut, file.out);

    console.log(`  Compiling ${file.src} -> ${file.out}`);

    const result = await Bun.build({
      entrypoints: [srcPath],
      outdir: extensionOut,
      minify: true,
      target: "browser",
      sourcemap: "none",
    });

    if (!result.success) {
      console.error(`❌ Failed to compile ${file.src}`);
      process.exit(1);
    }
  }

  console.log("📋 Copying manifest and HTML files...");

  const staticFiles = ["manifest.json", "popup.html"];
  for (const file of staticFiles) {
    const srcPath = path.join(extSrc, file);
    const outPath = path.join(extensionOut, file);
    copyFileSync(srcPath, outPath);
    console.log(`  Copied ${file}`);
  }

  console.log(`\n✅ Extension built at ${extensionOut}\n`);
}

if (cliConfig.extension) {
  await buildExtension();
}
