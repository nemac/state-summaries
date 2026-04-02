import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import { useNavigate } from "react-router-dom";
import { colors } from "../theme";

export default function About() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: colors.white,
        color: colors.textSecondary,
        height: "calc(100vh - 16px)",
        margin: "16px",
        overflowY: "auto",
        [theme.breakpoints.down("xs")]: {
          overflow: "scroll",
        },
      }}
    >
      {/* Header area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "0 16px",
          paddingTop: "16px",
          paddingBottom: "8px",
        }}
      >
        {/* Return to Data Explorer link */}
        <Box
          role="button"
          tabIndex={0}
          onClick={() => navigate("/")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/");
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            color: colors.primary,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: "1.4rem" }} />
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 500,
              color: colors.primary,
            }}
          >
            Return to Data Explorer
          </Typography>
        </Box>
      </Box>

      {/* Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          margin: "0 16px",
          paddingBottom: "16px",
          borderBottom: `2px solid ${colors.border}`,
        }}
      >
        <InsertChartOutlinedIcon
          sx={{
            color: colors.textPrimary,
            fontSize: "2.5rem",
            backgroundColor: colors.white,
            borderRadius: "30px",
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            color: colors.textPrimary,
          }}
        >
          About the State Climate Summaries Data Explorer
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          margin: "0 16px",
          maxWidth: "960px",
          paddingTop: "24px",
          paddingBottom: "48px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Overview
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "32px",
            color: colors.textSecondary,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Features
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "32px",
            color: colors.textSecondary,
          }}
        >
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae,
          ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam
          egestas semper. Aenean ultricies mi vitae est. Mauris placerat
          eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
          Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit
          amet, wisi.
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Getting Started
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            marginBottom: "32px",
            color: colors.textSecondary,
          }}
        >
          Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam
          varius, turpis et commodo pharetra, est eros bibendum elit, nec
          luctus magna felis sollicitudin mauris. Integer in mauris eu nibh
          euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec
          lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut
          dictum pharetra, nisi nunc fringilla magna, in commodo elit erat
          nec turpis.
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: colors.primaryDark,
            marginBottom: "12px",
          }}
        >
          Additional Information
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            color: colors.textSecondary,
          }}
        >
          Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum
          nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam
          eget risus varius blandit sit amet non magna. Nullam quis risus
          eget urna mollis ornare vel eu leo. Cras mattis consectetur purus
          sit amet fermentum. Praesent commodo cursus magna, vel scelerisque
          nisl consectetur et.
        </Typography>
      </Box>
    </Box>
  );
}
