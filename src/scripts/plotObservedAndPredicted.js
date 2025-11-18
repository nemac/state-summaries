export const fetchObservedAndProjectedData = async (megaMenuSelectionValue) => {
  const valueWithoutSpaces = megaMenuSelectionValue.replace(/[\s_]+/g, '');
  const response = await fetch(
    `/sandboxdata/2025_Sandbox_Datafiles/observed_and_projected/${valueWithoutSpaces}_FIG1_SCS2025.csv`,
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
