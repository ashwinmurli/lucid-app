/* ═══════════════════════════════════════════════════════════════
   LUCID — Design Tokens
   Single source of truth for the entire design system.
   ═══════════════════════════════════════════════════════════════ */

export const colors = {
  body: "#E8E3DA",
  panel: "#DDD8CE",
  recess: "#D2CEC4",
  card: "#EEEAE2",
  accent: "#D4734A",
  text: "#3D3830",
  border: "rgba(61,56,48,0.06)",
  muted: "rgba(61,56,48,0.18)",
  screen: "#1E1B17",
  lcd: "#7A9A7A",
  lcdDim: "#2E3A2E",
  lcdBright: "#A0C8A0",
  rootBg: "#D8D3CA",
  gradientTop: "#ECE7DE",
  gradientBottom: "#E3DED4",
};

export const shadows = {
  raised: "0 1px 0 rgba(255,255,255,0.5) inset, 0 2px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  pressed: "0 1px 3px rgba(0,0,0,0.08) inset",
  screenInset: "0 1px 3px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.04)",
  screenDeep: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)",
  cardHover: "0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.5) inset",
  popover: "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5) inset",
};

export const ease = "cubic-bezier(0.22,1,0.36,1)";

export const fonts = {
  primary: "'Inter', sans-serif",
  pixel: "'DotGothic16', monospace",
  pixelLabel: "'Silkscreen', sans-serif",
};

export const fontImports = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
`;

export const globalStyles = `
  ${fontImports}
  @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes lucyPulse { 0%, 100% { opacity:0.7; } 50% { opacity:1; } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 8px rgba(160,200,160,0.15), 0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.04); } 50% { box-shadow: 0 0 28px rgba(160,200,160,0.35), 0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.04); } }
  textarea:focus, input:focus { outline:none; }
  ::selection { background:rgba(212,115,74,0.1); }
  textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
  * { box-sizing:border-box; margin:0; padding:0; }
`;

/* Shorthand object for inline styles (backward compatible with existing S.xxx usage) */
export const S = {
  ...colors,
  raised: shadows.raised,
  pressed: shadows.pressed,
};
