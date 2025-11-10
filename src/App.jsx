import { createTheme, ThemeProvider } from "@mui/material/styles";
import SandboxControls from "./scripts/SandboxControls.jsx";

const theme = createTheme({});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SandboxControls />
    </ThemeProvider>
  );
}

export default App;
