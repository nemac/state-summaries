import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const SaveAsSVGButton = () => {
  return (
    <Box>
      <Button onClick={SaveAsSVGButton} variant="outlined">
        Save as an SVG
      </Button>
    </Box>
  );
};

export default SaveAsSVGButton;
