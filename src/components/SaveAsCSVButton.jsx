import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import FileSaver from "file-saver";

const SaveAsCSVButton = () => {
  //   const [chartData, setChartData] = useState([{}]);
  //   setChartData();

  // This is what actually creates and saves the file.
  const saveFile = (content, filename, filetype) => {
    const blob = new Blob(content, { type: filetype });
    FileSaver.saveAs(blob, filename);
  };

  // handles downloads chart as CSV
  const handleDownloadChartAsCSV = () => {
    const fileContent = [convertDataToCSV(convertChartDataToJSON())];
    // const fileName = `${region}-${location}-${climatevariable}-${period}.csv`;
    const fileName = "CSV_file.csv"; //hard-coded file name for now
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
    // testing with hard-coded data
    const years = [
      2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
    ];
    const values = [
      53.19, 55.28, 52.43, 52.54, 54.39, 54.91, 54.55, 53.52, 52.68, 54.37,
      54.51,
    ];

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
