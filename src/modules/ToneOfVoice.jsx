/* ═══════════════════════════════════════════════════════════════
   LUCID — Tone of Voice
   TX-6 fader sliders with custom spectrums.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

const SPECTRUMS = [
  { id: 1, left: "Formal", right: "Casual", default: 0.35, reason: "They speak in short sentences with long pauses — not stiff, but not sloppy.", examples: [{ at: 0.0, say: "We wish to inform you of the following update.", not: "Hey, quick heads up!" }, { at: 0.25, say: "Here's what you need to know.", not: "Yo, check this out." }, { at: 0.5, say: "A few things worth knowing.", not: "FYI — stuff happened." }, { at: 0.75, say: "Quick update for you.", not: "Per our previous correspondence..." }, { at: 1.0, say: "Hey — wanted you to see this.", not: "Dear valued stakeholder..." }] },
  { id: 2, left: "Serious", right: "Playful", default: 0.3, reason: "Morning light through linen curtains — considered, not heavy. But never flippant.", examples: [{ at: 0.0, say: "This matters. Let's treat it that way.", not: "LOL, anyway..." }, { at: 0.25, say: "We take this seriously, but we don't take ourselves seriously.", not: "URGENT: CRITICAL UPDATE" }, { at: 0.5, say: "Important, with a smile.", not: "Whatever, it's fine." }, { at: 0.75, say: "Let's have some fun with this.", not: "This is no laughing matter." }, { at: 1.0, say: "Life's too short for boring copy.", not: "We regret to inform you..." }] },
  { id: 3, left: "Respectful", right: "Irreverent", default: 0.2, reason: "They make people try harder — earned authority, not rebellion for its own sake.", examples: [{ at: 0.0, say: "We appreciate your trust in us.", not: "Rules are made to be broken." }, { at: 0.25, say: "We respect the craft, and the people behind it.", not: "Who cares what they think?" }, { at: 0.5, say: "We question convention, but we earn the right to.", not: "Screw the establishment." }, { at: 0.75, say: "We'll challenge the norm if it deserves challenging.", not: "With all due respect..." }, { at: 1.0, say: "Sacred cows make the best burgers.", not: "We humbly submit..." }] },
  { id: 4, left: "Matter-of-fact", right: "Enthusiastic", default: 0.4, reason: "One espresso cup, already washed. They celebrate quietly. One text to one person.", examples: [{ at: 0.0, say: "It works. Here's how.", not: "OMG this is AMAZING!!!" }, { at: 0.25, say: "We're proud of this. Here's why.", not: "THIS CHANGES EVERYTHING!" }, { at: 0.5, say: "We're excited — and here's the substance behind it.", not: "Meh, it's fine I guess." }, { at: 0.75, say: "We love what we've built and we think you will too.", not: "Per the data enclosed..." }, { at: 1.0, say: "This is incredible and we can't wait to show you!", not: "Results attached." }] },
  { id: 5, left: "Direct", right: "Nuanced", default: 0.35, reason: "Short sentences, long pauses — they say what they mean, but leave room for thought.", examples: [{ at: 0.0, say: "Yes. Do it.", not: "Well, it depends on several factors..." }, { at: 0.25, say: "Here's what we think, and why.", not: "One might consider the various implications..." }, { at: 0.5, say: "It's not black and white — here's our take.", not: "Just do it already." }, { at: 0.75, say: "There are layers here worth exploring.", not: "Bottom line, period." }, { at: 1.0, say: "Let's sit with this complexity for a moment.", not: "TL;DR:" }] },
  { id: 6, left: "Authoritative", right: "Collaborative", default: 0.45, reason: "They don't scan the room — but they text one person when they win. Leader and partner.", examples: [{ at: 0.0, say: "This is how it's done.", not: "What do you all think?" }, { at: 0.25, say: "We've learned this — let us show you.", not: "I dunno, you tell me!" }, { at: 0.5, say: "Here's our perspective — what's yours?", not: "Do as we say." }, { at: 0.75, say: "Let's figure this out together.", not: "We are the experts." }, { at: 1.0, say: "We're all learning here. Let's share.", not: "Trust us, we know." }] },
];

function Fader({ spectrum, value, onChange, isLocked }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);

  const getPositionFromEvent = useCallback((e) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, [value]);

  const handleStart = useCallback((e) => {
    if (isLocked) return;
    e.preventDefault();
    setDragging(true);
    onChange(getPositionFromEvent(e));
  }, [isLocked, onChange, getPositionFromEvent]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => { e.preventDefault(); onChange(getPositionFromEvent(e)); };
    const handleEnd = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleEnd); window.removeEventListener("touchmove", handleMove); window.removeEventListener("touchend", handleEnd); };
  }, [dragging, onChange, getPositionFromEvent]);

  // Find closest example
  const closest = spectrum.examples.reduce((best, ex) => Math.abs(ex.at - value) < Math.abs(best.at - value) ? ex : best, spectrum.examples[0]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: S.card, borderRadius: 4,
        border: `1px solid rgba(61,56,48,0.06)`,
        boxShadow: S.raised,
        overflow: "hidden",
        transition: `all 0.15s ${ease}`,
      }}
    >
      {/* Labels */}
      <div style={{ padding: "14px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: value < 0.4 ? 600 : 400, color: value < 0.4 ? S.text : "rgba(61,56,48,0.25)", transition: "all 0.2s ease" }}>{spectrum.left}</span>
        <span style={{ fontSize: 11, fontWeight: value > 0.6 ? 600 : 400, color: value > 0.6 ? S.text : "rgba(61,56,48,0.25)", transition: "all 0.2s ease", textAlign: "right" }}>{spectrum.right}</span>
      </div>

      {/* Track + Fader */}
      <div style={{ padding: "12px 16px 10px" }}>
        <div
          ref={trackRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          style={{
            position: "relative", height: 20,
            cursor: isLocked ? "default" : "pointer",
          }}
        >
          {/* Track groove */}
          <div style={{
            position: "absolute", top: 8, left: 0, right: 0, height: 4, borderRadius: 2,
            background: S.recess,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06) inset, 0 1px 0 rgba(255,255,255,0.4)",
          }}>
            {/* Fill */}
            <div style={{
              position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 2,
              width: `${value * 100}%`,
              background: S.accent,
              transition: dragging ? "none" : "width 0.15s ease",
            }} />
          </div>

          {/* Fader knob */}
          <div style={{
            position: "absolute", top: 0,
            left: `calc(${value * 100}% - 10px)`,
            width: 20, height: 20, borderRadius: 4,
            background: dragging
              ? S.accent
              : `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`,
            boxShadow: dragging
              ? "0 2px 8px rgba(212,115,74,0.3), 0 1px 2px rgba(0,0,0,0.1)"
              : hover
                ? "0 2px 8px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8) inset"
                : "0 1px 4px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset",
            transition: dragging ? "none" : `all 0.15s ease`,
            cursor: isLocked ? "default" : dragging ? "grabbing" : "grab",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Grip line */}
            <div style={{ width: 6, height: 2, borderRadius: 1, background: dragging ? "rgba(255,255,255,0.5)" : "rgba(61,56,48,0.12)" }} />
          </div>
        </div>
      </div>

      {/* Lucy's reason */}
      <div style={{ height: 1, background: "rgba(212,115,74,0.06)" }} />
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: S.accent, boxShadow: "0 0 4px rgba(212,115,74,0.3)" }} />
        <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: "rgba(212,115,74,0.45)", lineHeight: 1.5 }}>{spectrum.reason}</div>
      </div>

      {/* "We say / not" example */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{
          background: S.recess, borderRadius: 4, padding: "8px 10px",
          border: `1px solid ${S.border}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset",
        }}>
          <div style={{ fontSize: 10, fontWeight: 400, color: S.text, lineHeight: 1.5, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: "rgba(61,56,48,0.3)", fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>WE SAY </span>
            "{closest.say}"
          </div>
          <div style={{ fontSize: 10, fontWeight: 400, color: "rgba(61,56,48,0.25)", lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: "rgba(61,56,48,0.15)", fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>NOT </span>
            "{closest.not}"
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function ToneOfVoice() {
  const [customSpectrums, setCustomSpectrums] = useState([]);
  const [customLeft, setCustomLeft] = useState("");
  const [customRight, setCustomRight] = useState("");
  const allSpectrums = [...SPECTRUMS, ...customSpectrums];
  const [values, setValues] = useState(SPECTRUMS.map((s) => s.default));
  const [locked, setLocked] = useState(false);
  const [lucyMode, setLucyMode] = useState("idle");
  const [aiMode, setAiMode] = useState("guide");
  const [hoveredAiMode, setHoveredAiMode] = useState(null);

  const hoveredModeInfo = hoveredAiMode ? MODES[hoveredAiMode] : null;

  const addCustomSpectrum = () => {
    if (!customLeft.trim() || !customRight.trim()) return;
    const newSpec = {
      id: 100 + customSpectrums.length,
      left: customLeft.trim(), right: customRight.trim(), default: 0.5,
      reason: "Your own spectrum — you know how this brand should sound.",
      examples: [
        { at: 0.0, say: `Fully ${customLeft.trim().toLowerCase()}.`, not: `Anything ${customRight.trim().toLowerCase()}.` },
        { at: 0.5, say: `Balanced between ${customLeft.trim().toLowerCase()} and ${customRight.trim().toLowerCase()}.`, not: "Either extreme." },
        { at: 1.0, say: `Fully ${customRight.trim().toLowerCase()}.`, not: `Anything ${customLeft.trim().toLowerCase()}.` },
      ],
    };
    setCustomSpectrums((prev) => [...prev, newSpec]);
    setValues((prev) => [...prev, 0.5]);
    setCustomLeft(""); setCustomRight("");
  };

  const updateValue = (index, val) => {
    setValues((prev) => { const next = [...prev]; next[index] = val; return next; });
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif", color: S.text, position: "relative", background: "#D8D3CA" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes lucyPulse { 0%, 100% { opacity:0.7; } 50% { opacity:1; } }
        * { box-sizing:border-box; margin:0; padding:0; }
        textarea:focus, input:focus { outline:none; }
        ::selection { background:rgba(212,115,74,0.1); }
        textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #ECE7DE 0%, #E3DED4 100%)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDE9E1", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(61,56,48,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(61,56,48,0.35)" }}>Voice</span>
              <span style={{ fontSize: 9, color: "rgba(61,56,48,0.35)" }}>–</span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(61,56,48,0.35)" }}>{locked ? "Tone Locked" : "Tone of Voice"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: locked ? S.accent : S.lcd, lineHeight: 1 }}>{allSpectrums.length}</span>
            </div>
          </div>
        </div>

        <div style={{ height: "calc(100% - 40px)", overflowY: "auto" }}>
          {!locked && (
            <div style={{ padding: "40px 48px 60px", animation: `promptIn 0.5s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>Set the tone</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(61,56,48,0.3)", lineHeight: 1.6 }}>Position each fader where this brand sits. Lucy set the starting points — adjust them.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {allSpectrums.map((spec, i) => (
                    <div key={spec.id} style={{ animation: `promptIn 0.4s ${ease} ${i * 0.08}s both` }}>
                      <Fader spectrum={spec} value={values[i]} onChange={(v) => updateValue(i, v)} isLocked={locked} />
                    </div>
                  ))}
                </div>

                {/* Add your own spectrum + Lucy module */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>ADD A SPECTRUM</div>
                  <div>
                    <div style={{ background: S.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${S.border}`, borderBottom: "none", overflow: "hidden" }}>
                      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        <input value={customLeft} onChange={(e) => setCustomLeft(e.target.value)} placeholder="Left end..." style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, fontWeight: 400, color: S.text, outline: "none", fontFamily: "'Inter', sans-serif", minWidth: 0 }} />
                        <div style={{ width: 24, height: 2, borderRadius: 1, background: "rgba(61,56,48,0.1)", flexShrink: 0 }} />
                        <input value={customRight} onChange={(e) => setCustomRight(e.target.value)} placeholder="Right end..." style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, fontWeight: 400, color: S.text, outline: "none", fontFamily: "'Inter', sans-serif", minWidth: 0, textAlign: "right" }} onKeyDown={(e) => { if (e.key === "Enter") addCustomSpectrum(); }} />
                      </div>
                      <div style={{ height: 1, background: "rgba(61,56,48,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                      <button onClick={addCustomSpectrum} disabled={!customLeft.trim() || !customRight.trim()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "none", cursor: customLeft.trim() && customRight.trim() ? "pointer" : "default", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: customLeft.trim() && customRight.trim() ? S.text : "rgba(61,56,48,0.1)", background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.06s ease" }}>ADD SPECTRUM</button>
                    </div>
                    <div style={{ background: S.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${S.border}`, borderTop: "1px solid rgba(61,56,48,0.04)", padding: "6px 8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <LucyScreen mode={lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode}
                            guideText={aiMode === "guide" ? "These starting positions come from the personality work. Adjust them — but trust your gut over the center." : null} />
                        </div>
                        <div style={{ display: "flex", borderRadius: 3, flexShrink: 0, background: "rgba(61,56,48,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.4)", padding: 2, marginTop: 2 }}>
                          {Object.entries(MODES).map(([key, m]) => (<button key={key} onClick={() => setAiMode(key)} onMouseEnter={() => setHoveredAiMode(key)} onMouseLeave={() => setHoveredAiMode(null)} style={{ width: 28, height: 22, borderRadius: 2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", color: aiMode === key ? "#EDE9E1" : "rgba(61,56,48,0.2)", background: aiMode === key ? S.accent : "transparent", boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,180,140,0.1) inset" : "none", transition: "all 0.15s ease" }}>{m.key}</button>))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lock */}
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => setLocked(true)} style={{
                    width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer",
                    fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase", color: S.text,
                    background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`,
                    boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />
                    LOCK TONE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Locked view — generated paragraph */}
          {locked && (() => {
            // Build a natural, descriptive paragraph
            const describe = (spec, v) => {
              if (v < 0.2) return `clearly ${spec.left.toLowerCase()}`;
              if (v < 0.35) return `more ${spec.left.toLowerCase()} than ${spec.right.toLowerCase()}`;
              if (v > 0.8) return `clearly ${spec.right.toLowerCase()}`;
              if (v > 0.65) return `more ${spec.right.toLowerCase()} than ${spec.left.toLowerCase()}`;
              return null;
            };

            const strong = allSpectrums.map((spec, i) => describe(spec, values[i])).filter(Boolean);
            const mid = allSpectrums.filter((spec, i) => values[i] >= 0.35 && values[i] <= 0.65);

            let para = "If you met this brand at a dinner party, you'd notice they're ";
            if (strong.length === 1) para += strong[0];
            else if (strong.length === 2) para += `${strong[0]} and ${strong[1]}`;
            else if (strong.length > 2) para += strong.slice(0, -1).join(", ") + `, and ${strong[strong.length - 1]}`;
            else para += "measured and balanced in every direction";
            para += ". ";

            if (mid.length > 0) {
              para += `They don't lean hard on ${mid.map((s) => `${s.left.toLowerCase()} or ${s.right.toLowerCase()}`).join(", or ")} — they read the room. `;
            }

            para += "You'd trust them immediately. Not because they perform trust, but because every word feels chosen.";

            return (
              <div style={{ padding: "8vh 48px 60px", animation: `fadeIn 0.6s ${ease} both` }}>
                <div style={{ maxWidth: 560, margin: "0 auto" }}>
                  <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(61,56,48,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: S.accent, boxShadow: "0 0 6px rgba(212,115,74,0.3)" }} />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(61,56,48,0.3)" }}>TONE LOCKED</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>How they sound.</h2>
                  </div>

                  <div style={{ animation: `promptIn 0.5s ${ease} 0.2s both` }}>
                    <div style={{ background: S.card, borderRadius: 4, border: "1px solid rgba(61,56,48,0.06)", boxShadow: S.raised, padding: "24px 28px" }}>
                      <div style={{ fontSize: 16, fontWeight: 400, color: S.text, lineHeight: 1.8, letterSpacing: "-0.01em" }}>{para}</div>
                    </div>

                    {/* Tags — embossed style with terracotta accent */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, justifyContent: "center" }}>
                      {allSpectrums.map((spec, i) => {
                        const v = values[i];
                        const label = v < 0.4 ? spec.left : v > 0.6 ? spec.right : `${spec.left}/${spec.right}`;
                        const isStrong = v < 0.35 || v > 0.65;
                        return (
                          <div key={spec.id} style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "5px 12px", borderRadius: 4,
                            background: isStrong ? "rgba(212,115,74,0.08)" : "rgba(61,56,48,0.04)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
                            fontSize: 9, fontWeight: 700,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            color: isStrong ? "rgba(212,115,74,0.55)" : "rgba(61,56,48,0.25)",
                          }}>
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ maxWidth: 300, margin: "40px auto 0" }}>
                    <div style={{ background: S.screen, borderRadius: 4, padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                        <PixelIcon pattern={LUCY_ICONS.approves} color={S.lcdBright} size={2} />
                        <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcdBright }}>TONE DEFINED</span>
                      </div>
                      <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 9, color: S.lcdDim }}>{allSpectrums.length} spectrums · positioned</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
