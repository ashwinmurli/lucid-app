/* ═══════════════════════════════════════════════════════════════
   LUCID — Shared Components
   Reusable UI components used across all modules.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from "react";
import { S, colors, shadows, ease, fonts } from "../lib/tokens";

/* ── Lucy's pixel icons (5x5 grid patterns) ── */
export const LUCY_ICONS = {
  off:      "0010001010100010101000100",
  idle:     "0111011011100011101101110",
  thinking: "0111000011011101100001110",
  approves: "0000100010101000100000000",
  guide:    "0010001010001000010001110",
  cocreate: "0101001010001000101001010",
};

/* ── Pixel Icon ── */
export function PixelIcon({ pattern, color, size = 2 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(5, ${size}px)`,
      gridTemplateRows: `repeat(5, ${size}px)`,
      gap: size > 1 ? 0.5 : 0,
      flexShrink: 0,
    }}>
      {pattern.split("").map((p, i) => (
        <div key={i} style={{ background: p === "1" ? color : "transparent" }} />
      ))}
    </div>
  );
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
  if (isThinking) es = { label: "COMPOSING", icon: "thinking", bg: "#2E1E14", text: colors.accent };
  else if (mode === "approves") es = { label: "NOTED", icon: "approves", bg: "#162216", text: colors.lcdBright };
  else es = { label: MODES[aiMode]?.label || "READY", icon: MODES[aiMode]?.icon || "idle", bg: "#1A2019", text: colors.lcd };
  if (mode === "off") es = { label: "LUCY", icon: "off", bg: colors.screen, text: colors.lcdDim };

  const gridRgb = es.text === colors.accent ? "212,115,74" : es.text === colors.lcdBright ? "160,200,160" : "122,154,122";
  const smi = hoveredModeInfo && isActive;
  const dIcon = smi ? (hoveredModeInfo.key === "GDE" ? "guide" : hoveredModeInfo.key === "CRT" ? "cocreate" : "idle") : es.icon;
  const dLabel = smi ? hoveredModeInfo.desc : es.label;
  const dColor = smi ? colors.lcd : es.text;
  const dBg = smi ? "#1A2019" : es.bg;

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
            <PixelIcon pattern={LUCY_ICONS[dIcon] || LUCY_ICONS.off} color={dColor} size={2} />
          </div>
          <span style={{ fontFamily: fonts.pixel, fontSize: 10, color: dColor, lineHeight: 1, transition: "color 0.3s ease" }}>{dLabel}</span>
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
              <div style={{ fontFamily: fonts.pixel, fontSize: 16, color: colors.lcd, lineHeight: 1.5 }}>{guideText}</div>
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
      <PixelIcon pattern={LUCY_ICONS[icon || "idle"]} color={color || colors.lcd} size={2} />
      <span style={{ fontFamily: fonts.pixel, fontSize: 10, color: color || colors.lcd }}>{text}</span>
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
      color: disabled ? "rgba(61,56,48,0.1)" : muted ? "rgba(61,56,48,0.35)" : colors.text,
      background: `linear-gradient(180deg, #F2EDE5 0%, ${colors.card} 100%)`,
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
          <PixelIcon pattern={LUCY_ICONS.thinking} color={colors.accent} size={4} />
        </div>
        {step > 0 && (
          <div key={atEnd ? "final" : step} style={{
            fontFamily: fonts.pixel, fontSize: 14, color: colors.accent,
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
                background: step > i ? colors.accent : "rgba(212,115,74,0.15)",
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
            background: colors.text, color: "#EDE9E1",
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
            background: "rgba(61,56,48,0.04)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(61,56,48,0.35)" }}>{label}</span>
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
