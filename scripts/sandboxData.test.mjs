// Tests for the sandbox chart data pipeline: parseFile (column matching and
// value parsing) plus integrity checks over the real data files in
// public/sandboxdata/2025_Sandbox_Datafiles — headers agree with the column
// names config expects, index.json agrees with what's on disk, and every
// region/state column parses to clean numbers. These lock down the 2026
// regions data drop (new headers, no Alaska column, 1930/4inch series).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import parseFile, { areAllValuesNoData } from "../src/scripts/utils.js";
import config from "../src/configs/config.js";

const DATA_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/sandboxdata/2025_Sandbox_Datafiles",
);

const read = (name) => readFileSync(resolve(DATA_DIR, name), "utf8");
const index = JSON.parse(read("index.json"));

const dataFiles = (prefix) =>
  readdirSync(DATA_DIR).filter(
    (f) => f.startsWith(`${prefix}_`) && f.endsWith(".txt"),
  );

// The nine NCA region columns every regions_* file must carry, exactly as
// the app matches them (config.ncaRegionAbbreviations values).
const REGION_COLUMNS = [
  "Northeast",
  "Northern Rockies and Plains",
  "Northwest",
  "Ohio Valley",
  "South",
  "Southeast",
  "Southwest",
  "Upper Midwest",
  "West",
];

// ---------------------------------------------------------------------------
// parseFile unit tests

const SAMPLE_REGIONS =
  "Year,Northeast,Northern Rockies and Plains,West\n2000,1.5,2.5,3.5\n2001,-999,4.5,5.5\n";

test("parseFile picks the requested regions column", () => {
  const [x, y] = parseFile(SAMPLE_REGIONS, "regions", "West");
  assert.deepEqual(x, [2000, 2001]);
  assert.deepEqual(y, [3.5, 5.5]);
});

test("parseFile matches regions columns case-insensitively", () => {
  const [, y] = parseFile(
    SAMPLE_REGIONS,
    "regions",
    "Northern Rockies And Plains",
  );
  assert.deepEqual(y, [2.5, 4.5]);
});

test("parseFile keeps -999 no-data values for downstream handling", () => {
  const [, y] = parseFile(SAMPLE_REGIONS, "regions", "Northeast");
  assert.deepEqual(y, [1.5, -999]);
});

test("parseFile matches states by abbreviation, any case", () => {
  const sample = "Year,AK,HI\n1995,7.5,8.5\n";
  const [x, y] = parseFile(sample, "states", "Ak");
  assert.deepEqual(x, [1995]);
  assert.deepEqual(y, [7.5]);
});

test("parseFile reads CONUS files from the second column", () => {
  const [x, y] = parseFile("Year,CONUS\n1990,42.5\n", "CONUS", null);
  assert.deepEqual(x, [1990]);
  assert.deepEqual(y, [42.5]);
});

test("areAllValuesNoData flags all--999 series only", () => {
  assert.equal(areAllValuesNoData([-999, -999]), true);
  assert.equal(areAllValuesNoData([-999, 3.2]), false);
});

// ---------------------------------------------------------------------------
// Data file integrity

test("data files contain no NUL bytes (tar padding fully stripped)", () => {
  for (const prefix of ["CONUS", "regions", "states"]) {
    for (const name of dataFiles(prefix)) {
      assert.ok(!read(name).includes("\0"), `${name} contains NUL bytes`);
    }
  }
});

test("index.json and the files on disk agree", () => {
  for (const prefix of ["CONUS", "regions", "states"]) {
    const onDisk = dataFiles(prefix).sort();
    const indexed = index[prefix].map((e) => e.name).sort();
    assert.deepEqual(indexed, onDisk, `index/disk mismatch for ${prefix}`);
  }
});

test("index year ranges match the actual data in each file", () => {
  for (const prefix of ["CONUS", "regions", "states"]) {
    for (const entry of index[prefix]) {
      const rows = read(entry.name).trim().split("\n").slice(1);
      const years = rows.map((r) => parseInt(r.split(",")[0], 10));
      assert.equal(years[0], entry.start, `${entry.name} start`);
      assert.equal(years[years.length - 1], entry.end, `${entry.name} end`);
      assert.equal(entry.period, `${entry.start}-${entry.end}`, entry.name);
    }
  }
});

test("every regions file has exactly the nine expected region columns", () => {
  for (const name of dataFiles("regions")) {
    const header = read(name).split("\n")[0].trim().split(",");
    assert.deepEqual(header, ["Year", ...REGION_COLUMNS], name);
  }
});

test("every states file carries every configured state column", () => {
  const wanted = Object.values(config.stateAbbreviations);
  for (const name of dataFiles("states")) {
    const header = read(name)
      .split("\n")[0]
      .trim()
      .split(",")
      .map((h) => h.toUpperCase());
    for (const abbr of wanted) {
      // VI has no state-level file column; it is served via other data
      if (abbr === "VI") continue;
      assert.ok(header.includes(abbr.toUpperCase()), `${name} missing ${abbr}`);
    }
  }
});

test("each configured region resolves to a real, fully numeric column", () => {
  for (const option of config.regionsOptions) {
    if (option.type !== "regions") continue; // CONUS entry reads column 1
    const label = option.dataOverride?.label || option.label;
    const files = option.dataOverride
      ? dataFiles(option.dataOverride.indexKey)
      : dataFiles("regions");
    const locationType = option.dataOverride?.locationType || "regions";
    const column =
      locationType === "states"
        ? config.stateAbbreviations[label]
        : config.ncaRegionAbbreviations[label];
    assert.ok(column, `no column mapping for ${option.label}`);

    for (const name of files) {
      const [x, y] = parseFile(read(name), locationType, column);
      assert.ok(y.length > 0, `${option.label} got no rows from ${name}`);
      assert.ok(
        y.every((v) => Number.isFinite(v)),
        `${option.label} has non-numeric values in ${name}`,
      );
      assert.ok(
        x.every((v) => Number.isInteger(v)),
        `${option.label} has bad years in ${name}`,
      );
    }
  }
});

test("regions offer the same data series as states (incl. 4inch, 1930)", () => {
  const types = (key) => new Set(index[key].map((e) => e.type));
  assert.deepEqual([...types("regions")].sort(), [...types("states")].sort());
});

test("every regions series has a file starting 1895 or 1900 (app-preferred)", () => {
  const byType = new Map();
  for (const e of index.regions) {
    byType.set(e.type, [...(byType.get(e.type) || []), e.start]);
  }
  for (const [type, starts] of byType) {
    assert.ok(
      starts.some((s) => s === 1895 || s === 1900),
      `type ${type} has no 1895/1900 file (starts: ${starts})`,
    );
  }
});

// ---------------------------------------------------------------------------
// Variable semantics, app file selection, and config/data agreement
//
// These guard the failure modes the 2026 migration actually hit or surfaced:
// a mislabeled delivery shipping winter data as annual, the app preferring a
// long-period file whose selected column is entirely -999, and config start
// dates drifting from real data coverage.

// Columns of a data file as {name: [values...]}, plus the year column.
function readColumns(name) {
  const lines = read(name).trim().split("\n");
  const header = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((l) => l.split(","));
  const years = rows.map((r) => parseInt(r[0], 10));
  const columns = {};
  for (let i = 1; i < header.length; i += 1) {
    columns[header[i]] = rows.map((r) => parseFloat(r[i]));
  }
  return { years, columns };
}

// Mirror of the app's file preference (SandboxControls getChartData): filter
// by type, prefer an 1895/1900-start file, else first match.
function preferredFile(indexKey, fileType) {
  const matching = index[indexKey].filter((e) => e.type === fileType);
  return (
    matching.find(
      (e) => e.period === "1895-2024" || e.period === "1900-2024",
    ) || matching[0]
  );
}

const NO_DATA = -999;
const SEASONS = ["djf", "mam", "jja", "son"];

test("annual files are not byte-copies of any seasonal file", () => {
  // The 2026 delivery shipped DJF data under the regions prcp_ann filename;
  // structural checks (headers, years) can't see that — identity can.
  for (const key of ["CONUS", "regions", "states"]) {
    for (const metric of ["prcp", "tmean", "tmax", "tmin"]) {
      const ann = read(preferredFile(key, `${metric}_ann`).name);
      for (const season of SEASONS) {
        const seasonal = read(preferredFile(key, `${metric}_${season}`).name);
        assert.notEqual(ann, seasonal, `${key} ${metric}_ann === ${metric}_${season}`);
      }
    }
  }
});

test("annual values are consistent with seasonal values", () => {
  // Winter data masquerading as annual (the 2026 delivery's actual failure)
  // must fail these. Precip: annual totals are >= any within-calendar-year
  // season (MAM/JJA/SON) row by row — DJF is excluded from the row-wise check
  // because it includes the *previous* December, which can legitimately
  // out-total a dry calendar year in arid regions — and the long-run annual
  // mean must dwarf every seasonal mean. Temperature: the annual mean lies
  // between the winter and summer means.
  const EPS = 0.01;
  const mean = (vals) => {
    const real = vals.filter((v) => v !== NO_DATA);
    return real.reduce((a, b) => a + b, 0) / real.length;
  };
  for (const key of ["CONUS", "regions", "states"]) {
    for (const metric of ["prcp", "tmean", "tmax", "tmin"]) {
      const ann = readColumns(preferredFile(key, `${metric}_ann`).name);
      const byYear = new Map(ann.years.map((y, i) => [y, i]));
      for (const season of SEASONS) {
        if (metric !== "prcp" && season !== "djf" && season !== "jja") continue;
        const seas = readColumns(preferredFile(key, `${metric}_${season}`).name);
        for (const col of Object.keys(ann.columns)) {
          if (!seas.columns[col]) continue;
          const annMean = mean(ann.columns[col]);
          const seasMean = mean(seas.columns[col]);
          if (metric === "prcp") {
            if (Number.isFinite(annMean) && Number.isFinite(seasMean)) {
              assert.ok(
                annMean > seasMean * 1.3,
                `${key} ${col}: annual prcp mean ${annMean.toFixed(2)} not ≫ ${season} mean ${seasMean.toFixed(2)} — seasonal data mislabeled as annual?`,
              );
            }
            if (season === "djf") continue;
          }
          seas.years.forEach((year, i) => {
            const ai = byYear.get(year);
            if (ai === undefined) return;
            const a = ann.columns[col][ai];
            const s = seas.columns[col][i];
            if (a === NO_DATA || s === NO_DATA) return;
            if (metric === "prcp") {
              assert.ok(
                a >= s - EPS,
                `${key} ${col} ${year}: annual prcp ${a} < ${season} ${s}`,
              );
            } else if (season === "djf") {
              assert.ok(
                a >= s - EPS,
                `${key} ${col} ${year}: annual ${metric} ${a} < winter ${s}`,
              );
            } else {
              assert.ok(
                a <= s + EPS,
                `${key} ${col} ${year}: annual ${metric} ${a} > summer ${s}`,
              );
            }
          });
        }
      }
    }
  }
});

// Known cases where the app-preferred (longest-period) file has an all--999
// column even though a shorter-period sibling has real data. These trace to
// the upstream delivery (e.g. states_prcp_4inch_1900-2024 is hollow for most
// states) plus the app's preference rule, which does not yet fall back past
// an empty column. Fixing that in getChartData should shrink this list; a
// NEW entry here means a future delivery hollowed out a column — investigate
// before repinning.
const KNOWN_HOLLOW_PREFERRED = new Set([
  "regions/tmin_-30F/Southeast",
  ...[
    "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "GA", "IA", "ID", "IL",
    "IN", "KS", "KY", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC",
    "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY",
  ].map((s) => `states/prcp_4inch/${s}`),
  "states/tmax_0F/NM",
  "states/tmax_0F/OK",
  "states/tmax_0F/TX",
  "states/tmax_100F/ND",
  "states/tmax_80F/ND",
  "states/tmax_87F/ND",
  "states/tmax_90F/ND",
  "states/tmin_-30F/CA",
  "states/tmin_-30F/NC",
  "states/tmin_60F/ND",
  "states/tmin_80F/ME",
]);

test("app-preferred files only go hollow where already known", () => {
  const violations = [];
  for (const key of ["regions", "states"]) {
    const types = new Set(index[key].map((e) => e.type));
    for (const type of types) {
      const pref = preferredFile(key, type);
      const prefCols = readColumns(pref.name).columns;
      const siblings = index[key]
        .filter((e) => e.type === type && e.name !== pref.name)
        .map((e) => readColumns(e.name).columns);
      for (const [col, vals] of Object.entries(prefCols)) {
        const hollow = vals.every((v) => v === NO_DATA);
        const siblingHasData = siblings.some(
          (s) => s[col] && !s[col].every((v) => v === NO_DATA),
        );
        if (hollow && siblingHasData) violations.push(`${key}/${type}/${col}`);
      }
    }
  }
  assert.deepEqual(
    violations.sort(),
    [...KNOWN_HOLLOW_PREFERRED].sort(),
    "hollow-preferred-column set changed — see comment above KNOWN_HOLLOW_PREFERRED",
  );
});

// HI/PR (and the region options that alias them) have no statewide
// seasonal/annual temperature or precipitation data in the delivery at all
// (nClimDiv does not cover them); their startDates are meaningful only for
// threshold series, which do have data from 1950.
const KNOWN_MISSING_ANNUAL = new Set([
  "Hawaiʻi",
  "Puerto Rico",
  "Hawaiʻi and US-Affiliated Pacific Islands",
  "US Caribbean",
]);

test("configured startDates land on a year with real data", () => {
  const valueAt = (name, column, year) => {
    const { years, columns } = readColumns(name);
    const header = Object.keys(columns).find(
      (h) => h.toUpperCase() === column.toUpperCase(),
    );
    const i = years.indexOf(year);
    return header !== undefined && i >= 0 ? columns[header][i] : undefined;
  };
  for (const opt of [...config.statesOptions, ...config.regionsOptions]) {
    if (opt.type === "CONUS" || KNOWN_MISSING_ANNUAL.has(opt.label)) continue;
    const key = opt.dataOverride?.indexKey || opt.type;
    const label = opt.dataOverride?.label || opt.label;
    const column =
      key === "states"
        ? config.stateAbbreviations[label]
        : config.ncaRegionAbbreviations[label];
    for (const [dateType, series] of [
      ["temperature", "tmean_ann"],
      ["precipitation", "prcp_ann"],
    ]) {
      const year = parseInt(opt.startDates[dateType], 10);
      const v = valueAt(preferredFile(key, series).name, column, year);
      assert.ok(
        Number.isFinite(v) && v !== NO_DATA,
        `${opt.label}: startDates.${dateType}=${year} has value ${v} in ${series}`,
      );
    }
  }
});

test("Alaska state data really starts 1925 (annual) / 1930 (threshold)", () => {
  const firstRealYear = (name, column) => {
    const { years, columns } = readColumns(name);
    const i = columns[column].findIndex((v) => v !== NO_DATA);
    return i >= 0 ? years[i] : null;
  };
  assert.equal(
    firstRealYear(preferredFile("states", "tmean_ann").name, "AK"),
    1925,
  );
  assert.equal(
    firstRealYear(preferredFile("states", "tmax_90F").name, "AK"),
    1930,
  );
});

test("every UI-reachable series exists in all three indexes, app-preferred", () => {
  const uiTypes = [
    ...config.temperatureOptions.map((o) => o.value),
    ...config.precipitationOptions.map((o) => o.value),
    ...config.historicalSeasonalityOptions
      .filter((o) => o.seasonality)
      .flatMap((o) => ["ann", ...SEASONS].map((s) => `${o.value}_${s}`)),
  ];
  assert.equal(uiTypes.length, 40);
  for (const key of ["CONUS", "regions", "states"]) {
    for (const type of uiTypes) {
      const pref = preferredFile(key, type);
      assert.ok(pref, `${key} has no file for UI option ${type}`);
      assert.ok(
        pref.start === 1895 || pref.start === 1900,
        `${key}/${type}: preferred file starts ${pref?.start}, not 1895/1900`,
      );
    }
  }
});

test("config selection entries are internally consistent", () => {
  const PUBLIC_DIR = resolve(DATA_DIR, "../..");
  for (const opt of [...config.statesOptions, ...config.regionsOptions]) {
    // Every selection label must resolve to a data column name
    if (opt.type === "states") {
      assert.ok(config.stateAbbreviations[opt.label], `${opt.label}: no abbreviation`);
    } else if (opt.type === "regions" && !opt.dataOverride) {
      assert.ok(
        config.ncaRegionAbbreviations[opt.label],
        `${opt.label}: no region column mapping`,
      );
    }
    if (opt.dataOverride) {
      assert.ok(
        ["CONUS", "regions", "states"].includes(opt.dataOverride.indexKey),
        `${opt.label}: bad dataOverride.indexKey`,
      );
      const map =
        opt.dataOverride.indexKey === "states"
          ? config.stateAbbreviations
          : config.ncaRegionAbbreviations;
      assert.ok(
        map[opt.dataOverride.label],
        `${opt.label}: dataOverride.label "${opt.dataOverride.label}" unresolvable`,
      );
    }
    // Dates parse and are ordered
    for (const dateType of Object.keys(opt.startDates)) {
      const start = parseInt(opt.startDates[dateType], 10);
      const end = parseInt(opt.endDates[dateType], 10);
      assert.ok(start > 1800 && end > start, `${opt.label}: bad ${dateType} dates`);
    }
    // Menu artwork exists
    if (opt.svg) {
      assert.ok(
        existsSync(resolve(PUBLIC_DIR, `.${opt.svg}`)),
        `${opt.label}: missing svg ${opt.svg}`,
      );
    }
  }
});
