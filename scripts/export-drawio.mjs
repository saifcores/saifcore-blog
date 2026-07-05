#!/usr/bin/env node
/**
 * Draw.io export for `public/diagrams/*.drawio`.
 *
 * - Auto-exports missing or stale SVG siblings via `drawio-headless` (devDependency).
 * - Manual fallback: diagrams.net → Export as → SVG (same basename).
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const diagramsDir = path.join(root, "public", "diagrams");

function resolveDrawioHeadlessBin() {
  const localBin = path.join(
    root,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "drawio-headless.cmd" : "drawio-headless",
  );
  if (fs.existsSync(localBin)) return localBin;

  const which = spawnSync("which", ["drawio-headless"], { encoding: "utf8" });
  if (which.status === 0 && which.stdout.trim()) {
    return which.stdout.trim();
  }

  return null;
}

function needsExport(drawioPath, svgPath) {
  if (!fs.existsSync(svgPath)) return true;
  const drawioMtime = fs.statSync(drawioPath).mtimeMs;
  const svgMtime = fs.statSync(svgPath).mtimeMs;
  return drawioMtime > svgMtime;
}

function exportSvg(bin, drawioPath, svgPath) {
  const result = spawnSync(bin, ["render", drawioPath, svgPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(detail || `drawio-headless exited with ${result.status}`);
  }

  sanitizeSvgXml(svgPath);
}

/** Strip control chars invalid in XML 1.0 text nodes (e.g. accidental 0x14). */
function sanitizeSvgXml(svgPath) {
  const raw = fs.readFileSync(svgPath, "utf8");
  const clean = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " — ");
  if (clean !== raw) {
    fs.writeFileSync(svgPath, clean, "utf8");
    console.log(`  sanitized XML in ${path.basename(svgPath)}`);
  }
}

if (!fs.existsSync(diagramsDir)) {
  console.log("No public/diagrams directory — skipping.");
  process.exit(0);
}

const drawioFiles = fs
  .readdirSync(diagramsDir)
  .filter((name) => name.endsWith(".drawio"));

if (drawioFiles.length === 0) {
  console.log("No Draw.io diagrams found.");
  process.exit(0);
}

const bin = resolveDrawioHeadlessBin();
let exported = 0;
let upToDate = 0;
let missingSvg = 0;

for (const file of drawioFiles) {
  const drawioPath = path.join(diagramsDir, file);
  const svgName = file.replace(/\.drawio$/, ".svg");
  const svgPath = path.join(diagramsDir, svgName);

  if (!needsExport(drawioPath, svgPath)) {
    upToDate += 1;
    continue;
  }

  if (!bin) {
    missingSvg += 1;
    console.warn(`⚠ Missing or stale SVG for ${file} — install drawio-headless or export manually.`);
    continue;
  }

  try {
    exportSvg(bin, drawioPath, svgPath);
    exported += 1;
    console.log(`✓ Exported ${svgName}`);
  } catch (err) {
    missingSvg += 1;
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`⚠ Failed to export ${file}: ${message}`);
  }
}

if (exported > 0) {
  console.log(`Exported ${exported} diagram(s).`);
}

if (upToDate > 0) {
  console.log(`${upToDate} diagram(s) already up to date.`);
}

if (missingSvg > 0) {
  console.warn(
    `${missingSvg} diagram(s) still need SVG export. Run \`npm run diagrams:export\` after installing dependencies.`,
  );
  process.exit(0);
}

console.log(`✓ ${drawioFiles.length} Draw.io diagram(s) ready.`);
