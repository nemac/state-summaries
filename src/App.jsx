import { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useMediaQuery,
} from "@mui/material";
import SandboxControls from "./scripts/SandboxControls.jsx";
import About from "./components/About.jsx";

const theme = createTheme({});

function MobileDisclaimer() {
  const isMobilePortrait = useMediaQuery(
    "(max-width: 768px) and (orientation: portrait)",
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isMobilePortrait) {
      setOpen(true);
    }
  }, [isMobilePortrait]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Best Viewed on Desktop or Landscape Mode
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          This site is best viewed on a desktop browser or in landscape mode on
          mobile devices.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <MobileDisclaimer />
        <Routes>
          <Route path="/" element={<SandboxControls />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
