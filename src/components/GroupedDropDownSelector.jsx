import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  Typography,
} from "@mui/material";

const GroupedDropDownSelector = (props) => {
  const { options, label, onChange, value } = props;

  const getDisplayText = (selectedValue) => {
    if (!selectedValue) return "";

    const [category, item] = selectedValue.split("_");

    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography component="span" sx={{ fontWeight: "bold", mr: 1 }}>
          {category}
        </Typography>
        <Typography component="span">{item}</Typography>
      </Box>
    );
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="climate-data-select-label">{label}</InputLabel>
      <Select
        variant="outlined"
        labelId="climate-data-select-label"
        id="climate-data-select"
        value={value}
        label={label}
        onChange={onChange}
        renderValue={(selected) => getDisplayText(selected)}
      >
        {Object.entries(options).map(([category, items]) => [
          <ListSubheader key={category}>{category}</ListSubheader>,
          ...items.map((item) => (
            <MenuItem
              key={`${category}_${item}`}
              value={`${category}_${item}`}
              sx={{ pl: 4 }}
            >
              {item}
            </MenuItem>
          )),
        ])}
      </Select>
    </FormControl>
  );
};

export default GroupedDropDownSelector;
