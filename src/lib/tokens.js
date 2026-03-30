/* ═══════════════════════════════════════════════════════════════
   LUCID — Design Tokens
   Single source of truth for the entire design system.
   ═══════════════════════════════════════════════════════════════ */

export const colors = {
  body: "#F2F0EB",
  panel: "#EAE7E0",
  recess: "#E0DDD5",
  card: "#FAFAF7",
  accent: "#E5A632",
  text: "#2C2824",
  border: "rgba(44,40,36,0.06)",
  muted: "rgba(44,40,36,0.18)",
  screen: "#1C1916",
  lcd: "#E5A632",
  lcdDim: "#5C4A20",
  lcdBright: "#F0C050",
  rootBg: "#D8D5CE",
  gradientTop: "#EDEAE4",
  gradientBottom: "#E5E2DB",
  // New tokens
  eink: "#CCC7B8",
  einkBorder: "#B0AB9C",
  ink: "#2C2824",
  lucyText: "#C8C3BA",
  // Lucy surface
  lucySurface: "#D6D2C9",
  lucyGrain: "repeating-linear-gradient(90deg, rgba(0,0,0,0.012) 0px, rgba(0,0,0,0) 1px, rgba(255,255,255,0.018) 2px, rgba(0,0,0,0) 3px)",
  lucyShadow: "0 1px 2px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.5)",
  lucyBorder: "rgba(44,40,36,0.08)",
  lucyStatusText: "#5A5550",
  lucyBodyText: "#4A4640",
  lucyAmberText: "#C48B1E",
  lucyEmphasis: "#B07A18",
  // Module colors
  purpose: "#FF6B8A",
  values: "#14B8A6",
  personality: "#FF8C42",
  tone: "#4AADFF",
  usps: "#B86EED",
  manifesto: "#6366F1",
  visualWorld: "#C026D3",
  discovery: "#84A53A",
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
  primary: "'DM Sans', sans-serif",
  pixel: "'DotGothic16', monospace",
  pixelLabel: "'Silkscreen', sans-serif",
};

export const fontImports = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');
`;

export const globalStyles = `
  ${fontImports}
  @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes lucyPulse { 0%, 100% { opacity:0.7; } 50% { opacity:1; } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 8px rgba(240,192,80,0.15), 0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.04); } 50% { box-shadow: 0 0 28px rgba(240,192,80,0.35), 0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.04); } }
  textarea:focus, input:focus { outline:none; }
  ::selection { background:rgba(229,166,50,0.12); }
  textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
  * { box-sizing:border-box; margin:0; padding:0; }
`;

/* Shorthand object for inline styles (backward compatible with existing S.xxx usage) */
export const S = {
  ...colors,
  raised: shadows.raised,
  pressed: shadows.pressed,
};
