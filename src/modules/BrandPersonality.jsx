/* ═══════════════════════════════════════════════════════════════
   LUCID — Brand Personality (V2)
   9 writing prompts across 2 chapters with Lucy AI partner.
   Radically simplified: single column, no drawer, no hover grid.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LucyMini } from "../components/ui";

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

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
  if (mode === "guide") return null;
  if (mode === "cocreate") return "cocreate";
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
  const [lucyMode, setLucyMode] = useState("idle");
  const [aiMode, setAiMode] = useState("challenge");
  const [showCompleted, setShowCompleted] = useState(false);
  const ref = useRef(null);
  const canvasRef = useRef(null);
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
    const trigger = shouldLucySpeak(text, usedSpark, aiMode);
    let lucyText = null;
    if (aiMode === "challenge" && trigger && prompt.challenge) lucyText = prompt.challenge[trigger];
    else if (aiMode === "cocreate" && prompt.cocreate) lucyText = prompt.cocreate;
    setLucyMode("thinking");
    setTimeout(() => { setLucyMode(lucyText ? "idle" : "approves"); setTimeout(() => setLucyMode("idle"), 2000); }, lucyText ? 2000 : 800);
    setNotes((prev) => [{ text: text.trim(), prompt: prompt.q, lucyText, lucyMode: lucyText ? aiMode : null, chapter: prompt.chapter, id: Date.now() }, ...prev]);
    setText(""); setUsedSpark(false); setCur((c) => c + 1); setAnimKey((k) => k + 1);
    setTimeout(() => { if (ref.current) ref.current.focus(); }, 200);
  }, [text, usedSpark, prompt, aiMode]);

  const editNote = (id, t) => setNotes((p) => p.map((n) => n.id === id ? { ...n, text: t } : n));
  const spark = () => { if (prompt) { setText(prompt.spark); setUsedSpark(true); if (ref.current) ref.current.focus(); } };
  useEffect(() => { if (ref.current && !done) ref.current.focus(); if (canvasRef.current) canvasRef.current.scrollTop = 0; }, [cur, done]);

  const typingStatus = useMemo(() => {
    if (!text.trim() || lucyMode === "thinking" || lucyMode === "approves") return null;
    const t = text.trim(); const lower = t.toLowerCase();
    const vague = ["good","nice","professional","quality","great","best","innovative","passionate","unique"];
    if (aiMode === "cocreate") return "composing";
    if (aiMode === "guide") return "listening";
    if (t.length < 30) return "listening";
    if (vague.some((v) => lower.includes(v))) return "vague";
    if (t.length < 55) return "weak";
    if (t.length >= 80) return "strong";
    return "listening";
  }, [text, aiMode, lucyMode]);

  // Derive Lucy's display state
  const lucyDisplay = useMemo(() => {
    if (lucyMode === "thinking") return { icon: "challenge", label: "READING", color: S.accent };
    if (lucyMode === "approves") return { icon: "done", label: "NOTED", color: S.lcdBright };
    if (typingStatus === "weak") return { icon: "challenge", label: "PUSH MORE", color: S.accent };
    if (typingStatus === "vague") return { icon: "challenge", label: "BE SPECIFIC", color: S.accent };
    if (typingStatus === "strong") return { icon: "done", label: "LOOKING GOOD", color: S.lcdBright };
    if (typingStatus === "composing") return { icon: "spark", label: "COMPOSING", color: S.lcd };
    const defaults = {
      guide: { icon: "guide", label: "GUIDE", color: S.lcd },
      challenge: { icon: "challenge", label: "READY", color: S.lcd },
      cocreate: { icon: "spark", label: "CO-OP", color: S.lcd },
    };
    return defaults[aiMode] || defaults.challenge;
  }, [lucyMode, aiMode, typingStatus]);

  // Lucy's feedback text from the last kept note
  const lastNote = notes.length > 0 ? notes[0] : null;
  const lucyFeedback = lastNote?.lucyText || null;
  const lucyFeedbackMode = lastNote?.lucyMode || null;

  // Determine if Lucy has content to show beyond the top strip
  const lucyGuide = aiMode === "guide" && prompt ? prompt.guide : null;
  const lucyHasContent = !!lucyFeedback || !!lucyGuide;

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
          {prompt && (
            <div style={{
              padding: "0 6px", borderRadius: 3, height: 24,
              background: S.screen,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: fonts.pixel, fontSize: 10, color: colors.personality,
                lineHeight: 1, fontVariantNumeric: "tabular-nums",
              }}>{chapterProgress.num}/{chapterProgress.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={canvasRef} style={{
        flex: 1, overflowY: "auto",
        background: `linear-gradient(180deg, ${S.gradientTop} 0%, ${S.gradientBottom} 100%)`,
      }}>
        {!done && prompt && (
          <div style={{ padding: "40px 24px 80px", maxWidth: 640, margin: "0 auto" }}>
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

              {/* Footer — keyboard hint + spark/keep button */}
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
                <button onClick={text.trim() ? keep : spark} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", background: "transparent",
                  border: `1px solid ${S.border}`, borderRadius: 16,
                  fontSize: 11, fontWeight: 500,
                  color: text.trim() ? S.text : "rgba(44,40,36,0.35)",
                  cursor: "pointer", fontFamily: fonts.primary,
                  transition: `all 0.15s ${ease}`,
                }}>
                  {text.trim() ? "Keep ↵" : (<>
                    <PixelIcon icon="spark" color="currentColor" size={13} />
                    Spark
                  </>)}
                </button>
              </div>

              {/* Lucy Module — one cohesive dark block */}
              <div style={{
                marginTop: 16,
                background: S.screen, borderRadius: 6,
                overflow: "hidden",
              }}>
                {/* Top strip: e-ink icon + status + mode buttons */}
                <div style={{
                  padding: "8px 10px",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {/* E-ink badge */}
                  <div style={{
                    width: 28, height: 20,
                    background: colors.eink, borderRadius: 2,
                    border: `1px solid ${colors.einkBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <PixelIcon icon={lucyDisplay.icon} color={colors.ink} size={12} />
                  </div>

                  {/* Status label */}
                  <span style={{
                    fontFamily: fonts.pixel, fontSize: 10,
                    color: lucyDisplay.color, lineHeight: 1, flex: 1,
                  }}>{lucyDisplay.label}</span>

                  {/* Mode toggle */}
                  <div style={{
                    display: "flex", borderRadius: 3,
                    background: "rgba(255,255,255,0.04)",
                    padding: 2,
                  }}>
                    {Object.entries(MODES).map(([key, m]) => (
                      <button key={key}
                        onClick={() => setAiMode(key)}
                        style={{
                          width: 24, height: 18, borderRadius: 2, border: "none",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: fonts.primary, fontSize: 6, fontWeight: 700, letterSpacing: "0.04em",
                          color: aiMode === key ? S.screen : "rgba(255,255,255,0.2)",
                          background: aiMode === key ? S.accent : "transparent",
                          boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >{m.key}</button>
                    ))}
                  </div>
                </div>

                {/* Lucy's feedback (from last kept note) */}
                {lucyFeedback && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "12px 14px 14px" }}>
                    <div style={{
                      fontSize: 9, color: S.accent, fontWeight: 500,
                      textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5,
                    }}>{lucyFeedbackMode === "cocreate" ? "co-create" : "challenge"}</div>
                    <div style={{
                      fontSize: 13, color: colors.lucyText, lineHeight: 1.6,
                    }}>
                      {lucyFeedback}
                      {lucyMode === "thinking" && (
                        <span style={{
                          display: "inline-block", width: 1.5, height: 13,
                          background: S.accent, marginLeft: 2, verticalAlign: "middle",
                          animation: "blink 1s steps(1) infinite",
                        }} />
                      )}
                    </div>
                  </div>
                )}

                {/* Guide text (when in guide mode) */}
                {lucyGuide && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "8px 12px" }}>
                    <div style={{
                      fontFamily: fonts.pixel, fontSize: 10,
                      color: S.lcd, lineHeight: 1.5,
                      opacity: 0.7,
                    }}>{lucyGuide}</div>
                  </div>
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
    </div>
  );
}
