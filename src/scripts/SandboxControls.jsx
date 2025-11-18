import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import FileSaver from "file-saver";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import SandboxPlotRegion from "./SandboxPlotRegion.jsx";
import SandboxAlert from "./SandboxAlert.jsx";

import config from "../configs/config.js";

import SaveChart from "../components/SaveChart.jsx";
import MegaMenu from "../components/MegaMenu.jsx";
import ClimateVariableAndSeasonality from "../components/ClimateVariableAndSeasonality.jsx";
import parseFile from "./utils.js";
import {
  createFiveYearGroups,
  getHoverTemplate,
  getPlotData,
  setChartColor,
} from "./getPlotData.js";
import {
  getPlotlyLayout,
  getPredictedDataLayout,
  pretty,
} from "./getPlotlyLayout.js";
import { fetchObservedAndProjectedData } from "./plotObservedAndPredicted.js";

// Fetch sandbox data file and parse it
const fetchSandboxDataFile = async (dataFile, locationType, selectionLabel) => {
  const response = await fetch(
    `./sandboxdata/2025_Sandbox_Datafiles/${dataFile}`,
  );
  const data = await response.text();

  // parse the csv text file
  const chartDataFromFile = parseFile(
    data,
    locationType,
    locationType === "states"
      ? config.stateAbbreviations[selectionLabel]
      : config.ncaRegionAbbreviations[selectionLabel],
  );

  return chartDataFromFile;
};

export default function SandboxControls() {
  const theme = useTheme();

  // Initialize state from URL parameters or defaults
  const getInitialSelection = () => {
    const params = new URLSearchParams(window.location.search);
    const selectionParam = params.get("selection");
    if (selectionParam) {
      // Search in both regionsOptions and statesOptions
      let foundSelection = config.regionsOptions.find(
        (region) => region.value === selectionParam,
      );
      if (!foundSelection && config.statesOptions) {
        foundSelection = config.statesOptions.find(
          (state) => state.value === selectionParam,
        );
      }
      if (foundSelection) return foundSelection;
    }
    return config.regionsOptions.find((region) => region.value === "CONUS");
  };

  const getInitialClimateOption = () => {
    const params = new URLSearchParams(window.location.search);
    const optionParam = params.get("option");
    if (optionParam) {
      // Search in all climate option arrays
      let foundOption = config.historicalSeasonalityOptions.find(
        (option) => option.value === optionParam,
      );
      if (!foundOption && config.temperatureOptions) {
        foundOption = config.temperatureOptions.find(
          (option) => option.value === optionParam,
        );
      }
      if (!foundOption && config.precipitationOptions) {
        foundOption = config.precipitationOptions.find(
          (option) => option.value === optionParam,
        );
      }
      if (!foundOption && config.observedProjectedOptions) {
        foundOption = config.observedProjectedOptions.find(
          (option) => option.value === optionParam,
        );
      }
      if (foundOption) return foundOption;
    }
    return config.historicalSeasonalityOptions.find(
      (option) => option.value === "tmean",
    );
  };

  const [megaMenuSelection, setMegaMenuSelection] = useState(() =>
    getInitialSelection(),
  );
  const [climateOption, setClimateOption] = useState(() =>
    getInitialClimateOption(),
  );
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [climateMenuOpen, setClimateMenuOpen] = useState(false);
  const [showMapImage, setShowMapImage] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState({
    label: "Annual",
    value: "ann",
  });

  // END NEW STATE VARIABLES

  // set React state via React Hooks
  // used to open or close the alert box
  const [openError, setOpenError] = useState(false);
  // chart error message
  const [chartErrorMessage, setChartErrorMessage] = useState("Chart Error");

  // chart data from files in ../sandboxdata
  const [chartData, setChartData] = useState([{}]);
  // plotly chart layout defaults
  const layoutDefaults = {
    title: {
      text: "",
    },
    font: { size: 18 },
  };
  // plotly chart layout
  const [chartLayout, setChartLayout] = useState(layoutDefaults);
  // chart data json file
  const [climateDataFilesJSON, setClimateDataFilesJSON] = useState([""]);

  const seasonOptions = [
    { label: "Annual ", value: "ann" },
    { label: "Spring", value: "mam" },
    { label: "Summer", value: "jja" },
    { label: "Autumn", value: "son" },
    { label: "Winter", value: "djf" },
  ];

  // Update URL query parameters
  const updateURLParams = (selection, option) => {
    const params = new URLSearchParams();
    params.set("selection", selection.value);
    params.set("option", option.value);
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newURL);
  };

  // check if the selection has predicted data available
  const checkForPredictedData = (selection) => {
    return config.hasPredictedData.includes(selection.label);
  };

  // get chart data from current state = which should include
  const getChartData = (props) => {
    const { selection, climateDataFilesJSONFile, climateOption } = props;

    const selectionLabel = selection.label;

    const locationType = selection.type;
    const data = climateDataFilesJSONFile[locationType];

    // Construct file type identifier, appending selected season if seasonality === true
    // e.g. value = prcp and if seasonId = ann this becomes prcp_ann
    const fileType = climateOption.seasonality
      ? climateOption.value + "_" + selectedSeason.value
      : climateOption.value;
    const chartType = climateOption.chartType;

    // Find the best matching file from the available data files
    // Filter files by location type and file type, then find the best date range match
    const matchingFiles = data.filter((file) => file.type === fileType);

    // Prefer files with date ranges 1895-2024 or 1900-2024 over 1950-2024
    const preferredFile =
      matchingFiles.find(
        (file) => file.period === "1895-2024" || file.period === "1900-2024",
      ) || matchingFiles[0]; // fallback to first match if no preferred range found

    const dataFile = preferredFile
      ? preferredFile.name
      : `${locationType}_${fileType}_1900-2024_SCS2025.txt`;

    fetchSandboxDataFile(dataFile, locationType, selectionLabel)
      .then((chartDataFromFile) => {
        const chartTitle =
          climateOption.seasonality && climateOption.getLabel
            ? `${selectionLabel} ${climateOption.getLabel(selectedSeason.label)}`
            : `${selectionLabel} ${climateOption.labelTemplate || climateOption.label}`; // e.g. Contiguous United States Annual Average Temperature

        const barChartHoverTemplate = getHoverTemplate(
          "histogram",
          climateOption,
          selectedSeason,
        );
        const lineChartHoverTemplate = getHoverTemplate(
          "scatter",
          climateOption,
          selectedSeason,
        );

        // use type from climateOption (e.g. temperature) to find start and end dates
        const startDate = parseInt(selection.startDates[climateOption.type]);
        const endDate = parseInt(selection.endDates[climateOption.type]);

        const barChartFiveYearHoverGroups = createFiveYearGroups(
          startDate,
          endDate,
        );

        const barChartData = getPlotData({
          name: climateOption.barChartLegend,
          type: "histogram",
          histfunc: "avg",
          xbins: {
            start: startDate,
            end: endDate,
            size: 5,
          },
          nbinsx: 0,
          xValues: chartDataFromFile[0],
          yValues: chartDataFromFile[1],
          bargroupgap: 5,
          marker: {
            line: {
              color: setChartColor(chartType),
              width: 1,
            },
            color: setChartColor(chartType),
          },
          hoverinfo: "x+y",
          hoverTemplate: barChartHoverTemplate,
          customdata: barChartFiveYearHoverGroups,
          legendgroup: 1,
          orientation: "v",
        });

        const lineChartData = getPlotData({
          name: climateOption.lineChartLegend,
          type: "scatter",
          xValues: chartDataFromFile[0],
          yValues: chartDataFromFile[1],
          marker: {
            color: "#000000",
          },
          line: {
            color: "#000000",
            width: 3,
            dash: "solid",
            shape: "linear",
            simplify: true,
          },
          hoverTemplate: lineChartHoverTemplate,
          connectgaps: true,
          hoverinfo: "x+y",
        });

        // find yRange for layout
        const yValues = chartDataFromFile[1].map((item) =>
          item === -999 ? undefined : item,
        );
        const validYValues = yValues.filter((val) => val !== undefined);
        const yMin = validYValues.length > 0 ? Math.min(...validYValues) : 0;
        const yMax = validYValues.length > 0 ? Math.max(...validYValues) : 0;

        const prettyRange = pretty([yMin, yMax]);
        const yRange = [prettyRange[0], prettyRange[prettyRange.length - 1]];
        const yValuesAverageAll = Math.max(
          0,
          validYValues.reduce((a, b) => a + b, 0) / validYValues.length,
        );

        setChartData([barChartData, lineChartData]);
        setChartLayout(
          getPlotlyLayout({
            chartTitle: chartTitle,
            xmin: startDate,
            xmax: endDate,
            yRange: yRange,
            yAxisText: climateOption.yAxisText,
            yValues: chartDataFromFile[1],
            yValsAvgAll: yValuesAverageAll,
            averageTextUnits: climateOption.avgTextUnits,
          }),
        );
      })
      // handle errors
      .catch((error) => {
        console.error(`SandboxControls.updatePlotData() error=${error}`);
      });
    return null;
  };

  // function loads the index.json file to find the correct data.txt file based on the varriables
  // the user chooses or from URL parameters
  const loadData = async () => {
    try {
      if (climateOption.type === "observed_projected") {
        handleObservedPredicted(megaMenuSelection, climateOption);
        return;
      }
      const response = await fetch(
        "./sandboxdata/2025_Sandbox_Datafiles/index.json",
      );
      const responseData = await response.json();

      // set climate data json data file
      setClimateDataFilesJSON(responseData);

      // only send chart data if at the intializing of the app aka the first time
      // this is here for when URL parameters are passed
      getChartData({
        selection: megaMenuSelection,
        climateDataFilesJSONFile: responseData,
        climateOption: climateOption,
      });
      return responseData;
    } catch (error) {
      // handle error
      console.error(`SandboxControls loadData error: ${error}`); // eslint-disable-line no-console
      return [""];
    }
  };

  // use the react effect to control when loading state from URL
  // this should only happen once during startup.
  useEffect(() => {
    // call loadData when at start changes, meaning only call this
    // when the site fist starts and intializes
    loadData();
  }, []);

  // removes <br> from title attribute (in SVG) so images are exported without error
  //  used on small screens to create line breaks in chart title
  //  the < and > is not allowed on svg to image so it needs to be removed
  //  to allow for export
  const removeBreaks = (node) => {
    const titleSelector = ".infolayer .g-gtitle .gtitle";
    const nodeTitle = node.querySelector(titleSelector);
    if (nodeTitle) {
      const nodeAttribute = nodeTitle.getAttribute("data-unformatted");
      const newNodeAttribute = nodeAttribute
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "");
      node
        .querySelector(titleSelector)
        .setAttribute("data-unformatted", newNodeAttribute);
      return node;
    }
    return node;
  };

  // hack to export svg, not using pure JS
  const convertToOneSvg = (svgSelector) => {
    // find and covnert html all plotly chart nodes
    // (plotly puts legends and the chart in seperate nodes)
    // to an JS array
    const svgs = Array.from(document.querySelectorAll(svgSelector));
    const mergedDiv = document.createElement("div");
    mergedDiv.setAttribute("id", "merged-div");

    // create a new svg element
    const mergedSVG = document.createElement("svg");

    // set default for height and width
    const SVGWidth = svgs[0].getAttribute("width");
    const SVGHeight = svgs[0].getAttribute("height");

    // set new svg element getAttributes to match the first plotly svg element
    // this will ensure width/height style and all the other settings match in the export
    mergedSVG.setAttribute("xmlns", svgs[0].getAttribute("xmlns"));
    mergedSVG.setAttribute("xmlns:xlink", svgs[0].getAttribute("xmlns:xlink"));
    mergedSVG.setAttribute("width", SVGWidth);
    mergedSVG.setAttribute("height", SVGHeight);
    mergedSVG.setAttribute("style", svgs[0].getAttribute("style"));

    // append the svg to the div - this is needed to export the svg tet properly
    mergedDiv.appendChild(mergedSVG);

    // iterate all the plotly nodes and merge them into the same svg node
    // this forces all the svg into one dom element to export correctly
    svgs.forEach((svgnode) => {
      const content = Array.from(svgnode.childNodes);
      content.forEach((svgele) => {
        // drag layer contains svg that is not needed and results
        // in svg data that will require manipulation of data.
        if (!svgele.classList.contains("draglayer")) {
          const node = svgele.cloneNode(true);
          const newNode = removeBreaks(node);
          mergedSVG.appendChild(newNode);
        }
      });
    });

    // create the base64 data text so the svg is written correctly
    const base64doc = btoa(unescape(encodeURIComponent(mergedSVG.outerHTML)));

    // remove the added dom element used to create the svg base64 data
    mergedDiv.remove();
    return base64doc;
  };

  // creates a download file name with current date and time and all the
  // chart settings from the ui
  const getDownloadName = () => {
    return "fix this";
  };

  // take blob data and add it to a href, initiate a click so the file downloads
  const downloadFile = (data, type = "svg") => {
    // create a new a element
    const a = document.createElement("a");

    // add click handler
    const e = new MouseEvent("click");

    // create download name based on curent settings
    a.download = `${getDownloadName()}.${type}`;

    if (type === "svg") {
      // add data to href so its "on the fly"
      const b64start = "data:image/svg+xml;base64,";
      a.href = `${b64start}${data}`;
    } else {
      a.href = data;
    }

    // force click
    a.dispatchEvent(e);

    // Remove a element
    a.remove();
    return null;
  };

  const checkSVGForSizeChange = (svgSelector, widthARG, heightARG) => {
    const svgElem = document.querySelector(svgSelector);
    if (svgElem) {
      const svgwidth = svgElem.getAttribute("width");
      const svgheight = svgElem.getAttribute("height");
      if (
        Number(svgwidth) === Number(widthARG) &&
        Number(svgheight) === Number(heightARG)
      )
        return false;
    }
    return true;
  };

  // create svg and although for custom size
  const exportSVG = (
    svgSelector = ".js-plotly-plot .main-svg",
    widthARG = 1000,
    heightARG = 500,
  ) => {
    const svgElem = document.querySelector(svgSelector);
    if (svgElem) {
      // do not change dimensions if not changed by user aka default setting
      const sizeChanged = checkSVGForSizeChange(
        svgSelector,
        widthARG,
        heightARG,
      );
      if (!sizeChanged) {
        const base64doc = convertToOneSvg(svgSelector);
        downloadFile(base64doc);
        return null;
      }
    }

    // get plotly div
    const plotHolderDiv =
      document.querySelector(".PlotRegionDiv").parentElement;
    const plotRegionDiv = document.querySelector(
      ".user-select-none.svg-container",
    );

    // get default for heights and widths
    const originalHolderWidth = plotHolderDiv.getAttribute("width");
    const originalHolderHeight = plotHolderDiv.getAttribute("height");
    const originalWidth = plotRegionDiv.getAttribute("width");
    const originalHeight = plotRegionDiv.getAttribute("height");

    // set width to fixed width
    if (widthARG > 0 && heightARG > 0) {
      // set divs to fixed width for standard or custom suze
      plotHolderDiv.style.width = `${widthARG}px`;
      plotRegionDiv.style.width = `${widthARG}px`;
      plotHolderDiv.style.height = `${heightARG}px`;
      plotRegionDiv.style.height = `${heightARG}px`;

      // force window resize so plotly re-renders the chart at fixed dimensions
      window.dispatchEvent(new Event("resize"));

      // delay creation of svg export while resize happens
      setTimeout(() => {
        // create download file
        const base64doc = convertToOneSvg(svgSelector);
        downloadFile(base64doc);

        // reset dimensions back to orignal dimensions
        plotHolderDiv.style.width = originalHolderWidth;
        plotRegionDiv.style.width = originalWidth;
        plotHolderDiv.style.height = originalHolderHeight;
        plotRegionDiv.style.height = originalHeight;

        // force window resize so plotly re-renders the chart at fixed dimensions
        window.dispatchEvent(new Event("resize"));
        return null;
      }, 500);
    }
    return null;
  };

  // convert svg base64 data to png
  const convertToPng = (
    svgSelector = ".js-plotly-plot .main-svg",
    widthARG = 1000,
    heightARG = 500,
  ) => {
    // get plotly div
    const plotHolderDiv =
      document.querySelector(".PlotRegionDiv").parentElement;
    const plotRegionDiv = document.querySelector(
      ".user-select-none.svg-container",
    );
    const sizeChanged = checkSVGForSizeChange(svgSelector, widthARG, heightARG);

    // get default for heights and widths
    const originalHolderWidth = plotHolderDiv.getAttribute("width");
    const originalHolderHeight = plotHolderDiv.getAttribute("height");
    const originalWidth = plotRegionDiv.getAttribute("width");
    const originalHeight = plotRegionDiv.getAttribute("height");

    // only do this of dimensions are different
    if (sizeChanged) {
      // set divs to fixed width for standard or custom suze
      plotHolderDiv.style.width = `${widthARG}px`;
      plotRegionDiv.style.width = `${widthARG}px`;
      plotHolderDiv.style.height = `${heightARG}px`;
      plotRegionDiv.style.height = `${heightARG}px`;

      // force window resize so plotly re-renders the chart at fixed dimensions
      window.dispatchEvent(new Event("resize"));
    }

    setTimeout(() => {
      // find and convert html all plotly chart nodes
      // (plotly puts legends and the chart in seperate nodes)
      // to an JS array
      const svgs = Array.from(document.querySelectorAll(svgSelector));
      const width = svgs[0].getAttribute("width");
      const height = svgs[0].getAttribute("height");

      const mergedDiv = document.createElement("div");
      mergedDiv.setAttribute("id", "merged-div");

      // create a new svg element
      const mergedSVG = document.createElement("svg");

      // set new svg element getAttributes to match the first plotly svg element
      // this will ensure width/height style and all the other settings match in the export
      mergedSVG.setAttribute("xmlns", svgs[0].getAttribute("xmlns"));
      mergedSVG.setAttribute(
        "xmlns:xlink",
        svgs[0].getAttribute("xmlns:xlink"),
      );
      mergedSVG.setAttribute("width", width);
      mergedSVG.setAttribute("height", height);
      mergedSVG.setAttribute("style", svgs[0].getAttribute("style"));
      // append the svg to the div - this is needed to export the svg tet properly
      mergedDiv.appendChild(mergedSVG);

      // iterate all the plotly nodes and merge them into the same svg node
      // this forces all the svg into one dom element to export correctly
      svgs.forEach((svgnode) => {
        const content = Array.from(svgnode.childNodes);
        content.forEach((svgele) => {
          const node = svgele.cloneNode(true);
          const newNode = removeBreaks(node);
          mergedSVG.appendChild(newNode);
        });
      });

      const blob = new Blob([mergedSVG.outerHTML], {
        type: "image/svg+xml;charset=utf-8",
      });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(blob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        const png = canvas.toDataURL();
        downloadFile(png, "png");

        if (sizeChanged) {
          // reset dimensions back to original dimensions
          plotHolderDiv.style.width = originalHolderWidth;
          plotRegionDiv.style.width = originalWidth;
          plotHolderDiv.style.height = originalHolderHeight;
          plotRegionDiv.style.height = originalHeight;
          // force window resize so plotly re-renders the chart at fixed dimensions
          window.dispatchEvent(new Event("resize"));
        }
      };
      image.src = blobURL;
    }, 500);
  };

  // handles downloads chart as SVG with fixed size
  const handleDownloadChartAsSVG = (svgSelector, width, height) => {
    exportSVG(svgSelector, width, height);
  };

  // handles downloads chart as PNG
  const handleDownloadChartAsPNG = (svgSelector, width, height) => {
    convertToPng(svgSelector, width, height);
  };

  // convert json data to csv
  const convertDataToCSV = (data) => {
    const items = data;
    const replacer = (key, value) => (value === null ? "" : value);
    const header = Object.keys(items[0]);
    let csv = items.map((row) =>
      header
        .map((fieldName) =>
          JSON.stringify(row[fieldName], replacer).replace(/\\"/g, '""'),
        )
        .join(","),
    );

    // push header to beginning of array
    csv.unshift(header.join(","));
    csv = csv.join("\r\n");
    return csv;
  };

  // This is what actually creates and saves the file.
  const saveFile = (content, filename, filetype) => {
    const blob = new Blob(content, { type: filetype });
    FileSaver.saveAs(blob, filename);
  };

  // converts chart data json from x,y to a pair key
  // chart data has years in one array and values in another
  // csv conversion makes it {year: value} so its easier to convert to csv
  const convertChartDataToJSON = () => {
    const years = chartData[0].x;
    const values = chartData[0].y;

    // merge arrays into the new object
    const JSONContent = years.map((value, index) => {
      const val = { year: value, value: values[index] };
      return val;
    });
    return JSONContent;
  };

  // handles plotting of observed and predicted data
  const handleObservedPredicted = (megaMenuSelection, climateOption) => {
    const hasPredictedData = checkForPredictedData(megaMenuSelection);
    if (!hasPredictedData) {
      setChartData();
      setChartLayout(layoutDefaults);
      setChartErrorMessage("No data available.");
      setOpenError(true);
      return;
    }

    fetchObservedAndProjectedData(megaMenuSelection.value).then((data) => {
      // Define all data series to plot
      const dataSeries = [
        {
          name: "Modeled Historical Lower",
          key: "historical_lower",
          line: {
            color: "rgba(169, 169, 169, 0)",
            width: 0,
            shape: "linear",
            simplify: true,
            dash: "solid",
          },
          hoverinfo: "skip",
          showlegend: false,
        },
        {
          name: "Modeled Historical Upper",
          key: "historical_upper",
          fill: "tonexty",
          fillcolor: "rgba(169, 169, 169, 0.5)",
          line: {
            color: "rgba(169, 169, 169, 0)",
            width: 0,
          },
          hoverinfo: "x+y",
          hovertemplate:
            "<b>%{x}</b><br>Modeled Historical: %{y}<extra></extra>",
          legendgroup: 1,
          showlegend: true,
        },
        {
          name: "SSP1-2.6 Lower",
          key: "ssp126_lower",
          line: {
            color: "rgba(173, 216, 230, 0)",
            width: 0,
          },
          hoverinfo: "skip",
          showlegend: false,
        },
        {
          name: "SSP1-2.6 Upper",
          key: "ssp126_upper",
          fill: "tonexty",
          fillcolor: "rgba(173, 216, 230, 0.6)",
          line: {
            color: "rgba(173, 216, 230, 0)",
            width: 0,
          },
          hoverinfo: "x+y",
          hovertemplate: "<b>%{x}</b><br>Lower Emissions: %{y}<extra></extra>",
          legendgroup: 2,
          showlegend: true,
        },
        {
          name: "SSP2-4.5 Lower",
          key: "ssp245_lower",
          line: {
            color: "rgba(105, 105, 105, 0)",
            width: 0,
          },
          hoverinfo: "skip",
          showlegend: false,
        },
        {
          name: "SSP2-4.5 Upper",
          key: "ssp245_upper",
          fill: "tonexty",
          fillcolor: "rgba(105, 105, 105, 0.6)",
          line: {
            color: "rgba(105, 105, 105, 0)",
            width: 0,
          },
          hoverinfo: "x+y",
          hovertemplate:
            "<b>%{x}</b><br>Intermediate Emissions: %{y}<extra></extra>",
          legendgroup: 3,
          showlegend: true,
        },
        {
          name: "SSP3-7.0 Lower",
          key: "ssp370_lower",
          line: {
            color: "rgba(219, 112, 147, 0)",
            width: 0,
          },
          hoverinfo: "skip",
          showlegend: false,
        },
        {
          name: "SSP3-7.0 Upper",
          key: "ssp370_upper",
          fill: "tonexty",
          fillcolor: "rgba(219, 112, 147, 0.7)",
          line: {
            color: "rgba(219, 112, 147, 0)",
            width: 0,
          },
          hoverinfo: "x+y",
          hovertemplate: "<b>%{x}</b><br>Higher Emissions: %{y}<extra></extra>",
          legendgroup: 4,
          showlegend: true,
        },
        {
          name: "Observed",
          key: "obs",
          width: 2,
          mode: "lines+markers",
          line: {
            color: "#000000",
            width: 2,
            dash: "solid",
            shape: "linear",
            simplify: true,
          },
          marker: {
            color: "#000000",
            size: 5,
          },
          connectgaps: false,
          hoverinfo: "x+y",
          hovertemplate: "<b>%{x}</b><br>Observed: %{y}<extra></extra>",
          legendgroup: 0,
          showlegend: true,
        },
      ];

      // Loop through all data series and create plot data for each
      const chartDataList = dataSeries.map((series) => {
        return {
          mode: series.mode ? series.mode : "line",
          name: series.name,
          type: "scatter",
          x: data.year,
          y: data[series.key].map((item) => (item === -999 ? null : item)),
          ...(series.fill && { fill: series.fill }),
          ...(series.fillcolor && { fillcolor: series.fillcolor }),
          line: series.line,
          ...(series.marker && { marker: series.marker }),
          ...(series.hoverTemplate && { hoverTemplate: series.hovertemplate }),
          ...(series.connectgaps && { connectgaps: series.connectgaps }),
          hoverinfo: series.hoverinfo,
          ...(series.legendgroup && { legendgroup: series.legendgroup }),
          showlegend: series.showlegend,
          hovertemplate: series.hovertemplate,
        };
      });

      // Set the chart data with all 9 series
      setChartData(chartDataList);

      // use lowest observed and highest ssp585_upper to get range of y axis
      const yValuesObserved = data.obs.map((item) =>
        item === -999 ? undefined : item,
      );
      const validYValuesObserved = yValuesObserved.filter(
        (val) => val !== undefined,
      );
      const yValuesUpper = data.ssp585_upper.map((item) =>
        item === -999 ? undefined : item,
      );
      const validYValuesUpper = yValuesUpper.filter((val) => val !== undefined);

      const yMin =
        validYValuesObserved.length > 0 ? Math.min(...validYValuesObserved) : 0;
      const yMax =
        validYValuesUpper.length > 0 ? Math.max(...validYValuesObserved) : 0;

      const prettyRange = pretty([yMin, yMax]);
      const yRange = [prettyRange[0], prettyRange[prettyRange.length - 1]];
      const yValuesAverageAll = Math.max(
        0,
        validYValuesObserved.reduce((a, b) => a + b, 0) /
          validYValuesObserved.length,
      );

      const yHigherTopValues = data.ssp370_upper.map((item) =>
        item === -999 ? undefined : item,
      );
      const yHigherBottomValues = data.ssp370_lower.map((item) =>
        item === -999 ? undefined : item,
      );
      const yIntermediateTopValues = data.ssp245_upper.map((item) =>
        item === -999 ? undefined : item,
      );
      const yIntermediateBottomValues = data.ssp245_lower.map((item) =>
        item === -999 ? undefined : item,
      );
      const yLowerTopValues = data.ssp126_upper.map((item) =>
        item === -999 ? undefined : item,
      );
      const yLowerBottomValues = data.ssp126_lower.map((item) =>
        item === -999 ? undefined : item,
      );

      // Find max of top and bottom for high, intermediate, and low
      // 1. Filters the array to remove undefined values
      // 2. Checks if the filtered array has any elements
      // 3. If yes, applies Math.max() or Math.min() to the filtered values
      // 4. If no, returns 0 as the default value

      const yHigherTop =
        yHigherTopValues.filter((v) => v !== undefined).length > 0
          ? Math.max(...yHigherTopValues.filter((v) => v !== undefined))
          : 0;
      const yHigherBottom =
        yHigherBottomValues.filter((v) => v !== undefined).length > 0
          ? Math.max(...yHigherBottomValues.filter((v) => v !== undefined))
          : 0;
      const yIntermediateTop =
        yIntermediateTopValues.filter((v) => v !== undefined).length > 0
          ? Math.max(...yIntermediateTopValues.filter((v) => v !== undefined))
          : 0;
      const yIntermediateBottom =
        yIntermediateBottomValues.filter((v) => v !== undefined).length > 0
          ? Math.max(
              ...yIntermediateBottomValues.filter((v) => v !== undefined),
            )
          : 0;
      const yLowerTop =
        yLowerTopValues.filter((v) => v !== undefined).length > 0
          ? Math.max(...yLowerTopValues.filter((v) => v !== undefined))
          : 0;
      const yLowerBottom =
        yLowerBottomValues.filter((v) => v !== undefined).length > 0
          ? Math.max(...yLowerBottomValues.filter((v) => v !== undefined))
          : 0;

      setChartLayout(
        getPredictedDataLayout({
          chartTitle: `${megaMenuSelection.value.replace(/_/g, " ")} - ${climateOption.title}`,
          stateName: megaMenuSelection.value,
          xmin: parseInt(data.year[0]),
          xmax: parseInt(data.year[data.year.length - 1]),
          xvals: data.year,
          yHigherTop: yHigherTop,
          yHigherBottom: yHigherBottom,
          yIntermediateTop: yIntermediateTop,
          yIntermediateBottom: yIntermediateBottom,
          yLowerTop: yLowerTop,
          yLowerBottom: yLowerBottom,
          yMin: yMin - 2,
          yMax: ((n) => n + (n % 2))(yHigherTop),
          yRange: yRange,
          yAxisText: climateOption.yAxisText,
          yValues: validYValuesObserved,
          yValsAvgAll: yValuesAverageAll,
        }),
      );
    });
  };

  // NEW HANDLERS JEFF
  const handleClimateOptionChange = (option) => {
    setOpenError(false); // reset
    setShowMapImage(false); // reset

    const newOption = option;
    setClimateOption(newOption);
    setClimateMenuOpen(false);

    // Update URL parameters
    updateURLParams(megaMenuSelection, newOption);

    // Check if this is a map option that should display an image
    const isMapOption = newOption.type === "mappy_map";

    if (isMapOption) {
      // Just show the map image, don't generate chart data
      setShowMapImage(true);
      return;
    }

    if (newOption.type === "observed_projected") {
      handleObservedPredicted(megaMenuSelection, newOption);
      return;
    }

    getChartData({
      selection: megaMenuSelection,
      climateDataFilesJSONFile: climateDataFilesJSON,
      climateOption: newOption,
    });
  };

  const handleMegaMenuSelect = (selection) => {
    setOpenError(false); // reset
    setMegaMenuSelection(selection);
    setMegaMenuOpen(false);

    // Update URL parameters
    updateURLParams(selection, climateOption);

    if (showMapImage === true) {
      return;
    }

    if (climateOption.type === "observed_projected") {
      handleObservedPredicted(selection, climateOption);
      return;
    }

    getChartData({
      selection,
      climateDataFilesJSONFile: climateDataFilesJSON,
      climateOption: climateOption,
    });
  };

  // END NEW HANDLERS

  return (
    <>
      <Box
        sx={{
          backgroundColor: "white",
          color: "#5C5C5C",
          height: "calc(100vh - 16px)",
          width: "100%",
          [theme.breakpoints.down("xs")]: {
            overflow: "scroll",
          },
        }}
      >
        <Grid container spacing={1} justify="flex-start" direction="row">
          <Grid
            size={{ xs: 12 }}
            width="100%"
            sx={{
              height: `50px`,
              maxHeight: `50px`,
              color: "#5C5C5C",
              [theme.breakpoints.down("xs")]: {
                height: `75px`,
                maxHeight: `75px`,
              },
            }}
          >
            <Box
              px={1}
              display="flex"
              alignItems="center"
              gap={1}
              fontSize="h5.fontSize"
            >
              <InsertChartOutlinedIcon
                sx={{
                  color: "#5C5C5C",
                  fontSize: "4.0rem",
                  backgroundColor: "#ffffff",
                  borderRadius: "30px",
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 400,
                  color: "#5C5C5C",
                }}
              >
                State Summaries Data Explorer
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              onClick={() => setMegaMenuOpen(true)}
              display="flex"
              ml={1}
              mr={1}
              mt={1}
              mb={1}
              sx={{
                height: "44px",
                border: "1px solid #0379C8",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                gap: "8px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <Typography
                sx={{
                  color: "#0379C8",
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {megaMenuSelection.label || "Region, State or Territory"}
              </Typography>
              <ExpandMoreIcon sx={{ color: "#0379C8" }} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              onClick={() => setClimateMenuOpen(true)}
              display="flex"
              ml={1}
              mr={1}
              mt={1}
              mb={1}
              sx={{
                height: "44px",
                border: "1px solid #0379C8",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                gap: "8px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <Typography
                sx={{
                  color: "#0379C8",
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {climateOption.seasonality && climateOption.getLabel
                  ? climateOption.getLabel(selectedSeason.label)
                  : climateOption.labelTemplate || climateOption.label}
              </Typography>
              <ExpandMoreIcon sx={{ color: "#0379C8" }} />
            </Box>
          </Grid>

          <Grid
            size={{ xs: 12, md: 2 }}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Box display="flex" flexDirection="row" ml={1} mr={1} mt={1} mb={1}>
              <SaveChart
                chartData={chartData}
                region={"FIX THIS"}
                climatevariable={"FIX THIS"}
                period={"1900-2024"}
                sx={{
                  height: "56px",
                  maxHeight: "56px",
                  paddingTop: "4px",
                  paddingRight: "8px",
                  paddingBottom: "4px",
                  paddingLeft: "8px",
                  borderRadius: "4px",
                  border: "1px solid #0379C8",
                  gap: "8px",
                  fontWeight: 500,
                  color: "#0379C8",
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: "calc(100% - 250px)",
            maxHeight: "calc(100% - 250x)",
            minHeight: `400px`,
            [theme.breakpoints.down("sm")]: {
              height: `575px !important`,
              maxHeight: `575px !important`,
            },
          }}
        >
          {openError && (
            <Box
              sx={{
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: "flex",
                justifyContent: "center",
                p: 1,
              }}
            >
              <SandboxAlert
                shouldOpenAlert={openError}
                errorType={"Error"}
                chartErrorTitle={"Error"}
                chartErrorMessage={chartErrorMessage}
              />
            </Box>
          )}

          <Box
            display="flex"
            flexDirection="row"
            m={1}
            justifyContent="center"
            flex={1}
            flexGrow={3}
            sx={{
              height: "calc(100% - 10px)",
              [theme.breakpoints.down("sm")]: {
                height: "575px",
              },
            }}
          >
            {showMapImage ? (
              <Box
                component="img"
                src="/tempData/gergMap.png"
                alt="Change in Annual Precipitation Map"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <SandboxPlotRegion
                plotlyData={chartData}
                plotlyLayout={chartLayout}
              />
            )}
          </Box>
        </Grid>
      </Box>
      <MegaMenu
        open={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        onSelect={handleMegaMenuSelect}
      />
      <ClimateVariableAndSeasonality
        open={climateMenuOpen}
        onClose={() => setClimateMenuOpen(false)}
        onSelect={handleClimateOptionChange}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        seasonOptions={seasonOptions}
      />
    </>
  );
}

SandboxControls.propTypes = {
  chartDataClimatevariable: PropTypes.string,
  climateDataFilesJSONFile: PropTypes.object,
};
