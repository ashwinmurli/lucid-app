/* ═══════════════════════════════════════════════════════════════
   LUCID — Core Values
   Toggle selection + Lucy refine. Fader-style toggles.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, getLucyIcon, LucyActionCard } from "../components/ui";
import { askLucyStream } from "../lib/lucy";

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

/* Fader-style toggle — same as TensionPairs but using colors.values */
function FaderToggle({ isOn, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 22, borderRadius: 4, border: "none", cursor: "pointer",
      background: isOn ? colors.values : "#D0CDC5",
      boxShadow: isOn
        ? "0 1px 3px rgba(0,0,0,0.1)"
        : "0 1px 3px rgba(0,0,0,0.06) inset, 0 1px 0 rgba(255,255,255,0.4)",
      position: "relative", transition: "all 0.2s ease", flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 3,
        background: "linear-gradient(180deg, #F8F6F2 0%, #E8E5DE 100%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
        position: "absolute", top: 2,
        left: isOn ? 24 : 2,
        transition: `left 0.2s ${ease}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isOn ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.5L4 7.5L8 3" stroke={colors.values} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 5H7" stroke="#A09B93" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

function ValueCard({ value, isSelected, onSelect, onUpdateDef, onRefine, onRemove, index }) {
  const [hover, setHover] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!refineInput.trim()) return;
    setIsRefining(true);
    await onRefine(refineInput.trim());
    setRefineInput("");
    setIsRefining(false);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: S.card, borderRadius: 4,
        border: "1px solid rgba(44,40,36,0.06)",
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
        <FaderToggle isOn={isSelected} onClick={isSelected ? onRemove : onSelect} />
      </div>

      {/* Unselected: short reason */}
      {!isSelected && (
        <div style={{ padding: "6px 16px 14px", marginTop: 12, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: colors.values, boxShadow: `0 0 4px ${colors.values}4D` }} />
          <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: `${colors.values}73`, lineHeight: 1.5 }}>{value.reason}</div>
        </div>
      )}

      {/* Selected: Lucy's definition on brushed aluminum + refinement input */}
      {isSelected && (
        <div style={{ marginTop: 12, animation: `fadeIn 0.3s ${ease} both` }}>
          {/* Lucy's draft definition — brushed aluminum surface */}
          <div style={{
            margin: "0 12px 12px", padding: "10px 12px", borderRadius: 4,
            background: colors.lucySurface,
            backgroundImage: colors.lucyGrain,
            border: `1px solid ${colors.lucyBorder}`,
          }}>
            <textarea
              value={value.definition || ""}
              onChange={(e) => onUpdateDef(e.target.value)}
              rows={2}
              style={{
                width: "100%", background: "transparent", border: "none",
                fontSize: 13, fontWeight: 400, lineHeight: 1.65, color: colors.lucyBodyText,
                resize: "none", outline: "none", fontFamily: fonts.primary,
              }}
            />
          </div>

          {/* Refinement area — Lucy e-ink badge + input */}
          <div style={{ padding: "0 12px 12px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: S.recess, borderRadius: 6,
              border: `1px solid ${S.border}`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset",
              padding: "8px 12px",
            }}>
              <div style={{
                width: 24, height: 18, background: colors.eink, borderRadius: 2,
                border: `1px solid ${colors.einkBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <PixelIcon icon="guide" color={colors.ink} size={10} />
              </div>
              <input
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                placeholder="Tell Lucy how to refine this..."
                onKeyDown={(e) => { if (e.key === "Enter") handleRefine(); }}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  fontSize: 13, color: S.text, fontFamily: fonts.primary,
                  outline: "none",
                }}
              />
              {refineInput.trim() && (
                <button onClick={handleRefine} style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: isRefining ? "rgba(44,40,36,0.2)" : colors.values,
                  background: "none", border: `1px solid ${isRefining ? "rgba(44,40,36,0.08)" : `${colors.values}40`}`,
                  borderRadius: 12, padding: "3px 10px",
                  cursor: "pointer", transition: "all 0.15s ease", flexShrink: 0,
                  fontFamily: fonts.primary,
                }}>
                  {isRefining ? "REFINING..." : "REFINE"}
                </button>
              )}
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
const PREREQ_NAV = [
  { keywords: ["personality", "brand personality"], target: "personality", label: "GO TO PERSONALITY" },
  { keywords: ["tension", "tensions"], target: "tensions", label: "GO TO TENSIONS" },
];

function getPrereqActions(response, navigateTo) {
  if (!response || !navigateTo) return [];
  const lower = response.toLowerCase();
  const seen = new Set();
  return PREREQ_NAV.filter(p => !seen.has(p.target) && p.keywords.some(k => lower.includes(k)) && (seen.add(p.target), true))
    .map(p => ({ icon: "push", label: p.label, onClick: () => navigateTo(p.target) }));
}

export default function CoreValues({ onBack, navigateTo } = {}) {
  const [values, setValues] = useState(VALUE_CANDIDATES.map((v) => ({ ...v, definition: "", selected: false })));
  const [customWord, setCustomWord] = useState("");
  const [lucyState, setLucyState] = useState("idle");
  const [lucyResponse, setLucyResponse] = useState("");
  const [locked, setLocked] = useState(false);

  const selectedValues = values.filter((v) => v.selected);
  const unselectedValues = values.filter((v) => !v.selected);
  const canLock = selectedValues.length === 3 && selectedValues.every((v) => v.definition.trim());

  const updateDef = (id, def) => {
    setValues((prev) => prev.map((v) => v.id === id ? { ...v, definition: def } : v));
  };

  const selectValue = async (id) => {
    if (selectedValues.length >= 3) return;
    const candidate = VALUE_CANDIDATES.find((c) => c.id === id);
    setValues((prev) => prev.map((v) => v.id === id ? { ...v, selected: true, definition: "" } : v));
    setLucyState("thinking");
    try {
      await askLucyStream(
        { module: "values", action: "draft_definition", moduleState: { value: candidate?.word, reason: candidate?.reason } },
        (chunk) => setValues((prev) => prev.map((v) => v.id === id ? { ...v, definition: chunk } : v))
      );
    } catch {
      setValues((prev) => prev.map((v) => v.id === id ? { ...v, definition: candidate?.draft || candidate?.reason || "" } : v));
    }
    setLucyState("idle");
  };

  const removeValue = (id) => {
    setValues((prev) => prev.map((v) => v.id === id ? { ...v, selected: false, definition: "" } : v));
  };

  const refineValue = async (id, userNote) => {
    const current = values.find((v) => v.id === id);
    try {
      await askLucyStream(
        { module: "values", action: "refine_definition", userInput: userNote, moduleState: { value: current?.word, currentDefinition: current?.definition } },
        (chunk) => setValues((prev) => prev.map((v) => v.id === id ? { ...v, definition: chunk } : v))
      );
    } catch {
      const candidate = VALUE_CANDIDATES.find((c) => c.id === id);
      if (candidate?.refines) {
        const unused = candidate.refines.find((r) => r !== current?.definition);
        if (unused) setValues((prev) => prev.map((v) => v.id === id ? { ...v, definition: unused } : v));
      }
    }
  };

  const handleValueAction = async (id, action) => {
    setLucyState("thinking"); setLucyResponse("");
    const current = values.find(v => v.id === id);
    try {
      await askLucyStream(
        { module: "values", action, userInput: action, moduleState: { value: current?.word, currentDefinition: current?.definition } },
        (chunk) => setLucyResponse(chunk)
      );
      setLucyState(action === "distinctive" ? "challenge" : "spark");
    } catch { setLucyState("idle"); }
  };

  const addCustom = () => {
    if (!customWord.trim()) return;
    setValues((prev) => [...prev, { id: 100 + prev.length, word: customWord.trim(), reason: "Your own value — you know this brand best.", definition: "", selected: true }]);
    setCustomWord("");
  };

  const oneLiner = useMemo(() => {
    if (lucyState === "thinking") return "Composing...";
    if (lucyState === "done") return "Noted.";
    if (selectedValues.length === 0) return "Pick three values that feel true.";
    if (selectedValues.length < 3) return `${selectedValues.length} of 3 selected.`;
    if (selectedValues.every(v => v.definition.trim())) return `${selectedValues.length} values defined. Looking strong.`;
    return `${selectedValues.length} of 3 selected.`;
  }, [lucyState, selectedValues]);

  const lucyActions = useMemo(() => {
    if (lucyState === "thinking") return [];
    if (lucyResponse) return [
      { icon: "check", label: "GOT IT", onClick: () => { setLucyState("done"); setTimeout(() => { setLucyResponse(""); setLucyState("idle"); }, 1000); } },
      ...getPrereqActions(lucyResponse, navigateTo),
    ];
    const sel = selectedValues.find(v => v.definition.trim());
    if (sel) return [
      { icon: "target", label: "MORE SPECIFIC", onClick: () => handleValueAction(sel.id, "specific") },
      { icon: "warning-diamond", label: "IS THIS DISTINCTIVE?", onClick: () => handleValueAction(sel.id, "distinctive") },
      { icon: "pen-square", label: "DIFFERENT ANGLE", onClick: () => handleValueAction(sel.id, "different_angle") },
    ];
    return [];
  }, [lucyState, lucyResponse, selectedValues]);

  return (
    <div style={{
      height: "100vh", overflow: "hidden",
      fontFamily: fonts.primary, color: S.text,
      background: S.rootBg,
      display: "flex", flexDirection: "column",
    }}>
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

      {/* Header */}
      <div style={{
        padding: "6px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${S.border}`,
        background: S.panel,
        boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)",
        flexShrink: 0,
      }}>
        <div onClick={() => onBack?.()} style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 2,
          background: S.text, color: "#EDEAE4",
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer",
        }}>LUCID</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "0 10px", borderRadius: 4, height: 24,
            background: "rgba(44,40,36,0.04)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Values</span>
            <span style={{ fontSize: 9, color: "rgba(44,40,36,0.15)" }}>–</span>
            <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{locked ? "Locked" : "Core Values"}</span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: "auto",
        background: `linear-gradient(180deg, ${S.gradientTop} 0%, ${S.gradientBottom} 100%)`,
      }}>

        {/* ═══ WORKSPACE ═══ */}
        {!locked && (
          <div style={{ padding: "40px 24px 80px", maxWidth: 640, margin: "0 auto", animation: `promptIn 0.5s ${ease} both` }}>
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
              <div style={{
                background: S.recess, borderRadius: 6,
                border: `1px solid ${S.border}`,
                overflow: "hidden",
              }}>
                <div style={{ padding: "14px 16px" }}>
                  <input value={customWord} onChange={(e) => setCustomWord(e.target.value)} placeholder="Value word..." style={{ width: "100%", background: "transparent", border: "none", fontSize: 18, fontWeight: 600, color: S.text, outline: "none", fontFamily: fonts.primary, letterSpacing: "-0.01em" }} onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }} />
                </div>
                <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                <button onClick={addCustom} disabled={!customWord.trim() || selectedValues.length >= 3}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "none", cursor: customWord.trim() && selectedValues.length < 3 ? "pointer" : "default", fontFamily: fonts.primary, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: customWord.trim() && selectedValues.length < 3 ? S.text : "rgba(44,40,36,0.1)", background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.06s ease" }}>
                  ADD & SELECT
                </button>
              </div>
            </div>

            {/* Lucy Module */}
            <div style={{
              marginTop: 24,
              background: colors.lucySurface,
              backgroundImage: colors.lucyGrain,
              border: `1px solid ${colors.lucyBorder}`,
              boxShadow: colors.lucyShadow,
              borderRadius: 8,
              overflow: "hidden",
            }}>
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 30, background: colors.eink, borderRadius: 3,
                  border: `1px solid ${colors.einkBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  animation: lucyState === "thinking" ? "lucyPulse 1.2s ease-in-out infinite" : "none",
                }}>
                  <PixelIcon icon={getLucyIcon(lucyState)} color={colors.ink} size={18} />
                </div>
                <span style={{
                  fontFamily: fonts.pixel, fontSize: 11, letterSpacing: "0.08em",
                  color: "#5A5550", flex: 1, lineHeight: 1.4,
                }}>{oneLiner}</span>
              </div>
              {lucyResponse && (
                <>
                  <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(44,40,36,0.08)" }}>
                    <div style={{
                      fontFamily: fonts.pixel, fontSize: 11, letterSpacing: "0.08em",
                      color: "#4A4640", lineHeight: 1.6,
                    }}>{lucyResponse}</div>
                  </div>
                  <div style={{ height: 1, background: "rgba(44,40,36,0.06)", margin: "0 10px" }} />
                </>
              )}
              {lucyState !== "thinking" && lucyActions.length > 0 && (
                <div style={{ padding: "0 10px 10px", display: "flex", gap: 6, flexWrap: "wrap", ...(lucyResponse ? { marginTop: 8 } : {}) }}>
                  {lucyActions.map(a => <LucyActionCard key={a.label} {...a} />)}
                </div>
              )}
              {lucyState !== "thinking" && canLock && (
                <>
                  <div style={{ height: 1, background: "rgba(44,40,36,0.08)", margin: "4px 10px 0" }} />
                  <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div onClick={() => setLocked(true)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 6, background: colors.eink, border: `1px solid ${colors.einkBorder}`, cursor: "pointer", transition: `all 0.15s ${ease}` }}
                      onMouseEnter={e => e.currentTarget.style.background = "#C5C0B2"}
                      onMouseLeave={e => e.currentTarget.style.background = colors.eink}
                    >
                      <div style={{ width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PixelIcon icon="lock" color={colors.ink} size={16} />
                      </div>
                      <span style={{ fontFamily: fonts.pixel, fontSize: 10, letterSpacing: "0.08em", color: colors.ink }}>LOCK VALUES</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ LOCKED — final composition ═══ */}
        {locked && (
          <div style={{ padding: "40px 24px 80px", maxWidth: 640, margin: "0 auto", animation: `fadeIn 0.6s ${ease} both` }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 4, marginBottom: 16,
                background: "rgba(44,40,36,0.04)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.values }} />
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

            {/* Lucy summary — brushed aluminum */}
            <div style={{ maxWidth: 340, margin: "40px auto 0" }}>
              <div style={{
                background: colors.lucySurface,
                backgroundImage: colors.lucyGrain,
                border: `1px solid ${colors.lucyBorder}`,
                boxShadow: colors.lucyShadow,
                borderRadius: 8, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 40, height: 30,
                  background: colors.eink, borderRadius: 2,
                  border: `1px solid ${colors.einkBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <PixelIcon icon="done" color={colors.ink} size={18} />
                </div>
                <div>
                  <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: colors.lucyStatusText }}>VALUES COMPLETE</div>
                  <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 9, color: "#8A857E", marginTop: 2 }}>3 values defined</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
