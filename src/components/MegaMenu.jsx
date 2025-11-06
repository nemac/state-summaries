import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MegaMenu = ({ open, onClose, onSelect }) => {
  const [searchValue, setSearchValue] = useState("");

  // Define all available locations for search
  const allLocations = [
    // United States options
    { label: "Contiguous United States", category: "United States", value: "contiguous" },
    { label: "Alaska", category: "United States", value: "alaska_us" },
    { label: "Hawai'i and US-Affiliated Pacific Islands", category: "United States", value: "hawaii_pacific" },
    { label: "US Caribbean", category: "United States", value: "caribbean" },
    // States
    { label: "Alabama", category: "States", value: "Alabama" },
    { label: "Alaska", category: "States", value: "Alaska" },
    { label: "Arizona", category: "States", value: "Arizona" },
    { label: "Arkansas", category: "States", value: "Arkansas" },
    { label: "California", category: "States", value: "California" },
    { label: "Colorado", category: "States", value: "Colorado" },
    { label: "Connecticut", category: "States", value: "Connecticut" },
    { label: "Delaware", category: "States", value: "Delaware" },
    { label: "Florida", category: "States", value: "Florida" },
    { label: "Georgia", category: "States", value: "Georgia" },
    { label: "Hawai'i", category: "States", value: "Hawaii" },
    { label: "Idaho", category: "States", value: "Idaho" },
    { label: "Illinois", category: "States", value: "Illinois" },
    { label: "Indiana", category: "States", value: "Indiana" },
    { label: "Iowa", category: "States", value: "Iowa" },
    { label: "Kansas", category: "States", value: "Kansas" },
    { label: "Kentucky", category: "States", value: "Kentucky" },
    { label: "Louisiana", category: "States", value: "Louisiana" },
    { label: "Maine", category: "States", value: "Maine" },
    { label: "Maryland", category: "States", value: "Maryland" },
    { label: "Massachusetts", category: "States", value: "Massachusetts" },
    { label: "Michigan", category: "States", value: "Michigan" },
    { label: "Minnesota", category: "States", value: "Minnesota" },
    { label: "Mississippi", category: "States", value: "Mississippi" },
    { label: "Missouri", category: "States", value: "Missouri" },
    { label: "Montana", category: "States", value: "Montana" },
    { label: "Nebraska", category: "States", value: "Nebraska" },
    { label: "Nevada", category: "States", value: "Nevada" },
    { label: "New Hampshire", category: "States", value: "New_Hampshire" },
    { label: "New Jersey", category: "States", value: "New_Jersey" },
    { label: "New Mexico", category: "States", value: "New_Mexico" },
    { label: "New York", category: "States", value: "New_York" },
    { label: "North Carolina", category: "States", value: "North_Carolina" },
    { label: "North Dakota", category: "States", value: "North_Dakota" },
    { label: "Ohio", category: "States", value: "Ohio" },
    { label: "Oklahoma", category: "States", value: "Oklahoma" },
    { label: "Oregon", category: "States", value: "Oregon" },
    { label: "Pennsylvania", category: "States", value: "Pennsylvania" },
    { label: "Rhode Island", category: "States", value: "Rhode_Island" },
    { label: "South Carolina", category: "States", value: "South_Carolina" },
    { label: "South Dakota", category: "States", value: "South_Dakota" },
    { label: "Tennessee", category: "States", value: "Tennessee" },
    { label: "Texas", category: "States", value: "Texas" },
    { label: "Utah", category: "States", value: "Utah" },
    { label: "Vermont", category: "States", value: "Vermont" },
    { label: "Virginia", category: "States", value: "Virginia" },
    { label: "Washington", category: "States", value: "Washington" },
    { label: "West Virginia", category: "States", value: "West_Virginia" },
    { label: "Wisconsin", category: "States", value: "Wisconsin" },
    { label: "Wyoming", category: "States", value: "Wyoming" },
    // Regions
    { label: "Alaska", category: "Regions", value: "alaska_region" },
    { label: "Hawai'i and US-Affiliated Pacific Islands", category: "Regions", value: "hawaii" },
    { label: "Northeast", category: "Regions", value: "northeast" },
    { label: "Northern Rockies and Plains", category: "Regions", value: "northern_rockies_plains" },
    { label: "Northwest", category: "Regions", value: "northwest" },
    { label: "Ohio Valley", category: "Regions", value: "ohio_valley" },
    { label: "South", category: "Regions", value: "south" },
    { label: "Southeast", category: "Regions", value: "southeast" },
    { label: "Southwest", category: "Regions", value: "southwest" },
    { label: "Upper Midwest", category: "Regions", value: "upper_midwest" },
    { label: "US Caribbean", category: "Regions", value: "us_caribbean" },
    { label: "West", category: "Regions", value: "west" },
  ];

  const handleLocationSelect = (location) => {
    if (onSelect) {
      onSelect(location);
    }
    onClose();
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    maxWidth: "1000px",
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
    borderRadius: "2px",
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

  // United States options
  const unitedStatesOptions = [
    { label: "Contiguous United States", svg: "/svgs/contiguous_usa.svg", value: "contiguous" },
    { label: "Alaska", svg: "/svgs/states/Alaska.svg", value: "alaska_us" },
    { label: "Hawai'i and US-Affiliated Pacific Islands", svg: "/svgs/states/Hawaii.svg", value: "hawaii_pacific" },
    { label: "US Caribbean", svg: "/svgs/us_caribbean.svg", value: "caribbean" },
  ];

  // States options - all 50 states
  const statesOptions = [
    { label: "Alabama", svg: "/svgs/states/Alabama.svg" },
    { label: "Alaska", svg: "/svgs/states/Alaska.svg" },
    { label: "Arizona", svg: "/svgs/states/Arizona.svg" },
    { label: "Arkansas", svg: "/svgs/states/Arkansas.svg" },
    { label: "California", svg: "/svgs/states/California.svg" },
    { label: "Colorado", svg: "/svgs/states/Colorado.svg" },
    { label: "Connecticut", svg: "/svgs/states/Connecticut.svg" },
    { label: "Delaware", svg: "/svgs/states/Delaware.svg" },
    { label: "Florida", svg: "/svgs/states/Florida.svg" },
    { label: "Georgia", svg: "/svgs/states/Georgia.svg" },
    { label: "Hawai'i", svg: "/svgs/states/Hawaii.svg" },
    { label: "Idaho", svg: "/svgs/states/Idaho.svg" },
    { label: "Illinois", svg: "/svgs/states/Illinois.svg" },
    { label: "Indiana", svg: "/svgs/states/Indiana.svg" },
    { label: "Iowa", svg: "/svgs/states/Iowa.svg" },
    { label: "Kansas", svg: "/svgs/states/Kansas.svg" },
    { label: "Kentucky", svg: "/svgs/states/Kentucky.svg" },
    { label: "Louisiana", svg: "/svgs/states/Louisiana.svg" },
    { label: "Maine", svg: "/svgs/states/Maine.svg" },
    { label: "Maryland", svg: "/svgs/states/Maryland.svg" },
    { label: "Massachusetts", svg: "/svgs/states/Massachusetts.svg" },
    { label: "Michigan", svg: "/svgs/states/Michigan.svg" },
    { label: "Minnesota", svg: "/svgs/states/Minnesota.svg" },
    { label: "Mississippi", svg: "/svgs/states/Mississippi.svg" },
    { label: "Missouri", svg: "/svgs/states/Missouri.svg" },
    { label: "Montana", svg: "/svgs/states/Montana.svg" },
    { label: "Nebraska", svg: "/svgs/states/Nebraska.svg" },
    { label: "Nevada", svg: "/svgs/states/Nevada.svg" },
    { label: "New Hampshire", svg: "/svgs/states/New_Hampshire.svg" },
    { label: "New Jersey", svg: "/svgs/states/New_Jersey.svg" },
    { label: "New Mexico", svg: "/svgs/states/New_Mexico.svg" },
    { label: "New York", svg: "/svgs/states/New_York.svg" },
    { label: "North Carolina", svg: "/svgs/states/North_Carolina.svg" },
    { label: "North Dakota", svg: "/svgs/states/North_Dakota.svg" },
    { label: "Ohio", svg: "/svgs/states/Ohio.svg" },
    { label: "Oklahoma", svg: "/svgs/states/Oklahoma.svg" },
    { label: "Oregon", svg: "/svgs/states/Oregon.svg" },
    { label: "Pennsylvania", svg: "/svgs/states/Pennsylvania.svg" },
    { label: "Rhode Island", svg: "/svgs/states/Rhode_Island.svg" },
    { label: "South Carolina", svg: "/svgs/states/South_Carolina.svg" },
    { label: "South Dakota", svg: "/svgs/states/South_Dakota.svg" },
    { label: "Tennessee", svg: "/svgs/states/Tennessee.svg" },
    { label: "Texas", svg: "/svgs/states/Texas.svg" },
    { label: "Utah", svg: "/svgs/states/Utah.svg" },
    { label: "Vermont", svg: "/svgs/states/Vermont.svg" },
    { label: "Virginia", svg: "/svgs/states/Virginia.svg" },
    { label: "Washington", svg: "/svgs/states/Washington.svg" },
    { label: "West Virginia", svg: "/svgs/states/West_Virginia.svg" },
    { label: "Wisconsin", svg: "/svgs/states/Wisconsin.svg" },
    { label: "Wyoming", svg: "/svgs/states/Wyoming.svg" },
  ];

  // Regions options
  const regionsOptions = [
    { label: "Alaska", svg: "/svgs/regions/alaska.svg", description: "Alaska" },
    { label: "Hawai'i and US-Affiliated Pacific Islands", svg: "/svgs/regions/hawaii.svg", description: "Hawai'i" },
    { label: "Northeast", svg: "/svgs/regions/northeast.svg", description: "Connecticut, Delaware, Maine, Maryland, Massachusetts, New Hampshire, New Jersey, New York, Pennsylvania, Rhode Island, & Vermont" },
    { label: "Northern Rockies and Plains", svg: "/svgs/regions/northern_rockies_plains.svg", description: "Montana, Nebraska, North Dakota, South Dakota, & Wyoming" },
    { label: "Northwest", svg: "/svgs/regions/northwest.svg", description: "Idaho, Oregon, & Washington" },
    { label: "Ohio Valley", svg: "/svgs/regions/ohio_valley.svg", description: "Illinois, Indiana, Kentucky, Missouri, Ohio, Tennessee, & West Virginia" },
    { label: "South", svg: "/svgs/regions/south.svg", description: "Alabama, Arkansas, Louisiana, Mississippi, Oklahoma, & Texas" },
    { label: "Southeast", svg: "/svgs/regions/southeast.svg", description: "Florida, Georgia, North Carolina, South Carolina, & Virginia" },
    { label: "Southwest", svg: "/svgs/regions/southwest.svg", description: "Arizona, Colorado, New Mexico, & Utah" },
    { label: "Upper Midwest", svg: "/svgs/regions/upper_midwest.svg", description: "Iowa, Michigan, Minnesota, & Wisconsin" },
    { label: "US Caribbean", svg: "/svgs/regions/us_caribbean.svg", description: "Puerto Rico & U.S. Virgin Islands" },
    { label: "West", svg: "/svgs/regions/west.svg", description: "California, Nevada" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="mega-menu-modal-title"
      aria-describedby="mega-menu-modal-description"
    >
      <Box sx={modalStyle}>
        {/* Header with Title and Close Button */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography id="mega-menu-modal-title" variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            State or Region
          </Typography>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: "#5C5C5C" }}>
          Choose the State, or Region
        </Typography>

        {/* Search Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Search
          </Typography>
          <Autocomplete
            options={allLocations}
            groupBy={(option) => option.category}
            getOptionLabel={(option) => option.label}
            value={null}
            onChange={(event, newValue) => {
              if (newValue) {
                handleLocationSelect(newValue);
              }
            }}
            inputValue={searchValue}
            onInputChange={(event, newInputValue) => {
              setSearchValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search for state, territory, or Region"
                variant="outlined"
                sx={{
                  minWidth: "250px",
                  width: "940px",
                  maxWidth: "100%",
                  backgroundColor: "#FAFAFA",
                  borderRadius: "2px",
                  "& .MuiOutlinedInput-root": {
                    padding: "8px",
                  },
                }}
              />
            )}
          />
        </Box>

        {/* United States Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              United States
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#5C5C5C" }}>
            some description
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {unitedStatesOptions.map((option) => (
              <Button
                key={option.value}
                sx={buttonStyle}
                onClick={() => handleLocationSelect(option)}
              >
                <Box
                  component="img"
                  src={option.svg}
                  alt={option.label}
                  sx={{ width: "30px", height: "30px", objectFit: "contain" }}
                />
                <Typography variant="body2" sx={{ color: "#003366", fontWeight: 500 }}>
                  {option.label}
                </Typography>
              </Button>
            ))}
          </Box>
        </Box>

        {/* States Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              States
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#5C5C5C" }}>
            some description
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {statesOptions.map((option) => (
              <Button
                key={option.label}
                sx={buttonStyle}
                onClick={() => handleLocationSelect(option)}
              >
                <Box
                  component="img"
                  src={option.svg}
                  alt={option.label}
                  sx={{ width: "30px", height: "30px", objectFit: "contain" }}
                />
                <Typography variant="body2" sx={{ color: "#003366", fontWeight: 500 }}>
                  {option.label}
                </Typography>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Regions Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Regions
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#5C5C5C" }}>
            some description
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {regionsOptions.map((option) => (
              <Button
                key={option.label}
                sx={buttonStyle}
                onClick={() => handleLocationSelect(option)}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Box
                      component="img"
                      src={option.svg}
                      alt={option.label}
                      sx={{ width: "30px", height: "30px", objectFit: "contain" }}
                    />
                    <Typography variant="body2" sx={{ color: "#003366", fontWeight: 600 }}>
                      {option.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#5C5C5C", fontSize: "0.7rem", lineHeight: 1.2 }}>
                    {option.description}
                  </Typography>
                </Box>
              </Button>
            ))}
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

MegaMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
};

export default MegaMenu;