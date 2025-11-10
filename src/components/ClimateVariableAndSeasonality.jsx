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

const ClimateVariableAndSeasonality = ({ open, onClose, onSelect }) => {
  const [selectedHistoricalSeason, setSelectedHistoricalSeason] = useState("Annual (Jan–Dec)");
  const [selectedMapsSeason, setSelectedMapsSeason] = useState("Annual (Jan–Dec)");

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

  const seasonOptions = [
    { label: "Annual (Jan–Dec)", value: "annual" },
    { label: "Spring (Mar–May)", value: "spring" },
    { label: "Summer (Jun–Aug)", value: "summer" },
    { label: "Fall (Sep–Nov)", value: "fall" },
    { label: "Winter (Dec–Feb)", value: "winter" },
  ];

  // Historical Annual Extremes - Temperature options
  const temperatureOptions = [
    {
      label: "(Days) Max Temp Below 0°F",
      value: "tmax_0F",
      type: "temperature",
    },
    {
      label: "(Days) Max Temp Below 32°F",
      value: "tmax_32F",
      type: "temperature",
    },
    {
      label: "(Days) Max Temp Below 90°F",
      value: "tmax_90F",
      type: "temperature",
    },
    {
      label: "(Days) Max Temp Below 95°F",
      value: "tmax_95F",
      type: "temperature",
    },
    {
      label: "(Days) Max Temp Below 100°F",
      value: "tmax_100F",
      type: "temperature",
    },
    {
      label: "(Days) Min Temp Below 0°F",
      value: "tmin_0F",
      type: "temperature",
    },
    {
      label: "(Days) Min Temp Below 32°F",
      value: "tmin_32F",
      type: "temperature",
    },
    {
      label: "(Days) Min Temp Below 70°F",
      value: "tmin_70F",
      type: "temperature",
    },
    {
      label: "(Days) Min Temp Below 75°F",
      value: "tmin_75F",
      type: "temperature",
    },
    {
      label: "(Days) Min Temp Below 90°F",
      value: "tmin_90F",
      type: "temperature",
    },
  ];

  // Historical Annual Extremes - Precipitation options
  const precipitationOptions = [
    {
      label: "(Days) Precipitation > 1 inch",
      value: "prcp_1inch",
      type: "precipitation",
    },
    {
      label: "(Days) Precipitation > 2 inches",
      value: "prcp_2inch",
      type: "precipitation",
    },
    {
      label: "(Days) Precipitation > 2 inches",
      value: "prcp_2inch_alt",
      type: "precipitation",
    },
    {
      label: "(Days) Precipitation > 3 inches",
      value: "prcp_3inch",
      type: "precipitation",
    },
    {
      label: "(Days) Precipitation > 3 inches",
      value: "prcp_3inch_alt",
      type: "precipitation",
    },
  ];

  // Historical Seasonality options
  const historicalSeasonalityOptions = [
    { label: "Total Precipitation", value: "total_precipitation", icon: "precipitation" },
    { label: "Average Temperature", value: "avg_temp", icon: "temperature" },
    { label: "Average Max Temperature", value: "avg_max_temp", icon: "temperature" },
    { label: "Average Min Temperature", value: "avg_min_temp", icon: "temperature" },
  ];

  // Observed and Projected options
  const observedProjectedOptions = [
    { label: "Temperature", value: "temperature_obs_proj" },
  ];

  // Maps - Annual options
  const mapsAnnualOptions = [
    { label: "Change in Annual Precipitation", value: "change_annual_precip" },
  ];

  // Maps - Seasonality options (uses same dropdown as Historical Seasonality)
  const mapsSeasonalityOptions = [
    { label: "Change in Annual Precipitation", value: "change_seasonal_precip" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="climate-variable-modal-title"
      aria-describedby="climate-variable-modal-description"
    >
      <Box sx={modalStyle}>
        {/* Header with Title and Close Button */}
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

        {/* Charts Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Charts
            </Typography>
          </Box>

          {/* Historical Annual Extremes */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Historical Annual Extremes
            </Typography>

            {/* Temperature Section */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <ThermostatIcon sx={{ color: "#5C5C5C", fontSize: "1.2rem" }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Temperature
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {temperatureOptions.map((option) => (
                  <Button
                    key={option.value}
                    sx={buttonStyle}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <ThermostatIcon sx={{ color: "#003366", fontSize: "1.5rem" }} />
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

            {/* Precipitation Section */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <ThunderstormIcon sx={{ color: "#5C5C5C", fontSize: "1.2rem" }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Precipitation
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {precipitationOptions.map((option) => (
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
          </Box>

          {/* Historical Seasonality */}
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
                  value={selectedHistoricalSeason}
                  onChange={(e) => setSelectedHistoricalSeason(e.target.value)}
                  sx={{
                    backgroundColor: "#FAFAFA",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#707070",
                    },
                  }}
                >
                  {seasonOptions.map((season) => (
                    <MenuItem key={season.value} value={season.label}>
                      {season.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {historicalSeasonalityOptions.map((option) => (
                <Button
                  key={option.value}
                  sx={buttonStyle}
                  onClick={() =>
                    handleOptionSelect({ ...option, season: selectedHistoricalSeason })
                  }
                >
                  {option.icon === "precipitation" ? (
                    <ThunderstormIcon sx={{ color: "#003366", fontSize: "1.5rem" }} />
                  ) : (
                    <ThermostatIcon sx={{ color: "#003366", fontSize: "1.5rem" }} />
                  )}
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

          {/* Observed and Projected */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Observed and Projected
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {observedProjectedOptions.map((option) => (
                <Button
                  key={option.value}
                  sx={buttonStyle}
                  onClick={() => handleOptionSelect(option)}
                >
                  <ThermostatIcon sx={{ color: "#003366", fontSize: "1.5rem" }} />
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

        {/* Maps Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Maps
            </Typography>
          </Box>

          {/* Annual */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#5C5C5C" }}
            >
              Annual
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {mapsAnnualOptions.map((option) => (
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

          {/* Seasonality */}
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
                  value={selectedMapsSeason}
                  onChange={(e) => setSelectedMapsSeason(e.target.value)}
                  sx={{
                    backgroundColor: "#FAFAFA",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#707070",
                    },
                  }}
                >
                  {seasonOptions.map((season) => (
                    <MenuItem key={season.value} value={season.label}>
                      {season.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {mapsSeasonalityOptions.map((option) => (
                <Button
                  key={option.value}
                  sx={buttonStyle}
                  onClick={() =>
                    handleOptionSelect({ ...option, season: selectedMapsSeason })
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

        {/* Cancel Button */}
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