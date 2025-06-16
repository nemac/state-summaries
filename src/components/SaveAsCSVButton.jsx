import React from "react";
import Box from "react";
import Button from "react";

const SaveAsCSVButton = () => {
  return (
    <Box>
      <Button onClick={SaveAsCSVButton} variant="outlined">
        Save as an SVG
      </Button>
    </Box>
  );
};

export default SaveAsCSVButton;
