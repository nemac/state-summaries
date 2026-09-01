import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";

const BRACKET_CONFIGS = [
  {
    scenario: "ssp585",
    label: "Very High",
    color: colors.bracket.ssp585,
    xOffset: 0,
  },
  {
    scenario: "ssp245",
    label: "Intermediate",
    color: colors.bracket.ssp245,
    xOffset: 1,
  },
  {
    scenario: "ssp370",
    label: "High",
    color: colors.bracket.ssp370,
    xOffset: 2,
  },
  {
    scenario: "ssp126",
    label: "Low",
    color: colors.bracket.ssp126,
    xOffset: 3,
  },
];

const BRACKET_SPACING = 25;
const CAP_WIDTH = 10;
const LINE_WIDTH = 4;

export default function BracketOverlay({
  bracketData,
  yDomain,
  chartRef,
  hiddenScenarios,
}) {
  const svgRef = useRef(null);
  const [dims, setDims] = useState(null);

  useEffect(() => {
    let debounceTimer = null;

    const measure = () => {
      if (!chartRef?.current) return;
      // Find the Recharts cartesian grid element to get plot area dimensions
      const grid = chartRef.current.querySelector(".recharts-cartesian-grid");
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const containerRect = chartRef.current.getBoundingClientRect();
      setDims({
        plotTop: rect.top - containerRect.top,
        plotBottom: rect.bottom - containerRect.top,
        plotHeight: rect.height,
        plotRight: rect.right - containerRect.left,
        containerHeight: containerRect.height,
      });
    };

    // Debounced measure to allow Recharts ResponsiveContainer to finish re-rendering
    const debouncedMeasure = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measure, 150);
    };

    measure();
    const observer = new ResizeObserver(debouncedMeasure);
    if (chartRef?.current) observer.observe(chartRef.current);

    // Listen for orientation changes which may not trigger ResizeObserver immediately
    window.addEventListener("resize", debouncedMeasure);

    // Also re-measure after a brief delay for initial render
    const initTimer = setTimeout(measure, 100);

    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
      clearTimeout(initTimer);
      window.removeEventListener("resize", debouncedMeasure);
    };
  }, [chartRef, bracketData, yDomain]);

  if (!dims || !bracketData || !yDomain) return null;

  const [yMin, yMax] = yDomain;
  const yRange = yMax - yMin;

  // Convert a y-data-value to a pixel position
  const yToPixel = (val) => {
    const fraction = (val - yMin) / yRange;
    // Y axis is inverted in screen coords: top = yMax, bottom = yMin
    return dims.plotTop + dims.plotHeight * (1 - fraction);
  };

  const overlayWidth = BRACKET_CONFIGS.length * BRACKET_SPACING + 60;

  return (
    <svg
      ref={svgRef}
      className="chart-export-brackets"
      style={{
        position: "absolute",
        top: 0,
        left: dims.plotRight,
        width: overlayWidth,
        height: dims.containerHeight,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {BRACKET_CONFIGS.map((config) => {
        const data = bracketData[config.scenario];
        if (!data) return null;
        if (hiddenScenarios?.has(config.scenario)) return null;

        const topY = yToPixel(data.top);
        const bottomY = yToPixel(data.bottom);
        const midY = (topY + bottomY) / 2;
        const x = 8 + config.xOffset * BRACKET_SPACING;

        return (
          <g key={config.scenario}>
            {/* Vertical line */}
            <line
              x1={x}
              y1={topY}
              x2={x}
              y2={bottomY}
              stroke={config.color}
              strokeWidth={LINE_WIDTH}
            />
            {/* Top cap */}
            <line
              x1={x - CAP_WIDTH / 2}
              y1={topY}
              x2={x + CAP_WIDTH / 2}
              y2={topY}
              stroke={config.color}
              strokeWidth={LINE_WIDTH}
            />
            {/* Bottom cap */}
            <line
              x1={x - CAP_WIDTH / 2}
              y1={bottomY}
              x2={x + CAP_WIDTH / 2}
              y2={bottomY}
              stroke={config.color}
              strokeWidth={LINE_WIDTH}
            />
            {/* Rotated label */}
            <text
              x={x + 14}
              y={midY}
              fill={config.color}
              fontSize={14}
              fontFamily="Arial"
              fontWeight="bold"
              textAnchor="middle"
              transform={`rotate(-90, ${x + 14}, ${midY})`}
            >
              {config.label.split("\n").map((line, i) => (
                <tspan key={i} x={x + 14} dy={i === 0 ? 0 : "1.1em"}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
