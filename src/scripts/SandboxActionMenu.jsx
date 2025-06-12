// floating action buttons for downloading and switching bar and averages.
import { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import TimelineIcon from "@mui/icons-material/Timeline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";

import SandboxCustomSizeExport from "./SandboxCustomSizeExport.jsx";
import SandboxSumbitFigure from "./SandboxSumbitFigure.jsx";

// const useStyles = makeStyles((theme) => ({
//   sandboxExportsButtonBox: {
//     justifyContent: "flex-end",
//     [theme.breakpoints.down("xs")]: {
//       margin: theme.spacing(1),
//       justifyContent: "unset",
//     },
//   },
//   sandboxSelectedButton: {
//     justifyContent: "flex-end",
//     [theme.breakpoints.down("xs")]: {
//       justifyContent: "unset",
//     },
//   },
//   fabsvg: {
//     minWidth: "75px",
//     margin: theme.spacing(1),
//     [theme.breakpoints.down("md")]: {
//       fontSize: ".80rem",
//     },
//     [theme.breakpoints.down("xs")]: {
//       marginTop: theme.spacing(1),
//       marginBottom: theme.spacing(1),
//       marginLeft: theme.spacing(0),
//       marginRight: theme.spacing(0),
//       width: "100%",
//     },
//   },
//   fabsvgLeft: {
//     minWidth: "150px",
//     marginTop: theme.spacing(1),
//     marginBottom: theme.spacing(1),
//     marginLeft: theme.spacing(1),
//     marginRight: theme.spacing(0),
//     borderTopRightRadius: "0px",
//     borderBottomRightRadius: "0px",
//     [theme.breakpoints.down("md")]: {
//       minWidth: "135px",
//       fontSize: ".85rem",
//     },
//     [theme.breakpoints.down("xs")]: {
//       minWidth: "unset",
//       marginTop: theme.spacing(1),
//       marginBottom: theme.spacing(0),
//       marginLeft: theme.spacing(0),
//       marginRight: theme.spacing(1),
//       width: "100%",
//     },
//   },
//   fabsvgCenter: {
//     minWidth: "150px",
//     marginTop: theme.spacing(1),
//     marginBottom: theme.spacing(1),
//     marginLeft: theme.spacing(0),
//     marginRight: theme.spacing(0),
//     borderRadius: "0px",
//     [theme.breakpoints.down("md")]: {
//       minWidth: "135px",
//       fontSize: ".85rem",
//     },
//     [theme.breakpoints.down("xs")]: {
//       minWidth: "unset",
//       marginTop: theme.spacing(0),
//       marginBottom: theme.spacing(0),
//       marginLeft: theme.spacing(0),
//       marginRight: theme.spacing(1),
//       width: "100%",
//     },
//   },
//   fabsvgRight: {
//     minWidth: "150px",
//     marginTop: theme.spacing(1),
//     marginBottom: theme.spacing(1),
//     marginLeft: theme.spacing(0),
//     marginRight: theme.spacing(1),
//     borderTopLeftRadius: "0px",
//     borderBottomLeftRadius: "0px",
//     [theme.breakpoints.down("md")]: {
//       minWidth: "135px",
//       fontSize: ".85rem",
//     },
//     [theme.breakpoints.down("xs")]: {
//       minWidth: "unset",
//       marginTop: theme.spacing(0),
//       marginBottom: theme.spacing(1),
//       marginLeft: theme.spacing(0),
//       marginRight: theme.spacing(1),
//       width: "100%",
//     },
//   },
//   MenuItem: {
//     textDecoration: "underline",
//   },
//   sandboxExportsButtonBoxForm: {
//     flexDirection: "inherit",
//     justifyContent: "flex-end",
//     [theme.breakpoints.down("xs")]: {
//       flexDirection: "column",
//       width: "100%",
//     },
//   },
//   sandboxExportsButtonBoxFormLabel: {
//     position: "absolute",
//     left: "45%",
//     top: theme.spacing(-1.25),
//     fontSize: "0.75rem",
//     color: "#5C5C5C",
//   },
//   toolTip: {
//     padding: theme.spacing(2),
//     fontSize: "1rem",
//   },
// }));

export default function Selector(props) {
  const theme = useTheme();
  const {
    handleSwtichYearlyToLinea,
    handleSwtichAverageAndYearlya,
    handleSwtichMovingAverageAndYearlya,
    handleDownloadChartAsCSVa,
    handleDownloadChartAsPNGa,
    handleDownloadChartAsSVGa,
    lineChart,
  } = props;

  const [openCustomSizeSVG, setOpenCustomSizeSVG] = useState(false);
  const [openCustomSizePNG, setOpenCustomSizePNG] = useState(false);
  const [openSubmitFigure, setOpenSubmitFigure] = useState(false);

  const setSelected = (whichchart, me) => {
    switch (lineChart) {
      case "year":
        // yearly the line chart average is the bar chart
        if (me === lineChart) {
          return "sandbox-start-icon-selected";
        }
        return "sandbox-start-icon-not-selected";
      case "avg":
        // average the line chart yearly is the bar chart
        if (me === lineChart) {
          return "sandbox-start-icon-selected";
        }
        return "sandbox-start-icon-not-selected";
      case "mavg":
        // moving average the line chart yearly is the bar chart
        if (me === lineChart) {
          return "sandbox-start-icon-selected";
        }
        return "sandbox-start-icon-not-selected";
      default:
        // yearly the line chart average is the bar chart
        if (me === lineChart) {
          return "sandbox-start-icon-selected";
        }
        return "sandbox-start-icon-not-selected";
    }
  };

  const handleSwtichAverageAndYearly = (event) => {
    handleSwtichAverageAndYearlya(event.target.value);
  };

  const handleSwtichMovingAverageAndYearly = (event) => {
    handleSwtichMovingAverageAndYearlya(event.target.value);
  };

  const handleSwtichYearlyToLine = (event) => {
    handleSwtichYearlyToLinea(event.target.value);
  };

  const handleDownloadChartAsPNG = (svgSelector, width, height) => {
    handleDownloadChartAsPNGa(svgSelector, width, height);
  };

  const handleDownloadChartAsCSV = (event) => {
    handleDownloadChartAsCSVa();
  };

  const handleDownloadChartAsSVG = (svgSelector, width, height) => {
    handleDownloadChartAsSVGa(svgSelector, width, height);
  };

  // handles open of sumbit figure
  const handleOpenSubmitFigure = () => {
    setOpenSubmitFigure(true);
  };

  // handles close of custom size export
  const handleCloseSubmitFigure = () => {
    setOpenSubmitFigure(false);
  };

  // handles open of custom size export
  const handleCustomSizeOpenSVG = () => {
    window.dispatchEvent(new Event("resize"));
    setOpenCustomSizeSVG(true);
  };

  // handles close of custom size export
  const handleCustomSizeCloseSVG = () => {
    setOpenCustomSizeSVG(false);
  };

  // handles close of custom size export
  const handleCustomSizeOpenPNG = () => {
    window.dispatchEvent(new Event("resize"));
    setOpenCustomSizePNG(true);
  };

  // handles close of custom size export
  const handleCustomSizeClosePNG = () => {
    setOpenCustomSizePNG(false);
  };

  return (
    <Grid container spacing={0} justify="flex-end" direction={"row"}>
      <Grid size={{ xs: 12, sm: 12, md: 6 }} width="100%">
        <Box
          sx={{
            justifyContent: "flex-end",
            [theme.breakpoints.down("xs")]: {
              margin: theme.spacing(1),
              justifyContent: "unset",
            },
          }}
          fontWeight="fontWeightBold"
          mt={1}
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
        >
          <FormControl
            component="fieldset"
            variant="outlined"
            sx={{
              flexDirection: "inherit",
              justifyContent: "flex-end",
              [theme.breakpoints.down("xs")]: {
                flexDirection: "column",
                width: "100%",
              },
            }}
          >
            <FormLabel
              component="legend"
              sx={{
                position: "absolute",
                left: "45%",
                top: theme.spacing(-1.25),
                fontSize: "0.75rem",
                color: "#5C5C5C",
              }}
            >
              Data Display
            </FormLabel>
            <Tooltip
              title={
                "Yearly: Displays data as five-year averages with trendlines showing annual averages and the average for the entire dataset."
              }
              aria-label={
                "Yearly: Displays data as five-year averages with trendlines showing annual averages and the average for the entire dataset."
              }
              placement="bottom"
              TransitionComponent={Fade}
              enterNextDelay={750}
              arrow
              sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
            >
              <Button
                onClick={handleSwtichYearlyToLine}
                classes={{ root: `${setSelected(lineChart, "year")}` }}
                variant="contained"
                color="default"
                startIcon={<TimelineIcon />}
                sx={{
                  minWidth: "150px",
                  marginTop: theme.spacing(1),
                  marginBottom: theme.spacing(1),
                  marginLeft: theme.spacing(1),
                  marginRight: theme.spacing(0),
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "0px",
                  [theme.breakpoints.down("md")]: {
                    minWidth: "135px",
                    fontSize: ".85rem",
                  },
                  [theme.breakpoints.down("xs")]: {
                    minWidth: "unset",
                    marginTop: theme.spacing(1),
                    marginBottom: theme.spacing(0),
                    marginLeft: theme.spacing(0),
                    marginRight: theme.spacing(1),
                    width: "100%",
                  },
                }}
              >
                Yearly
              </Button>
            </Tooltip>
            <Tooltip
              title={
                "Average: Displays data as annual averages with trendlines showing five-year averages and the average for the entire dataset."
              }
              aria-label={
                "Average: Displays data as annual averages with trendlines showing five-year averages and the average for the entire dataset."
              }
              placement="bottom"
              TransitionComponent={Fade}
              enterNextDelay={750}
              arrow
              sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
            >
              <Button
                onClick={handleSwtichAverageAndYearly}
                classes={{ root: `${setSelected(lineChart, "avg")}` }}
                sx={{
                  minWidth: "150px",
                  marginTop: theme.spacing(1),
                  marginBottom: theme.spacing(1),
                  marginLeft: theme.spacing(0),
                  marginRight: theme.spacing(0),
                  borderRadius: "0px",
                  [theme.breakpoints.down("md")]: {
                    minWidth: "135px",
                    fontSize: ".85rem",
                  },
                  [theme.breakpoints.down("xs")]: {
                    minWidth: "unset",
                    marginTop: theme.spacing(0),
                    marginBottom: theme.spacing(0),
                    marginLeft: theme.spacing(0),
                    marginRight: theme.spacing(1),
                    width: "100%",
                  },
                }}
                variant="contained"
                color="default"
                startIcon={<TimelineIcon />}
              >
                Average
              </Button>
            </Tooltip>
            <Tooltip
              title={
                "Moving Average: Displays data as annual averages with trendlines showing five-year moving averages and the average for the entire dataset."
              }
              aria-label={
                "Moving Average: Displays data as annual averages with trendlines showing five-year moving averages and the average for the entire dataset."
              }
              placement="bottom"
              TransitionComponent={Fade}
              enterNextDelay={750}
              arrow
              sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
            >
              <Button
                onClick={handleSwtichMovingAverageAndYearly}
                classes={{ root: `${setSelected(lineChart, "mavg")}` }}
                variant="contained"
                color="default"
                startIcon={<TimelineIcon />}
                sx={{
                  minWidth: "150px",
                  marginTop: theme.spacing(1),
                  marginBottom: theme.spacing(1),
                  marginLeft: theme.spacing(0),
                  marginRight: theme.spacing(1),
                  borderTopLeftRadius: "0px",
                  borderBottomLeftRadius: "0px",
                  [theme.breakpoints.down("md")]: {
                    minWidth: "135px",
                    fontSize: ".85rem",
                  },
                  [theme.breakpoints.down("xs")]: {
                    minWidth: "unset",
                    marginTop: theme.spacing(0),
                    marginBottom: theme.spacing(1),
                    marginLeft: theme.spacing(0),
                    marginRight: theme.spacing(1),
                    width: "100%",
                  },
                }}
              >
                Moving Average
              </Button>
            </Tooltip>
          </FormControl>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6 }} width="100%">
        <Box
          sx={{
            justifyContent: "flex-end",
            [theme.breakpoints.down("xs")]: {
              margin: theme.spacing(1),
              justifyContent: "unset",
            },
          }}
          fontWeight="fontWeightBold"
          mt={1}
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
        >
          <FormControl
            component="fieldset"
            variant="outlined"
            sx={{
              flexDirection: "inherit",
              justifyContent: "flex-end",
              [theme.breakpoints.down("xs")]: {
                flexDirection: "column",
                width: "100%",
              },
            }}
          >
            <FormLabel
              component="legend"
              sx={{
                position: "absolute",
                left: "45%",
                top: theme.spacing(-1.25),
                fontSize: "0.75rem",
                color: "#5C5C5C",
              }}
            >
              Export
            </FormLabel>
            <Tooltip
              title={"Export data in the current chart to Excel or CSV file."}
              aria-label={
                "Export data in the current chart to Excel or CSV file."
              }
              placement="bottom"
              TransitionComponent={Fade}
              enterNextDelay={750}
              arrow
              sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
            >
              <Button
                onClick={handleDownloadChartAsCSV}
                sx={{
                  minWidth: "75px",
                  margin: theme.spacing(1),
                  [theme.breakpoints.down("md")]: {
                    fontSize: ".80rem",
                  },
                  [theme.breakpoints.down("xs")]: {
                    marginTop: theme.spacing(1),
                    marginBottom: theme.spacing(1),
                    marginLeft: theme.spacing(0),
                    marginRight: theme.spacing(0),
                    width: "100%",
                  },
                }}
                variant="contained"
                color="default"
                startIcon={<SaveAltIcon />}
              >
                .CSV
              </Button>
            </Tooltip>
            <Tooltip
              title={
                "Export current chart for a report, social media post, or presentation."
              }
              aria-label={
                "Export current chart for a report, social media post, or presentation."
              }
              placement="bottom"
              TransitionComponent={Fade}
              enterNextDelay={750}
              arrow
              sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
            >
              <Button
                onClick={handleCustomSizeOpenPNG}
                sx={{
                  minWidth: "75px",
                  margin: theme.spacing(1),
                  [theme.breakpoints.down("md")]: {
                    fontSize: ".80rem",
                  },
                  [theme.breakpoints.down("xs")]: {
                    marginTop: theme.spacing(1),
                    marginBottom: theme.spacing(1),
                    marginLeft: theme.spacing(0),
                    marginRight: theme.spacing(0),
                    width: "100%",
                  },
                }}
                variant="contained"
                color="default"
                startIcon={<SaveAltIcon />}
              >
                .PNG
              </Button>
            </Tooltip>
            <SandboxCustomSizeExport
              open={openCustomSizePNG}
              handleCustomSizeClose={handleCustomSizeClosePNG}
              exportType={"PNG"}
              exportHeading={"Export chart to PNG"}
              exportFunc={handleDownloadChartAsPNG}
            />
            <Tooltip
              title={
                "Export current chart in vector a format, typically for a graphics team."
              }
              aria-label={
                "Export current chart in vector a format, typically for a graphics team."
              }
              placement="bottom"
              TransitionComponent={Fade}
              enterNextDelay={750}
              arrow
              sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
            >
              <Button
                onClick={handleCustomSizeOpenSVG}
                sx={{
                  minWidth: "75px",
                  margin: theme.spacing(1),
                  [theme.breakpoints.down("md")]: {
                    fontSize: ".80rem",
                  },
                  [theme.breakpoints.down("xs")]: {
                    marginTop: theme.spacing(1),
                    marginBottom: theme.spacing(1),
                    marginLeft: theme.spacing(0),
                    marginRight: theme.spacing(0),
                    width: "100%",
                  },
                }}
                variant="contained"
                color="default"
                startIcon={<SaveAltIcon />}
              >
                .SVG
              </Button>
            </Tooltip>
            <SandboxCustomSizeExport
              open={openCustomSizeSVG}
              handleCustomSizeClose={handleCustomSizeCloseSVG}
              exportType={"SVG"}
              exportHeading={"Export chart to SVG"}
              exportFunc={handleDownloadChartAsSVG}
            />
            <Tooltip
              title={"Once the figure is ready, submit it to the TSU."}
              aria-label={"Once the figure is ready, submit it to the TSU."}
              placement="bottom"
              TransitionComponent={Fade}
              enterNextDelay={750}
              arrow
              sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
            >
              <Button
                onClick={handleOpenSubmitFigure}
                sx={{
                  minWidth: "75px",
                  margin: theme.spacing(1),
                  [theme.breakpoints.down("md")]: {
                    fontSize: ".80rem",
                  },
                  [theme.breakpoints.down("xs")]: {
                    marginTop: theme.spacing(1),
                    marginBottom: theme.spacing(1),
                    marginLeft: theme.spacing(0),
                    marginRight: theme.spacing(0),
                    width: "100%",
                  },
                }}
                variant="contained"
                color="default"
                startIcon={<MailOutlineIcon />}
              >
                To TSU
              </Button>
            </Tooltip>
            <SandboxSumbitFigure
              open={openSubmitFigure}
              handleCloseFigure={handleCloseSubmitFigure}
            />
          </FormControl>
        </Box>
      </Grid>
    </Grid>
  );
}

Selector.propTypes = {
  handleSwtichYearlyToLinea: PropTypes.func,
  handleSwtichAverageAndYearlya: PropTypes.func,
  handleSwtichMovingAverageAndYearlya: PropTypes.func,
  handleDownloadChartAsCSVa: PropTypes.func,
  handleDownloadChartAsPNGa: PropTypes.func,
  handleDownloadChartAsSVGa: PropTypes.func,
  lineChart: PropTypes.string,
  onChange: PropTypes.func,
};
