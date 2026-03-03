export const pretty = (range, n = 5, internalOnly = false) => {
  // from https://gist.github.com/Frencil/aab561687cdd2b0de04a
  let numberOfDivisons = n;
  numberOfDivisons = parseInt(n, 10);
  const minN = numberOfDivisons / 3;
  const shrinkSml = 0.75;
  const highUBias = 1.5;
  const u5Bias = 0.5 + 1.5 * highUBias;
  const d = Math.abs(range[0] - range[1]);
  let c = d / n;
  if (Math.log(d) / Math.LN10 < -2) {
    c = (Math.max(Math.abs(d)) * shrinkSml) / minN;
  }

  const base = 10 ** Math.floor(Math.log(c) / Math.LN10);
  let baseToFixed = 0;
  if (base < 1) {
    baseToFixed = Math.abs(Math.round(Math.log(base) / Math.LN10));
  }

  let unit = base;
  if (2 * base - c < highUBias * (c - unit)) {
    unit = 2 * base;
    if (5 * base - c < u5Bias * (c - unit)) {
      unit = 5 * base;
      if (10 * base - c < highUBias * (c - unit)) {
        unit = 10 * base;
      }
    }
  }

  let ticks = [];
  let i = 0;
  if (range[0] <= unit) {
    i = 0;
  } else {
    i = Math.floor(range[0] / unit) * unit;
    i = parseFloat(i.toFixed(baseToFixed));
  }
  while (i < range[1]) {
    ticks.push(i);
    i += unit;
    if (baseToFixed > 0) {
      i = parseFloat(i.toFixed(baseToFixed));
    }
  }
  ticks.push(i);

  if (internalOnly) {
    if (ticks[0] < range[0]) {
      ticks = ticks.slice(1);
    }
    if (ticks[ticks.length - 1] > range[1]) {
      ticks.pop();
    }
  }

  return ticks;
};

export const getPlotlyLayout = (options) => {
  const smallScreenWidth = 768;
  const {
    showLegend = true,
    bargap = 0.15,
    chartBackgroundColor = "#FBFCFE",
    legendBarLineX = window.innerWidth <= smallScreenWidth ? 0 : 0.65,
    legendBarLineY = window.innerWidth <= smallScreenWidth ? -0.15 : 1.125,
    font = "Arial",
    fontSizeLabels = "14pt",
    fontSizePrimary = "16pt",
    fontSizeLabelsSecondary = "14pt",
    chartTitle = "",
    chartTitleX = window.innerWidth <= smallScreenWidth ? 0.5 : 0.4,
    xmin = 0,
    xmax = 100,
    zeroLineColor = "#000000",
    zerolinewidth = 1.25,
    dtick = window.innerWidth <= smallScreenWidth ? 10 : 5,
    textAngle = window.innerWidth <= 1000 ? 90 : 0,
    periodGroups = 5,
    yAxisText = "",
    yRange = [0, 100],
    gridColor = "#e0e0e0",
    gridwidth = 1,
    yValsAvgAll = 0,
    averageTextUnits = "°F",
    AverageAllColor = "#858585",
    AverageAllWidth = 6,
    AverageAllFontSize = 14,
    AverageAllFontColor = "#000000",
  } = options;

  return {
    displayModeBar: false,
    showlegend: showLegend,
    autosize: true,
    height: 1,
    margin: {
      l: window.innerWidth <= smallScreenWidth ? 35 : 80,
      r: window.innerWidth <= smallScreenWidth ? 15 : 80,
      t: window.innerWidth <= smallScreenWidth ? 50 : 100,
      b: window.innerWidth <= smallScreenWidth ? 50 : 80,
    },

    bargap: bargap,
    plot_bgcolor: chartBackgroundColor,
    paper_bgcolor: chartBackgroundColor,
    legend: {
      yanchor: "top",
      autosize: true,
      orientation: "h",
      x: legendBarLineX,
      y: legendBarLineY,
      font: {
        family: font,
        size: fontSizeLabels,
      },
    },
    title: {
      text: chartTitle,
      font: {
        family: font,
        size: fontSizePrimary,
      },
      x: chartTitleX,
    },
    xaxis: {
      type: "linear",
      range: [xmin - 5, xmax + 5],
      autorange: false,
      automargin: false,
      showspikes: false,
      zeroline: true,
      showline: false,
      showgrid: false,
      fixedrange: true,
      rangemode: "tozero",
      zerolinecolor: zeroLineColor,
      zerolinewidth: zerolinewidth,
      dtick: dtick,
      tick0: 0,
      tickangle: textAngle,
      tickformat: "",
      tickprefix: "",
      nticks: periodGroups,
      ticks: "outside",
      tickcolor: zeroLineColor,
      tickwidth: zerolinewidth,
      tickfont: {
        family: font,
        size: fontSizeLabelsSecondary,
      },
      title: {
        text: "Year",
        font: {
          family: font,
          size: fontSizeLabels,
        },
      },
      constraintoward: "center",
      spikethickness: 4,
      displayModeBar: false,
      autosize: true,
    },
    yaxis: {
      title: {
        text: yAxisText,
        font: {
          family: font,
          size: fontSizeLabels,
        },
      },
      rangemode: "tozero",
      range: yRange,
      type: "linear",
      ticks: "outside",
      tickcolor: zeroLineColor,
      tickwidth: zerolinewidth,
      autorange: false,
      showspikes: false,
      fixedrange: true,
      showline: true,
      linecolor: zeroLineColor,
      linewidth: zerolinewidth,
      zerolinecolor: zeroLineColor,
      zerolinewidth: zerolinewidth,
      showgrid: false,
      bargap: bargap,
    },
    template: {
      layout: {
        hovermode: "closest",
        plot_bgcolor: chartBackgroundColor,
        paper_bgcolor: chartBackgroundColor,
      },
    },
    annotations: [
      {
        xref: "x",
        yref: "y",
        x: xmax + 2.5,
        y: Number(yValsAvgAll.toFixed(1)),
        // Days/nights need a space before the unit; °F and inches do not
        text: `Long-term <br>average:<br>${yValsAvgAll.toFixed(1)}${
          averageTextUnits === "days" || averageTextUnits === "nights"
            ? " " + averageTextUnits
            : averageTextUnits
        }`,
        showarrow: true,
        arrowhead: 7,
        arrowsize: 2,
        arrowwidth: 2,
        arrowcolor: AverageAllColor,
        ay: window.innerWidth <= smallScreenWidth ? -80 : -150,
        ax: window.innerWidth <= smallScreenWidth ? 25 : 45,
        bgcolor: "rgba(255, 255, 255, 0.7)",
        font: {
          family: font,
          size: AverageAllFontSize,
          color: AverageAllFontColor,
        },
      },
    ],
    shapes: [
      {
        type: "line",
        layer: "above",
        x0: xmin - 5,
        y0: Number(yValsAvgAll.toFixed(1)),
        x1: xmax + 5,
        y1: Number(yValsAvgAll.toFixed(1)),
        line: {
          color: AverageAllColor,
          width: AverageAllWidth,
        },
      },
      {
        type: "line",
        layer: "above",
        x0: xmin - 5,
        y0: 0,
        x1: xmax + 5,
        y1: 0,
        line: {
          color: zeroLineColor,
          width: zerolinewidth,
        },
      },
      {
        type: "line",
        layer: "above",
        x0: xmin - 5,
        y0: yRange[yRange.length - 1],
        x1: xmax + 5,
        y1: yRange[yRange.length - 1],
        line: {
          color: gridColor,
          width: gridwidth,
        },
      },
      {
        type: "line",
        layer: "above",
        x0: xmin - 5,
        y0: yRange[0],
        x1: xmax + 5,
        y1: yRange[0],
        line: {
          color: zeroLineColor,
          width: zerolinewidth,
        },
      },
    ],
  };
};

export const getPredictedDataLayout = (options) => {
  const smallScreenWidth = 768;
  const {
    showLegend = true,
    bargap = 0.15,
    chartBackgroundColor = "#FBFCFE",
    legendBarLineX = window.innerWidth <= smallScreenWidth ? 0 : 0.65,
    legendBarLineY = window.innerWidth <= smallScreenWidth ? -0.15 : 1.125,
    font = "Arial",
    fontSizeLabels = "14",
    fontSizePrimary = "16",
    fontSizeLabelsSecondary = "14",
    chartTitle = "",
    chartTitleX = window.innerWidth <= smallScreenWidth ? 0.5 : 0.4,
    xmin = 0,
    xmax = 100,
    zeroLineColor = "#000000",
    zerolinewidth = 1.25,
    dtick = window.innerWidth <= smallScreenWidth ? 10 : 5,
    textAngle = window.innerWidth <= 1000 ? 90 : 0,
    periodGroups = 5,
    yAxisText = "",
    yRange = [0, 100],
    gridColor = "#e0e0e0",
    gridwidth = 1,
    yValsAvgAll = 0,
    averageTextUnits = "°F",
    AverageAllColor = "#ff0000",
    AverageAllWidth = 2,
    AverageAllFontSize = 12,
    AverageAllFontColor = "#000000",
    yMax,
    yMin,
    xvals,
    yHigherTop,
    yHigherBottom,
    yIntermediateTop,
    yIntermediateBottom,
    yLowerTop,
    yLowerBottom,
    y370Top,
    y370Bottom,
  } = options;
  const tickvals = xvals.filter((year) => Number(year) % 25 === 0);

  return {
    displayModeBar: false,
    showlegend: showLegend,
    autosize: true,
    bargap: bargap,
    plot_bgcolor: chartBackgroundColor,
    paper_bgcolor: chartBackgroundColor,
    margin: {
      l: window.innerWidth <= smallScreenWidth ? 35 : undefined,
      r: window.innerWidth <= smallScreenWidth ? 15 : 150,
      t: window.innerWidth <= smallScreenWidth ? 50 : undefined,
      b: window.innerWidth <= smallScreenWidth ? 50 : undefined,
    },
    legend: {
      orientation: "v",
      autosize: true,
      x: 0.01,
      y: 0.9,
      xanchor: "left",
      yanchor: "top",
      font: {
        family: font,
        size: fontSizeLabels,
      },
      bgcolor: "rgba(255, 255, 255, 0.8)",
      bordercolor: "#000000",
      borderwidth: 1,
    },
    title: {
      text: chartTitle,
      font: {
        family: font,
        size: "24", // fontSizePrimary,
      },
      x: chartTitleX,
      y: 0.92,
    },
    xaxis: {
      type: "linear",
      range: [xmin, xmax],
      autorange: false,
      automargin: false,
      showspikes: false,
      zeroline: true,
      showline: true,
      showgrid: false,
      fixedrange: true,
      rangemode: "tozero",
      zerolinecolor: zeroLineColor,
      zerolinewidth: zerolinewidth,
      tickvals: tickvals,
      ticktext: tickvals,
      tickangle: textAngle,
      tickformat: "",
      tickprefix: "",
      ticks: "outside",
      tickcolor: zeroLineColor,
      tickwidth: zerolinewidth,
      tickfont: {
        family: font,
        size: fontSizeLabelsSecondary,
      },
      title: {
        text: "Year",
        font: {
          family: font,
          size: fontSizeLabels,
        },
      },
      constraintoward: "center",
      spikethickness: 4,
      displayModeBar: false,
      autosize: true,
      gridcolor: gridColor,
      gridwidth: gridwidth,
    },
    yaxis: {
      title: {
        text: yAxisText,
        font: {
          family: font,
          size: fontSizeLabels,
        },
      },
      showgrid: false,
      rangemode: "tozero",
      range: [yMin, yMax],
      type: "linear",
      ticks: "outside",
      tickcolor: zeroLineColor,
      tickwidth: zerolinewidth,
      autorange: false,
      showspikes: false,
      fixedrange: true,
      showline: true,
      linecolor: zeroLineColor,
      linewidth: zerolinewidth,
      zerolinecolor: "#BFBFBF",
      zerolinewidth: "5.0",
      bargap: bargap,
    },
    template: {
      layout: {
        hovermode: "x unified",
        plot_bgcolor: chartBackgroundColor,
        paper_bgcolor: chartBackgroundColor,
      },
    },
    annotations: [
      // Very High Emissions label
      {
        x: 1.0375,
        y: (yIntermediateTop + yIntermediateBottom) / 1.1,
        xref: "paper",
        yref: "y",
        text: "Very High",
        showarrow: false,
        textangle: -90,
        font: { color: "rgb(189,0,38)", size: 18, family: "Arial" },
        align: "left",
        meta: { scenario: "SSP5-8.5" },
      },
      // Intermediate Emissions label
      {
        x: 1.0485,
        y: (yIntermediateTop + yIntermediateBottom) / 2,
        xref: "paper",
        yref: "y",
        text: "Intermediate",
        showarrow: false,
        textangle: -90,
        font: { color: "rgb(105,105,105)", size: 18, family: "Arial" },
        align: "left",
        meta: { scenario: "SSP2-4.5" },
      },
      // High Emissions label
      {
        x: 1.0615,
        y: (y370Top + y370Bottom) / 2,
        xref: "paper",
        yref: "y",
        text: "High",
        showarrow: false,
        textangle: -90,
        font: { color: "rgb(247,148,30)", size: 18, family: "Arial" },
        align: "left",
        meta: { scenario: "SSP3-7.0" },
      },
      // Low Emissions label
      {
        x: 1.0745,
        y: (yLowerTop + yLowerBottom) / 2,
        xref: "paper",
        yref: "y",
        text: "Low",
        showarrow: false,
        textangle: -90,
        font: { color: "rgb(90,180,172)", size: 18, family: "Arial" },
        align: "left",
        meta: { scenario: "SSP1-2.6" },
      },
    ],
    shapes: [
      // Higher Emissions bracket
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.0085,
        y0: yHigherTop,
        x1: 1.0085,
        y1: yHigherBottom,
        line: { color: "rgb(189,0,38)", width: 5 },
        meta: { scenario: "SSP5-8.5" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: yHigherTop,
        x1: 1.01,
        y1: yHigherTop,
        line: { color: "rgb(189,0,38)", width: 5 },
        meta: { scenario: "SSP5-8.5" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: yHigherBottom,
        x1: 1.01,
        y1: yHigherBottom,
        line: { color: "rgb(189,0,38)", width: 5 },
        cap: "round",
        meta: { scenario: "SSP5-8.5" },
      },
      // Intermediate Emissions bracket
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.0185,
        y0: yIntermediateTop,
        x1: 1.0185,
        y1: yIntermediateBottom,
        line: { color: "rgb(105,105,105)", width: 5 },
        meta: { scenario: "SSP2-4.5" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: yIntermediateTop,
        x1: 1.02,
        y1: yIntermediateTop,
        line: { color: "rgb(105,105,105)", width: 5 },
        meta: { scenario: "SSP2-4.5" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: yIntermediateBottom,
        x1: 1.02,
        y1: yIntermediateBottom,
        line: { color: "rgb(105,105,105)", width: 5 },
        meta: { scenario: "SSP2-4.5" },
      },
      // High Emissions bracket (SSP3-7.0)
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.0285,
        y0: y370Top,
        x1: 1.0285,
        y1: y370Bottom,
        line: { color: "rgb(247,148,30)", width: 5 },
        meta: { scenario: "SSP3-7.0" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: y370Top,
        x1: 1.03,
        y1: y370Top,
        line: { color: "rgb(247,148,30)", width: 5 },
        meta: { scenario: "SSP3-7.0" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: y370Bottom,
        x1: 1.03,
        y1: y370Bottom,
        line: { color: "rgb(247,148,30)", width: 5 },
        meta: { scenario: "SSP3-7.0" },
      },
      // Low Emissions bracket (SSP1-2.6)
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.0385,
        y0: yLowerTop,
        x1: 1.0385,
        y1: yLowerBottom,
        line: { color: "rgb(90,180,172)", width: 5 },
        meta: { scenario: "SSP1-2.6" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: yLowerTop,
        x1: 1.04,
        y1: yLowerTop,
        line: { color: "rgb(90,180,172)", width: 5 },
        meta: { scenario: "SSP1-2.6" },
      },
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 1.001,
        y0: yLowerBottom,
        x1: 1.04,
        y1: yLowerBottom,
        line: { color: "rgb(90,180,172)", width: 5 },
        meta: { scenario: "SSP1-2.6" },
      },
      // Zero line and grid lines
      {
        type: "line",
        layer: "above",
        x0: xmin - 5,
        y0: 0,
        x1: xmax + 5,
        y1: 0,
        line: {
          color: zeroLineColor,
          width: zerolinewidth,
        },
      },
      {
        type: "line",
        layer: "above",
        x0: xmin - 5,
        y0: yMax,
        x1: xmax + 5,
        y1: yMax,
        line: {
          color: gridColor,
          width: gridwidth,
        },
      },
      {
        type: "line",
        layer: "above",
        x0: xmin - 5,
        y0: yRange[0],
        x1: xmax + 5,
        y1: yRange[0],
        line: {
          color: zeroLineColor,
          width: zerolinewidth,
        },
      },
    ],
  };
};
