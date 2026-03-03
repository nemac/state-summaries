import { useEffect, useRef, useState } from "react";

const BRACKET_CONFIGS = [
  {
    scenario: "ssp585",
    label: "Very High",
    color: "rgb(189,0,38)",
    xOffset: 0,
  },
  {
    scenario: "ssp245",
    label: "Intermediate",
    color: "rgb(105,105,105)",
    xOffset: 1,
  },
  {
    scenario: "ssp370",
    label: "High",
    color: "rgb(247,148,30)",
    xOffset: 2,
  },
  {
    scenario: "ssp126",
    label: "Low",
    color: "rgb(90,180,172)",
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

    measure();
    const observer = new ResizeObserver(measure);
    if (chartRef?.current) observer.observe(chartRef.current);

    // Also re-measure after a brief delay for initial render
    const timer = setTimeout(measure, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
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
