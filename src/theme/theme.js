import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

export const theme = createTheme({
  palette: {
    primary: { main: colors.primary, dark: colors.primaryDark },
    secondary: { main: colors.navy },
    text: { primary: colors.textPrimary, secondary: colors.textSecondary },
    background: { default: colors.white, paper: colors.backgroundDropdown },
    divider: colors.border,
  },
});
