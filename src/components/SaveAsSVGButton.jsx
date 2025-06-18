import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";

const SaveAsSVGButton = () => {
  return (
    <Box>
      <Button
        startIcon={
          <DownloadIcon
            sx={{
              p: 0.5,
            }}
          />
        }
        onClick={SaveAsSVGButton}
        variant="outlined"
        sx={{ backgroundColor: "#1976d2", color: "white" }}
      >
        Save as an SVG
      </Button>
    </Box>
  );
};

export default SaveAsSVGButton;
