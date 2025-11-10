import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReductionIoTSimulator from "../IoTSimulator/ReductionIoTSimulator";
import ReductionAPISimulator from "../APISimulator/ReductionAPISimulator";

const ReductionTabStructure = () => {
  const [activeTab, setActiveTab] = useState("iot");
  const [w, setW] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const r = () => setW(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const isMobile = w <= 768;

  const tabs = useMemo(
    () => [
      {
        id: "iot",
        label: "IoT Reduction Simulator",
        icon: "📡",
        gradientFrom: "#22c55e",
        gradientTo: "#84cc16",
        component: <ReductionIoTSimulator />,
      },
      {
        id: "api",
        label: "API Reduction Simulator",
        icon: "🔗",
        gradientFrom: "#16a34a",
        gradientTo: "#65a30d",
        component: <ReductionAPISimulator />,
      },
    ],
    []
  );

  const current = tabs.find((t) => t.id === activeTab);

  const css = {
    page: {
      width: "100vw",
      minHeight: "100vh",
      background:
        "radial-gradient(1200px 600px at 10% -10%, rgba(132,204,22,0.12), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgba(16,185,129,0.10), transparent 55%), linear-gradient(135deg,#0b1221 0%, #0f172a 40%, #0e1322 100%)",
      color: "#e5e7eb",
      overflow: "auto",
      padding: isMobile ? 12 : 20,
    },
    backBtn: {
      position: "absolute",
      top: 20,
      left: 20,
      padding: "8px 16px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.15)",
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      backdropFilter: "blur(8px)",
      transition: "all 0.25s ease",
    },
    tabs: {
      display: "flex",
      justifyContent: "center",
      gap: 10,
      background: "rgba(17,24,39,.8)",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 16,
      padding: 8,
      margin: "8px auto 16px",
      maxWidth: 820,
      boxShadow: "0 20px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",
    },
    tabBtn: (active, from, to) => ({
      position: "relative",
      display: "flex",
      gap: 10,
      alignItems: "center",
      padding: isMobile ? "10px 14px" : "12px 18px",
      borderRadius: 12,
      background: active ? "rgba(255,255,255,.12)" : "transparent",
      color: active ? "#fff" : "#cbd5e1",
      border: active ? "1px solid rgba(255,255,255,.18)" : "1px solid transparent",
      cursor: "pointer",
      transition: ".2s ease",
      "--from": from,
      "--to": to,
    }),
    glow: (active) => ({
      position: "absolute",
      inset: 0,
      borderRadius: 12,
      background: "linear-gradient(135deg, var(--from), var(--to))",
      opacity: active ? 0.14 : 0,
      pointerEvents: "none",
      transition: "opacity .2s ease",
    }),
    icon: { fontSize: 16 },
    label: { fontWeight: 800, letterSpacing: 0.3, fontSize: 14 },
    content: {
      width: "min(1200px, 96vw)",
      margin: "0 auto",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,.06)",
      background: "rgba(2,6,23,.55)",
      backdropFilter: "blur(10px)",
      padding: isMobile ? 10 : 16,
      boxShadow: "0 20px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04)",
      animation: "fadeIn .25s ease both",
      minHeight: "calc(100vh - 160px)",
    },
  };

  return (
    <div style={css.page}>
      <button
        style={css.backBtn}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onClick={() => navigate('/simulator')}
      >
        ← Back
      </button>
      <div style={css.tabs}>
        {tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={css.tabBtn(active, t.gradientFrom, t.gradientTo)}
              onMouseEnter={(e) => !active && (e.currentTarget.style.background = "rgba(255,255,255,.06)")}
              onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
            >
              <div style={css.glow(active)} />
              <span style={css.icon}>{t.icon}</span>
              <span style={css.label}>{isMobile ? t.label.split(" ")[0] : t.label}</span>
            </button>
          );
        })}
      </div>

      <section style={css.content}>{current?.component}</section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReductionTabStructure;
