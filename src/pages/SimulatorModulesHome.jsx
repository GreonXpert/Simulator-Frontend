import React from "react";
import { useNavigate } from "react-router-dom";

const cardBase = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "18px 18px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  cursor: "pointer",
  transition: "transform .18s ease, background .2s ease",
  color: "#fff",
};

export default function SimulatorModulesHome() {
  const nav = useNavigate();

  const Page = {
    wrap: {
      width: "100vw",
      minHeight: "100vh",
      padding: 24,
      display: "grid",
      placeItems: "center",
      background:
        "radial-gradient(1200px 600px at 10% -10%, rgba(56,189,248,0.12), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgba(132,204,22,0.10), transparent 55%), linear-gradient(135deg,#0b1221 0%, #0f172a 40%, #0e1322 100%)",
      color: "#e5e7eb",
    },
    shell: {
      width: "min(1100px, 92vw)",
      display: "grid",
      gap: 20,
    },
    header: {
      padding: "14px 18px",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.03)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { margin: 0, fontSize: 20, fontWeight: 800 },
    sub: { margin: 0, color: "#9ca3af", fontSize: 13 },

    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    cardEmission: {
      ...cardBase,
      "--gFrom": "#0ea5e9",
      "--gTo": "#22d3ee",
    },
    cardReduction: {
      ...cardBase,
      "--gFrom": "#22c55e",
      "--gTo": "#84cc16",
    },
    icon: { fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(0,0,0,.35))" },
    textCol: { display: "grid", gap: 2 },
    h: { margin: 0, fontWeight: 800, letterSpacing: 0.3, fontSize: 16, color: "#fff", },
    p: { margin: 0, color: "#94a3b8", fontSize: 13 },
    glow: {
      position: "absolute",
      inset: 0,
      borderRadius: 16,
      pointerEvents: "none",
      background: "linear-gradient(135deg, var(--gFrom), var(--gTo))",
      opacity: 0.15,
    },
  };

  return (
    <div style={Page.wrap}>
      <div style={Page.shell}>
        <header style={Page.header}>
          <div>
            <h3 style={Page.title}>Simulator Modules</h3>
            <p style={Page.sub}>Choose the module to launch a simulator.</p>
          </div>
        </header>

        <section style={Page.grid}>
          {/* Emission card -> to TabStructureSimulator (unchanged file) */}
          <button
            style={Page.cardEmission}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onClick={() => nav("/simulator/emission")}
          >
            <div style={{ position: "relative" }}>
              <div style={Page.glow} />
            </div>
            <span style={Page.icon}>🛰️</span>
            <div style={Page.textCol}>
              <p style={Page.title}>Emission Tracking</p>
              <p style={Page.p}>Generate & stream operational activity.</p>
            </div>
          </button>

          {/* Reduction card -> to Reduction Tab Structure */}
          <button
            style={Page.cardReduction}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onClick={() => nav("/simulator/reduction")}
          >
            <div style={{ position: "relative" }}>
              <div style={Page.glow} />
            </div>
            <span style={Page.icon}>♻️</span>
            <div style={Page.textCol}>
              <p style={Page.title}>Reduction Strategies</p>
              <p style={Page.p}>Simulate baseline/project data & net reduction.</p>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
