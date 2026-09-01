// Runtime lookup for precipitation projection maps.
//
// The manifest (src/data/precipMapManifest.json) is generated at build time
// from public/Precip_Organized/INDEX.csv by scripts/buildPrecipManifest.mjs.
// It is keyed by region -> century -> scenario -> season, and the collection
// only holds four regions: Alaska, Hawaii, Puerto Rico/USVI, and the
// contiguous U.S. (CONUS).
//
// Per the map authors: contiguous-U.S. states all show the single CONUS-wide
// map for the chosen season/scenario (no per-state cutout or outline). Only the
// three out-of-CONUS areas have their own maps. So any selection that isn't
// Alaska / Hawaii / Puerto Rico-USVI resolves to CONUS.

// Selections that map to their own (non-CONUS) region. Everything else -> CONUS.
const OCONUS_REGION_KEY = {
  Alaska: "Alaska",
  alaska_region: "Alaska",
  Hawaii: "Hawaii",
  hawaii: "Hawaii",
  Puerto_Rico: "PRUSVI",
  us_caribbean: "PRUSVI",
};

/** App selection.value -> canonical manifest region key. */
export function selectionValueToRegionKey(value) {
  if (!value) return null;
  return OCONUS_REGION_KEY[value] || "CONUS";
}

// Figure-title names for each map region. Titles name the region the map
// actually covers, not the selected state — every contiguous state shows the
// same CONUS-wide map, and the PRUSVI map covers the wider Caribbean.
const REGION_DISPLAY_NAME = {
  CONUS: "Contiguous United States",
  Alaska: "Alaska",
  Hawaii: "Hawaiʻi",
  PRUSVI: "Caribbean",
};

/** App selection.value -> display name of the map region it resolves to. */
export function selectionValueToRegionDisplayName(value) {
  const regionKey = selectionValueToRegionKey(value);
  return regionKey ? REGION_DISPLAY_NAME[regionKey] : null;
}

/**
 * Resolve the map entry for a selection + century + scenario + season.
 * Returns { src, subtitle } or null when no map exists for that combination.
 */
export function lookupPrecipMap(manifest, selectionValue, century, scenario, season) {
  const regionKey = selectionValueToRegionKey(selectionValue);
  if (!regionKey || !century || !scenario || !season) return null;
  return manifest?.[regionKey]?.[century]?.[scenario]?.[season] || null;
}
