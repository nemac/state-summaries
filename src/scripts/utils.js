/*
// Set of utility functions that originally existed on their own elsewhere
 */

// parse data file which is in CSV format
function parseFile(data, type, parseRegion) {
  const xvals = [];
  const yvals = [];
  const lines = data.split(/\r?\n/);
  const headers = lines[0].split(",");

  // puts all the headers into an array
  for (let h = 0; h < headers.length; h += 1) {
    headers[h] = headers[h].trim();
  }

  let colIndex;

  // not sure this is needed anymore the python script that creates the JSON
  // config from all the txt files now cleans up extra columns aka #grids and #grid
  // columns. Think its handling no location name in national file
  if (type === "CONUS") {
    colIndex = 1;
  } else if (type === "regions" || type === "states") {
    for (let h = 1; h < headers.length; h += 1) {
      if (headers[h].toUpperCase() === parseRegion.toUpperCase()) {
        colIndex = h;
        break;
      }
    }
  }

  // gets all the rows into an arrays
  for (let i = 1; i < lines.length; i += 1) {
    const elements = lines[i].split(",");
    if (elements.length <= 1) {
      break;
    }
    // creates x and y value arrays for use in ploty chart library
    // could be modififed for any charting library
    const xval = parseInt(elements[0], 10);
    const yval = parseFloat(elements[colIndex]);
    xvals.push(xval);
    yvals.push(yval);
  }
  return [xvals, yvals];
}

// Check if all values in an array are -999 (no data indicator)
export function areAllValuesNoData(values) {
  return values.every((value) => value === -999);
}

// Order index entries for one series: the long 1895/1900 file first, then the
// rest by start year, so a caller can fall back when a column is all -999.
export function orderFilesByPreference(files) {
  const isLongPeriod = (file) =>
    file.period === "1895-2024" || file.period === "1900-2024";
  return [...files].sort(
    (a, b) => Number(isLongPeriod(b)) - Number(isLongPeriod(a)) || a.start - b.start,
  );
}

// Region files, unlike state composites, hold data before a region's start
// year, so a region only reads variants that start on or after it.
export function regionFilesFrom(files, startYear) {
  return files.filter((file) => file.start >= startYear);
}

// Index entries a chart tries for one series, in the order getChartData fetches them.
export function candidateDataFiles(indexEntries, fileType, locationType, startYear) {
  const seriesFiles = indexEntries.filter((file) => file.type === fileType);
  const eligibleFiles =
    locationType === "regions" ? regionFilesFrom(seriesFiles, startYear) : seriesFiles;
  return orderFilesByPreference(eligibleFiles);
}

// The values from firstYear through lastYear, leaving out -999 (no data).
function valuesBetweenYears(years, values, firstYear, lastYear) {
  const valuesInRange = [];
  for (let index = 0; index < years.length; index += 1) {
    const year = years[index];
    const value = values[index];
    if (year >= firstYear && year <= lastYear && value !== -999) {
      valuesInRange.push(value);
    }
  }
  return valuesInRange;
}

function average(values) {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
}

// Splits startYear-endYear into 5-year blocks and averages each block, for the
// chart's bars. A block with no data at all gets no bar.
export function fiveYearAverages(years, values, startYear, endYear) {
  const blocks = [];
  for (let firstYear = startYear; firstYear <= endYear; firstYear += 5) {
    const lastYear = Math.min(firstYear + 4, endYear);
    const blockValues = valuesBetweenYears(years, values, firstYear, lastYear);
    if (blockValues.length > 0) {
      blocks.push({
        label: `${firstYear}–${lastYear}`,
        firstYear,
        lastYear,
        average: average(blockValues),
      });
    }
  }
  return blocks;
}

export default parseFile;
