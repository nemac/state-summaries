import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import FileSaver from "file-saver";
import { colors } from "../theme";

const SaveAsCSVButton = (props) => {
  const { chartTitle, chartData, chartType = "plotly" } = props;

  // This is what actually creates and saves the file.
  const saveFile = (content, filename, filetype) => {
    const blob = new Blob(content, { type: filetype });
    FileSaver.saveAs(blob, filename);
  };

  // handles downloads chart as CSV
  const handleDownloadChartAsCSV = () => {
    const fileContent = [convertDataToCSV(convertChartDataToJSON())];
    const fileName = `${chartTitle}.csv`;
    const fileType = "text/csv;charset=utf-8";
    saveFile(fileContent, fileName, fileType);
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

  // converts chart data json from x,y to a pair key
  // chart data has years in one array and values in another
  // csv conversion makes it {year: value} so its easier to convert to csv
  const convertChartDataToJSON = () => {
    // The observed/projected chart's series all share one year axis; export
    // one named column per series. Other charts keep the year,value format
    // (their bar and line traces duplicate the same values).
    const namedSeries = chartData.filter(
      (series) =>
        series?.name && Array.isArray(series.x) && Array.isArray(series.y),
    );
    const sharedX =
      chartType === "recharts" &&
      namedSeries.length === chartData.length &&
      namedSeries.length > 1 &&
      namedSeries.every(
        (series) =>
          series.x.length === namedSeries[0].x.length &&
          series.x.every((x, i) => x === namedSeries[0].x[i]),
      );
    if (sharedX) {
      return namedSeries[0].x.map((year, index) => {
        const row = { year };
        namedSeries.forEach((series) => {
          row[series.name] = series.y[index] ?? null;
        });
        return row;
      });
    }

    const years = chartData[0].x;
    const values = chartData[0].y;

    // merge arrays into the new object
    const JSONContent = years.map((value, index) => {
      const val = { year: value, value: values[index] };
      return val;
    });
    return JSONContent;
  };

  return (
    <Box>
      <Button
        startIcon={
          <DownloadIcon
            sx={{
              p: 0.5,
            }}
          />
        }
        onClick={handleDownloadChartAsCSV}
        variant="outlined"
        sx={{ backgroundColor: colors.buttonBlue, color: colors.white }}
      >
        Save Chart
      </Button>
    </Box>
  );
};

export default SaveAsCSVButton;
