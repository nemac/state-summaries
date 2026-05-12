import React from "react";
import { createRoot } from "react-dom/client";
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
    renderExportChart,
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

  // Off-screen re-render: mount a fresh copy of the chart at the exact
  // target dimensions, wait for Recharts/ResponsiveContainer to settle,
  // then rasterize at pixelRatio: 1 for exact output size.
  const exportRecharts = async () => {
    if (typeof renderExportChart !== "function") {
      console.error(
        "Recharts PNG export requires a renderExportChart render prop",
      );
      return;
    }

    const w = Number(widthARG);
    const h = Number(heightARG);

    const offscreen = document.createElement("div");
    offscreen.style.cssText = `
      position: fixed;
      top: 0;
      left: -100000px;
      width: ${w}px;
      height: ${h}px;
      background-color: #ffffff;
      overflow: hidden;
      pointer-events: none;
    `;
    document.body.appendChild(offscreen);

    const reactRoot = createRoot(offscreen);

    try {
      reactRoot.render(renderExportChart(w, h));

      // Wait for layout: ResponsiveContainer uses ResizeObserver, which
      // fires asynchronously, and BracketOverlay measures on the next
      // animation frame. 250ms is comfortably past both.
      await new Promise((resolve) => setTimeout(resolve, 250));

      const target = offscreen.firstElementChild;
      if (!target) {
        console.error("Off-screen chart failed to mount");
        return;
      }

      const imgData = await toPng(target, {
        backgroundColor: "#ffffff",
        pixelRatio: 1,
        width: w,
        height: h,
      });

      downloadFile(imgData);
    } finally {
      reactRoot.unmount();
      offscreen.remove();
    }
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
