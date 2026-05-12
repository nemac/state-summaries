import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import Plotly from "plotly.js-dist";
import { colors } from "../theme";

// SVG-relevant CSS properties to inline on the clone. Limiting to these
// keeps the output file small and avoids leaking irrelevant styles.
const SVG_STYLE_PROPS = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-anchor",
  "dominant-baseline",
  "opacity",
  "visibility",
  "color",
];

const copyComputedStyles = (sourceEl, targetEl) => {
  const computed = window.getComputedStyle(sourceEl);
  const parts = [];
  for (const prop of SVG_STYLE_PROPS) {
    const val = computed.getPropertyValue(prop);
    if (val) parts.push(`${prop}: ${val}`);
  }
  if (parts.length > 0) {
    targetEl.setAttribute("style", parts.join("; "));
  }
};

// Walk source + clone trees in lockstep, copying styles onto each
// element in the clone.
const inlineStyles = (sourceRoot, targetRoot) => {
  copyComputedStyles(sourceRoot, targetRoot);
  const sourceWalker = document.createTreeWalker(
    sourceRoot,
    NodeFilter.SHOW_ELEMENT,
  );
  const targetWalker = document.createTreeWalker(
    targetRoot,
    NodeFilter.SHOW_ELEMENT,
  );
  let s = sourceWalker.nextNode();
  let t = targetWalker.nextNode();
  while (s && t) {
    copyComputedStyles(s, t);
    s = sourceWalker.nextNode();
    t = targetWalker.nextNode();
  }
};

const triggerSvgDownload = (svgString, filename) => {
  const blob = new Blob(
    ['<?xml version="1.0" encoding="UTF-8"?>\n', svgString],
    { type: "image/svg+xml;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = url;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const SaveAsSVGButton = (props) => {
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

    const svgData = await Plotly.toImage(plotlyDiv, {
      format: "svg",
      width: widthARG,
      height: heightARG,
    });

    await Plotly.relayout(plotlyDiv, {
      width: originalLayout.width,
      height: originalLayout.height,
    });

    // Plotly returns a data: URL — bridge that to the same download path.
    const a = document.createElement("a");
    a.download = `${chartTitle}.svg`;
    a.href = svgData;
    a.click();
    a.remove();
  };

  // Native SVG serialization: clone the chart's existing <svg> element,
  // inline its computed styles so it stands alone, set width/height/viewBox
  // for the requested output size, and serialize via XMLSerializer.
  // Produces a real vector file (editable in Illustrator/Inkscape).
  //
  // Limitation: The chart title, custom legend, and bracket overlay are
  // HTML elements layered above the SVG and are not included in the
  // serialized output. Use PNG if you need the full visual composition.
  const exportRecharts = () => {
    const root = chartRef?.current ?? document;
    const target = root.querySelector(".chart-export-target");
    const sourceSvg = target?.querySelector("svg");

    if (!sourceSvg) {
      console.error("Recharts SVG not found");
      return;
    }

    const clone = sourceSvg.cloneNode(true);

    // Preserve original aspect via viewBox so widthARG/heightARG resize
    // vectorially. If viewBox is already set, leave it alone.
    if (!clone.getAttribute("viewBox")) {
      const rect = sourceSvg.getBoundingClientRect();
      clone.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    }
    clone.setAttribute("width", String(widthARG));
    clone.setAttribute("height", String(heightARG));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

    inlineStyles(sourceSvg, clone);

    const svgString = new XMLSerializer().serializeToString(clone);
    triggerSvgDownload(svgString, `${chartTitle}.svg`);
  };

  const exportSVG = async () => {
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
        exportRecharts();
      } else {
        await exportPlotly();
      }
    } catch (error) {
      console.error("Error exporting chart:", error);
    }
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
        sx={{ backgroundColor: colors.buttonBlue, color: colors.white }}
      >
        Save Chart
      </Button>
    </Box>
  );
};

export default SaveAsSVGButton;
