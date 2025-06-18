import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import FileSaver from "file-saver";

const SaveAsCSVButton = (props) => {
  const { chartData } = props;

  // This is what actually creates and saves the file.
  const saveFile = (content, filename, filetype) => {
    const blob = new Blob(content, { type: filetype });
    FileSaver.saveAs(blob, filename);
  };

  // handles downloads chart as CSV
  const handleDownloadChartAsCSV = () => {
    const fileContent = [convertDataToCSV(convertChartDataToJSON())];
    const fileName = `${chartData.region}-${chartData.location}-${chartData.climatevariable}-${chartData.period}.csv`; //downloading as undefined, will revisit later
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
          JSON.stringify(row[fieldName], replacer).replace(/\\"/g, '""')
        )
        .join(",")
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
        sx={{ backgroundColor: "#1976d2", color: "white" }}
      >
        Save as a CSV
      </Button>
    </Box>
  );
};

export default SaveAsCSVButton;
