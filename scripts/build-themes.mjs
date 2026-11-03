#!/usr/bin/env node
// Usage: node scripts/build-themes.mjs [--check]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildBbTheme } from "./themes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");
const output = buildBbTheme(read("theme.css"), read("palettes/bb.css"));

if (process.argv.includes("--check")) {
  if (read("theme-bb.css") !== output) {
    console.error("theme-bb.css is out of date; run `npm run build:themes`.");
    process.exit(1);
  }
  console.log("theme-bb.css is up to date.");
} else {
  writeFileSync(join(root, "theme-bb.css"), output);
  console.log("Wrote theme-bb.css.");
}
