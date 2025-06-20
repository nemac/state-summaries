import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import Fade from "@mui/material/Fade";

import SandoxPeriodsHumanReadable from "../configs/SandoxPeriodsHumanReadable";

// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     margin: theme.spacing(0),
//     minWidth: 120,
//     backgroundColor: '#E6E6E6'
//   },
//   menuItem: {
//     textAlign: 'left'
//   },
//   sandboxInputLabel: {
//     color: '#5C5C5C'
//   },
//   sandboxErrorText: {
//     backgroundColor: '#FBFCFE',
//     margin: '0px',
//     [theme.breakpoints.up('md')]: {
//       paddingTop: '3px'
//     }
//   },
//   infoButton: {
//     color: '#5C5C5C',
//     fontSize: '1.25rem',
//     marginLeft: theme.spacing(0.1),
//     position: 'absolute',
//     top: '-0.66rem',
//     left: '-1.75rem',
//     backgroundColor: '#ffffff',
//     borderRadius: '30px'
//   },
//   toolTip: {
//     padding: theme.spacing(2),
//     fontSize: '1rem'
//   },
//   pulldownInfoHolder: {
//     position: 'relative'
//   }
// }));

export default function Selector(props) {
  const theme = useTheme();
  let { items } = props;
  const { controlName } = props;
  const { value } = props;
  const { disabled } = props;
  const { missing } = props;
  const { season } = props;
  const { onChange } = props;
  const { TooltipText } = props;
  const replaceClimatevariableType =
    controlName === "Select a Climate Variable"
      ? props.replaceClimatevariableType
      : (name) => name;
  const replaceLocationAbbreviation =
    controlName === "Select a Location"
      ? props.replaceLocationAbbreviation
      : (name) => name;
  const replacePeriodType =
    controlName === "Select a Time Period"
      ? props.replacePeriodType
      : (name) => name;
  const replaceSeasonType =
    controlName === "Select the Time Scale"
      ? props.replaceSeasonType
      : (name) => name;
  const selectorError = missing && !disabled;
  const errorLabel = selectorError ? (
    <FormHelperText
      sx={{
        backgroundColor: "#FBFCFE",
        margin: "0px",
        [theme.breakpoints.up("md")]: {
          paddingTop: "3px",
        },
      }}
    >
      * Required
    </FormHelperText>
  ) : (
    ""
  );

  // limit period based on season
  // not all periods are valid for seasons
  const limitPeriods = (periodARG, seasonARG) => {
    const periodsHumanReadable = SandoxPeriodsHumanReadable();
    const seasonFull = periodsHumanReadable.filter(
      (v) => v.season === seasonARG,
    );

    // limit period array based on season limited array
    //  uses the humad readable...
    const seasonLimitedPeriods = periodARG.filter((el) =>
      seasonFull.some((f) => f.value === el),
    );
    return seasonLimitedPeriods;
  };

  // only limit items when in period
  if (controlName === "Select a Time Period") {
    items = limitPeriods(items, season);
  }

  // replace regional
  const replaceRegional = (regionalValue) => {
    let returnValue = regionalValue;
    if (regionalValue.toUpperCase() === "REGIONAL") returnValue = "NCA Region";
    return returnValue;
  };

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const replaceWithHumanReadable = (theControlName, val, seasonHR) => {
    switch (theControlName) {
      case "Select a Climate Variable":
        return replaceClimatevariableType(val, seasonHR);
      case "Select a Location":
        return replaceLocationAbbreviation(val);
      case "Select a Region":
        return replaceRegional(val);
      case "Select a Time Period":
        return replacePeriodType(val, seasonHR);
      case "Select the Time Scale":
        return replaceSeasonType(val);
      default:
        return replaceClimatevariableType(val, seasonHR);
    }
  };

  return (
    <Box p={0} display="flex" width={"100%"}>
      <FormControl
        variant="outlined"
        fullWidth={true}
        disabled={disabled}
        error={selectorError}
        sx={{
          margin: theme.spacing(0),
          minWidth: 120,
          backgroundColor: "#E6E6E6",
        }}
      >
        <InputLabel
          id="demo-simple-select-outlined-label"
          sx={{ color: "#5C5C5C" }}
        >
          {controlName}
        </InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={value}
          onChange={handleChange}
          label={controlName}
          sx={{ textAlign: "left" }}
        >
          {items.map((name) => (
            <MenuItem key={name} value={name} sx={{ textAlign: "left" }}>
              {replaceWithHumanReadable(controlName, name, season)}
            </MenuItem>
          ))}
        </Select>
        {errorLabel}
      </FormControl>
      <Box p={0} m={0} sx={{ position: "relative" }}>
        <Tooltip
          title={TooltipText}
          aria-label={TooltipText}
          placement="bottom-end"
          TransitionComponent={Fade}
          enterNextDelay={750}
          arrow
          sx={{ padding: theme.spacing(2), fontSize: "1rem" }}
        >
          <InfoIcon
            sx={{
              color: "#5C5C5C",
              fontSize: "1.25rem",
              marginLeft: theme.spacing(0.1),
              position: "absolute",
              top: "-0.66rem",
              left: "-1.75rem",
              backgroundColor: "#ffffff",
              borderRadius: "30px",
            }}
          />
        </Tooltip>
      </Box>
    </Box>
  );
}

Selector.propTypes = {
  items: PropTypes.array,
  controlName: PropTypes.string,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  season: PropTypes.string,
  TooltipText: PropTypes.string,
  missing: PropTypes.bool,
  replaceClimatevariableType: PropTypes.func,
  replaceLocationAbbreviation: PropTypes.func,
  replacePeriodType: PropTypes.func,
  replaceSeasonType: PropTypes.func,
  onChange: PropTypes.func,
};
