import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import { useNavigate } from "react-router-dom";
import { colors } from "../theme";

export default function About() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: colors.white,
        color: colors.textSecondary,
        height: "calc(100vh - 16px)",
        margin: "16px",
        overflowY: "auto",
        [theme.breakpoints.down("xs")]: {
          overflow: "scroll",
        },
      }}
    >
      {/* Header area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "0 16px",
          paddingTop: "16px",
          paddingBottom: "8px",
        }}
      >
        {/* Return to Data Explorer link */}
        <Box
          role="button"
          tabIndex={0}
          onClick={() => navigate("/")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/");
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            color: colors.primary,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: "1.4rem" }} />
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 500,
              color: colors.primary,
            }}
          >
            Return to Data Explorer
          </Typography>
        </Box>
      </Box>

      {/* Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          margin: "0 16px",
          paddingBottom: "16px",
          borderBottom: `2px solid ${colors.border}`,
        }}
      >
        <InsertChartOutlinedIcon
          sx={{
            color: colors.textPrimary,
            fontSize: "2.5rem",
            backgroundColor: colors.white,
            borderRadius: "30px",
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            color: colors.textPrimary,
          }}
        >
          About the State Climate Summaries Data Explorer
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          margin: "0 16px",
          maxWidth: "960px",
          paddingTop: "24px",
          paddingBottom: "48px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Overview
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "16px",
            color: colors.textSecondary,
          }}
        >
          This Data Explorer is a companion to the{" "}
          <Link
            href="https://statesummaries.ncics.org/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: colors.primary }}
          >
            State Climate Summaries
          </Link>
          , which provide information to support climate-related
          decision-making. Created to meet a demand for state-level information
          following the publication of the Third National Climate Assessment
          (2014), the State Climate Summaries first appeared in 2017, with a
          second version published in 2022. The Data Explorer was created to
          accompany the third version, released in the summer of 2026.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "32px",
            color: colors.textSecondary,
          }}
        >
          The State Climate Summaries are produced by the{" "}
          <Link
            href="https://ncics.org/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: colors.primary }}
          >
            North Carolina Institute for Climate Studies (NCICS)
          </Link>
          , which is part of North Carolina State University. The Data Explorer
          was developed by NCICS in collaboration with the{" "}
          <Link
            href="https://go.unca.edu/nemac/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: colors.primary }}
          >
            National Environmental Mapping and Applications Center (NEMAC)
          </Link>{" "}
          at UNC Asheville.
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Features
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "16px",
            color: colors.textSecondary,
          }}
        >
          The Data Explorer allows users to generate customized figures by
          selecting a desired metric and geographic area.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "8px",
            color: colors.textSecondary,
          }}
        >
          The tool features a suite of observed temperature and precipitation
          metrics presented in a similar format to charts featured in the State
          Climate Summaries, including the following:
        </Typography>
        <Box
          component="ul"
          sx={{
            lineHeight: 1.8,
            marginTop: 0,
            marginBottom: "16px",
            paddingLeft: "24px",
            color: colors.textSecondary,
          }}
        >
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            annual and seasonal average temperature, as well as average minimum
            and maximum temperature;
          </Typography>
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            annual number of days or nights that reach certain temperature
            thresholds (such as days 100°F or warmer, nights 0°F or colder, or
            nights when the temperature did not drop below 80°F);
          </Typography>
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            total annual and seasonal precipitation;
          </Typography>
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            and annual number of extreme precipitation events (such as the
            number of days with at least 3 inches of precipitation).
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "16px",
            color: colors.textSecondary,
          }}
        >
          In addition to these historical metrics, the tool also allows users to
          view future climate projections by generating annual average
          temperature charts and annual and seasonal precipitation maps under
          four possible scenarios associated with different levels of future
          greenhouse gas emissions—low, intermediate, higher, and very high
          emissions.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "32px",
            color: colors.textSecondary,
          }}
        >
          Data are available for all 50 states plus Puerto Rico. The tool also
          allows users to generate data by{" "}
          <Link
            href="https://www.ncei.noaa.gov/access/monitoring/reference-maps/us-climate-regions"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: colors.primary }}
          >
            US Climate Region
          </Link>
          , as well as for the contiguous United States as a whole. Note that
          some metrics are not available for all regions due to data limitations
          and the fact that some thresholds are not applicable at certain
          locations (e.g., 100°F days are extremely rare in Alaska). In some
          cases, data may not exactly match the figures as shown in the State
          Climate Summaries due to dataset and quality control updates.
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Get Started
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "16px",
            color: colors.textSecondary,
          }}
        >
          The best way to see what the Data Explorer offers is to try it out:
          choose a state or region from the first drop-down menu and a metric
          from the second; the chart or map will immediately appear. When you
          hover over a line or bar on a graph, precise data for a particular
          year or date range will pop up.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "32px",
            color: colors.textSecondary,
          }}
        >
          If you click on the “Save Chart/Data” button, you can download the
          chart or map as a PNG or SVG file or the underlying data as a CSV.
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Additional Information
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "16px",
            color: colors.textSecondary,
          }}
        >
          For more information about data, methods, scenarios, and more, please
          view the technical details{" "}
          <Link
            href="https://data-explorer.nemac.org/tempData/sample-local-pdf.pdf"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: colors.primary }}
          >
            here
          </Link>
          . For additional questions please contact{" "}
          <Link
            href="mailto:info-state-summaries@ncics.org"
            sx={{ color: colors.primary }}
          >
            info-state-summaries@ncics.org
          </Link>
          .
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            color: colors.textSecondary,
          }}
        >
          Terms of Reuse: Figures generated by the Data Explorer are copyright
          protected. Reuse is permitted under the terms of CC BY-SA 4.0, the
          Creative Commons Attribution–ShareAlike 4.0 International license.
          Visit{" "}
          <Link
            href="https://creativecommons.org/licenses/by-sa/4.0/legalcode.en"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: colors.primary }}
          >
            https://creativecommons.org/licenses/by-sa/4.0/legalcode.en
          </Link>{" "}
          for more information on this license.
        </Typography>
      </Box>
    </Box>
  );
}
