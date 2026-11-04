// The page shows whatever the URL describes, so a shared link, a reload and the
// browser's Back button all land on the same view.
import config from "../configs/config.js";

export const SEASON_OPTIONS = [
  { label: "Annual", value: "ann" },
  { label: "Spring", value: "mam" },
  { label: "Summer", value: "jja" },
  { label: "Fall", value: "son" },
  { label: "Winter", value: "djf" },
];

const MAP_CENTURIES = ["mid", "late"];

const CHART_OPTION_LISTS = [
  config.historicalSeasonalityOptions,
  config.temperatureOptions,
  config.precipitationOptions,
  config.observedProjectedOptions,
];

function findSelection(value) {
  const allSelections = [...config.regionsOptions, ...config.statesOptions];
  return allSelections.find((selection) => selection.value === value);
}

function findChartOption(value) {
  for (const optionList of CHART_OPTION_LISTS) {
    const option = optionList.find((candidate) => candidate.value === value);
    if (option) return option;
  }
  return undefined;
}

// All four seasonal precipitation maps share one option value, so a map is
// rebuilt from its scenario and century.
function findMapOption(scenario, century) {
  const mapOption = config.mapsSeasonalityOptions.find(
    (option) => option.scenario === scenario,
  );
  if (!mapOption || !MAP_CENTURIES.includes(century)) return undefined;
  return { ...mapOption, century };
}

function findSeason(value) {
  return SEASON_OPTIONS.find((season) => season.value === value);
}

const DEFAULT_SELECTION = findSelection("CONUS");
const DEFAULT_OPTION = findChartOption("tmean");
const DEFAULT_SEASON = SEASON_OPTIONS[0];

// Any missing or unknown value falls back to the default view: CONUS, average
// temperature, Annual.
export function readView(searchParams) {
  const selection = findSelection(searchParams.get("selection")) || DEFAULT_SELECTION;
  const season = findSeason(searchParams.get("season")) || DEFAULT_SEASON;

  if (searchParams.get("option") === "change_seasonal_precip") {
    const mapOption = findMapOption(
      searchParams.get("scenario"),
      searchParams.get("century"),
    );
    if (mapOption) {
      return { selection, option: mapOption, season, showMap: true };
    }
  }

  const option = findChartOption(searchParams.get("option")) || DEFAULT_OPTION;
  return { selection, option, season, showMap: false };
}

// The URL parameters that describe a view, in the order they appear in the URL.
export function viewToParams({ selection, option, season }) {
  const params = { selection: selection.value, option: option.value };
  if (option.type === "mappy_map") {
    params.century = option.century;
    params.scenario = option.scenario;
  }
  params.season = season.value;
  return params;
}
