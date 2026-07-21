// Runtime lookup for precipitation projection maps.
//
// The manifest (src/data/precipMapManifest.json) is generated at build time
// from public/Precip_Organized/INDEX.csv by scripts/buildPrecipManifest.mjs.
// It is keyed by a canonical region key -> century -> scenario -> season.
//
// This module maps an app selection value to that canonical region key. It
// MUST stay in sync with indexRegionToKey in scripts/precipManifestLib.mjs.

// Region selections whose value differs from the canonical manifest key.
// State selections use their full name, which already matches the manifest.
const SELECTION_TO_REGION_KEY = {
  CONUS: "CONUS",
  alaska_region: "Alaska",
  hawaii: "Hawaii",
  us_caribbean: "PRUSVI",
  Puerto_Rico: "PRUSVI",
};

/** App selection.value -> canonical manifest region key. */
export function selectionValueToRegionKey(value) {
  if (!value) return null;
  // Explicit aliases (regions, PR) win first.
  if (SELECTION_TO_REGION_KEY[value]) return SELECTION_TO_REGION_KEY[value];
  // Multi-word state values use underscores (e.g. "North_Dakota") while the
  // manifest keys come from INDEX and use spaces ("North Dakota").
  return value.replace(/_/g, " ");
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
