/* ═══════════════════════════════════════════════════════════════
   LUCID — Discovery
   Conversational brief → questions → gap analysis.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, TransportBtn, getLucyIcon, LucyActionCard } from "../components/ui";
import { askLucyStream } from "../lib/lucy";

const BRIEF_QUESTIONS = [
  { q: "What's the client's name and what do they do?", hint: "Company name, industry, core business." },
  { q: "How big is the company? Roughly.", hint: "Team size, revenue range — whatever you know." },
  { q: "Why are they doing brand work now? What triggered it?", hint: "New launch, rebrand, growth, investor pressure..." },
  { q: "What do you already know about them that's interesting?", hint: "Anything. A gut feeling counts." },
];

/* ── Lucy's generated discovery questions (simulated) ── */
const GENERATED_QUESTIONS = [
  { id: 1, theme: "ORIGIN", q: "Why did the founders start this company — what was the original itch?", intent: "Uncovers authentic purpose vs. opportunistic positioning.", response: "" },
  { id: 2, theme: "ORIGIN", q: "What were they doing before, and what made them leave?", intent: "Reveals values and frustrations that shaped the brand's DNA.", response: "" },
  { id: 3, theme: "AUDIENCE", q: "Describe your best client — not the biggest, the best. Why them?", intent: "Surfaces ideal customer profile through emotional preference, not demographics.", response: "" },
  { id: 4, theme: "AUDIENCE", q: "What do your clients say about you when you're not in the room?", intent: "Tests whether perceived brand matches intended brand.", response: "" },
  { id: 5, theme: "COMPETITION", q: "Who do you lose to, and why? Be honest.", intent: "Identifies real competitive weaknesses, not the ones on the pitch deck.", response: "" },
  { id: 6, theme: "COMPETITION", q: "Is there a company you admire that isn't a direct competitor? What about them?", intent: "Uncovers aspirational positioning and brand values by proxy.", response: "" },
  { id: 7, theme: "CULTURE", q: "What would a new employee notice in their first week that isn't in the job description?", intent: "Reveals actual culture vs. stated culture.", response: "" },
  { id: 8, theme: "CULTURE", q: "What's a decision you made that was hard but right?", intent: "Values are revealed in trade-offs, not mission statements.", response: "" },
  { id: 9, theme: "FUTURE", q: "If everything goes right, what does the company look like in five years?", intent: "Tests whether vision is specific or generic.", response: "" },
  { id: 10, theme: "FUTURE", q: "What would you never do, no matter how profitable?", intent: "Defines boundaries — the negative space of the brand.", response: "" },
];

/* ── Gap analysis (simulated) ── */
const GAPS = [
  { area: "Competition", note: "No response about who they lose to. This is critical for USP work — follow up." },
  { area: "Audience", note: "Good insight on best clients, but nothing about who they actively avoid. That contrast helps define positioning." },
  { area: "Culture", note: "The hard decision answer was surface-level. Push deeper — ask for a specific story, not a principle." },
];

/* ══════════════════════════════════════════════════════════════ */
export default function Discovery({ onBack } = {}) {
  const [phase, setPhase] = useState("brief"); // brief | generating | questions | analysis
  const [briefStep, setBriefStep] = useState(0);
  const [briefAnswers, setBriefAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questions, setQuestions] = useState(GENERATED_QUESTIONS);
  const [expandedQ, setExpandedQ] = useState({});
  const [transStep, setTransStep] = useState(0);
  const [lucyState, setLucyState] = useState("idle");
  const [lucyResponse, setLucyResponse] = useState("");
  const inputRef = useRef(null);

  const answeredCount = questions.filter((q) => q.response.trim()).length;

  const goToThemeQuestion = (area) => {
    setPhase("questions");
    const themeUpper = area.toUpperCase();
    const firstQ = questions.find((q) => q.theme === themeUpper);
    if (firstQ) {
      setExpandedQ((prev) => ({ ...prev, [firstQ.id]: true }));
    }
    setTimeout(() => {
      const el = document.getElementById(`theme-${area.toLowerCase()}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };
  const briefDone = briefStep >= BRIEF_QUESTIONS.length;

  const toggleQ = (id, idx) => setExpandedQ((prev) => ({ ...prev, [id]: !(prev[id] ?? (idx === 0)) }));
  const updateResponse = (id, val) => setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, response: val } : q));

  // Focus input on brief phase
  useEffect(() => {
    if (phase === "brief" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase, briefStep]);

  // Generating cinematic
  useEffect(() => {
    if (phase !== "generating") return;
    setTransStep(0);
    const steps = [
      setTimeout(() => setTransStep(1), 600),
      setTimeout(() => setTransStep(2), 1800),
      setTimeout(() => setTransStep(3), 3000),
      setTimeout(() => { setPhase("questions"); setLucyState("idle"); }, 4200),
    ];
    return () => steps.forEach(clearTimeout);
  }, [phase]);

  const submitBriefAnswer = () => {
    if (!currentAnswer.trim()) return;
    setBriefAnswers((prev) => [...prev, { q: BRIEF_QUESTIONS[briefStep].q, a: currentAnswer.trim() }]);
    setCurrentAnswer("");
    if (briefStep < BRIEF_QUESTIONS.length - 1) {
      setBriefStep((s) => s + 1);
    } else {
      setBriefStep((s) => s + 1);
      setLucyState("thinking");
      setTimeout(() => setPhase("generating"), 800);
    }
  };

  const headerPhase = { brief: "Client Brief", generating: "Generating", questions: "Questions", analysis: "Gap Analysis" };

  const oneLiner = useMemo(() => {
    if (lucyState === "thinking") return "Composing...";
    if (lucyState === "done") return "Noted.";
    if (phase === "brief") return `Tell me about the client.`;
    if (phase === "questions") return `${answeredCount} of ${questions.length} answered.`;
    return "Tell me about the client.";
  }, [lucyState, phase, answeredCount, questions.length]);

  const lucyActions = useMemo(() => {
    if (lucyState === "thinking") return [];
    if (lucyResponse) return [
      { icon: "check", label: "GOT IT", onClick: () => { setLucyState("done"); setTimeout(() => { setLucyResponse(""); setLucyState("idle"); }, 1000); } },
    ];
    return [];
  }, [lucyState, lucyResponse]);

  /* ── Lucy module component ── */
  const LucyModule = () => (
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
  );

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: fonts.primary, color: colors.text, position: "relative", background: colors.rootBg }}>
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
        .disc-scroll::-webkit-scrollbar { width:3px; }
        .disc-scroll::-webkit-scrollbar-track { background:transparent; }
        .disc-scroll::-webkit-scrollbar-thumb { background:rgba(44,40,36,0.06); border-radius:3px; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${colors.gradientTop} 0%, ${colors.gradientBottom} 100%)`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header: LUCID badge left, breadcrumb pill + counter right */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${colors.border}`, background: colors.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: colors.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Discovery</span>
              <span style={{ fontSize: 9, color: "rgba(44,40,36,0.35)" }}>–</span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{headerPhase[phase]}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="disc-scroll" style={{ flex: 1, overflowY: "auto" }}>

          {/* ═══ BRIEF — Lucy asks about the client ═══ */}
          {phase === "brief" && (
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>
              {/* Previous answers */}
              {briefAnswers.map((ba, i) => (
                <div key={i} style={{ marginBottom: 20, animation: `fadeIn 0.3s ${ease} both` }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.12)", marginBottom: 4 }}>LUCY ASKED</div>
                  <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(44,40,36,0.25)", lineHeight: 1.5, marginBottom: 6 }}>{ba.q}</div>
                  <div style={{ fontSize: 14, fontWeight: 400, color: colors.text, lineHeight: 1.6 }}>{ba.a}</div>
                </div>
              ))}

              {/* Current question */}
              {!briefDone && (
                <div key={briefStep} style={{ animation: `promptIn 0.4s ${ease} both` }}>
                  <h2 style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.4, marginBottom: 6, letterSpacing: "-0.02em" }}>{BRIEF_QUESTIONS[briefStep].q}</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", marginBottom: 24, lineHeight: 1.5 }}>{BRIEF_QUESTIONS[briefStep].hint}</p>

                  {/* Recessed input */}
                  <div style={{ background: colors.recess, borderRadius: 6, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px" }}>
                      <textarea ref={inputRef} value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Type your answer..." rows={3} style={{ width: "100%", background: "transparent", border: "none", fontSize: 15, fontWeight: 400, lineHeight: 1.7, color: colors.text, resize: "none", outline: "none", fontFamily: fonts.primary }} onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) submitBriefAnswer(); }} />
                    </div>
                  </div>

                  {/* Footer row: ⌘+Enter hint left, ghost-pill action right */}
                  <div style={{
                    marginTop: 8,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 4px",
                  }}>
                    <div style={{ fontSize: 11, color: "rgba(44,40,36,0.25)" }}>
                      <kbd style={{
                        background: colors.panel, border: `1px solid ${colors.border}`,
                        borderRadius: 3, padding: "1px 5px",
                        fontFamily: fonts.primary, fontSize: 10,
                      }}>⌘</kbd>
                      {" + "}
                      <kbd style={{
                        background: colors.panel, border: `1px solid ${colors.border}`,
                        borderRadius: 3, padding: "1px 5px",
                        fontFamily: fonts.primary, fontSize: 10,
                      }}>Enter</kbd>
                      <span style={{ marginLeft: 4 }}>to continue</span>
                    </div>
                    <button
                      onClick={submitBriefAnswer}
                      disabled={!currentAnswer.trim()}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px",
                        background: "transparent",
                        border: `1px solid ${currentAnswer.trim() ? "rgba(44,40,36,0.12)" : "rgba(44,40,36,0.06)"}`,
                        borderRadius: 16,
                        fontSize: 11, fontWeight: 500,
                        color: currentAnswer.trim() ? "rgba(44,40,36,0.5)" : "rgba(44,40,36,0.2)",
                        cursor: currentAnswer.trim() ? "pointer" : "default",
                        fontFamily: fonts.primary,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {currentAnswer.trim() && (
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.accent }} />
                      )}
                      {briefStep < BRIEF_QUESTIONS.length - 1 ? "Next" : "Generate"}
                    </button>
                  </div>

                  {/* Lucy module below active question */}
                  <LucyModule />
                </div>
              )}
            </div>
          )}

          {/* ═══ GENERATING — cinematic ═══ */}
          {phase === "generating" && (() => {
            const msgs = ["", "READING YOUR BRIEF", "TAILORING QUESTIONS", "PREPARING DISCOVERY"];
            const msg = msgs[transStep] || ""; const showPulse = transStep >= 1;
            return (
              <div style={{ position: "absolute", inset: 0, background: colors.screen, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.6s ease both", zIndex: 5 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-block", animation: showPulse ? "lucyPulse 1.2s ease-in-out infinite" : "none", marginBottom: 20 }}><PixelIcon icon="thinking" color={colors.accent} size={28} /></div>
                  {transStep >= 1 && (<div key={transStep} style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 14, color: colors.accent, animation: `fadeIn 0.4s ${ease} both` }}>{msg}...</div>)}
                  {transStep >= 1 && (<div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 16 }}>{[1,2,3].map((s) => (<div key={s} style={{ width: 4, height: 4, background: transStep >= s ? colors.accent : "rgba(229,166,50,0.15)", transition: "background 0.3s ease" }} />))}</div>)}
                </div>
              </div>
            );
          })()}

          {/* ═══ QUESTIONS — unified view with inline responses ═══ */}
          {phase === "questions" && (
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px", animation: `promptIn 0.5s ${ease} both` }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>Your discovery questions.</h2>
                <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Record client responses directly. ⌘+Enter to move to the next question.</p>
              </div>

              {(() => {
                let currentTheme = "";
                return questions.map((q, i) => {
                  const showTheme = q.theme !== currentTheme;
                  currentTheme = q.theme;
                  const isExpanded = expandedQ[q.id] ?? (i === 0);
                  const hasResponse = q.response.trim();

                  return (
                    <div key={q.id}>
                      {showTheme && (
                        <div id={`theme-${q.theme.toLowerCase()}`} style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.muted, marginBottom: 8, marginTop: i > 0 ? 20 : 0 }}>{q.theme}</div>
                      )}
                      <div style={{
                        background: colors.card, borderRadius: 4,
                        border: "1px solid rgba(44,40,36,0.06)",
                        boxShadow: shadows.raised, overflow: "hidden", marginBottom: 6,
                        animation: `promptIn 0.4s ${ease} ${i * 0.04}s both`,
                      }}>
                        {/* Question header */}
                        <div onClick={() => toggleQ(q.id, i)} style={{ padding: "12px 16px", cursor: "pointer", userSelect: "none", display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ fontSize: 14, color: isExpanded ? colors.accent : "rgba(44,40,36,0.25)", display: "inline-block", flexShrink: 0, marginTop: 1, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: `transform 0.25s ${ease}, color 0.2s ease`, fontFamily: fonts.primary }}>›</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, lineHeight: 1.5 }}>{q.q}</div>
                            {/* Show response preview when collapsed */}
                            {!isExpanded && hasResponse && (
                              <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.35)", lineHeight: 1.5, marginTop: 4 }}>{q.response}</div>
                            )}
                          </div>
                          {hasResponse && <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.lcdBright, flexShrink: 0, marginTop: 6 }} />}
                        </div>

                        {/* Expanded — intent + inline response */}
                        <div style={{ display: "grid", gridTemplateRows: isExpanded ? "1fr" : "0fr", transition: `grid-template-rows 0.35s ${ease}` }}>
                          <div style={{ overflow: "hidden" }}>
                            <div style={{ height: 1, background: "rgba(44,40,36,0.04)" }} />
                            <div style={{ padding: "12px 16px" }}>
                              {/* Lucy's strategic intent */}
                              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: colors.accent, boxShadow: "0 0 4px rgba(229,166,50,0.3)" }} />
                                <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: "rgba(229,166,50,0.45)", lineHeight: 1.5 }}>{q.intent}</div>
                              </div>

                              {/* Response input — always visible when expanded */}
                              <div style={{ background: colors.recess, borderRadius: 4, border: `1px solid ${colors.border}`, boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset", padding: "10px 12px" }}>
                                <textarea
                                  data-question-id={q.id}
                                  value={q.response}
                                  onChange={(e) => { updateResponse(q.id, e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                                  placeholder="What did the client say?"
                                  rows={2}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.metaKey) {
                                      e.preventDefault();
                                      const nextIdx = i + 1;
                                      if (nextIdx < questions.length) {
                                        const nextId = questions[nextIdx].id;
                                        setExpandedQ((prev) => ({ ...prev, [q.id]: false, [nextId]: true }));
                                        setTimeout(() => {
                                          const nextTextarea = document.querySelector(`[data-question-id="${nextId}"]`);
                                          if (nextTextarea) nextTextarea.focus();
                                        }, 100);
                                      }
                                    }
                                  }}
                                  style={{ width: "100%", background: "transparent", border: "none", fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: colors.text, resize: "none", outline: "none", fontFamily: fonts.primary, overflow: "hidden", minHeight: 40 }}
                                />
                                {i < questions.length - 1 && (
                                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                                    <span style={{ fontSize: 9, fontWeight: 500, color: "rgba(44,40,36,0.12)", fontFamily: fonts.primary }}>
                                      <kbd style={{
                                        background: colors.panel, border: `1px solid ${colors.border}`,
                                        borderRadius: 3, padding: "1px 4px",
                                        fontFamily: fonts.primary, fontSize: 8,
                                      }}>⌘</kbd>
                                      {" + "}
                                      <kbd style={{
                                        background: colors.panel, border: `1px solid ${colors.border}`,
                                        borderRadius: 3, padding: "1px 4px",
                                        fontFamily: fonts.primary, fontSize: 8,
                                      }}>Enter</kbd>
                                      <span style={{ marginLeft: 3 }}>for next</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lucy module below the active/expanded question */}
                      {isExpanded && <LucyModule />}
                    </div>
                  );
                });
              })()}

              {/* Analyze gaps button */}
              {answeredCount >= 3 && (
                <div style={{ marginTop: 24, animation: `fadeIn 0.4s ${ease} both` }}>
                  <button onClick={() => { setLucyState("thinking"); setTimeout(() => { setPhase("analysis"); setLucyState("idle"); }, 1500); }} style={{ width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: fonts.primary, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.text, background: `linear-gradient(180deg, #F0ECE5 0%, ${colors.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent }} />ANALYZE GAPS
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ ANALYSIS — Lucy's gap findings ═══ */}
          {phase === "analysis" && (
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px", animation: `fadeIn 0.6s ${ease} both` }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.accent, boxShadow: "0 0 6px rgba(229,166,50,0.3)" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.3)" }}>GAP ANALYSIS</span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>What's missing.</h2>
                <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6, marginTop: 8 }}>{answeredCount} of {questions.length} questions captured. Lucy found {GAPS.length} gaps to follow up on.</p>
              </div>

              {/* Gaps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {GAPS.map((gap, i) => (
                  <div key={i} style={{ background: colors.card, borderRadius: 4, border: "1px solid rgba(44,40,36,0.06)", boxShadow: shadows.raised, padding: "14px 16px", animation: `promptIn 0.4s ${ease} ${i * 0.1}s both` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.lucyAmberText }}>{gap.area}</div>
                      <button onClick={() => goToThemeQuestion(gap.area)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.25)", padding: "2px 8px", borderRadius: 3, transition: "all 0.15s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = colors.lucyAmberText; e.currentTarget.style.background = "rgba(229,166,50,0.06)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(44,40,36,0.25)"; e.currentTarget.style.background = "none"; }}
                      >EDIT ›</button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 400, color: colors.text, lineHeight: 1.6 }}>{gap.note}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 0, marginTop: 24, borderRadius: 6, overflow: "hidden", boxShadow: shadows.raised }}>
                <button onClick={() => setPhase("questions")} style={{ flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontFamily: fonts.primary, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)", background: `linear-gradient(180deg, #F0ECE5 0%, ${colors.card} 100%)`, borderRight: "1px solid rgba(44,40,36,0.06)", userSelect: "none" }}>BACK TO QUESTIONS</button>
                <button style={{ flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontFamily: fonts.primary, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.text, background: `linear-gradient(180deg, #F0ECE5 0%, ${colors.card} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, userSelect: "none" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent }} />START SYNTHESIS
                </button>
              </div>

              {/* Lucy summary */}
              <div style={{ maxWidth: 300, margin: "32px auto 0" }}>
                <div style={{ background: colors.screen, borderRadius: 4, padding: "10px 14px", boxShadow: shadows.screenDeep, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                    <PixelIcon icon="approves" color={colors.lcdBright} size={14} />
                    <span style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: colors.lcdBright }}>DISCOVERY REVIEWED</span>
                  </div>
                  <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 9, color: colors.lcdDim }}>{answeredCount} captured · {GAPS.length} gaps</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
