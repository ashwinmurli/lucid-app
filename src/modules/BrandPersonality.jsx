/* ═══════════════════════════════════════════════════════════════
   LUCID — Brand Personality
   9 writing prompts across 2 chapters with Lucy AI partner. Textarea + Spark/Keep sidebar.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

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

/* ── BrandPersonality-specific Lucy screen (has typingStatus support) ── */

function PersonalityLucyScreen({ mode, hoveredModeInfo, aiMode, typingStatus, guideText }) {
  const isActive = mode !== "off"; const isThinking = mode === "thinking"; const hasGuide = !!guideText;
  const [hover, setHover] = useState(false); const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); const screenRef = useRef(null);
  const handleMouseMove = (e) => { if (!screenRef.current) return; const rect = screenRef.current.getBoundingClientRect(); setMousePos({ x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)) }); };
  const idleLabels = { guide: "GUIDE", challenge: "READY", cocreate: "CO-OP" }; const idleIcons = { guide: "guide", challenge: "idle", cocreate: "cocreate" };
  const typingStates = { listening: { label: "LISTENING", icon: "idle", bg: "#1C1916", text: S.lcd }, weak: { label: "PUSH MORE", icon: "thinking", bg: "#1C1916", text: S.accent }, vague: { label: "BE SPECIFIC", icon: "thinking", bg: "#1C1916", text: S.accent }, strong: { label: "LOOKING GOOD", icon: "approves", bg: "#1C1916", text: S.lcdBright }, composing: { label: "COMPOSING", icon: "cocreate", bg: "#1C1916", text: S.lcd } };
  let es; if (isThinking) es = { label: "READING", icon: "thinking", bg: "#1C1916", text: S.accent }; else if (mode === "approves") es = { label: "NOTED", icon: "approves", bg: "#1C1916", text: S.lcdBright }; else if (typingStatus) es = typingStates[typingStatus] || typingStates.listening; else es = { label: idleLabels[aiMode] || "READY", icon: idleIcons[aiMode] || "idle", bg: "#1C1916", text: S.lcd }; if (mode === "off") es = { label: "LUCY", icon: "off", bg: S.screen, text: S.lcdDim };
  const gridRgb = es.text === S.accent ? "229,166,50" : es.text === S.lcdBright ? "240,192,80" : "229,166,50";
  const smi = hoveredModeInfo && isActive; const dIcon = smi ? (hoveredModeInfo.key === "GDE" ? "guide" : hoveredModeInfo.key === "CRT" ? "cocreate" : "idle") : es.icon; const dLabel = smi ? hoveredModeInfo.desc : es.label; const dColor = smi ? S.lcd : es.text; const dBg = smi ? "#1C1916" : es.bg;
  return (
    <div style={{ position: "relative" }}>
      <div ref={screenRef} onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setMousePos({ x: 0.5, y: 0.5 }); }} onMouseMove={handleMouseMove} style={{ width: "100%", height: 28, borderRadius: hasGuide ? "3px 3px 0 0" : 3, background: dBg, boxShadow: "0 1px 3px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.04)", border: "1px solid rgba(0,0,0,0.12)", borderBottom: hasGuide ? "none" : "1px solid rgba(0,0,0,0.12)", overflow: "hidden", cursor: "default", transition: "background 0.4s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: hover && isActive && !smi && !hasGuide ? 0 : 1, transition: "opacity 0.15s ease", zIndex: 1, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
          <div style={{ animation: (isThinking || typingStatus === "weak" || typingStatus === "vague") ? "lucyPulse 1.5s ease-in-out infinite" : "none" }}><PixelIcon pattern={LUCY_ICONS[dIcon] || LUCY_ICONS.off} color={dColor} size={2} /></div>
          <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: dColor, lineHeight: 1, transition: "color 0.3s ease" }}>{dLabel}</span>
        </div>
        {isActive && !smi && !hasGuide && (<div style={{ position: "absolute", inset: 2, display: "grid", gridTemplateColumns: "repeat(36, 1fr)", gridTemplateRows: "repeat(10, 1fr)", gap: 0.5, opacity: hover ? 1 : 0, transition: "opacity 0.15s ease", zIndex: 2 }}>{Array.from({ length: 360 }, (_, i) => { const dx = ((i % 36) / 35) - mousePos.x; const dy = (Math.floor(i / 36) / 9) - mousePos.y; const b = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 2.5); return <div key={i} style={{ background: b > 0.05 ? `rgba(${gridRgb},${b * 0.5})` : "transparent", transition: "background 0.04s linear" }} />; })}</div>)}
      </div>
      {hasGuide && (<div style={{ background: dBg, borderRadius: "0 0 3px 3px", marginTop: -1, border: "1px solid rgba(0,0,0,0.12)", borderTop: "none" }}><div style={{ height: 1, background: S.lcdDim, margin: "0 6px" }} /><div style={{ padding: "6px 8px" }}><div style={{ transform: "scale(0.65)", transformOrigin: "top left", width: "154%" }}><div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 16, color: S.lcd, lineHeight: 1.5 }}>{guideText}</div></div></div></div>)}
    </div>
  );
}

function ActionBar({ hasText, onSpark, onKeep }) {
  const [pressed, setPressed] = useState(false); const [fired, setFired] = useState(false);
  useEffect(() => { if (!hasText) setFired(false); }, [hasText]);
  return (<button onMouseDown={hasText ? () => { setPressed(true); setTimeout(() => { onKeep(); setPressed(false); }, 120); } : () => { if (fired) return; setPressed(true); setFired(true); setTimeout(() => { onSpark(); setPressed(false); }, 250); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", borderRadius: 0, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: hasText ? (pressed ? "rgba(44,40,36,0.4)" : S.text) : (pressed ? "rgba(229,166,50,0.4)" : "rgba(229,166,50,0.6)"), background: pressed ? `linear-gradient(180deg, ${S.recess} 0%, #CCC7BD 100%)` : `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`, boxShadow: pressed ? "0 1px 3px rgba(0,0,0,0.06) inset" : "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", transform: pressed ? "translateY(0.5px)" : "translateY(0)", transition: "all 0.06s ease" }}>{hasText ? (<><span style={{ fontSize: 8, fontWeight: 500, opacity: 0.3 }}>⌘ ENTER</span><span>{pressed ? "KEEPING..." : "KEEP ↵"}</span></>) : (<><div style={{ width: 6, height: 6, borderRadius: "50%", background: pressed ? "rgba(229,166,50,0.3)" : S.accent }} /><span>{pressed ? "SPARKING..." : "SPARK"}</span></>)}</button>);
}

function Btn({ children, onClick, accent, style: sx }) {
  const [p, sP] = useState(false);
  return (<button onClick={onClick} onMouseDown={() => sP(true)} onMouseUp={() => sP(false)} onMouseLeave={() => sP(false)} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 14px", borderRadius: 3, border: "none", cursor: "pointer", color: accent ? (p ? "#EDEAE4" : S.accent) : (p ? "#EDEAE4" : S.text), background: accent ? (p ? "#C8901F" : S.card) : (p ? S.text : S.card), boxShadow: p ? S.pressed : S.raised, transform: p ? "translateY(1px)" : "translateY(0)", transition: "all 0.08s ease", ...sx }}>{children}</button>);
}

function PanelCard({ note, onEdit }) {
  const [h, sH] = useState(false); const [exp, sExp] = useState(false); const [et, sEt] = useState(note.text); const eRef = useRef(null); const [lucyVis, setLucyVis] = useState(false);
  useEffect(() => { if (exp && eRef.current) { eRef.current.focus(); eRef.current.setSelectionRange(et.length, et.length); } }, [exp]);
  useEffect(() => { if (note.lucyText) { const t = setTimeout(() => setLucyVis(true), 1200); return () => clearTimeout(t); } }, [note.lucyText]);
  return (
    <div style={{ marginBottom: 8 }}>
      <div onClick={() => !exp && sExp(true)} onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)} style={{ background: S.card, borderRadius: 4, border: `1px solid ${exp ? "rgba(229,166,50,0.12)" : "rgba(44,40,36,0.08)"}`, boxShadow: h || exp ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)", transform: h && !exp ? "translateY(-1px)" : "none", transition: `all 0.25s ${ease}`, cursor: exp ? "default" : "pointer", overflow: "hidden" }}>
        <div style={{ height: 2, background: h || exp ? S.accent : "rgba(44,40,36,0.06)", transition: "background 0.25s ease" }} />
        <div style={{ padding: "12px 14px 10px" }}>
          {!exp ? (<><div style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.65, color: S.text }}>{note.text}</div><div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>{note.lucyMode && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", padding: "1px 4px", borderRadius: 2, background: note.lucyMode === "cocreate" ? "rgba(229,166,50,0.15)" : "rgba(229,166,50,0.1)", color: note.lucyMode === "cocreate" ? S.lcd : "rgba(229,166,50,0.5)" }}>{MODES[note.lucyMode]?.key}</span>}<span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", color: "rgba(44,40,36,0.14)", textTransform: "uppercase" }}>{note.prompt}</span></div></>) : (<><textarea ref={eRef} value={et} onChange={(e) => sEt(e.target.value)} style={{ width: "100%", minHeight: 60, background: "transparent", border: "none", fontSize: 13, fontWeight: 400, lineHeight: 1.65, color: S.text, resize: "none", outline: "none", fontFamily: "'DM Sans', sans-serif" }} onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) { onEdit(et); sExp(false); } if (e.key === "Escape") { sEt(note.text); sExp(false); } }} /><div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${S.border}` }}><Btn onClick={(e) => { e.stopPropagation(); sEt(note.text); sExp(false); }}>ESC</Btn><Btn accent onClick={(e) => { e.stopPropagation(); onEdit(et); sExp(false); }}>SAVE</Btn></div></>)}
        </div>
        {note.lucyText && (<div style={{ opacity: lucyVis ? 1 : 0, transition: `opacity 0.4s ${ease}` }}><div style={{ height: 1, background: note.lucyMode === "cocreate" ? "rgba(229,166,50,0.12)" : "rgba(229,166,50,0.08)" }} /><div style={{ padding: "8px 14px", display: "flex", alignItems: "flex-start", gap: 8 }}><div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: note.lucyMode === "cocreate" ? S.lcd : S.accent }} /><div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: note.lucyMode === "cocreate" ? "rgba(229,166,50,0.6)" : "rgba(229,166,50,0.55)", lineHeight: 1.5 }}>{note.lucyText}</div></div></div>)}
      </div>
    </div>
  );
}

function ChapterStack({ title, notes, total, isComplete, onEditNote }) {
  const [expanded, setExpanded] = useState(true);
  useEffect(() => { if (isComplete) { const t = setTimeout(() => setExpanded(false), 800); return () => clearTimeout(t); } }, [isComplete]);
  if (notes.length === 0) return null;
  const litColor = isComplete ? S.accent : S.lcd; const dimColor = isComplete ? "#3A2820" : S.lcdDim;
  return (
    <div style={{ marginBottom: 12, borderRadius: 5, overflow: "hidden", background: S.screen, boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: litColor, flexShrink: 0 }} /><div style={{ transform: "scale(0.7)", transformOrigin: "left center", whiteSpace: "nowrap" }}><span style={{ fontFamily: "'DotGothic16', sans-serif", fontSize: 16, color: litColor, textTransform: "uppercase" }}>{title}</span></div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ transform: "scale(0.7)", transformOrigin: "right center", whiteSpace: "nowrap" }}><span style={{ fontFamily: "'DotGothic16', sans-serif", fontSize: 16, color: litColor }}>{isComplete ? "DONE" : `${notes.length}/${total}`}</span></div><div style={{ transform: "scale(0.7)", transformOrigin: "center center" }}><span style={{ fontFamily: "'DotGothic16', sans-serif", fontSize: 16, color: dimColor, display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: `transform 0.3s ${ease}` }}>v</span></div></div>
      </div>
      <div style={{ display: "grid", gridTemplateRows: expanded ? "1fr" : "0fr", opacity: expanded ? 1 : 0, transition: `grid-template-rows 0.4s ${ease}, opacity 0.25s ease` }}><div style={{ overflow: "hidden" }}><div style={{ height: 1, background: S.lcdDim, margin: "0 12px" }} /><div style={{ padding: "8px 10px 10px" }}>{notes.map((note) => <PanelCard key={note.id} note={note} onEdit={(t) => onEditNote(note.id, t)} />)}</div></div></div>
    </div>
  );
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
  const [hoveredAiMode, setHoveredAiMode] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const done = cur >= ALL_PROMPTS.length;
  const prompt = done ? null : ALL_PROMPTS[cur];
  const PANEL_W = 380;

  const chapterGroups = useMemo(() => CHAPTERS.map((ch) => {
    const cn = notes.filter((n) => n.chapter === ch.title);
    return { title: ch.title, notes: cn.reverse(), total: ch.prompts.length, isComplete: cn.length >= ch.prompts.length };
  }), [notes]);

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

  const hoveredModeInfo = hoveredAiMode ? MODES[hoveredAiMode] : null;
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
        .panel-scroll::-webkit-scrollbar { width:3px; }
        .panel-scroll::-webkit-scrollbar-track { background:transparent; }
        .panel-scroll::-webkit-scrollbar-thumb { background:rgba(44,40,36,0.06); border-radius:3px; }
      `}</style>

      {/* Canvas */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #EDEAE4 0%, #E5E2DB 100%)", transition: `transform 0.45s ${ease}`, transform: panelOpen ? `translateX(-${PANEL_W}px)` : "translateX(0)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => { if (cur > 0) { setCur((c) => c - 1); setAnimKey((k) => k + 1); } }} style={{ width: 28, height: 28, borderRadius: 4, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)", color: "rgba(44,40,36,0.25)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: "all 0.08s ease" }}>‹</button>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Personality</span>
              <span style={{ fontSize: 9, color: "rgba(44,40,36,0.35)" }}>–</span>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{done ? "Complete" : prompt?.chapter}</span>
            </div>
            {prompt && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
                <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcd, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{chapterProgress.num}/{chapterProgress.total}</span>
              </div>
            )}
            <button onClick={() => { if (!done) { setCur((c) => c + 1); setAnimKey((k) => k + 1); setText(""); } }} style={{ width: 28, height: 28, borderRadius: 4, border: "none", cursor: done ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)", color: done ? "rgba(44,40,36,0.08)" : "rgba(44,40,36,0.25)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: "all 0.08s ease" }}>›</button>
          </div>
        </div>

        {/* Content */}
        <div ref={canvasRef} style={{ height: "calc(100% - 40px)", overflowY: "auto", position: "relative" }}>
          {!done && prompt && (
            <div style={{ padding: "10vh 48px 60px", display: "flex", justifyContent: "center" }}>
              <div key={animKey} style={{ width: "100%", maxWidth: 520, animation: `promptIn 0.4s ${ease} both` }}>
                <h2 style={{ fontSize: 30, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>{prompt.q}</h2>
                <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", marginBottom: 24, lineHeight: 1.5 }}>{prompt.sub}</p>
                <div>
                  <div style={{ background: S.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${S.border}`, borderBottom: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.04) inset, 0 1px 2px rgba(0,0,0,0.02) inset", overflow: "hidden" }}>
                    <div style={{ padding: "20px 22px 16px" }}>
                      <textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)} placeholder="Start writing..." rows={5} style={{ width: "100%", minHeight: 120, background: "transparent", border: "none", padding: 0, fontSize: 16, fontWeight: 400, lineHeight: 1.8, color: S.text, resize: "none", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em" }} onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) keep(); }} />
                    </div>
                    <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                    <ActionBar hasText={!!text.trim()} onSpark={spark} onKeep={keep} />
                  </div>
                  <div style={{ background: S.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${S.border}`, borderTop: `1px solid rgba(44,40,36,0.04)`, padding: "6px 8px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <PersonalityLucyScreen mode={lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode} typingStatus={typingStatus} guideText={aiMode === "guide" && prompt ? prompt.guide : null} />
                      </div>
                      <div style={{ display: "flex", borderRadius: 3, flexShrink: 0, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.4)", padding: 2, marginTop: 2 }}>
                        {Object.entries(MODES).map(([key, m]) => (<button key={key} onClick={() => setAiMode(key)} onMouseEnter={() => setHoveredAiMode(key)} onMouseLeave={() => setHoveredAiMode(null)} style={{ width: 28, height: 22, borderRadius: 2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", color: aiMode === key ? "#EDEAE4" : "rgba(44,40,36,0.2)", background: aiMode === key ? S.accent : "transparent", boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,180,140,0.1) inset" : "none", transition: "all 0.15s ease" }}>{m.key}</button>))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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

      {/* Drawer */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: PANEL_W, background: S.panel, borderLeft: "1px solid rgba(44,40,36,0.08)", boxShadow: panelOpen ? "-4px 0 24px rgba(0,0,0,0.06)" : "none", transform: panelOpen ? "translateX(0)" : `translateX(${PANEL_W}px)`, transition: `transform 0.45s ${ease}`, zIndex: 20, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0, boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset" }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.muted }}>THOUGHTS</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(44,40,36,0.12)", fontVariantNumeric: "tabular-nums" }}>{notes.length}</span>
        </div>
        <div className="panel-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 12px 80px" }}>
          {notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(44,40,36,0.1)", fontSize: 12 }}>Your thoughts will appear here.</div>
          ) : chapterGroups.map((g) => <ChapterStack key={g.title} title={g.title} notes={g.notes} total={g.total} isComplete={g.isComplete} onEditNote={editNote} />)}
        </div>
      </div>

      {/* Drawer toggle */}
      <button onClick={() => setPanelOpen((o) => !o)} style={{ position: "absolute", right: panelOpen ? PANEL_W : 0, top: "50%", transform: "translateY(-50%)", width: 36, height: 72, borderRadius: "6px 0 0 6px", background: panelOpen ? S.accent : S.screen, border: `1px solid ${panelOpen ? "rgba(229,166,50,0.4)" : "rgba(0,0,0,0.12)"}`, borderRight: "none", boxShadow: panelOpen ? "-2px 0 12px rgba(229,166,50,0.15), 0 1px 0 rgba(255,255,255,0.15) inset" : "-2px 0 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.12) inset, 0 1px 0 rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, zIndex: 25, transition: `right 0.45s ${ease}, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease` }}>
        <div style={{ fontFamily: "'Silkscreen', cursive", fontSize: 14, color: panelOpen ? "#1E1B17" : (notes.length > 0 ? S.accent : S.lcdDim), lineHeight: 1, transition: "all 0.3s ease" }}>{String(notes.length).padStart(2, "0")}</div>
        <div style={{ fontFamily: "'Silkscreen', cursive", fontSize: 7, color: panelOpen ? "#1E1B17" : (notes.length > 0 ? S.accent : S.lcdDim), transition: "all 0.3s ease", transform: panelOpen ? "scaleX(-1)" : "scaleX(1)" }}>{"<<"}</div>
      </button>
    </div>
  );
}
