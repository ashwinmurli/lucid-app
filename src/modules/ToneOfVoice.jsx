/* ═══════════════════════════════════════════════════════════════
   LUCID — Tone of Voice
   TX-6 fader sliders with custom spectrums.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, getLucyIcon, LucyActionCard } from "../components/ui";
import { askLucyStream } from "../lib/lucy";

const SPECTRUMS = [
  { id: 1, left: "Formal", right: "Casual", default: 0.35, reason: "They speak in short sentences with long pauses — not stiff, but not sloppy.", examples: [{ at: 0.0, say: "We wish to inform you of the following update.", not: "Hey, quick heads up!" }, { at: 0.25, say: "Here's what you need to know.", not: "Yo, check this out." }, { at: 0.5, say: "A few things worth knowing.", not: "FYI — stuff happened." }, { at: 0.75, say: "Quick update for you.", not: "Per our previous correspondence..." }, { at: 1.0, say: "Hey — wanted you to see this.", not: "Dear valued stakeholder..." }] },
  { id: 2, left: "Serious", right: "Playful", default: 0.3, reason: "Morning light through linen curtains — considered, not heavy. But never flippant.", examples: [{ at: 0.0, say: "This matters. Let's treat it that way.", not: "LOL, anyway..." }, { at: 0.25, say: "We take this seriously, but we don't take ourselves seriously.", not: "URGENT: CRITICAL UPDATE" }, { at: 0.5, say: "Important, with a smile.", not: "Whatever, it's fine." }, { at: 0.75, say: "Let's have some fun with this.", not: "This is no laughing matter." }, { at: 1.0, say: "Life's too short for boring copy.", not: "We regret to inform you..." }] },
  { id: 3, left: "Respectful", right: "Irreverent", default: 0.2, reason: "They make people try harder — earned authority, not rebellion for its own sake.", examples: [{ at: 0.0, say: "We appreciate your trust in us.", not: "Rules are made to be broken." }, { at: 0.25, say: "We respect the craft, and the people behind it.", not: "Who cares what they think?" }, { at: 0.5, say: "We question convention, but we earn the right to.", not: "Screw the establishment." }, { at: 0.75, say: "We'll challenge the norm if it deserves challenging.", not: "With all due respect..." }, { at: 1.0, say: "Sacred cows make the best burgers.", not: "We humbly submit..." }] },
  { id: 4, left: "Matter-of-fact", right: "Enthusiastic", default: 0.4, reason: "One espresso cup, already washed. They celebrate quietly. One text to one person.", examples: [{ at: 0.0, say: "It works. Here's how.", not: "OMG this is AMAZING!!!" }, { at: 0.25, say: "We're proud of this. Here's why.", not: "THIS CHANGES EVERYTHING!" }, { at: 0.5, say: "We're excited — and here's the substance behind it.", not: "Meh, it's fine I guess." }, { at: 0.75, say: "We love what we've built and we think you will too.", not: "Per the data enclosed..." }, { at: 1.0, say: "This is incredible and we can't wait to show you!", not: "Results attached." }] },
  { id: 5, left: "Direct", right: "Nuanced", default: 0.35, reason: "Short sentences, long pauses — they say what they mean, but leave room for thought.", examples: [{ at: 0.0, say: "Yes. Do it.", not: "Well, it depends on several factors..." }, { at: 0.25, say: "Here's what we think, and why.", not: "One might consider the various implications..." }, { at: 0.5, say: "It's not black and white — here's our take.", not: "Just do it already." }, { at: 0.75, say: "There are layers here worth exploring.", not: "Bottom line, period." }, { at: 1.0, say: "Let's sit with this complexity for a moment.", not: "TL;DR:" }] },
  { id: 6, left: "Authoritative", right: "Collaborative", default: 0.45, reason: "They don't scan the room — but they text one person when they win. Leader and partner.", examples: [{ at: 0.0, say: "This is how it's done.", not: "What do you all think?" }, { at: 0.25, say: "We've learned this — let us show you.", not: "I dunno, you tell me!" }, { at: 0.5, say: "Here's our perspective — what's yours?", not: "Do as we say." }, { at: 0.75, say: "Let's figure this out together.", not: "We are the experts." }, { at: 1.0, say: "We're all learning here. Let's share.", not: "Trust us, we know." }] },
];

function Fader({ spectrum, value, onChange, isLocked, moduleColor }) {
  const trackRef = useRef(null);
  const knobRef = useRef(null);
  const fillRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [mounted, setMounted] = useState(false);

  const KNOB_D = 24;
  const KNOB_R = 12;
  const INNER_INSET = 14;
  const STOPS = [0, 0.25, 0.5, 0.75, 1];
  const color = moduleColor || colors.tone;

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const updatePosition = useCallback((pct, animate) => {
    if (!trackRef.current || !knobRef.current || !fillRef.current) return;
    const tw = trackRef.current.offsetWidth;
    if (tw === 0) return;
    const minCenter = KNOB_R + 2;
    const maxCenter = tw - KNOB_R - 2;
    const range = maxCenter - minCenter;
    const center = minCenter + pct * range;
    const knobLeft = center - KNOB_R;
    const fillWidth = Math.max(0, center - INNER_INSET);

    if (animate) {
      knobRef.current.style.transition = "left 0.1s cubic-bezier(0.22,1,0.36,1)";
      fillRef.current.style.transition = "width 0.1s cubic-bezier(0.22,1,0.36,1)";
      setTimeout(() => {
        if (knobRef.current) knobRef.current.style.transition = "";
        if (fillRef.current) fillRef.current.style.transition = "";
      }, 110);
    } else {
      knobRef.current.style.transition = "";
      fillRef.current.style.transition = "";
    }

    knobRef.current.style.left = knobLeft + "px";
    fillRef.current.style.width = fillWidth + "px";
  }, []);

  useEffect(() => {
    if (mounted) updatePosition(value, false);
  }, [value, mounted, updatePosition]);

  useEffect(() => {
    const onResize = () => updatePosition(value, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [value, updatePosition]);

  const getNotchPos = useCallback((pct) => {
    if (!trackRef.current) return 0;
    const tw = trackRef.current.offsetWidth;
    const minCenter = KNOB_R + 2;
    const maxCenter = tw - KNOB_R - 2;
    return minCenter + pct * (maxCenter - minCenter);
  }, []);

  const snapToNearest = (pct) => {
    let best = STOPS[0], bestD = Math.abs(pct - best);
    for (let i = 1; i < STOPS.length; i++) {
      const d = Math.abs(pct - STOPS[i]);
      if (d < bestD) { best = STOPS[i]; bestD = d; }
    }
    return best;
  };

  const pctFromEvent = useCallback((e) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const tw = rect.width;
    const minCenter = KNOB_R + 2;
    const maxCenter = tw - KNOB_R - 2;
    const range = maxCenter - minCenter;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return Math.max(0, Math.min(1, (x - minCenter) / range));
  }, [value]);

  const handleStart = useCallback((e) => {
    if (isLocked) return;
    e.preventDefault();
    setDragging(true);
    const pct = pctFromEvent(e);
    updatePosition(pct, false);
    trackRef.current._rawPct = pct;
  }, [isLocked, pctFromEvent, updatePosition]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      e.preventDefault();
      const pct = pctFromEvent(e);
      updatePosition(pct, false);
      trackRef.current._rawPct = pct;
    };
    const handleEnd = () => {
      setDragging(false);
      const rawPct = trackRef.current._rawPct ?? value;
      const snapped = snapToNearest(rawPct);
      onChange(snapped);
      updatePosition(snapped, true);
    };
    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [dragging, onChange, pctFromEvent, updatePosition, value]);

  const closest = spectrum.examples.reduce(
    (best, ex) => Math.abs(ex.at - value) < Math.abs(best.at - value) ? ex : best,
    spectrum.examples[0]
  );

  return (
    <div style={{
      background: S.card, borderRadius: 6,
      border: "1px solid rgba(44,40,36,0.06)",
      boxShadow: shadows.raised,
      overflow: "hidden",
      marginBottom: 8,
    }}>
      {/* Labels */}
      <div style={{
        padding: "14px 16px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: fonts.pixel, fontSize: 9, letterSpacing: "0.08em",
          color: value <= 0.5 ? S.text : "rgba(44,40,36,0.25)",
          transition: "color 0.2s ease",
        }}>{spectrum.left.toUpperCase()}</span>
        <span style={{
          fontFamily: fonts.pixel, fontSize: 9, letterSpacing: "0.08em",
          color: value >= 0.5 ? S.text : "rgba(44,40,36,0.25)",
          transition: "color 0.2s ease", textAlign: "right",
        }}>{spectrum.right.toUpperCase()}</span>
      </div>

      {/* TX-6 Fader Track */}
      <div style={{ padding: "12px 16px 10px" }}>
        <div
          ref={trackRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          style={{
            position: "relative", height: 28, borderRadius: 14,
            background: "#C8C4BC",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1) inset, 0 1px 2px rgba(0,0,0,0.06) inset, 0 1px 0 rgba(255,255,255,0.4)",
            cursor: isLocked ? "default" : "pointer",
            touchAction: "none",
          }}
        >
          {/* Inner channel */}
          <div style={{
            position: "absolute", top: 8, left: 14, right: 14, bottom: 8,
            borderRadius: 6, background: "#B5B1A9", overflow: "hidden",
          }}>
            {/* Color fill */}
            <div ref={fillRef} style={{
              position: "absolute", top: 0, left: 0, bottom: 0,
              borderRadius: "6px 0 0 6px",
              background: color,
            }} />
            {/* Shadow overlay */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 6,
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.15) inset, 0 0.5px 1px rgba(0,0,0,0.08) inset",
              pointerEvents: "none",
            }} />
          </div>

          {/* Dot notches */}
          {mounted && [0.25, 0.5, 0.75].map(p => (
            <div key={p} style={{
              position: "absolute", top: "50%",
              left: getNotchPos(p),
              width: 4, height: 4, borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.08)",
              boxShadow: "0 0.5px 0 rgba(255,255,255,0.2)",
              pointerEvents: "none", zIndex: 4,
            }} />
          ))}

          {/* Knob */}
          <div ref={knobRef} style={{
            position: "absolute", top: 2,
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(180deg, #FAFAF7 0%, #E8E5DD 100%)",
            boxShadow: dragging
              ? "0 2px 8px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset"
              : "0 1px 4px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9) inset",
            transform: dragging ? "scale(1.06)" : "scale(1)",
            zIndex: 5,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: isLocked ? "default" : dragging ? "grabbing" : "grab",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "rgba(44,40,36,0.05)",
              boxShadow: "0 0.5px 0 rgba(255,255,255,0.4) inset, 0 0.5px 0 rgba(0,0,0,0.03)",
            }} />
          </div>
        </div>
      </div>

      {/* Reason + Examples */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8,
        }}>
          <div style={{
            width: 4, height: 4, borderRadius: "50%", marginTop: 5,
            flexShrink: 0, background: color,
          }} />
          <div style={{
            fontFamily: fonts.pixel, fontSize: 10, letterSpacing: "0.08em",
            color: "rgba(44,40,36,0.4)", lineHeight: 1.5,
          }}>{spectrum.reason}</div>
        </div>
        <div style={{
          background: S.recess, borderRadius: 4, padding: "8px 12px",
          border: `1px solid ${S.border}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{
              fontFamily: fonts.pixel, fontSize: 8, letterSpacing: "0.08em",
              color: "rgba(44,40,36,0.2)", flexShrink: 0, marginTop: 3,
            }}>WE SAY</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: S.text, lineHeight: 1.5 }}>
              &ldquo;{closest.say}&rdquo;
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
            <span style={{
              fontFamily: fonts.pixel, fontSize: 8, letterSpacing: "0.08em",
              color: "rgba(44,40,36,0.1)", flexShrink: 0, marginTop: 3,
            }}>NOT</span>
            <span style={{ fontSize: 13, color: "rgba(44,40,36,0.25)", lineHeight: 1.5 }}>
              &ldquo;{closest.not}&rdquo;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
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

export default function ToneOfVoice({ onBack, navigateTo } = {}) {
  const [customSpectrums, setCustomSpectrums] = useState([]);
  const [customLeft, setCustomLeft] = useState("");
  const [customRight, setCustomRight] = useState("");
  const allSpectrums = [...SPECTRUMS, ...customSpectrums];
  const [values, setValues] = useState(SPECTRUMS.map((s) => s.default));
  const [locked, setLocked] = useState(false);
  const [lucyState, setLucyState] = useState("idle");
  const [lucyResponse, setLucyResponse] = useState("");

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

  const setFadersCount = values.filter((v, i) => v !== SPECTRUMS[i]?.default).length;

  const handleToneAction = async (action) => {
    if (action === "happy") { setLucyState("done"); setTimeout(() => { setLucyResponse(""); setLucyState("idle"); }, 1000); return; }
    setLucyState("thinking"); setLucyResponse("");
    try {
      const positions = allSpectrums.map((s, i) => `${s.left} ←→ ${s.right}: ${Math.round(values[i] * 100)}%`).join("; ");
      await askLucyStream(
        { module: "tone", action, userInput: positions, moduleState: { positions } },
        (chunk) => setLucyResponse(chunk)
      );
      setLucyState(action === "challenge_positions" ? "challenge" : "spark");
    } catch { setLucyState("idle"); }
  };

  const oneLiner = (() => {
    if (lucyState === "thinking") return "Composing...";
    if (lucyState === "done") return "Noted.";
    if (setFadersCount > 0) return `${setFadersCount} spectrums set.`;
    return "Drag the faders. Trust your instincts.";
  })();

  const lucyActions = (() => {
    if (lucyState === "thinking") return [];
    if (lucyResponse) return [
      { icon: "check", label: "GOT IT", onClick: () => handleToneAction("happy") },
      ...getPrereqActions(lucyResponse, navigateTo),
    ];
    if (setFadersCount > 0) return [
      { icon: "pen-square", label: "EXPLAIN POSITIONS", onClick: () => handleToneAction("explain") },
      { icon: "warning-diamond", label: "CHALLENGE POSITIONS", onClick: () => handleToneAction("challenge_positions") },
      { icon: "sparkle", label: "EXAMPLE COPY", onClick: () => handleToneAction("example_copy") },
    ];
    return [];
  })();

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: fonts.primary, color: S.text, position: "relative", background: colors.rootBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes lucyPulse { 0%, 100% { opacity:0.7; } 50% { opacity:1; } }
        * { box-sizing:border-box; margin:0; padding:0; }
        textarea:focus, input:focus { outline:none; }
        ::selection { background:rgba(74,173,255,0.12); }
        textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${colors.gradientTop} 0%, ${colors.gradientBottom} 100%)`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Voice</span>
              <span style={{ fontSize: 9, color: "rgba(44,40,36,0.35)" }}>–</span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{locked ? "Tone Locked" : "Tone of Voice"}</span>
            </div>
          </div>
        </div>

        <div style={{ height: "calc(100% - 40px)", overflowY: "auto" }}>
          {!locked && (
            <div style={{ padding: "40px 24px 80px", animation: `promptIn 0.5s ${ease} both` }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>Set the tone</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Position each fader where this brand sits. Lucy set the starting points — adjust them.</p>
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
                    <div style={{ background: S.recess, borderRadius: 6, border: `1px solid ${S.border}`, overflow: "hidden" }}>
                      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        <input value={customLeft} onChange={(e) => setCustomLeft(e.target.value)} placeholder="Left end..." style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, fontWeight: 400, color: S.text, outline: "none", fontFamily: fonts.primary, minWidth: 0 }} />
                        <div style={{ width: 24, height: 2, borderRadius: 1, background: "rgba(44,40,36,0.1)", flexShrink: 0 }} />
                        <input value={customRight} onChange={(e) => setCustomRight(e.target.value)} placeholder="Right end..." style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, fontWeight: 400, color: S.text, outline: "none", fontFamily: fonts.primary, minWidth: 0, textAlign: "right" }} onKeyDown={(e) => { if (e.key === "Enter") addCustomSpectrum(); }} />
                      </div>
                      <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                      <button onClick={addCustomSpectrum} disabled={!customLeft.trim() || !customRight.trim()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "none", cursor: customLeft.trim() && customRight.trim() ? "pointer" : "default", fontFamily: fonts.primary, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: customLeft.trim() && customRight.trim() ? S.text : "rgba(44,40,36,0.1)", background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.06s ease" }}>ADD SPECTRUM</button>
                    </div>
                  </div>
                </div>

                {/* Lucy Module */}
                <div style={{
                  marginTop: 16,
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
                </div>

                {/* Lock */}
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => setLocked(true)} style={{
                    width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer",
                    fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase", color: S.text,
                    background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                    boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.tone }} />
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
              <div style={{ padding: "40px 24px 80px", animation: `fadeIn 0.6s ${ease} both` }}>
                <div style={{ maxWidth: 640, margin: "0 auto" }}>
                  <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(74,173,255,0.08)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.tone, boxShadow: `0 0 6px rgba(74,173,255,0.3)` }} />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.3)" }}>TONE LOCKED</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>How they sound.</h2>
                  </div>

                  <div style={{ animation: `promptIn 0.5s ${ease} 0.2s both` }}>
                    <div style={{ background: S.card, borderRadius: 4, border: "1px solid rgba(44,40,36,0.06)", boxShadow: S.raised, padding: "24px 28px" }}>
                      <div style={{ fontSize: 16, fontWeight: 400, color: S.text, lineHeight: 1.8, letterSpacing: "-0.01em" }}>{para}</div>
                    </div>

                    {/* Tags — module-colored */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, justifyContent: "center" }}>
                      {allSpectrums.map((spec, i) => {
                        const v = values[i];
                        const label = v < 0.4 ? spec.left : v > 0.6 ? spec.right : `${spec.left}/${spec.right}`;
                        const isStrong = v < 0.35 || v > 0.65;
                        return (
                          <div key={spec.id} style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "5px 12px", borderRadius: 4,
                            background: isStrong ? "rgba(74,173,255,0.08)" : "rgba(44,40,36,0.04)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
                            fontSize: 9, fontWeight: 700,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            color: isStrong ? "rgba(74,173,255,0.7)" : "rgba(44,40,36,0.25)",
                          }}>
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Unlock button */}
                  <div style={{ marginTop: 32 }}>
                    <button onClick={() => setLocked(false)} style={{
                      width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer",
                      fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)",
                      background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                      boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>UNLOCK & ADJUST</button>
                  </div>

                  <div style={{ maxWidth: 300, margin: "24px auto 0" }}>
                    <div style={{ background: S.screen, borderRadius: 4, padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                        <PixelIcon icon="approves" color={S.lcdBright} size={14} />
                        <span style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: S.lcdBright }}>TONE DEFINED</span>
                      </div>
                      <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 9, color: S.lcdDim }}>{allSpectrums.length} spectrums · positioned</div>
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
