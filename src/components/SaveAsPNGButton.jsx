import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const SaveAsPNGButton = () => {
  return (
    <Box>
      <Button onClick={SaveAsPNGButton} variant="outlined">
        Save as PNG
      </Button>
    </Box>
  );
};

export default SaveAsPNGButton;
