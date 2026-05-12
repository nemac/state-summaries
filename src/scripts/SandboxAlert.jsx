import React from "react";
import PropTypes from "prop-types";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Collapse from "@mui/material/Collapse";

// Maps the legacy errorType prop ("Error" / "Warning") to MUI's severity.
const toSeverity = (errorType) => {
  switch (errorType) {
    case "Error":
      return "error";
    case "Warning":
      return "warning";
    default:
      return "warning";
  }
};

export default function SandboxAlert(props) {
  const { chartErrorTitle, chartErrorMessage, errorType, shouldOpenAlert } =
    props;

  return (
    <Collapse
      in={shouldOpenAlert}
      sx={{
        position: "relative",
        width: "calc(100% - 30px)",
        marginLeft: "-39px",
      }}
    >
      <Alert
        severity={toSeverity(errorType)}
        variant="standard"
        sx={{
          position: "absolute",
          zIndex: 1000,
          width: "100%",
          mr: 2,
          borderRadius: 4,
        }}
      >
        <AlertTitle sx={{ fontWeight: "bold" }}>{chartErrorTitle}</AlertTitle>
        {chartErrorMessage}
      </Alert>
    </Collapse>
  );
}

SandboxAlert.propTypes = {
  chartErrorTitle: PropTypes.string,
  chartErrorMessage: PropTypes.string,
  errorType: PropTypes.string,
  shouldOpenAlert: PropTypes.bool,
};
