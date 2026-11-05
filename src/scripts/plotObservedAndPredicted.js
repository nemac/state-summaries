// A region that borrows a state's data (dataOverride) also uses that state's file.
export const fig1FileName = (selection) => {
  const areaName = selection.dataOverride
    ? selection.dataOverride.label
    : selection.value;
  return `${areaName.replace(/[\s_]+/g, '')}_FIG1_SCS2025.csv`;
};

export const fetchObservedAndProjectedData = async (selection) => {
  const fileUrl = `/sandboxdata/2025_Sandbox_Datafiles/observed_and_projected/${fig1FileName(selection)}`;
  console.debug(`[data] ${selection.value} (observed/projected): ${fileUrl}`);
  // no-cache: revalidate against the server so a new delivery is never
  // masked by a browser's cached copy of the old file.
  const response = await fetch(fileUrl, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`${fileUrl} returned ${response.status}`);
  }
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
