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

export default parseFile;
