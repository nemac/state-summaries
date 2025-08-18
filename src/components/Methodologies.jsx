import React from "react";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArticleIcon from "@mui/icons-material/Article";
import { Typography, Box } from "@mui/material";

const Methodologies = () => {
  return (
    <>
      <Box display="flex" flexDirection="row" alignItems="flex-start" gap={2}>
        <AssessmentIcon />
        <Typography variant="h6">
          NOAA State Climate Summaries Charts and Maps Methodologies
        </Typography>
      </Box>
      <Box display="flex" flexDirection="row" alignItems="flex-start" gap={2}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <ArticleIcon />
          <DownloadIcon />
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center">
          <SettingsSuggestIcon />
          <DownloadIcon />
        </Box>
      </Box>
    </>
  );
};

export default Methodologies;
