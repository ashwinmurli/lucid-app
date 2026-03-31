/* ═══════════════════════════════════════════════════════════════
   LUCID — Brand Personality (V2)
   9 writing prompts across 2 chapters with Lucy AI partner.
   Radically simplified: single column, no drawer, no hover grid.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, getLucyIcon, LucyActionCard, LucyPill } from "../components/ui";
import { askLucyStream } from "../lib/lucy";

const CHAPTERS = [
  { title: "WHO THEY ARE", prompts: [
    { q: "How does this person walk into a room?", sub: "What do people notice before they even speak?", spark: "Unhurried. They don't scan the room — they already seem to know where they're going.", guide: "This question establishes physical presence.", challenge: { weak: "Too vague — what's the one detail?", sparked: "Vivid — but make it yours." }, cocreate: "What if they carry something unexpected?" },
    { q: "How do they speak?", sub: "The rhythm. The pauses.", spark: "Short sentences, long pauses.", guide: "Voice shapes tone of voice later.", challenge: { weak: "Give me a sentence they'd say.", sparked: "What's the verbal tic?" }, cocreate: "What do they sound like angry vs. excited?" },
    { q: "What makes their eyes change?", sub: "The subject that lights them up.", spark: "Process. How things are made.", guide: "This uncovers genuine passion.", challenge: { weak: "A moment, not a category.", sparked: "Find one more surprising one." }, cocreate: "Does this connect to childhood?" },
    { q: "What angers them at a deep level?", sub: "The betrayal of what they stand for.", spark: "Waste — wasted potential, wasted trust.", guide: "Anger reveals values through inversion.", challenge: { weak: "Everyone dislikes that. Be specific.", sparked: "What would they actually do?" }, cocreate: "What made this injustice personal?" },
    { q: "What do people say behind their back?", sub: "Both the compliment and the criticism.", spark: "'They make you try harder. But sometimes you wish they'd relax.'", guide: "The tension pair seed lives here.", challenge: { weak: "Give both sides.", sparked: "That's a real tension." }, cocreate: "What would a competitor say?" },
  ]},
  { title: "HOW THEY LIVE", prompts: [
    { q: "What does their home look like at 7am?", sub: "The light. The objects.", spark: "Morning light through linen curtains. One espresso cup — already washed.", guide: "Environment reveals taste and priorities.", challenge: { weak: "Pick one corner — like a film director.", sparked: "What's the messy detail?" }, cocreate: "What are the sounds?" },
    { q: "How do they celebrate?", sub: "A win at work. A private victory.", spark: "Quietly. One text to one person.", guide: "Celebration style reveals relationship with success.", challenge: { weak: "What would surprise people?", sparked: "Do they ever fully let loose?" }, cocreate: "Private vs. public celebration — that gap is interesting." },
    { q: "What's their guilty pleasure?", sub: "The thing that doesn't fit.", spark: "Reality TV. Not ironically.", guide: "The guilty pleasure humanises the brand.", challenge: { weak: "Go weirder — a plot twist.", sparked: "This makes the brand real." }, cocreate: "Does it secretly connect to their core passion?" },
    { q: "What would they never wear?", sub: "And what does that reveal?", spark: "Anything with a visible logo.", guide: "Refusals define boundaries.", challenge: { weak: "Why? The refusal matters more.", sparked: "A brand principle in a wardrobe choice." }, cocreate: "When would they break this rule?" },
  ]},
];
const ALL_PROMPTS = CHAPTERS.flatMap((ch) => ch.prompts.map((p) => ({ ...p, chapter: ch.title })));

function shouldLucySpeak(text, usedSpark, mode) {
  if (mode === "support") return "support";
  if (usedSpark) return "sparked";
  if (text.trim().length < 55) return "weak";
  const vague = ["good","nice","professional","quality","great","best","innovative","passionate","unique"];
  if (vague.some((v) => text.toLowerCase().includes(v))) return "weak";
  return null;
}

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */
export default function BrandPersonality({ onBack } = {}) {
  const [cur, setCur] = useState(0);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const [usedSpark, setUsedSpark] = useState(false);
  const [lucyState, setLucyState] = useState("idle");
  const [lucyResponse, setLucyResponse] = useState("");
  const [isRewriteMode, setIsRewriteMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const lucyModuleRef = useRef(null);
  const done = cur >= ALL_PROMPTS.length;
  const prompt = done ? null : ALL_PROMPTS[cur];

  const chapterProgress = useMemo(() => {
    if (!prompt) return { num: 0, total: 0 };
    const ch = CHAPTERS.find((c) => c.title === prompt.chapter);
    if (!ch) return { num: 0, total: 0 };
    return { num: ch.prompts.findIndex((p) => p.q === prompt.q) + 1, total: ch.prompts.length };
  }, [prompt]);

  const keep = useCallback(() => {
    if (!text.trim()) return;
    setNotes((prev) => [{ text: text.trim(), prompt: prompt.q, lucyText: lucyResponse || null, chapter: prompt.chapter, id: Date.now() }, ...prev]);
    setText(""); setUsedSpark(false); setLucyResponse(""); setIsRewriteMode(false); setLucyState("idle");
    setCur((c) => c + 1); setAnimKey((k) => k + 1);
    setTimeout(() => { if (ref.current) ref.current.focus(); }, 200);
  }, [text, prompt, lucyResponse]);

  const handleLucyAction = useCallback(async (action) => {
    if (action === "spark") { spark(); return; }
    if (action === "happy") { setIsRewriteMode(false); setLucyState("done"); setTimeout(() => { setLucyResponse(""); setLucyState("idle"); }, 1000); return; }
    if (action === "rewrite") setIsRewriteMode(true);
    setLucyState("thinking"); setLucyResponse("");
    try {
      await askLucyStream(
        { module: "personality", action, userInput: text.trim(), moduleState: { question: prompt?.q } },
        (chunk) => setLucyResponse(chunk)
      );
      setLucyState(action === "challenge" || action === "deeper" ? "challenge" : "spark");
    } catch { setLucyState("idle"); }
  }, [text, prompt]);

  const editNote = (id, t) => setNotes((p) => p.map((n) => n.id === id ? { ...n, text: t } : n));
  const spark = () => { if (prompt) { setText(prompt.spark); setUsedSpark(true); if (ref.current) ref.current.focus(); } };
  useEffect(() => { if (ref.current && !done) ref.current.focus(); if (canvasRef.current) canvasRef.current.scrollTop = 0; }, [cur, done]);

  // Lucy one-liner
  const oneLiner = useMemo(() => {
    if (lucyState === "thinking") return "Composing...";
    if (lucyState === "done") return "Noted. Moving on.";
    if (lucyState === "challenge" || lucyState === "spark") return lucyResponse ? "Read my response below." : "Done.";
    if (text.trim()) return "I've read this. What do you want me to do?";
    return "This one sets the tone. Take your time.";
  }, [lucyState, text, lucyResponse]);

  // Lucy contextual actions
  const lucyActions = useMemo(() => {
    if (lucyState === "thinking") return [];
    if (lucyResponse) return [
      { icon: "pen-square", label: "HELP ME REWRITE", onClick: () => handleLucyAction("rewrite") },
      { icon: "check", label: "GOT IT", onClick: () => handleLucyAction("happy") },
    ];
    if (text.trim()) return [
      { icon: "warning-diamond", label: "CHALLENGE THIS", onClick: () => handleLucyAction("challenge") },
      { icon: "target", label: "SHARPEN IT", onClick: () => handleLucyAction("sharpen") },
      { icon: "zap", label: "GO DEEPER", onClick: () => handleLucyAction("deeper") },
    ];
    return [
      { icon: "sparkle", label: "SPARK AN IDEA", onClick: () => handleLucyAction("spark") },
      { icon: "lightbulb", label: "STARTING POINT", onClick: () => handleLucyAction("starting_point") },
    ];
  }, [lucyState, text, lucyResponse, handleLucyAction]);

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
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
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
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>
              Personality
            </span>
            <span style={{ fontSize: 9, color: "rgba(44,40,36,0.15)" }}>–</span>
            <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>
              {done ? "Complete" : prompt?.chapter}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={canvasRef} style={{
        flex: 1, overflowY: "auto",
        background: `linear-gradient(180deg, ${S.gradientTop} 0%, ${S.gradientBottom} 100%)`,
      }}>
        {!done && prompt && (
          <>
            {/* Sticky Lucy */}
            <div ref={lucyModuleRef} style={{ position: "sticky", top: 0, zIndex: 100, background: colors.gradientTop, borderBottom: "1px solid rgba(44,40,36,0.06)" }}>
              <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 24px" }}>
                {/* Lucy Module — brushed warm aluminum */}
                <div style={{
                  background: colors.lucySurface,
                  backgroundImage: colors.lucyGrain,
                  border: `1px solid ${colors.lucyBorder}`,
                  boxShadow: colors.lucyShadow,
                  borderRadius: 8,
                  overflow: "hidden",
                }}>
                  {/* Top strip: e-ink badge + one-liner */}
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

                  {/* Lucy's response */}
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

                  {/* Rewrite actions: Use this / Try again / Dismiss */}
                  {isRewriteMode && lucyResponse && lucyState !== "thinking" && (
                    <>
                      <div style={{ height: 1, background: "rgba(44,40,36,0.08)", margin: "4px 10px 0" }} />
                      <div style={{ padding: "8px 10px 10px", display: "flex", gap: 6 }}>
                        <LucyActionCard icon="check" label="USE THIS" onClick={() => { setText(lucyResponse); setLucyResponse(""); setIsRewriteMode(false); setLucyState("idle"); }} />
                        <LucyActionCard icon="probe" label="TRY AGAIN" onClick={() => handleLucyAction("rewrite")} />
                        <LucyActionCard icon="eye" label="DISMISS" onClick={() => { setLucyResponse(""); setIsRewriteMode(false); setLucyState("idle"); }} />
                      </div>
                    </>
                  )}

                  {/* Contextual action cards */}
                  {!isRewriteMode && lucyState !== "thinking" && lucyActions.length > 0 && (
                    <div style={{ padding: "0 10px 10px", display: "flex", gap: 6, flexWrap: "wrap", ...(lucyResponse ? { marginTop: 8 } : {}) }}>
                      {lucyActions.map(a => <LucyActionCard key={a.label} {...a} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "24px 24px 80px", maxWidth: 640, margin: "0 auto" }}>
            <div key={animKey} style={{ animation: `promptIn 0.4s ${ease} both` }}>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {ALL_PROMPTS.map((_, i) => (
                  <div key={i} style={{
                    width: 12, height: 3, borderRadius: 2,
                    background: i < cur ? colors.personality : i === cur ? S.accent : S.border,
                    transition: "background 0.3s ease",
                  }} />
                ))}
              </div>

              {/* Question */}
              <h2 style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.35, marginBottom: 6, letterSpacing: "-0.02em" }}>{prompt.q}</h2>
              <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", marginBottom: 24, lineHeight: 1.5 }}>{prompt.sub}</p>

              {/* Textarea — standalone rounded rectangle */}
              <div style={{
                background: S.recess, borderRadius: 6,
                border: `1px solid ${S.border}`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04) inset, 0 1px 2px rgba(0,0,0,0.02) inset",
                overflow: "hidden",
              }}>
                <div style={{ padding: "20px 22px 16px" }}>
                  <textarea
                    ref={ref}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start writing..."
                    rows={5}
                    style={{
                      width: "100%", minHeight: 120, background: "transparent",
                      border: "none", padding: 0, fontSize: 16, fontWeight: 400,
                      lineHeight: 1.8, color: S.text, resize: "none",
                      fontFamily: fonts.primary, letterSpacing: "-0.01em",
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) keep(); }}
                  />
                </div>
              </div>

              {/* Footer — keyboard hint + keep button */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 4px 0",
              }}>
                <div style={{ fontSize: 11, color: "rgba(44,40,36,0.25)" }}>
                  <kbd style={{
                    background: S.panel, border: `1px solid ${S.border}`,
                    borderRadius: 3, padding: "1px 5px",
                    fontFamily: fonts.primary, fontSize: 10,
                  }}>⌘</kbd>{" + "}
                  <kbd style={{
                    background: S.panel, border: `1px solid ${S.border}`,
                    borderRadius: 3, padding: "1px 5px",
                    fontFamily: fonts.primary, fontSize: 10,
                  }}>Enter</kbd>
                  <span style={{ marginLeft: 4 }}>to continue</span>
                </div>
                {text.trim() && (
                  <button onClick={keep} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", background: "transparent",
                    border: `1px solid ${S.border}`, borderRadius: 16,
                    fontSize: 11, fontWeight: 500, color: S.text,
                    cursor: "pointer", fontFamily: fonts.primary,
                    transition: `all 0.15s ${ease}`,
                  }}>Keep →</button>
                )}
              </div>

              {/* Completed notes — inline collapsed section */}
              {notes.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <div
                    onClick={() => setShowCompleted(c => !c)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      cursor: "pointer", userSelect: "none", padding: "0 2px",
                    }}
                  >
                    <span style={{
                      fontSize: 8, color: "rgba(44,40,36,0.25)",
                      transition: `transform 0.2s ${ease}`,
                      transform: showCompleted ? "rotate(180deg)" : "rotate(0deg)",
                    }}>▼</span>
                    <span style={{ fontSize: 11, color: "rgba(44,40,36,0.25)", fontWeight: 500 }}>
                      Completed
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(44,40,36,0.12)" }}>
                      {notes.length} of {ALL_PROMPTS.length}
                    </span>
                  </div>

                  {showCompleted && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {notes.map(note => (
                        <div key={note.id} style={{
                          background: S.card, borderRadius: 4,
                          border: `1px solid rgba(44,40,36,0.06)`,
                          padding: "10px 14px",
                        }}>
                          <div style={{
                            fontSize: 9, color: "rgba(44,40,36,0.2)", marginBottom: 3,
                            fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em",
                          }}>{note.prompt}</div>
                          <div style={{
                            fontSize: 12, color: S.text, lineHeight: 1.55,
                          }}>{note.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </>
        )}

        {/* Completion screen */}
        {done && (
          <div style={{ padding: "20vh 48px", display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: 520, width: "100%", textAlign: "center", animation: `promptIn 0.5s ${ease} both` }}>
              <div style={{ display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 3, background: S.accent, color: "#EDEAE4", marginBottom: 16 }}>COMPLETE</div>
              <h2 style={{ fontSize: 26, fontWeight: 300, marginBottom: 8, lineHeight: 1.4 }}>A character is forming.</h2>
              <p style={{ fontSize: 13, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Nine thoughts across two chapters. The outline of someone real.</p>
            </div>
          </div>
        )}
      </div>
      <LucyPill
        moduleRef={lucyModuleRef}
        lucyState={lucyState}
        lucyResponse={lucyResponse}
        lucyActions={lucyActions}
        oneLiner={oneLiner}
      />
    </div>
  );
}
