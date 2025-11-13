import SandboxHumanReadable from "./SandboxHumanReadable.jsx";

class SandboxGeneratePlotData {
  constructor(props) {
    // style guide driven colors, fonts, ticks may need expanding
    //  https://docs.google.com/document/d/1_zO39hdlGL9uY0Y0Vf57ncYNYXuACUAIM0fKCUo3spc/edit?ts=5fa547dd#
    this.smallScreen = 768;
    this.verySmallScreen = 500;
    this.blue = "4, 90, 141";
    this.red = "189, 0, 38";
    this.green = "127, 188, 65";
    this.brown = "153, 52, 4";
    this.chartBackgroundColor = "#FBFCFE";
    this.annualLineColor = "#000000";
    this.precipitationColor = "#5AB4AC";
    this.temperatureColor = "#FEB24C";
    this.heatingDegreeColor = "#DB1E1C";
    this.coolingDegreeColor = "#2276B4";
    this.bargap = 0.15;
    this.showLegend = true;
    this.legendBarLineX = window.innerWidth <= this.smallScreen ? 0 : 0.65;
    this.legendBarLineY = window.innerWidth <= this.smallScreen ? -0.15 : 1.125;
    this.font = "Arial";
    this.zeroLineColor = "#000000";
    this.zerolinewidth = "1.25";
    this.gridColor = "#BFBFBF";
    this.SourceFontColor = "#000000";
    this.AverageAllFontColor = "#858585";
    this.AverageAllColor = "#858585";
    this.AverageMovingColor = "#858585";
    this.AverageAllWidth = "6";
    this.AverageAllFontSize = "14pt";
    this.AverageWidth = "3";
    this.AverageColor = "#000000";
    this.gridWidth = "1";
    this.fontSizePrimary = "14pt";
    this.fontSizeLabels = "12pt";
    this.fontSizeLabelsSecondary = "12pt";
    this.xmin = props.xmin;
    this.xmax = props.xmax;
    this.xvals = props.xvals;
    this.yvals = props.yvals;
    // this.chartShowLine = props.chartShowLine;
    this.lineChart = props.chartLineChart;
    this.maxVal = Math.max(...this.yvals);
    this.minVal = Math.min(...this.yvals);
    this.shortTitle = SandboxGeneratePlotData.splitTitle(props.chartTitle);
    this.chartTitle =
      window.innerWidth <= this.smallScreen
        ? this.shortTitle
        : props.chartTitle;
    this.SmallScreenBreak = window.innerWidth <= this.smallScreen ? "<br>" : "";
    this.chartTitleX = window.innerWidth <= this.smallScreen ? 0.5 : 0.4;
    this.legnedText = props.legnedText;
    this.chartType = props.chartType;
    this.climatevariable = props.climatevariable;
    this.season = props.season;
    this.barColor = this.setChartColor(this.chartType);
    this.periodGroups = props.periodGroups ? props.periodGroups : 5;
    this.AverageMovingPeriod = 5;
    this.textAngle = window.innerWidth <= 1000 ? 90 : 0;
    this.dtick = window.innerWidth <= this.smallScreen ? 10 : 5;
    this.yValsSumByPeriod = this.yValsSumByPeriod();
    this.yValsAvgByPeriod = this.yValsAvgByPeriod();
    this.yValsMovingAverage = this.computeMovingAverage();
    this.xValsMovingAverage = this.movingAverageXValues();
    this.xValsPeriod = this.xValsPeriod();
    const sumAll = this.yValsSumAll();
    this.yValsSumAll = sumAll <= -50 ? undefined : sumAll;
    const avgAll = this.yValsAvgAll();
    this.yValsAvgAll = avgAll <= -50 ? 0 : avgAll;
    const min = this.minVal < 0 ? 0 : this.minVal;
    this.prettyRange = SandboxGeneratePlotData.pretty([min, this.maxVal]);
    this.yRange = [
      this.prettyRange[0],
      this.prettyRange[this.prettyRange.length - 1],
    ];
    this.yAxisText = props.yAxisText;
    this.legendPerText = this.createLegendPerText();
    this.legendElapsedText = this.legendElapsedText();
    this.averageTextUnits = props.avgTextUnits;
  }

  // set color for chart based on climate variable or chartType
  setChartColor(chartType) {
    console.log(chartType);
    switch (chartType) {
      case "Precipitation":
        return this.precipitationColor;
      case "Temperature":
        return this.temperatureColor;
      case "CoolingDays":
        return this.coolingDegreeColor;
      case "HeatingDays":
        return this.heatingDegreeColor;
      default:
        return this.temperatureColor;
    }
  }

  // default season text
  hoverTemplateSeasonText() {
    const sandboxHumanReadable = new SandboxHumanReadable();
    const seasonHumanReadable = sandboxHumanReadable.getSeasonPullDownText(
      this.season,
    );
    if (this.season !== "yearly") {
      if (this.season === "ann") return "annually";
      return seasonHumanReadable.toLowerCase().split(" ")[0].replace(":", "");
    }
    console.log("hoverTemplateSeasonText");
    return "year";
  }

  // creates units days, °F, " for annotation on Average line
  textUnitsWords() {
    // seasonal units for inches of precip and degrees farhnheit
    if (this.season !== "yearly") {
      return this.chartType === "Precipitation" ? "inches" : "°F";
    }
    // threshold which is days in the regions locatipon
    if (this.season === "yearly") {
      return "days";
    }
    // deault to days
    return "days";
  }

  // creates units days, °F, " for annotation on Average line
  averageTextUnits() {
    // seasonal units for inches of precip and degrees farhnheit
    if (this.season !== "yearly") {
      return this.chartType === "Precipitation" ? '"' : "°F";
    }
    // threshold which is days in the regions locatipon
    if (this.season === "yearly") {
      return "days";
    }
    // deault to days
    return "days";
  }

  // creates legend text in parentheses
  legendElapsedText() {
    // seasonal legend text
    if (this.season !== "yearly") {
      const seasonText = this.hoverTemplateSeasonText();
      const unitText = this.textUnitsWords();
      const legendPerText = `${unitText} ${seasonText.split(" ")[0].toLowerCase()}`;
      return legendPerText;
    }
    // threshold legend text
    if (this.season === "yearly") {
      const legendPerText = "days";
      return legendPerText;
    }
    // default legend text
    return "days";
  }

  // creates legend per text
  //  this is the per year or per season
  createLegendPerText() {
    if (this.season !== "yearly") {
      const seasonText = this.hoverTemplateSeasonText();
      // seasonal prefix legend text
      let fortext = "for ";
      // seasonal when annual prefix legend text
      if (this.season === "ann") {
        fortext = "";
      }
      const legendPerText = `${fortext}${seasonText.split(" ")[0].toLowerCase()}`;
      return legendPerText;
    }
    // threshold prefix legend text
    if (this.season === "yearly") {
      const legendPerText = "per year";
      return legendPerText;
    }
    // default prefix legend text
    return "per year";
  }

  // splits chart title string into parts so its truncated
  // on small screens
  static splitTitle(title) {
    if (!title) return "";
    const longestLength = 25;
    const titleLength = title.length;

    let newTitle = title;
    for (
      let pos = longestLength;
      pos < titleLength;
      pos = pos + 5 + longestLength
    ) {
      const sepPos = newTitle.indexOf(" ", pos);
      if (sepPos > 0) {
        newTitle = `${newTitle.substring(0, sepPos)}<br>${newTitle.substring(sepPos + 1)}`;
      }
    }
    return newTitle;
  }

  static pretty(range, n = 5, internalOnly = false) {
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
  }

  // calc moving average
  computeMovingAverage() {
    const data = this.yvals;
    const period = this.AverageMovingPeriod;
    const getAverage = (avgArr) =>
      avgArr.reduce((a, b) => a + b, 0) / avgArr.length;
    const movingAverages = [];

    // if the period is greater than the length of the dataset
    // then return the average of the whole dataset
    if (period > data.length) {
      return getAverage(data);
    }
    for (let x = 0; x + period - 1 < data.length; x += 1) {
      movingAverages.push(getAverage(data.slice(x, x + period)));
    }
    return movingAverages;
  }

  // calc moving average
  movingAverageXValues() {
    const data = this.xvals;
    const period = this.AverageMovingPeriod;
    const halfPeriod = Math.floor(this.periodGroups / 2);
    const movingAveragesX = [];

    for (
      let x = period - halfPeriod - 1;
      x - period - 1 < data.length;
      x += 1
    ) {
      movingAveragesX.push(data[x]);
    }
    return movingAveragesX;
  }

  // creates the y values for each period
  xValsPeriod() {
    let count = 0;
    const halfPeriod = Math.floor(this.periodGroups / 2);
    const yValsPeriodAll = this.xvals.map((value, index) => {
      // eslint-disable-line
      // return value
      if (index === 0) {
        return value <= -50 ? undefined : value + halfPeriod;
      }
      if (count === this.periodGroups - 1) {
        count = 0;
        return value <= -50 ? undefined : value + halfPeriod;
      }
      count += 1;
    });
    return yValsPeriodAll.filter((value) => value !== undefined);
  }

  // sum values
  yValsSumAll() {
    return this.yvals.reduce((a, b) => a + b, 0);
  }

  // sums for the defined periods, creates a new array with period means
  yValsSumByPeriod() {
    let count = 0;
    let peroidSum = 0;
    let returnSum = 0;
    const yvalsCount = this.yvals.length - 1;
    const sumXvalsAll = this.yvals.map((value, index) => {
      // eslint-disable-line
      if (count === this.periodGroups - 1) {
        peroidSum += value <= -50 ? undefined : value;
        returnSum = peroidSum;
        count = 0;
        peroidSum = 0;
        return Number(Number(returnSum).toFixed(4));
      } else {
        // eslint-disable-line no-else-return
        peroidSum += value <= -50 ? undefined : value;
        count += 1;
      }

      // make last bar if its not full period
      if (index === yvalsCount) {
        peroidSum += value;
        returnSum = peroidSum;
        return Number(Number(returnSum).toFixed(4));
      }
    });
    return sumXvalsAll.filter((value) => value !== undefined);
  }

  // overall average
  yValsAvgAll() {
    return this.yvals.reduce((a, b) => a + b, 0) / this.yvals.length;
  }

  // means for the defined periods, creates a new array with period means
  yValsAvgByPeriod() {
    let count = 0;
    let peroidSum = 0;
    let returnAvg = 0;
    const yvalsCount = this.yvals.length - 1;
    const avgXvalsAll = this.yvals.map((value, index) => {
      // eslint-disable-line
      if (count === this.periodGroups - 1) {
        peroidSum += value <= -50 ? undefined : value;
        returnAvg = peroidSum / this.periodGroups;
        count = 0;
        peroidSum = 0;
        return Number(Number(returnAvg).toFixed(4));
      } else {
        // eslint-disable-line no-else-return
        peroidSum += value <= -50 ? undefined : value;
        count += 1;
      }

      // make last bar if its not full period
      if (index === yvalsCount) {
        returnAvg = peroidSum / count;
        return Number(Number(returnAvg).toFixed(4));
      }
    });
    return avgXvalsAll.filter((value) => value !== undefined);
  }

  setXRange(props) {
    this.xmin = props.xmin;
    this.xmax = props.xmax;
  }

  // get the chart layout
  getLayout() {
    // switch for handling layout of chart depending on what variable is the line
    // for now its yearly, period average (defaults to 5), or
    // period moving average (defaults to 5).
    switch (this.lineChart) {
      default:
        // yearly the line chart average is the bar chart
        return this.layoutAverageBar();
    }
  }

  // layout  when average is a bar
  layoutAverageBar() {
    return {
      displayModeBar: false,
      showlegend: this.showLegend,
      autosize: true,
      height: 1,
      bargap: this.bargap,
      plot_bgcolor: this.chartBackgroundColor,
      paper_bgcolor: this.chartBackgroundColor,
      legend: {
        yanchor: "top",
        autosize: true,
        orientation: "h",
        x: this.legendBarLineX,
        y: this.legendBarLineY,
        font: {
          family: this.font,
          size: this.fontSizeLabels,
        },
      },
      title: {
        text: this.chartTitle,
        font: {
          family: this.font,
          size: this.fontSizePrimary,
        },
        x: this.chartTitleX,
      },
      xaxis: {
        type: "linear",
        range: [this.xmin - 5, this.xmax + 5],
        autorange: false,
        automargin: false,
        showspikes: false,
        zeroline: true,
        showline: false,
        showgrid: false,
        fixedrange: true,
        rangemode: "tozero",
        zerolinecolor: this.zeroLineColor,
        zerolinewidth: this.zerolinewidth,
        dtick: this.dtick,
        tick0: 0,
        tickangle: this.textAngle,
        tickformat: "",
        tickprefix: "",
        nticks: this.periodGroups,
        ticks: "outside",
        tickcolor: this.zeroLineColor,
        tickwidth: this.zerolinewidth,
        tickfont: {
          family: this.font,
          size: this.fontSizeLabelsSecondary,
        },
        title: {
          text: "Year",
          font: {
            family: this.font,
            size: this.fontSizeLabels,
          },
        },
        constraintoward: "center",
        spikethickness: 4,
        displayModeBar: false,
        autosize: true,
      },
      yaxis: {
        title: {
          text: this.yAxisText,
          font: {
            family: this.font,
            size: this.fontSizeLabels,
          },
        },
        rangemode: "tozero",
        range: this.yRange,
        type: "linear",
        ticks: "outside",
        tickcolor: this.zeroLineColor,
        tickwidth: this.zerolinewidth,
        autorange: false,
        showspikes: false,
        fixedrange: true,
        showline: true,
        linecolor: this.zeroLineColor,
        linewidth: this.zerolinewidth,
        zerolinecolor: this.zeroLineColor,
        zerolinewidth: this.zerolinewidth,
        gridcolor: this.gridColor,
        gridwidth: this.gridwidth,
        bargap: this.bargap,
      },
      template: {
        layout: {
          hovermode: "closest",
          plot_bgcolor: this.chartBackgroundColor,
          paper_bgcolor: this.chartBackgroundColor,
        },
      },
      annotations: [
        {
          xref: "x",
          yref: "y",
          x: this.xmax + 2.5,
          y: this.yValsAvgAll.toFixed(1),
          text: `Average ${this.yValsAvgAll.toFixed(1)} ${this.averageTextUnits}`,
          showarrow: true,
          arrowhead: 7,
          arrowsize: 2,
          arrowwidth: 2,
          arrowcolor: this.AverageAllColor,
          ay: -100,
          ax: 10,
          bgcolor: "#ffffff",
          font: {
            family: this.font,
            size: this.AverageAllFontSize,
            color: this.AverageAllFontColor,
          },
        },
      ],
      shapes: [
        {
          type: "line",
          layer: "below",
          x0: this.xmin - 5,
          y0: this.yValsAvgAll.toFixed(1),
          x1: this.xmax + 5,
          y1: this.yValsAvgAll.toFixed(1),
          line: {
            color: this.AverageAllColor,
            width: this.AverageAllWidth,
          },
        },
        {
          type: "line",
          layer: "above",
          x0: this.xmin - 5,
          y0: 0,
          x1: this.xmax + 5,
          y1: 0,
          line: {
            color: this.zeroLineColor,
            width: this.zerolinewidth,
          },
        },
        {
          type: "line",
          layer: "above",
          x0: this.xmin - 5,
          y0: this.yRange[this.yRange.length - 1],
          x1: this.xmax + 5,
          y1: this.yRange[this.yRange.length - 1],
          line: {
            color: this.gridColor,
            width: this.gridwidth,
          },
        },
        {
          type: "line",
          layer: "above",
          x0: this.xmin - 5,
          y0: this.yRange[0],
          x1: this.xmax + 5,
          y1: this.yRange[0],
          line: {
            color: this.zeroLineColor,
            width: this.zerolinewidth,
          },
        },
      ],
    };
  }
}

export default SandboxGeneratePlotData;
