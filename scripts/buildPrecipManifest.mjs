// Build a lookup manifest for the precipitation projection maps.
//
//   manifest[regionKey][century][scenario][season] = { src, subtitle }
//
// Source: public/Precip_Organized/INDEX.csv, which catalogs every preview with
// a plain-language description. Both JPEG and PNG preview rows are included
// (some regions were only ever exported to PNG). The .ai/.aix source rows are
// ignored. Run via `npm run build:precip-manifest` (also wired into `prebuild`);
// regenerate whenever the map collection changes.
//
// When NOAA sends new maps, run `npm run crop:conus-maps` instead. It also
// crops the CONUS maps, which needs ImageMagick (`brew install imagemagick`).

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  indexRegionToKey,
  normalizeCentury,
  normalizeScenario,
  normalizeSeason,
  stripSeasonFromDescription,
  titleCaseEmissions,
  shouldReplace,
} from "./precipManifestLib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "public/Precip_Organized");
const INDEX_CSV = resolve(DATA_DIR, "INDEX.csv");
const OUT = resolve(ROOT, "src/data/precipMapManifest.json");
// CONUS previews have ~40% white padding baked in. They are cropped once and
// the results are committed here, so deploys never install ImageMagick, which
// sometimes took over 10 minutes. Only CONUS is cropped; the Alaska, Hawaii
// and Puerto Rico maps are served exactly as delivered.
const CONUS_CROP_DIR = resolve(ROOT, "public/precip/conus");
const CROP_MODE = process.argv.includes("--crop-conus");

const PREVIEW_FORMATS = new Set(["JPEG preview image", "PNG preview image"]);

// First available ImageMagick command, or null.
function findImageMagick() {
  for (const command of ["magick", "convert"]) {
    if (spawnSync(command, ["-version"], { stdio: "ignore" }).status === 0) return command;
  }
  return null;
}

// Crop the white border off one CONUS preview into CONUS_CROP_DIR. A failed
// crop leaves no file, which the missing-crop check below reports. The 2px
// shave drops page-edge residue that would otherwise stop -trim.
function cropConusMap(imageMagick, name, rel) {
  spawnSync(
    imageMagick,
    [resolve(DATA_DIR, rel), "-shave", "2x2", "-fuzz", "7%", "-trim", "+repage",
      "-bordercolor", "white", "-border", "24", resolve(CONUS_CROP_DIR, name)],
    { stdio: "ignore" },
  );
}

// Starts crop mode with an empty crop folder, so crops of maps NOAA has since
// removed don't linger. Exits if ImageMagick is missing.
function prepareCropMode() {
  const imageMagick = findImageMagick();
  if (!imageMagick) {
    console.error("ImageMagick not found. Install it (brew install imagemagick), then run this again.");
    process.exit(1);
  }
  rmSync(CONUS_CROP_DIR, { recursive: true, force: true });
  mkdirSync(CONUS_CROP_DIR, { recursive: true });
  return imageMagick;
}

// Minimal RFC-4180-ish CSV parser (quoted fields, embedded commas, "" escapes).
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = ""; rows.push(row); row = [];
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function encodePath(relPath) {
  return relPath.split("/").map((seg) => encodeURIComponent(seg)).join("/");
}

const isPng = (fmt) => fmt === "PNG preview image";

// Map preview filename -> actual path relative to DATA_DIR. The manifest src is
// built from this, NOT from INDEX's `Folder` column, which has been out of sync
// with the real folder names ("Midcentury" vs "Mid-Century"). Filenames are
// unique across the collection, so this is unambiguous.
function scanPreviews() {
  const byName = {};
  for (const p of readdirSync(DATA_DIR, { recursive: true })) {
    const rel = String(p).split("\\").join("/");
    if (rel.startsWith("_Reference/")) continue;
    if (!/\.(jpe?g|png)$/i.test(rel)) continue;
    byName[rel.split("/").pop()] = rel;
  }
  return byName;
}

function main() {
  const diskByName = scanPreviews();
  const rows = parseCsv(readFileSync(INDEX_CSV, "utf8"));
  const h = rows.shift().map((x) => x.trim());
  const c = (name) => h.indexOf(name);
  const iFile = c("File name"), iDesc = c("Plain-language description");
  const iRegion = c("State/Region"), iCentury = c("Century"), iScenario = c("Emissions scenario");
  const iSeason = c("Season"), iFormat = c("Format"), iDate = c("Date (file modified)");

  const imageMagick = CROP_MODE ? prepareCropMode() : null;

  const manifest = {};
  const meta = {}; // parallel: { format, date } for collision resolution
  let jpg = 0, png = 0, collisions = 0;
  let conusCropped = 0;
  const conusCropMissing = [];
  const seasonMismatches = [];
  const missingOnDisk = [];
  const usedNames = new Set();

  for (const r of rows) {
    const format = (r[iFormat] || "").trim();
    if (!PREVIEW_FORMATS.has(format)) continue;

    const regionKey = indexRegionToKey(r[iRegion]);
    const century = normalizeCentury(r[iCentury]);
    const scenario = normalizeScenario(r[iScenario]);
    const season = normalizeSeason(r[iSeason]);
    if (!regionKey || !century || !scenario || !season) continue;

    const name = (r[iFile] || "").trim();
    const rel = diskByName[name];
    if (!rel) { missingOnDisk.push(name); continue; }
    usedNames.add(name);

    const stripped = stripSeasonFromDescription(r[iDesc], r[iSeason]);
    if (!stripped.matched) seasonMismatches.push(`${name}: "${r[iDesc]}"`);

    let src = `/Precip_Organized/${encodePath(rel)}`;
    if (regionKey === "CONUS") {
      if (CROP_MODE) cropConusMap(imageMagick, name, rel);
      if (existsSync(resolve(CONUS_CROP_DIR, name))) {
        src = `/precip/conus/${encodeURIComponent(name)}`;
        conusCropped++;
      } else {
        conusCropMissing.push(name);
      }
    }
    const entry = { src, subtitle: titleCaseEmissions(stripped.subtitle) };

    manifest[regionKey] ??= {};
    manifest[regionKey][century] ??= {};
    manifest[regionKey][century][scenario] ??= {};
    meta[regionKey] ??= {};
    meta[regionKey][century] ??= {};
    meta[regionKey][century][scenario] ??= {};

    const prev = meta[regionKey][century][scenario][season];
    if (prev) {
      collisions++;
      // Prefer the high-res PNG program over legacy JPEGs; else keep newest.
      if (!shouldReplace(prev, { format, date: r[iDate] })) continue;
    }
    manifest[regionKey][century][scenario][season] = entry;
    meta[regionKey][century][scenario][season] = { format, date: r[iDate] };
  }

  // count what actually landed in the manifest
  for (const rk of Object.keys(meta))
    for (const ce of Object.keys(meta[rk]))
      for (const sc of Object.keys(meta[rk][ce]))
        for (const se of Object.keys(meta[rk][ce][sc]))
          isPng(meta[rk][ce][sc][se].format) ? png++ : jpg++;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");

  const regions = Object.keys(manifest).sort();
  const orphanPreviews = Object.keys(diskByName).filter((n) => !usedNames.has(n));
  console.log(`precip manifest: ${jpg + png} entries across ${regions.length} regions (${jpg} jpg, ${png} png)`);
  console.log(`  regions: ${regions.join(", ")}`);
  console.log(`  CONUS previews using a cropped copy: ${conusCropped}`);
  if (collisions) console.log(`  ${collisions} slot collision(s) resolved (png preferred, else newest)`);
  if (seasonMismatches.length) {
    console.log(`  ${seasonMismatches.length} description(s) without a trailing season clause (kept verbatim)`);
  }
  if (missingOnDisk.length) {
    console.log(`  WARNING: ${missingOnDisk.length} INDEX preview row(s) have no file on disk:`);
    for (const n of missingOnDisk) console.log(`    - ${n}`);
  }
  if (orphanPreviews.length) {
    console.log(`  WARNING: ${orphanPreviews.length} preview file(s) on disk not listed in INDEX:`);
    for (const n of orphanPreviews) console.log(`    - ${n}`);
  }
  console.log(`  wrote ${OUT}`);

  // A missing crop would show a map with wide white margins, so fail the build.
  if (conusCropMissing.length) {
    console.error(`  ERROR: ${conusCropMissing.length} CONUS map(s) have no cropped copy in public/precip/conus:`);
    for (const n of conusCropMissing) console.error(`    - ${n}`);
    console.error("  Run `npm run crop:conus-maps` and commit the results.");
    process.exitCode = 1;
  }
}

main();
