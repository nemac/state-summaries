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
import config from "../configs/config.js";

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
    borderRadius: "8px",
    width: "250px",
    height: "74px",
    border: "1px solid #707070",
    backgroundColor: "#FAFAFA",
    textTransform: "none",
    justifyContent: "flex-start",
    display: "flex",
    alignItems: "center",
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
            sx={{ fontWeight: 600 }}
          >
            Climate Variable and Seasonality
          </Typography>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: "#5C5C5C" }}>
          Choose the Climate Variable and Seasonality
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Charts
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Historical Annual Extremes
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <ThermostatIcon sx={{ color: "#5C5C5C", fontSize: "1.2rem" }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                      sx={{ color: "#003366", fontWeight: 500 }}
                    >
                      {option.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <ThunderstormIcon
                  sx={{ color: "#5C5C5C", fontSize: "1.2rem" }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                      sx={{ color: "#003366", fontWeight: 500 }}
                    >
                      {option.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Historical Seasonality
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FormControl sx={{ minWidth: 250, mb: 2 }}>
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
                    sx={{ color: "#003366", fontWeight: 500 }}
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
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Observed and Projected
            </Typography>
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
                    sx={{ color: "#003366", fontWeight: 500 }}
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
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Maps
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Annual
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {config.mapsAnnualOptions.map((option) => (
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
                    sx={{ color: "#003366", fontWeight: 500 }}
                  >
                    {option.label}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Seasonality
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FormControl sx={{ minWidth: 250, mb: 2 }}>
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
                    sx={{ color: "#003366", fontWeight: 500 }}
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
