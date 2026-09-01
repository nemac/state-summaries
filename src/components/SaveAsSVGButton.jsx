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

  // Native SVG serialization producing the full visual composition: the
  // recharts <svg> plus the title, custom legend, and bracket overlay, which
  // are HTML/SVG siblings positioned by CSS. Everything is measured from the
  // live DOM and rebuilt as plain SVG elements in one document, so the file
  // is a real vector (editable in Illustrator/Inkscape).
  const exportRecharts = () => {
    const NS = "http://www.w3.org/2000/svg";
    const root = chartRef?.current ?? document;
    const target = root.querySelector(".chart-export-target");
    const sourceSvg = target?.querySelector("svg.recharts-surface");

    if (!target || !sourceSvg) {
      console.error("Recharts SVG not found");
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const out = document.createElementNS(NS, "svg");
    out.setAttribute("viewBox", `0 0 ${targetRect.width} ${targetRect.height}`);
    out.setAttribute("width", String(widthARG));
    out.setAttribute("height", String(heightARG));
    out.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    out.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

    const relRect = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - targetRect.left,
        y: r.top - targetRect.top,
        width: r.width,
        height: r.height,
      };
    };

    const makeRect = ({ x, y, width, height }, fill, stroke) => {
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", width);
      rect.setAttribute("height", height);
      rect.setAttribute("fill", fill);
      if (stroke) rect.setAttribute("stroke", stroke);
      return rect;
    };

    // Approximate an HTML element's text as an SVG <text> at its DOM position.
    const makeText = (el, { anchor = "start" } = {}) => {
      const r = relRect(el);
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      const text = document.createElementNS(NS, "text");
      text.setAttribute(
        "x",
        anchor === "middle" ? r.x + r.width / 2 : r.x,
      );
      // Baseline sits roughly 80% of the way down the line box.
      text.setAttribute("y", r.y + (r.height + fontSize * 0.6) / 2);
      text.setAttribute("text-anchor", anchor);
      text.setAttribute("fill", style.color);
      text.setAttribute("font-family", style.fontFamily);
      text.setAttribute("font-size", style.fontSize);
      text.setAttribute("font-weight", style.fontWeight);
      text.textContent = el.textContent;
      return text;
    };

    // Background
    const targetStyle = window.getComputedStyle(target);
    out.appendChild(
      makeRect(
        { x: 0, y: 0, width: targetRect.width, height: targetRect.height },
        targetStyle.backgroundColor,
      ),
    );

    // Embedded <svg> elements (the chart itself and the bracket overlay),
    // re-anchored at their on-screen offsets.
    const placeSvg = (srcSvg) => {
      const r = relRect(srcSvg);
      const clone = srcSvg.cloneNode(true);
      clone.removeAttribute("style");
      clone.removeAttribute("class");
      clone.setAttribute("x", r.x);
      clone.setAttribute("y", r.y);
      clone.setAttribute("width", r.width);
      clone.setAttribute("height", r.height);
      // The bracket overlay draws outside its nominal box (overflow:
      // visible); keep that behavior in the export.
      clone.setAttribute("overflow", "visible");
      inlineStyles(srcSvg, clone);
      out.appendChild(clone);
    };
    placeSvg(sourceSvg);
    const bracketSvg = target.querySelector("svg.chart-export-brackets");
    if (bracketSvg) placeSvg(bracketSvg);

    // Title
    const titleEl = target.querySelector(".chart-export-title");
    if (titleEl) out.appendChild(makeText(titleEl, { anchor: "middle" }));

    // Legend: bordered box, then one swatch + label per row.
    const legendEl = target.querySelector(".chart-export-legend");
    if (legendEl) {
      const legendStyle = window.getComputedStyle(legendEl);
      const box = makeRect(
        relRect(legendEl),
        legendStyle.backgroundColor,
        legendStyle.borderColor,
      );
      out.appendChild(box);
      for (const row of legendEl.children) {
        const [swatch, label] = row.children;
        if (!swatch || !label) continue;
        const group = document.createElementNS(NS, "g");
        const rowOpacity = window.getComputedStyle(row).opacity;
        if (rowOpacity !== "1") group.setAttribute("opacity", rowOpacity);
        group.appendChild(
          makeRect(
            relRect(swatch),
            window.getComputedStyle(swatch).backgroundColor,
          ),
        );
        group.appendChild(makeText(label));
        out.appendChild(group);
      }
    }

    const svgString = new XMLSerializer().serializeToString(out);
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
