/* ═══════════════════════════════════════════════════════════════
   LUCID — Core Values
   Toggle selection + Lucy refine. TX-6 inspired fader interactions.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

const VALUE_CANDIDATES = [
  { id: 1, word: "Intentionality", reason: "Every detail is chosen, never accidental.", draft: "We choose carefully — every decision, every detail, every word has a reason behind it.", refines: ["We act with purpose. Nothing is accidental, nothing is filler.", "Every choice we make is deliberate — from what we build to what we refuse to build."] },
  { id: 2, word: "Honesty", reason: "They tell the truth with care, never as a weapon.", draft: "We tell the truth, even when it's uncomfortable — but always with care, never cruelty.", refines: ["Honesty isn't bluntness. We speak clearly and kindly, even when the message is hard.", "We'd rather lose a deal than mislead someone. Truth is how we build trust."] },
  { id: 3, word: "Craft", reason: "Quality in the quiet details. The espresso cup already washed.", draft: "We care about the work behind the work — the details no one asked for but everyone feels.", refines: ["The invisible effort matters most. We refine until it feels effortless.", "Craft means caring about what people will never consciously notice."] },
  { id: 4, word: "Restraint", reason: "No visible logos, no excess celebration.", draft: "We know when to stop. The power is in what we leave out, not what we pile on.", refines: ["Less, but better. We edit ruthlessly and trust the space we leave behind.", "Restraint isn't timidity — it's the confidence to let the work breathe."] },
  { id: 5, word: "Warmth", reason: "Short sentences but deep care.", draft: "We show up with genuine warmth — not performed friendliness, but real human care.", refines: ["Warmth isn't a tone of voice. It's making people feel seen before we say a word.", "We care loudly through actions and quietly through attention."] },
  { id: 6, word: "Independence", reason: "They already know where they're going.", draft: "We follow our own compass. Popular opinion is interesting but not instructive.", refines: ["We'd rather be right later than trendy now.", "Independence means having the courage to build what we believe in, not what's expected."] },
  { id: 7, word: "Curiosity", reason: "Process lights them up. How things are made.", draft: "We stay hungry for how things work — the process, the system, the thing behind the thing.", refines: ["Curiosity keeps us honest. The moment we stop asking why, we start getting stale.", "We're drawn to the mechanics of things — how they're built, why they break, what's next."] },
  { id: 8, word: "Resilience", reason: "Wasted potential angers them. They push through.", draft: "We don't quit when it gets hard. Setbacks are data, not verdicts.", refines: ["Resilience isn't stubbornness — it's the ability to adapt without losing direction.", "We bounce forward, not back. Every failure teaches us something we couldn't learn any other way."] },
];

function ValueCard({ value, isSelected, onSelect, onUpdateDef, onRefine, onRemove, index }) {
  const [hover, setHover] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = () => {
    if (!refineInput.trim()) return;
    setIsRefining(true);
    // Simulate Lucy thinking
    setTimeout(() => {
      onRefine(refineInput.trim());
      setRefineInput("");
      setIsRefining(false);
    }, 800);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: S.card, borderRadius: 4,
        border: `1px solid ${isSelected ? "rgba(229,166,50,0.15)" : "rgba(44,40,36,0.06)"}`,
        boxShadow: isSelected
          ? "0 2px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.5) inset"
          : hover
            ? "0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.5) inset"
            : S.raised,
        overflow: "hidden",
        transition: `all 0.2s ${ease}`,
        transform: hover && !isSelected ? "translateY(-1px)" : "translateY(0)",
        animation: `promptIn 0.4s ${ease} ${index * 0.06}s both`,
      }}
    >
      {/* Word + toggle */}
      <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: S.text, letterSpacing: "-0.01em" }}>{value.word}</div>
        <button onClick={isSelected ? onRemove : onSelect} style={{
          width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
          background: isSelected ? S.accent : S.recess,
          boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.06) inset, 0 1px 0 rgba(255,255,255,0.4)",
          position: "relative", transition: "all 0.2s ease", flexShrink: 0,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            background: isSelected ? "#fff" : S.card,
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
            position: "absolute", top: 2,
            left: isSelected ? 18 : 2,
            transition: "left 0.2s ease",
          }} />
        </button>
      </div>

      {/* Unselected: short reason */}
      {!isSelected && (
        <div style={{ padding: "6px 16px 14px", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: S.accent, boxShadow: "0 0 4px rgba(229,166,50,0.3)" }} />
          <div style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 10, color: "rgba(229,166,50,0.45)", lineHeight: 1.5 }}>{value.reason}</div>
        </div>
      )}

      {/* Selected: Lucy's definition (editable) + refinement input */}
      {isSelected && (
        <div style={{ animation: `fadeIn 0.3s ${ease} both` }}>
          {/* Editable definition */}
          <div style={{ padding: "10px 16px 0" }}>
            <textarea
              value={value.definition || ""}
              onChange={(e) => onUpdateDef(e.target.value)}
              rows={2}
              style={{
                width: "100%", background: "transparent", border: "none",
                fontSize: 13, fontWeight: 400, lineHeight: 1.65, color: S.text,
                resize: "none", outline: "none", fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {/* Refinement area */}
          <div style={{ padding: "0 16px 12px" }}>
            <div style={{
              background: S.recess, borderRadius: 4,
              border: `1px solid ${S.border}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.03) inset",
              overflow: "hidden",
            }}>
              <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", flexShrink: 0, background: isRefining ? S.accent : "rgba(229,166,50,0.25)", transition: "background 0.3s ease" }} />
                <input
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  placeholder="Tell Lucy how to refine this..."
                  onKeyDown={(e) => { if (e.key === "Enter") handleRefine(); }}
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    fontSize: 11, fontWeight: 400, color: S.text,
                    outline: "none", fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                {refineInput.trim() && (
                  <button onClick={handleRefine} style={{
                    fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: isRefining ? "rgba(229,166,50,0.3)" : S.accent,
                    background: "none", border: "none", cursor: "pointer",
                    transition: "color 0.15s ease", flexShrink: 0,
                  }}>
                    {isRefining ? "REFINING..." : "REFINE"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */
export default function CoreValues({ onBack } = {}) {
  const [values, setValues] = useState(VALUE_CANDIDATES.map((v) => ({ ...v, definition: "", selected: false })));
  const [customWord, setCustomWord] = useState("");
  const [lucyMode, setLucyMode] = useState("idle");
  const [aiMode, setAiMode] = useState("guide");
  const [hoveredAiMode, setHoveredAiMode] = useState(null);
  const [locked, setLocked] = useState(false);

  const selectedValues = values.filter((v) => v.selected);
  const unselectedValues = values.filter((v) => !v.selected);
  const canLock = selectedValues.length === 3 && selectedValues.every((v) => v.definition.trim());
  const hoveredModeInfo = hoveredAiMode ? MODES[hoveredAiMode] : null;

  const selectValue = (id) => {
    if (selectedValues.length >= 3) return;
    const candidate = VALUE_CANDIDATES.find((c) => c.id === id);
    setValues((prev) => prev.map((v) => v.id === id ? { ...v, selected: true, definition: candidate?.draft || v.reason } : v));
  };

  const removeValue = (id) => {
    setValues((prev) => prev.map((v) => v.id === id ? { ...v, selected: false, definition: "" } : v));
  };

  const updateDef = (id, def) => {
    setValues((prev) => prev.map((v) => v.id === id ? { ...v, definition: def } : v));
  };

  const refineValue = (id, userNote) => {
    // Simulate Lucy rewriting — pick from pre-written alternatives
    const candidate = VALUE_CANDIDATES.find((c) => c.id === id);
    if (candidate && candidate.refines) {
      const current = values.find((v) => v.id === id);
      const unused = candidate.refines.find((r) => r !== current?.definition);
      if (unused) setValues((prev) => prev.map((v) => v.id === id ? { ...v, definition: unused } : v));
    }
  };

  const addCustom = () => {
    if (!customWord.trim()) return;
    setValues((prev) => [...prev, { id: 100 + prev.length, word: customWord.trim(), reason: "Your own value — you know this brand best.", definition: "", selected: true }]);
    setCustomWord("");
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", color: S.text, position: "relative", background: "#D8D5CE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes lucyPulse { 0%, 100% { opacity:0.7; } 50% { opacity:1; } }
        textarea:focus, input:focus { outline:none; }
        ::selection { background:rgba(229,166,50,0.12); }
        textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* ══ CANVAS ══ */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #EDEAE4 0%, #E5E2DB 100%)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Values</span>
              <span style={{ fontSize: 9, color: "rgba(44,40,36,0.35)" }}>–</span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{locked ? "Locked" : "Core Values"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 10, color: canLock || locked ? S.accent : S.lcd, lineHeight: 1 }}>{selectedValues.length}/3</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ height: "calc(100% - 40px)", overflowY: "auto" }}>

          {/* ═══ WORKSPACE ═══ */}
          {!locked && (
            <div style={{ padding: "40px 48px 60px", animation: `promptIn 0.5s ${ease} both` }}>
              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>Define the values</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Toggle three values and write what each one means for this brand.</p>
                </div>

                {/* Selected — float to top */}
                {selectedValues.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 10 }}>SELECTED</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {selectedValues.map((v, i) => (
                        <div key={v.id} style={{ animation: `promptIn 0.3s ${ease} both` }}>
                          <ValueCard value={v} index={i} isSelected onSelect={() => removeValue(v.id)} onRemove={() => removeValue(v.id)} onUpdateDef={(def) => updateDef(v.id, def)} onRefine={(note) => refineValue(v.id, note)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                {selectedValues.length > 0 && unselectedValues.length > 0 && (
                  <div style={{ height: 1, background: "rgba(44,40,36,0.06)", margin: "8px 0 16px" }} />
                )}

                {/* Candidates */}
                {unselectedValues.length > 0 && (
                  <div>
                    {selectedValues.length > 0 && <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 10 }}>CANDIDATES</div>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {unselectedValues.map((v, i) => (
                        <div key={v.id} style={{ opacity: selectedValues.length >= 3 ? 0.5 : 1, transition: "opacity 0.2s ease", animation: `promptIn 0.4s ${ease} ${i * 0.06}s both` }}>
                          <ValueCard value={v} index={i} isSelected={false} onSelect={() => selectValue(v.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Write your own */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>OR ADD YOUR OWN</div>
                  <div>
                    <div style={{ background: S.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${S.border}`, borderBottom: "none", overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px" }}>
                        <input value={customWord} onChange={(e) => setCustomWord(e.target.value)} placeholder="Value word..." style={{ width: "100%", background: "transparent", border: "none", fontSize: 18, fontWeight: 600, color: S.text, outline: "none", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em" }} onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }} />
                      </div>
                      <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                      <button onClick={addCustom} disabled={!customWord.trim() || selectedValues.length >= 3}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "none", cursor: customWord.trim() && selectedValues.length < 3 ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: customWord.trim() && selectedValues.length < 3 ? S.text : "rgba(44,40,36,0.1)", background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.06s ease" }}>
                        ADD & SELECT
                      </button>
                    </div>
                    <div style={{ background: S.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${S.border}`, borderTop: `1px solid rgba(44,40,36,0.04)`, padding: "6px 8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <LucyScreen mode={lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode}
                            guideText={aiMode === "guide" ? "Pick the values that feel essential — not aspirational. What does this brand already live by?" : null} />
                        </div>
                        <div style={{ display: "flex", borderRadius: 3, flexShrink: 0, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.4)", padding: 2, marginTop: 2 }}>
                          {Object.entries(MODES).map(([key, m]) => (<button key={key} onClick={() => setAiMode(key)} onMouseEnter={() => setHoveredAiMode(key)} onMouseLeave={() => setHoveredAiMode(null)} style={{ width: 28, height: 22, borderRadius: 2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", color: aiMode === key ? "#EDEAE4" : "rgba(44,40,36,0.2)", background: aiMode === key ? S.accent : "transparent", boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,180,140,0.1) inset" : "none", transition: "all 0.15s ease" }}>{m.key}</button>))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lock */}
                {canLock && (
                  <div style={{ marginTop: 16, animation: `fadeIn 0.4s ${ease} both` }}>
                    <button onClick={() => setLocked(true)} style={{
                      width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase", color: S.text,
                      background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                      boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />
                      LOCK VALUES
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ LOCKED — final composition ═══ */}
          {locked && (
            <div style={{ padding: "8vh 48px 60px", animation: `fadeIn 0.6s ${ease} both` }}>
              <div style={{ maxWidth: 580, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 4, marginBottom: 16,
                    background: "rgba(44,40,36,0.04)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: S.accent, boxShadow: "0 0 6px rgba(229,166,50,0.3)" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.3)" }}>VALUES LOCKED</span>
                  </div>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>
                    What they stand for.
                  </h2>
                </div>

                {selectedValues.map((v, i) => (
                  <div key={v.id} style={{ marginBottom: 32, animation: `promptIn 0.5s ${ease} ${i * 0.15}s both` }}>
                    <div style={{ fontSize: 28, fontWeight: 600, color: S.text, letterSpacing: "-0.02em", marginBottom: 6 }}>{v.word}</div>
                    <div style={{ fontSize: 14, fontWeight: 400, color: "rgba(44,40,36,0.4)", lineHeight: 1.6 }}>{v.definition}</div>
                    {i < 2 && <div style={{ height: 1, background: "rgba(44,40,36,0.06)", marginTop: 32 }} />}
                  </div>
                ))}

                {/* Lucy summary */}
                <div style={{ maxWidth: 340, margin: "40px auto 0" }}>
                  <div style={{ background: S.screen, borderRadius: 4, padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                      <PixelIcon icon="approves" color={S.lcdBright} size={14} />
                      <span style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 10, color: S.lcdBright }}>VALUES COMPLETE</span>
                    </div>
                    <div style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 9, color: S.lcdDim }}>
                      3 values · defined
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
