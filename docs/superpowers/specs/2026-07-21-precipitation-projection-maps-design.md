# Precipitation Projection Maps — Design

**Date:** 2026-07-21
**Component area:** "Maps → Precipitation Projections: Seasonality"
**Status:** Approved design, ready for implementation plan

## Problem

The "Precipitation Projections: Seasonality" section of the app is a work in
progress. Selecting one of its options currently shows a hardcoded placeholder
image (`/tempData/gergMap.png`) with literal "Title Placeholder" / "Legend
Placeholder" text. We now have the full set of precipitation projection maps
(from Greg, organized by April) in `public/Precip_Organized/`. This feature
wires the UI up to those real maps: the correct JPG for the chosen
region + century + emissions scenario + season, with a real title, a
plain-language subtitle, and the shared legend.

## Source data

Located in `public/Precip_Organized/`:

- **Maps:** JPG previews (235 of them), bare choropleths — the image contains
  only the colored geography. No title, legend, or scale is baked in. Companion
  `.ai` / `.aix` source files exist but are not displayed.
- **`INDEX.csv`:** authoritative metadata for every kept file. Columns:
  `Folder, File name, Plain-language description, State/Region, Century,
  Emissions scenario, Season, Format, Date (file modified), Note`.
- **`_Reference/PrecipLegend.ai`:** the single shared legend for every map
  ("Change in Total Precipitation (%)", diverging tan→teal scale).
- **`README.txt`:** decoding rules and two flagged discrepancies (see below).

### Key facts / constraints

- **Coverage is partial.** ~35 states + CONUS + Alaska + Hawaii + Caribbean
  have maps, and not every region has every century/scenario/season. Many
  states (e.g. Alabama) have **no** map at all.
- **Filenames carry unpredictable date stamps** (e.g.
  `MC_SSP126_AK_Annual_Precip_070526.jpg`), so paths cannot be built by
  convention — the file must be looked up via `INDEX.csv`.
- **PR/USVI labeling discrepancy:** mid-century files use `PRUSVI`, late-century
  files use `Caribbean`. **Decision: century-specific labels** — mid-century
  resolves from `PRUSVI`-labeled rows, late-century from `Caribbean`-labeled
  rows, exactly as the raw folders are named.
  *Trade-off:* any mid-century map present only under the newer "Caribbean"
  label will be treated as unavailable. The build script will log which slots
  this affects so we can revisit if needed.
- **Irregular CONUS filenames** (two season tokens) are already resolved in the
  `Season` column of `INDEX.csv`, so keying off that column handles them.

## Dimension mappings

| App value (from UI/URL) | INDEX value |
|---|---|
| Century `mid` / `late` (from modal column) | `Mid-Century` / `Late-Century` |
| Scenario `ssp126`/`ssp245`/`ssp370`/`ssp585` | `Low`/`Intermediate`/`High`/`Very high emissions (...)` |
| Season `ann`/`mam`/`jja`/`son`/`djf` | `Annual`/`Spring (MAM)`/`Summer (JJA)`/`Fall (SON)`/`Winter (DJF)` |

Emissions card label → scenario id:
- "Low Emissions: Projected Changes in Precipitation" → `ssp126`
- "Intermediate Emissions: …" → `ssp245`
- "Higher Emissions: …" → `ssp370`
- "Very High Emissions: …" → `ssp585`

Region alias (app `selection.value` → INDEX `State/Region`). States match by
full-name identity; regions and PR need aliases:

| App selection value | INDEX region |
|---|---|
| `CONUS` | `Contiguous U.S. (CONUS)` |
| `alaska_region` | `Alaska` |
| `hawaii` | `Hawaii` |
| `us_caribbean`, `Puerto_Rico` | PR/USVI (century-specific: `PRUSVI` mid / `Caribbean` late) |
| `Alabama`, `Texas`, … (state names) | identity |

## Architecture

### 1. Legend asset (one-time, committed)
Convert `_Reference/PrecipLegend.ai` → `public/precip/PrecipLegend.svg` using
`pdftocairo -svg`. Rendered under every map via `<img>`. Crisp at any size and
pixel-faithful to the official legend.

### 2. Manifest build script — `scripts/buildPrecipManifest.mjs`
Node script (run in `prebuild`). Reads `public/Precip_Organized/INDEX.csv`,
keeps only rows where `Format === "JPEG preview image"`, and emits
`src/data/precipMapManifest.json`:

```
manifest[regionKey][century][scenario][season] = {
  src: "/Precip_Organized/<Folder>/<File name>",
  subtitle: "<plain-language description, season clause removed>"
}
```

- `src`: `/Precip_Organized/<Folder>/<File name>` with each path segment
  URL-encoded (folder names contain spaces and parentheses, e.g. `Fall (SON)`).
- `regionKey`: apply the region-alias table above (states = identity).
- `century` / `scenario` / `season`: normalized to the app values above.
- `subtitle`: the INDEX `Plain-language description` with the **final
  comma-delimited clause (the season) removed** — e.g.
  `"Alaska, Late-Century, High emissions (SSP3-7.0), Annual"` →
  `"Alaska, Late-Century, High emissions (SSP3-7.0)"`. The script validates the
  removed clause matches the row's `Season` before dropping it.
- **PR/USVI:** write mid-century entries only from `PRUSVI` rows and
  late-century entries only from `Caribbean` rows. Log any slot dropped by this
  rule.
- Parsing/normalization logic lives in a **pure, importable module**
  (`scripts/precipManifestLib.mjs`) so it can be unit-tested independently of
  file I/O.

Manifest points at `/Precip_Organized/.../*.jpg` (files stay in `public/`).

### 3. Deploy hygiene (deploy-prod.yml)
The maps stay in `public/`, so Vite copies them to `dist/`. Update the S3 sync
step to exclude the heavy source files (and macOS junk) so they are not
uploaded:
```
aws s3 sync dist/ "s3://${S3_BUCKET}" --delete \
  --exclude "*.ai" --exclude "*.aix" --exclude "*.DS_Store"
```

### 4. Config — `config.js`
Add a `scenario` id to each of the four `mapsSeasonalityOptions`
(`ssp126/245/370/585`). Keep `value: "change_seasonal_precip"` and
`type: "mappy_map"`.

### 5. Modal — `ClimateVariableAndSeasonality.jsx`
The two columns currently pass the identical option object (no century). Change
each column's `onClick` to inject century:
- Midcentury column → `handleOptionSelect({ ...option, century: "mid" })`
- Late Century column → `handleOptionSelect({ ...option, century: "late" })`

Modal cards remain always-enabled (missing maps are handled in the display, per
the "friendly message" decision).

### 6. Display + state — `SandboxControls.jsx`
- **Resolution:** look up
  `precipMapManifest[selection.value]?.[century]?.[scenario]?.[season.value]`.
  Store the resolved `mapSrc` + `mapSubtitle` (or a not-found flag) in state.
  Re-resolve when the **region** or **season** changes while a map is showing
  (the existing `handleMegaMenuSelect` and the season-change path).
- **Render** (replaces the hardcoded block at ~lines 950–971):
  - **Title** (h3): `${selection.label}: ${option.label}`
    (e.g. "Alabama: Low Emissions: Projected Changes in Precipitation").
  - **Subtitle** (muted): `mapSubtitle`.
  - **Map:** `<ZoomableImage src={mapSrc} alt={mapSubtitle} />`, OR when no
    manifest entry exists, a **friendly message** — "No projection map is
    available for this selection." — reusing the existing `SandboxAlert`
    styling. Modal cards stay enabled.
  - **Legend:** `<img src="/precip/PrecipLegend.svg" alt="Change in Total
    Precipitation (%) legend" />` below the map.

### 7. URL persistence (in scope)
Maps become deep-linkable / reload-safe:
- On map selection, write `century` and `scenario` search params alongside the
  existing `selection`/`option`/`season`.
- Register `mapsSeasonalityOptions` in `getClimateChangeOptionFromSearchParams`
  and, on URL restore, rebuild the full option (century + scenario), set
  `showMapImage`, and resolve the map — matching how the rest of the app
  restores state from the URL.

## Testing

No test runner is configured today. Add **vitest** and a `test` script, and
unit-test the pure manifest module (`scripts/precipManifestLib.mjs`):
- season-clause stripping produces the correct subtitle
- dimension normalization (century/scenario/season) is correct
- region alias mapping (incl. PR/USVI century-specific rule)
- a missing slot resolves to "not found"

UI wiring (modal click → correct map, missing-map message, legend render) is
verified manually against the running app.

## Out of scope
- Displaying `.ai` / `.aix` source files.
- Annual (non-seasonal) maps section (`mapsAnnualOptions`) — unchanged.
- Any change to chart rendering.
