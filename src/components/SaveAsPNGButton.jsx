import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import Plotly from "plotly.js-dist";
import { toPng } from "html-to-image";
import { colors } from "../theme";

const SaveAsPNGButton = (props) => {
  const {
    chartTitle,
    widthARG = 1600,
    heightARG = 1200,
    chartType = "plotly",
    chartRef,
  } = props;

  const exportPlotly = async () => {
    const root = chartRef?.current ?? document;
    const plotlyDiv = root.querySelector(".js-plotly-plot");

    if (!plotlyDiv) {
      console.error("Plotly chart not found");
      return;
    }

    const originalLayout = { ...plotlyDiv.layout };

    await Plotly.relayout(plotlyDiv, {
      width: widthARG,
      height: heightARG,
    });

    const imgData = await Plotly.toImage(plotlyDiv, {
      format: "png",
      width: widthARG,
      height: heightARG,
    });

    await Plotly.relayout(plotlyDiv, {
      width: originalLayout.width,
      height: originalLayout.height,
    });

    downloadFile(imgData);
  };

  const exportRecharts = async () => {
    const root = chartRef?.current ?? document;
    const target = root.querySelector(".chart-export-target");

    if (!target) {
      console.error("Recharts chart not found");
      return;
    }

    const renderedWidth = target.offsetWidth || widthARG;
    const renderedHeight = target.offsetHeight || heightARG;
    const pixelRatio = Math.max(
      widthARG / renderedWidth,
      heightARG / renderedHeight,
    );

    const imgData = await toPng(target, {
      backgroundColor: "#ffffff",
      pixelRatio,
      width: renderedWidth,
      height: renderedHeight,
    });

    downloadFile(imgData);
  };

  const convertToPng = async () => {
    try {
      const root = chartRef?.current ?? document;
      const hasRecharts = !!root.querySelector(".chart-export-target");
      const hasPlotly = !!root.querySelector(".js-plotly-plot");

      let resolved;
      if (hasRecharts && hasPlotly) {
        resolved = chartType === "plotly" ? "plotly" : "recharts";
      } else if (hasRecharts) {
        resolved = "recharts";
      } else if (hasPlotly) {
        resolved = "plotly";
      } else {
        console.error("No chart found to export");
        return;
      }

      if (resolved === "recharts") {
        await exportRecharts();
      } else {
        await exportPlotly();
      }
    } catch (error) {
      console.error("Error exporting chart:", error);
    }
  };

  const downloadFile = (data) => {
    const a = document.createElement("a");
    a.download = `${chartTitle}.png`;
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
        onClick={convertToPng}
        variant="outlined"
        sx={{ backgroundColor: colors.buttonBlue, color: colors.white }}
      >
        Save Chart
      </Button>
    </Box>
  );
};

export default SaveAsPNGButton;
