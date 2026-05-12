import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";

import SandboxPlotRegion from "./SandboxPlotRegion.jsx";
import SandboxAlert from "./SandboxAlert.jsx";

import config from "../configs/config.js";

import SaveChart from "../components/SaveChart.jsx";
import MegaMenu from "../components/MegaMenu.jsx";
import ClimateVariableAndSeasonality from "../components/ClimateVariableAndSeasonality.jsx";
import ObservedProjectedChart from "../components/ObservedProjectedChart.jsx";
import ZoomableImage from "../components/ZoomableImage.jsx";
import parseFile, { areAllValuesNoData } from "./utils.js";
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
import {
  transformObservedProjectedData,
  computeBracketData,
  computeYDomain,
} from "./transformObservedProjectedData.js";
import { colors } from "../theme";

// Fetch sandbox data file and parse it
const fetchSandboxDataFile = async (dataFile, locationType, selectionLabel) => {
  const response = await fetch(
    `./sandboxdata/2025_Sandbox_Datafiles/${dataFile}`,
  );
  const data = await response.text();

  // parse the csv text file
  return parseFile(
    data,
    locationType,
    locationType === "states"
      ? config.stateAbbreviations[selectionLabel]
      : config.ncaRegionAbbreviations[selectionLabel],
  );
};

export default function SandboxControls() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const seasonOptions = [
    { label: "Annual", value: "ann" },
    { label: "Spring", value: "mam" },
    { label: "Summer", value: "jja" },
    { label: "Fall", value: "son" },
    { label: "Winter", value: "djf" },
  ];

  const getMegaMenuSelectionFromSearchParams = (selectionParam) => {
    let foundSelection = config.regionsOptions.find(
      (region) => region.value === selectionParam,
    );
    if (!foundSelection && config.statesOptions) {
      foundSelection = config.statesOptions.find(
        (state) => state.value === selectionParam,
      );
    }
    return foundSelection;
  };

  const getClimateChangeOptionFromSearchParams = (optionParam) => {
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
    return foundOption;
  };

  // Initialize state from URL parameters or defaults
  const getInitialSelection = () => {
    const selectionParam = searchParams.get("selection");
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
    const optionParam = searchParams.get("option");
    if (optionParam) {
      const foundOption = getClimateChangeOptionFromSearchParams(optionParam);
      if (foundOption) return foundOption;
    }
    return config.historicalSeasonalityOptions.find(
      (option) => option.value === "tmean",
    );
  };

  const getInitialSeason = () => {
    const seasonParam = searchParams.get("season");
    if (seasonParam) {
      const foundSeason = seasonOptions.find(
        (season) => season.value === seasonParam,
      );
      if (foundSeason) return foundSeason;
    }
    return { label: "Annual", value: "ann" };
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
  const [selectedSeason, setSelectedSeason] = useState(() =>
    getInitialSeason(),
  );
  const [chartTitle, setChartTitle] = useState("");

  // Recharts state for observed/projected chart
  const [chartType, setChartType] = useState("plotly"); // 'plotly' | 'recharts'
  const [useRechartsRenderer, setUseRechartsRenderer] = useState(true);
  const [rechartsData, setRechartsData] = useState(null);
  const [rechartsBrackets, setRechartsBrackets] = useState(null);
  const [rechartsYDomain, setRechartsYDomain] = useState(null);

  // END NEW STATE VARIABLES

  // set React state via React Hooks
  // used to open or close the alert box
  const [openError, setOpenError] = useState(false);

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

  // check if the selection has predicted data available
  const checkForPredictedData = (selection) => {
    return config.hasPredictedData.includes(selection.label);
  };

  // get chart data from current state = which should include
  const getChartData = (props) => {
    setChartType("plotly");
    const { selection, climateDataFilesJSONFile, climateOption } = props;

    // Resolve data source overrides (e.g. Hawaii region uses state data,
    // US Caribbean uses standalone data files)
    const override = selection.dataOverride;
    const selectionLabel = override?.label || selection.label;
    const locationType = override?.locationType || selection.type;
    const indexKey = override?.indexKey || selection.type;
    const data = climateDataFilesJSONFile[indexKey];

    // Construct file type identifier, appending selected season if seasonality === true
    // e.g. value = prcp and if seasonId = ann this becomes prcp_ann
    const fileType = climateOption.seasonality
      ? climateOption.value + "_" + selectedSeason.value
      : climateOption.value;
    const chartType = climateOption.chartType;

    // If no data index exists for this source, show error
    if (!data) {
      setChartData([]);
      setChartLayout(layoutDefaults);
      setOpenError(true);
      return null;
    }

    // Find the best matching file from the available data files
    // Filter files by location type and file type, then find the best date range match
    const matchingFiles = data.filter((file) => file.type === fileType);

    // Prefer files with date ranges 1895-2024 or 1900-2024 over 1950-2024
    const preferredFile =
      matchingFiles.find(
        (file) => file.period === "1895-2024" || file.period === "1900-2024",
      ) || matchingFiles[0]; // fallback to first match if no preferred range found

    // If no matching file was found for this metric, show error
    if (!preferredFile) {
      setChartData([]);
      setChartLayout(layoutDefaults);
      setOpenError(true);
      return null;
    }

    const dataFile = preferredFile.name;

    fetchSandboxDataFile(dataFile, locationType, selectionLabel)
      .then((chartDataFromFile) => {
        if (areAllValuesNoData(chartDataFromFile[1]) === true) {
          setChartData([]);
          setChartLayout(layoutDefaults);
          setOpenError(true);
          return;
        }
        const newChartTitle =
          climateOption.seasonality && climateOption.getLabel
            ? `${selectionLabel}: ${climateOption.getLabel(selectedSeason.label)}`
            : `${selectionLabel}: ${climateOption.labelTemplate || climateOption.label}`;
        setChartTitle(newChartTitle);

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
            color: colors.textPrimary,
          },
          line: {
            color: colors.textPrimary,
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

        setChartData([lineChartData, barChartData]);
        setChartLayout(
          getPlotlyLayout({
            chartTitle: newChartTitle,
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

  // function loads the index.json file to find the correct data.txt file based on the variables
  // the user chooses or from URL parameters
  const loadData = async () => {
    try {
      const response = await fetch(
        "./sandboxdata/2025_Sandbox_Datafiles/index.json",
      );
      const responseData = await response.json();
      setClimateDataFilesJSON(responseData);

      if (climateOption.type === "observed_projected") {
        handleObservedPredicted(megaMenuSelection, climateOption);
        return;
      }

      getChartData({
        selection: megaMenuSelection,
        climateDataFilesJSONFile: responseData,
        climateOption: climateOption,
      });
      return responseData;
    } catch (error) {
      // handle error
      console.error(`SandboxControls loadData error: ${error}`);
      return [""];
    }
  };

  // call loadData during startup
  useEffect(() => {
    loadData();
  }, []);

  // Sync state with URL parameter changes (for browser back/forward navigation)
  useEffect(() => {
    const selectionParam = searchParams.get("selection");
    const optionParam = searchParams.get("option");
    const seasonParam = searchParams.get("season");

    // Update selection if URL changed
    if (selectionParam && selectionParam !== megaMenuSelection.value) {
      const foundSelection =
        getMegaMenuSelectionFromSearchParams(selectionParam);
      if (foundSelection) {
        setMegaMenuSelection(foundSelection);
      }
    }

    // Update option if URL changed
    if (optionParam && optionParam !== climateOption.value) {
      const foundOption = getClimateChangeOptionFromSearchParams(optionParam);
      if (foundOption) {
        setClimateOption(foundOption);
      }
    }

    // Update season if URL changed
    if (seasonParam && seasonParam !== selectedSeason.value) {
      const foundSeason = seasonOptions.find((s) => s.value === seasonParam);
      if (foundSeason) {
        setSelectedSeason(foundSeason);
      }
    }
  }, [searchParams]);

  // Reload chart data when selection or option changes (including from browser navigation)
  useEffect(() => {
    if (climateDataFilesJSON.length === 0 || climateDataFilesJSON[0] === "") {
      return; // Wait for initial data load
    }
    setOpenError(false); // reset

    if (showMapImage === true) {
      return;
    }

    if (climateOption.type === "observed_projected") {
      handleObservedPredicted(megaMenuSelection, climateOption);
      return;
    }
    getChartData({
      selection: megaMenuSelection,
      climateDataFilesJSONFile: climateDataFilesJSON,
      climateOption: climateOption,
    });
  }, [megaMenuSelection, climateOption, selectedSeason]);

  // handles plotting of observed and predicted data
  const handleObservedPredicted = (megaMenuSelection, climateOption) => {
    const hasPredictedData = checkForPredictedData(megaMenuSelection);
    if (!hasPredictedData) {
      setChartData([]);
      setChartLayout(layoutDefaults);
      setChartType("plotly");
      setOpenError(true);
      return;
    }

    fetchObservedAndProjectedData(megaMenuSelection.value).then((data) => {
      // Populate Recharts state
      const title = `${megaMenuSelection.value.replace(/_/g, " ")}: ${climateOption.title}`;
      setChartTitle(title);
      setRechartsData(transformObservedProjectedData(data));
      setRechartsBrackets(computeBracketData(data));
      setRechartsYDomain(computeYDomain(data));
      setChartType("recharts");
      // Grab all data series from config to plot
      const dataSeries = config.plotlyPredictedPlots;

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

      // use lowest observed and highest ssp585_upper to get range of y-axis
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

      const yHigherTopValues = data.ssp585_upper.map((item) =>
        item === -999 ? undefined : item,
      );
      const yHigherBottomValues = data.ssp585_lower.map((item) =>
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
      const yLowerTop370Values = data.ssp370_upper.map((item) =>
        item === -999 ? undefined : item,
      );
      const yLowerBottom370Values = data.ssp370_lower.map((item) =>
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

      const y370Top =
        yLowerTop370Values.filter((v) => v !== undefined).length > 0
          ? Math.max(...yLowerTop370Values.filter((v) => v !== undefined))
          : 0;
      const y370Bottom =
        yLowerBottom370Values.filter((v) => v !== undefined).length > 0
          ? Math.max(...yLowerBottom370Values.filter((v) => v !== undefined))
          : 0;

      setChartLayout(
        getPredictedDataLayout({
          chartTitle: `${megaMenuSelection.value.replace(/_/g, " ")}: ${climateOption.title}`,
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
          y370Bottom: y370Bottom,
          y370Top: y370Top,
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
    setSearchParams({
      selection: megaMenuSelection.value,
      option: newOption.value,
      season: selectedSeason.value,
    });

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
    setMegaMenuOpen(false);

    setMegaMenuSelection(selection);

    // Update URL parameters
    setSearchParams({
      selection: selection.value,
      option: climateOption.value,
      season: selectedSeason.value,
    });

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
          backgroundColor: colors.white,
          color: colors.textSecondary,
          height: "calc(100vh - 16px)",
          // width: "100%",
          margin: "16px",
          [theme.breakpoints.down("xs")]: {
            overflow: "scroll",
          },
        }}
      >
        <Grid
          container
          spacing={2}
          justify="flex-start"
          direction="row"
          margin="0 16px"
        >
          <Grid
            size={{ xs: 12 }}
            width="100%"
            sx={{
              color: colors.textSecondary,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                fontSize="h5.fontSize"
              >
                <InsertChartOutlinedIcon
                  sx={{
                    color: colors.textPrimary,
                    fontSize: "2.5rem",
                    backgroundColor: colors.white,
                    borderRadius: "30px",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 400,
                    color: colors.textPrimary,
                  }}
                >
                  State Climate Summaries Data Explorer
                </Typography>
              </Box>
              <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate("/about")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate("/about");
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  color: colors.primary,
                  padding: "6px 12px",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: colors.backgroundSelected,
                    textDecoration: "underline",
                  },
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: "1.3rem" }} />
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: colors.primary,
                  }}
                >
                  About
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setMegaMenuOpen(true);
              }}
              onClick={() => setMegaMenuOpen(true)}
              display="flex"
              sx={{
                height: "30px",
                border: `1px solid ${colors.primary}`,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                gap: "8px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: colors.backgroundButtonHover,
                },
              }}
            >
              <Typography
                sx={{
                  color: colors.primary,
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {megaMenuSelection.label || "Region, State or Territory"}
              </Typography>
              <ExpandMoreIcon sx={{ color: colors.primary }} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setClimateMenuOpen(true);
              }}
              onClick={() => setClimateMenuOpen(true)}
              display="flex"
              sx={{
                height: "30px",
                border: `1px solid ${colors.primary}`,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                gap: "8px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: colors.backgroundButtonHover,
                },
              }}
            >
              <Typography
                sx={{
                  color: colors.primary,
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {climateOption.seasonality && climateOption.getLabel
                  ? climateOption.getLabel(selectedSeason.label)
                  : climateOption.labelTemplate || climateOption.label}
              </Typography>
              <ExpandMoreIcon sx={{ color: colors.primary }} />
            </Box>
          </Grid>

          <SaveChart
            selection={megaMenuSelection}
            climateOption={climateOption}
            chartTitle={chartTitle}
            chartData={chartData}
            chartType={
              chartType === "recharts" && useRechartsRenderer
                ? "recharts"
                : "plotly"
            }
            period={"1900-2024"}
            renderExportChart={
              chartType === "recharts" && useRechartsRenderer
                ? (w, h) => (
                    <Box sx={{ width: `${w}px`, height: `${h}px` }}>
                      <ObservedProjectedChart
                        data={rechartsData}
                        bracketData={rechartsBrackets}
                        yDomain={rechartsYDomain}
                        chartTitle={chartTitle}
                      />
                    </Box>
                  )
                : undefined
            }
            sx={{
              borderRadius: "4px",
              border: `1px solid ${colors.primary}`,
              fontWeight: 500,
              color: colors.primary,
              height: "48px",
            }}
          />

          {chartType === "recharts" && (
            <Box display="flex" alignItems="center" gap={0.5} ml={2}>
              <Typography sx={{ fontSize: "14px", color: colors.textSecondary }}>
                Plotly
              </Typography>
              <Switch
                checked={useRechartsRenderer}
                onChange={(e) => setUseRechartsRenderer(e.target.checked)}
                size="small"
              />
              <Typography sx={{ fontSize: "14px", color: colors.textSecondary }}>
                Recharts
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: "calc(100% - 250px)",
            maxHeight: "calc(100% - 250px)",
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
                chartErrorTitle={
                  "No data are currently available for this metric."
                }
                chartErrorMessage={"Please make another selection."}
              />
            </Box>
          )}

          {!openError && (
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
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 600, py: 4 }}>
                    Title Placeholder
                  </Typography>
                  <Box sx={{ flex: 1, width: "85%", minHeight: 0 }}>
                    <ZoomableImage
                      src="/tempData/gergMap.png"
                      alt="Change in Annual Precipitation Map"
                    />
                  </Box>
                  <Typography variant="h4" sx={{ color: colors.textMuted, py: 4 }}>
                    Legend Placeholder
                  </Typography>
                </Box>
              ) : chartType === "recharts" && useRechartsRenderer ? (
                <ObservedProjectedChart
                  data={rechartsData}
                  bracketData={rechartsBrackets}
                  yDomain={rechartsYDomain}
                  chartTitle={chartTitle}
                />
              ) : (
                <SandboxPlotRegion
                  plotlyData={chartData}
                  plotlyLayout={chartLayout}
                />
              )}
            </Box>
          )}
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
