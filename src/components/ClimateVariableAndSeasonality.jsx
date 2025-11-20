import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  Button,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import config from "../configs/config.js";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";

const ClimateVariableAndSeasonality = (props) => {
  const {
    open,
    onClose,
    onSelect,
    selectedSeason,
    setSelectedSeason,
    seasonOptions,
  } = props;

  const handleOptionSelect = (option) => {
    if (onSelect) {
      onSelect(option);
    }
    onClose();
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    maxWidth: "1200px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  const sectionTitleStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1,
    mt: 2,
  };

  const buttonStyle = {
    padding: "8px 12px",
    marginLeft: "32px",
    borderRadius: "8px",
    width: "250px",
    height: "74px",
    border: "1px solid #707070",
    backgroundColor: "#FAFAFA",
    textTransform: "none",
    justifyContent: "flex-start",
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    gap: 1,
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  };

  const cancelButtonStyle = {
    borderRadius: "1px",
    border: "1px solid #0379C8",
    padding: "4px 8px",
    gap: "4px",
    color: "#0379C8",
    backgroundColor: "#FFFFFF",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="climate-variable-modal-title"
      aria-describedby="climate-variable-modal-description"
    >
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            id="climate-variable-modal-title"
            variant="h5"
            component="h2"
            sx={{ fontWeight: 700, color: "#0379C8", fontSize: "40px" }}
          >
            Climate Variable and Seasonality
          </Typography>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          sx={{ fontWeight: 400, fontSize: "14px", mb: 2, color: "#5C5C5C" }}
        >
          Choose the Climate Variable and Seasonality
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <InsertChartOutlinedIcon
              sx={{ color: "#124086", fontSize: "32px", mr: 1 }}
            />
            <Typography
              sx={{ fontWeight: 600, color: "#124086", fontSize: "32px" }}
            >
              Charts
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              ml={2}
              mr={2}
              mb={2}
              sx={{ fontWeight: 600, color: "#5C5C5C", fontSize: "24px" }}
            >
              Historical Annual Extremes
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  marginLeft: "32px",
                }}
              >
                <ThermostatIcon sx={{ color: "#5C5C5C", fontSize: "1.2rem" }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#444444", fontSize: "16px" }}
                >
                  Temperature
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {config.temperatureOptions.map((option) => (
                  <Button
                    key={option.value}
                    sx={buttonStyle}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <ThermostatIcon
                      sx={{ color: "#003366", fontSize: "1.5rem" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#124086",
                      }}
                    >
                      {option.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  marginLeft: "32px",
                }}
              >
                <ThunderstormIcon
                  sx={{ color: "#5C5C5C", fontSize: "1.2rem" }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#444444", fontSize: "16px" }}
                >
                  Precipitation
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {config.precipitationOptions.map((option) => (
                  <Button
                    key={option.value}
                    sx={buttonStyle}
                    onClick={() =>
                      handleOptionSelect({
                        ...option,
                        season: "Annual (Jan-Dec)",
                      })
                    }
                  >
                    <ThunderstormIcon
                      sx={{ color: "#003366", fontSize: "1.5rem" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#124086",
                      }}
                    >
                      {option.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                ml={2}
                mr={2}
                sx={{ fontWeight: 600, color: "#5C5C5C", fontSize: "24px" }}
              >
                Historical Seasonality
              </Typography>
              <FormControl sx={{ minWidth: 250 }}>
                <Select
                  value={selectedSeason.value}
                  variant="outlined"
                  onChange={(e) =>
                    setSelectedSeason(
                      seasonOptions.find(
                        (season) => season.value === e.target.value,
                      ),
                    )
                  }
                  sx={{
                    backgroundColor: "#FAFAFA",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#707070",
                    },
                  }}
                >
                  {seasonOptions.map((season) => (
                    <MenuItem key={season.value} value={season.value}>
                      {season.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {config.historicalSeasonalityOptions.map((option) => (
                <Button
                  key={option.value}
                  sx={buttonStyle}
                  onClick={() =>
                    handleOptionSelect({
                      ...option,
                      season: selectedSeason,
                      seasonId: seasonOptions.find(
                        (s) => s.label === selectedSeason,
                      )?.value,
                    })
                  }
                >
                  {option.icon === "Precipitation" ? (
                    <ThunderstormIcon
                      sx={{ color: "#003366", fontSize: "1.5rem" }}
                    />
                  ) : (
                    <ThermostatIcon
                      sx={{ color: "#003366", fontSize: "1.5rem" }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "14px", fontWeight: 700, color: "#124086" }}
                  >
                    {option.getLabel
                      ? option.getLabel(selectedSeason.label)
                      : option.labelTemplate || option.label}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                ml={2}
                mr={2}
                sx={{ fontWeight: 600, color: "#5C5C5C", fontSize: "24px" }}
              >
                Observed and Projected
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {config.observedProjectedOptions.map((option) => (
                <Button
                  key={option.value}
                  sx={buttonStyle}
                  onClick={() => handleOptionSelect(option)}
                >
                  <ThermostatIcon
                    sx={{ color: "#003366", fontSize: "1.5rem" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "14px", fontWeight: 700, color: "#124086" }}
                  >
                    {option.label}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <MapOutlinedIcon
              sx={{ color: "#124086", fontSize: "32px", mr: 1 }}
            />
            <Typography
              sx={{ fontWeight: 600, color: "#124086", fontSize: "32px" }}
            >
              Maps
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                ml={2}
                mr={2}
                sx={{ fontWeight: 600, color: "#5C5C5C", fontSize: "24px" }}
              >
                Seasonality
              </Typography>
              <FormControl sx={{ minWidth: 250 }}>
                <Select
                  value={selectedSeason.value}
                  variant="outlined"
                  onChange={(e) =>
                    setSelectedSeason(
                      seasonOptions.find(
                        (season) => season.value === e.target.value,
                      ),
                    )
                  }
                  sx={{
                    backgroundColor: "#FAFAFA",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#707070",
                    },
                  }}
                >
                  {seasonOptions.map((season) => (
                    <MenuItem key={season.value} value={season.value}>
                      {season.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {config.mapsSeasonalityOptions.map((option) => (
                <Button
                  key={option.value}
                  sx={buttonStyle}
                  onClick={() => handleOptionSelect(option)}
                >
                  <ThunderstormIcon
                    sx={{ color: "#003366", fontSize: "1.5rem" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "14px", fontWeight: 700, color: "#124086" }}
                  >
                    {option.getLabel
                      ? option.getLabel(selectedSeason.label)
                      : option.labelTemplate || option.label}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button sx={cancelButtonStyle} onClick={onClose}>
            CANCEL
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

ClimateVariableAndSeasonality.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
};

export default ClimateVariableAndSeasonality;
