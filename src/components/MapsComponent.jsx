import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ObservedProjectedChart from "./ObservedProjectedChart.jsx";
import ZoomableImage from "./ZoomableImage.jsx";
import SandboxPlotRegion from "../scripts/SandboxPlotRegion.jsx";
import { colors } from "../theme";

const MapsComponent = ({
  showMapImage,
  chartType,
  useRechartsRenderer,
  rechartsData,
  rechartsBrackets,
  rechartsYDomain,
  chartTitle,
  chartData,
  chartLayout,
}) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      flexDirection="row"
      m={1}
      justifyContent="center"
      flex={1}
      flexGrow={3}
      sx={{
        height: "calc(100% - 10px)",
        [theme.breakpoints.down("sm")]: {
          height: "575px",
        },
      }}
    >
      {showMapImage ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 600, py: 4 }}>
            Title Placeholder
          </Typography>
          <Box sx={{ flex: 1, width: "85%", minHeight: 0 }}>
            <ZoomableImage
              src="/tempData/gergMap.png"
              alt="Change in Annual Precipitation Map"
            />
          </Box>
          <Typography variant="h4" sx={{ color: colors.textMuted, py: 4 }}>
            Legend Placeholder
          </Typography>
        </Box>
      ) : chartType === "recharts" && useRechartsRenderer ? (
        <ObservedProjectedChart
          data={rechartsData}
          bracketData={rechartsBrackets}
          yDomain={rechartsYDomain}
          chartTitle={chartTitle}
        />
      ) : (
        <SandboxPlotRegion plotlyData={chartData} plotlyLayout={chartLayout} />
      )}
    </Box>
  );
};

export default MapsComponent;
