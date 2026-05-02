import React from "react";
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
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import config from "../configs/config.js";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import MegaMenuButton from "./MegaMenuButton.jsx";
import { colors } from "../theme";

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

  const cancelButtonStyle = {
    borderRadius: "1px",
    border: `1px solid ${colors.primary}`,
    padding: "4px 8px",
    gap: "4px",
    color: colors.primary,
    backgroundColor: colors.white,
    textTransform: "none",
    "&:hover": {
      backgroundColor: colors.backgroundButtonHover,
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
            sx={{ fontWeight: 700, color: colors.primary, fontSize: "40px" }}
          >
            Climate Observations and Projections
          </Typography>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <InsertChartOutlinedIcon
              sx={{ color: colors.primaryDark, fontSize: "50px" }}
            />
            <Typography
              sx={{
                fontWeight: 600,
                color: colors.primaryDark,
                fontSize: "32px",
              }}
            >
              Charts
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              ml={2}
              mr={2}
              mb={2}
              sx={{
                fontWeight: 600,
                color: colors.textSecondary,
                fontSize: "24px",
              }}
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
                <ThermostatIcon
                  sx={{ color: colors.textSecondary, fontSize: "1.2rem" }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: colors.textTertiary,
                    fontSize: "16px",
                  }}
                >
                  Temperature
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {config.temperatureOptions.map((option) => (
                  <MegaMenuButton
                    key={option.value}
                    icon={
                      <ThermostatIcon
                        sx={{ color: colors.navy, fontSize: "1.5rem" }}
                      />
                    }
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.label}
                  </MegaMenuButton>
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
                  sx={{ color: colors.textSecondary, fontSize: "1.2rem" }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: colors.textTertiary,
                    fontSize: "16px",
                  }}
                >
                  Precipitation
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {config.precipitationOptions.map((option) => (
                  <MegaMenuButton
                    key={option.value}
                    icon={
                      <ThunderstormIcon
                        sx={{ color: colors.navy, fontSize: "1.5rem" }}
                      />
                    }
                    onClick={() =>
                      handleOptionSelect({
                        ...option,
                        season: "Annual (Jan-Dec)",
                      })
                    }
                  >
                    {option.label}
                  </MegaMenuButton>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                ml={2}
                mr={2}
                sx={{
                  fontWeight: 600,
                  color: colors.textSecondary,
                  fontSize: "24px",
                }}
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
                    color: colors.primary,
                    backgroundColor: colors.backgroundDropdown,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.borderMedium,
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
                <MegaMenuButton
                  key={option.value}
                  icon={
                    option.icon === "Precipitation" ? (
                      <ThunderstormIcon
                        sx={{ color: colors.navy, fontSize: "1.5rem" }}
                      />
                    ) : (
                      <ThermostatIcon
                        sx={{ color: colors.navy, fontSize: "1.5rem" }}
                      />
                    )
                  }
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
                  {option.getLabel
                    ? option.getLabel(selectedSeason.label)
                    : option.labelTemplate || option.label}
                </MegaMenuButton>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                ml={2}
                mr={2}
                sx={{
                  fontWeight: 600,
                  color: colors.textSecondary,
                  fontSize: "24px",
                }}
              >
                Temperature Projections
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {config.observedProjectedOptions.map((option) => (
                <MegaMenuButton
                  key={option.value}
                  icon={
                    <ThermostatIcon
                      sx={{ color: colors.navy, fontSize: "1.5rem" }}
                    />
                  }
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.label}
                </MegaMenuButton>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <MapOutlinedIcon
              sx={{ color: colors.primaryDark, fontSize: "50px" }}
            />
            <Typography
              sx={{
                fontWeight: 600,
                color: colors.primaryDark,
                fontSize: "32px",
              }}
            >
              Maps
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                ml={2}
                mr={2}
                sx={{
                  fontWeight: 600,
                  color: colors.textSecondary,
                  fontSize: "24px",
                }}
              >
                Precipitation Projections: Seasonality
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
                    color: colors.primary,
                    backgroundColor: colors.backgroundDropdown,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.borderMedium,
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
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <Box sx={{ flex: "none" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    marginLeft: "32px",
                  }}
                >
                  <QueryBuilderIcon
                    sx={{ color: colors.textSecondary, fontSize: "1.2rem" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: colors.textTertiary,
                      fontSize: "16px",
                    }}
                  >
                    Midcentury
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {config.mapsSeasonalityOptions.map((option) => (
                    <MegaMenuButton
                      key={option.label}
                      icon={
                        <ThunderstormIcon
                          sx={{ color: colors.navy, fontSize: "1.5rem" }}
                        />
                      }
                      onClick={() => handleOptionSelect(option)}
                    >
                      {option.getLabel
                        ? option.getLabel(selectedSeason.label)
                        : option.labelTemplate || option.label}
                    </MegaMenuButton>
                  ))}
                </Box>
              </Box>

              <Box sx={{ flex: "none" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    marginLeft: "32px",
                  }}
                >
                  <QueryBuilderIcon
                    sx={{ color: colors.textSecondary, fontSize: "1.2rem" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: colors.textTertiary,
                      fontSize: "16px",
                    }}
                  >
                    Late Century
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {config.mapsSeasonalityOptions.map((option) => (
                    <MegaMenuButton
                      key={option.label}
                      icon={
                        <ThunderstormIcon
                          sx={{ color: colors.navy, fontSize: "1.5rem" }}
                        />
                      }
                      onClick={() => handleOptionSelect(option)}
                    >
                      {option.getLabel
                        ? option.getLabel(selectedSeason.label)
                        : option.labelTemplate || option.label}
                    </MegaMenuButton>
                  ))}
                </Box>
              </Box>
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
