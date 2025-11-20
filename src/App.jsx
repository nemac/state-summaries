import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import SandboxControls from "./scripts/SandboxControls.jsx";

const theme = createTheme({});

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <SandboxControls />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
