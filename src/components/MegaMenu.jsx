import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import config from "../configs/config.js";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";

const MegaMenu = ({ open, onClose, onSelect }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleLocationSelect = (location) => {
    if (onSelect) {
      onSelect(location);
    }
    onClose();
  };

  // Filter states and regions based on search input
  const filteredStates = config.statesOptions.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const filteredRegions = config.regionsOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      (option.description &&
        option.description.toLowerCase().includes(searchValue.toLowerCase())),
  );

  const sectionTitleStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1,
    mt: 2,
  };

  const buttonStyle = {
    padding: "8px 30px",
    borderRadius: "8px",
    width: "210px",
    height: "74px",
    border: "1px solid #707070",
    backgroundColor: "#FAFAFA",
    textTransform: "none",
    justifyContent: "flex-start",
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    gap: "12px",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="mega-menu-modal-title"
      aria-describedby="mega-menu-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "1050px",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header with Title and Close Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography
            id="mega-menu-modal-title"
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600 }}
          >
            State or Region
          </Typography>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 3, color: "#5C5C5C" }}>
          Choose the State, or Region
        </Typography>

        {/* Search Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Search
          </Typography>
          <TextField
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
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
        </Box>

        {/* States Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <InsertChartOutlinedIcon
              sx={{ color: "#124086", fontSize: "50px" }}
            />
            <Typography
              sx={{ fontWeight: 600, color: "#124086", fontSize: "32px" }}
            >
              States
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#5C5C5C", fontWeight: "700", ml: 2, fontSize: "1.25rem" }}>
            some description
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mx: 3 }}>
            {filteredStates.map((option) => (
              <Button
                key={option.label}
                sx={{
                  "@media (max-width: 768px)": {
                    flexGrow: "1",
                  },
                  ...buttonStyle,
                }}
                onClick={() => handleLocationSelect(option)}
              >
                <Box
                  component="img"
                  src={option.svg}
                  alt={option.label}
                  sx={{ width: "30px", height: "30px", objectFit: "contain" }}
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

        {/* Regions Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={sectionTitleStyle}>
            <InsertChartOutlinedIcon
              sx={{ color: "#124086", fontSize: "50px" }}
            />
            <Typography
              sx={{ fontWeight: 600, color: "#124086", fontSize: "32px" }}
            >
              Regions
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#5C5C5C", fontWeight: "700", ml: 2, fontSize: "1.25rem" }}>
            some description
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mx: 3 }}>
            {filteredRegions.map((option) => (
              <Button
                key={option.label}
                sx={{
                  padding: "12px",
                  borderRadius: "8px",
                  width: "300px",
                  height: "160px",
                  border: "1px solid #707070",
                  backgroundColor: "#FAFAFA",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                  "@media (max-width: 1036px)": {
                    flexGrow: "1",
                    maxWidth: "calc(50% - 16px)"
                  },
                  "@media (max-width: 686px)": {
                    flexGrow: "1",
                    maxWidth: "none",
                  },
                }}
                onClick={() => handleLocationSelect(option)}
              >
                {/* Left side: SVG map taking up ~1/3 of space */}
                <Box
                  sx={{
                    width: "100px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={option.svg}
                    alt={option.label}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                {/* Right side: Text content */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flex: 1,
                    gap: 0.75,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#124086",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      lineHeight: 1.1,
                      textAlign: "left",
                    }}
                  >
                    {option.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#124086",
                      fontSize: "0.875rem",
                      lineHeight: 1.1,
                      textAlign: "left",
                    }}
                  >
                    {option.description}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Cancel Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            sx={{
              borderRadius: 1,
              border: "1px solid #0379C8",
              padding: "4px 8px",
              gap: "4px",
              color: "#0379C8",
              backgroundColor: "#FFFFFF",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={onClose}
          >
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
