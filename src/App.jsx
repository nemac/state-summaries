import { createTheme, ThemeProvider } from "@mui/material/styles";
import SandboxControls from "./scripts/SandboxControls.jsx";

const theme = createTheme({});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="sandbox-holderofall">
        <SandboxControls />
      </div>
    </ThemeProvider>
  );
}

export default App;
