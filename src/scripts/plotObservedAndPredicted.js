export const fetchObservedAndProjectedData = async (megaMenuSelectionValue) => {
  const response = await fetch(
    `/sandboxdata/2025_Sandbox_Datafiles/observed_and_projected/${megaMenuSelectionValue}_FIG1_SCS2025.csv`,
  );
  const csvText = await response.text();

  // Parse CSV
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");

  // Initialize data object with arrays for each column
  const data = {};
  headers.forEach((header) => {
    data[header] = [];
  });

  // Parse each row
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    headers.forEach((header, index) => {
      const value = parseFloat(values[index]);
      // Keep -999 as is (sentinel value for missing data)
      data[header].push(value);
    });
  }

  return data;
};

const createTraceData = (name, xValues, yValues, extraOptions = {}) => {
  return {
    mode: "lines",
    name: name,
    type: "scatter",
    x: xValues,
    y: yValues.map((item) => (item === -999 ? undefined : item)),
    ...extraOptions,
  };
};

export const plotObservedAndProjected = async (
  megaMenuSelection,
  climateOption,
) => {
  console.log(megaMenuSelection);
  // use startDate and endDate from temperature since it's the same for these
  const startDate = parseInt(megaMenuSelection.startDates["temperature"]);
  const endDate = parseInt(megaMenuSelection.endDates["temperature"]);

  // Fetch data
  const data = await fetchObservedAndProjectedData(megaMenuSelection.value);

  // Extract all columns as variables
  const year = data.year;
  const obs = data.obs;
  const historical_lower = data.historical_lower;
  const historical_upper = data.historical_upper;
  const ssp126_lower = data.ssp126_lower;
  const ssp126_upper = data.ssp126_upper;
  const ssp245_lower = data.ssp245_lower;
  const ssp245_upper = data.ssp245_upper;
  const ssp370_lower = data.ssp370_lower;
  const ssp370_upper = data.ssp370_upper;
  const ssp585_lower = data.ssp585_lower;
  const ssp585_upper = data.ssp585_upper;

  const ssp126_lowerChart = createTraceData(
    "Lower Emissions Lower",
    year,
    ssp126_lower,
    {
      line: {
        color: "rgba(173, 216, 230, 0)",
        width: 0,
      },
      hoverinfo: "skip",
      showlegend: false,
    },
  );

  return [ssp126_lowerChart];
};
