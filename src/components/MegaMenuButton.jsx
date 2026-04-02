import React from "react";
import PropTypes from "prop-types";
import { Button, Typography } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { colors } from "../theme";

const MegaMenuButton = ({ children, icon, onClick }) => {
  const buttonStyle = {
    padding: "8px 12px",
    marginLeft: "32px",
    borderRadius: "8px",
    width: "250px",
    height: "74px",
    border: `1px solid ${colors.borderMedium}`,
    backgroundColor: colors.backgroundDropdown,
    textTransform: "none",
    justifyContent: "flex-start",
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    gap: 1,
    "&:hover": {
      backgroundColor: colors.backgroundHover,
    },
    "@media (max-width: 768px)": {
      flexGrow: "1",
    },
  };

  return (
    <Button sx={buttonStyle} onClick={onClick}>
      {icon || <ThermostatIcon sx={{ color: colors.navy, fontSize: "1.5rem" }} />}
      <Typography
        variant="body2"
        sx={{
          fontSize: "14px",
          fontWeight: 700,
          color: colors.primaryDark,
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
