/* ═══════════════════════════════════════════════════════════════
   LUCID — Discovery
   Conversational brief → questions → gap analysis.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

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
  const [lucyMode, setLucyMode] = useState("idle");
  const [aiMode, setAiMode] = useState("guide");
  const [hoveredAiMode, setHoveredAiMode] = useState(null);
  const inputRef = useRef(null);

  const hoveredModeInfo = hoveredAiMode ? MODES[hoveredAiMode] : null;
  const answeredCount = questions.filter((q) => q.response.trim()).length;
  const briefDone = briefStep >= BRIEF_QUESTIONS.length;

  const toggleQ = (id, idx) => setExpandedQ((prev) => ({ ...prev, [id]: !(prev[id] ?? (idx === 0)) }));
  const updateResponse = (id, val) => setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, response: val } : q));

  // Generating cinematic
  useEffect(() => {
    if (phase !== "generating") return;
    setTransStep(0);
    const steps = [
      setTimeout(() => setTransStep(1), 600),
      setTimeout(() => setTransStep(2), 1800),
      setTimeout(() => setTransStep(3), 3000),
      setTimeout(() => { setPhase("questions"); setLucyMode("idle"); }, 4200),
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
      setLucyMode("thinking");
      setTimeout(() => setPhase("generating"), 800);
    }
  };

  const headerPhase = { brief: "Client Brief", generating: "Generating", questions: "Questions", analysis: "Gap Analysis" };

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif", color: S.text, position: "relative", background: "#D8D3CA" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes lucyPulse { 0%, 100% { opacity:0.7; } 50% { opacity:1; } }
        textarea:focus, input:focus { outline:none; }
        ::selection { background:rgba(212,115,74,0.1); }
        textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
        * { box-sizing:border-box; margin:0; padding:0; }
        .disc-scroll::-webkit-scrollbar { width:3px; }
        .disc-scroll::-webkit-scrollbar-track { background:transparent; }
        .disc-scroll::-webkit-scrollbar-thumb { background:rgba(61,56,48,0.06); border-radius:3px; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #ECE7DE 0%, #E3DED4 100%)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDE9E1", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(61,56,48,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(61,56,48,0.35)" }}>Discovery</span>
              <span style={{ fontSize: 9, color: "rgba(61,56,48,0.35)" }}>–</span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(61,56,48,0.35)" }}>{headerPhase[phase]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: phase === "generating" ? S.accent : S.lcd, lineHeight: 1, animation: phase === "generating" ? "lucyPulse 1.2s ease-in-out infinite" : "none" }}>
                {phase === "brief" ? `${briefStep + 1}/${BRIEF_QUESTIONS.length}` : phase === "generating" ? "···" : phase === "questions" ? `${answeredCount}/${questions.length}` : "✓"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="disc-scroll" style={{ flex: 1, overflowY: "auto" }}>

          {/* ═══ BRIEF — Lucy asks about the client ═══ */}
          {phase === "brief" && (
            <div style={{ padding: "10vh 48px 60px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 520 }}>
                {/* Previous answers */}
                {briefAnswers.map((ba, i) => (
                  <div key={i} style={{ marginBottom: 20, animation: `fadeIn 0.3s ${ease} both` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(61,56,48,0.12)", marginBottom: 4 }}>LUCY ASKED</div>
                    <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(61,56,48,0.25)", lineHeight: 1.5, marginBottom: 6 }}>{ba.q}</div>
                    <div style={{ fontSize: 14, fontWeight: 400, color: S.text, lineHeight: 1.6 }}>{ba.a}</div>
                  </div>
                ))}

                {/* Current question */}
                {!briefDone && (
                  <div key={briefStep} style={{ animation: `promptIn 0.4s ${ease} both` }}>
                    <h2 style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.4, marginBottom: 6, letterSpacing: "-0.02em" }}>{BRIEF_QUESTIONS[briefStep].q}</h2>
                    <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(61,56,48,0.3)", marginBottom: 24, lineHeight: 1.5 }}>{BRIEF_QUESTIONS[briefStep].hint}</p>

                    <div>
                      <div style={{ background: S.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${S.border}`, borderBottom: "none", overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px" }}>
                          <textarea ref={inputRef} value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Type your answer..." rows={3} style={{ width: "100%", background: "transparent", border: "none", fontSize: 15, fontWeight: 400, lineHeight: 1.7, color: S.text, resize: "none", outline: "none", fontFamily: "'Inter', sans-serif" }} onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) submitBriefAnswer(); }} />
                        </div>
                        <div style={{ height: 1, background: "rgba(61,56,48,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                        <button onClick={submitBriefAnswer} disabled={!currentAnswer.trim()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "none", cursor: currentAnswer.trim() ? "pointer" : "default", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: currentAnswer.trim() ? S.text : "rgba(61,56,48,0.1)", background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.06s ease" }}>
                          {currentAnswer.trim() && <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />}
                          {briefStep < BRIEF_QUESTIONS.length - 1 ? "NEXT" : "GENERATE QUESTIONS"}
                        </button>
                      </div>
                      <div style={{ background: S.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${S.border}`, borderTop: "1px solid rgba(61,56,48,0.04)", padding: "6px 8px" }}>
                        <LucyScreen mode={lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode} guideText={aiMode === "guide" ? "Tell me what you know. I'll use this to tailor the discovery questions." : null} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ GENERATING — cinematic ═══ */}
          {phase === "generating" && (() => {
            const msgs = ["", "READING YOUR BRIEF", "TAILORING QUESTIONS", "PREPARING DISCOVERY"];
            const msg = msgs[transStep] || ""; const showPulse = transStep >= 1;
            return (
              <div style={{ position: "absolute", inset: 0, background: S.screen, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.6s ease both", zIndex: 5 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-block", animation: showPulse ? "lucyPulse 1.2s ease-in-out infinite" : "none", marginBottom: 20 }}><PixelIcon pattern={LUCY_ICONS.thinking} color={S.accent} size={4} /></div>
                  {transStep >= 1 && (<div key={transStep} style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: S.accent, letterSpacing: "0.05em", animation: `fadeIn 0.4s ${ease} both` }}>{msg}...</div>)}
                  {transStep >= 1 && (<div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 16 }}>{[1,2,3].map((s) => (<div key={s} style={{ width: 4, height: 4, background: transStep >= s ? S.accent : "rgba(212,115,74,0.15)", transition: "background 0.3s ease" }} />))}</div>)}
                </div>
              </div>
            );
          })()}

          {/* ═══ QUESTIONS — unified view with inline responses ═══ */}
          {phase === "questions" && (
            <div style={{ padding: "32px 48px 60px", animation: `promptIn 0.5s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>Your discovery questions.</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(61,56,48,0.3)", lineHeight: 1.6 }}>Record client responses directly. ⌘+Enter to move to the next question.</p>
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
                          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 8, marginTop: i > 0 ? 20 : 0 }}>{q.theme}</div>
                        )}
                        <div style={{
                          background: S.card, borderRadius: 4,
                          border: `1px solid ${isExpanded ? "rgba(212,115,74,0.12)" : "rgba(61,56,48,0.06)"}`,
                          boxShadow: S.raised, overflow: "hidden", marginBottom: 6,
                          animation: `promptIn 0.4s ${ease} ${i * 0.04}s both`,
                        }}>
                          {/* Question header */}
                          <div onClick={() => toggleQ(q.id, i)} style={{ padding: "12px 16px", cursor: "pointer", userSelect: "none", display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <span style={{ fontSize: 14, color: isExpanded ? S.accent : "rgba(61,56,48,0.25)", display: "inline-block", flexShrink: 0, marginTop: 1, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: `transform 0.25s ${ease}, color 0.2s ease`, fontFamily: "'Inter', sans-serif" }}>›</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: S.text, lineHeight: 1.5 }}>{q.q}</div>
                              {/* Show response preview when collapsed */}
                              {!isExpanded && hasResponse && (
                                <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(61,56,48,0.35)", lineHeight: 1.5, marginTop: 4 }}>{q.response}</div>
                              )}
                            </div>
                            {hasResponse && <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.lcdBright, flexShrink: 0, marginTop: 6 }} />}
                          </div>

                          {/* Expanded — intent + inline response */}
                          <div style={{ display: "grid", gridTemplateRows: isExpanded ? "1fr" : "0fr", transition: `grid-template-rows 0.35s ${ease}` }}>
                            <div style={{ overflow: "hidden" }}>
                              <div style={{ height: 1, background: "rgba(61,56,48,0.04)" }} />
                              <div style={{ padding: "12px 16px" }}>
                                {/* Lucy's strategic intent */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                                  <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: S.accent, boxShadow: "0 0 4px rgba(212,115,74,0.3)" }} />
                                  <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: "rgba(212,115,74,0.45)", lineHeight: 1.5 }}>{q.intent}</div>
                                </div>

                                {/* Response input — always visible when expanded */}
                                <div style={{ background: S.recess, borderRadius: 4, border: `1px solid ${S.border}`, boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset", padding: "10px 12px" }}>
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
                                    style={{ width: "100%", background: "transparent", border: "none", fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: S.text, resize: "none", outline: "none", fontFamily: "'Inter', sans-serif", overflow: "hidden", minHeight: 40 }}
                                  />
                                  {i < questions.length - 1 && (
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                                      <span style={{ fontSize: 9, fontWeight: 500, color: "rgba(61,56,48,0.12)", fontFamily: "'Inter', sans-serif" }}>⌘+Enter for next</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}

                {/* Analyze gaps button */}
                {answeredCount >= 3 && (
                  <div style={{ marginTop: 24, animation: `fadeIn 0.4s ${ease} both` }}>
                    <button onClick={() => { setLucyMode("thinking"); setTimeout(() => { setPhase("analysis"); setLucyMode("idle"); }, 1500); }} style={{ width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.text, background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />ANALYZE GAPS
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ ANALYSIS — Lucy's gap findings ═══ */}
          {phase === "analysis" && (
            <div style={{ padding: "8vh 48px 60px", animation: `fadeIn 0.6s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(61,56,48,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: S.accent, boxShadow: "0 0 6px rgba(212,115,74,0.3)" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(61,56,48,0.3)" }}>GAP ANALYSIS</span>
                  </div>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>What's missing.</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(61,56,48,0.3)", lineHeight: 1.6, marginTop: 8 }}>{answeredCount} of {questions.length} questions captured. Lucy found {GAPS.length} gaps to follow up on.</p>
                </div>

                {/* Gaps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GAPS.map((gap, i) => (
                    <div key={i} style={{ background: S.card, borderRadius: 4, border: "1px solid rgba(61,56,48,0.06)", boxShadow: S.raised, padding: "14px 16px", animation: `promptIn 0.4s ${ease} ${i * 0.1}s both` }}>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.accent, marginBottom: 6 }}>{gap.area}</div>
                      <div style={{ fontSize: 13, fontWeight: 400, color: S.text, lineHeight: 1.6 }}>{gap.note}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 0, marginTop: 24, borderRadius: 6, overflow: "hidden", boxShadow: S.raised }}>
                  <button onClick={() => setPhase("questions")} style={{ flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(61,56,48,0.35)", background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`, borderRight: "1px solid rgba(61,56,48,0.06)", userSelect: "none" }}>BACK TO QUESTIONS</button>
                  <button style={{ flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.text, background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, userSelect: "none" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />START SYNTHESIS
                  </button>
                </div>

                {/* Lucy summary */}
                <div style={{ maxWidth: 300, margin: "32px auto 0" }}>
                  <div style={{ background: S.screen, borderRadius: 4, padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                      <PixelIcon pattern={LUCY_ICONS.approves} color={S.lcdBright} size={2} />
                      <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcdBright }}>DISCOVERY REVIEWED</span>
                    </div>
                    <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 9, color: S.lcdDim }}>{answeredCount} captured · {GAPS.length} gaps</div>
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
