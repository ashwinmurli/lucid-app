/* ═══════════════════════════════════════════════════════════════
   LUCID — Tension Pairs Module
   Toggle to select. Selected float to top. Max 3.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, TransportBtn } from "../components/ui";

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
  support: { key: "S", desc: "HELP ME" },
  challenge: { key: "C", desc: "PUSH ME" },
};

/* ── Fader-style toggle switch ── */
function FaderToggle({ isOn, onToggle, disabled }) {
  const canToggle = !disabled;
  return (
    <button
      onClick={canToggle ? onToggle : undefined}
      style={{
        width: 44, height: 22, borderRadius: 4, border: "none",
        cursor: canToggle ? "pointer" : "default",
        background: isOn ? colors.personality : "#D0CDC5",
        boxShadow: isOn
          ? "0 1px 3px rgba(0,0,0,0.1)"
          : "0 1px 3px rgba(0,0,0,0.06) inset, 0 1px 0 rgba(255,255,255,0.4)",
        position: "relative", transition: `all 0.2s ${ease}`, flexShrink: 0,
        padding: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 3,
        background: "linear-gradient(180deg, #FAFAF7 0%, #E8E5DD 100%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
        position: "absolute", top: 2,
        left: isOn ? 24 : 2,
        transition: `left 0.2s ${ease}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isOn ? (
          <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
            <path d="M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z" fill="rgba(44,40,36,0.5)" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
            <path d="M4 11h16v2H4z" fill="rgba(44,40,36,0.25)" />
          </svg>
        )}
      </div>
    </button>
  );
}

function TensionCard({ pair, isSelected, onToggle, disabled }) {
  const [hover, setHover] = useState(false);
  const canToggle = !disabled || isSelected;
  const isLocked = isSelected && disabled;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: colors.card, borderRadius: 4,
        border: `1px solid ${isSelected ? "rgba(255,140,66,0.15)" : colors.border}`,
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
          <FaderToggle isOn={isSelected} onToggle={canToggle ? onToggle : undefined} disabled={!canToggle} />
        )}
      </div>
      <div style={{ height: 1, background: "rgba(255,140,66,0.06)" }} />
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: colors.personality, boxShadow: "0 0 4px rgba(255,140,66,0.3)" }} />
        <div style={{ fontFamily: fonts.pixel, fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,140,66,0.45)", lineHeight: 1.5 }}>{pair.reason}</div>
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
  const [aiMode, setAiMode] = useState("challenge");

  const allCandidates = [...TENSION_CANDIDATES, ...customPairs];
  const selected = allCandidates.filter((c) => selectedIds.has(c.id));
  const unselected = allCandidates.filter((c) => !selectedIds.has(c.id));
  const count = selectedIds.size;

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
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${colors.gradientTop} 0%, ${colors.gradientBottom} 100%)`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px", animation: `fadeIn 0.6s ${ease} both` }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.personality }} />
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

            {/* Lucy Module — locked state */}
            <div style={{
              marginTop: 16,
              background: colors.lucySurface,
              backgroundImage: colors.lucyGrain,
              border: `1px solid ${colors.lucyBorder}`,
              boxShadow: colors.lucyShadow,
              borderRadius: 8,
              overflow: "hidden",
            }}>
              <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 40, height: 30,
                  background: colors.eink, borderRadius: 2,
                  border: `1px solid ${colors.einkBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <PixelIcon icon="approves" color={colors.ink} size={18} />
                </div>
                <span style={{
                  fontFamily: fonts.pixel, fontSize: 10, letterSpacing: "0.08em",
                  color: colors.lucyStatusText, lineHeight: 1, flex: 1,
                }}>TENSIONS DEFINED</span>
              </div>
            </div>

            {onComplete && (
              <div style={{ marginTop: 24 }}>
                <TransportBtn onClick={() => onComplete(getData())} dot>CONTINUE</TransportBtn>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${colors.gradientTop} 0%, ${colors.gradientBottom} 100%)`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
            <span style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: colors.personality, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{count}/3</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px", animation: `promptIn 0.5s ${ease} both` }}>
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
            <div style={{ background: colors.recess, borderRadius: 6, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 10px" }}><input value={customQuality} onChange={(e) => setCustomQuality(e.target.value)} placeholder="Quality..." style={{ width: "100%", background: "transparent", border: "none", fontSize: 18, fontWeight: 600, color: colors.text, outline: "none", fontFamily: fonts.primary, letterSpacing: "-0.01em" }} /></div>
              <div style={{ margin: "0 16px", padding: "6px 0", borderTop: "1px solid rgba(44,40,36,0.04)", borderBottom: "1px solid rgba(44,40,36,0.04)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(44,40,36,0.12)", textTransform: "uppercase" }}>BUT NEVER</div>
              <div style={{ padding: "10px 16px 14px" }}><input value={customExcess} onChange={(e) => setCustomExcess(e.target.value)} placeholder="Excess..." style={{ width: "100%", background: "transparent", border: "none", fontSize: 18, fontWeight: 300, color: "rgba(44,40,36,0.5)", outline: "none", fontFamily: fonts.primary, letterSpacing: "-0.01em" }} onKeyDown={(e) => { if (e.key === "Enter" && customQuality.trim() && customExcess.trim()) addCustomPair(); }} /></div>
              <div style={{ height: 1, background: colors.border }} />
              <TransportBtn onClick={addCustomPair} disabled={!customQuality.trim() || !customExcess.trim()}>ADD PAIR</TransportBtn>
            </div>
          </div>

          {/* Lucy Module — brushed warm aluminum */}
          <div style={{
            marginTop: 24,
            background: colors.lucySurface,
            backgroundImage: colors.lucyGrain,
            border: `1px solid ${colors.lucyBorder}`,
            boxShadow: colors.lucyShadow,
            borderRadius: 8,
            overflow: "hidden",
          }}>
            {/* Top strip: e-ink icon + status + mode switch */}
            <div style={{
              padding: "8px 10px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {/* E-ink badge */}
              <div style={{
                width: 40, height: 30,
                background: colors.eink, borderRadius: 2,
                border: `1px solid ${colors.einkBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <PixelIcon icon={lucyMode === "thinking" ? "thinking" : aiMode === "support" ? "guide" : "idle"} color={colors.ink} size={18} />
              </div>

              {/* Status label */}
              <span style={{
                fontFamily: fonts.pixel, fontSize: 10, letterSpacing: "0.08em",
                color: colors.lucyStatusText, lineHeight: 1, flex: 1,
              }}>{lucyMode === "thinking" ? "COMPOSING" : aiMode === "support" ? "SUPPORT" : "READY"}</span>

              {/* E-ink segmented switch */}
              <div style={{
                display: "flex", borderRadius: 3,
                background: colors.eink,
                border: `1px solid ${colors.einkBorder}`,
                padding: 2,
              }}>
                {Object.entries(MODES).map(([key, m]) => (
                  <button key={key}
                    onClick={() => setAiMode(key)}
                    style={{
                      height: 24, borderRadius: 2, border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 10px",
                      fontFamily: fonts.pixel, fontSize: 9, letterSpacing: "0.08em",
                      color: aiMode === key ? colors.eink : "#8A857E",
                      background: aiMode === key ? colors.ink : "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >{key === "support" ? "SUPPORT" : "CHALLENGE"}</button>
                ))}
              </div>
            </div>

            {/* Guide text (when in support mode) */}
            {aiMode === "support" && (
              <div style={{ borderTop: `1px solid ${colors.lucyBorder}`, padding: "8px 12px" }}>
                <div style={{
                  fontFamily: fonts.pixel, fontSize: 10, letterSpacing: "0.08em",
                  color: colors.lucyStatusText, lineHeight: 1.5,
                }}>What quality defines this brand — and what's the line it should never cross?</div>
              </div>
            )}
          </div>

          {count === 3 && (
            <div style={{ marginTop: 24, animation: `fadeIn 0.4s ${ease} both` }}>
              <TransportBtn onClick={() => setLocked(true)} dot>LOCK THESE IN</TransportBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
