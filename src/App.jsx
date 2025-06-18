import { createTheme, ThemeProvider } from "@mui/material/styles";
import SandboxControls from "./scripts/SandboxControls.jsx";
// import SaveAsPNGButton from "./components/SaveAsPNGButton.jsx";
// import SaveAsSVGButton from "./components/SaveAsSVGButton.jsx";
import SaveAsCSVButton from "./components/SaveAsCSVButton.jsx";

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
