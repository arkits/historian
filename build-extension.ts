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

const staticFiles = ["manifest.json", "popup.html"];
for (const file of staticFiles) {
  const srcPath = path.join(EXTENSION_SRC, file);
  const outPath = path.join(EXTENSION_OUT, file);
  copyFileSync(srcPath, outPath);
  console.log(`  ${file}`);
}

console.log(`\n✅ Extension built successfully!`);
console.log(`📁 Output: ${EXTENSION_OUT}\n`);
