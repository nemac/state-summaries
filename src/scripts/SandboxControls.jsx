import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
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
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import precipMapManifest from "../data/precipMapManifest.json";
import {
  lookupPrecipMap,
  selectionValueToRegionDisplayName,
} from "../utils/precipMaps.js";
import parseFile, {
  areAllValuesNoData,
  candidateDataFiles,
  fiveYearAverages,
} from "./utils.js";
import {
  getFiveYearBarData,
  getHoverTemplate,
  getPlotData,
  setChartColor,
} from "./getPlotData.js";
import { getPlotlyLayout } from "./getPlotlyLayout.js";
import { pretty } from "./axisTicks.js";
import {
  ANNUAL_SEASON,
  readView,
  SEASON_OPTIONS,
  viewToParams,
} from "./viewFromUrl.js";
import { fetchObservedAndProjectedData } from "./plotObservedAndPredicted.js";
import {
  transformObservedProjectedData,
  computeBracketData,
  computeYDomain,
} from "./transformObservedProjectedData.js";
import { colors } from "../theme";

const ERROR_TEXT = {
  "no-data": {
    title: "No data are currently available for this metric.",
    message: "Please make another selection.",
  },
  "load-failed": {
    title: "The data could not be loaded.",
    message: "Check your internet connection, then reload the page.",
  },
};

// Fetch sandbox data file and parse it
const fetchSandboxDataFile = async (dataFile, locationType, selectionLabel) => {
  // no-cache: revalidate against the server so a new delivery is never
  // masked by a browser's cached copy of the old file.
  const response = await fetch(
    `./sandboxdata/2025_Sandbox_Datafiles/${dataFile}`,
    { cache: "no-cache" },
  );
  if (!response.ok) {
    throw new Error(`${dataFile} returned ${response.status}`);
  }
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

const logSelectedFile = (file, files, locationType, selectionLabel) => {
  const skippedFiles = files.slice(0, files.indexOf(file)).map((f) => f.name);
  const fallbackNote =
    skippedFiles.length > 0
      ? ` (fell back: column all -999 in ${skippedFiles.join(", ")})`
      : "";
  console.debug(
    `[data] ${selectionLabel} (${locationType}): ${file.name}${fallbackNote}`,
  );
};

// Try each candidate file in order and return the first whose column holds
// real data, with that file; null when every candidate is all -999.
const fetchFirstFileWithData = async (files, locationType, selectionLabel) => {
  for (const file of files) {
    const chartDataFromFile = await fetchSandboxDataFile(
      file.name,
      locationType,
      selectionLabel,
    );
    if (!areAllValuesNoData(chartDataFromFile[1])) {
      logSelectedFile(file, files, locationType, selectionLabel);
      return { file, chartDataFromFile };
    }
  }
  console.debug(
    `[data] ${selectionLabel} (${locationType}): no file has data; tried ${files.map((f) => f.name).join(", ")}`,
  );
  return null;
};

export default function SandboxControls() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = useMemo(() => readView(searchParams), [searchParams]);
  const megaMenuSelection = view.selection;
  const climateOption = view.option;
  const selectedSeason = view.season;
  const showMapImage = view.showMap;

  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [climateMenuOpen, setClimateMenuOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState("");

  // Recharts state for observed/projected chart
  const [chartType, setChartType] = useState("plotly"); // 'plotly' | 'recharts'
  const [rechartsData, setRechartsData] = useState(null);
  const [rechartsBrackets, setRechartsBrackets] = useState(null);
  const [rechartsYDomain, setRechartsYDomain] = useState(null);

  // null, "no-data" or "load-failed". Any value hides the chart and shows an alert.
  const [errorKind, setErrorKind] = useState(null);
  const openError = errorKind !== null;

  // chart data from files in ../sandboxdata
  const [chartData, setChartData] = useState([]);
  // plotly chart layout defaults
  const layoutDefaults = {
    title: {
      text: "",
    },
    font: { size: 18 },
  };
  // plotly chart layout
  const [chartLayout, setChartLayout] = useState(layoutDefaults);
  // index.json lists the data files for every series; null until it loads.
  const [dataIndex, setDataIndex] = useState(null);
  const [dataIndexFailed, setDataIndexFailed] = useState(false);

  const mapEntry = useMemo(() => {
    if (!view.showMap) return null;
    return lookupPrecipMap(
      precipMapManifest,
      view.selection.value,
      view.option.century,
      view.option.scenario,
      view.season.value,
    );
  }, [view]);

  // Save Chart/Data only makes sense while a loaded chart is on screen.
  const isChartShowing = !showMapImage && !openError && chartData.length > 0;

  const showError = (kind) => {
    setChartData([]);
    setChartLayout(layoutDefaults);
    setChartType("plotly");
    setErrorKind(kind);
  };

  // check if the selection has predicted data available
  const checkForPredictedData = (selection) => {
    return config.hasPredictedData.includes(selection.label);
  };

  // Builds the Plotly chart for one view. isViewCurrent() turns false once the
  // view changes, so a late response for an old view changes nothing.
  const getChartData = (props) => {
    const { selection, climateOption, season, isViewCurrent } = props;

    // Resolve data source overrides (e.g. Hawaii region uses state data,
    // US Caribbean uses standalone data files)
    const override = selection.dataOverride;
    const selectionLabel = override?.label || selection.label;
    const locationType = override?.locationType || selection.type;
    const indexKey = override?.indexKey || selection.type;
    const data = dataIndex[indexKey];

    // Construct file type identifier, appending selected season if seasonality === true
    // e.g. value = prcp and if seasonId = ann this becomes prcp_ann
    const fileType = climateOption.seasonality
      ? climateOption.value + "_" + season.value
      : climateOption.value;
    const chartType = climateOption.chartType;

    // If no data index exists for this source, show error
    if (!data) {
      showError("no-data");
      return;
    }

    // use type from climateOption (e.g. temperature) to find start and end dates
    const startDate = parseInt(selection.startDates[climateOption.type]);
    const endDate = parseInt(selection.endDates[climateOption.type]);

    // Files for this series, long 1895/1900 file first. Some deliveries leave
    // a column all -999 in the long file while a shorter one has data, so the
    // fetch falls back through the rest before giving up.
    const candidateFiles = candidateDataFiles(
      data,
      fileType,
      locationType,
      startDate,
    );

    // If no matching file was found for this metric, show error
    if (candidateFiles.length === 0) {
      showError("no-data");
      return;
    }

    fetchFirstFileWithData(candidateFiles, locationType, selectionLabel)
      .then((result) => {
        if (!isViewCurrent()) return;
        if (result === null) {
          showError("no-data");
          return;
        }
        const { file, chartDataFromFile } = result;
        // A fallback file can start after the configured year, so the chart
        // starts where that file's data starts.
        const chartStartDate = Math.max(startDate, file.start);
        const newChartTitle =
          climateOption.seasonality && climateOption.getLabel
            ? `${selectionLabel}: ${climateOption.getLabel(season.label)}`
            : `${selectionLabel}: ${climateOption.label}`;
        setChartTitle(newChartTitle);

        // Threshold counts cover the whole year, whatever season is picked.
        const hoverSeason = climateOption.seasonality ? season : ANNUAL_SEASON;
        const barChartHoverTemplate = getHoverTemplate(
          "bar",
          climateOption,
          hoverSeason,
        );
        const lineChartHoverTemplate = getHoverTemplate(
          "scatter",
          climateOption,
          hoverSeason,
        );

        // find yRange for layout
        const yValues = chartDataFromFile[1].map((item) =>
          item === -999 ? undefined : item,
        );
        const validYValues = yValues.filter((val) => val !== undefined);
        const yMin = validYValues.length > 0 ? Math.min(...validYValues) : 0;
        const yMax = validYValues.length > 0 ? Math.max(...validYValues) : 0;

        const prettyRange = pretty([yMin, yMax]);
        const yRange = [prettyRange[0], prettyRange[prettyRange.length - 1]];
        const yValuesAverageAll =
          validYValues.reduce((a, b) => a + b, 0) / validYValues.length;

        const barChartData = getFiveYearBarData({
          blocks: fiveYearAverages(
            chartDataFromFile[0],
            chartDataFromFile[1],
            chartStartDate,
            endDate,
          ),
          axisBottom: yRange[0],
          name: climateOption.barChartLegend,
          color: setChartColor(chartType),
          hoverTemplate: barChartHoverTemplate,
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

        setChartType("plotly");
        setChartData([lineChartData, barChartData]);
        setChartLayout(
          getPlotlyLayout({
            chartTitle: newChartTitle,
            xmin: chartStartDate,
            xmax: endDate,
            yRange: yRange,
            yAxisText: climateOption.yAxisText,
            yValues: chartDataFromFile[1],
            yValsAvgAll: yValuesAverageAll,
            averageTextUnits: climateOption.avgTextUnits,
          }),
        );
      })
      .catch((error) => {
        if (!isViewCurrent()) return;
        console.error(`SandboxControls.getChartData() error=${error}`);
        showError("load-failed");
      });
  };

  // Load index.json once. It lists the data files for every series.
  useEffect(() => {
    let isMounted = true;
    fetch("./sandboxdata/2025_Sandbox_Datafiles/index.json", { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`index.json returned ${response.status}`);
        }
        return response.json();
      })
      .then((index) => {
        if (isMounted) setDataIndex(index);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error(`SandboxControls index.json error=${error}`);
        setDataIndexFailed(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load the chart for the current view. This is the only place charts load,
  // so each change loads once. A run's cleanup marks it out of date, so a slow
  // response for an older view can't replace the chart for a newer one.
  useEffect(() => {
    // Maps don't need index.json, so they show even when it failed to load.
    if (view.showMap) {
      setErrorKind(null);
      return undefined;
    }
    if (dataIndexFailed) {
      showError("load-failed");
      return undefined;
    }
    if (dataIndex === null) return undefined;

    let isLatestView = true;
    const isViewCurrent = () => isLatestView;
    setErrorKind(null);
    if (view.option.type === "observed_projected") {
      handleObservedPredicted(view.selection, view.option, isViewCurrent);
    } else {
      getChartData({
        selection: view.selection,
        climateOption: view.option,
        season: view.season,
        isViewCurrent,
      });
    }
    return () => {
      isLatestView = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, dataIndex, dataIndexFailed]);

  // handles plotting of observed and predicted data
  const handleObservedPredicted = (megaMenuSelection, climateOption, isViewCurrent) => {
    const hasPredictedData = checkForPredictedData(megaMenuSelection);
    if (!hasPredictedData) {
      showError("no-data");
      return;
    }

    fetchObservedAndProjectedData(megaMenuSelection).then((data) => {
      if (!isViewCurrent()) return;
      // Populate Recharts state
      const title = `${megaMenuSelection.label}: ${climateOption.title}`;
      setChartTitle(title);
      setRechartsData(transformObservedProjectedData(data));
      setRechartsBrackets(computeBracketData(data));
      setRechartsYDomain(computeYDomain(data));
      setChartType("recharts");
      // chartData for this chart feeds only the CSV export (the chart itself
      // renders from rechartsData): observations first, then scenario bands.
      // Column names must stay comma-free for the CSV header.
      const csvSeries = [
        { name: "Observations", key: "obs" },
        { name: "Modeled Historical Lower", key: "historical_lower" },
        { name: "Modeled Historical Upper", key: "historical_upper" },
        { name: "Low Emissions (SSP1-2.6) Lower", key: "ssp126_lower" },
        { name: "Low Emissions (SSP1-2.6) Upper", key: "ssp126_upper" },
        { name: "Intermediate Emissions (SSP2-4.5) Lower", key: "ssp245_lower" },
        { name: "Intermediate Emissions (SSP2-4.5) Upper", key: "ssp245_upper" },
        { name: "High Emissions (SSP3-7.0) Lower", key: "ssp370_lower" },
        { name: "High Emissions (SSP3-7.0) Upper", key: "ssp370_upper" },
        { name: "Very High Emissions (SSP5-8.5) Lower", key: "ssp585_lower" },
        { name: "Very High Emissions (SSP5-8.5) Upper", key: "ssp585_upper" },
      ];
      setChartData(
        csvSeries.map((series) => ({
          name: series.name,
          x: data.year,
          y: data[series.key].map((item) => (item === -999 ? null : item)),
        })),
      );
    }).catch((error) => {
      if (!isViewCurrent()) return;
      console.error(`SandboxControls.handleObservedPredicted() error=${error}`);
      showError("load-failed");
    });
  };

  // Menu picks only change the URL; the load effect above draws the new view.
  // Each pick adds a browser history entry, so Back returns to the view before.
  const goToView = (nextView) => {
    const currentParams = new URLSearchParams(viewToParams(view)).toString();
    const nextParams = new URLSearchParams(viewToParams(nextView)).toString();
    if (nextParams === currentParams) return;
    setSearchParams(nextParams);
  };

  const handleClimateOptionChange = (option) => {
    setClimateMenuOpen(false);
    goToView({ ...view, option });
  };

  const handleMegaMenuSelect = (selection) => {
    setMegaMenuOpen(false);
    goToView({ ...view, selection });
  };

  // The season dropdown sits inside the open menu, so trying seasons there
  // replaces the current history entry instead of adding Back steps.
  const handleSeasonChange = (season) => {
    setSearchParams(viewToParams({ ...view, season }), { replace: true });
  };

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
                  : climateOption.label}
              </Typography>
              <ExpandMoreIcon sx={{ color: colors.primary }} />
            </Box>
          </Grid>

          {isChartShowing && (
            <SaveChart
              selection={megaMenuSelection}
              climateOption={climateOption}
              chartTitle={chartTitle}
              chartData={chartData}
              chartType={chartType}
              period={"1900-2024"}
              renderExportChart={
                chartType === "recharts"
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
                chartErrorTitle={ERROR_TEXT[errorKind].title}
                chartErrorMessage={ERROR_TEXT[errorKind].message}
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
                    // The MUI Grid container has no definite height, so a % height
                    // here collapses. Anchor to the viewport so the map fills the
                    // space below the header/controls.
                    height: "calc(100vh - 180px)",
                    minHeight: 440,
                  }}
                >
                  {/* Two-line figure title (map authors' requested format),
                      named for the region the map covers, not the selection:
                      [Map Region] Projected Changes in Total [Season] Precipitation
                      [Time Period], [Scenario] */}
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, pt: 4, pb: 1, textAlign: "center" }}
                  >
                    {mapEntry ? (
                      <>
                        {`${selectionValueToRegionDisplayName(megaMenuSelection.value)} Projected Changes in Total ${selectedSeason.label} Precipitation`}
                        <Box component="span" sx={{ display: "block" }}>
                          {mapEntry.subtitle.split(", ").slice(1).join(", ")}
                        </Box>
                      </>
                    ) : (
                      `${megaMenuSelection.label}, ${climateOption.label}`
                    )}
                  </Typography>
                  {mapEntry ? (
                    <>
                      {/* Explicit height (not flex) so ZoomableImage's 100% height
                          resolves; the map is landscape/height-limited, so this
                          height drives how large it renders. */}
                      <Box
                        sx={{
                          width: "100%",
                          height: "calc(100vh - 404px)",
                          minHeight: 320,
                        }}
                      >
                        {/* The key starts each new map unzoomed. */}
                        <ZoomableImage
                          key={mapEntry.src}
                          src={mapEntry.src}
                          alt={mapEntry.subtitle}
                        />
                      </Box>
                      <Box
                        component="img"
                        src="/precip/PrecipLegend.png"
                        alt="Change in Total Precipitation (%) legend"
                        sx={{
                          height: 130,
                          maxWidth: "95%",
                          objectFit: "contain",
                          mt: "auto",
                          py: 1,
                        }}
                      />
                    </>
                  ) : (
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <Alert
                        severity="info"
                        variant="standard"
                        sx={{ borderRadius: 4, maxWidth: 520 }}
                      >
                        <AlertTitle sx={{ fontWeight: "bold" }}>
                          No map available
                        </AlertTitle>
                        No projection map is available for this selection. Try a
                        different state, century, scenario, or season.
                      </Alert>
                    </Box>
                  )}
                </Box>
              ) : chartType === "recharts" ? (
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
        setSelectedSeason={handleSeasonChange}
        seasonOptions={SEASON_OPTIONS}
      />
    </>
  );
}
