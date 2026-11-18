// Design tokens taken from the prototype :root block.
// Consumed by tailwind.config.js and by SVG charts that need raw hex values.
export const colors = {
  wine: "#6B1D2A",
  "wine-7": "#561722",
  "wine-9": "#3F111B",
  "wine-1": "#F7ECEE",
  "wine-2": "#EBD3D8",
  gold: "#B8892F",
  "gold-d": "#8A6620",
  "gold-1": "#F7EFDA",
  "gold-ink": "#2B1B05",
  paper: "#FAF7F2",
  "paper-2": "#FCFAF6",
  "paper-3": "#FDFBF8",
  line: "#E7E0D6",
  "line-2": "#D6CCBF",
  ink: "#2B2726",
  "ink-2": "#5F5752",
  "ink-3": "#857D76",
  ok: "#2E6B4B",
  "ok-bg": "#E4F1E9",
  warn: "#855B05",
  "warn-bg": "#FBF0D6",
  bad: "#9B2C2C",
  "bad-bg": "#FBE6E3",
  info: "#365B7D",
  "info-bg": "#E3EBF3",
  vio: "#69488A",
  "vio-bg": "#EDE6F4",
  mute: "#5F5752",
  "mute-bg": "#EEEAE4",
};

export const fonts = {
  serif: ["Fraunces", "Georgia", "Times New Roman", "serif"],
  sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
};

// Breakpoints replace the prototype container queries (560 / 880 / 1080 px).
export const screens = { sm: "561px", md: "881px", lg: "1081px", xl: "1280px" };
