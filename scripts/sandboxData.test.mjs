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

import parseFile, {
  areAllValuesNoData,
  candidateDataFiles,
  fiveYearAverages,
  orderFilesByPreference,
  regionFilesFrom,
} from "../src/scripts/utils.js";
import { pretty } from "../src/scripts/axisTicks.js";
import { fig1FileName } from "../src/scripts/plotObservedAndPredicted.js";
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

test("orderFilesByPreference puts the 1895/1900 file first, then earlier starts", () => {
  const files = [
    { name: "c", period: "1950-2024", start: 1950 },
    { name: "a", period: "1900-2024", start: 1900 },
    { name: "b", period: "1930-2024", start: 1930 },
  ];
  assert.deepEqual(
    orderFilesByPreference(files).map((f) => f.name),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    orderFilesByPreference(files.slice(0, 1).concat(files.slice(2))).map((f) => f.name),
    ["b", "c"],
  );
  assert.deepEqual(orderFilesByPreference([]), []);
});

test("regionFilesFrom drops variants that start before the region's start year", () => {
  const files = [
    { name: "a", start: 1900 },
    { name: "b", start: 1930 },
    { name: "c", start: 1950 },
  ];
  assert.deepEqual(regionFilesFrom(files, 1900).map((f) => f.name), ["a", "b", "c"]);
  assert.deepEqual(regionFilesFrom(files, 1950).map((f) => f.name), ["c"]);
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
// states). getChartData falls back through the shorter files, so these still
// plot; the pin tracks delivery quality. The 2026-10-26 regenerated threshold
// files removed AZ/CA/MI/NM/NV 4inch. A NEW entry here means a future delivery
// hollowed out a column — investigate before repinning.
const KNOWN_HOLLOW_PREFERRED = new Set([
  "regions/tmin_-30F/Southeast",
  ...[
    "AK", "AL", "AR", "CO", "CT", "DE", "GA", "IA", "ID", "IL", "IN", "KS",
    "KY", "MA", "MD", "ME", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH",
    "NJ", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
    "VA", "VT", "WA", "WI", "WV", "WY",
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

test("the fallback order rescues every known hollow-preferred column", () => {
  for (const entry of KNOWN_HOLLOW_PREFERRED) {
    const [key, type, col] = entry.split("/");
    const ordered = orderFilesByPreference(
      index[key].filter((e) => e.type === type),
    );
    const rescued = ordered
      .slice(1)
      .some((e) => !readColumns(e.name).columns[col].every((v) => v === NO_DATA));
    assert.ok(rescued, `${entry}: no later file has data`);
  }
});

// Options whose seasonal/annual series are known to be absent from the
// delivery. HI/PR left this list with the 2026-10-26 delivery, whose HI+PR
// single-state files are merged into the states_ files from 1950.
const KNOWN_MISSING_ANNUAL = new Set([]);

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

// NOAA's start-year sheet (2026-11-02) starts West thresholds in 1950. Its 1900
// regional file falls outside the CA-NV range in about a third of years.
test("West threshold charts read the complete 1950 regional file", () => {
  const west = config.regionsOptions.find((o) => o.value === "west");
  assert.equal(west.startDates.threshold, "1950");
  const thresholdTypes = [...config.temperatureOptions, ...config.precipitationOptions]
    .filter((o) => o.type === "threshold")
    .map((o) => o.value);
  for (const type of thresholdTypes) {
    const [first] = candidateDataFiles(index.regions, type, "regions", 1950);
    assert.equal(first?.start, 1950, `West ${type} reads ${first?.name}`);
    const { years, columns } = readColumns(first.name);
    const missing = years.filter((year, i) => columns.West[i] === NO_DATA);
    assert.deepEqual(missing, [], `West ${type}: -999 in ${first.name}`);
  }
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

// The UI labels a seasonal option with getLabel(season) and any other option
// with its label, so each option needs the one it will be shown with.
test("every climate option has a label the UI can show", () => {
  const climateOptions = [
    ...config.temperatureOptions,
    ...config.precipitationOptions,
    ...config.historicalSeasonalityOptions,
    ...config.observedProjectedOptions,
    ...config.mapsAnnualOptions,
    ...config.mapsSeasonalityOptions,
  ];
  for (const option of climateOptions) {
    if (option.seasonality) {
      assert.equal(
        typeof option.getLabel,
        "function",
        `${option.value}: seasonal option has no getLabel`,
      );
      for (const season of ["Annual", "Spring", "Summer", "Fall", "Winter"]) {
        const seasonalLabel = option.getLabel(season);
        assert.ok(seasonalLabel, `${option.value}: empty label for ${season}`);
      }
    } else {
      assert.ok(option.label, `${option.value}: non-seasonal option has no label`);
    }
  }
});

// ---------------------------------------------------------------------------
// Delivery integrity: a NOAA delivery is well-formed, and the charts still match
// NOAA's start-year sheet and published chapters.

const FIG1_DIR = resolve(DATA_DIR, "observed_and_projected");
const FIG1_SUFFIX = "_FIG1_SCS2025.csv";
const FIG1_HEADER =
  "year,obs,historical_lower,historical_upper,ssp126_lower,ssp126_upper," +
  "ssp245_lower,ssp245_upper,ssp370_lower,ssp370_upper,ssp585_lower,ssp585_upper";

const fig1Files = () => readdirSync(FIG1_DIR).filter((f) => f.endsWith(FIG1_SUFFIX));

const MENU_AREAS = [...config.statesOptions, ...config.regionsOptions];

// Every chart series in the menus, with the startDates key that sets its window.
const UI_SERIES = [
  ...[...config.temperatureOptions, ...config.precipitationOptions].map((o) => ({
    type: o.value,
    dateType: o.type,
  })),
  ...config.historicalSeasonalityOptions
    .filter((o) => o.seasonality)
    .flatMap((o) =>
      ["ann", ...SEASONS].map((s) => ({ type: `${o.value}_${s}`, dateType: o.type })),
    ),
];

const dateTypeOf = (type) => UI_SERIES.find((s) => s.type === type).dateType;

// The data source a menu selection reads, as getChartData resolves it.
function dataSource(opt) {
  const indexKey = opt.dataOverride?.indexKey || opt.type;
  const locationType = opt.dataOverride?.locationType || opt.type;
  const label = opt.dataOverride?.label || opt.label;
  const column =
    locationType === "states"
      ? config.stateAbbreviations[label]
      : config.ncaRegionAbbreviations[label];
  return { indexKey, locationType, column };
}

// Parsed once per file and column: the gap and published-figure tests read ~5,000 series.
const seriesCache = new Map();

// [year, value] pairs for one selection's column, read with the app's parseFile.
function seriesValues(opt, fileName) {
  const { locationType, column } = dataSource(opt);
  const key = `${fileName}|${locationType}|${column}`;
  if (!seriesCache.has(key)) {
    const [years, values] = parseFile(read(fileName), locationType, column);
    seriesCache.set(key, years.map((year, i) => [year, values[i]]));
  }
  return seriesCache.get(key);
}

// The file a chart plots: the first candidate whose column has data, else undefined.
function plottedFile(opt, type, startYear) {
  const { indexKey, locationType } = dataSource(opt);
  return candidateDataFiles(index[indexKey], type, locationType, startYear).find(
    (f) => !areAllValuesNoData(seriesValues(opt, f.name).map(([, v]) => v)),
  );
}

// [1916, 1917, 1919] -> "1916-1917, 1919"
function yearRanges(years) {
  const runs = [];
  for (const year of years) {
    const last = runs.at(-1);
    if (last && year === last[1] + 1) {
      last[1] = year;
    } else {
      runs.push([year, year]);
    }
  }
  return runs.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ");
}

// Window years a chart has no value for; a DJF chart's first year needs the
// previous December, so it never has one.
function missingWindowYears(opt, type, file) {
  const dateType = dateTypeOf(type);
  const startYear = parseInt(opt.startDates[dateType], 10);
  const endYear = parseInt(opt.endDates[dateType], 10);
  const shown = new Set(
    seriesValues(opt, file.name)
      .filter(([, v]) => v !== NO_DATA)
      .map(([year]) => year),
  );
  const missing = [];
  for (let year = startYear; year <= endYear; year += 1) {
    const isFirstWinter = type.endsWith("_djf") && year === startYear;
    if (!shown.has(year) && !isFirstWinter) missing.push(year);
  }
  return missing;
}

test("every data cell is a plain number", () => {
  const problems = [];
  for (const prefix of ["CONUS", "regions", "states"]) {
    for (const name of dataFiles(prefix)) {
      const rows = read(name).trim().split(/\r?\n/).slice(1);
      const bad = rows.flatMap((row) =>
        row.split(",").filter((cell) => !/^-?\d+(\.\d+)?$/.test(cell.trim())),
      );
      if (bad.length > 0) problems.push(`${name}: ${bad.length} bad cells, e.g. "${bad[0]}"`);
    }
  }
  assert.deepEqual(problems, []);
});

test("every data file has one row per year, ending at config's end year", () => {
  const configEndYears = new Set(
    MENU_AREAS.flatMap((opt) => Object.values(opt.endDates).map(Number)),
  );
  const fileEndYears = new Set();
  const problems = [];
  for (const prefix of ["CONUS", "regions", "states"]) {
    for (const name of dataFiles(prefix)) {
      const { years } = readColumns(name);
      years.forEach((year, i) => {
        if (i > 0 && year !== years[i - 1] + 1) {
          problems.push(`${name}: ${year} follows ${years[i - 1]}`);
        }
      });
      fileEndYears.add(years.at(-1));
    }
  }
  assert.deepEqual(problems, []);
  assert.deepEqual(fileEndYears, configEndYears, "data end years vs config endDates");
});

// Loose physical limits: a value outside them is a unit mix-up or a corrupt row.
function valueLimits(type) {
  if (/_-?\d+(F|inch)$/.test(type)) return [0, 366];
  if (type.startsWith("prcp_")) return [0, 400];
  return [-40, 110];
}

test("every value falls inside physical limits for its series", () => {
  const problems = [];
  for (const entry of [...index.CONUS, ...index.regions, ...index.states]) {
    const [low, high] = valueLimits(entry.type);
    const { years, columns } = readColumns(entry.name);
    for (const [column, values] of Object.entries(columns)) {
      const outside = values
        .map((v, i) => [years[i], v])
        .filter(([, v]) => v !== NO_DATA && !(v >= low && v <= high));
      if (outside.length > 0) {
        const [year, v] = outside[0];
        problems.push(`${entry.name} ${column}: ${outside.length} outside ${low}..${high}, e.g. ${year}=${v}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test("observed/projected files use LF, one header, full numeric rows and consecutive years", () => {
  const width = FIG1_HEADER.split(",").length;
  const problems = [];
  for (const name of fig1Files()) {
    const text = read(`observed_and_projected/${name}`);
    if (text.includes("\r")) problems.push(`${name}: CRLF line endings (the chart parser needs LF)`);
    const lines = text.trim().split(/\r?\n/);
    if (lines[0].trim() !== FIG1_HEADER) problems.push(`${name}: header ${lines[0]}`);
    const rows = lines.slice(1).map((line) => line.split(","));
    rows.forEach((row, i) => {
      if (row.length !== width) problems.push(`${name}: ${row[0]} has ${row.length} cells, not ${width}`);
      if (row.some((v) => v.trim() === "" || !Number.isFinite(Number(v)))) {
        problems.push(`${name}: non-numeric value in ${row[0]}`);
      }
      if (i > 0 && Number(row[0]) !== Number(rows[i - 1][0]) + 1) {
        problems.push(`${name}: ${row[0]} follows ${rows[i - 1][0]}`);
      }
    });
  }
  assert.deepEqual(problems, []);
});

const offersObservedProjected = (opt) => config.hasPredictedData.includes(opt.label);

test("every area offering observed/projected has its file", () => {
  const files = new Set(fig1Files());
  const missing = MENU_AREAS.filter(offersObservedProjected)
    .filter((opt) => !files.has(fig1FileName(opt)))
    .map((opt) => opt.value);
  assert.deepEqual(missing, [], "an area offers observed/projected but has no file");
});

test("the Alaska region charts the state-level Alaska file", () => {
  const alaskaRegion = config.regionsOptions.find((o) => o.value === "alaska_region");
  assert.equal(fig1FileName(alaskaRegion), "Alaska_FIG1_SCS2025.csv");
});

test("every observed/projected file is offered by some area", () => {
  const offered = new Set(
    MENU_AREAS.filter(offersObservedProjected).map((opt) => fig1FileName(opt)),
  );
  const unoffered = fig1Files().filter((name) => !offered.has(name));
  assert.deepEqual(unoffered, [], "a delivered observed/projected file has no menu entry");
});

// Window years each chart has nothing to show for ("no data": all -999 in every
// candidate file); NOAA leaves these blank, so a change means a delivery changed.
const KNOWN_CHART_GAPS = {
  "Alabama/tmax_0F": "no data",
  "Alabama/tmin_-30F": "no data",
  "Alabama/prcp_4inch": "1900-1929",
  "Alaska/tmax_100F": "no data",
  "Alaska/tmin_70F": "1943-1944, 1949, 1972-1975",
  "Alaska/tmin_75F": "no data",
  "Alaska/tmin_80F": "no data",
  "Arizona/tmax_0F": "no data",
  "Arizona/tmin_-30F": "1988, 1994, 2001-2003, 2017-2023",
  "Arkansas/tmax_0F": "1904, 2003-2011, 2013-2020, 2022-2024",
  "Arkansas/tmin_-30F": "no data",
  "Arkansas/prcp_4inch": "1900-1929",
  "California/tmin_-30F": "1930-1949, 1997-2001",
  "Colorado/prcp_4inch": "1900-1929",
  "Connecticut/tmin_-30F": "no data",
  "Delaware/tmax_80F": "1916-1919, 2009, 2020-2021",
  "Delaware/tmax_87F": "1916-1919, 2009, 2020-2021",
  "Delaware/tmax_90F": "1916-1919, 2009, 2020-2021",
  "Delaware/tmax_95F": "1916-1919, 2009, 2020-2021",
  "Delaware/tmax_100F": "1916-1919, 2009, 2020-2021",
  "Delaware/tmin_60F": "1916-1919, 2020-2021",
  "Delaware/tmin_65F": "1916-1919, 2020-2021",
  "Delaware/tmin_70F": "1916-1919, 2020-2021",
  "Delaware/tmin_75F": "1916-1919, 2020-2021",
  "Delaware/tmin_80F": "1916-1919, 2020-2021",
  "Delaware/tmax_32F": "1916-1919, 2009, 2020-2021",
  "Delaware/tmax_0F": "no data",
  "Delaware/tmin_32F": "1916-1919, 2020-2021",
  "Delaware/tmin_20F": "1916-1919, 2020-2021",
  "Delaware/tmin_0F": "1916-1919, 2020-2021",
  "Delaware/tmin_-30F": "no data",
  "Delaware/prcp_1inch": "1916-1919, 1923, 1927, 2020-2024",
  "Delaware/prcp_2inch": "1916-1919, 1923, 1927, 2020-2024",
  "Delaware/prcp_3inch": "1916-1919, 1923, 1927, 2020-2024",
  "Delaware/prcp_4inch": "1910-1929",
  "Florida/tmax_32F": "1989, 2018-2020",
  "Florida/tmax_0F": "no data",
  "Florida/tmin_0F": "no data",
  "Florida/tmin_-30F": "no data",
  "Georgia/tmax_0F": "no data",
  "Georgia/tmin_-30F": "no data",
  "Georgia/prcp_4inch": "1900-1929",
  "Hawaii/tmax_100F": "no data",
  "Hawaii/tmax_32F": "no data",
  "Hawaii/tmax_0F": "no data",
  "Hawaii/tmin_32F": "no data",
  "Hawaii/tmin_20F": "no data",
  "Hawaii/tmin_0F": "no data",
  "Hawaii/tmin_-30F": "no data",
  "Idaho/prcp_4inch": "1900-1929, 1972-1974, 1995, 2023",
  "Illinois/prcp_4inch": "1900-1929",
  "Indiana/tmin_-30F": "1901",
  "Indiana/prcp_4inch": "1900-1929",
  "Iowa/prcp_4inch": "1900-1929",
  "Kansas/tmin_-30F": "1901",
  "Kansas/prcp_4inch": "1900-1929",
  "Kentucky/tmin_-30F": "no data",
  "Kentucky/prcp_4inch": "1900-1929",
  "Louisiana/tmax_0F": "no data",
  "Louisiana/tmin_0F": "2023-2024",
  "Louisiana/tmin_-30F": "no data",
  "Maine/tmin_80F": "1900-1929, 2010, 2019-2024",
  "Maine/prcp_4inch": "1900-1929",
  "Maryland/tmin_-30F": "no data",
  "Massachusetts/tmin_-30F": "no data",
  "Minnesota/prcp_4inch": "1900-1929",
  "Mississippi/tmax_0F": "no data",
  "Mississippi/tmin_-30F": "no data",
  "Mississippi/prcp_4inch": "1900-1929",
  "Missouri/prcp_4inch": "1900-1929",
  "Montana/tmin_80F": "1901",
  "Montana/prcp_4inch": "1900-1929",
  "Nebraska/prcp_4inch": "1900-1929",
  "New_Hampshire/tmin_80F": "1979-1980, 1994, 2007",
  "New_Jersey/tmax_0F": "2008-2009",
  "New_Jersey/tmin_-30F": "no data",
  "New_Jersey/prcp_4inch": "1900-1929",
  "New_Mexico/tmax_0F": "1900-1929",
  "New_Mexico/tmin_-30F": "1900-1904, 2017",
  "New_York/prcp_4inch": "1900-1929",
  "North_Carolina/tmax_0F": "1904-1909, 1921-1923, 1929, 1974-1975, 1977, 2003",
  "North_Carolina/tmin_-30F": "1900-1929, 1947, 1997-2007",
  "North_Carolina/prcp_4inch": "1900-1929",
  "North_Dakota/tmax_80F": "1900-1929",
  "North_Dakota/tmax_87F": "1900-1929",
  "North_Dakota/tmax_90F": "1900-1929",
  "North_Dakota/tmax_100F": "1900-1929",
  "North_Dakota/tmin_60F": "1900-1929",
  "North_Dakota/prcp_4inch": "1900-1929",
  "Ohio/prcp_4inch": "1900-1929",
  "Oklahoma/tmax_80F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmax_87F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmax_90F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmax_95F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmax_100F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_60F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_65F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_70F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_75F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_80F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmax_32F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmax_0F": "1900-1949",
  "Oklahoma/tmin_32F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_20F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_0F": "1900-1902, 1906-1907, 1947",
  "Oklahoma/tmin_-30F": "no data",
  "Oklahoma/prcp_4inch": "1900-1929",
  "Oregon/tmin_80F": "1919-1920, 2004",
  "Oregon/tmax_0F": "1900",
  "Oregon/prcp_4inch": "1900-1929",
  "Pennsylvania/tmin_80F": "1901",
  "Pennsylvania/prcp_4inch": "1900-1929",
  "Puerto_Rico/tmax_80F": "1951",
  "Puerto_Rico/tmax_87F": "1951",
  "Puerto_Rico/tmax_90F": "1951",
  "Puerto_Rico/tmax_95F": "1951",
  "Puerto_Rico/tmax_100F": "1951, 2017",
  "Puerto_Rico/tmin_60F": "1951",
  "Puerto_Rico/tmin_65F": "1951",
  "Puerto_Rico/tmin_70F": "1951",
  "Puerto_Rico/tmin_75F": "1951",
  "Puerto_Rico/tmin_80F": "1951",
  "Puerto_Rico/tmax_32F": "no data",
  "Puerto_Rico/tmax_0F": "no data",
  "Puerto_Rico/tmin_32F": "no data",
  "Puerto_Rico/tmin_20F": "no data",
  "Puerto_Rico/tmin_0F": "no data",
  "Puerto_Rico/tmin_-30F": "no data",
  "Puerto_Rico/prcp_1inch": "1951",
  "Puerto_Rico/prcp_2inch": "1951",
  "Puerto_Rico/prcp_3inch": "1951",
  "Puerto_Rico/prcp_4inch": "1951",
  "Puerto_Rico/prcp_ann": "1951",
  "Rhode_Island/tmin_80F": "no data",
  "Rhode_Island/tmax_0F": "no data",
  "Rhode_Island/tmin_-30F": "no data",
  "South_Carolina/tmax_0F": "no data",
  "South_Carolina/tmin_-30F": "no data",
  "South_Carolina/prcp_4inch": "1900-1929",
  "South_Dakota/prcp_4inch": "1900-1929",
  "Tennessee/tmin_-30F": "no data",
  "Tennessee/prcp_4inch": "1900-1929",
  "Texas/tmax_0F": "1900-1949, 2001-2005",
  "Texas/tmin_-30F": "no data",
  "Texas/prcp_4inch": "1900-1929",
  "Utah/prcp_3inch": "1912",
  "Utah/prcp_4inch": "1900-1929",
  "Virginia/tmin_-30F": "no data",
  "Virginia/prcp_4inch": "1900-1929",
  "Washington/tmin_80F": "1900-1902",
  "Washington/prcp_4inch": "1900-1929",
  "West_Virginia/tmax_100F": "1904",
  "West_Virginia/tmax_0F": "1904",
  "West_Virginia/prcp_4inch": "1900-1929",
  "Wisconsin/prcp_4inch": "1900-1929",
  "Wyoming/tmin_80F": "1950-1952, 1978",
  "alaska_region/tmax_100F": "no data",
  "alaska_region/tmin_70F": "1943-1944, 1949, 1972-1975",
  "alaska_region/tmin_75F": "no data",
  "alaska_region/tmin_80F": "no data",
  "hawaii/tmax_100F": "no data",
  "hawaii/tmax_32F": "no data",
  "hawaii/tmax_0F": "no data",
  "hawaii/tmin_32F": "no data",
  "hawaii/tmin_20F": "no data",
  "hawaii/tmin_0F": "no data",
  "hawaii/tmin_-30F": "no data",
  "south/tmin_-30F": "no data",
  "southeast/tmin_-30F": "1900-1929, 1947, 1997-2007",
  "us_caribbean/tmax_80F": "1951",
  "us_caribbean/tmax_87F": "1951",
  "us_caribbean/tmax_90F": "1951",
  "us_caribbean/tmax_95F": "1951",
  "us_caribbean/tmax_100F": "1951, 2017",
  "us_caribbean/tmin_60F": "1951",
  "us_caribbean/tmin_65F": "1951",
  "us_caribbean/tmin_70F": "1951",
  "us_caribbean/tmin_75F": "1951",
  "us_caribbean/tmin_80F": "1951",
  "us_caribbean/tmax_32F": "no data",
  "us_caribbean/tmax_0F": "no data",
  "us_caribbean/tmin_32F": "no data",
  "us_caribbean/tmin_20F": "no data",
  "us_caribbean/tmin_0F": "no data",
  "us_caribbean/tmin_-30F": "no data",
  "us_caribbean/prcp_1inch": "1951",
  "us_caribbean/prcp_2inch": "1951",
  "us_caribbean/prcp_3inch": "1951",
  "us_caribbean/prcp_4inch": "1951",
  "us_caribbean/prcp_ann": "1951",
};

// Gaps for every chart in the menus, in the same shape as KNOWN_CHART_GAPS.
function currentChartGaps() {
  const gaps = {};
  for (const opt of MENU_AREAS) {
    for (const { type, dateType } of UI_SERIES) {
      const file = plottedFile(opt, type, parseInt(opt.startDates[dateType], 10));
      const key = `${opt.value}/${type}`;
      if (!file) {
        gaps[key] = "no data";
        continue;
      }
      const missing = missingWindowYears(opt, type, file);
      if (missing.length > 0) gaps[key] = yearRanges(missing);
    }
  }
  return gaps;
}

// One line per chart whose gaps differ from the pin.
function gapChanges(gaps) {
  const keys = new Set([...Object.keys(gaps), ...Object.keys(KNOWN_CHART_GAPS)]);
  const changes = [];
  for (const key of keys) {
    const now = gaps[key] ?? "complete";
    const pinned = KNOWN_CHART_GAPS[key] ?? "complete";
    if (now !== pinned) changes.push(`${key}: now ${now}, pinned ${pinned}`);
  }
  return changes;
}

test("chart gaps only where already known", () => {
  assert.deepEqual(
    gapChanges(currentChartGaps()),
    [],
    "chart gaps changed; check the delivery, then update KNOWN_CHART_GAPS",
  );
});

// Figures from NOAA's published chapters (statesummaries.ncics.org/chapter/<st>/
// image descriptions); a failure means the data no longer reproduces them.
const PUBLISHED = [
  {
    area: "Connecticut", type: "prcp_2inch",
    min: "0.2", max: "5.7", average: "2.4", fiveYear: { 1960: "1.2", 2010: "3.4" },
  },
  {
    area: "Alabama", type: "prcp_3inch",
    min: "0.1", max: "3.0", average: "1.1",
    fiveYear: { 1985: "0.6", 1960: "1.68", 2020: "1.66" },
  },
  {
    area: "Louisiana", type: "prcp_4inch",
    min: "0", max: "2.2", average: "0.7", fiveYear: { 1915: "0.4", 1935: "0.4", 2015: "1.3" },
  },
  {
    area: "Florida", type: "prcp_4inch",
    min: "0", max: "1.6", average: "0.5", fiveYear: { 1990: "0.2", 2020: "0.7" },
  },
  {
    area: "Maryland", type: "tmax_95F",
    min: "0.1", max: "20.6", average: "6.2",
    fiveYear: { 1970: "1.5", 1995: "10.0", 2010: "10.7" },
  },
];

const PUBLISHED_THROUGH = 2024;

// The chapters round plotted values, some twice (CT 2010-14 is 3.348, printed 3.4).
function matchesPublished(actual, published) {
  const decimals = Math.max(1, (published.split(".")[1] || "").length);
  const roundedOnce = Number(actual.toFixed(decimals + 1));
  return Math.abs(roundedOnce - Number(published)) <= 0.5 * 10 ** -decimals + 1e-9;
}

const average = (values) => values.reduce((a, b) => a + b, 0) / values.length;

// [year, value] pairs a published chart shows, from its start year through 2024.
function publishedWindow(opt, type) {
  const startYear = parseInt(opt.startDates[dateTypeOf(type)], 10);
  return seriesValues(opt, plottedFile(opt, type, startYear).name).filter(
    ([year, v]) => year >= startYear && year <= PUBLISHED_THROUGH && v !== NO_DATA,
  );
}

function fiveYearAverage(shown, firstYear) {
  return average(
    shown.filter(([year]) => year >= firstYear && year < firstYear + 5).map(([, v]) => v),
  );
}

// [label, value the chart shows, value the chapter prints] for one figure.
function publishedComparisons(figure, shown) {
  const values = shown.map(([, v]) => v);
  const comparisons = [
    ["min", Math.min(...values), figure.min],
    ["max", Math.max(...values), figure.max],
    ["average", average(values), figure.average],
  ];
  for (const [first, published] of Object.entries(figure.fiveYear)) {
    const firstYear = Number(first);
    comparisons.push([`${firstYear}-${firstYear + 4}`, fiveYearAverage(shown, firstYear), published]);
  }
  return comparisons;
}

test("charts match the figures in NOAA's published chapters", () => {
  const problems = [];
  for (const figure of PUBLISHED) {
    const opt = config.statesOptions.find((o) => o.label === figure.area);
    const shown = publishedWindow(opt, figure.type);
    for (const [label, actual, published] of publishedComparisons(figure, shown)) {
      if (!matchesPublished(actual, published)) {
        problems.push(`${figure.area} ${figure.type} ${label}: ${actual} vs published ${published}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

// NOAA's "State Climate Summaries Bar Chart Start Years" sheet (2026-11-02):
// [threshold, annual/seasonal]; unlisted states start [1900, 1895].
const SHEET_STATES = {
  AK: [1930, 1925], AZ: [1930, 1895], CA: [1930, 1895], CT: [1950, 1895],
  DE: [1910, 1895], HI: [1950, 1950], MD: [1950, 1895], MA: [1950, 1895],
  NV: [1950, 1895], NH: [1950, 1895], PR: [1950, 1950], RI: [1950, 1895],
  VT: [1950, 1895], WY: [1950, 1895],
};
const SHEET_STATE_DEFAULT = [1900, 1895];
const SHEET_REGIONS = {
  Northeast: [1950, 1895], "Northern Rockies and Plains": [1950, 1895],
  Northwest: [1900, 1895], "Ohio Valley": [1900, 1895], South: [1900, 1895],
  Southeast: [1900, 1895], Southwest: [1930, 1895], "Upper Midwest": [1900, 1895],
  West: [1950, 1895],
};
// Not on the sheet: CONUS matches its published panels (thresholds) and data (1895).
const CONUS_START_YEARS = [1900, 1895];

// Where config waits on NOAA: region annual/seasonal charts start in 1900, because
// the delivered region files start in 1900 even though the sheet says 1895.
function pendingStartYear(opt, dateType) {
  if (dataSource(opt).indexKey !== "regions") return undefined;
  if (dateType !== "threshold") return 1900;
  return undefined;
}

// Override regions (Alaska, Hawaii, US Caribbean) follow their state's row.
function sheetStartYear(opt, dateType) {
  const { indexKey, column } = dataSource(opt);
  let years;
  if (indexKey === "CONUS") {
    years = CONUS_START_YEARS;
  } else if (indexKey === "regions") {
    years = SHEET_REGIONS[column];
  } else {
    years = SHEET_STATES[column] || SHEET_STATE_DEFAULT;
  }
  return dateType === "threshold" ? years[0] : years[1];
}

test("config start years match NOAA's start-year sheet, except where pending", () => {
  const mismatches = [];
  for (const opt of MENU_AREAS) {
    for (const dateType of ["threshold", "temperature", "precipitation"]) {
      const actual = parseInt(opt.startDates[dateType], 10);
      const sheet = sheetStartYear(opt, dateType);
      const pending = pendingStartYear(opt, dateType);
      if (pending !== undefined && actual !== pending) {
        mismatches.push(
          `${opt.label} ${dateType}: config ${actual}, pinned pending ${pending} (sheet ${sheet}); ` +
            "if NOAA confirmed the sheet, update pendingStartYear",
        );
      } else if (pending === undefined && actual !== sheet) {
        mismatches.push(`${opt.label} ${dateType}: config ${actual}, sheet ${sheet}`);
      }
    }
  }
  assert.deepEqual(mismatches, []);
});

// A fallback file from a different station set must not add years before the
// chart's start; it would also shift the long-term average.
test("no chart plots data from before its start year", () => {
  const earlyData = [];
  for (const opt of MENU_AREAS) {
    for (const { type, dateType } of UI_SERIES) {
      const startYear = parseInt(opt.startDates[dateType], 10);
      const file = plottedFile(opt, type, startYear);
      if (!file) continue;
      const earlyYears = seriesValues(opt, file.name)
        .filter(([year, value]) => year < startYear && value !== NO_DATA)
        .map(([year]) => year);
      if (earlyYears.length > 0) {
        earlyData.push(`${opt.value}/${type}: ${file.name} has data from ${earlyYears[0]}`);
      }
    }
  }
  assert.deepEqual(earlyData, []);
});

// ---------------------------------------------------------------------------
// Chart drawing: the y-axis and 5-year bars match NOAA's published charts.

test("the y-axis starts at 0 near zero and drops below zero for negative values", () => {
  assert.equal(pretty([0.4, 12])[0], 0);
  const coldWinterTicks = pretty([-6.4, 8.9]);
  assert.ok(coldWinterTicks[0] <= -6.4, `first tick ${coldWinterTicks[0]} is above -6.4`);
  assert.ok(coldWinterTicks.at(-1) >= 8.9, `last tick ${coldWinterTicks.at(-1)} is below 8.9`);
});

test("fiveYearAverages skips -999 and leaves out blocks with no data", () => {
  const years = [1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911];
  const values = [1, 3, -999, 5, 7, -999, -999, -999, -999, -999, 10, -999];
  assert.deepEqual(fiveYearAverages(years, values, 1900, 1911), [
    { label: "1900–1904", firstYear: 1900, lastYear: 1904, average: 4 },
    { label: "1910–1911", firstYear: 1910, lastYear: 1911, average: 10 },
  ]);
});

test("every chart's y-axis covers its lowest and highest values", () => {
  const clipped = [];
  for (const opt of MENU_AREAS) {
    for (const { type, dateType } of UI_SERIES) {
      const file = plottedFile(opt, type, parseInt(opt.startDates[dateType], 10));
      if (!file) continue;
      const shown = seriesValues(opt, file.name)
        .map(([, value]) => value)
        .filter((value) => value !== NO_DATA);
      const lowest = Math.min(...shown);
      const highest = Math.max(...shown);
      const ticks = pretty([lowest, highest]);
      if (ticks[0] > lowest || ticks.at(-1) < highest) {
        clipped.push(`${opt.value}/${type}: values ${lowest}..${highest}, axis ${ticks[0]}..${ticks.at(-1)}`);
      }
    }
  }
  assert.deepEqual(clipped, []);
});
