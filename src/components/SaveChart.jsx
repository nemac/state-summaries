import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  Paper,
  IconButton,
  Link,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  CropFree as CropFreeIcon,
  Monitor as MonitorIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

import SaveAsPNGButton from "./SaveAsPNGButton";
import SaveAsCSVButton from "./SaveAsCSVButton";
import SaveAsSVGButton from "./SaveAsSVGButton";

const SaveChart = (props) => {
  const { chartData, region, location, climatevariable, period } = props;
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("PNG");
  const [width, setWidth] = useState("1000");
  const [height, setHeight] = useState("500");
  const [isCustomDims, setCustomDims] = useState(true);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    border: "2px solid #1976d2",
    borderRadius: 2,
    boxShadow: 24,
    p: 0,
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    p: 2,
    borderBottom: "1px solid #e0e0e0",
  };

  const formatButtonStyle = (format) => ({
    flex: 1,
    py: 1.5,
    backgroundColor: selectedFormat === format ? "#1976d2" : "white",
    color: selectedFormat === format ? "white" : "#1976d2",
    border: "1px solid #1976d2",
    // "&:hover": {
    //   backgroundColor: selectedFormat === format ? "#1565c0" : "#f5f5f5",
    // },
  });

  return (
    <>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleOpen}
        sx={{
          backgroundColor: "#666",
          "&:hover": { backgroundColor: "#555" },
        }}
      >
        Save Chart
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="save-chart-modal"
        aria-describedby="save-chart-description"
      >
        <Box sx={modalStyle}>
          <Box sx={headerStyle}>
            <DownloadIcon sx={{ color: "#666" }} />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Save Chart
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Choose the height, width, or if you want the chart data
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              Have questions about the methodologies that went into the data in
              this chart?{" "}
              <Link href="#" sx={{ color: "#1976d2" }}>
                Learn more
              </Link>
            </Typography>

            <Box sx={{ display: "flex", gap: 0, mb: 3 }}>
              <Button
                sx={{
                  ...formatButtonStyle("PNG"),
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
                onClick={() => setSelectedFormat("PNG")}
              >
                chart-image.PNG
              </Button>
              <Button
                sx={{
                  ...formatButtonStyle("SVG"),
                  borderRadius: 0,
                  borderLeft: "none",
                  borderRight: "none",
                }}
                onClick={() => setSelectedFormat("SVG")}
              >
                chart-image.SVG
              </Button>
              <Button
                sx={{
                  ...formatButtonStyle("CSV"),
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                }}
                onClick={() => setSelectedFormat("CSV")}
              >
                Chart-data.CSV
              </Button>
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
                  border: "1px solid #e0e0e0",
                  cursor: "pointer",
                  backgroundColor: isCustomDims ? "#f9f9f9" : "#1976d2",
                  // "&:hover": { backgroundColor: "#f9f9f9" },
                }}
              >
                <MonitorIcon
                  sx={{
                    fontSize: 40,
                    color: isCustomDims ? "#1976d2" : "white",
                    mb: 1,
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    color: isCustomDims ? "#1976d2" : "white",
                    fontWeight: "bold",
                  }}
                >
                  PRESENTATION (12:9)
                </Typography>
              </Paper>
            )}
            {selectedFormat !== "CSV" && (
              <Accordion
                defaultExpanded={false}
                sx={{
                  mb: 3,
                  backgroundColor: isCustomDims ? "#1976d2" : "white",
                  color: "white",
                  boxShadow: "none",
                  border: "none",
                  "&:before": {
                    display: "none",
                  },
                  // "& .MuiAccordionSummary-root": {
                  //   backgroundColor: isCustomDims ? "#1976d2" : "white",
                  //   color: isCustomDims ? "#1976d2" : "white",
                  //   minHeight: 56,
                  //   "&.Mui-expanded": {
                  //     minHeight: 56,
                  //   },
                  // },
                  // "& .MuiAccordionSummary-content": {
                  //   justifyContent: "center",
                  //   alignItems: "center",
                  //   margin: 0,
                  //   "&.Mui-expanded": {
                  //     margin: 0,
                  //   },
                  // },
                  // "& .MuiAccordionDetails-root": {
                  //   backgroundColor: "#1976d2",
                  //   color: "white",
                  //   paddingTop: 0,
                  // },
                  // "& .MuiSvgIcon-root": {
                  //   color: isCustomDims ? "white" : "#1976d2",
                  // },
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
                        color: isCustomDims ? "white" : "#1976d2",
                      }}
                    >
                      CUSTOM DIMENSIONS
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{ backgroundColor: isCustomDims ? "#1976d2" : "white" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      backgroundColor: isCustomDims ? "#1976d2" : "white",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: "bold",
                          color: isCustomDims ? "white" : "#1976d2",
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
                                sx={{ color: "rgba(255,255,255,0.7)" }}
                              >
                                pixels
                              </Typography>
                            ),
                            sx: {
                              backgroundColor: "white",
                              borderRadius: 1,
                              "& input": {
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                                color: "#1976d2",
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
                          color: isCustomDims ? "white" : "#1976d2",
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
                                sx={{ color: "rgba(255,255,255,0.7)" }}
                              >
                                pixels
                              </Typography>
                            ),
                            sx: {
                              backgroundColor: "white",
                              borderRadius: 1,
                              "& input": {
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                                color: "#1976d2",
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
                    widthARG={width}
                    heightARG={height}
                    chartData={chartData}
                    screenSize={{ width: 1000, height: 500 }}
                  />
                )}
                {selectedFormat === "SVG" && (
                  <SaveAsSVGButton
                    width={width}
                    height={height}
                    chartData={chartData}
                    screenSize={{ width: 1000, height: 500 }}
                    region={region}
                    location={location}
                    climatevariable={climatevariable}
                    period={period}
                  />
                )}
                {selectedFormat === "CSV" && (
                  <SaveAsCSVButton
                    chartData={chartData}
                    region={region}
                    location={location}
                    climatevariable={climatevariable}
                    period={period}
                  />
                )}
              </Box>

              <Button
                variant="outlined"
                onClick={handleClose}
                sx={{
                  color: "#1976d2",
                  borderColor: "#1976d2",
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
