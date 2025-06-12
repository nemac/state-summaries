import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { orange, red } from "@mui/material/colors";

// const useStyles = makeStyles((theme) => ({
//   sandboxAlertBox: {
//     color: '#000000',
//     position: 'absolute',
//     zIndex: '1000',
//     width: '100%'
//   },
//   sandboxAlertCollapse: {
//     position: 'relative',
//     width: 'calc(100% - 30px)',
//     marginLeft: '-39px'
//   }
// }));

export default function Alert(props) {
  const { chartErrorTitle, chartErrorMessage, errorType, shouldOpenAlert } =
    props;

  const errorBgColor = red[500];
  const errorBorderColor = red[900];
  const warningBgColor = orange[500];
  const warningBorderColor = orange[800];

  // get the background color for error type
  const backgroundColor = (theErrorType) => {
    switch (theErrorType) {
      case "Error":
        return errorBgColor;
      case "Warning":
        return warningBgColor;
      default:
        return warningBgColor;
    }
  };

  // get the border color for error type
  const borderColor = (theErrorType) => {
    switch (theErrorType) {
      case "Error":
        return errorBorderColor;
      case "Warning":
        return warningBorderColor;
      default:
        return warningBorderColor;
    }
  };

  return (
    <Collapse
      in={shouldOpenAlert}
      sx={{
        position: "relative",
        width: "calc(100% - 30px)",
        marginLeft: "-39px",
      }}
    >
      <Box
        sx={{
          color: "#000000",
          position: "absolute",
          zIndex: "1000",
          width: "100%",
        }}
        bgcolor={backgroundColor(errorType)}
        color="text.primary"
        p={1}
        mr={2}
        borderRadius={4}
        border={1}
        borderColor={borderColor(errorType)}
      >
        <Box fontWeight="fontWeightBold" py={1} display="flex">
          <div
            style={{
              display: "flex",
              padding: "7px 0",
              fontSize: "22px",
              marginRight: "12px",
            }}
          >
            <ErrorOutlineIcon />
          </div>
          <div style={{ padding: "10px 0" }}>{chartErrorTitle}</div>
        </Box>
        {chartErrorMessage}
      </Box>
    </Collapse>
  );
}

Alert.propTypes = {
  chartErrorTitle: PropTypes.string,
  chartErrorMessage: PropTypes.string,
  errorType: PropTypes.string,
  shouldOpenAlert: PropTypes.bool,
};
