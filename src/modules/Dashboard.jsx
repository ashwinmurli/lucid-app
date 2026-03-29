/* ═══════════════════════════════════════════════════════════════
   LUCID — Dashboard
   OP-1 Lucy greeting, card/list toggle, conversational project creation.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

const STATUS_LABELS = {
  discovery: { label: "DISCOVERY", color: S.lcd },
  synthesis: { label: "SYNTHESIS", color: S.accent },
  complete: { label: "COMPLETE", color: S.lcdBright },
};

const MODULES = [
  { key: "personality", label: "Personality" },
  { key: "tensions", label: "Tensions" },
  { key: "pvm", label: "PVM" },
  { key: "values", label: "Values" },
  { key: "tone", label: "Tone" },
  { key: "usps", label: "USPs" },
  { key: "manifesto", label: "Manifesto" },
];

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

const SAMPLE_PROJECTS = [
  {
    id: 1, name: "Aether Studios", status: "synthesis",
    lastEdited: "2 hours ago",
    modulesComplete: ["personality", "tensions", "pvm", "values"],
    currentModule: "tone",
  },
  {
    id: 2, name: "Nørde Coffee", status: "discovery",
    lastEdited: "Yesterday",
    modulesComplete: [],
    currentModule: "discovery",
  },
  {
    id: 3, name: "Veld Architecture", status: "complete",
    lastEdited: "3 days ago",
    modulesComplete: ["personality", "tensions", "pvm", "values", "tone", "usps", "manifesto"],
    currentModule: null,
  },
  {
    id: 4, name: "Halcyon Health", status: "synthesis",
    lastEdited: "Last week",
    modulesComplete: ["personality", "tensions"],
    currentModule: "pvm",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

/* ── Progress dots ── */
function ProgressDots({ complete, total }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 4, height: 4,
          background: i < complete ? S.accent : "rgba(61,56,48,0.08)",
          borderRadius: "50%",
          transition: "background 0.2s ease",
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [view, setView] = useState("cards"); // cards | list
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [newName, setNewName] = useState("");
  const [lucyGreeted, setLucyGreeted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLucyGreeted(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating, createStep]);

  const startCreate = () => {
    setCreating(true);
    setCreateStep(0);
    setNewName("");
  };

  const submitName = () => {
    if (!newName.trim()) return;
    const newProject = {
      id: Date.now(), name: newName.trim(), status: "discovery",
      lastEdited: "Just now", modulesComplete: [], currentModule: "discovery",
    };
    setProjects((prev) => [newProject, ...prev]);
    setCreating(false);
    setNewName("");
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
        .dash-scroll::-webkit-scrollbar { width:3px; }
        .dash-scroll::-webkit-scrollbar-track { background:transparent; }
        .dash-scroll::-webkit-scrollbar-thumb { background:rgba(61,56,48,0.06); border-radius:3px; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #ECE7DE 0%, #E3DED4 100%)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDE9E1", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* View toggle */}
            <div style={{ display: "flex", borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              {[
                { key: "cards", icon: "⊞" },
                { key: "list", icon: "☰" },
              ].map((v) => (
                <button key={v.key} onClick={() => setView(v.key)} style={{
                  width: 28, height: 24, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: view === v.key ? S.text : "rgba(61,56,48,0.2)",
                  background: view === v.key ? "rgba(61,56,48,0.06)" : "rgba(61,56,48,0.02)",
                  transition: "all 0.15s ease", userSelect: "none",
                }}>{v.icon}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcd, lineHeight: 1 }}>{projects.length}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dash-scroll" style={{ flex: 1, overflowY: "auto", padding: "40px 48px 60px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>

            {/* Lucy greeting — OP-1 style screen */}
            <div style={{ marginBottom: 32, opacity: lucyGreeted ? 1 : 0, transform: lucyGreeted ? "translateY(0)" : "translateY(8px)", transition: `all 0.5s ${ease}` }}>
              <div style={{
                background: S.screen, borderRadius: 6, overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25) inset, 0 1px 0 rgba(255,255,255,0.06)",
                border: "1px solid rgba(0,0,0,0.15)",
                padding: "24px 28px 20px",
              }}>
                {/* Top row — Lucy icon + status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <PixelIcon pattern={LUCY_ICONS.guide} color={S.lcd} size={2.5} />
                    <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcdDim }}>LUCY</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcdDim }}>{projects.filter((p) => p.status !== "complete").length} active</span>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: S.lcd }} />
                  </div>
                </div>

                {/* Greeting — large, centered */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 28, color: S.lcd, lineHeight: 1.2 }}>{getGreeting()}</div>
                  <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 28, color: S.lcdBright, lineHeight: 1.2 }}>Ashwin.</div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: S.lcdDim, marginBottom: 12 }} />

                {/* Bottom — contextual message */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcd }}>
                    {projects.length === 0
                      ? "No projects yet. Start one."
                      : "Pick up where you left off."}
                  </span>
                  <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcdDim }}>READY</span>
                </div>
              </div>
            </div>

            {/* New project button / creation flow */}
            {!creating ? (
              <button onClick={startCreate} style={{
                width: "100%", padding: "14px 0", marginBottom: 24, borderRadius: 6,
                border: `1px dashed rgba(61,56,48,0.12)`, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "rgba(61,56,48,0.25)", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: `all 0.2s ${ease}`,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = S.text; e.currentTarget.style.borderColor = "rgba(61,56,48,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(61,56,48,0.25)"; e.currentTarget.style.borderColor = "rgba(61,56,48,0.12)"; }}
              >
                + NEW PROJECT
              </button>
            ) : (
              <div style={{ marginBottom: 24, animation: `promptIn 0.3s ${ease} both` }}>
                <div style={{ background: S.card, borderRadius: 6, border: "1px solid rgba(212,115,74,0.15)", boxShadow: S.raised, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: S.accent, boxShadow: "0 0 4px rgba(212,115,74,0.3)" }} />
                      <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: "rgba(212,115,74,0.5)", lineHeight: 1.5 }}>What's the client's name? Or the project name — whatever helps you find it later.</div>
                    </div>
                    <div style={{ background: S.recess, borderRadius: 4, border: `1px solid ${S.border}`, boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset", padding: "10px 12px" }}>
                      <input ref={inputRef} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Client or project name" onKeyDown={(e) => { if (e.key === "Enter") submitName(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }} style={{ width: "100%", background: "transparent", border: "none", fontSize: 15, fontWeight: 400, color: S.text, outline: "none", fontFamily: "'Inter', sans-serif" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", userSelect: "none" }}>
                    <button onClick={() => { setCreating(false); setNewName(""); }} style={{ flex: 1, padding: "11px 0", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(61,56,48,0.25)", background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", borderRight: "1px solid rgba(61,56,48,0.06)", borderRadius: "0 0 0 6px" }}>CANCEL</button>
                    <button onClick={submitName} disabled={!newName.trim()} style={{ flex: 1, padding: "11px 0", border: "none", cursor: newName.trim() ? "pointer" : "default", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: newName.trim() ? S.text : "rgba(61,56,48,0.1)", background: `linear-gradient(180deg, #F2EDE5 0%, ${S.card} 100%)`, boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: "0 0 6px 0" }}>
                      {newName.trim() && <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />}
                      START PROJECT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ CARDS VIEW ═══ */}
            {view === "cards" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.map((project, i) => {
                  const st = STATUS_LABELS[project.status];
                  return (
                    <div key={project.id} onClick={() => alert(`Open: ${project.name}`)} style={{
                      background: S.card, borderRadius: 4, border: "1px solid rgba(61,56,48,0.06)",
                      boxShadow: S.raised, overflow: "hidden", cursor: "pointer",
                      transition: `all 0.2s ${ease}`,
                      animation: `promptIn 0.4s ${ease} ${i * 0.05}s both`,
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.5) inset"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = S.raised; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: S.text, letterSpacing: "-0.01em" }}>{project.name}</span>
                          </div>
                          <div style={{
                            fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px",
                            borderRadius: 3, background: S.screen,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.15) inset, 0 1px 0 rgba(255,255,255,0.04)",
                            fontFamily: "'DotGothic16', monospace", color: st.color,
                          }}>{st.label}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <ProgressDots complete={project.modulesComplete.length} total={MODULES.length} />
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {project.currentModule && project.currentModule !== "discovery" && (
                              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(61,56,48,0.2)" }}>{MODULES.find((m) => m.key === project.currentModule)?.label}</span>
                            )}
                            {project.currentModule === "discovery" && (
                              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(61,56,48,0.2)" }}>Discovery</span>
                            )}
                            <span style={{ fontSize: 9, fontWeight: 400, color: "rgba(61,56,48,0.15)" }}>{project.lastEdited}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ═══ LIST VIEW ═══ */}
            {view === "list" && (
              <div style={{ background: S.card, borderRadius: 4, border: "1px solid rgba(61,56,48,0.06)", boxShadow: S.raised, overflow: "hidden" }}>
                {projects.map((project, i) => {
                  const st = STATUS_LABELS[project.status];
                  const isLast = i === projects.length - 1;
                  return (
                    <div key={project.id} onClick={() => alert(`Open: ${project.name}`)} style={{
                      padding: "12px 20px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      borderBottom: isLast ? "none" : "1px solid rgba(61,56,48,0.04)",
                      transition: `background 0.15s ease`,
                      animation: `fadeIn 0.3s ${ease} ${i * 0.04}s both`,
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(61,56,48,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: st.color, flexShrink: 0, boxShadow: project.status === "complete" ? "0 0 4px rgba(160,200,160,0.4)" : "none" }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: S.text }}>{project.name}</span>
                        <ProgressDots complete={project.modulesComplete.length} total={MODULES.length} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {project.currentModule && (
                          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(61,56,48,0.2)" }}>
                            {project.currentModule === "discovery" ? "Discovery" : MODULES.find((m) => m.key === project.currentModule)?.label}
                          </span>
                        )}
                        <span style={{ fontSize: 9, fontWeight: 400, color: "rgba(61,56,48,0.15)" }}>{project.lastEdited}</span>
                        <span style={{ fontSize: 14, color: "rgba(61,56,48,0.15)", fontFamily: "'Inter', sans-serif" }}>›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
