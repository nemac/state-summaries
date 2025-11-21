import React from "react";
import PropTypes from "prop-types";
import { Button, Typography } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";

const MegaMenuButton = ({ children, icon, onClick }) => {
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
    "@media (max-width: 768px)": {
      flexGrow: "1",
    },
  };

  return (
    <Button sx={buttonStyle} onClick={onClick}>
      {icon || <ThermostatIcon sx={{ color: "#003366", fontSize: "1.5rem" }} />}
      <Typography
        variant="body2"
        sx={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#124086",
        }}
      >
        {children}
      </Typography>
    </Button>
  );
};

MegaMenuButton.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.element,
  onClick: PropTypes.func,
};

export default MegaMenuButton;
