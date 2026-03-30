/* ═══════════════════════════════════════════════════════════════
   LUCID — Brand Manifesto
   Lucy drafts → redline select → accumulated notes → rewrite.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

export default function Manifesto({ onBack } = {}) {
  const [phase, setPhase] = useState("composing");
  const [text, setText] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteIndex, setRewriteIndex] = useState(0);
  const [draftVersion, setDraftVersion] = useState(0);
  const [selection, setSelection] = useState(null);
  const [annotationInput, setAnnotationInput] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [lucyMode, setLucyMode] = useState("thinking");
  const [aiMode, setAiMode] = useState("guide");
  const [hoveredAiMode, setHoveredAiMode] = useState(null);
  const [transStep, setTransStep] = useState(0);
  const proseRef = useRef(null);
  const textareaRef = useRef(null);

  const hoveredModeInfo = hoveredAiMode ? MODES[hoveredAiMode] : null;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Composing cinematic
  useEffect(() => {
    if (phase !== "composing") return;
    setTransStep(0);
    const steps = [
      setTimeout(() => setTransStep(1), 600),
      setTimeout(() => setTransStep(2), 2000),
      setTimeout(() => setTransStep(3), 3400),
      setTimeout(() => setTransStep(4), 4800),
      setTimeout(() => { setText(LUCY_DRAFT); setLucyMode("idle"); setPhase("reviewing"); }, 6200),
    ];
    return () => steps.forEach(clearTimeout);
  }, [phase]);

  // Handle text selection in prose
  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) { return; }
    // Only trigger for selections inside the prose content, not buttons
    const anchor = sel.anchorNode;
    if (!anchor || !proseRef.current) return;
    const proseContent = proseRef.current.querySelector("[data-prose]");
    if (!proseContent || !proseContent.contains(anchor)) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const proseRect = proseRef.current.getBoundingClientRect();
    setSelection({
      text: sel.toString().trim(),
      x: rect.left - proseRect.left + rect.width / 2,
      y: rect.bottom - proseRect.top,
    });
    setAnnotationInput("");
  }, []);

  // Handle inline annotation
  const handleAnnotation = () => {
    if (!annotationInput.trim() || !selection) return;
    setAnnotations((prev) => [...prev, { selected: selection.text, note: annotationInput.trim() }]);
    setIsRewriting(true);
    setLucyMode("thinking");
    // Simulate Lucy rewriting the selected section
    setTimeout(() => {
      setDraftVersion((v) => v + 1);
      setText(LUCY_REWRITES[rewriteIndex % LUCY_REWRITES.length]);
      setRewriteIndex((i) => i + 1);
      setSelection(null);
      setAnnotationInput("");
      setIsRewriting(false);
      setLucyMode("approves");
      setTimeout(() => setLucyMode("idle"), 2000);
    }, 1200);
  };

  // Handle full rewrite
  const handleRewrite = () => {
    if (!feedbackInput.trim()) return;
    setAnnotations((prev) => [...prev, { selected: "(full rewrite)", note: feedbackInput.trim() }]);
    setIsRewriting(true);
    setLucyMode("thinking");
    setTimeout(() => {
      setText(LUCY_REWRITES[rewriteIndex % LUCY_REWRITES.length]);
      setRewriteIndex((i) => i + 1);
      setDraftVersion((v) => v + 1);
      setFeedbackInput("");
      setIsRewriting(false);
      setLucyMode("approves");
      setTimeout(() => setLucyMode("idle"), 2000);
    }, 1500);
  };

  // Close popover on click outside
  useEffect(() => {
    if (!selection) return;
    const handleClick = (e) => {
      if (e.target.closest("[data-popover]")) return;
      setSelection(null); setAnnotationInput("");
    };
    setTimeout(() => document.addEventListener("mousedown", handleClick), 100);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selection]);

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

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #EDEAE4 0%, #E5E2DB 100%)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Strategy</span>
              <span style={{ fontSize: 9, color: "rgba(44,40,36,0.35)" }}>–</span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{phase === "locked" ? "Manifesto Locked" : phase === "composing" ? "Composing" : phase === "reviewing" ? "Review Draft" : "Editing"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 10, color: phase === "composing" ? S.accent : phase === "locked" ? S.accent : S.lcd, lineHeight: 1, animation: phase === "composing" ? "lucyPulse 1.2s ease-in-out infinite" : "none" }}>{phase === "composing" ? "···" : wordCount}</span>
            </div>
          </div>
        </div>

        <div style={{ height: "calc(100% - 40px)", overflowY: "auto", position: "relative" }}>

          {/* ═══ COMPOSING ═══ */}
          {phase === "composing" && (() => {
            const msgs = ["", "READING BRAND WORK", "FINDING THE VOICE", "CHOOSING EVERY WORD", "COMPOSING MANIFESTO"];
            const msg = msgs[transStep] || ""; const showPulse = transStep >= 1;
            return (
              <div style={{ position: "absolute", inset: 0, background: S.screen, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.6s ease both", zIndex: 5 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-block", animation: showPulse ? "lucyPulse 1.2s ease-in-out infinite" : "none", marginBottom: 20 }}><PixelIcon pattern={LUCY_ICONS.thinking} color={S.accent} size={4} /></div>
                  {transStep >= 1 && (<div key={transStep} style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 14, color: S.accent, animation: `fadeIn 0.4s ${ease} both` }}>{msg}...</div>)}
                  {transStep >= 1 && (<div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 16 }}>{[1,2,3,4].map((s) => (<div key={s} style={{ width: 4, height: 4, background: transStep >= s ? S.accent : "rgba(229,166,50,0.15)", transition: "background 0.3s ease" }} />))}</div>)}
                </div>
              </div>
            );
          })()}

          {/* ═══ REVIEWING — redline mode ═══ */}
          {phase === "reviewing" && (
            <div style={{ padding: "40px 48px 60px", animation: `fadeIn 0.6s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>{draftVersion === 0 ? "Lucy's first draft." : `Draft ${draftVersion + 1}.`}</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Select any text to give Lucy a note.</p>
                </div>

                {/* Prose with selection highlight */}
                <div style={{ position: "relative" }}>
                  <div key={draftVersion} ref={proseRef} onMouseUp={handleTextSelect} style={{ background: S.card, borderRadius: 4, border: "1px solid rgba(44,40,36,0.06)", boxShadow: S.raised, cursor: "text", userSelect: "text", animation: `promptIn 0.5s ${ease} both`, overflow: "hidden" }}>
                    <div data-prose style={{ padding: "28px 28px 0" }}>
                      {text.split("\n\n").map((para, i) => (
                        <p key={i} style={{ fontSize: 15, fontWeight: 400, color: S.text, lineHeight: 1.85, letterSpacing: "-0.01em", marginBottom: i < text.split("\n\n").length - 1 ? 18 : 14 }}>
                          {selection ? (() => {
                            const idx = para.indexOf(selection.text);
                            if (idx === -1) return para;
                            return (<>
                              {para.slice(0, idx)}
                              <span style={{ background: "rgba(229,166,50,0.12)", borderRadius: 2, padding: "1px 0", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{para.slice(idx, idx + selection.text.length)}</span>
                              {para.slice(idx + selection.text.length)}
                            </>);
                          })() : para}
                        </p>
                      ))}
                    </div>
                    {/* Edit + Lock — transport button style */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                      <div style={{ display: "flex", userSelect: "none" }}>
                        <button onClick={() => setPhase("editing")} style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          padding: "11px 0", border: "none", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: "rgba(44,40,36,0.35)",
                          background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                          boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset",
                          borderRadius: "0 0 0 4px",
                          userSelect: "none",
                        }}>EDIT DIRECTLY</button>
                        <div style={{ width: 1, background: "rgba(44,40,36,0.06)" }} />
                        <button onClick={() => { setPhase("locked"); setLucyMode("approves"); }} style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          padding: "11px 0", border: "none", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: S.text,
                          background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                          boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset",
                          borderRadius: "0 0 4px 0",
                          userSelect: "none",
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />
                          LOCK MANIFESTO
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Selection popover */}
                  {selection && (
                    <div data-popover style={{ position: "absolute", left: Math.max(0, Math.min(selection.x - 175, 210)), top: selection.y + 12, width: 350, animation: `promptIn 0.15s ${ease} both`, zIndex: 10 }}>
                      <div style={{ background: S.card, borderRadius: 6, border: "1px solid rgba(44,40,36,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5) inset", overflow: "hidden" }}>
                        {/* Selected text — full, in its own recessed area */}
                        <div style={{ padding: "14px 16px 12px" }}>
                          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.15)", marginBottom: 6 }}>SELECTED TEXT</div>
                          <div style={{
                            background: S.recess, borderRadius: 4, padding: "10px 12px",
                            border: `1px solid ${S.border}`,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset",
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 400, fontStyle: "italic", color: "rgba(44,40,36,0.4)", lineHeight: 1.6 }}>"{selection.text}"</div>
                          </div>
                        </div>

                        {/* Note input — its own section */}
                        <div style={{ padding: "0 16px 14px" }}>
                          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.15)", marginBottom: 6 }}>YOUR NOTE</div>
                          <div style={{
                            background: S.recess, borderRadius: 4, padding: "10px 12px",
                            border: `1px solid ${S.border}`,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset",
                            display: "flex", alignItems: "center", gap: 8,
                          }}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", flexShrink: 0, background: isRewriting ? S.accent : "rgba(229,166,50,0.3)", animation: isRewriting ? "lucyPulse 1s ease-in-out infinite" : "none" }} />
                            <input autoFocus value={annotationInput} onChange={(e) => setAnnotationInput(e.target.value)} placeholder="What should change here?"
                              onKeyDown={(e) => { if (e.key === "Enter" && annotationInput.trim()) handleAnnotation(); if (e.key === "Escape") { setSelection(null); setAnnotationInput(""); } }}
                              style={{ flex: 1, background: "transparent", border: "none", fontSize: 12, fontWeight: 400, color: S.text, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                          </div>
                        </div>

                        {/* Send button */}
                        <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                        <button onClick={() => { if (annotationInput.trim()) handleAnnotation(); else { setSelection(null); setAnnotationInput(""); } }}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "10px 0", border: "none",
                            cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            color: annotationInput.trim() ? S.text : "rgba(44,40,36,0.2)",
                            background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                            boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset",
                            transition: "all 0.06s ease",
                          }}>
                          {annotationInput.trim() ? (
                            <>{isRewriting ? (<><div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent, animation: "lucyPulse 1s ease-in-out infinite" }} />SENDING...</>) : (<><div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />SEND NOTE</>)}</>
                          ) : "DISMISS"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Annotation log */}
                {annotations.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>NOTES</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {annotations.map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0" }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: S.accent, boxShadow: "0 0 4px rgba(229,166,50,0.3)" }} />
                          <div>
                            <span style={{ fontSize: 11, color: "rgba(44,40,36,0.25)", fontStyle: "italic" }}>"{a.selected.length > 40 ? a.selected.slice(0, 40) + "…" : a.selected}"</span>
                            <span style={{ fontSize: 11, color: "rgba(44,40,36,0.15)", margin: "0 6px" }}>→</span>
                            <span style={{ fontSize: 11, color: "rgba(44,40,36,0.5)" }}>{a.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* General rewrite + Lucy */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ background: S.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${S.border}`, borderBottom: "none", overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", flexShrink: 0, marginTop: 6, background: isRewriting ? S.accent : "rgba(229,166,50,0.25)", transition: "background 0.3s ease", animation: isRewriting ? "lucyPulse 1s ease-in-out infinite" : "none" }} />
                      <textarea value={feedbackInput} onChange={(e) => { setFeedbackInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} placeholder="Give a suggestion so Lucy can rewrite it for you..." onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleRewrite(); }} rows={1} style={{ flex: 1, background: "transparent", border: "none", fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: S.text, outline: "none", fontFamily: "'DM Sans', sans-serif", resize: "none", minHeight: 20, overflow: "hidden" }} />
                    </div>
                    <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                    <button onClick={handleRewrite} disabled={!feedbackInput.trim() || isRewriting} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "none", cursor: feedbackInput.trim() && !isRewriting ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: isRewriting ? S.accent : feedbackInput.trim() ? S.text : "rgba(44,40,36,0.1)", background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.06s ease" }}>
                      {isRewriting ? (<><div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent, animation: "lucyPulse 1s ease-in-out infinite" }} />LUCY IS REWRITING...</>) : (<><div style={{ width: 6, height: 6, borderRadius: "50%", background: feedbackInput.trim() ? S.accent : "rgba(44,40,36,0.08)" }} />REWRITE ALL</>)}
                    </button>
                  </div>
                  <div style={{ background: S.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${S.border}`, borderTop: "1px solid rgba(44,40,36,0.04)", padding: "6px 8px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                      <div style={{ flex: 1, minWidth: 0 }}><LucyScreen mode={isRewriting ? "thinking" : lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode} guideText={aiMode === "guide" ? "Select any phrase to redline it. Or give me a general note to rewrite the whole thing." : null} /></div>
                      <div style={{ display: "flex", borderRadius: 3, flexShrink: 0, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.4)", padding: 2, marginTop: 2 }}>
                        {Object.entries(MODES).map(([key, m]) => (<button key={key} onClick={() => setAiMode(key)} onMouseEnter={() => setHoveredAiMode(key)} onMouseLeave={() => setHoveredAiMode(null)} style={{ width: 28, height: 22, borderRadius: 2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", color: aiMode === key ? "#EDEAE4" : "rgba(44,40,36,0.2)", background: aiMode === key ? S.accent : "transparent", boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,180,140,0.1) inset" : "none", transition: "all 0.15s ease" }}>{m.key}</button>))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ EDITING — user takes the pen ═══ */}
          {phase === "editing" && (
            <div style={{ padding: "40px 48px 60px", animation: `fadeIn 0.4s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>Your pen now.</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Edit freely. Make it yours.</p>
                </div>
                <div>
                  <div style={{ background: S.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${S.border}`, borderBottom: "none", overflow: "hidden" }}>
                    <div style={{ padding: "24px 24px 16px" }}>
                      <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} rows={12} style={{ width: "100%", background: "transparent", border: "none", fontSize: 15, fontWeight: 400, lineHeight: 1.85, color: S.text, resize: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em", minHeight: 240 }} />
                    </div>
                    <div style={{ padding: "0 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={() => setPhase("reviewing")} style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.2)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "rgba(44,40,36,0.4)"} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(44,40,36,0.2)"}>← BACK TO LUCY</button>
                      <span style={{ fontSize: 9, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "rgba(44,40,36,0.12)" }}>{wordCount} words</span>
                    </div>
                    <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                    <button onClick={() => { setPhase("locked"); setLucyMode("approves"); }} disabled={!text.trim()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "none", cursor: text.trim() ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: text.trim() ? S.text : "rgba(44,40,36,0.1)", background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.06s ease" }}>
                      {text.trim() && <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />}LOCK MANIFESTO
                    </button>
                  </div>
                  <div style={{ background: S.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${S.border}`, borderTop: "1px solid rgba(44,40,36,0.04)", padding: "6px 8px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                      <div style={{ flex: 1, minWidth: 0 }}><LucyScreen mode={lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode} guideText={aiMode === "guide" ? "It's your manifesto now. Edit until it sounds like the brand — not like Lucy." : null} /></div>
                      <div style={{ display: "flex", borderRadius: 3, flexShrink: 0, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.4)", padding: 2, marginTop: 2 }}>
                        {Object.entries(MODES).map(([key, m]) => (<button key={key} onClick={() => setAiMode(key)} onMouseEnter={() => setHoveredAiMode(key)} onMouseLeave={() => setHoveredAiMode(null)} style={{ width: 28, height: 22, borderRadius: 2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", color: aiMode === key ? "#EDEAE4" : "rgba(44,40,36,0.2)", background: aiMode === key ? S.accent : "transparent", boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,180,140,0.1) inset" : "none", transition: "all 0.15s ease" }}>{m.key}</button>))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ LOCKED ═══ */}
          {phase === "locked" && (
            <div style={{ padding: "8vh 48px 60px", animation: `fadeIn 0.6s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: S.accent, boxShadow: "0 0 6px rgba(229,166,50,0.3)" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.3)" }}>MANIFESTO LOCKED</span>
                  </div>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>What they believe.</h2>
                </div>
                <div style={{ animation: `promptIn 0.5s ${ease} 0.2s both` }}>
                  <div style={{ background: S.card, borderRadius: 4, border: "1px solid rgba(44,40,36,0.06)", boxShadow: S.raised, padding: "32px 32px" }}>
                    {text.split("\n\n").map((para, i) => (
                      <p key={i} style={{ fontSize: 16, fontWeight: 400, color: S.text, lineHeight: 1.85, letterSpacing: "-0.01em", marginBottom: i < text.split("\n\n").length - 1 ? 20 : 0, animation: `fadeIn 0.4s ${ease} ${0.3 + i * 0.15}s both` }}>{para}</p>
                    ))}
                  </div>
                </div>
                <div style={{ maxWidth: 300, margin: "40px auto 0" }}>
                  <div style={{ background: S.screen, borderRadius: 4, padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                      <PixelIcon pattern={LUCY_ICONS.approves} color={S.lcdBright} size={2} />
                      <span style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 10, color: S.lcdBright }}>MANIFESTO COMPLETE</span>
                    </div>
                    <div style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 9, color: S.lcdDim }}>{wordCount} words · {text.split("\n\n").length} paragraphs</div>
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
