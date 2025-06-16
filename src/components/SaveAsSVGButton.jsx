import React from "react";
import Box from "react";
import Button from "react";

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
