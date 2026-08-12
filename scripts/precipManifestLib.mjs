// Pure, dependency-free helpers for turning rows of Precip_Organized/INDEX.csv
// into a lookup manifest. Kept free of filesystem/browser APIs so it can be
// unit-tested with `node --test` and imported by the build script.

/** INDEX "Century" -> app century key. */
export function normalizeCentury(raw) {
  const v = (raw || "").toLowerCase();
  if (v.includes("mid")) return "mid";
  if (v.includes("late")) return "late";
  return null;
}

/** INDEX "Emissions scenario" -> app scenario key (matches the SSP code). */
export function normalizeScenario(raw) {
  const v = raw || "";
  if (v.includes("SSP1-2.6")) return "ssp126";
  if (v.includes("SSP2-4.5")) return "ssp245";
  if (v.includes("SSP3-7.0")) return "ssp370";
  if (v.includes("SSP5-8.5")) return "ssp585";
  return null;
}

/** INDEX "Season" -> app season key (matches seasonOptions values). */
export function normalizeSeason(raw) {
  const v = raw || "";
  if (v.includes("Annual")) return "ann";
  if (v.includes("MAM")) return "mam";
  if (v.includes("JJA")) return "jja";
  if (v.includes("SON")) return "son";
  if (v.includes("DJF")) return "djf";
  return null;
}

// PR/USVI appears under two equivalent labels across file generations
// ("PRUSVI" mid-century, "Caribbean" late-century). Both collapse to one key.
const PRUSVI_KEY = "PRUSVI";

/**
 * INDEX "State/Region" -> canonical region key used as the top-level manifest
 * key. States map by their full name (identical to statesOptions values);
 * special regions are aliased. Must stay in sync with
 * selectionValueToRegionKey (src/utils/precipMaps.js).
 */
export function indexRegionToKey(raw) {
  const v = (raw || "").trim();
  if (v === "Contiguous U.S. (CONUS)") return "CONUS";
  if (
    v === "Puerto Rico & U.S. Virgin Islands" ||
    v === "Caribbean (Puerto Rico & U.S. Virgin Islands)"
  ) {
    return PRUSVI_KEY;
  }
  return v; // state full names, "Alaska", "Hawaii", etc.
}

/**
 * Remove the trailing season clause from an INDEX plain-language description
 * so it reads as a subtitle (season is shown in the season dropdown).
 * e.g. "Alaska, Late-Century, High emissions (SSP3-7.0), Annual"
 *   -> "Alaska, Late-Century, High emissions (SSP3-7.0)"
 * Only drops the last clause when it actually matches the row's season;
 * otherwise returns the description unchanged and flags it.
 */
export function stripSeasonFromDescription(description, seasonRaw) {
  const desc = (description || "").trim();
  const season = (seasonRaw || "").trim();
  const parts = desc.split(", ");
  const last = parts[parts.length - 1]?.trim();
  if (parts.length > 1 && last === season) {
    return { subtitle: parts.slice(0, -1).join(", "), matched: true };
  }
  return { subtitle: desc, matched: false };
}

/**
 * Title-case the emissions clause of a subtitle so headings read consistently,
 * e.g. "Very high emissions (SSP5-8.5)" -> "Very High Emissions (SSP5-8.5)".
 * The INDEX descriptions sentence-case this clause; everything else in them
 * (region, century) is already title case.
 */
export function titleCaseEmissions(text) {
  return (text || "").replace(
    /\b(?:very\s+)?(?:high|intermediate|low)\s+emissions\b/gi,
    (clause) => clause.replace(/\b\w/g, (ch) => ch.toUpperCase()),
  );
}

/** Newer (by "Date (file modified)") wins when two rows collide on a slot. */
export function isNewer(dateA, dateB) {
  const a = Date.parse(dateA);
  const b = Date.parse(dateB);
  if (Number.isNaN(a)) return false;
  if (Number.isNaN(b)) return true;
  return a > b;
}

/**
 * When two preview rows collide on the same region/century/scenario/season
 * slot, should `next` replace `prev`? The 400-DPI PNGs rendered from the map
 * authors' PDF exports (2026+) beat the legacy ~1000px JPEG previews; within
 * the same format, the newer file wins. Each is {format, date}.
 */
export function shouldReplace(prev, next) {
  const isPng = (f) => f === "PNG preview image";
  if (isPng(next.format) !== isPng(prev.format)) return isPng(next.format);
  return isNewer(next.date, prev.date);
}
