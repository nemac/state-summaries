// Ingest a delivery of precipitation-map PDFs: render each to a high-res PNG
// preview, file both into public/Precip_Organized/<Century>/<Season>/, and
// append the matching rows to INDEX.csv so buildPrecipManifest picks them up.
//
//   node scripts/convertPrecipPdfs.mjs <dir-with-pdfs> [--dpi 400] [--force]
//
// The PDFs are vector exports (the PNG resolution is ours to choose); 400 DPI
// matches the map authors' own PNG test exports (3067x2439 for CONUS).
// Rendering uses the first available of: pdftoppm (poppler), sips (macOS).
// Re-running is safe: existing PNGs are kept unless --force, and INDEX.csv
// rows are only added for file names it doesn't already list.

import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync,
  statSync, writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const COLLECTION = resolve(ROOT, "public/Precip_Organized");
const INDEX_CSV = resolve(COLLECTION, "INDEX.csv");

// Filename tokens -> the labels used by INDEX.csv and the on-disk folders.
const CENTURY = {
  MC: { dir: "Mid-Century", label: "Midcentury" },
  LC: { dir: "Late-Century", label: "Late Century" },
};
const SEASON = {
  Annual: "Annual",
  MAM: "Spring (MAM)",
  JJA: "Summer (JJA)",
  SON: "Fall (SON)",
  DJF: "Winter (DJF)",
};
const REGION = {
  AK: "Alaska",
  CONUS: "Contiguous U.S. (CONUS)",
  HI: "Hawaii",
  PRUSVI: "Puerto Rico & U.S. Virgin Islands",
};
const SCENARIO = {
  126: "Low emissions (SSP1-2.6)",
  245: "Intermediate emissions (SSP2-4.5)",
  370: "High emissions (SSP3-7.0)",
  585: "Very high emissions (SSP5-8.5)",
};

const NAME_RE =
  /^(MC|LC)_SSP(126|245|370|585)_(AK|CONUS|HI|PRUSVI)_(Annual|MAM|JJA|SON|DJF)_Precip_(\d{6})\.pdf$/;

function detectRenderer() {
  if (spawnSync("pdftoppm", ["-v"], { stdio: "ignore" }).status !== null) {
    return "pdftoppm";
  }
  if (spawnSync("sips", ["--help"], { stdio: "ignore" }).status === 0) {
    return "sips";
  }
  return null;
}

function renderPng(renderer, pdfPath, pngPath, dpi) {
  if (renderer === "pdftoppm") {
    execFileSync("pdftoppm", [
      "-png", "-r", String(dpi), "-singlefile", pdfPath,
      pngPath.replace(/\.png$/, ""),
    ]);
    return;
  }
  // sips has no DPI option for PDF rasterization; compute the pixel width
  // from the page's MediaBox (PDF points are 1/72 inch).
  const raw = readFileSync(pdfPath, "latin1");
  const box = raw.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!box) throw new Error(`no MediaBox in ${pdfPath}`);
  const widthPx = Math.round(((box[3] - box[1]) / 72) * dpi);
  execFileSync("sips", [
    "-s", "format", "png", "--resampleWidth", String(widthPx),
    pdfPath, "--out", pngPath,
  ], { stdio: "ignore" });
}

const csvField = (v) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);

function indexRow({ folder, name, region, century, scenario, season, format, date }) {
  const description = `${region}, ${century}, ${scenario}, ${season}`;
  return [folder, name, description, region, century, scenario, season, format, date, ""]
    .map(csvField)
    .join(",");
}

const mdy = (t) => `${t.getMonth() + 1}/${t.getDate()}/${String(t.getFullYear()).slice(2)}`;

function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const dpiIdx = args.indexOf("--dpi");
  const dpi = dpiIdx >= 0 ? parseInt(args[dpiIdx + 1], 10) : 400;
  const srcDir = args.find((a) => !a.startsWith("--") && a !== String(dpi));
  if (!srcDir || !existsSync(srcDir)) {
    console.error("usage: node scripts/convertPrecipPdfs.mjs <dir-with-pdfs> [--dpi 400] [--force]");
    process.exit(1);
  }

  const renderer = detectRenderer();
  if (!renderer) {
    console.error("no PDF renderer found (need pdftoppm from poppler, or macOS sips)");
    process.exit(1);
  }

  const index = readFileSync(INDEX_CSV, "utf8");
  const indexedNames = new Set(
    index.split("\n").slice(1).map((l) => l.split(",")[1]).filter(Boolean),
  );
  const newRows = [];
  let rendered = 0, skipped = 0, unrecognized = 0;

  for (const file of readdirSync(srcDir).sort()) {
    const m = file.match(NAME_RE);
    if (!file.endsWith(".pdf")) continue;
    if (!m) {
      console.warn(`  WARNING: unrecognized PDF name, skipped: ${file}`);
      unrecognized += 1;
      continue;
    }
    const [, cent, ssp, reg, seas] = m;
    const century = CENTURY[cent];
    const season = SEASON[seas];
    const destDir = join(COLLECTION, century.dir, season);
    mkdirSync(destDir, { recursive: true });

    const pdfSrc = join(srcDir, file);
    const pdfDest = join(destDir, file);
    const pngName = file.replace(/\.pdf$/, ".png");
    const pngDest = join(destDir, pngName);

    copyFileSync(pdfSrc, pdfDest);
    if (force || !existsSync(pngDest)) {
      renderPng(renderer, pdfDest, pngDest, dpi);
      rendered += 1;
    } else {
      skipped += 1;
    }

    const date = mdy(statSync(pdfSrc).mtime);
    const common = {
      folder: `${century.label}/${season}`,
      region: REGION[reg],
      century: century.label,
      scenario: SCENARIO[ssp],
      season,
      date,
    };
    if (!indexedNames.has(pngName)) {
      newRows.push(indexRow({ ...common, name: pngName, format: "PNG preview image" }));
      indexedNames.add(pngName);
    }
    if (!indexedNames.has(file)) {
      newRows.push(indexRow({ ...common, name: file, format: "PDF source" }));
      indexedNames.add(file);
    }
  }

  if (newRows.length) {
    writeFileSync(INDEX_CSV, index.replace(/\n?$/, "\n") + newRows.join("\n") + "\n");
  }
  console.log(
    `rendered ${rendered} PNG(s) at ${dpi} DPI with ${renderer}, skipped ${skipped} existing, ` +
    `${unrecognized} unrecognized; added ${newRows.length} INDEX.csv row(s)`,
  );
  console.log("next: npm run build:precip-manifest");
}

main();
