import { colors } from "../theme";

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
    // A bar's height runs from the bottom of the axis, so its y is not the
    // average. customdata holds [years label, average] for each bar.
    case "bar":
      return ` Between %{customdata[0]} the ${data.tooltip} was %{customdata[1]:0.2f}${unitSpace}${data.avgTextUnits} ${convertToSeasons(selectedSeason.value)}  <extra></extra>`.replace(
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

// Each bar fills 85% of its 5 years, which keeps the gap between bars the
// chart had before.
const BAR_SHARE_OF_BLOCK = 0.85;

// Bars rise from the bottom of the axis, as on NOAA's charts, so a 5-year
// average below zero still shows as a short bar instead of hanging below 0.
export const getFiveYearBarData = ({ blocks, axisBottom, name, color, hoverTemplate }) => {
  const middleYears = [];
  const heights = [];
  const widths = [];
  const hoverDetails = [];
  for (const block of blocks) {
    const yearsInBlock = block.lastYear - block.firstYear + 1;
    middleYears.push(block.firstYear + yearsInBlock / 2);
    heights.push(block.average - axisBottom);
    widths.push(yearsInBlock * BAR_SHARE_OF_BLOCK);
    hoverDetails.push([block.label, block.average]);
  }
  return getPlotData({
    name,
    type: "bar",
    xValues: middleYears,
    yValues: heights,
    base: axisBottom,
    width: widths,
    marker: { line: { color, width: 1 }, color },
    hoverTemplate,
    customdata: hoverDetails,
  });
};

export const getPlotData = (data) => {
  return {
    mode: data.mode,
    name: data.name,
    type: data.type,
    x: data.xValues,
    y: data.yValues.map((item) => (item === -999 ? null : item)),
    ...(data.base !== undefined && { base: data.base }),
    ...(data.width && { width: data.width }),
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
