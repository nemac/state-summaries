// Build a lookup manifest for the precipitation projection maps.
//
//   manifest[regionKey][century][scenario][season] = { src, subtitle }
//
// Source: public/Precip_Organized/INDEX.csv, which catalogs every preview with
// a plain-language description. Both JPEG and PNG preview rows are included
// (some regions were only ever exported to PNG). The .ai/.aix source rows are
// ignored. Run via `npm run build:precip-manifest` (also wired into `prebuild`);
// regenerate whenever the map collection changes.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  indexRegionToKey,
  normalizeCentury,
  normalizeScenario,
  normalizeSeason,
  stripSeasonFromDescription,
  isNewer,
} from "./precipManifestLib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const INDEX_CSV = resolve(ROOT, "public/Precip_Organized/INDEX.csv");
const OUT = resolve(ROOT, "src/data/precipMapManifest.json");

const PREVIEW_FORMATS = new Set(["JPEG preview image", "PNG preview image"]);

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

function main() {
  const rows = parseCsv(readFileSync(INDEX_CSV, "utf8"));
  const h = rows.shift().map((x) => x.trim());
  const c = (name) => h.indexOf(name);
  const iFolder = c("Folder"), iFile = c("File name"), iDesc = c("Plain-language description");
  const iRegion = c("State/Region"), iCentury = c("Century"), iScenario = c("Emissions scenario");
  const iSeason = c("Season"), iFormat = c("Format"), iDate = c("Date (file modified)");

  const manifest = {};
  const meta = {}; // parallel: { format, date } for collision resolution
  let jpg = 0, png = 0, collisions = 0;
  const seasonMismatches = [];

  for (const r of rows) {
    const format = (r[iFormat] || "").trim();
    if (!PREVIEW_FORMATS.has(format)) continue;

    const regionKey = indexRegionToKey(r[iRegion]);
    const century = normalizeCentury(r[iCentury]);
    const scenario = normalizeScenario(r[iScenario]);
    const season = normalizeSeason(r[iSeason]);
    if (!regionKey || !century || !scenario || !season) continue;

    const stripped = stripSeasonFromDescription(r[iDesc], r[iSeason]);
    if (!stripped.matched) seasonMismatches.push(`${r[iFile]}: "${r[iDesc]}"`);

    const entry = {
      src: `/Precip_Organized/${encodePath(r[iFolder].trim())}/${encodeURIComponent(r[iFile].trim())}`,
      subtitle: stripped.subtitle,
    };

    manifest[regionKey] ??= {};
    manifest[regionKey][century] ??= {};
    manifest[regionKey][century][scenario] ??= {};
    meta[regionKey] ??= {};
    meta[regionKey][century] ??= {};
    meta[regionKey][century][scenario] ??= {};

    const prev = meta[regionKey][century][scenario][season];
    if (prev) {
      collisions++;
      // Prefer a JPEG over a PNG; within the same format, keep the newer file.
      const preferPng = isPng(format) && !isPng(prev.format);
      const sameFormatOlder = isPng(format) === isPng(prev.format) && !isNewer(r[iDate], prev.date);
      if (preferPng || sameFormatOlder) continue;
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
  console.log(`precip manifest: ${jpg + png} entries across ${regions.length} regions (${jpg} jpg, ${png} png)`);
  console.log(`  regions: ${regions.join(", ")}`);
  if (collisions) console.log(`  ${collisions} slot collision(s) resolved (jpg preferred, else newest)`);
  if (seasonMismatches.length) {
    console.log(`  ${seasonMismatches.length} description(s) without a trailing season clause (kept verbatim)`);
  }
  console.log(`  wrote ${OUT}`);
}

main();
