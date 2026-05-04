import { useState } from "react";

const filaments = {
  PLA: {
    color: "#4ade80",
    tempC: "45–55°C",
    tempF: "113–131°F",
    time: "4–6 hrs",
    priority: "Low",
    priorityColor: "#4ade80",
    hygroscopic: "Low",
    symptoms: ["Stringing", "Popping/crackling sounds", "Rough surface finish", "Brittle prints"],
    tips: [
      "PLA is less hygroscopic than most filaments but can still absorb moisture over time.",
      "A food dehydrator set to ~50°C works perfectly — avoid exceeding 60°C or it may soften.",
      "Store in an airtight container with silica gel desiccant after drying.",
      "Dried PLA should be used within a few days if humidity is high.",
    ],
    storage: "Airtight bag/box + silica gel. Moderate urgency.",
  },
  PETG: {
    color: "#60a5fa",
    tempC: "65–70°C",
    tempF: "149–158°F",
    time: "4–6 hrs",
    priority: "Medium",
    priorityColor: "#facc15",
    hygroscopic: "Medium",
    symptoms: ["Stringing & oozing", "Bubbling/foaming", "Cloudy appearance", "Poor layer adhesion", "Crackling during print"],
    tips: [
      "PETG is moderately hygroscopic and absorbs moisture faster than PLA in humid environments.",
      "Dry at 65–70°C. Some ovens can't go this low — a dedicated filament dryer is ideal.",
      "Avoid exceeding 75°C as PETG can begin to soften and deform on the spool.",
      "Wet PETG often shows heavy stringing even with dialled-in retraction settings.",
    ],
    storage: "Airtight sealed container. Desiccant essential in UK climates.",
  },
  ABS: {
    color: "#f97316",
    tempC: "70–80°C",
    tempF: "158–176°F",
    time: "4–8 hrs",
    priority: "Medium",
    priorityColor: "#facc15",
    hygroscopic: "Medium",
    symptoms: ["Warping worsens", "Layer delamination", "Rough texture", "Popping sounds"],
    tips: [
      "ABS absorbs moisture moderately but the symptoms can be severe during printing.",
      "Dry at 70–80°C. Use an oven carefully — temperatures can fluctuate unexpectedly.",
      "A dedicated filament dryer with accurate temp control is strongly recommended.",
      "After drying, keep ABS in a sealed container — it re-absorbs moisture quickly.",
    ],
    storage: "Sealed container with desiccant. Re-absorbs moisture quickly once opened.",
  },
  ASA: {
    color: "#a78bfa",
    tempC: "70–80°C",
    tempF: "158–176°F",
    time: "4–8 hrs",
    priority: "Medium",
    priorityColor: "#facc15",
    hygroscopic: "Medium",
    symptoms: ["Increased stringing", "Layer separation", "Surface bubbling", "Brittleness"],
    tips: [
      "ASA behaves similarly to ABS when it comes to moisture — similar drying process applies.",
      "Dry at 70–80°C for 4–8 hours. A dedicated filament dryer is preferred.",
      "ASA is UV-resistant and often used outdoors — ensure it's dry for best long-term results.",
      "Store sealed between uses, especially if printing intermittently.",
    ],
    storage: "Sealed with desiccant. Treat same as ABS for storage.",
  },
  TPU: {
    color: "#fb7185",
    tempC: "50–60°C",
    tempF: "122–140°F",
    time: "4–8 hrs",
    priority: "High",
    priorityColor: "#f97316",
    hygroscopic: "High",
    symptoms: ["Bubbling/foaming", "Stringing", "Loss of flexibility", "Rough surface", "Crackling"],
    tips: [
      "TPU is highly hygroscopic and should be dried before almost every print session.",
      "Dry at 50–60°C — don't exceed 65°C as TPU can deform or fuse on the spool.",
      "Even a few hours of exposure in a humid room can degrade print quality noticeably.",
      "Consider printing directly from a sealed dry box with a PTFE tube feed.",
    ],
    storage: "Dry box printing recommended. Seal immediately after use.",
  },
  Nylon: {
    color: "#38bdf8",
    tempC: "70–90°C",
    tempF: "158–194°F",
    time: "8–12 hrs",
    priority: "Critical",
    priorityColor: "#ef4444",
    hygroscopic: "Very High",
    symptoms: ["Heavy bubbling/steaming", "Very rough surface", "Brittle prints", "Poor strength", "Constant crackling"],
    tips: [
      "Nylon is extremely hygroscopic — it can absorb enough moisture to ruin a print within hours.",
      "Dry thoroughly at 70–90°C for 8–12 hours before use. Don't rush this.",
      "A dedicated filament dryer is almost mandatory for Nylon. Ovens are often inaccurate.",
      "Print directly from the dryer if possible. Do not leave Nylon on the printer overnight.",
      "Fresh, dry Nylon prints beautifully — don't let moisture discourage you from using it.",
    ],
    storage: "Must be stored in a sealed dry box. Use desiccant and hygrometer inside.",
  },
  PC: {
    color: "#c084fc",
    tempC: "80–100°C",
    tempF: "176–212°F",
    time: "6–10 hrs",
    priority: "Critical",
    priorityColor: "#ef4444",
    hygroscopic: "High",
    symptoms: ["Bubbling & foaming", "Cloudiness/haze", "Poor layer bonding", "Crackling sounds", "Reduced strength"],
    tips: [
      "Polycarbonate is highly hygroscopic and requires a very high drying temperature.",
      "Dry at 80–100°C for 6–10 hours. A standard food dehydrator may not reach this — use a proper filament dryer or lab oven.",
      "Wet PC produces a noticeable haze in the final print, reducing its optical clarity.",
      "Given the high print temps needed for PC, moisture causes more dramatic failures than with lower-temp materials.",
    ],
    storage: "Sealed with aggressive desiccation. Hygrometer recommended in storage.",
  },
  PVA: {
    color: "#34d399",
    tempC: "45–55°C",
    tempF: "113–131°F",
    time: "4–10 hrs",
    priority: "Critical",
    priorityColor: "#ef4444",
    hygroscopic: "Extreme",
    symptoms: ["Clogs and jams", "Brittle/snapping filament", "Poor support bonding", "Stringing", "Filament dissolves before use"],
    tips: [
      "PVA is the most hygroscopic common filament — it can literally dissolve in high humidity.",
      "Dry at 45–55°C. Don't exceed 60°C as it can degrade rapidly.",
      "Store PVA in an airtight container with heavy desiccant AT ALL TIMES — even between print sessions.",
      "If your PVA is snapping when you try to feed it, it's already significantly degraded from moisture.",
      "Consider buying PVA in small quantities to ensure freshness.",
    ],
    storage: "Sealed airtight at all times. Do not leave exposed. Replace desiccant frequently.",
  },
  HIPS: {
    color: "#fbbf24",
    tempC: "60–70°C",
    tempF: "140–158°F",
    time: "4–6 hrs",
    priority: "Low",
    priorityColor: "#4ade80",
    hygroscopic: "Low–Medium",
    symptoms: ["Stringing", "Rough surface", "Popping sounds", "Poor adhesion to ABS"],
    tips: [
      "HIPS is relatively tolerant of humidity compared to other engineering filaments.",
      "Dry at 60–70°C for 4–6 hours if you notice print quality issues.",
      "HIPS is often used as a support material with ABS — ensure both are dry for best results.",
      "Store in a sealed bag with silica gel when not in use.",
    ],
    storage: "Sealed bag with desiccant. Less urgent than engineering filaments.",
  },
};

const symptomMap = {
  "Crackling/popping during print": ["PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "PC", "HIPS"],
  "Heavy bubbling or foaming": ["TPU", "Nylon", "PC", "PVA"],
  "Excessive stringing": ["PLA", "PETG", "TPU", "HIPS", "PVA"],
  "Rough or fuzzy surface": ["PLA", "PETG", "ABS", "ASA", "Nylon", "PC", "HIPS"],
  "Brittle or snapping filament": ["PLA", "Nylon", "PVA"],
  "Poor layer adhesion": ["PETG", "ABS", "ASA", "Nylon", "PC", "PVA"],
  "Cloudy or hazy appearance": ["PC", "PVA"],
  "Warping worse than usual": ["ABS", "ASA"],
  "Filament jamming/clogging": ["PVA", "Nylon"],
};

export default function FilamentDryingGuide() {
  const [mode, setMode] = useState("browse"); // browse | symptoms
  const [selected, setSelected] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const suspectedFilaments = selectedSymptoms.length === 0
    ? []
    : Object.keys(filaments).filter((f) =>
        selectedSymptoms.some((s) => symptomMap[s]?.includes(f))
      ).sort((a, b) => {
        const scoreB = selectedSymptoms.filter((s) => symptomMap[s]?.includes(b)).length;
        const scoreA = selectedSymptoms.filter((s) => symptomMap[s]?.includes(a)).length;
        return scoreB - scoreA;
      });

  const FilamentCard = ({ name, compact }) => {
    const f = filaments[name];
    if (!f) return null;
    return (
      <div
        onClick={() => { setSelected(name); setMode("browse"); }}
        style={{
          background: compact ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${selected === name ? f.color : "rgba(255,255,255,0.08)"}`,
          borderRadius: 10,
          padding: compact ? "10px 14px" : "14px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{name}</span>
        <span style={{
          marginLeft: "auto", fontSize: 11, fontFamily: "'Space Mono', monospace",
          color: f.priorityColor, background: `${f.priorityColor}22`,
          padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap"
        }}>{f.priority}</span>
      </div>
    );
  };

  const detail = selected ? filaments[selected] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e17",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e2e8f0",
      padding: "32px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ maxWidth: 860, margin: "0 auto 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20
          }}>💧</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: -0.5 }}>
              Filament Drying Guide
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Temperature, time & storage for every filament type</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: 8 }}>
          {["browse", "symptoms"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
              background: mode === m ? "#38bdf8" : "rgba(255,255,255,0.06)",
              color: mode === m ? "#0a0e17" : "#94a3b8",
              transition: "all 0.15s"
            }}>
              {m === "browse" ? "Browse by Material" : "Symptom Checker"}
            </button>
          ))}
        </div>

        {/* BROWSE MODE */}
        {mode === "browse" && (
          <div style={{ display: "grid", gridTemplateColumns: detail ? "220px 1fr" : "1fr", gap: 16 }}>
            {/* Filament List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.keys(filaments).map((name) => (
                <FilamentCard key={name} name={name} compact={!!detail} />
              ))}
            </div>

            {/* Detail Panel */}
            {detail && (
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${detail.color}44`,
                borderRadius: 12,
                padding: 24,
                display: "flex", flexDirection: "column", gap: 20,
              }}>
                {/* Title row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: detail.color }} />
                  <h2 style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 20 }}>{selected}</h2>
                  <span style={{
                    marginLeft: "auto", fontSize: 12, fontFamily: "'Space Mono', monospace",
                    color: detail.priorityColor, background: `${detail.priorityColor}22`,
                    padding: "4px 12px", borderRadius: 20,
                  }}>
                    {detail.priority} moisture risk
                  </span>
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "Dry Temp", value: detail.tempC, sub: detail.tempF },
                    { label: "Dry Time", value: detail.time, sub: "hours" },
                    { label: "Hygroscopic", value: detail.hygroscopic, sub: "moisture absorption" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px",
                      border: "1px solid rgba(255,255,255,0.07)"
                    }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: detail.color }}>{value}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Symptoms */}
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Signs of Wet Filament</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {detail.symptoms.map((s) => (
                      <span key={s} style={{
                        background: `${detail.color}18`, border: `1px solid ${detail.color}44`,
                        color: detail.color, borderRadius: 6, padding: "4px 10px", fontSize: 12,
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Drying Tips</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {detail.tips.map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%", background: `${detail.color}22`,
                          color: detail.color, fontSize: 11, display: "flex", alignItems: "center",
                          justifyContent: "center", fontFamily: "'Space Mono', monospace", flexShrink: 0, marginTop: 1
                        }}>{i + 1}</div>
                        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage */}
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: 14, display: "flex", gap: 10, alignItems: "flex-start"
                }}>
                  <span style={{ fontSize: 18 }}>📦</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Storage Advice</div>
                    <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{detail.storage}</p>
                  </div>
                </div>
              </div>
            )}

            {!detail && (
              <div style={{
                gridColumn: "1 / -1",
                background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 12, padding: 40, textAlign: "center", color: "#334155"
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💧</div>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13 }}>Select a filament to see drying guide</p>
              </div>
            )}
          </div>
        )}

        {/* SYMPTOM CHECKER MODE */}
        {mode === "symptoms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                Select all symptoms you're currently seeing during printing:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {Object.keys(symptomMap).map((s) => {
                  const active = selectedSymptoms.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSymptom(s)} style={{
                      padding: "8px 14px", borderRadius: 8,
                      border: `1px solid ${active ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
                      background: active ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.03)",
                      color: active ? "#38bdf8" : "#94a3b8",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
                      transition: "all 0.15s"
                    }}>{s}</button>
                  );
                })}
              </div>
            </div>

            {selectedSymptoms.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
                  Likely affected filaments — click to view drying guide
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {suspectedFilaments.map((name) => {
                    const matchCount = selectedSymptoms.filter((s) => symptomMap[s]?.includes(name)).length;
                    const f = filaments[name];
                    return (
                      <div key={name} onClick={() => { setSelected(name); setMode("browse"); }}
                        style={{
                          background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)`,
                          borderRadius: 10, padding: "12px 16px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 12,
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = f.color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                      >
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700 }}>{name}</span>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{matchCount} matching symptom{matchCount > 1 ? "s" : ""}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: f.priorityColor, fontFamily: "'Space Mono', monospace" }}>
                          {f.priority} risk · Dry {f.tempC} / {f.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedSymptoms.length === 0 && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 12, padding: 40, textAlign: "center", color: "#334155"
              }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13 }}>Select symptoms above to identify suspected filament moisture issues</p>
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <p style={{ fontSize: 11, color: "#334155", textAlign: "center", marginTop: 8 }}>
          Drying times and temperatures are guidelines. Always consult your filament manufacturer's datasheet for exact specifications.
        </p>
      </div>
    </div>
  );
}
