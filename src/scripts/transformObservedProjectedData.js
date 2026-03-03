/**
 * Transforms columnar CSV data (from fetchObservedAndProjectedData) into
 * row-oriented format suitable for Recharts, and computes bracket positioning data.
 */

const SCENARIOS = [
  { key: "historical", lower: "historical_lower", upper: "historical_upper" },
  { key: "ssp585", lower: "ssp585_lower", upper: "ssp585_upper" },
  { key: "ssp370", lower: "ssp370_lower", upper: "ssp370_upper" },
  { key: "ssp245", lower: "ssp245_lower", upper: "ssp245_upper" },
  { key: "ssp126", lower: "ssp126_lower", upper: "ssp126_upper" },
];

/**
 * Convert columnar data to an array of row objects for Recharts.
 * Each row: { year, obs, historical_lower, historical_upper, historical_range, ... }
 * The *_range columns = upper - lower, used for stacked area rendering.
 * -999 sentinel values are converted to null.
 */
export function transformObservedProjectedData(rawData) {
  const years = rawData.year;
  const rows = [];

  for (let i = 0; i < years.length; i++) {
    const row = { year: years[i] };

    // Observations
    const obs = rawData.obs[i];
    row.obs = obs === -999 ? null : obs;

    // Each scenario: lower, upper, and computed range
    for (const scenario of SCENARIOS) {
      const lower = rawData[scenario.lower]?.[i];
      const upper = rawData[scenario.upper]?.[i];
      const lowerVal = lower === -999 || lower === undefined ? null : lower;
      const upperVal = upper === -999 || upper === undefined ? null : upper;

      row[scenario.lower] = lowerVal;
      row[scenario.upper] = upperVal;
      row[`${scenario.key}_range`] =
        lowerVal !== null && upperVal !== null ? upperVal - lowerVal : null;
    }

    rows.push(row);
  }

  return rows;
}

/**
 * Extract bracket positioning data: the max upper and max lower values
 * for each SSP scenario at the final year where data exists.
 * These are used to draw the right-side bracket annotations.
 */
export function computeBracketData(rawData) {
  const filter = (arr) =>
    arr
      .map((v) => (v === -999 ? undefined : v))
      .filter((v) => v !== undefined);

  const max = (arr) => {
    const f = filter(arr);
    return f.length > 0 ? Math.max(...f) : 0;
  };

  return {
    ssp585: { top: max(rawData.ssp585_upper), bottom: max(rawData.ssp585_lower) },
    ssp370: { top: max(rawData.ssp370_upper), bottom: max(rawData.ssp370_lower) },
    ssp245: { top: max(rawData.ssp245_upper), bottom: max(rawData.ssp245_lower) },
    ssp126: { top: max(rawData.ssp126_upper), bottom: max(rawData.ssp126_lower) },
  };
}

/**
 * Compute the y-axis domain [min, max] from the raw data.
 * Matches the Plotly calculation: yMin - 2 for bottom, yMax + (yMax % 2) for top.
 */
export function computeYDomain(rawData) {
  const obsVals = rawData.obs
    .map((v) => (v === -999 ? undefined : v))
    .filter((v) => v !== undefined);
  const upperVals = rawData.ssp585_upper
    .map((v) => (v === -999 ? undefined : v))
    .filter((v) => v !== undefined);

  const yMin = obsVals.length > 0 ? Math.min(...obsVals) : 0;
  const yMaxUpper = upperVals.length > 0 ? Math.max(...upperVals) : 0;

  return [yMin - 2, yMaxUpper + (yMaxUpper % 2)];
}
