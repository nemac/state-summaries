// mui and react
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import FileSaver from "file-saver";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// sandbox conmponents
import SandboxPlotRegion from "./SandboxPlotRegion.jsx";
import SandboxGeneratePlotData from "./SandboxGeneratePlotData.jsx";
import SandboxHumanReadable from "./SandboxHumanReadable.jsx";
import SandboxSelector from "./SandboxSelector.jsx";
import SandboxAlert from "./SandboxAlert.jsx";
import SandboxActionMenu from "./SandboxActionMenu.jsx";
import SandboxParseDataFiles from "./SandboxParseDataFiles.jsx";

// configs
import config from "../configs/config.js";
import SandboxDataControl from "../configs/SandboxDataControl";
import SandboxRegionItems from "../configs/SandboxRegionItems";
import SandboxPeriods from "../configs/SandboxPeriods";
import SandboxSeasons from "../configs/SandboxSeasons";
import SandboxLocationRegionalItems from "../configs/SandboxLocationRegionalItems";
import SandboxLocationStateItems from "../configs/SandboxLocationStateItems";

import axios from "axios";

// css
import "../css/Sandbox.scss";
import GroupedDropDownSelector from "../components/GroupedDropDownSelector.jsx";
import SaveChart from "../components/SaveChart.jsx";

const RegionItems = SandboxRegionItems();
const PeriodsFull = SandboxPeriods();
const Seasons = SandboxSeasons();
const LocationRegionalItems = SandboxLocationRegionalItems();
const LocationStateItems = SandboxLocationStateItems();

const white = "#FFFFFF";
const darkGrey = "#E6E6E6";
const pullDownBackground = "#FBFCFE";
const fontColor = "#5C5C5C";

// heights for buttons
const exportButtons = 7;
const exportButtonHeight = 50;
const exportAreaHeight = 75;
const exportButtonsSmallScreenHeight = exportButtons * exportButtonHeight;
const exportButtonsMeduimlScreenHeight = exportAreaHeight;

// heights for header - title
const headerTitleHeight = 50;
const headerTitleSmallScreenHeight = 75;

// heights for header - description
const headerDescriptionHeight = 60;
const headerDescriptionSmallScreenHeight = 90;

// heights for selectors - pullldowns
const selectors = 5;
const selectorHeight = 90;
const selectorAreaSmallScreenHeight =
  selectors * selectorHeight + headerDescriptionSmallScreenHeight;
const selectorAreaMediumScreenHeight = 3.33 * selectorHeight;

// heights for entire header with buttons, pulldowns, and header
const actionAreaSmallScreenHeight =
  headerTitleSmallScreenHeight +
  selectorAreaSmallScreenHeight +
  exportButtonsSmallScreenHeight;
const actionAreaMediumScreenHeight =
  headerTitleSmallScreenHeight +
  selectorAreaMediumScreenHeight +
  exportButtonsMeduimlScreenHeight;
const chartRegionMinHeight = 400;
const sandboxChartRegionSmallScreenHeight = 575;

// const useStyles = makeStyles((theme) => ({
//   sandboxRoot: {
//     backgroundColor: white,
//     color: fontColor,
//     height: "calc(100vh - 16px)",
//     [theme.breakpoints.down("xs")]: {
//       overflow: "scroll",
//     },
//   },
//   sandboxDescription: {
//     border: "0px solid transparent",
//     height: `${headerDescriptionHeight}px`,
//     maxHeight: `${headerDescriptionHeight}px`,
//     color: fontColor,
//     marginBottom: theme.spacing(1.25),
//     zIndex: 900,
//     [theme.breakpoints.down("xs")]: {
//       height: `${headerDescriptionSmallScreenHeight}px`,
//       maxHeight: `${headerDescriptionSmallScreenHeight}px`,
//     },
//   },
//   sandboxSelectionArea: {
//     maxHeight: "375px",
//     backgroundColor: pullDownBackground,
//     border: `1px solid ${darkGrey}`,
//     borderRadius: "4px",
//     [theme.breakpoints.down("sm")]: {
//       height: `${actionAreaMediumScreenHeight}px`,
//       maxHeight: `${actionAreaMediumScreenHeight}px`,
//     },
//     [theme.breakpoints.down("xs")]: {
//       height: `${actionAreaSmallScreenHeight}px`,
//       minHeight: `${actionAreaSmallScreenHeight}px`,
//     },
//   },
//   sandboxSelectionAreaHolder: {
//     display: (chartOnly) =>
//       chartOnly.chartOnly === "yes" ? "none" : "inherit",
//     margin: "6px",
//     [theme.breakpoints.down("sm")]: {
//       height: `${actionAreaMediumScreenHeight}px`,
//       maxHeight: `${actionAreaMediumScreenHeight}px`,
//     },
//     [theme.breakpoints.down("xs")]: {
//       height: `${actionAreaSmallScreenHeight}px`,
//       maxHeight: `${actionAreaSmallScreenHeight}px`,
//     },
//   },
//   sandboxChartRegion: {
//     height: (chartOnly) =>
//       chartOnly.chartOnly === "yes" ? "100%" : "calc(100% - 250px)",
//     maxHeight: (chartOnly) =>
//       chartOnly.chartOnly === "yes" ? "100%" : "calc(100% - 250x)",
//     minHeight: `${chartRegionMinHeight}px`,
//     [theme.breakpoints.down("sm")]: {
//       height: `${sandboxChartRegionSmallScreenHeight}px !important`,
//       maxHeight: `${sandboxChartRegionSmallScreenHeight}px !important`,
//     },
//   },
//   sandboxChartRegionBox: {
//     height: "calc(100% - 10px)",
//     [theme.breakpoints.down("sm")]: {
//       height: "575px",
//     },
//   },
//
//   sandboxExports: {
//     height: `${exportAreaHeight}px`,
//     maxHeight: `${exportAreaHeight}px`,
//     paddingTop: "12px",
//     [theme.breakpoints.down("sm")]: {
//       height: `${exportAreaHeight * 2}px`,
//       maxHeight: `${exportAreaHeight * 2}px`,
//     },
//     [theme.breakpoints.down("xs")]: {
//       height: `${exportButtonsSmallScreenHeight}px`,
//       maxHeight: `${exportButtonsSmallScreenHeight}px`,
//     },
//   },
//   extendedIcon: {
//     marginRight: theme.spacing(1),
//   },
//   infoButton: {
//     color: "#5C5C5C",
//     fontSize: "1.5rem",
//     marginLeft: theme.spacing(0.1),
//     position: "absolute",
//     backgroundColor: "#ffffff",
//     borderRadius: "30px",
//     top: "-0.66rem",
//   },
//   toolTip: {
//     padding: theme.spacing(2),
//     fontSize: "1rem",
//   },
//   pulldownInfoHolder: {
//     "& .MuiPaper-elevation1.Mui-expanded": {
//       boxShadow:
//         "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
//       backgroundColor: darkGrey,
//     },
//     "& .MuiAccordionSummary-root.Mui-expanded": {
//       backgroundColor: white,
//     },
//     "& .MuiPaper-elevation1": {
//       boxShadow: "unset",
//     },
//   },
//   moreAboutData: {
//     backgroundColor: pullDownBackground,
//   },
// }));

export default function SandboxControls() {
  const theme = useTheme();

  // check url parameters first for values
  const urlParams = new URLSearchParams(window.location.search);

  // check url parameters for the region if none make it blank
  const URLRegion = urlParams.get("region")
    ? urlParams.get("region")
    : "National";

  // check url parameters for a location if none make it blank
  const URLLocation = urlParams.get("location")
    ? urlParams.get("location")
    : "";

  // check url parameters for a climatevariable if none make it blank
  const URLClimatevariable = urlParams.get("climatevariable")
    ? urlParams.get("climatevariable")
    : "tmpc";

  // check url parameters for a period variable if none make it blank
  const URLPeriod = urlParams.get("period")
    ? urlParams.get("period")
    : "1895-current";

  // check url parameters for a using average bar true (averages are bar) if blank
  const URLLineChart = urlParams.get("line") ? urlParams.get("line") : "year";

  // check url parameters for season data it blank make yearly
  const URLSeason = urlParams.get("season") ? urlParams.get("season") : "ann";

  // check url parameters for showing chart only
  const URLChartOnly = urlParams.get("chartonly")
    ? urlParams.get("chartonly")
    : "no";

  // set defaults for intial states of ui compnents
  let URLClimatevariableDisabled = true;
  let URLLocationDisabled = true;
  let URLPeriodDisabled = true;
  let URLSeasonDisabled = true;
  let URLLocationItems = [""];

  // the region determines some of the inital states, so if the URl contains a region
  // make sure we set those states, also there diferent location values for different regions
  switch (URLRegion) {
    case "National":
      // National data set the climatevariable pulldown to NOT disabled by changing the state
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
  const [regionSelection, setRegionSelection] = useState(
    "Contiguous United States",
  );
  const [climateOption, setClimateOption] = useState(
    "Annual Mean (Jan-Dec)_Average Temperature"
  );

  // END NEW STATE VARIABLES

  // set React state via React Hooks
  // used to detect the first call - for getting state from url
  const [atStart, setAtStart] = useState(true);
  // used to oepn or close the alert box
  const [openError, setOpenError] = useState(false);
  // chart error message
  const [chartErrorMessage, setChartErrorMessage] = useState("Chart Error");
  // chart error title
  const [chartErrorTitle, setChartErrorTitle] = useState("Error");
  // chart error type currently Error or Warning
  const [errorType, setErrorType] = useState("Error");
  // the region
  const [region, setRegion] = useState(URLRegion);
  // the location within region its National when region is National
  const [location, setLocation] = useState(URLLocation);
  // the climate varriable tmax100F etc
  const [climatevariable, setClimatevariable] = useState(URLClimatevariable);
  // the period current 1900 - current or 1950 - current
  const [period, setPeriod] = useState(URLPeriod);
  // the season yearly, or spring mam, summer jja, fal son, winter djf
  const [season, setSeason] = useState(URLSeason);
  // average bars or line
  // when false average is the bars when false average is line
  // when true yearly is the line when false yearly is bars
  const [lineChart, setLineChart] = useState(URLLineChart);

  // The chart only option is not something in the ui  but a URL prarmater
  // so the the same interactive chart can be imbeded in a website
  const [chartOnly, setChartOnly] = useState(URLChartOnly);

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
  // all the possible location items
  const [locationItems, setLocationItems] = useState(URLLocationItems);
  // all the possible climate variables
  const [climatevariableItems, setClimatevariableItems] = useState([""]);
  // if no region selected disables location pulldown - helps manage user error
  const [locationDisabled, setlocationDisabled] = useState(URLLocationDisabled);
  // if no region selected disables climate variable pulldown - helps manage user error
  const [climatevariableDisabled, setClimatevariableDisabled] = useState(
    URLClimatevariableDisabled
  );
  // if no region selected period pulldown - helps manage user error
  const [periodDisabled, setPeriodDisabled] = useState(URLPeriodDisabled);
  const [seasonDisabled, setSeasonDisabled] = useState(URLSeasonDisabled);

  // sets climate variable type for precip or temp, this will likely change latter...
  const getClimatevariableType = (switchClimatevariable) => {
    const chartType = {
      default: "Temperature", // eslint-disable-line quote-props
      pcpn: "Precipitation", // eslint-disable-line quote-props
      "1inch": "Precipitation",
      "2inch": "Precipitation",
      "3inch": "Precipitation",
      "4inch": "Precipitation",
      tmin: "Temperature", // eslint-disable-line quote-props
      tmax: "Temperature", // eslint-disable-line quote-props
      tmax0F: "Temperature", // eslint-disable-line quote-props
      tmax32F: "Temperature", // eslint-disable-line quote-props
      tmax90F: "Temperature", // eslint-disable-line quote-props
      tmax95F: "Temperature", // eslint-disable-line quote-props
      tmax100F: "Temperature", // eslint-disable-line quote-props
      tmin0F: "Temperature", // eslint-disable-line quote-props
      tmin32F: "Temperature", // eslint-disable-line quote-props
      tmin70F: "Temperature", // eslint-disable-line quote-props
      tmin75F: "Temperature", // eslint-disable-line quote-props
      tmin80F: "Temperature", // eslint-disable-line quote-props
      hdd: "HeatingDays", // eslint-disable-line quote-props
      cdd: "CoolingDays", // eslint-disable-line quote-props
    };
    return chartType[switchClimatevariable] || chartType.default;
  };

  // replace the state abbrevaiations from the data text files with a more
  // human readable full state name AK becomes Alaska
  const replaceLocationAbbreviation = (replaceAbbreviationLocation) => {
    const sandboxHumanReadable = new SandboxHumanReadable();
    return sandboxHumanReadable.getLocationDownText(
      replaceAbbreviationLocation
    );
  };

  // function to set URL parameters based on state and user seletions
  const sandBoxURL = (props) => {
    // get values from argument keys
    const { chartDataRegion } = props;
    const { chartDataLocation } = props;
    const { chartDataClimatevariable } = props;
    const { chartDataPeriod } = props;
    const { chartDataSeason } = props;
    const { chartLineChart } = props;
    const { chartOnlyProp } = props;
    // const { chartShowLine } = props
    // create new URL parameter object
    const searchParams = new URLSearchParams();

    // get the url parameters
    searchParams.set("region", chartDataRegion);
    searchParams.set("location", chartDataLocation);
    searchParams.set("climatevariable", chartDataClimatevariable);
    searchParams.set("period", chartDataPeriod);
    searchParams.set("season", chartDataSeason);
    searchParams.set("line", chartLineChart);
    searchParams.set("chartonly", chartOnlyProp);
    // searchParams.set('chartShowLine', chartShowLine);

    // convert url parameters to a string and add the leading ? so it we can add it
    // to browser history (back button works)
    const urlParameters = `?${searchParams.toString()}`;

    // adds url and url parameters to browser history
    window.history.replaceState({}, document.title, urlParameters);
    return urlParameters;
  };

  // get chart data from current state = which should include
  const getChartData = (props) => {
    // get argument keys
    const { chartDataRegion } = props;
    const { chartDataLocation } = props;
    const { chartDataClimatevariable } = props;
    const { chartDataPeriod } = props;
    const { chartDataSeason } = props;
    const { climateDataFilesJSONFile } = props;
    const { chartLineChart } = props;
    const { chartOnlyProp } = props;
    // const chartShowLine = false;

    // update url history this is the point at which we will need to make sure
    // the graph looks the same when shared via url
    sandBoxURL({
      chartDataRegion,
      chartDataLocation,
      chartDataClimatevariable,
      chartDataPeriod,
      chartDataSeason,
      chartLineChart,
      chartOnlyProp,
      // chartShowLine,
    });

    // limit the possible data file to period
    // (years aka 1900 - current 1950 - current) and the climate variable (should be one)
    const data = climateDataFilesJSONFile.filter((json) => {
      const returnValue =
        json.period === chartDataPeriod &&
        json.type === chartDataClimatevariable &&
        json.season === chartDataSeason;
      return returnValue;
    });

    // get the data file name
    const dataFile = data.map((json) => json.name);

    // define the data file location should always be the current url and public folder
    const path = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

    // do not proceed of pulldowns not set not set
    if (
      !chartDataRegion ||
      (chartDataRegion !== "National" && !chartDataLocation) ||
      !chartDataClimatevariable ||
      !chartDataPeriod ||
      !chartDataSeason
    )
      return null;

    axios
      .get(`${path}sandboxdata/TSU_Sandbox_Datafiles/${dataFile}`)
      .then((response) => {
        // parse the csv text file
        const sandboxParseDataFiles = new SandboxParseDataFiles();
        const chartDataFromFile = sandboxParseDataFiles.parseFile(
          response.data,
          chartDataRegion.toLowerCase(),
          chartDataLocation
        );

        // get the chart type which is the climate variable
        const chartType = getClimatevariableType(chartDataClimatevariable);

        // create a new instance of the sandbox human readable class this transforms
        // the short text to something
        // humans can read tmax100F beceomes Days with Maximum Temperature Above 100°F and
        // AK becomes Alaska
        const sandboxHumanReadable = new SandboxHumanReadable(
          chartDataClimatevariable
        );

        // get the location from the ui
        const titleLocation = replaceLocationAbbreviation(chartDataLocation);

        // convert the all the parameters to human readable title
        const chartTitle = sandboxHumanReadable.getChartTitle({
          climatevariable: chartDataClimatevariable,
          region: chartDataRegion,
          titleLocation,
          chartDataSeason,
        });

        // get climate varriable human readable format
        const humandReadablechartDataClimatevariable =
          sandboxHumanReadable.getClimateVariablePullDownText(
            chartDataClimatevariable,
            chartDataSeason
          );

        // get period range
        const humandReadablPeriodRange =
          sandboxHumanReadable.getPeriodRange(chartDataPeriod);

        // if no data mark as data missing so we can handle required fields and error messaging
        let dataMissing = false;
        if (!climateDataFilesJSONFile) dataMissing = true;
        if (!chartDataRegion) dataMissing = true;
        if (chartDataRegion !== "National" && !chartDataLocation)
          dataMissing = true;
        if (!chartDataClimatevariable) dataMissing = true;
        if (!chartDataPeriod) dataMissing = true;
        if (!chartDataSeason) dataMissing = true;

        // create the plotly input so the chart is created based on users seletion
        const plotInfo = {
          xvals: chartDataFromFile[0],
          yvals: chartDataFromFile[1],
          xmin: humandReadablPeriodRange[0],
          xmax: humandReadablPeriodRange[1],
          chartTitle,
          legnedText: chartType,
          chartType,
          climatevariable: humandReadablechartDataClimatevariable,
          chartLineChart,
          dataMissing,
          season: chartDataSeason,
          // chartShowLine
        };

        // get the charts data formated for plotly
        const plotData = new SandboxGeneratePlotData(plotInfo);

        // if data is missing then zero out chart
        if (dataMissing) {
          plotData.zeroOutChartData();
        }

        // get configuration for defaults and invalid varriables/periods
        const locationLimit =
          chartDataRegion === "National" ? "National" : chartDataLocation;
        const configLimitData = { locationLimit };
        const sandboxDataControl = new SandboxDataControl();

        // get default period for the location
        const defaultPeriod =
          sandboxDataControl.getDefaultPeriod(configLimitData);
        // get invalid climate variables for the location
        const inValidClimateVariables =
          sandboxDataControl.getInValidClimateVariables(configLimitData);
        // get invalid periods for the location
        const inValidPeriods =
          sandboxDataControl.getInValidPeriods(configLimitData);

        // TODO will fill this in later
        if (defaultPeriod) {
          // do nothing for now
        }

        if (inValidClimateVariables) {
          // do nothing for now
        }

        if (inValidPeriods) {
          // do nothing for now
        }

        // check if region or location has data if not display
        // no data available for location and clear the chart
        // if data missing for combo field level errors will handle messaging
        if (!plotData.hasData() && !dataMissing) {
          setOpenError(true);
          setErrorType("Error");
          setChartErrorTitle("Error data not available");
          setChartErrorMessage(`Unfortunately, there is no data available for ${humandReadablechartDataClimatevariable}
            for ${titleLocation}. To resolve this issue, try one or all of these three actions.
            1) Change the location.
            2) Change the climate variable.
            3) Change the time period`);
        } else if (plotData.isAllZeros() && !dataMissing) {
          setOpenError(true);
          setErrorType("Warning");
          setChartErrorTitle("Warning data is all zeros");
          setChartErrorMessage(
            `Warning the chart data for ${chartTitle} contains all zeros (0).`
          );
        } else {
          setOpenError(false);
        }

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
  const loadData = async (loadRegion, argPeriod, argSeason) => {
    await axios
      .get("./sandboxdata/TSU_Sandbox_Datafiles/index.json")
      .then((response) => {
        // handle success
        let responseData = {};
        let data = {};
        // Regions change the file and how the object is refrenced
        //  TODO might be better to fix this in the future
        switch (loadRegion) {
          case "National":
            responseData = response.data.national;
            break;
          case "Regional":
            responseData = response.data.regional;
            break;
          case "State":
            responseData = response.data.state;
            break;
          default:
            responseData = response.data.national;
            break;
        }

        // set climate data json data file
        setClimateDataFilesJSON(responseData);
        // filter data for period and season
        data = responseData.filter((type) => {
          const returnValue =
            type.period === argPeriod && type.season === argSeason;
          return returnValue;
        });

        // return climate variables available for all data
        //  this would limit by both period and season since they
        //  have different climate varriables
        const types = data.map((json) => json.type);

        // set climate variable items
        setClimatevariableItems(types);

        // only send chart data if at the intializing of the app aka the first time
        // this is here for when URL parameters are passed
        if (atStart) {
          getChartData({
            chartDataRegion: region,
            chartDataLocation: location,
            chartDataClimatevariable: climatevariable,
            chartDataPeriod: period,
            chartDataSeason: season,
            climateDataFilesJSONFile: responseData,
            chartLineChart: lineChart,
            chartOnlyProp: chartOnly,
            // chartShowLine: false
          });
        }
        return responseData;
      })
      .catch((error) => {
        // handle error
        console.error(`SanboxControls loadData error: ${error}`); // eslint-disable-line no-console
        return [""];
      });
  };

  // use the react effect to control when season changes
  useEffect(() => {
    // call loadData when season changes
    loadData(region, period, season, atStart);
  }, [season]);

  // use the react effect to control when location and
  // regions change to repopulate the climate variable pulldown
  useEffect(() => {
    // call loadData when region changes
    loadData(region, period, season, atStart);
  }, [region]);

  // use the react effect to control when loading state from URL
  // this should only happen once during startup.
  useEffect(() => {
    // call loadData when at start changes, meaning only call this
    // when the site fist starts and intializes
    loadData(region, period, season, atStart);

    // make sure the start state is no false and this will never run again
    // the loadData function will only update chartdata the first timei t runs
    setAtStart(false);
  }, [atStart]);

  // handle state change for region
  const handleRegionChange = (newValue) => {
    setRegion(newValue);
    setRegionSelection(newValue);

    switch (newValue) {
      case "National":
        // National data set the location items to none since there are none
        setLocationItems([""]);
        setLocation("");

        // National data set the location pulldown to disabled since there are no locations
        setlocationDisabled(true);

        // National data set the climatevariable pulldown to NOT disabled by changing the state
        setClimatevariableDisabled(false);

        // National data set the period pulldown to NOT disabled by changing the state
        setPeriodDisabled(false);

        // National data set the season pulldown to NOT disabled by changing the state
        setSeasonDisabled(false);
        break;
      case "Regional":
        // Regional data set the location items to the regional items
        setLocationItems(LocationRegionalItems);
        setLocation("");

        // Regional data set the location pulldown to disabled
        // since there are no locations by changing the state
        setlocationDisabled(false);

        // Regional data set the climatevariable pulldown to NOT disabled by changing the state
        setClimatevariableDisabled(false);

        // Regional data set the period pulldown to NOT disabled by changing the state
        setPeriodDisabled(false);

        // National data set the season pulldown to NOT disabled by changing the state
        setSeasonDisabled(false);
        break;
      case "State":
        // Regional data set the location items to the state items
        setLocationItems(LocationStateItems);
        setLocation("");

        // Regional data set the location pulldown to disabled
        // since there are no locations by changing the state
        setlocationDisabled(false);

        // Regional data set the climatevariable pulldown to NOT disabled by changing the state
        setClimatevariableDisabled(false);

        // Regional data set the period pulldown to NOT disabled by changing the state
        setPeriodDisabled(false);

        // National data set the season pulldown to NOT disabled by changing the state
        setSeasonDisabled(false);
        break;
      default:
        setLocationItems([""]);
        setLocation("");
        setlocationDisabled(true);
        setClimatevariableDisabled(true);
        setPeriodDisabled(true);
        setSeasonDisabled(true);
        break;
    }
    setChartOnly("no");
    getChartData({
      chartDataRegion: newValue,
      chartDataLocation: "", // make sure location is blank
      chartDataClimatevariable: climatevariable,
      chartDataPeriod: period,
      chartDataSeason: season,
      climateDataFilesJSONFile: climateDataFilesJSON,
      chartLineChart: lineChart,
      chartOnlyProp: "no",
      // chartShowLine: false
    });
  };

  // handles switching of yearly and average in chart
  // avg as bars and yearly as line - default
  // yearly as bars and avg as line
  const handleSwtichAverageAndYearly = () => {
    setLineChart("avg");
    setChartOnly("no");
    getChartData({
      chartDataRegion: region,
      chartDataLocation: location,
      chartDataClimatevariable: climatevariable,
      chartDataPeriod: period,
      chartDataSeason: season,
      climateDataFilesJSONFile: climateDataFilesJSON,
      chartLineChart: "avg",
      chartOnlyProp: "no",
      // chartShowLine: false
    });
    return null;
  };

  // handles switching of yearly and average in chart
  // avg as bars and yearly as line - default
  // yearly as bars and avg as line
  const handleSwtichMovingAverageAndYearly = () => {
    setLineChart("mavg");
    setChartOnly("no");
    getChartData({
      chartDataRegion: region,
      chartDataLocation: location,
      chartDataClimatevariable: climatevariable,
      chartDataPeriod: period,
      chartDataSeason: season,
      climateDataFilesJSONFile: climateDataFilesJSON,
      chartLineChart: "mavg",
      chartOnlyProp: "no",
      // chartShowLine: false
    });
    return null;
  };

  // handles switching of yearly and average in chart
  // avg as bars and yearly as line - default
  // yearly as bars and avg as line
  const handleSwtichYearlyToLine = () => {
    // do something
    setLineChart("year");
    setChartOnly("no");
    getChartData({
      chartDataRegion: region,
      chartDataLocation: location,
      chartDataClimatevariable: climatevariable,
      chartDataPeriod: period,
      chartDataSeason: season,
      climateDataFilesJSONFile: climateDataFilesJSON,
      chartLineChart: "year",
      chartOnlyProp: "no",
      // chartShowLine: false
    });
    return null;
  };

  // repalce the climate variable with human readable climate variable
  // tmax100F beceomes Days with Maximum Temperature Above 100°F
  const replaceClimatevariableType = (replaceClimatevariable, seasonHR) => {
    const sandboxHumanReadable = new SandboxHumanReadable();
    return sandboxHumanReadable.getClimateVariablePullDownText(
      replaceClimatevariable,
      seasonHR
    );
  };

  // removes <br> from title atttribute (in SVG) so images are exported without error
  //  used on small screens to create line breaks in chart tittle
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

  // hack to export svg, not using using pure JS
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

    // get human readable versons of text
    const sandboxHumanReadable = new SandboxHumanReadable("");
    const chartTitle = sandboxHumanReadable.getChartTitle({
      climatevariable,
      region,
      titleLocation: replaceLocationAbbreviation(location),
      chartDataSeason: season,
    });

    // format file name
    return `${chartTitle}`;
  };

  // take blob data and add it to a href, intiate a click so the file downloads
  const donwloadFile = (data, type = "svg") => {
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
    heightARG = 500
  ) => {
    const svgElem = document.querySelector(svgSelector);
    if (svgElem) {
      // do not change dimensions if not changed by user aka default setting
      const sizeChanged = checkSVGForSizeChange(
        svgSelector,
        widthARG,
        heightARG
      );
      if (!sizeChanged) {
        const base64doc = convertToOneSvg(svgSelector);
        donwloadFile(base64doc);
        return null;
      }
    }

    // get ploltly div
    const plotHolderDiv =
      document.querySelector(".PlotRegionDiv").parentElement;
    const plotRegionDiv = document.querySelector(
      ".user-select-none.svg-container"
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

      // force window reszize so plotly re-renders the chart at fixed dimensions
      window.dispatchEvent(new Event("resize"));

      // delay creation of svg export while resize happens
      setTimeout(() => {
        // create download file
        const base64doc = convertToOneSvg(svgSelector);
        donwloadFile(base64doc);

        // reset dimensions back to orginal dimensions
        plotHolderDiv.style.width = originalHolderWidth;
        plotRegionDiv.style.width = originalWidth;
        plotHolderDiv.style.height = originalHolderHeight;
        plotRegionDiv.style.height = originalHeight;

        // force window reszize so plotly re-renders the chart at fixed dimensions
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
    heightARG = 500
  ) => {
    // get ploltly div
    const plotHolderDiv =
      document.querySelector(".PlotRegionDiv").parentElement;
    const plotRegionDiv = document.querySelector(
      ".user-select-none.svg-container"
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

      // force window reszize so plotly re-renders the chart at fixed dimensions
      window.dispatchEvent(new Event("resize"));
    }

    setTimeout(() => {
      // find and covnert html all plotly chart nodes
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
        svgs[0].getAttribute("xmlns:xlink")
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
        donwloadFile(png, "png");

        if (sizeChanged) {
          // reset dimensions back to orginal dimensions
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

  // handles mail to TSU
  const handleMailToTSU = () => {
    const sandboxHumanReadable = new SandboxHumanReadable();
    const TSUEMail = document.createElement("a");

    // convert the all the parameters to human readable title
    const chartTitle = sandboxHumanReadable.getChartTitle({
      climatevariable,
      region,
      titleLocation: location,
      chartDataSeason: season,
    });

    // email subject
    const emailSubject = "Here is my chart for the NCA";

    // email subject with link to chart
    const emailBody = `I created a chart to show the ${chartTitle}, using the NCA Sandbox. Here is a link to the chart: \n ${encodeURIComponent(window.location.href)}`;
    TSUEMail.href = `mailto:mail@example.org?subject=${emailSubject}&body=${emailBody}`;

    // force click
    const e = new MouseEvent("click");
    TSUEMail.dispatchEvent(e);

    // Remove a element
    TSUEMail.remove();
    return null;
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
          JSON.stringify(row[fieldName], replacer).replace(/\\"/g, '""')
        )
        .join(",")
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

  // handles downloads chart as CSV
  const handleDownloadChartAsCSV = () => {
    const fileContent = [convertDataToCSV(convertChartDataToJSON())];
    const fileName = `${region}-${location}-${climatevariable}-${period}.csv`;
    const fileType = "text/csv;charset=utf-8";
    saveFile(fileContent, fileName, fileType);
  };

  // NEW HANDLERS JEFF
  const handleClimateOptionChange = (event) => {
    setClimateOption(event.target.value);
  };

  // END NEW HANDLERS

  return (
    <div>
      <Grid
        container
        spacing={0}
        justify="flex-start"
        direction="row"
        sx={{
          backgroundColor: white,
          color: fontColor,
          height: "calc(100vh - 16px)",
          [theme.breakpoints.down("xs")]: {
            overflow: "scroll",
          },
        }}
      >
        <Grid
          size={{ xs: 12 }}
          width="100%"
          sx={{
            display: (chartOnly) =>
              chartOnly.chartOnly === "yes" ? "none" : "inherit",
            margin: "6px",
            [theme.breakpoints.down("sm")]: {
              height: `${actionAreaMediumScreenHeight}px`,
              maxHeight: `${actionAreaMediumScreenHeight}px`,
            },
            [theme.breakpoints.down("xs")]: {
              height: `${actionAreaSmallScreenHeight}px`,
              maxHeight: `${actionAreaSmallScreenHeight}px`,
            },
          }}
        >
          <Grid
            container
            spacing={0}
            justify="flex-start"
            direction="row"
            sx={{
              maxHeight: "375px",
              backgroundColor: pullDownBackground,
              border: `1px solid ${darkGrey}`,
              borderRadius: "4px",
              [theme.breakpoints.down("sm")]: {
                height: `${actionAreaMediumScreenHeight}px`,
                maxHeight: `${actionAreaMediumScreenHeight}px`,
              },
              [theme.breakpoints.down("xs")]: {
                height: `${actionAreaSmallScreenHeight}px`,
                minHeight: `${actionAreaSmallScreenHeight}px`,
              },
            }}
          >
            <Grid
              size={{ xs: 12 }}
              width="100%"
              sx={{
                height: `${headerTitleHeight}px`,
                maxHeight: `${headerTitleHeight}px`,
                color: fontColor,
                [theme.breakpoints.down("xs")]: {
                  height: `${headerTitleSmallScreenHeight}px`,
                  maxHeight: `${headerTitleSmallScreenHeight}px`,
                },
              }}
            >
              <Box
                fontWeight="fontWeightBold"
                mt={1}
                p={0}
                display="flex"
                flexWrap="nowrap"
                justifyContent="flex-start"
              >
                <Box
                  onClick={handleDownloadChartAsSVG}
                  px={1}
                  fontSize="h4.fontSize"
                >
                  <Tooltip
                    title={
                      "Create a figure for the NCA using the buttons to how you want to filter the data. Generated graphics can be exported or submitted to the TSU. Data source: X."
                    }
                    aria-label={
                      "Create a figure for the NCA using the buttons to how you want to filter the data. Generated graphics can be exported or submitted to the TSU. Data source: X"
                    }
                    placement="bottom-end"
                    TransitionComponent={Fade}
                    enterNextDelay={750}
                    arrow
                    sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
                  >
                    <InsertChartOutlinedIcon
                      fontSize="large"
                      sx={{
                        color: "#5C5C5C",
                        fontSize: "1.5rem",
                        marginLeft: theme.spacing(0.1),
                        backgroundColor: "#ffffff",
                        borderRadius: "30px",
                      }}
                    />
                  </Tooltip>
                </Box>
                <Box px={1} fontSize="h5.fontSize">
                  NCA Figure and Climate Data Generator
                </Box>
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12 }}
              width="100%"
              sx={{
                border: "0px solid transparent",
                height: `${headerDescriptionHeight}px`,
                maxHeight: `${headerDescriptionHeight}px`,
                color: fontColor,
                marginBottom: theme.spacing(1.25),
                zIndex: 900,
                [theme.breakpoints.down("xs")]: {
                  height: `${headerDescriptionSmallScreenHeight}px`,
                  maxHeight: `${headerDescriptionSmallScreenHeight}px`,
                },
              }}
            >
              <Box
                p={0}
                display="flex"
                flexWrap="nowrap"
                justifyContent="flex-start"
              >
                <Box
                  px={1}
                  fontWeight={400}
                  fontSize="caption"
                  sx={{
                    "& .MuiPaper-elevation1.Mui-expanded": {
                      boxShadow:
                        "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                      backgroundColor: darkGrey,
                    },
                    "& .MuiAccordionSummary-root.Mui-expanded": {
                      backgroundColor: white,
                    },
                    "& .MuiPaper-elevation1": {
                      boxShadow: "unset",
                    },
                  }}
                >
                  <Accordion
                    square
                    sx={{ backgroundColor: pullDownBackground }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="data-description-header"
                      id="data-description-header"
                    >
                      <Typography>
                        Access climate data to create a proposed figure
                        supporting your NCA chapter.&nbsp;
                        <a href="#">
                          Learn more about what data is being used...
                        </a>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        The Annual-Threshold graphs are derived from the Global
                        Historical Climatology Network-Daily (GHCN) of the
                        National Centers for Environmental Information. A select
                        set of stations with minimal missing data are used for
                        the calculations. The Annual and Seasonal Temperature
                        and Precipitation graphs are derived from the new NOAA
                        Monthly U.S. Climate Divisional Database (NClimDiv) of
                        the National Centers for Environmental Information.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 3, md: 5 }}
              sx={{ height: "75px", maxHeight: "75px" }}
            >
              <Box
                fontWeight="fontWeightBold"
                ml={1}
                mt={1}
                mb={1}
                mr={1}
                display="flex"
                flexDirection="row"
                flexWrap="nowrap"
                justifyContent="flex-start"
              >
                <SandboxSelector
                  items={config.dropdownOptionsList}
                  controlName={"Select a State, Territory, or NCA Region"}
                  onChange={handleRegionChange}
                  value={regionSelection}
                  disabled={false}
                  season={season}
                  missing={!region}
                  replaceClimatevariableType={replaceClimatevariableType}
                  TooltipText={
                    "Select a region: State, Territory, or NCA region"
                  }
                />
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 3, md: 5 }}
              sx={{ height: "75px", maxHeight: "75px" }}
            >
              <Box
                fontWeight="fontWeightBold"
                ml={1}
                mt={1}
                mb={1}
                mr={1}
                display="flex"
                flexDirection="row"
                flexWrap="nowrap"
                justifyContent="flex-start"
              >
                <GroupedDropDownSelector
                  options={config.climateDataHierarchy}
                  label="Select Climate Variability and Seasonality"
                  onChange={handleClimateOptionChange}
                  value={climateOption}
                />
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                height: `${exportAreaHeight}px`,
                maxHeight: `${exportAreaHeight}px`,
                paddingTop: "12px",
                paddingRight: "36px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                [theme.breakpoints.down("sm")]: {
                  height: `${exportAreaHeight * 2}px`,
                  maxHeight: `${exportAreaHeight * 2}px`,
                },
                [theme.breakpoints.down("xs")]: {
                  height: `${exportButtonsSmallScreenHeight}px`,
                  maxHeight: `${exportButtonsSmallScreenHeight}px`,
                },
              }}
            >
              {/*<SandboxActionMenu*/}
              {/*  handleDownloadChartAsCSVa={handleDownloadChartAsCSV}*/}
              {/*  handleDownloadChartAsPNGa={handleDownloadChartAsPNG}*/}
              {/*  handleDownloadChartAsSVGa={handleDownloadChartAsSVG}*/}
              {/*  handleSwtichAverageAndYearlya={handleSwtichAverageAndYearly}*/}
              {/*  handleSwtichMovingAverageAndYearlya={*/}
              {/*    handleSwtichMovingAverageAndYearly*/}
              {/*  }*/}
              {/*  handleSwtichYearlyToLinea={handleSwtichYearlyToLine}*/}
              {/*  handleMailToTSUa={handleMailToTSU}*/}
              {/*  lineChart={lineChart}*/}
              {/*/>*/}
              <SaveChart
                chartData={chartData}
                region={region}
                location={location}
                climatevariable={climatevariable}
                period={period}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: (chartOnly) =>
              chartOnly.chartOnly === "yes" ? "100%" : "calc(100% - 250px)",
            maxHeight: (chartOnly) =>
              chartOnly.chartOnly === "yes" ? "100%" : "calc(100% - 250x)",
            minHeight: `${chartRegionMinHeight}px`,
            [theme.breakpoints.down("sm")]: {
              height: `${sandboxChartRegionSmallScreenHeight}px !important`,
              maxHeight: `${sandboxChartRegionSmallScreenHeight}px !important`,
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
            <SandboxPlotRegion
              plotlyData={chartData}
              plotlyLayout={chartLayout}
            />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

SandboxControls.propTypes = {
  chartDataRegion: PropTypes.string,
  chartDataLocation: PropTypes.string,
  chartDataClimatevariable: PropTypes.string,
  chartDataPeriod: PropTypes.string,
  chartDataSeason: PropTypes.string,
  climateDataFilesJSONFile: PropTypes.object,
  chartLineChart: PropTypes.string,
  chartOnlyProp: PropTypes.string,
};
