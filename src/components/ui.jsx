/* ═══════════════════════════════════════════════════════════════
   LUCID — Shared Components
   Reusable UI components used across all modules.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from "react";
import { S, colors, shadows, ease, fonts } from "../lib/tokens";

/* ── Lucy's SVG icons (pixelarticons style) ── */
export const LUCY_ICONS_SVG = {
  guide: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 3h9v2H2zM0 19h11v2H0zM13 3h9v2h-9zm0 16h11v2H13zM11 5h2v18h-2zM0 5h2v14H0zm22 0h2v14h-2zm-7 2h5v2h-5zm0 4h5v2h-5zm0 4h2v2h-2z"/></svg>,
  challenge: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 10h2v2H2zm0 4h2v-2H2zm20-4h-2v2h2zm0 4h-2v-2h2zM4 8h2v2H4zm0 8h2v-2H4zm16-8h-2v2h2zm0 8h-2v-2h2zM6 6h2v2H6zm0 12h2v-2H6zM18 6h-2v2h2zm0 12h-2v-2h2zM8 4h2v2H8zm0 16h2v-2H8zm8-16h-2v2h2zm0 16h-2v-2h2zM10 2h2v2h-2zm0 20h2v-2h-2zm4-20h-2v2h2zm0 20h-2v-2h2zm-3-5h2v-2h-2zm0-4h2V7h-2z"/></svg>,
  spark: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11 1h2v4h-2zm0 22h2v-4h-2zM9 5h2v4H9zm0 14h2v-4H9zm4-14h2v4h-2zm0 14h2v-4h-2zM5 9h4v2H5zm14 0h-4v2h4zM1 11h4v2H1zm22 0h-4v2h4zM5 13h4v2H5zm14 0h-4v2h4z"/></svg>,
  lock: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5 8h14v2H5zm0 12h14v2H5zM3 10h2v10H3zm16 0h2v10h-2zM7 4h2v4H7zm2-2h6v2H9zm6 2h2v4h-2z"/></svg>,
  push: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8 21h8v-2H8zm0-2h2v-6H8zm-5-6h5v-2H3zm0-2h2V9H3zm2-2h2V7H5zm2-2h2V5H7zm2-2h2V3H9zm2-2h2V1h-2zm2 2h2V3h-2zm2 2h2V5h-2zm2 2h2V7h-2zm2 4h2V9h-2zm-3 0h3v-2h-3zm-2 6h2v-6h-2z"/></svg>,
  probe: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 22h-2v-2h2v2Zm-2-2h-2v-2h2v2Zm-6-2H6v-2h8v2Zm4 0h-2v-2h2v2ZM6 16H4v-2h2v2Zm10 0h-2v-2h2v2ZM4 14H2V6h2v8Zm14 0h-2V6h2v8ZM6 6H4V4h2v2Zm10 0h-2V4h2v2Zm-2-2H6V2h8v2Z"/></svg>,
  drift: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M10 19H2v-2h8v2Zm12 0h-8v-2h8v2Zm-10-2h-2v-6h2v6Zm6-10h2v2h2v2h-2v2h-2v2h-2v-4h-4V9h4V5h2v2ZM8 11H2V9h6v2Z"/></svg>,
  done: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z"/></svg>,
  idle: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 10h2v2H2zm0 4h2v-2H2zm20-4h-2v2h2zm0 4h-2v-2h2zM4 8h2v2H4zm0 8h2v-2H4zm16-8h-2v2h2zm0 8h-2v-2h2zM6 6h2v2H6zm0 12h2v-2H6zM18 6h-2v2h2zm0 12h-2v-2h2zM8 4h2v2H8zm0 16h2v-2H8zm8-16h-2v2h2zm0 16h-2v-2h2zM10 2h2v2h-2zm0 20h2v-2h-2zm4-20h-2v2h2zm0 20h-2v-2h2zm-3-5h2v-2h-2zm0-4h2V7h-2z"/></svg>,
  thinking: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 10h2v2H2zm0 4h2v-2H2zm20-4h-2v2h2zm0 4h-2v-2h2zM4 8h2v2H4zm0 8h2v-2H4zm16-8h-2v2h2zm0 8h-2v-2h2zM6 6h2v2H6zm0 12h2v-2H6zM18 6h-2v2h2zm0 12h-2v-2h2zM8 4h2v2H8zm0 16h2v-2H8zm8-16h-2v2h2zm0 16h-2v-2h2zM10 2h2v2h-2zm0 20h2v-2h-2zm4-20h-2v2h2zm0 20h-2v-2h2zm-3-5h2v-2h-2zm0-4h2V7h-2z"/></svg>,
  approves: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z"/></svg>,
  cocreate: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11 1h2v4h-2zm0 22h2v-4h-2zM9 5h2v4H9zm0 14h2v-4H9zm4-14h2v4h-2zm0 14h2v-4h-2zM5 9h4v2H5zm14 0h-4v2h4zM1 11h4v2H1zm22 0h-4v2h4zM5 13h4v2H5zm14 0h-4v2h4z"/></svg>,
  off: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11 1h2v4h-2zm0 22h2v-4h-2zM9 5h2v4H9zm0 14h2v-4H9zm4-14h2v4h-2zm0 14h2v-4h-2zM5 9h4v2H5zm14 0h-4v2h4zM1 11h4v2H1zm22 0h-4v2h4zM5 13h4v2H5zm14 0h-4v2h4z"/></svg>,
};

/* ── Backward compat: keep old LUCY_ICONS for any remaining references ── */
export const LUCY_ICONS = {
  off:      "0010001010100010101000100",
  idle:     "0111011011100011101101110",
  thinking: "0111000011011101100001110",
  approves: "0000100010101000100000000",
  guide:    "0010001010001000010001110",
  cocreate: "0101001010001000101001010",
};

/* ── Pixel Icon (SVG-based) ── */
export function PixelIcon({ icon, pattern, color, size = 14, style }) {
  // Support new SVG icons via `icon` prop
  if (icon) {
    const Icon = LUCY_ICONS_SVG[icon] || LUCY_ICONS_SVG.idle;
    return <Icon style={{ width: size, height: size, color, display: 'block', ...style }} />;
  }
  // Fallback: old pattern-based rendering (backward compat)
  if (pattern) {
    const pxSize = size <= 5 ? size : 2;
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(5, ${pxSize}px)`,
        gridTemplateRows: `repeat(5, ${pxSize}px)`,
        gap: pxSize > 1 ? 0.5 : 0,
        flexShrink: 0,
        ...style,
      }}>
        {pattern.split("").map((p, i) => (
          <div key={i} style={{ background: p === "1" ? color : "transparent" }} />
        ))}
      </div>
    );
  }
  return null;
}

/* ── Lucy Screen (full interactive version with hover grid) ── */
export function LucyScreen({ mode, hoveredModeInfo, aiMode, guideText }) {
  const isActive = mode !== "off";
  const isThinking = mode === "thinking";
  const hasGuide = !!guideText;
  const [hover, setHover] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const screenRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!screenRef.current) return;
    const rect = screenRef.current.getBoundingClientRect();
    setMousePos({
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    });
  };

  const MODES = {
    guide: { key: "GDE", label: "GUIDE", icon: "guide" },
    challenge: { key: "CHL", label: "READY", icon: "idle" },
    cocreate: { key: "CRT", label: "CO-OP", icon: "cocreate" },
  };

  let es;
  if (isThinking) es = { label: "COMPOSING", icon: "thinking", bg: "#1C1916", text: colors.accent };
  else if (mode === "approves") es = { label: "NOTED", icon: "approves", bg: "#1C1916", text: colors.lcdBright };
  else es = { label: MODES[aiMode]?.label || "READY", icon: MODES[aiMode]?.icon || "idle", bg: "#1C1916", text: colors.lcd };
  if (mode === "off") es = { label: "LUCY", icon: "off", bg: colors.screen, text: colors.lcdDim };

  const gridRgb = es.text === colors.accent ? "229,166,50" : es.text === colors.lcdBright ? "240,192,80" : "229,166,50";
  const smi = hoveredModeInfo && isActive;
  const dIcon = smi ? (hoveredModeInfo.key === "GDE" ? "guide" : hoveredModeInfo.key === "CRT" ? "cocreate" : "idle") : es.icon;
  const dLabel = smi ? hoveredModeInfo.desc : es.label;
  const dColor = smi ? colors.lcd : es.text;
  const dBg = smi ? "#1C1916" : es.bg;

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={screenRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setMousePos({ x: 0.5, y: 0.5 }); }}
        onMouseMove={handleMouseMove}
        style={{
          width: "100%", height: 28,
          borderRadius: hasGuide ? "3px 3px 0 0" : 3,
          background: dBg,
          boxShadow: shadows.screenInset,
          border: "1px solid rgba(0,0,0,0.12)",
          borderBottom: hasGuide ? "none" : "1px solid rgba(0,0,0,0.12)",
          overflow: "hidden", cursor: "default",
          transition: "background 0.4s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={{
          opacity: hover && isActive && !smi && !hasGuide ? 0 : 1,
          transition: "opacity 0.15s ease",
          zIndex: 1,
          display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
        }}>
          <div style={{ animation: isThinking ? "lucyPulse 1.5s ease-in-out infinite" : "none" }}>
            <PixelIcon icon={dIcon} color={dColor} size={14} />
          </div>
          <span style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: dColor, lineHeight: 1, transition: "color 0.3s ease" }}>{dLabel}</span>
        </div>
        {isActive && !smi && !hasGuide && (
          <div style={{ position: "absolute", inset: 2, display: "grid", gridTemplateColumns: "repeat(36, 1fr)", gridTemplateRows: "repeat(10, 1fr)", gap: 0.5, opacity: hover ? 1 : 0, transition: "opacity 0.15s ease", zIndex: 2 }}>
            {Array.from({ length: 360 }, (_, i) => {
              const dx = ((i % 36) / 35) - mousePos.x;
              const dy = (Math.floor(i / 36) / 9) - mousePos.y;
              const b = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 2.5);
              return <div key={i} style={{ background: b > 0.05 ? `rgba(${gridRgb},${b * 0.5})` : "transparent", transition: "background 0.04s linear" }} />;
            })}
          </div>
        )}
      </div>
      {hasGuide && (
        <div style={{
          background: dBg, borderRadius: "0 0 3px 3px", marginTop: -1,
          border: "1px solid rgba(0,0,0,0.12)", borderTop: "none",
        }}>
          <div style={{ height: 1, background: colors.lcdDim, margin: "0 6px" }} />
          <div style={{ padding: "6px 8px" }}>
            <div style={{ transform: "scale(0.65)", transformOrigin: "top left", width: "154%" }}>
              <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 16, color: colors.lcd, lineHeight: 1.5 }}>{guideText}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Lucy Mini (compact status display) ── */
export function LucyMini({ text, color, icon }) {
  return (
    <div style={{
      background: colors.screen, borderRadius: 3,
      padding: "5px 10px",
      boxShadow: shadows.screenInset,
      border: "1px solid rgba(0,0,0,0.12)",
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <PixelIcon icon={icon || "idle"} color={color || colors.lcd} size={14} />
      <span style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: color || colors.lcd }}>{text}</span>
    </div>
  );
}

/* ── Transport Button ── */
export function TransportBtn({ children, onClick, disabled, muted, dot, flex, style: sx }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "11px 0", border: "none", userSelect: "none",
      cursor: disabled ? "default" : "pointer",
      fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
      letterSpacing: "0.08em", textTransform: "uppercase",
      color: disabled ? "rgba(44,40,36,0.1)" : muted ? "rgba(44,40,36,0.35)" : colors.text,
      background: `linear-gradient(180deg, #F0ECE5 0%, ${colors.card} 100%)`,
      boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset",
      transition: "all 0.06s ease",
      ...(flex ? { flex: 1 } : { width: "100%" }),
      ...sx,
    }}>
      {dot && !disabled && <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent }} />}
      {children}
    </button>
  );
}

/* ── Cinematic Transition Screen ── */
export function Cinematic({ steps }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i + 1), 600 + i * 1400));
    return () => timers.forEach(clearTimeout);
  }, []);
  const atEnd = step >= steps.length;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: colors.screen,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.6s ease both",
      zIndex: 5,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          display: "inline-block",
          animation: step > 0 ? "lucyPulse 1.2s ease-in-out infinite" : "none",
          marginBottom: 20,
        }}>
          <PixelIcon icon="thinking" color={colors.accent} size={28} />
        </div>
        {step > 0 && (
          <div key={atEnd ? "final" : step} style={{
            fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 14, color: colors.accent,
            letterSpacing: "0.05em",
            animation: atEnd ? "lucyPulse 2s ease-in-out infinite" : `fadeIn 0.4s ${ease} both`,
          }}>
            {steps[Math.min(step - 1, steps.length - 1)]}...
          </div>
        )}
        {step > 0 && (
          <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 16 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: 4, height: 4,
                background: step > i ? colors.accent : "rgba(229,166,50,0.15)",
                transition: "background 0.3s ease",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Header ── */
export function Header({ label, onLogoClick, rightContent }) {
  return (
    <div style={{
      padding: "6px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: `1px solid ${colors.border}`,
      background: colors.panel,
      boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          onClick={onLogoClick}
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 2,
            background: colors.text, color: "#EDEAE4",
            boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
            cursor: onLogoClick ? "pointer" : "default",
          }}
        >
          LUCID
        </div>
      </div>
      {label && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "0 10px", borderRadius: 4, height: 24,
            background: "rgba(44,40,36,0.04)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{label}</span>
          </div>
          {rightContent}
        </div>
      )}
    </div>
  );
}

/* ── Page Shell ── */
export function PageShell({ children }) {
  return (
    <div style={{
      height: "100vh", overflow: "hidden",
      fontFamily: fonts.primary, color: colors.text,
      background: colors.rootBg,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, ${colors.gradientTop} 0%, ${colors.gradientBottom} 100%)`,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── Scrollable Content Area ── */
export function ScrollArea({ children, className }) {
  return (
    <div className={className} style={{ flex: 1, overflowY: "auto", position: "relative" }}>
      {children}
    </div>
  );
}

/* ── Canvas (centered content area) ── */
export function Canvas({ children, padding = "32px 48px 60px", maxWidth = 560 }) {
  return (
    <div style={{ padding }}>
      <div style={{ maxWidth, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
