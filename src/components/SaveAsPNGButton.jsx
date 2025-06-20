import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";

const SaveAsPNGButton = (props) => {
  const { chartData, svgSelector, widthARG, heightARG } = props;

  // handles downloads chart as PNG
  // can get rid of this later; redundant
  // const handleDownloadChartAsPNG = (svgSelector, width, height) => {
  //   convertToPng(svgSelector, width, height);
  // };

  // convert svg base64 data to png
  const convertToPng = (
    svgSelector = ".js-plotly-plot .main-svg",
    widthARG = 1000,
    heightARG = 500
  ) => {
    // get ploltly div
    const plotHolderDiv =
      document.querySelector(".PlotRegionDiv").parentElement;
    const plotRegionDiv = document.querySelector(
      ".user-select-none.svg-container"
    );
    const sizeChanged = checkSVGForSizeChange(svgSelector, widthARG, heightARG);

    // get default for heights and widths
    const originalHolderWidth = plotHolderDiv.getAttribute("width");
    const originalHolderHeight = plotHolderDiv.getAttribute("height");
    const originalWidth = plotRegionDiv.getAttribute("width");
    const originalHeight = plotRegionDiv.getAttribute("height");

    // only do this of dimensions are different
    if (sizeChanged) {
      // set divs to fixed width for standard or custom suze
      plotHolderDiv.style.width = `${widthARG}px`;
      plotRegionDiv.style.width = `${widthARG}px`;
      plotHolderDiv.style.height = `${heightARG}px`;
      plotRegionDiv.style.height = `${heightARG}px`;

      // force window reszize so plotly re-renders the chart at fixed dimensions
      window.dispatchEvent(new Event("resize"));
    }

    setTimeout(() => {
      // find and covnert html all plotly chart nodes
      // (plotly puts legends and the chart in seperate nodes)
      // to an JS array
      const svgs = Array.from(document.querySelectorAll(svgSelector));
      const width = svgs[0].getAttribute("width");
      const height = svgs[0].getAttribute("height");

      const mergedDiv = document.createElement("div");
      mergedDiv.setAttribute("id", "merged-div");

      // create a new svg element
      const mergedSVG = document.createElement("svg");

      // set new svg element getAttributes to match the first plotly svg element
      // this will ensure width/height style and all the other settings match in the export
      mergedSVG.setAttribute("xmlns", svgs[0].getAttribute("xmlns"));
      mergedSVG.setAttribute(
        "xmlns:xlink",
        svgs[0].getAttribute("xmlns:xlink")
      );
      mergedSVG.setAttribute("width", width);
      mergedSVG.setAttribute("height", height);
      mergedSVG.setAttribute("style", svgs[0].getAttribute("style"));
      // append the svg to the div - this is needed to export the svg tet properly
      mergedDiv.appendChild(mergedSVG);

      // iterate all the plotly nodes and merge them into the same svg node
      // this forces all the svg into one dom element to export correctly
      svgs.forEach((svgnode) => {
        const content = Array.from(svgnode.childNodes);
        content.forEach((svgele) => {
          const node = svgele.cloneNode(true);
          const newNode = removeBreaks(node);
          mergedSVG.appendChild(newNode);
        });
      });

      const blob = new Blob([mergedSVG.outerHTML], {
        type: "image/svg+xml;charset=utf-8",
      });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(blob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        const png = canvas.toDataURL();
        donwloadFile(png, "png");

        if (sizeChanged) {
          // reset dimensions back to orginal dimensions
          plotHolderDiv.style.width = originalHolderWidth;
          plotRegionDiv.style.width = originalWidth;
          plotHolderDiv.style.height = originalHolderHeight;
          plotRegionDiv.style.height = originalHeight;
          // force window reszize so plotly re-renders the chart at fixed dimensions
          window.dispatchEvent(new Event("resize"));
        }
      };
      image.src = blobURL;
    }, 500);
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

  // removes <br> from title atttribute (in SVG) so images are exported without error
  //  used on small screens to create line breaks in chart tittle
  //  the < and > is not allowed on svg to image so it needs to be removed
  //  to allow for export
  const removeBreaks = (node) => {
    const titleSelector = ".infolayer .g-gtitle .gtitle";
    const nodeTitle = node.querySelector(titleSelector);
    if (nodeTitle) {
      const nodeAttribute = nodeTitle.getAttribute("data-unformatted");
      const newNodeAttribute = nodeAttribute
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "")
        .replace("<br>", "");
      node
        .querySelector(titleSelector)
        .setAttribute("data-unformatted", newNodeAttribute);
      return node;
    }
    return node;
  };

  // take blob data and add it to a href, intiate a click so the file downloads
  const donwloadFile = (data, type = "svg") => {
    // create a new a element
    const a = document.createElement("a");

    // add click handler
    const e = new MouseEvent("click");

    // create download name based on curent settings
    // a.download = `${getDownloadName()}.${type}`; commenting out for now
    a.download = "downloadedFile";

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
        onClick={() => convertToPng(svgSelector, widthARG, heightARG)}
        variant="outlined"
        sx={{ backgroundColor: "#1976d2", color: "white" }}
      >
        Save as PNG
      </Button>
    </Box>
  );
};

export default SaveAsPNGButton;
