import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Download as DownloadIcon,
  CropFree as CropFreeIcon,
  Monitor as MonitorIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

import SaveAsPNGButton from "./SaveAsPNGButton";
import SaveAsCSVButton from "./SaveAsCSVButton";
import SaveAsSVGButton from "./SaveAsSVGButton";
import { colors } from "../theme";

// One of the three side-by-side format choices. aria-pressed tells screen
// readers which one is chosen, and the check mark shows it without relying
// on color alone.
const FormatButton = ({ isSelected, onSelect, label }) => (
  <Button
    aria-pressed={isSelected}
    startIcon={isSelected ? <CheckIcon aria-hidden="true" /> : null}
    onClick={onSelect}
    sx={{
      flex: 1,
      py: 1.5,
      px: 1,
      // Slightly smaller text keeps each label and its check mark on one line.
      fontSize: "0.8125rem",
      whiteSpace: "nowrap",
      "& .MuiButton-startIcon": { mr: 0.5 },
      // MUI's default focus glow is faint on the blue button, so draw a ring.
      "&.Mui-focusVisible": { outline: `3px solid ${colors.textDark}`, outlineOffset: 2 },
      backgroundColor: isSelected ? colors.buttonBlue : colors.white,
      color: isSelected ? colors.white : colors.buttonBlue,
      fontWeight: isSelected ? "bold" : "normal",
      border: `1px solid ${colors.buttonBlue}`,
      // Stacked on phones, so each button is rounded. Side by side on wider
      // screens, so only the outer corners are rounded.
      borderRadius: { xs: 2, sm: 0 },
      "&:first-of-type": { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
      "&:last-of-type": { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
      "&:not(:first-of-type)": { borderLeft: { sm: "none" } },
    }}
  >
    {label}
  </Button>
);

const SaveChart = (props) => {
  const { chartTitle, chartData, chartType, sx, renderExportChart } = props;
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("PNG");
  const [width, setWidth] = useState("1600");
  const [height, setHeight] = useState("1200");
  const [isCustomDims, setCustomDims] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // Fits a 320px-wide phone screen with a 16px gap on each side.
    width: "min(500px, calc(100vw - 32px))",
    // Pure white keeps the blue link and Done text above 4.5:1 contrast.
    bgcolor: colors.white,
    border: `2px solid ${colors.buttonBlue}`,
    borderRadius: 2,
    boxShadow: 24,
    p: 0,
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    p: 2,
    borderBottom: `1px solid ${colors.border}`,
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleOpen}
        sx={sx}
      >
        SAVE CHART/DATA
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="save-chart-modal"
        aria-describedby="save-chart-description"
      >
        <Box sx={modalStyle}>
          <Box sx={headerStyle}>
            <DownloadIcon sx={{ color: colors.textMuted }} />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold", color: colors.textDark }}
              >
                SAVE CHART/DATA
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textMuted }}>
                Choose the chart type and dimensions, or download data
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: colors.textMuted }}>
              Questions about data and methodologies?{" "}
              <Link
                href="/technical-details.pdf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Learn more about the data and methods (PDF, opens in a new tab)"
                sx={{ color: colors.buttonBlue }}
              >
                Learn more
              </Link>
            </Typography>

            <Box
              role="group"
              aria-label="File format"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 0 },
                mb: 3,
              }}
            >
              <FormatButton
                label="chart-image.PNG"
                isSelected={selectedFormat === "PNG"}
                onSelect={() => setSelectedFormat("PNG")}
              />
              <FormatButton
                label="chart-image.SVG"
                isSelected={selectedFormat === "SVG"}
                onSelect={() => setSelectedFormat("SVG")}
              />
              <FormatButton
                label="Chart-data.CSV"
                isSelected={selectedFormat === "CSV"}
                onSelect={() => setSelectedFormat("CSV")}
              />
            </Box>

            {selectedFormat !== "CSV" && (
              <Paper
                onClick={() => {
                  setWidth(1920);
                  setHeight(1440);
                  setCustomDims(false);
                }}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  textAlign: "center",
                  border: `1px solid ${colors.border}`,
                  cursor: "pointer",
                  backgroundColor: isCustomDims ? colors.backgroundButton : colors.buttonBlue,
                  // "&:hover": { backgroundColor: "#f9f9f9" },
                }}
              >
                <MonitorIcon
                  sx={{
                    fontSize: 40,
                    color: isCustomDims ? colors.buttonBlue : colors.white,
                    mb: 1,
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    color: isCustomDims ? colors.buttonBlue : colors.white,
                    fontWeight: "bold",
                  }}
                >
                  PRESENTATION (12:9)
                </Typography>
              </Paper>
            )}
            {selectedFormat !== "CSV" && (
              <Accordion
                expanded={isCustomDims ? true : false}
                defaultExpanded={false}
                sx={{
                  mb: 3,
                  backgroundColor: isCustomDims ? colors.buttonBlue : colors.white,
                  color: colors.white,
                  boxShadow: "none",
                  border: "none",
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="custom-dimensions-content"
                  id="custom-dimensions-header"
                  onClick={() => {
                    setCustomDims(true);
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <CropFreeIcon sx={{ mr: 1 }} />
                    <Typography
                      onClick={() => {
                        setCustomDims(true);
                      }}
                      sx={{
                        variant: "body1",
                        fontWeight: "bold",
                        color: isCustomDims ? colors.white : colors.buttonBlue,
                      }}
                    >
                      CUSTOM DIMENSIONS
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{ backgroundColor: isCustomDims ? colors.buttonBlue : colors.white }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      backgroundColor: isCustomDims ? colors.buttonBlue : colors.white,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: "bold",
                          color: isCustomDims ? colors.white : colors.buttonBlue,
                        }}
                      >
                        WIDTH
                      </Typography>
                      <TextField
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        variant="filled"
                        size="small"
                        slotProps={{
                          input: {
                            endAdornment: (
                              <Typography
                                variant="body2"
                                sx={{ color: colors.overlay.white70 }}
                              >
                                pixels
                              </Typography>
                            ),
                            sx: {
                              backgroundColor: colors.white,
                              borderRadius: 1,
                              "& input": {
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                                color: colors.buttonBlue,
                                "&:hover": { backgroundColor: colors.white },
                              },
                            },
                          },
                        }}
                        sx={{ width: "100%" }}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: "bold",
                          color: isCustomDims ? colors.white : colors.buttonBlue,
                        }}
                      >
                        HEIGHT
                      </Typography>
                      <TextField
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        variant="filled"
                        size="small"
                        slotProps={{
                          input: {
                            endAdornment: (
                              <Typography
                                variant="body2"
                                sx={{ color: colors.overlay.white70 }}
                              >
                                pixels
                              </Typography>
                            ),
                            sx: {
                              backgroundColor: colors.white,
                              borderRadius: 1,
                              "& input": {
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                                color: colors.buttonBlue,
                                "&:hover": { backgroundColor: colors.white },
                              },
                            },
                          },
                        }}
                        sx={{ width: "100%" }}
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {selectedFormat === "PNG" && (
                  <SaveAsPNGButton
                    chartTitle={chartTitle}
                    widthARG={width}
                    heightARG={height}
                    chartType={chartType}
                    renderExportChart={renderExportChart}
                  />
                )}
                {selectedFormat === "SVG" && (
                  <SaveAsSVGButton
                    widthARG={width}
                    heightARG={height}
                    chartTitle={chartTitle}
                    chartData={chartData}
                    chartType={chartType}
                  />
                )}
                {selectedFormat === "CSV" && (
                  <SaveAsCSVButton
                    chartTitle={chartTitle}
                    chartData={chartData}
                    chartType={chartType}
                  />
                )}
              </Box>

              <Button
                variant="outlined"
                onClick={handleClose}
                sx={{
                  color: colors.buttonBlue,
                  borderColor: colors.buttonBlue,
                  px: 3,
                  py: 1,
                }}
              >
                DONE
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SaveChart;
