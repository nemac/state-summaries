import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";

const SaveAsSVGButton = (props) => {
  const { chartData, screenSize } = props;

  // handles downloads chart as SVG with fixed size
  // can get rid of this later; redundant
  const handleDownloadChartAsSVG = (svgSelector, width, height) => {
    exportSVG(svgSelector, width, height);
  };

  const checkSVGForSizeChange = (svgSelector, widthARG, heightARG) => {
    const svgElem = document.querySelector(svgSelector);
    if (svgElem) {
      const svgwidth = svgElem.getAttribute("width");
      const svgheight = svgElem.getAttribute("height");
      if (
        Number(svgwidth) === Number(widthARG) &&
        Number(svgheight) === Number(heightARG)
      )
        return false;
    }
    return true;
  };

  // take blob data and add it to a href, intiate a click so the file downloads
  const donwloadFile = (data, type = "svg") => {
    // create a new a element
    const a = document.createElement("a");

    // add click handler
    const e = new MouseEvent("click");

    // create download name based on curent settings
    a.download = `${getDownloadName()}.${type}`;

    if (type === "svg") {
      // add data to href so its "on the fly"
      const b64start = "data:image/svg+xml;base64,";
      a.href = `${b64start}${data}`;
    } else {
      a.href = data;
    }

    // force click
    a.dispatchEvent(e);

    // Remove a element
    a.remove();
    return null;
  };

  // hack to export svg, not using using pure JS
  const convertToOneSvg = (svgSelector) => {
    // find and covnert html all plotly chart nodes
    // (plotly puts legends and the chart in seperate nodes)
    // to an JS array
    const svgs = Array.from(document.querySelectorAll(svgSelector));
    const mergedDiv = document.createElement("div");
    mergedDiv.setAttribute("id", "merged-div");

    // create a new svg element
    const mergedSVG = document.createElement("svg");

    // set default for height and width
    const SVGWidth = svgs[0].getAttribute("width");
    const SVGHeight = svgs[0].getAttribute("height");

    // set new svg element getAttributes to match the first plotly svg element
    // this will ensure width/height style and all the other settings match in the export
    mergedSVG.setAttribute("xmlns", svgs[0].getAttribute("xmlns"));
    mergedSVG.setAttribute("xmlns:xlink", svgs[0].getAttribute("xmlns:xlink"));
    mergedSVG.setAttribute("width", SVGWidth);
    mergedSVG.setAttribute("height", SVGHeight);
    mergedSVG.setAttribute("style", svgs[0].getAttribute("style"));

    // append the svg to the div - this is needed to export the svg tet properly
    mergedDiv.appendChild(mergedSVG);

    // iterate all the plotly nodes and merge them into the same svg node
    // this forces all the svg into one dom element to export correctly
    svgs.forEach((svgnode) => {
      const content = Array.from(svgnode.childNodes);
      content.forEach((svgele) => {
        // drag layer contains svg that is not needed and results
        // in svg data that will require manipulation of data.
        if (!svgele.classList.contains("draglayer")) {
          const node = svgele.cloneNode(true);
          const newNode = removeBreaks(node);
          mergedSVG.appendChild(newNode);
        }
      });
    });

    // create the base64 data text so the svg is written correctly
    const base64doc = btoa(unescape(encodeURIComponent(mergedSVG.outerHTML)));

    // remove the added dom element used to create the svg base64 data
    mergedDiv.remove();
    return base64doc;
  };

  // create svg and although for custom size
  const exportSVG = (
    svgSelector = ".js-plotly-plot .main-svg",
    widthARG = 1000,
    heightARG = 500
  ) => {
    const svgElem = document.querySelector(svgSelector);
    if (svgElem) {
      // do not change dimensions if not changed by user aka default setting
      const sizeChanged = checkSVGForSizeChange(
        svgSelector,
        widthARG,
        heightARG
      );
      if (!sizeChanged) {
        const base64doc = convertToOneSvg(svgSelector);
        donwloadFile(base64doc);
        return null;
      }
    }

    // get ploltly div
    const plotHolderDiv =
      document.querySelector(".PlotRegionDiv").parentElement;
    const plotRegionDiv = document.querySelector(
      ".user-select-none.svg-container"
    );

    // get default for heights and widths
    const originalHolderWidth = plotHolderDiv.getAttribute("width");
    const originalHolderHeight = plotHolderDiv.getAttribute("height");
    const originalWidth = plotRegionDiv.getAttribute("width");
    const originalHeight = plotRegionDiv.getAttribute("height");

    // set width to fixed width
    if (widthARG > 0 && heightARG > 0) {
      // set divs to fixed width for standard or custom suze
      plotHolderDiv.style.width = `${widthARG}px`;
      plotRegionDiv.style.width = `${widthARG}px`;
      plotHolderDiv.style.height = `${heightARG}px`;
      plotRegionDiv.style.height = `${heightARG}px`;

      // force window reszize so plotly re-renders the chart at fixed dimensions
      window.dispatchEvent(new Event("resize"));

      // delay creation of svg export while resize happens
      setTimeout(() => {
        // create download file
        const base64doc = convertToOneSvg(svgSelector);
        donwloadFile(base64doc);

        // reset dimensions back to orginal dimensions
        plotHolderDiv.style.width = originalHolderWidth;
        plotRegionDiv.style.width = originalWidth;
        plotHolderDiv.style.height = originalHolderHeight;
        plotRegionDiv.style.height = originalHeight;

        // force window reszize so plotly re-renders the chart at fixed dimensions
        window.dispatchEvent(new Event("resize"));
        return null;
      }, 500);
    }
    return null;
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
        onClick={() => handleDownloadChartAsSVG(svgSelector, width, height)}
        variant="outlined"
        sx={{ backgroundColor: "#1976d2", color: "white" }}
      >
        Save as an SVG
      </Button>
    </Box>
  );
};

export default SaveAsSVGButton;
