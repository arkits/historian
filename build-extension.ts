#!/usr/bin/env bun
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "fs";
import path from "path";

const EXTENSION_SRC = path.join(process.cwd(), "src", "extension");
const EXTENSION_OUT = path.join(process.cwd(), "extension");

console.log("\n🔧 Building Chrome extension...\n");

if (existsSync(EXTENSION_OUT)) {
  console.log(`🗑️ Cleaning previous extension build at ${EXTENSION_OUT}`);
  rmSync(EXTENSION_OUT, { recursive: true, force: true });
}

mkdirSync(EXTENSION_OUT, { recursive: true });

const tsFiles = [
  { src: "background.ts", out: "background.js" },
  { src: "content.ts", out: "content.js" },
  { src: "popup.ts", out: "popup.js" },
  { src: "options.ts", out: "options.js" },
];

console.log("📦 Compiling TypeScript files...\n");

for (const file of tsFiles) {
  const srcPath = path.join(EXTENSION_SRC, file.src);
  const outPath = path.join(EXTENSION_OUT, file.out);

  console.log(`  ${file.src} → ${file.out}`);

  const proc = Bun.spawnSync({
    cmd: [
      "npx",
      "tsc",
      srcPath,
      "--outDir",
      EXTENSION_OUT,
      "--target",
      "ES2020",
      "--module",
      "ESNext",
      "--moduleResolution",
      "bundler",
      "--allowJs",
      "--strict",
      "--skipLibCheck",
    ],
  });

  if (proc.exitCode !== 0) {
    console.error(`\n❌ Failed to compile ${file.src}`);
    console.error(new TextDecoder().decode(proc.stderr));
    process.exit(1);
  }
}

console.log("\n📋 Copying static files...");

const staticFiles = [
  "manifest.json",
  "popup.html",
  "options.html",
  "styles.css",
];
for (const file of staticFiles) {
  const srcPath = path.join(EXTENSION_SRC, file);
  const outPath = path.join(EXTENSION_OUT, file);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, outPath);
    console.log(`  ${file}`);
  }
}

console.log("\n📁 Copying icons...");

const iconsDir = path.join(EXTENSION_OUT, "icons");
mkdirSync(iconsDir, { recursive: true });

const iconSizes = ["16", "48", "128"];
for (const size of iconSizes) {
  const srcPath = path.join(EXTENSION_SRC, "icons", `icon${size}.png`);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, outPath);
    console.log(`  icons/icon${size}.png`);
  } else {
    console.log(`  icons/icon${size}.png (placeholder)`);
    writeFileSync(outPath, createPlaceholderIcon(size));
  }
}

console.log(`\n✅ Extension built successfully!`);
console.log(`📁 Output: ${EXTENSION_OUT}\n`);

function createPlaceholderIcon(size: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>`;
  return Buffer.from(svg);
}
