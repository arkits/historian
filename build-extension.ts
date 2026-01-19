#!/usr/bin/env bun
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from "fs";
import path from "path";

const EXTENSION_SRC = path.join(process.cwd(), "src", "extension");
const EXTENSION_OUT = path.join(process.cwd(), "extension");
const EXTENSION_FIREFOX_OUT = path.join(process.cwd(), "extension-firefox");

const isFirefox = process.argv.includes("--firefox");
const isAll = process.argv.includes("--all");

const tsFiles = [
  { src: "background.ts", out: "background.js" },
  { src: "content.ts", out: "content.js" },
  { src: "popup.ts", out: "popup.js" },
  { src: "options.ts", out: "options.js" },
];

const staticFiles = ["popup.html", "options.html", "styles.css"];
const iconSizes = ["16", "48", "128"];

function createPlaceholderIcon(size: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>`;
  return Buffer.from(svg);
}

function compileTsFiles(outDir: string) {
  for (const file of tsFiles) {
    const srcPath = path.join(EXTENSION_SRC, file.src);
    console.log(`  ${file.src} → ${file.out}`);
    const proc = Bun.spawnSync({
      cmd: [
        "npx",
        "tsc",
        srcPath,
        "--outDir",
        outDir,
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
      console.error(`Failed to compile ${file.src}`);
      process.exit(1);
    }
  }
}

function copyStaticFiles(outDir: string, manifestFile: string) {
  for (const file of staticFiles) {
    copyFileSync(path.join(EXTENSION_SRC, file), path.join(outDir, file));
    console.log(`  ${file}`);
  }
  copyFileSync(
    path.join(EXTENSION_SRC, manifestFile),
    path.join(outDir, "manifest.json"),
  );
  console.log(`  manifest.json`);
}

function copyIcons(outDir: string) {
  const iconsDir = path.join(outDir, "icons");
  mkdirSync(iconsDir, { recursive: true });
  for (const size of iconSizes) {
    const src = path.join(EXTENSION_SRC, "icons", `icon${size}.png`);
    const dest = path.join(iconsDir, `icon${size}.png`);
    if (existsSync(src)) copyFileSync(src, dest);
    else writeFileSync(dest, createPlaceholderIcon(size));
    console.log(`  icons/icon${size}.png`);
  }
}

function buildChrome() {
  console.log("\n🔧 Building Chrome extension...\n");
  if (existsSync(EXTENSION_OUT)) {
    rmSync(EXTENSION_OUT, { recursive: true, force: true });
  }
  mkdirSync(EXTENSION_OUT, { recursive: true });
  console.log("📦 Compiling TypeScript files...");
  compileTsFiles(EXTENSION_OUT);
  console.log("\n📋 Copying static files...");
  copyStaticFiles(EXTENSION_OUT, "manifest.json");
  console.log("\n📁 Copying icons...");
  copyIcons(EXTENSION_OUT);
  console.log(`\n✅ Chrome extension built: ${EXTENSION_OUT}\n`);
}

function buildFirefox() {
  console.log("\n🔧 Building Firefox extension...\n");
  if (existsSync(EXTENSION_FIREFOX_OUT)) {
    rmSync(EXTENSION_FIREFOX_OUT, { recursive: true, force: true });
  }
  mkdirSync(EXTENSION_FIREFOX_OUT, { recursive: true });
  console.log("📦 Compiling TypeScript files...");
  compileTsFiles(EXTENSION_FIREFOX_OUT);
  console.log("\n📋 Copying static files...");
  copyStaticFiles(EXTENSION_FIREFOX_OUT, "manifest-firefox.json");
  console.log("\n📁 Copying icons...");
  copyIcons(EXTENSION_FIREFOX_OUT);
  console.log(`\n✅ Firefox extension built: ${EXTENSION_FIREFOX_OUT}\n`);
}

if (isAll) {
  buildChrome();
  buildFirefox();
  console.log("✅ Both Chrome and Firefox extensions built successfully!");
} else if (isFirefox) {
  buildFirefox();
} else {
  buildChrome();
}
