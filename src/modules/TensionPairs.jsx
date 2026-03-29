/* ═══════════════════════════════════════════════════════════════
   LUCID — Tension Pairs Module
   Toggle to select. Selected float to top. Max 3.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

const TENSION_CANDIDATES = [
  { id: 1, quality: "Intentional", excess: "Rigid", reason: "They choose carefully — but never box themselves in." },
  { id: 2, quality: "Confident", excess: "Arrogant", reason: "They know their worth without needing to prove it." },
  { id: 3, quality: "Warm", excess: "Soft", reason: "They care deeply but won't lower their standards." },
  { id: 4, quality: "Honest", excess: "Blunt", reason: "They tell the truth with care, never as a weapon." },
  { id: 5, quality: "Refined", excess: "Precious", reason: "They appreciate quality without being untouchable." },
  { id: 6, quality: "Driven", excess: "Obsessive", reason: "They push forward but know when to pause." },
  { id: 7, quality: "Understated", excess: "Invisible", reason: "They let work speak — but still make sure it's heard." },
];

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

function TensionCard({ pair, isSelected, onToggle, disabled }) {
  const [hover, setHover] = useState(false);
  const canToggle = !disabled || isSelected;
  const isLocked = isSelected && disabled;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: colors.card, borderRadius: 4,
        border: `1px solid ${isSelected ? "rgba(229,166,50,0.15)" : colors.border}`,
        boxShadow: hover && canToggle ? shadows.cardHover : shadows.raised,
        overflow: "hidden", transition: `all 0.15s ${ease}`,
        transform: hover && canToggle && !isSelected ? "translateY(-1px)" : "translateY(0)",
        opacity: !isSelected && disabled ? 0.5 : 1,
      }}>
      <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 300, color: colors.text, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
          <span style={{ fontWeight: 600 }}>{pair.quality}</span>
          <span style={{ color: "rgba(44,40,36,0.2)" }}>, but never </span>
          <span style={{ color: "rgba(44,40,36,0.35)" }}>{pair.excess.toLowerCase()}</span>
        </div>
        {!isLocked && (
          <button onClick={canToggle ? onToggle : undefined} style={{
            width: 36, height: 20, borderRadius: 10, border: "none",
            cursor: canToggle ? "pointer" : "default",
            background: isSelected ? colors.accent : colors.recess,
            boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.06) inset, 0 1px 0 rgba(255,255,255,0.4)",
            position: "relative", transition: "all 0.2s ease", flexShrink: 0, marginTop: 2,
          }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: isSelected ? "#fff" : colors.card, boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset", position: "absolute", top: 2, left: isSelected ? 18 : 2, transition: "left 0.2s ease" }} />
          </button>
        )}
      </div>
      <div style={{ height: 1, background: "rgba(229,166,50,0.06)" }} />
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: colors.accent, boxShadow: "0 0 4px rgba(229,166,50,0.3)" }} />
        <div style={{ fontFamily: fonts.pixel, fontSize: 10, color: "rgba(229,166,50,0.45)", lineHeight: 1.5 }}>{pair.reason}</div>
      </div>
    </div>
  );
}

export default function TensionPairs({ onComplete, onBack }) {
  const [customQuality, setCustomQuality] = useState("");
  const [customExcess, setCustomExcess] = useState("");
  const [customPairs, setCustomPairs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [locked, setLocked] = useState(false);
  const [lucyMode, setLucyMode] = useState("idle");
  const [aiMode, setAiMode] = useState("guide");
  const [hoveredAiMode, setHoveredAiMode] = useState(null);

  const allCandidates = [...TENSION_CANDIDATES, ...customPairs];
  const selected = allCandidates.filter((c) => selectedIds.has(c.id));
  const unselected = allCandidates.filter((c) => !selectedIds.has(c.id));
  const count = selectedIds.size;
  const hoveredModeInfo = hoveredAiMode ? MODES[hoveredAiMode] : null;

  const togglePair = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const addCustomPair = () => {
    if (!customQuality.trim() || !customExcess.trim()) return;
    setCustomPairs((prev) => [...prev, { id: 100 + prev.length, quality: customQuality.trim(), excess: customExcess.trim(), reason: "Your own tension — you know this brand best." }]);
    setCustomQuality(""); setCustomExcess("");
  };

  const getData = () => selected.map((p) => ({ quality: p.quality, excess: p.excess }));

  if (locked) {
    return (
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #EDEAE4 0%, #E5E2DB 100%)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Tensions</span>
            <span style={{ fontSize: 9, color: "rgba(44,40,36,0.35)" }}>–</span>
            <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Locked</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ padding: "8vh 48px 60px", animation: `fadeIn 0.6s ${ease} both` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.accent }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.3)" }}>TENSIONS LOCKED</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>The lines they never cross.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {selected.map((pair, i) => (
              <div key={pair.id} style={{ animation: `promptIn 0.4s ${ease} ${i * 0.12}s both` }}>
                <TensionCard pair={pair} isSelected disabled />
              </div>
            ))}
          </div>
          <div style={{ maxWidth: 260, margin: "32px auto 0" }}>
            <LucyMini text="TENSIONS DEFINED" color={colors.lcdBright} icon="approves" />
          </div>
          {onComplete && (
            <div style={{ marginTop: 24 }}>
              <TransportBtn onClick={() => onComplete(getData())} dot>CONTINUE</TransportBtn>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #EDEAE4 0%, #E5E2DB 100%)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Tensions</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcd, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{count}/3</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ padding: "40px 48px 60px", animation: `promptIn 0.5s ${ease} both` }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>Define the tensions</h2>
          <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Toggle three tensions that feel most true.</p>
        </div>

        {selected.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.muted, marginBottom: 10 }}>SELECTED</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selected.map((pair) => (<div key={pair.id} style={{ animation: `promptIn 0.3s ${ease} both` }}><TensionCard pair={pair} isSelected onToggle={() => togglePair(pair.id)} /></div>))}
            </div>
          </div>
        )}
        {selected.length > 0 && unselected.length > 0 && (<div style={{ height: 1, background: colors.border, margin: "8px 0 16px" }} />)}
        {unselected.length > 0 && (
          <div>
            {selected.length > 0 && <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.muted, marginBottom: 10 }}>CANDIDATES</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {unselected.map((pair, i) => (<div key={pair.id} style={{ animation: `promptIn 0.4s ${ease} ${i * 0.06}s both` }}><TensionCard pair={pair} isSelected={false} onToggle={() => togglePair(pair.id)} disabled={count >= 3} /></div>))}
            </div>
          </div>
        )}

        {/* Write your own */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.muted, marginBottom: 8 }}>OR WRITE YOUR OWN</div>
          <div style={{ background: colors.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${colors.border}`, borderBottom: "none", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px 10px" }}><input value={customQuality} onChange={(e) => setCustomQuality(e.target.value)} placeholder="Quality..." style={{ width: "100%", background: "transparent", border: "none", fontSize: 18, fontWeight: 600, color: colors.text, outline: "none", fontFamily: fonts.primary, letterSpacing: "-0.01em" }} /></div>
            <div style={{ margin: "0 16px", padding: "6px 0", borderTop: "1px solid rgba(44,40,36,0.04)", borderBottom: "1px solid rgba(44,40,36,0.04)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(44,40,36,0.12)", textTransform: "uppercase" }}>BUT NEVER</div>
            <div style={{ padding: "10px 16px 14px" }}><input value={customExcess} onChange={(e) => setCustomExcess(e.target.value)} placeholder="Excess..." style={{ width: "100%", background: "transparent", border: "none", fontSize: 18, fontWeight: 300, color: "rgba(44,40,36,0.5)", outline: "none", fontFamily: fonts.primary, letterSpacing: "-0.01em" }} onKeyDown={(e) => { if (e.key === "Enter" && customQuality.trim() && customExcess.trim()) addCustomPair(); }} /></div>
            <div style={{ height: 1, background: colors.border }} />
            <TransportBtn onClick={addCustomPair} disabled={!customQuality.trim() || !customExcess.trim()}>ADD PAIR</TransportBtn>
          </div>
          <div style={{ background: colors.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${colors.border}`, borderTop: "1px solid rgba(44,40,36,0.04)", padding: "6px 8px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
              <div style={{ flex: 1, minWidth: 0 }}><LucyScreen mode={lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode} guideText={aiMode === "guide" ? "What quality defines this brand — and what's the line it should never cross?" : null} /></div>
              <div style={{ display: "flex", borderRadius: 3, flexShrink: 0, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.4)", padding: 2, marginTop: 2 }}>
                {Object.entries(MODES).map(([key, m]) => (<button key={key} onClick={() => setAiMode(key)} onMouseEnter={() => setHoveredAiMode(key)} onMouseLeave={() => setHoveredAiMode(null)} style={{ width: 28, height: 22, borderRadius: 2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.primary, fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", color: aiMode === key ? "#EDEAE4" : "rgba(44,40,36,0.2)", background: aiMode === key ? colors.accent : "transparent", boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,180,140,0.1) inset" : "none", transition: "all 0.15s ease" }}>{m.key}</button>))}
              </div>
            </div>
          </div>
        </div>

        {count === 3 && (
          <div style={{ marginTop: 24, animation: `fadeIn 0.4s ${ease} both` }}>
            <TransportBtn onClick={() => setLocked(true)} dot>LOCK THESE IN</TransportBtn>
          </div>
        )}
      </div>
    </div>
    </div>
    </div>
  );
}
