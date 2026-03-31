/* ═══════════════════════════════════════════════════════════════
   LUCID — USPs
   Write USPs → Lucy expands → lead/supporting toggle selection.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon, getLucyIcon, LucyActionCard } from "../components/ui";
import { askLucyStream } from "../lib/lucy";

const STARTER_USPS = [
  { id: 1, raw: "We make brands feel like real people, not corporate personas.", claim: "We build brands as characters — not identities, not guidelines, but people you'd recognise in a room.", proof: "Every brand we build starts with a personality exercise that most agencies skip entirely. The result is a voice that sounds human because it was built from human instincts.", contrast: "Most agencies start with a logo and a colour palette. We start with how the brand walks into a room." },
  { id: 2, raw: "Strategy and execution come from the same brain, not a handoff.", claim: "The person who writes the strategy is the person who designs the output. No handoffs, no dilution.", proof: "Small team means the strategist and the creative director are often the same person. The thinking stays intact from first insight to final deliverable.", contrast: "At larger agencies, strategy gets written by one team and interpreted by another. Something always gets lost in translation." },
  { id: 3, raw: "We deliver brand books that clients actually use, not shelf decoration.", claim: "Our brand books are built to be used daily — not admired once and forgotten.", proof: "Every section is written as a practical tool with examples, do/don't guidance, and real-world scenarios. We test them with the people who'll actually use them.", contrast: "Traditional brand books are beautiful PDFs that sit unopened in a shared drive. Ours get dog-eared." },
];

/* ── Fader-style toggle switch ── */
function FaderToggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44, height: 22, borderRadius: 4, border: "none",
        cursor: "pointer", position: "relative", flexShrink: 0,
        background: on ? colors.usps : "#D0CDC5",
        boxShadow: on
          ? "0 1px 3px rgba(184,110,237,0.25), 0 1px 2px rgba(0,0,0,0.06)"
          : "0 1px 2px rgba(0,0,0,0.06) inset, 0 1px 0 rgba(255,255,255,0.3)",
        transition: `all 0.15s ${ease}`,
        padding: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 2,
        left: on ? 24 : 2,
        width: 18, height: 18, borderRadius: 3,
        background: "linear-gradient(180deg, #FAFAF7 0%, #E8E5DD 100%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
        transition: `left 0.15s ${ease}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {on ? (
          <svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}><path d="M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z" fill="rgba(44,40,36,0.5)" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}><path d="M4 11h16v2H4z" fill="rgba(44,40,36,0.25)" /></svg>
        )}
      </div>
    </button>
  );
}

/* ── USP Card ── */
function USPCard({ usp, isPrimary, onSetPrimary, onRemove, isLocked }) {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { if (isPrimary) setExpanded(true); }, [isPrimary]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: S.card, borderRadius: 4,
        border: "1px solid rgba(44,40,36,0.06)",
        boxShadow: hover && !isLocked
          ? shadows.cardHover
          : shadows.raised,
        overflow: "hidden",
        transition: `all 0.2s ${ease}`,
        transform: hover && !isLocked ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {/* Claim + fader toggle */}
      <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isPrimary && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 3, marginBottom: 8,
              background: "rgba(229,166,50,0.08)",
            }}>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#C48B1E",
              }}>LEAD</span>
            </div>
          )}
          <div style={{ fontSize: 15, fontWeight: 500, color: S.text, lineHeight: 1.5, letterSpacing: "-0.01em" }}>
            {usp.claim}
          </div>
        </div>
        {!isLocked && (
          <div style={{ marginTop: isPrimary ? 28 : 2 }}>
            <FaderToggle on={isPrimary} onToggle={onSetPrimary} />
          </div>
        )}
      </div>

      {/* Lucy annotation */}
      <div style={{ height: 1, background: "rgba(229,166,50,0.06)" }} />
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: S.accent, boxShadow: "0 0 4px rgba(229,166,50,0.3)" }} />
        <div style={{ fontFamily: fonts.pixel, letterSpacing: "0.08em", fontSize: 10, color: "rgba(229,166,50,0.45)", lineHeight: 1.5 }}>{usp.raw}</div>
      </div>

      {/* Proof & contrast — expandable */}
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
  const [lucyState, setLucyState] = useState("idle");
  const [lucyResponse, setLucyResponse] = useState("");
  const inputRef = useRef(null);

  const supporting = usps.filter((u) => u.id !== primaryId);
  const primary = usps.find((u) => u.id === primaryId);
  const canLock = primaryId && usps.length >= 3;

  const handleUspAction = async (action) => {
    if (action === "happy") { setLucyState("done"); setTimeout(() => { setLucyResponse(""); setLucyState("idle"); }, 1000); return; }
    setLucyState("thinking"); setLucyResponse("");
    try {
      await askLucyStream(
        { module: "usps", action, userInput: input.trim() || usps.map(u => u.claim).join("; ") },
        (chunk) => setLucyResponse(chunk)
      );
      setLucyState(action === "challenge_usp" ? "challenge" : "spark");
    } catch { setLucyState("idle"); }
  };

  const oneLiner = useMemo(() => {
    if (lucyState === "thinking") return "Expanding...";
    if (lucyState === "done") return "Noted.";
    return "What makes this brand impossible to copy?";
  }, [lucyState]);

  const lucyActions = useMemo(() => {
    if (lucyState === "thinking") return [];
    if (lucyResponse) return [
      { icon: "check", label: "I'M HAPPY", onClick: () => handleUspAction("happy") },
    ];
    if (input.trim()) return [
      { icon: "pen-square", label: "EXPAND WITH PROOF", onClick: () => handleUspAction("expand_usp") },
      { icon: "warning-diamond", label: "IS THIS UNIQUE?", onClick: () => handleUspAction("challenge_usp") },
    ];
    return [
      { icon: "sparkle", label: "SUGGEST A USP", onClick: () => handleUspAction("suggest") },
    ];
  }, [lucyState, lucyResponse, input]);

  const addUSP = async () => {
    if (!input.trim()) return;
    setIsExpanding(true);
    setLucyState("thinking");
    const raw = input.trim();
    const id = Date.now();
    setUsps((prev) => [...prev, { id, raw, claim: raw, proof: "", contrast: "" }]);
    setInput("");
    try {
      await askLucyStream(
        { module: "usps", action: "expand_usp", userInput: raw },
        (chunk) => setUsps((prev) => prev.map((u) => u.id === id ? { ...u, proof: chunk } : u))
      );
    } catch { /* silent fallback */ }
    setIsExpanding(false);
    setLucyState("done");
    setTimeout(() => setLucyState("idle"), 2000);
  };

  const removeUSP = (id) => {
    setUsps((prev) => prev.filter((u) => u.id !== id));
    if (primaryId === id) setPrimaryId(null);
  };

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
        flexShrink: 0,
      }}>
        <div onClick={() => onBack?.()} style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 2,
          background: S.text, color: "#EDEAE4",
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          cursor: "pointer",
        }}>LUCID</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "0 10px", borderRadius: 4, height: 24,
            background: "rgba(44,40,36,0.04)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Strategy</span>
            <span style={{ fontSize: 9, color: "rgba(44,40,36,0.35)" }}>–</span>
            <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>{locked ? "USPs Locked" : "USPs"}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {!locked && (
          <div style={{ padding: "40px 24px 80px", animation: `promptIn 0.5s ${ease} both` }}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.02em" }}>What makes them different?</h2>
                <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.3)", lineHeight: 1.6 }}>Toggle lead USP on. The rest will support it.</p>
              </div>

              {/* All USP cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {usps.map((usp, i) => (
                  <div key={usp.id} style={{ animation: `promptIn 0.4s ${ease} ${i * 0.08}s both` }}>
                    <USPCard
                      usp={usp}
                      isPrimary={usp.id === primaryId}
                      onSetPrimary={() => setPrimaryId(usp.id === primaryId ? null : usp.id)}
                      onRemove={() => removeUSP(usp.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Write your own */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>ADD A USP</div>
                <div style={{
                  background: S.recess, borderRadius: 6,
                  border: `1px solid ${S.border}`, overflow: "hidden",
                }}>
                  <div style={{ padding: "16px 20px" }}>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Write a rough statement about what makes this brand different..."
                      rows={2}
                      style={{
                        width: "100%", background: "transparent", border: "none",
                        fontSize: 14, fontWeight: 400, lineHeight: 1.65, color: S.text,
                        resize: "none", outline: "none", fontFamily: fonts.primary,
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey && input.trim()) addUSP(); }}
                    />
                  </div>
                  <div style={{ height: 1, background: "rgba(44,40,36,0.06)", boxShadow: "0 1px 0 rgba(255,255,255,0.25)" }} />
                  <button onClick={addUSP} disabled={!input.trim() || isExpanding}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "11px 0", border: "none",
                      cursor: input.trim() && !isExpanding ? "pointer" : "default",
                      fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
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
                  <div style={{ padding: "0 10px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {lucyActions.map(a => <LucyActionCard key={a.label} {...a} />)}
                  </div>
                )}
              </div>

              {/* Lock */}
              {canLock && (
                <div style={{ marginTop: 16, animation: `fadeIn 0.4s ${ease} both` }}>
                  <button onClick={() => setLocked(true)} style={{
                    width: "100%", padding: "12px 0", borderRadius: 6, border: "none", cursor: "pointer",
                    fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
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
          <div style={{ padding: "40px 24px 80px", animation: `fadeIn 0.6s ${ease} both` }}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 4, marginBottom: 16,
                  background: "rgba(44,40,36,0.04)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: S.accent, boxShadow: "0 0 6px rgba(229,166,50,0.3)" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,40,36,0.3)" }}>USPs LOCKED</span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.02em" }}>Why they win.</h2>
              </div>

              {/* Lead first */}
              {primary && (
                <div style={{ marginBottom: 16, animation: `promptIn 0.5s ${ease} both` }}>
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

              {/* Lucy confirmation */}
              <div style={{
                marginTop: 40,
                background: colors.lucySurface,
                backgroundImage: colors.lucyGrain,
                border: `1px solid ${colors.lucyBorder}`,
                boxShadow: colors.lucyShadow,
                borderRadius: 8,
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 40, height: 30,
                    background: colors.eink, borderRadius: 3,
                    border: `1px solid ${colors.einkBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <PixelIcon icon="done" color={colors.ink} size={18} />
                  </div>
                  <span style={{
                    fontFamily: fonts.pixel, fontSize: 11, letterSpacing: "0.08em",
                    color: colors.lucyStatusText,
                  }}>POSITIONING SET</span>
                </div>
                <div style={{ borderTop: `1px solid ${colors.lucyBorder}`, padding: "10px 14px 14px" }}>
                  <div style={{
                    fontFamily: fonts.pixel, fontSize: 10, letterSpacing: "0.08em",
                    color: colors.lucyBodyText, lineHeight: 1.5,
                  }}>1 primary · {supporting.length} supporting</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
