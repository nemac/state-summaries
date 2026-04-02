import { useRef, useState, useCallback } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import BracketOverlay from "./BracketOverlay.jsx";
import { colors, scenarioColor } from "../theme";

// Scenario rendering config: order matters (largest band first, smallest last)
// so smaller bands paint on top of larger ones.
// Intermediate (ssp245) renders last (on top of all other bands).
const SCENARIO_BANDS = [
  {
    key: "historical",
    lower: "historical_lower",
    rangeKey: "historical_range",
    name: "Modeled Historical",
    fillColor: scenarioColor("historical", 0.5),
    strokeColor: scenarioColor("historical", 0),
  },
  {
    key: "ssp585",
    lower: "ssp585_lower",
    rangeKey: "ssp585_range",
    name: "Very High Emissions (SSP5-8.5)",
    fillColor: scenarioColor("ssp585", 0.7),
    strokeColor: scenarioColor("ssp585", 0),
  },
  {
    key: "ssp370",
    lower: "ssp370_lower",
    rangeKey: "ssp370_range",
    name: "High Emissions (SSP3-7.0)",
    fillColor: scenarioColor("ssp370", 0.7),
    strokeColor: scenarioColor("ssp370", 0),
  },
  {
    key: "ssp126",
    lower: "ssp126_lower",
    rangeKey: "ssp126_range",
    name: "Low Emissions (SSP1-2.6)",
    fillColor: scenarioColor("ssp126", 0.6),
    strokeColor: scenarioColor("ssp126", 0),
  },
  {
    key: "ssp245",
    lower: "ssp245_lower",
    rangeKey: "ssp245_range",
    name: "Intermediate Emissions (SSP2-4.5)",
    fillColor: scenarioColor("ssp245", 0.6),
    strokeColor: scenarioColor("ssp245", 0),
  },
];

// Legend display order (different from render order)
const LEGEND_ORDER = [
  { key: "obs", name: "Observations", color: colors.textPrimary },
  {
    key: "historical",
    name: "Modeled Historical",
    color: scenarioColor("historical", 0.7),
  },
  {
    key: "ssp126",
    name: "Low Emissions (SSP1-2.6)",
    color: scenarioColor("ssp126", 0.8),
  },
  {
    key: "ssp245",
    name: "Intermediate Emissions (SSP2-4.5)",
    color: scenarioColor("ssp245", 0.7),
  },
  {
    key: "ssp370",
    name: "High Emissions (SSP3-7.0)",
    color: scenarioColor("ssp370", 0.85),
  },
  {
    key: "ssp585",
    name: "Very High Emissions (SSP5-8.5)",
    color: scenarioColor("ssp585", 0.85),
  },
];

// Desired tooltip display order: use _upper keys to show actual values
const TOOLTIP_ORDER = [
  {
    scenarioKey: "obs",
    upperKey: "obs",
    name: "Observations",
    color: colors.textPrimary,
  },
  {
    scenarioKey: "ssp585",
    upperKey: "ssp585_upper",
    name: "Very High Emissions (SSP5-8.5)",
    color: scenarioColor("ssp585", 0.85),
  },
  {
    scenarioKey: "ssp370",
    upperKey: "ssp370_upper",
    name: "High Emissions (SSP3-7.0)",
    color: scenarioColor("ssp370", 0.85),
  },
  {
    scenarioKey: "ssp245",
    upperKey: "ssp245_upper",
    name: "Intermediate Emissions (SSP2-4.5)",
    color: scenarioColor("ssp245", 0.7),
  },
  {
    scenarioKey: "ssp126",
    upperKey: "ssp126_upper",
    name: "Low Emissions (SSP1-2.6)",
    color: scenarioColor("ssp126", 0.8),
  },
];

function CustomTooltip({ active, payload, label, hiddenScenarios }) {
  if (!active || !payload || payload.length === 0) return null;

  // Get the full data row to access _upper values directly
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <Box
      sx={{
        backgroundColor: colors.overlay.white95,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: "4px",
        padding: "8px 12px",
        fontSize: "13px",
        fontFamily: "Arial",
      }}
    >
      <Typography sx={{ fontWeight: "bold", fontSize: "13px", mb: 0.5 }}>
        Year: {label}
      </Typography>
      {TOOLTIP_ORDER.map((item) => {
        if (hiddenScenarios?.has(item.scenarioKey)) return null;
        const val = row[item.upperKey];
        if (val === undefined || val === null) return null;
        return (
          <Typography
            key={item.scenarioKey}
            sx={{ fontSize: "13px", color: item.color }}
          >
            {item.name} : {typeof val === "number" ? val.toFixed(2) : val}
          </Typography>
        );
      })}
    </Box>
  );
}

export default function ObservedProjectedChart({
  data,
  bracketData,
  yDomain,
  chartTitle,
}) {
  const chartContainerRef = useRef(null);
  const [hiddenScenarios, setHiddenScenarios] = useState(new Set());

  const toggleScenario = useCallback((key) => {
    setHiddenScenarios((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Generate tick values at 25-year intervals
  const xTicks = data
    ? data.map((d) => d.year).filter((year) => year % 25 === 0)
    : [];

  const yTicks = (() => {
    if (!yDomain) return undefined;
    const ticks = [];
    const start = Math.ceil(yDomain[0] / 5) * 5;
    const end = Math.floor(yDomain[1] / 5) * 5;
    for (let v = start; v <= end; v += 5) {
      ticks.push(v);
    }
    return ticks;
  })();

  const CustomLegend = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        top: 80,
        left: 110,
        backgroundColor: colors.overlay.white85,
        border: `1px solid ${colors.textPrimary}`,
        padding: "6px 10px",
        zIndex: 10,
        gap: "2px",
      }}
    >
      {LEGEND_ORDER.map((item) => {
        const isHidden = hiddenScenarios.has(item.key);
        return (
          <Box
            key={item.key}
            onClick={() => toggleScenario(item.key)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              opacity: isHidden ? 0.35 : 1,
              "&:hover": { opacity: isHidden ? 0.5 : 0.8 },
            }}
          >
            {item.key === "obs" ? (
              <Box
                sx={{
                  width: 20,
                  height: 3,
                  backgroundColor: item.color,
                  borderRadius: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 16,
                  height: 12,
                  backgroundColor: item.color,
                  border: `1px solid ${colors.overlay.black15}`,
                }}
              />
            )}
            <Typography
              sx={{
                fontSize: "12px",
                fontFamily: "Arial",
                color: colors.textDark,
                userSelect: "none",
              }}
            >
              {item.name}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  // Map hidden scenarios to bracket-compatible set (using ssp key format)
  const hiddenBracketScenarios = hiddenScenarios;

  if (!data || data.length === 0) return null;

  return (
    <Box
      ref={chartContainerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: colors.backgroundChart,
      }}
    >
      <Typography
        sx={{
          textAlign: "center",
          fontFamily: "Arial",
          fontSize: "24px",
          fontWeight: 400,
          padding: "8px 0 0 0",
          color: colors.textDark,
        }}
      >
        {chartTitle}
      </Typography>

      <CustomLegend />

      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 140, left: 20, bottom: 30 }}
        >
          <CartesianGrid vertical={false} trokeDasharray="" stroke={colors.gridLine} />
          <XAxis
            dataKey="year"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={xTicks}
            tick={{ fontSize: 12, fontFamily: "Arial" }}
            tickLine={{ stroke: colors.textPrimary }}
            axisLine={{ stroke: colors.textPrimary }}
            label={{
              value: "Year",
              position: "insideBottom",
              offset: -15,
              style: { fontSize: 16, fontFamily: "Arial", fontWeight: "bold" },
            }}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            allowDataOverflow={true}
            tick={{ fontSize: 12, fontFamily: "Arial" }}
            tickLine={{ stroke: colors.textPrimary }}
            axisLine={{ stroke: colors.textPrimary }}
            label={{
              value: "Temperature Change (\u00B0F)",
              angle: -90,
              position: "insideLeft",
              offset: 5,
              style: {
                fontSize: 16,
                fontFamily: "Arial",
                fontWeight: "bold",
                textAnchor: "middle",
              },
            }}
          />
          <Tooltip
            content={<CustomTooltip hiddenScenarios={hiddenScenarios} />}
          />

          <ReferenceLine y={0} stroke={colors.referenceLine} strokeWidth={4} />

          {/* Render scenario bands: each uses stacked areas */}
          {SCENARIO_BANDS.map((band) => {
            if (hiddenScenarios.has(band.key)) return null;
            return (
              <Area
                key={band.key}
                dataKey={band.rangeKey}
                stackId={band.key}
                baseValue="dataMin"
                type="linear"
                fill="none"
                stroke="none"
                legendType="none"
                isAnimationActive={false}
                tooltipType="none"
                hide
              />
            );
          })}

          {SCENARIO_BANDS.map((band) => {
            if (hiddenScenarios.has(band.key)) return null;
            const bandData = data.map((d) => {
              if (d[band.lower] === null || d[band.rangeKey] === null) {
                return {
                  ...d,
                  [`${band.key}_base`]: null,
                  [band.rangeKey]: null,
                };
              }
              return {
                ...d,
                [`${band.key}_base`]: d[band.lower],
              };
            });
            // We render the actual Area elements using the data directly
            return null;
          })}

          {/* Render each scenario as a pair: invisible base + visible range area */}
          {SCENARIO_BANDS.map((band) => {
            if (hiddenScenarios.has(band.key)) return null;
            return [
              <Area
                key={`${band.key}_lower`}
                dataKey={band.lower}
                stackId={band.key}
                type="linear"
                fill="transparent"
                stroke="none"
                fillOpacity={0}
                isAnimationActive={false}
                legendType="none"
                tooltipType="none"
              />,
              <Area
                key={`${band.key}_range`}
                dataKey={band.rangeKey}
                stackId={band.key}
                type="linear"
                fill={band.fillColor}
                stroke="none"
                fillOpacity={1}
                isAnimationActive={false}
                legendType="none"
                name={band.name}
              />,
            ];
          })}

          {/* Observations line on top of everything */}
          {!hiddenScenarios.has("obs") && (
            <Line
              dataKey="obs"
              type="linear"
              stroke={colors.textPrimary}
              strokeWidth={2}
              dot={{ r: 2, fill: colors.textPrimary }}
              connectNulls={false}
              isAnimationActive={false}
              legendType="none"
              name="Observations"
            />
          )}

          {/* Hidden legend - we use our custom one */}
          <Legend content={() => null} />
        </ComposedChart>
      </ResponsiveContainer>

      <BracketOverlay
        bracketData={bracketData}
        yDomain={yDomain}
        chartRef={chartContainerRef}
        hiddenScenarios={hiddenBracketScenarios}
      />
    </Box>
  );
}
