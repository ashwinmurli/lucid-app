/* ═══════════════════════════════════════════════════════════════
   LUCID — USPs
   Write USPs → Lucy expands → lead/supporting radio selection.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, LUCY_ICONS, LucyScreen, LucyMini, TransportBtn } from "../components/ui";

const MODES = {
  guide: { key: "GDE", desc: "CONTEXT BEFORE YOU WRITE" },
  challenge: { key: "CHL", desc: "PUSHBACK AFTER YOU WRITE" },
  cocreate: { key: "CRT", desc: "IDEAS ALONGSIDE YOURS" },
};

const STARTER_USPS = [
  { id: 1, raw: "We make brands feel like real people, not corporate personas.", claim: "We build brands as characters — not identities, not guidelines, but people you'd recognise in a room.", proof: "Every brand we build starts with a personality exercise that most agencies skip entirely. The result is a voice that sounds human because it was built from human instincts.", contrast: "Most agencies start with a logo and a colour palette. We start with how the brand walks into a room." },
  { id: 2, raw: "Strategy and execution come from the same brain, not a handoff.", claim: "The person who writes the strategy is the person who designs the output. No handoffs, no dilution.", proof: "Small team means the strategist and the creative director are often the same person. The thinking stays intact from first insight to final deliverable.", contrast: "At larger agencies, strategy gets written by one team and interpreted by another. Something always gets lost in translation." },
  { id: 3, raw: "We deliver brand books that clients actually use, not shelf decoration.", claim: "Our brand books are built to be used daily — not admired once and forgotten.", proof: "Every section is written as a practical tool with examples, do/don't guidance, and real-world scenarios. We test them with the people who'll actually use them.", contrast: "Traditional brand books are beautiful PDFs that sit unopened in a shared drive. Ours get dog-eared." },
];

function USPCard({ usp, isPrimary, onSetPrimary, onRemove, isLocked }) {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [radioPressed, setRadioPressed] = useState(false);

  // Auto-expand when set as primary
  useEffect(() => { if (isPrimary) setExpanded(true); }, [isPrimary]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: S.card, borderRadius: 4,
        border: `1px solid ${isPrimary ? "rgba(229,166,50,0.15)" : "rgba(44,40,36,0.06)"}`,
        boxShadow: hover && !isLocked
          ? "0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.5) inset"
          : S.raised,
        overflow: "hidden",
        transition: `all 0.2s ${ease}`,
        transform: hover && !isLocked ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {/* Claim + lead radio */}
      <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: S.text, lineHeight: 1.5, letterSpacing: "-0.01em" }}>
          {usp.claim}
        </div>
        {/* Lead selector — tactile radio */}
        {!isLocked && (
          <button
            onClick={onSetPrimary}
            onMouseDown={() => setRadioPressed(true)}
            onMouseUp={() => setRadioPressed(false)}
            onMouseLeave={() => setRadioPressed(false)}
            style={{
              width: 22, height: 22, borderRadius: "50%", border: "none",
              cursor: "pointer", flexShrink: 0, marginTop: 2,
              background: isPrimary
                ? radioPressed ? "#C8901F" : S.accent
                : radioPressed
                  ? "#C8C3B9"
                  : `linear-gradient(180deg, ${S.card} 0%, ${S.recess} 100%)`,
              boxShadow: isPrimary
                ? radioPressed
                  ? "0 1px 2px rgba(0,0,0,0.15) inset, 0 0 6px rgba(229,166,50,0.2)"
                  : "0 2px 6px rgba(229,166,50,0.25), 0 1px 2px rgba(0,0,0,0.08), 0 1px 0 rgba(255,180,140,0.15) inset"
                : radioPressed
                  ? S.pressed
                  : "0 1px 3px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset, 0 -1px 0 rgba(0,0,0,0.03)",
              transform: radioPressed ? "scale(0.92)" : "scale(1)",
              transition: "all 0.1s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {isPrimary && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }} />}
          </button>
        )}
      </div>

      {/* Lucy annotation */}
      <div style={{ height: 1, background: "rgba(229,166,50,0.06)" }} />
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: S.accent, boxShadow: "0 0 4px rgba(229,166,50,0.3)" }} />
        <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: "rgba(229,166,50,0.45)", lineHeight: 1.5 }}>{usp.raw}</div>
      </div>

      {/* Proof & contrast — controlled expand */}
      <div style={{ padding: "0 16px 10px" }}>
        <button onClick={() => setExpanded(!expanded)} style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer", padding: "4px 0",
          fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
          color: "rgba(44,40,36,0.3)", transition: "color 0.15s ease",
        }}>
          <span style={{
            display: "inline-block", fontSize: 10, lineHeight: 1,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: `transform 0.2s ${ease}`,
          }}>›</span>
          PROOF & CONTRAST
        </button>

        {expanded && (
          <div style={{
            background: S.recess, borderRadius: 4, padding: "12px 14px", marginTop: 6,
            border: `1px solid ${S.border}`, boxShadow: "0 1px 2px rgba(0,0,0,0.02) inset",
            animation: `fadeIn 0.2s ${ease} both`,
          }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.2)", marginBottom: 4 }}>WHY IT'S TRUE</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.55)", lineHeight: 1.6 }}>{usp.proof}</div>
            </div>
            <div style={{ height: 1, background: "rgba(44,40,36,0.06)", margin: "0 0 10px" }} />
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.2)", marginBottom: 4 }}>WHAT OTHERS DO</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.55)", lineHeight: 1.6 }}>{usp.contrast}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function USPs({ onBack } = {}) {
  const [usps, setUsps] = useState(STARTER_USPS);
  const [primaryId, setPrimaryId] = useState(null);
  const [input, setInput] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lucyMode, setLucyMode] = useState("idle");
  const [aiMode, setAiMode] = useState("guide");
  const [hoveredAiMode, setHoveredAiMode] = useState(null);
  const inputRef = useRef(null);

  const hoveredModeInfo = hoveredAiMode ? MODES[hoveredAiMode] : null;
  const supporting = usps.filter((u) => u.id !== primaryId);
  const primary = usps.find((u) => u.id === primaryId);
  const canLock = primaryId && usps.length >= 3;

  const addUSP = () => {
    if (!input.trim()) return;
    setIsExpanding(true);

    // Simulate Lucy expanding the raw statement
    setTimeout(() => {
      const raw = input.trim();
      const newUSP = {
        id: Date.now(),
        raw,
        claim: raw,
        proof: "Lucy would analyze this against the brand personality work and generate a supporting argument here.",
        contrast: "Lucy would identify what competitors typically do differently and articulate the gap here.",
      };
      setUsps((prev) => [...prev, newUSP]);
      setInput("");
      setIsExpanding(false);
    }, 1200);
  };

  const removeUSP = (id) => {
    setUsps((prev) => prev.filter((u) => u.id !== id));
    if (primaryId === id) setPrimaryId(null);
  };

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
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{locked ? "USPs Locked" : "USPs"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", borderRadius: 3, height: 24, background: S.screen, boxShadow: "0 1px 2px rgba(0,0,0,0.1) inset, 0 1px 0 rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: primaryId ? S.accent : S.lcd, lineHeight: 1 }}>{usps.length}</span>
            </div>
          </div>
        </div>

        <div style={{ height: "calc(100% - 40px)", overflowY: "auto" }}>
          {!locked && (
            <div style={{ padding: "40px 48px 60px", animation: `promptIn 0.5s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>What makes them different?</h2>
                  <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Select a lead USP. The rest will support it.</p>
                </div>

                {/* Lead USP — floats to top when selected */}
                {primary && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.accent, marginBottom: 10 }}>LEAD</div>
                    <div style={{ animation: `promptIn 0.3s ${ease} both` }}>
                      <USPCard usp={primary} isPrimary onSetPrimary={() => setPrimaryId(null)} />
                    </div>
                  </div>
                )}

                {/* Divider */}
                {primary && supporting.length > 0 && (
                  <div style={{ height: 1, background: "rgba(44,40,36,0.06)", margin: "8px 0 16px" }} />
                )}

                {/* Supporting / All candidates */}
                <div>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 10 }}>{primary ? "SUPPORTING" : "SELECT A LEAD"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {supporting.map((usp, i) => (
                      <div key={usp.id} style={{ animation: `promptIn 0.4s ${ease} ${i * 0.08}s both` }}>
                        <USPCard usp={usp} isPrimary={false} onSetPrimary={() => setPrimaryId(usp.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write your own */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>ADD A USP</div>
                  <div>
                    <div style={{ background: S.recess, borderRadius: "6px 6px 0 0", border: `1px solid ${S.border}`, borderBottom: "none", overflow: "hidden" }}>
                      <div style={{ padding: "16px 20px" }}>
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Write a rough statement about what makes this brand different..."
                          rows={2}
                          style={{ width: "100%", background: "transparent", border: "none", fontSize: 14, fontWeight: 400, lineHeight: 1.65, color: S.text, resize: "none", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                          onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey && input.trim()) addUSP(); }}
                        />
                      </div>
                      <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                      <button onClick={addUSP} disabled={!input.trim() || isExpanding}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          padding: "11px 0", border: "none",
                          cursor: input.trim() && !isExpanding ? "pointer" : "default",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: isExpanding ? S.accent : input.trim() ? S.text : "rgba(44,40,36,0.1)",
                          background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                          boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset",
                          transition: "all 0.06s ease",
                        }}>
                        {isExpanding ? (
                          <><div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent, animation: "lucyPulse 1s ease-in-out infinite" }} />LUCY IS EXPANDING...</>
                        ) : (
                          <><div style={{ width: 6, height: 6, borderRadius: "50%", background: input.trim() ? S.accent : "rgba(44,40,36,0.08)" }} />EXPAND WITH LUCY</>
                        )}
                      </button>
                    </div>
                    <div style={{ background: S.recess, borderRadius: "0 0 6px 6px", border: `1px solid ${S.border}`, borderTop: "1px solid rgba(44,40,36,0.04)", padding: "6px 8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <LucyScreen mode={isExpanding ? "thinking" : lucyMode} hoveredModeInfo={hoveredModeInfo} aiMode={aiMode}
                            guideText={aiMode === "guide" ? "Write what makes them different in plain language. Lucy will structure it into claim, proof, and contrast." : null} />
                        </div>
                        <div style={{ display: "flex", borderRadius: 3, flexShrink: 0, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.4)", padding: 2, marginTop: 2 }}>
                          {Object.entries(MODES).map(([key, m]) => (<button key={key} onClick={() => setAiMode(key)} onMouseEnter={() => setHoveredAiMode(key)} onMouseLeave={() => setHoveredAiMode(null)} style={{ width: 28, height: 22, borderRadius: 2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: "0.04em", color: aiMode === key ? "#EDEAE4" : "rgba(44,40,36,0.2)", background: aiMode === key ? S.accent : "transparent", boxShadow: aiMode === key ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,180,140,0.1) inset" : "none", transition: "all 0.15s ease" }}>{m.key}</button>))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lock */}
                {canLock && (
                  <div style={{ marginTop: 16, animation: `fadeIn 0.4s ${ease} both` }}>
                    <button onClick={() => setLocked(true)} style={{
                      width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase", color: S.text,
                      background: `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
                      boxShadow: "0 -1px 0 rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent }} />
                      LOCK USPs
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Locked view */}
          {locked && (
            <div style={{ padding: "8vh 48px 60px", animation: `fadeIn 0.6s ${ease} both` }}>
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 4, marginBottom: 16, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: S.accent, boxShadow: "0 0 6px rgba(229,166,50,0.3)" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.3)" }}>USPs LOCKED</span>
                  </div>
                  <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>Why they win.</h2>
                </div>

                {/* Lead first */}
                {primary && (
                  <div style={{ marginBottom: 16, animation: `promptIn 0.5s ${ease} both` }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.accent, marginBottom: 10 }}>LEAD</div>
                    <USPCard usp={primary} isPrimary isLocked />
                  </div>
                )}

                {primary && supporting.length > 0 && (
                  <div style={{ height: 1, background: "rgba(44,40,36,0.06)", margin: "8px 0 16px" }} />
                )}

                {/* Supporting */}
                {supporting.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 10 }}>SUPPORTING</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {supporting.map((usp, i) => (
                        <div key={usp.id} style={{ animation: `promptIn 0.4s ${ease} ${0.15 + i * 0.1}s both` }}>
                          <USPCard usp={usp} isPrimary={false} isLocked />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ maxWidth: 300, margin: "40px auto 0" }}>
                  <div style={{ background: S.screen, borderRadius: 4, padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset, 0 1px 0 rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                      <PixelIcon icon="approves" color={S.lcdBright} size={14} />
                      <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 10, color: S.lcdBright }}>POSITIONING SET</span>
                    </div>
                    <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 9, color: S.lcdDim }}>1 primary · {supporting.length} supporting</div>
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
