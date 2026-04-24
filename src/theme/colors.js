export const colors = {
  // === Brand / UI Blues ===
  primary: "#0379C8",
  primaryDark: "#124086",
  navy: "#003366",
  buttonBlue: "#1976d2",

  // === Text ===
  textPrimary: "#000000",
  textSecondary: "#5C5C5C",
  textTertiary: "#444444",
  textMuted: "#666666",
  textDark: "#333333",

  // === Backgrounds ===
  white: "#ffffff",
  backgroundChart: "#FBFCFE",
  backgroundHover: "#f0f0f0",
  backgroundHoverAlt: "#f4f4f4",
  backgroundSelected: "#f0f4ff",
  backgroundButton: "#f9f9f9",
  backgroundButtonHover: "#f5f5f5",
  backgroundDropdown: "#FAFAFA",

  // === Borders / Dividers ===
  border: "#e0e0e0",
  borderMedium: "#707070",
  borderLight: "#cccccc",
  borderDisabled: "#bbbbbb",

  // === Chart Infrastructure ===
  averageLine: "#858585",
  referenceLine: "#BFBFBF",
  gridLine: "#e0e0e0",
  zeroLine: "#000000",

  // === Observed Data Chart Colors ===
  precipitation: "#5AB4AC",
  temperatureCold: "#91BFDB",
  temperatureWarm: "#FBB14D",

  // === Emissions Scenarios (base RGB for alpha variants) ===
  scenario: {
    historical: { r: 169, g: 169, b: 169 },
    ssp126: { r: 173, g: 216, b: 230 },
    ssp245: { r: 105, g: 105, b: 105 },
    ssp370: { r: 247, g: 205, b: 166 },
    ssp585: { r: 219, g: 112, b: 147 },
  },

  // === Bracket / Annotation Colors (solid RGB) ===
  bracket: {
    ssp585: "rgb(189,0,38)",
    ssp245: "rgb(105,105,105)",
    ssp370: "rgb(247,148,30)",
    ssp126: "rgb(90,180,172)",
  },

  // === Transparent overlays ===
  overlay: {
    white70: "rgba(255, 255, 255, 0.7)",
    white80: "rgba(255, 255, 255, 0.8)",
    white85: "rgba(255, 255, 255, 0.85)",
    white95: "rgba(255, 255, 255, 0.95)",
    black15: "rgba(0, 0, 0, 0.15)",
    black40: "rgba(0, 0, 0, 0.4)",
  },
};

// Helper: create rgba string from scenario base color
export const scenarioColor = (key, alpha) => {
  const { r, g, b } = colors.scenario[key];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
