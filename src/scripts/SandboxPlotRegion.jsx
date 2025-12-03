import React from "react";
import Plot from "react-plotly.js";
import PropTypes from "prop-types";

export default function SandboxPlotRegion(props) {
  const { plotlyData } = props;
  const config = { ...{ responsive: true, displayModeBar: false } };
  const responsiveChartRef = React.useRef();
  const [layout, _setLayout] = React.useState({ ...props.plotlyLayout });

  // Store the original layout with all shapes/annotations
  const originalLayoutRef = React.useRef(null);

  // Track which scenarios are currently hidden
  const hiddenScenariosRef = React.useRef(new Set());

  // create ref to use in listener
  const layoutRef = React.useRef(layout);
  const setLayout = (data) => {
    layoutRef.current = data;
    _setLayout(data);
  };

  // split title for small screens
  const splitTitle = (title) => {
    if (title.indexOf("<br>", 0) > 0) return title;
    const longestLength = 25;
    const titleLength = title.length;

    let newTitle = title;
    for (
      let pos = longestLength;
      pos < titleLength;
      pos = pos + 5 + longestLength
    ) {
      const sepPos = newTitle.indexOf(" ", pos);
      if (sepPos > 0) {
        newTitle = `${newTitle.substring(0, sepPos)}<br>${newTitle.substring(sepPos + 1)}`;
      }
    }
    return newTitle;
  };

  // remove split from title for large screens
  const unSplitTitle = (title) => {
    if (title.indexOf("<br>", 0) > 0 && window.innerWidth <= 768) return title;
    return title.replace("<br>", " ");
  };

  const resizeChart = () => {
    const elREF = responsiveChartRef.current;
    if (!elREF) return null;
    const el = elREF;
    const copiedLayout = layoutRef.current;
    copiedLayout.width = el.parentNode.getBoundingClientRect().width;
    copiedLayout.height = el.getBoundingClientRect().height - 24;
    const angle = window.innerWidth <= 1000 ? 90 : 0;
    const dtick = window.innerWidth <= 768 ? 10 : 5;
    const titleX = window.innerWidth <= 768 ? 0.5 : 0.4;

    // only change xaxis if the object exists
    if (copiedLayout.xaxis) {
      copiedLayout.xaxis.tickangle = angle;
      copiedLayout.xaxis.dtick = dtick;
    }

    // only change legend if the object exists
    if (copiedLayout.legend) {
      copiedLayout.legend.x = window.innerWidth <= 768 ? 0 : 0.65;
      copiedLayout.legend.y = window.innerWidth <= 768 ? -0.15 : 1.125;
    }

    // only change title if the object exists
    if (copiedLayout.title) {
      const chartTitle = copiedLayout
        ? unSplitTitle(copiedLayout.title.text)
        : "";
      const shortTitle = splitTitle(chartTitle);
      copiedLayout.title.text =
        window.innerWidth <= 768 ? shortTitle : chartTitle;
      copiedLayout.title.x = titleX;
    }

    setLayout({ ...copiedLayout });
    window.dispatchEvent(new Event("resizedone"));
    return null;
  };

  // effect for prop change so when new prop is passed in from parent the graph is re-rendered
  React.useLayoutEffect(() => {
    // Store original layout when it first comes in or when shapes/annotations are present
    if (
      !originalLayoutRef.current ||
      (props.plotlyLayout.shapes && props.plotlyLayout.shapes.length > 0)
    ) {
      originalLayoutRef.current = JSON.parse(
        JSON.stringify(props.plotlyLayout),
      );
      // Reset hidden scenarios when layout changes (e.g., switching states)
      hiddenScenariosRef.current = new Set();
    }
    setLayout(props.plotlyLayout);
    resizeChart();
  }, [props.plotlyLayout]);

  React.useEffect(() => {
    window.addEventListener("resize", resizeChart);

    // returned function will be called on component unmount
    return () => {
      window.removeEventListener("resize", resizeChart);
    };
  }, []);

  const handleLegendClick = (event) => {
    // Get the trace that was clicked
    const clickedTrace = plotlyData[event.curveNumber];
    const traceName = clickedTrace.name;

    // Determine which scenario was toggled
    let scenario = null;
    if (traceName === "SSP5-8.5") {
      scenario = "SSP5-8.5";
    } else if (traceName === "SSP2-4.5") {
      scenario = "SSP2-4.5";
    } else if (traceName === "SSP1-2.6") {
      scenario = "SSP1-2.6";
    } else if (traceName === "SSP3-7.0") {
      scenario = "SSP3-7.0";
    }

    // If no matching scenario, allow default behavior
    if (!scenario || !originalLayoutRef.current) {
      return true;
    }

    // Check if the trace is currently visible
    const isCurrentlyVisible =
      clickedTrace.visible === undefined || clickedTrace.visible === true;
    const willBeVisible = !isCurrentlyVisible;

    // Update hidden scenarios set
    if (!willBeVisible) {
      hiddenScenariosRef.current.add(scenario);
    } else {
      hiddenScenariosRef.current.delete(scenario);
    }

    // Update layout after Plotly processes the click
    setTimeout(() => {
      // Always filter from the original layout to avoid losing shapes
      if (!originalLayoutRef.current) {
        console.warn(
          "originalLayoutRef is null, skipping shape/annotation filtering",
        );
        return;
      }

      const updatedLayout = { ...layoutRef.current };

      // Filter shapes to exclude all hidden scenarios
      updatedLayout.shapes = originalLayoutRef.current.shapes.filter(
        (shape) =>
          !shape.meta || !hiddenScenariosRef.current.has(shape.meta.scenario),
      );

      // Filter annotations to exclude all hidden scenarios
      updatedLayout.annotations = originalLayoutRef.current.annotations.filter(
        (annotation) =>
          !annotation.meta ||
          !hiddenScenariosRef.current.has(annotation.meta.scenario),
      );

      setLayout(updatedLayout);
    }, 10);

    // Allow default toggle behavior
    return true;
  };

  return (
    <div
      {...{
        ref: responsiveChartRef,
      }}
    >
      <Plot
        data={plotlyData}
        layout={layoutRef.current}
        config={config}
        revision={Math.floor(Math.random() * 100000)}
        onLegendClick={handleLegendClick}
      />
    </div>
  );
}

SandboxPlotRegion.propTypes = {
  plotlyLayout: PropTypes.object,
  plotlyData: PropTypes.array,
};
