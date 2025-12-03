import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import Plotly from "plotly.js-dist";

const SaveAsSVGButton = (props) => {
  const { chartTitle, widthARG = 1600, heightARG = 1200 } = props;

  // Export plotly chart as SVG at specified dimensions without affecting display
  const exportSVG = async () => {
    try {
      // Get the plotly div element
      const plotlyDiv = document.querySelector(".js-plotly-plot");

      if (!plotlyDiv) {
        console.error("Plotly chart not found");
        return;
      }

      // Store original layout dimensions
      const originalLayout = { ...plotlyDiv.layout };

      // Temporarily update layout to export dimensions
      await Plotly.relayout(plotlyDiv, {
        width: widthARG,
        height: heightARG,
      });

      // Export at the new dimensions
      const svgData = await Plotly.toImage(plotlyDiv, {
        format: "svg",
        width: widthARG,
        height: heightARG,
      });

      // Restore original layout
      await Plotly.relayout(plotlyDiv, {
        width: originalLayout.width,
        height: originalLayout.height,
      });

      // Download the image
      downloadFile(svgData);
    } catch (error) {
      console.error("Error exporting chart:", error);
    }
  };

  // Download the SVG file
  const downloadFile = (data) => {
    const a = document.createElement("a");
    a.download = `${chartTitle}.svg`;
    a.href = data;
    a.click();
    a.remove();
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
        onClick={exportSVG}
        variant="outlined"
        sx={{ backgroundColor: "#1976d2", color: "white" }}
      >
        Save Chart
      </Button>
    </Box>
  );
};

export default SaveAsSVGButton;
