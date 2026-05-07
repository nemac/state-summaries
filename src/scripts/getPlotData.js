import { colors } from "../theme";

// CONSTANTS
const smallScreen = 768;
const blue = "4, 90, 141";
const red = "189, 0, 38";
const green = "127, 188, 65";
const brown = "153, 52, 4";

/**
 * Generates an array of 5-year range strings (e.g., "1930–1934", "1935–1939")
 * between a given start and end year.
 *
 * The groups are aligned to the standard half-decade boundaries (years ending in 0 or 5).
 * The first and last groups are adjusted to strictly adhere to the provided startYear and endYear.
 *
 * @param {number} startYear The starting year for the ranges.
 * @param {number} endYear The ending year for the ranges.
 * @returns {string[]} An array of formatted range strings.
 */
export const createFiveYearGroups = (startYear, endYear) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to the end year.");
    return [];
  }

  const groups = [];
  // 1. Determine the starting year for the first 5-year block boundary.
  // E.g., if startYear is 1932, blockStart becomes 1930. If it's 1930, it remains 1930.
  let blockStart = Math.floor(startYear / 5) * 5;

  // 2. Loop through 5-year blocks until the block starts past the end year.
  while (blockStart <= endYear) {
    // Standard end of the 5-year block
    let blockEnd = blockStart + 4;

    // Initialize the group bounds to the block bounds
    let groupStart = blockStart;
    let groupEnd = blockEnd;

    // 3. Adjust the groupStart to match the input startYear if the block starts earlier.
    if (groupStart < startYear) {
      groupStart = startYear;
    }

    // 4. Adjust the groupEnd to match the input endYear if the block extends past it.
    if (groupEnd > endYear) {
      groupEnd = endYear;
    }

    // 5. Only push the group if the adjusted start is valid (e.g., prevents "2024—2023")
    if (groupStart <= groupEnd) {
      // Use the '–' (en dash) separator as requested
      groups.push(`${groupStart}–${groupEnd}`);
    }

    // Move to the next 5-year block
    blockStart += 5;
  }

  return groups;
};

// converts strings to annually, spring, summer, fall, or winter
const convertToSeasons = (periodOfTime) => {
  switch (periodOfTime) {
    case "ann":
      return "annually.";
    case "mam":
      return "in the spring.";
    case "jja":
      return "in the summer.";
    case "son":
      return "in the fall.";
    case "djf":
      return "in the winter.";
    default:
      return "annually.";
  }
};

export const getHoverTemplate = (type, data, selectedSeason) => {
  // Days/nights need a space before the unit; °F and inches do not
  const unitSpace =
    data.avgTextUnits === "days" || data.avgTextUnits === "nights" ? " " : "";
  switch (type) {
    case "scatter":
      return ` In %{x} the ${data.tooltip} was %{y:0.2f}${unitSpace}${data.avgTextUnits} ${convertToSeasons(selectedSeason.value)} <extra></extra>`.replace(
        / {2}/g,
        " ",
      );
    case "histogram":
      return ` Between %{customdata} the ${data.tooltip} was %{y:0.2f}${unitSpace}${data.avgTextUnits} ${convertToSeasons(selectedSeason.value)}  <extra></extra>`.replace(
        / {2}/g,
        " ",
      );
  }
};

export const setChartColor = (chartType) => {
  if (chartType === "Precipitation") {
    return colors.precipitation;
  }
  return colors.temperature; // Temperature
};

export const getPlotData = (data) => {
  return {
    mode: data.mode,
    name: data.name,
    type: data.type,
    ...(data.histfunc && { histfunc: data.histfunc }),
    ...(data.xbins && { xbins: data.xbins }),
    ...(data.nbinsx && { nbinsx: data.nbinsx }),
    x: data.xValues,
    y: data.yValues.map((item) => (item === -999 ? null : item)),
    ...(data.bargroupgap && { bargroupgap: data.bargroupgap }),
    ...(data.marker && { marker: data.marker }),
    ...(data.line && { line: data.line }),
    ...(data.fill && { fill: data.fill }),
    ...(data.fillcolor && { fillcolor: data.fillcolor }),
    ...(data.connectgaps && { connectgaps: data.connectgaps }),
    ...(data.customdata && { customdata: data.customdata }),
    ...(data.legendGroup && { legendGroup: data.legendGroup }),
    ...(data.orientation && { orientation: data.orientation }),
    hoverinfo: "x+y",
    hovertemplate: data.hoverTemplate,
  };
};
