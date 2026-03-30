/* ═══════════════════════════════════════════════════════════════
   LUCID — Dashboard
   Brushed aluminum Lucy greeting, strategic suggestions, search + sort.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon } from "../components/ui";

const MODULE_LABELS = {
  personality: "Personality",
  tensions: "Tensions",
  pvm: "Purpose",
  values: "Values",
  tone: "Tone",
  usps: "USPs",
  manifesto: "Manifesto",
  discovery: "Discovery",
};

const MODULE_COLORS = {
  personality: colors.personality,
  tensions: colors.personality,
  pvm: colors.purpose,
  values: colors.values,
  tone: colors.tone,
  usps: colors.usps,
  manifesto: colors.manifesto,
  discovery: colors.discovery,
};

const MODES = {
  support: { key: "S", desc: "HELP ME" },
  challenge: { key: "C", desc: "PUSH ME" },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

function hexToAlpha(hex, alpha) {
  if (!hex || hex.startsWith("rgba")) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ══════════════════════════════════════════════════════════════ */
export default function Dashboard({ onStartProject, onOpenProject, projects = [], setProjects } = {}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [lucyGreeted, setLucyGreeted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [openTray, setOpenTray] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const renameRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLucyGreeted(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (creating && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [creating]);

  useEffect(() => {
    if (renamingId && renameRef.current) {
      setTimeout(() => renameRef.current?.focus(), 50);
    }
  }, [renamingId]);

  const startCreate = () => {
    setCreating(true);
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
    onStartProject?.(newProject);
  };

  const startRename = (project) => {
    setRenamingId(project.id);
    setRenameValue(project.name);
  };

  const submitRename = (project) => {
    if (!renameValue.trim()) return;
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, name: renameValue.trim() } : p));
    setRenamingId(null);
    setOpenTray(null);
  };

  const duplicateProject = (project) => {
    const dup = { ...project, id: Date.now(), name: `${project.name} (copy)`, lastEdited: "Just now" };
    setProjects(prev => [dup, ...prev]);
    setOpenTray(null);
  };

  const archiveProject = (project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, archived: true } : p));
    setOpenTray(null);
  };

  const deleteProject = (project) => {
    setProjects(prev => prev.filter(p => p.id !== project.id));
    setOpenTray(null);
  };

  const filteredProjects = useMemo(() => {
    let result = (projects || []).filter(p => !p.archived);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    if (sortBy === "alpha") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [projects, searchQuery, sortBy]);

  const { lucyContextLine, suggestions } = useMemo(() => {
    if (!projects) return { lucyContextLine: "Ready to start something new?", suggestions: [] };
    const active = projects.filter(p => p.status !== "complete");
    if (active.length === 0) {
      return {
        lucyContextLine: "All projects wrapped up. Ready to start something new?",
        suggestions: [],
      };
    }

    const contextLine = active.length === 1
      ? "You have 1 project in motion. What do you want to work on today?"
      : `You have ${active.length} projects in motion. What do you want to work on today?`;

    const sugs = [];

    const closest = active
      .filter(p => p.modulesComplete.length > 0)
      .sort((a, b) => b.modulesComplete.length - a.modulesComplete.length)[0];

    if (closest) {
      const modLabel = MODULE_LABELS[closest.currentModule] || closest.currentModule;
      sugs.push({
        project: closest,
        name: closest.name,
        icon: "push",
        text: `is in the ${modLabel} phase. Let's wrap it up!`,
        meta: closest.lastEdited,
      });
    }

    const earliest = active
      .filter(p => p !== closest)
      .sort((a, b) => a.modulesComplete.length - b.modulesComplete.length)[0];

    if (earliest) {
      const modLabel = MODULE_LABELS[earliest.currentModule] || earliest.currentModule;
      sugs.push({
        project: earliest,
        name: earliest.name,
        icon: "spark",
        text: `is ready for ${modLabel}. A fresh start with lots of potential.`,
        meta: earliest.lastEdited,
      });
    }

    return { lucyContextLine: contextLine, suggestions: sugs };
  }, [projects]);

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: fonts.primary, color: S.text, position: "relative", background: S.rootBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes lucyPulse { 0%, 100% { opacity:0.7; } 50% { opacity:1; } }
        * { box-sizing:border-box; margin:0; padding:0; }
        textarea:focus, input:focus { outline:none; }
        ::selection { background:rgba(229,166,50,0.12); }
        textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
        .dash-scroll::-webkit-scrollbar { width:3px; }
        .dash-scroll::-webkit-scrollbar-track { background:transparent; }
        .dash-scroll::-webkit-scrollbar-thumb { background:rgba(44,40,36,0.06); border-radius:3px; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${S.gradientTop} 0%, ${S.gradientBottom} 100%)`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header — simplified */}
        <div style={{
          padding: "6px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${S.border}`,
          background: S.panel,
          boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)",
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 2,
            background: S.text, color: "#EDEAE4",
            boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          }}>LUCID</div>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "rgba(44,40,36,0.2)",
          }}>
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {/* Content */}
        <div className="dash-scroll" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "40px 24px 80px", maxWidth: 640, margin: "0 auto" }}>

            {/* Lucy greeting — brushed aluminum */}
            <div style={{
              borderRadius: 10, padding: 28, marginBottom: 28,
              background: colors.lucySurface,
              backgroundImage: colors.lucyGrain,
              border: `1px solid ${colors.lucyBorder}`,
              boxShadow: colors.lucyShadow,
              opacity: lucyGreeted ? 1 : 0,
              transform: lucyGreeted ? "translateY(0)" : "translateY(8px)",
              transition: `all 0.5s ${ease}`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 48, height: 36, background: colors.eink, borderRadius: 3,
                  border: `1px solid ${colors.einkBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <PixelIcon icon="guide" color={colors.ink} size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: fonts.pixel, fontSize: 18,
                    color: colors.lucyStatusText, lineHeight: 1.3,
                    letterSpacing: "0.08em",
                  }}>
                    {getGreeting()} <span style={{ color: colors.lucyAmberText }}>Ashwin.</span>
                  </div>
                  <div style={{
                    fontSize: 13, color: "#6B6560", lineHeight: 1.5, marginTop: 8,
                  }}>
                    {lucyContextLine}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div style={{
                marginTop: 20, paddingTop: 16,
                borderTop: `1px solid ${colors.lucyBorder}`,
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {suggestions.map((sug, i) => (
                  <div key={i} onClick={() => onOpenProject?.(sug.project)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 6,
                    background: colors.eink,
                    border: `1px solid ${colors.einkBorder}`,
                    cursor: "pointer",
                    transition: `all 0.15s ${ease}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#C5C0B2"; e.currentTarget.style.transform = "translateX(2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = colors.eink; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <div style={{ width: 24, height: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PixelIcon icon={sug.icon} color={colors.ink} size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: colors.ink, lineHeight: 1.5 }}>
                        <strong>{sug.name}</strong> {sug.text}
                      </div>
                      <div style={{
                        fontSize: 10, color: "#7A756E", marginTop: 2,
                        fontFamily: fonts.pixel, letterSpacing: "0.08em",
                      }}>{sug.meta}</div>
                    </div>
                  </div>
                ))}

              </div>

              {/* New project — separate group */}
              <div style={{
                marginTop: 14, paddingTop: 14,
                borderTop: "1px solid rgba(44,40,36,0.08)",
              }}>
                {/* New project card — expands inline when clicked */}
                {!creating ? (
                  <div onClick={startCreate} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 6,
                    background: colors.eink,
                    border: `1px solid ${colors.einkBorder}`,
                    cursor: "pointer",
                    transition: `all 0.15s ${ease}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#C5C0B2"; e.currentTarget.style.transform = "translateX(2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = colors.eink; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <div style={{ width: 24, height: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PixelIcon icon="spark" color={colors.ink} size={16} />
                    </div>
                    <div style={{ fontSize: 12, color: colors.ink, lineHeight: 1.5 }}>
                      <strong>New project</strong> — Start a brand strategy from scratch.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    borderRadius: 6, overflow: "hidden",
                    background: colors.eink,
                    border: `1px solid ${colors.einkBorder}`,
                    animation: `promptIn 0.2s ${ease} both`,
                  }}>
                    <div style={{ padding: "12px 14px 10px" }}>
                      <div style={{ fontSize: 9, color: "#C48B1E", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                        New project
                      </div>
                      <div style={{
                        background: "rgba(44,40,36,0.06)", borderRadius: 4,
                        border: "1px solid rgba(44,40,36,0.08)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04) inset",
                        padding: "8px 10px",
                      }}>
                        <input
                          ref={inputRef}
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Client or project name"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitName();
                            if (e.key === "Escape") { setCreating(false); setNewName(""); }
                          }}
                          style={{
                            width: "100%", background: "transparent", border: "none",
                            fontSize: 13, fontWeight: 400, color: colors.ink,
                            outline: "none", fontFamily: fonts.primary,
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ padding: "0 14px 12px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => { setCreating(false); setNewName(""); }} style={{
                        padding: "5px 14px", borderRadius: 12,
                        border: "1px solid rgba(44,40,36,0.14)",
                        background: "transparent", cursor: "pointer",
                        fontFamily: fonts.primary, fontSize: 10, fontWeight: 500,
                        color: "rgba(44,40,36,0.4)",
                        transition: "all 0.15s ease",
                      }}>Cancel</button>
                      <button onClick={submitName} disabled={!newName.trim()} style={{
                        padding: "5px 14px", borderRadius: 12,
                        border: `1px solid ${newName.trim() ? "rgba(44,40,36,0.3)" : "rgba(44,40,36,0.1)"}`,
                        background: "transparent", cursor: newName.trim() ? "pointer" : "default",
                        fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
                        color: newName.trim() ? colors.ink : "rgba(44,40,36,0.2)",
                        transition: "all 0.15s ease",
                      }}>Start</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search + Sort */}
            {projects.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 14, padding: "0 2px",
              }}>
                <div
                  onClick={() => searchInputRef.current?.focus()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px",
                    background: "transparent",
                    border: `1px solid ${searchQuery ? "rgba(44,40,36,0.2)" : "rgba(44,40,36,0.1)"}`,
                    borderRadius: 16,
                    fontSize: 11, fontWeight: 500,
                    color: searchQuery ? "rgba(44,40,36,0.5)" : "rgba(44,40,36,0.3)",
                    cursor: "pointer", fontFamily: fonts.primary,
                    transition: `all 0.15s ${ease}`,
                  }}
                >
                  <PixelIcon icon="probe" color="currentColor" size={13} />
                  {!searchQuery && <span>Search</span>}
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to filter..."
                    style={{
                      width: searchQuery ? 120 : 0,
                      background: "transparent", border: "none",
                      fontSize: 11, color: S.text, fontFamily: fonts.primary,
                      outline: "none", fontWeight: 500,
                      transition: `width 0.2s ${ease}`,
                    }}
                    onFocus={(e) => { e.target.style.width = "120px"; const span = e.target.parentElement.querySelector("span"); if (span) span.style.display = "none"; }}
                    onBlur={(e) => { if (!searchQuery) { e.target.style.width = "0"; const span = e.target.parentElement.querySelector("span"); if (span) span.style.display = ""; } }}
                  />
                  {searchQuery && (
                    <span onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                      style={{ fontSize: 11, color: "rgba(44,40,36,0.2)", cursor: "pointer", lineHeight: 1 }}>×</span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 2 }}>
                  {["recent", "alpha"].map(s => (
                    <button key={s} onClick={() => setSortBy(s)} style={{
                      padding: "5px 10px", border: "none", cursor: "pointer", borderRadius: 12,
                      fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
                      fontFamily: fonts.primary, transition: "all 0.15s ease",
                      background: sortBy === s ? "rgba(44,40,36,0.06)" : "transparent",
                      color: sortBy === s ? S.text : "rgba(44,40,36,0.18)",
                    }}>{s === "recent" ? "Recent" : "A–Z"}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredProjects.map((project, i) => {
                const mod = project.status === "complete" ? "complete" : project.currentModule;
                const label = project.status === "complete" ? "Complete" : (MODULE_LABELS[mod] || mod || "");
                const color = project.status === "complete" ? S.accent : (MODULE_COLORS[mod] || "rgba(44,40,36,0.3)");
                const bg = project.status === "complete"
                  ? "rgba(229,166,50,0.1)"
                  : hexToAlpha(color, 0.1);
                const trayOpen = openTray === project.id;

                const TRAY_ACTIONS = [
                  { icon: "edit",    label: "Rename",    action: () => startRename(project) },
                  { icon: "copy",    label: "Duplicate", action: () => duplicateProject(project) },
                  { icon: "archive", label: "Archive",   action: () => archiveProject(project) },
                ];

                return (
                  <div key={project.id} style={{
                    background: S.card, borderRadius: 6,
                    border: "1px solid rgba(44,40,36,0.06)",
                    boxShadow: trayOpen ? shadows.cardHover : shadows.raised,
                    overflow: "hidden",
                    transition: `box-shadow 0.2s ${ease}`, marginBottom: 8,
                    animation: `promptIn 0.4s ${ease} ${i * 0.05}s both`,
                  }}>
                    {/* Header row */}
                    <div
                      onClick={() => onOpenProject?.(project)}
                      style={{
                        padding: "14px 16px 14px 20px", display: "flex", alignItems: "center",
                        justifyContent: "space-between", cursor: "pointer",
                        transition: `background 0.15s ${ease}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(44,40,36,0.015)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Left: name + module badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{project.name}</span>
                        <div style={{
                          fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
                          padding: "3px 8px", borderRadius: 3,
                          fontFamily: fonts.pixel, flexShrink: 0,
                          background: bg, color: color,
                        }}>{label.toUpperCase()}</div>
                      </div>
                      {/* Right: timestamp + three-dot */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "rgba(44,40,36,0.3)" }}>{project.lastEdited}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setOpenTray(prev => prev === project.id ? null : project.id);
                            setRenamingId(null);
                          }}
                          style={{
                            width: 28, height: 28, border: "none", cursor: "pointer",
                            borderRadius: 6, flexShrink: 0,
                            background: trayOpen ? "rgba(44,40,36,0.06)" : "transparent",
                            color: trayOpen ? "rgba(44,40,36,0.4)" : "rgba(44,40,36,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(44,40,36,0.06)"; e.currentTarget.style.color = "rgba(44,40,36,0.4)"; }}
                          onMouseLeave={e => { if (!trayOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(44,40,36,0.2)"; } }}
                        >
                          <PixelIcon icon="more" color="currentColor" size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Management tray */}
                    <div style={{
                      overflow: "hidden",
                      maxHeight: trayOpen ? 60 : 0,
                      opacity: trayOpen ? 1 : 0,
                      transition: `max-height 0.22s ${ease}, opacity 0.15s ${ease}`,
                      borderTop: trayOpen ? "1px solid rgba(44,40,36,0.04)" : "none",
                    }}>
                      {renamingId === project.id ? (
                        /* Rename inline input */
                        <div style={{ padding: "8px 14px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            flex: 1, background: S.recess, borderRadius: 4,
                            border: `1px solid ${S.border}`,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset",
                            padding: "6px 10px",
                          }}>
                            <input
                              ref={renameRef}
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") { e.stopPropagation(); submitRename(project); }
                                if (e.key === "Escape") { e.stopPropagation(); setRenamingId(null); }
                              }}
                              style={{
                                width: "100%", background: "transparent", border: "none",
                                fontSize: 13, fontWeight: 400, color: S.text,
                                fontFamily: fonts.primary, outline: "none",
                              }}
                            />
                          </div>
                          <button onClick={e => { e.stopPropagation(); setRenamingId(null); }} style={{
                            padding: "4px 10px", borderRadius: 12, border: "none",
                            background: "transparent", cursor: "pointer",
                            fontFamily: fonts.primary, fontSize: 10, fontWeight: 500,
                            color: "rgba(44,40,36,0.35)",
                          }}>Cancel</button>
                          <button onClick={e => { e.stopPropagation(); submitRename(project); }} style={{
                            padding: "4px 10px", borderRadius: 12, border: "none",
                            background: "transparent", cursor: "pointer",
                            fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
                            color: renameValue.trim() ? S.text : "rgba(44,40,36,0.2)",
                          }}>Save</button>
                        </div>
                      ) : (
                        /* Action buttons */
                        <div style={{ padding: "8px 14px 10px", display: "flex", alignItems: "center", gap: 2 }}>
                          {TRAY_ACTIONS.map(({ icon, label, action }) => (
                            <button key={label} onClick={e => { e.stopPropagation(); action(); }} style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "4px 10px", borderRadius: 12, border: "none",
                              background: "transparent", cursor: "pointer",
                              fontFamily: fonts.primary, fontSize: 10, fontWeight: 500,
                              color: "rgba(44,40,36,0.35)",
                              transition: "color 0.15s ease",
                            }}
                              onMouseEnter={e => { e.currentTarget.style.color = "rgba(44,40,36,0.7)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "rgba(44,40,36,0.35)"; }}
                            >
                              <PixelIcon icon={icon} color="currentColor" size={12} />
                              {label}
                            </button>
                          ))}
                          {/* Delete — danger, pushed right */}
                          <button onClick={e => { e.stopPropagation(); deleteProject(project); }} style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "4px 10px", borderRadius: 12, border: "none",
                            background: "transparent", cursor: "pointer",
                            fontFamily: fonts.primary, fontSize: 10, fontWeight: 500,
                            color: "rgba(196,48,48,0.4)",
                            marginLeft: "auto",
                            transition: "color 0.15s ease",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#C43030"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "rgba(196,48,48,0.4)"; }}
                          >
                            <PixelIcon icon="trash" color="currentColor" size={12} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty search state */}
            {filteredProjects.length === 0 && searchQuery && (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: "rgba(44,40,36,0.15)", fontSize: 12,
              }}>
                No projects match &ldquo;{searchQuery}&rdquo;
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
