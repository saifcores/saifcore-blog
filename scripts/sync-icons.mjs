#!/usr/bin/env node
/**
 * Resize public/profile.png → app/icon.png (32×32) and apple-icon.png (180×180).
 * Uses macOS `sips` when available; falls back to full-size copy on Linux CI.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const profile = path.join(root, "public", "profile.png");
const icon = path.join(root, "src", "app", "icon.png");
const apple = path.join(root, "src", "app", "apple-icon.png");

if (!fs.existsSync(profile)) {
  console.warn("⚠ public/profile.png not found — skipping icon sync.");
  process.exit(0);
}

const hasSips = spawnSync("which", ["sips"], { encoding: "utf8" }).status === 0;

if (hasSips) {
  for (const [size, out] of [
    [32, icon],
    [180, apple],
  ]) {
    const result = spawnSync("sips", ["-z", String(size), String(size), profile, "--out", out], {
      encoding: "utf8",
    });
    if (result.status !== 0) {
      console.error(result.stderr || "sips failed");
      process.exit(1);
    }
  }
  console.log("✓ Favicons synced (32×32 + 180×180) from profile.png");
} else {
  fs.copyFileSync(profile, icon);
  fs.copyFileSync(profile, apple);
  console.warn("⚠ sips unavailable — copied full-size profile.png as icons.");
}
