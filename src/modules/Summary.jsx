/* ═══════════════════════════════════════════════════════════════
   LUCID — Summary V3
   All sections always visible, no accordion. Lucy module at top.
   ═══════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { S, ease, colors, fonts, shadows, fontImports, globalStyles } from "../lib/tokens";
import { PixelIcon } from "../components/ui";

function hexToAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const MODULE_COLORS = {
  personality: "#FF8C42",
  tensions: "#FF8C42",
  purpose: "#FF6B8A",
  values: "#14B8A6",
  tone: "#4AADFF",
  usps: "#B86EED",
  manifesto: "#6366F1",
};

const MODULE_DARK_COLORS = {
  personality: "#D0701A",
  tensions: "#D0701A",
  purpose: "#C43055",
  values: "#0D7D6A",
  tone: "#2A7CC9",
  usps: "#8A4CB8",
  manifesto: "#4447B0",
};

const SECTION_ICONS = {
  personality: "challenge",
  tensions: "drift",
  purpose: "push",
  values: "done",
  tone: "probe",
  usps: "spark",
  manifesto: "guide",
};

const SECTIONS = [
  {
    key: "personality", title: "Brand Personality",
    blocks: [
      { label: "WALK INTO A ROOM", text: "Unhurried. They don't scan the room — they already seem to know where they're going." },
      { label: "HOW THEY SPEAK", text: "Short sentences, long pauses. They choose words the way other people choose wine." },
      { label: "WHAT LIGHTS THEM UP", text: "Process. How things are made. The moment someone explains the mechanics behind something beautiful." },
    ],
  },
  {
    key: "tensions", title: "Tension Pairs",
    blocks: [
      { quality: "Confident", excess: "arrogant" },
      { quality: "Warm", excess: "soft" },
      { quality: "Honest", excess: "blunt" },
    ],
  },
  {
    key: "purpose", title: "Purpose / Vision / Mission",
    blocks: [
      { label: "PURPOSE", text: "To prove that thoughtful work outperforms loud work." },
      { label: "VISION", text: "A world where quality is felt before it's explained." },
      { label: "MISSION", text: "We build brands as people — with character, conviction, and a voice that earns trust." },
    ],
  },
  {
    key: "values", title: "Core Values",
    blocks: [
      { label: "INTENTIONALITY", text: "We choose carefully — every decision, every detail, every word has a reason behind it." },
      { label: "CRAFT", text: "We care about the work behind the work — the details no one asked for but everyone feels." },
      { label: "HONESTY", text: "We tell the truth, even when it's uncomfortable — but always with care, never cruelty." },
    ],
  },
  {
    key: "tone", title: "Tone of Voice",
    blocks: [
      { text: "If you met this brand at a dinner party, you'd notice they're more formal than casual, clearly serious, and more respectful than irreverent. They don't lean hard on direct or nuanced — they read the room. You'd trust them immediately." },
    ],
    tags: [
      { label: "Formal", strong: true },
      { label: "Serious", strong: true },
      { label: "Respectful", strong: true },
      { label: "Matter-of-fact", strong: false },
      { label: "Direct/Nuanced", strong: false },
    ],
  },
  {
    key: "usps", title: "USPs",
    blocks: [
      { label: "LEAD", claim: "We build brands as characters — not identities, not guidelines, but people you'd recognise in a room.", proof: "Every brand we deliver has a name, a personality profile, and a voice guide written as if the brand were a person." },
      { label: "SUPPORTING", claim: "The person who writes the strategy is the person who designs the output. No handoffs, no dilution.", proof: null },
      { label: "SUPPORTING", claim: "Our brand books are built to be used daily — not admired once and forgotten.", proof: null },
    ],
  },
  {
    key: "manifesto", title: "Brand Manifesto",
    blocks: [
      { text: "We believe that every detail speaks. That the way something is made matters as much as what it does. That restraint is a form of confidence, and silence can say more than noise ever will." },
      { text: "We don't chase trends. We don't raise our voice to be heard. We show up with intention — every word chosen, every decision deliberate." },
      { text: "We tell the truth, even when it's uncomfortable. We care deeply, but we won't lower our standards to prove it." },
      { text: "This is a brand built on craft, honesty, and quiet conviction. Not because it's easy, but because it's the only way we know how to work." },
    ],
  },
];

function buildSectionText(section) {
  if (section.key === "tensions") {
    return section.blocks.map((b) => `${b.quality}, but never ${b.excess}.`).join("\n");
  }
  if (section.key === "usps") {
    return section.blocks.map((b) => {
      let t = `${b.label}\n${b.claim}`;
      if (b.proof) t += `\nProof: ${b.proof}`;
      return t;
    }).join("\n\n");
  }
  return section.blocks.map((b) => b.label ? `${b.label}\n${b.text}` : b.text).join("\n\n");
}
function buildAllText() {
  return SECTIONS.map((s) => `${s.title.toUpperCase()}\n\n${buildSectionText(s)}`).join("\n\n───────────────\n\n");
}

/* ── Copy SVG Icon ── */
function CopyIcon({ size = 10, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M4 2h11v2H4zm0 18h11v2H4zM2 4h2v16H2zm13 0h2v16h-2zM7 6h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z"/>
    </svg>
  );
}

/* ── Section Card ── */
function SectionCard({ section, copied, onCopy, onEdit, index }) {
  const moduleColor = MODULE_COLORS[section.key] || colors.accent;
  const moduleDarkColor = MODULE_DARK_COLORS[section.key] || "#D0701A";
  const sectionIcon = SECTION_ICONS[section.key] || "done";
  const isTensions = section.key === "tensions";
  const isTone = section.key === "tone";
  const isManifesto = section.key === "manifesto";
  const isUsps = section.key === "usps";

  const manifestoText = isManifesto ? section.blocks.map(b => b.text).join("\n\n") : "";
  const manifestoWordCount = isManifesto ? manifestoText.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div
      style={{
        background: "#FAFAF7",
        borderRadius: 8,
        border: "1px solid rgba(44,40,36,0.06)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 2px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        overflow: "hidden",
        animation: `promptIn 0.4s ${ease} ${index * 0.05}s both`,
      }}
    >
      {/* Header — pixel tag + Edit / Copy */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(44,40,36,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Pixel-font tag with icon */}
          <div style={{
            fontFamily: fonts.pixel, fontSize: 9, letterSpacing: "0.08em",
            padding: "4px 10px", borderRadius: 3,
            display: "inline-flex", alignItems: "center", gap: 6,
            background: hexToAlpha(moduleColor, 0.1),
            color: moduleDarkColor,
          }}>
            <PixelIcon icon={sectionIcon} color="currentColor" size={12} />
            {section.title.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Edit — DM Sans text button */}
          <button onClick={onEdit} style={{
            padding: "4px 10px", borderRadius: 12, border: "none",
            background: "transparent", cursor: "pointer",
            fontFamily: fonts.primary, fontSize: 10, fontWeight: 500,
            color: "rgba(44,40,36,0.35)",
            transition: "color 0.15s ease",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "rgba(44,40,36,0.55)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(44,40,36,0.35)"}
          >Edit</button>

          {/* Copy — DM Sans pill with icon */}
          <button onClick={() => onCopy()} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 12px", borderRadius: 12,
            border: "1px solid rgba(44,40,36,0.1)",
            background: copied ? "rgba(229,166,50,0.08)" : "rgba(44,40,36,0.03)",
            cursor: "pointer",
            fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
            color: copied ? "#C48B1E" : "rgba(44,40,36,0.4)",
            transition: "all 0.15s ease",
          }}
            onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = "rgba(44,40,36,0.2)"; e.currentTarget.style.color = "rgba(44,40,36,0.6)"; e.currentTarget.style.background = "rgba(44,40,36,0.05)"; } }}
            onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = "rgba(44,40,36,0.1)"; e.currentTarget.style.color = "rgba(44,40,36,0.4)"; e.currentTarget.style.background = "rgba(44,40,36,0.03)"; } }}
          >
            <CopyIcon size={10} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px" }}>

        {/* ── Tension Pairs ── */}
        {isTensions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {section.blocks.map((b, j) => (
              <div key={j} style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.6 }}>
                <strong style={{ fontWeight: 600 }}>{b.quality}</strong>
                <span style={{ color: "rgba(44,40,36,0.2)" }}>, but never </span>
                <span style={{ color: "rgba(44,40,36,0.35)" }}>{b.excess}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Tone of Voice ── */}
        {isTone && (
          <>
            {section.tags && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {section.tags.map((t, j) => (
                  <span key={j} style={{
                    fontFamily: fonts.pixel, fontSize: 8, letterSpacing: "0.08em",
                    padding: "3px 8px", borderRadius: 3,
                    background: t.strong ? "rgba(74,173,255,0.08)" : "rgba(74,173,255,0.04)",
                    color: t.strong ? "#2A7CC9" : "rgba(74,173,255,0.35)",
                  }}>{t.label.toUpperCase()}</span>
                ))}
              </div>
            )}
            <div style={{ fontSize: 14, color: "#2C2824", lineHeight: 1.65 }}>
              {section.blocks[0].text}
            </div>
          </>
        )}

        {/* ── USPs ── */}
        {isUsps && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {section.blocks.map((b, j) => (
              <div key={j}>
                {/* Badge */}
                <div style={{
                  fontFamily: fonts.pixel, fontSize: 8, letterSpacing: "0.08em",
                  color: b.label === "LEAD" ? "#C48B1E" : "rgba(44,40,36,0.3)",
                  marginBottom: 4,
                }}>{b.label}</div>
                {/* Claim */}
                <div style={{ fontSize: 14, color: "#2C2824", lineHeight: 1.65 }}>
                  {b.claim}
                </div>
                {/* Proof */}
                {b.proof && (
                  <div style={{ fontSize: 12, color: "rgba(44,40,36,0.45)", lineHeight: 1.55, marginTop: 4 }}>
                    {b.proof}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Manifesto ── */}
        {isManifesto && (
          <>
            <div style={{ fontSize: 15, color: "#2C2824", lineHeight: 1.85 }}>
              {section.blocks.map((b, j) => (
                <span key={j}>
                  {j > 0 && <><br /><br /></>}
                  {b.text}
                </span>
              ))}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginTop: 12,
            }}>
              <span style={{
                fontFamily: fonts.pixel, fontSize: 9, letterSpacing: "0.08em",
                color: "rgba(44,40,36,0.25)",
              }}>{manifestoWordCount} WORDS</span>
              <span style={{ color: "rgba(44,40,36,0.08)" }}>&middot;</span>
              <span style={{
                fontFamily: fonts.pixel, fontSize: 9, letterSpacing: "0.08em",
                color: "rgba(44,40,36,0.25)",
              }}>DRAFT 3</span>
            </div>
          </>
        )}

        {/* ── Default blocks (personality, purpose, values) ── */}
        {!isTensions && !isTone && !isUsps && !isManifesto && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {section.blocks.map((block, j) => (
              <div key={j}>
                {block.label && (
                  <div style={{
                    fontFamily: fonts.pixel, fontSize: 8, letterSpacing: "0.08em",
                    color: "rgba(44,40,36,0.3)",
                    marginBottom: 4,
                  }}>{block.label}</div>
                )}
                <div style={{ fontSize: 14, color: "#2C2824", lineHeight: 1.65 }}>
                  {block.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function Summary({ onBack } = {}) {
  const [copied, setCopied] = useState(null);

  const copy = (key, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: fonts.primary, color: S.text, position: "relative", background: colors.rootBg }}>
      <style>{`
        ${fontImports}
        ${globalStyles}
        .summary-scroll::-webkit-scrollbar { width:3px; }
        .summary-scroll::-webkit-scrollbar-track { background:transparent; }
        .summary-scroll::-webkit-scrollbar-thumb { background:rgba(44,40,36,0.06); border-radius:3px; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${colors.gradientTop} 0%, ${colors.gradientBottom} 100%)`, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <div style={{
          padding: "6px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${S.border}`,
          background: S.panel,
          boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "3px 8px", borderRadius: 2,
              background: S.text, color: colors.gradientTop,
              boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer",
            }}>LUCID</div>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "rgba(44,40,36,0.35)",
            }}>Summary</span>
          </div>
        </div>

        {/* ── Scrollable canvas ── */}
        <div className="summary-scroll" style={{ flex: 1, overflowY: "auto", padding: "40px 24px 60px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            {/* ── Page title ── */}
            <div style={{ marginBottom: 32, animation: `fadeIn 0.4s ${ease} both` }}>
              <h1 style={{
                fontSize: 24, fontWeight: 600, color: S.text,
                letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0,
              }}>Aether Studios</h1>
              <p style={{
                fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.4)",
                marginTop: 4, letterSpacing: "-0.01em",
              }}>Brand strategy &middot; {SECTIONS.length} modules complete</p>
            </div>

            {/* ── Lucy module — Dashboard variant ── */}
            <div style={{
              borderRadius: 10, padding: 24, marginBottom: 12,
              background: colors.lucySurface,
              backgroundImage: colors.lucyGrain,
              border: `1px solid ${colors.lucyBorder}`,
              boxShadow: colors.lucyShadow,
              animation: `promptIn 0.4s ${ease} both`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 48, height: 36, background: colors.eink, borderRadius: 3,
                  border: `1px solid ${colors.einkBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <PixelIcon icon="done" color={colors.ink} size={22} />
                </div>
                <div>
                  <div style={{
                    fontFamily: fonts.pixel, fontSize: 14, letterSpacing: "0.08em",
                    color: "#5A5550", lineHeight: 1.4, marginBottom: 4,
                  }}>Looking good, Ashwin.</div>
                  <div style={{
                    fontSize: 13, color: "#6B6560", lineHeight: 1.5,
                  }}>This is strong, considered work. The personality holds together, the tensions are tight, and the manifesto reads like it was written by one voice.</div>
                </div>
              </div>

              {/* E-ink action cards */}
              <div style={{
                marginTop: 18, paddingTop: 14,
                borderTop: "1px solid rgba(44,40,36,0.08)",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {/* Export */}
                <div style={{
                  background: colors.eink, border: `1px solid ${colors.einkBorder}`,
                  borderRadius: 6, padding: "12px 14px", cursor: "pointer",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  transition: "all 0.15s ease",
                }}>
                  <PixelIcon icon="guide" color={colors.ink} size={16} style={{ marginTop: 2 }} />
                  <div style={{ fontSize: 12, color: colors.ink, lineHeight: 1.5 }}>
                    <strong>Export brand book</strong> — Generate a PDF with all your strategy work.
                  </div>
                </div>
                {/* Visual Identity */}
                <div style={{
                  background: colors.eink, border: `1px solid ${colors.einkBorder}`,
                  borderRadius: 6, padding: "12px 14px", cursor: "pointer",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  transition: "all 0.15s ease",
                }}>
                  <PixelIcon icon="spark" color={colors.ink} size={16} style={{ marginTop: 2 }} />
                  <div style={{ fontSize: 12, color: colors.ink, lineHeight: 1.5 }}>
                    <strong>Start Visual Identity</strong> — Take this strategy into the Visual World module.
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SECTIONS.map((section, i) => (
                <SectionCard
                  key={section.key}
                  section={section}
                  index={i}
                  copied={copied === section.key}
                  onCopy={() => copy(section.key, buildSectionText(section))}
                  onEdit={() => { alert(`Navigate to: ${section.title}`); }}
                />
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
