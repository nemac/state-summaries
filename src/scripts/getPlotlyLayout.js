import { colors } from "../theme";

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
    chartBackgroundColor = colors.backgroundChart,
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
    zeroLineColor = colors.zeroLine,
    zerolinewidth = 1.25,
    dtick = window.innerWidth <= smallScreenWidth ? 10 : 5,
    textAngle = window.innerWidth <= 1000 ? 90 : 0,
    periodGroups = 5,
    yAxisText = "",
    yRange = [0, 100],
    gridColor = colors.gridLine,
    gridwidth = 1,
    yValsAvgAll = 0,
    averageTextUnits = "°F",
    AverageAllColor = colors.averageLine,
    AverageAllWidth = 6,
    AverageAllFontSize = 14,
    AverageAllFontColor = colors.textPrimary,
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
        bgcolor: colors.overlay.white70,
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

