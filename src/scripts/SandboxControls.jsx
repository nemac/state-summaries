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
import SandboxGeneratePlotData from "./SandboxGeneratePlotData.jsx";
import SandboxHumanReadable from "./SandboxHumanReadable.jsx";
import SandboxAlert from "./SandboxAlert.jsx";

import config from "../configs/config.js";
import SandboxLocationRegionalItems from "../configs/SandboxLocationRegionalItems";
import SandboxLocationStateItems from "../configs/SandboxLocationStateItems";

import axios from "axios";

import SaveChart from "../components/SaveChart.jsx";
import MegaMenu from "../components/MegaMenu.jsx";
import ClimateVariableAndSeasonality from "../components/ClimateVariableAndSeasonality.jsx";
import parseFile from "./utils.js";

const LocationRegionalItems = SandboxLocationRegionalItems();
const LocationStateItems = SandboxLocationStateItems();

const fontColor = "#5C5C5C";

export default function SandboxControls() {
  const theme = useTheme();

  // check url parameters first for values
  const urlParams = new URLSearchParams(window.location.search);

  // check url parameters for the region if none make it blank
  const URLRegion = urlParams.get("region")
    ? urlParams.get("region")
    : "National";

  // check url parameters for a climatevariable if none make it blank
  const URLClimatevariable = urlParams.get("climatevariable")
    ? urlParams.get("climatevariable")
    : "tmpc";

  // check url parameters for a period variable if none make it blank
  const URLPeriod = urlParams.get("period")
    ? urlParams.get("period")
    : "1895-current";

  // check url parameters for season data it blank make yearly
  const URLSeason = urlParams.get("season") ? urlParams.get("season") : "ann";

  // set defaults for intial states of ui compnents
  let URLClimatevariableDisabled = true;
  let URLLocationDisabled = true;
  let URLPeriodDisabled = true;
  let URLSeasonDisabled = true;
  let URLLocationItems = [""];

  // the region determines some of the initial states, so if the URl contains a region
  // make sure we set those states, also there different location values for different regions
  switch (URLRegion) {
    case "National":
      // National data set the climatevariable pull down to NOT disabled by changing the state
      URLClimatevariableDisabled = false;
      URLPeriodDisabled = false;
      URLSeasonDisabled = false;
      break;
    case "Regional":
      // National data set the climatevariable pulldown to NOT disabled by changing the state
      URLLocationItems = LocationRegionalItems;
      URLLocationDisabled = false;
      URLClimatevariableDisabled = false;
      URLPeriodDisabled = false;
      URLSeasonDisabled = false;
      break;
    case "State":
      // National data set the climatevariable pulldown to NOT disabled by changing the state
      URLLocationItems = LocationStateItems;
      URLLocationDisabled = false;
      URLClimatevariableDisabled = false;
      URLPeriodDisabled = false;
      URLSeasonDisabled = false;
      break;
    default:
      // default state
      URLClimatevariableDisabled = true;
      URLLocationDisabled = true;
      URLPeriodDisabled = true;
      URLSeasonDisabled = true;
      break;
  }

  // NEW STATE VARIABLES JEFF
  const [megaMenuSelection, setMegaMenuSelection] = useState({
    label: "Contiguous United States",
    svg: "/svgs/contiguous_usa.svg",
    value: "contiguous",
    type: "CONUS",
  });
  const [regionSelection, setRegionSelection] = useState(
    "Contiguous United States",
  );
  const [climateOption, setClimateOption] = useState(
    "Annual Mean (Jan-Dec)_Average Temperature",
  );
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [climateMenuOpen, setClimateMenuOpen] = useState(false);
  const [showMapImage, setShowMapImage] = useState(false);

  // END NEW STATE VARIABLES

  // set React state via React Hooks
  // used to oepn or close the alert box
  const [openError, setOpenError] = useState(false);
  // chart error message
  const [chartErrorMessage, setChartErrorMessage] = useState("Chart Error");
  // chart error title
  const [chartErrorTitle, setChartErrorTitle] = useState("Error");
  // chart error type currently Error or Warning
  const [errorType, setErrorType] = useState("Error");
  // the climate varriable tmax100F etc
  const [climatevariable, setClimatevariable] = useState(URLClimatevariable);
  // the period current 1900 - current or 1950 - current
  const [period, setPeriod] = useState(URLPeriod);
  // the season yearly, or spring mam, summer jja, fal son, winter djf
  const [season, setSeason] = useState(URLSeason);

  // chart data from files in ../sandboxdata
  const [chartData, setChartData] = useState([{}]);
  // plotly chart layout defaults
  const layoutDefaults = {
    yaxis: { rangemode: "tozero", title: "Days", fixedrange: true },
    xaxis: { rangemode: "tozero", fixedrange: true },
  };
  // plotly chart layout
  const [chartLayout, setChartLayout] = useState(layoutDefaults);
  // chart data json file
  const [climateDataFilesJSON, setClimateDataFilesJSON] = useState([""]);

  // sets climate variable type for precip or temp, this will likely change latter...
  const getClimatevariableType = (switchClimatevariable) => {
    const chartType = {
      default: "Temperature",
      prcp_1inch: "Precipitation",
      prcp_2inch: "Precipitation",
      prcp_3inch: "Precipitation",
      prcp_4inch: "Precipitation",
      tmin: "Temperature",
      tmax: "Temperature",
      tmax_0F: "Temperature",
      tmax_32F: "Temperature",
      tmax_90F: "Temperature",
      tmax_95F: "Temperature",
      tmax_100F: "Temperature",
      tmin_0F: "Temperature",
      tmin_32F: "Temperature",
      tmin_70F: "Temperature",
      tmin_75F: "Temperature",
      tmin_80F: "Temperature",
      hdd: "HeatingDays",
      cdd: "CoolingDays",
      prcp_ann: "Precipitation",
      tmean_ann: "Temperature",
      tmin_ann: "Temperature",
      tmax_ann: "Temperature",
    };
    return chartType[switchClimatevariable] || chartType.default;
  };

  // replace the state abbreviations from the data text files with a more
  // human-readable full state name AK becomes Alaska
  const replaceLocationAbbreviation = (replaceAbbreviationLocation) => {
    const sandboxHumanReadable = new SandboxHumanReadable();
    return sandboxHumanReadable.getLocationDownText(
      replaceAbbreviationLocation,
    );
  };

  // function to set URL parameters based on state and user seletions
  const sandBoxURL = (props) => {
    // get values from argument keys
    const { chartDataRegion } = props;
    const { chartDataClimatevariable } = props;
    const { chartDataPeriod } = props;
    const { chartDataSeason } = props;
    // create new URL parameter object
    const searchParams = new URLSearchParams();

    // get the url parameters
    searchParams.set("region", chartDataRegion);
    searchParams.set("climatevariable", chartDataClimatevariable);
    searchParams.set("period", chartDataPeriod);
    searchParams.set("season", chartDataSeason);

    // convert url parameters to a string and add the leading ? so it we can add it
    // to browser history (back button works)
    const urlParameters = `?${searchParams.toString()}`;

    // adds url and url parameters to browser history
    window.history.replaceState({}, document.title, urlParameters);
    return urlParameters;
  };

  // get chart data from current state = which should include
  const getChartData = (props) => {
    const {
      selection,
      chartDataClimatevariable,
      chartDataPeriod,
      chartDataSeason,
      climateDataFilesJSONFile,
      climateOption,
    } = props;

    const selectionLabel = selection.label;

    // update url history this is the point at which we will need to make sure
    // the graph looks the same when shared via url
    sandBoxURL({
      selectionLabel,
      chartDataClimatevariable,
      chartDataPeriod,
      chartDataSeason,
    });

    const locationType = selection.type;
    const data = climateDataFilesJSONFile[locationType];

    // this is so awful lol
    const split = climateOption.split("_");
    const machineReadable = // e.g. Average_Temperature
      config.machineReadableClimateData[split[0]].metrics[split[1]];
    const fileType = config.metricToFileTypeMapping[machineReadable]; // e.g. tmean_ann
    const chartType = getClimatevariableType(fileType);

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

    axios
      .get(`./sandboxdata/2025_Sandbox_Datafiles/${dataFile}`)
      .then((response) => {
        // parse the csv text file
        const chartDataFromFile = parseFile(
          response.data,
          locationType,
          locationType === "states"
            ? config.stateAbbreviations[selectionLabel]
            : config.ncaRegionAbbreviations[selectionLabel],
        );

        const sandboxHumanReadable = new SandboxHumanReadable(fileType);

        // convert the all the parameters to human readable title
        const chartTitle = sandboxHumanReadable.getChartTitle({
          climatevariable: fileType,
          region: locationType,
          titleLocation: selectionLabel,
          chartDataSeason,
          selection,
        });

        // get climate variable human readable format
        const humandReadablechartDataClimatevariable =
          sandboxHumanReadable.getClimateVariablePullDownText(
            chartDataClimatevariable,
            chartDataSeason,
          );

        // get period range
        const humandReadablPeriodRange =
          sandboxHumanReadable.getPeriodRange(chartDataPeriod);

        // if no data mark as data missing so we can handle required fields and error messaging
        let dataMissing = false;
        if (!climateDataFilesJSONFile) dataMissing = true;
        if (!chartDataClimatevariable) dataMissing = true;
        if (!chartDataPeriod) dataMissing = true;
        if (!chartDataSeason) dataMissing = true;

        // create the plotly input so the chart is created based on users selection
        const plotInfo = {
          xvals: chartDataFromFile[0],
          yvals: chartDataFromFile[1],
          xmin: humandReadablPeriodRange[0],
          xmax: humandReadablPeriodRange[1],
          chartTitle,
          legnedText: chartType,
          chartType,
          climatevariable: humandReadablechartDataClimatevariable,
          dataMissing,
          season: chartDataSeason,
          // chartShowLine
        };

        // get the charts data formated for plotly
        const plotData = new SandboxGeneratePlotData(plotInfo);

        const xRange = {
          xmin: humandReadablPeriodRange[0],
          xmax: humandReadablPeriodRange[1],
        };

        // set the charts min and max based on the data in the data file
        plotData.setXRange(xRange);

        // change reacts state so it refreshes
        setChartData(plotData.getData());
        setChartLayout(plotData.getLayout());
        return plotData;
      })
      // handle errors
      .catch((error) => {
        console.error(`SanboxControls.updatePlotData() error=${error}`); // eslint-disable-line no-console
      });
    return null;
  };

  // function loads the index.json file to find the correct data.txt file based on the varriables
  // the user chooses or from URL parameters
  const loadData = async () => {
    await axios
      .get("./sandboxdata/2025_Sandbox_Datafiles/index.json")
      .then((response) => {
        // handle success
        let responseData = {};
        // Regions change the file and how the object is refrenced
        //  TODO might be better to fix this in the future
        responseData = response.data;

        // set climate data json data file
        setClimateDataFilesJSON(responseData);

        // only send chart data if at the intializing of the app aka the first time
        // this is here for when URL parameters are passed
        getChartData({
          selection: megaMenuSelection,
          chartDataClimatevariable: climatevariable,
          chartDataPeriod: period,
          chartDataSeason: season,
          climateDataFilesJSONFile: responseData,
          climateOption: "Annual Mean (Jan-Dec)_Average Temperature",
        });
        return responseData;
      })
      .catch((error) => {
        // handle error
        console.error(`SandboxControls loadData error: ${error}`); // eslint-disable-line no-console
        return [""];
      });
  };

  // use the react effect to control when loading state from URL
  // this should only happen once during startup.
  useEffect(() => {
    // call loadData when at start changes, meaning only call this
    // when the site fist starts and intializes
    loadData();
  }, []);

  // handle state change for region
  const handleSelectionChange = (selection) => {
    setRegionSelection(selection.label);

    getChartData({
      selection,
      chartDataRegion: selection.label,
      chartDataClimatevariable: climatevariable,
      chartDataPeriod: period,
      chartDataSeason: season,
      climateDataFilesJSONFile: climateDataFilesJSON,
      climateOption: climateOption,
      // chartShowLine: false
    });
  };

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
    // // get curent data time
    // const date = new Date().toISOString().slice(0, 10);

    // get human-readable versions of text
    const sandboxHumanReadable = new SandboxHumanReadable("");
    const chartTitle = sandboxHumanReadable.getChartTitle({
      climatevariable,
      regionSelection,
      titleLocation: replaceLocationAbbreviation(location),
      chartDataSeason: season,
    });

    // format file name
    return `${chartTitle}`;
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
          // force window reszize so plotly re-renders the chart at fixed dimensions
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

    // push header to begining of array
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

  // NEW HANDLERS JEFF
  const handleClimateOptionChange = (option) => {
    setClimateOption(option.label);
    setClimateMenuOpen(false);

    // Check if this is a map option that should display an image
    const isMapOption =
      option.value === "change_annual_precip" ||
      option.value === "change_seasonal_precip";

    if (isMapOption) {
      // Just show the map image, don't generate chart data
      setShowMapImage(true);
    } else {
      // Regular chart option - hide map and generate chart data
      setShowMapImage(false);
      getChartData({
        selection: megaMenuSelection,
        chartDataRegion: regionSelection,
        chartDataClimatevariable: climatevariable,
        chartDataPeriod: period,
        chartDataSeason: season,
        climateDataFilesJSONFile: climateDataFilesJSON,
        climateOption: climateOption,
      });
    }
  };

  const handleMegaMenuSelect = (selection) => {
    handleSelectionChange(selection);
    setMegaMenuOpen(false);
  };

  // END NEW HANDLERS

  return (
    <>
      <Box
        sx={{
          backgroundColor: "white",
          color: fontColor,
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
              color: fontColor,
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
                {regionSelection || "Region, State or Territory"}
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
                {climateOption || "Climate Variable and Seasonality"}
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
                region={regionSelection}
                climatevariable={climatevariable}
                period={period}
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
                errorType={errorType}
                chartErrorTitle={chartErrorTitle}
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
      />
    </>
  );
}

SandboxControls.propTypes = {
  chartDataRegion: PropTypes.string,
  chartDataClimatevariable: PropTypes.string,
  chartDataPeriod: PropTypes.string,
  chartDataSeason: PropTypes.string,
  climateDataFilesJSONFile: PropTypes.object,
};
