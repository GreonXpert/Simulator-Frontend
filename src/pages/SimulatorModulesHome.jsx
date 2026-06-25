import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SimulatorModulesHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedModule, setSelectedModule] = useState(null); // null | 'emission' | 'reduction'
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (location.state?.module) {
      setSelectedModule(location.state.module);
    }
  }, [location.state?.module]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const styles = {
    wrap: {
      width: "100%",
      height: "100vh",
      background: "#F4F5F2",
      color: "#0E1512",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: isMobile ? "24px 16px" : "48px 40px",
      boxSizing: "border-box",
      overflow: "auto",
    },
    container: {
      width: "100%",
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    header: {
      textAlign: "center",
      marginBottom: "40px",
    },
    brand: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#34D399",
      textTransform: "uppercase",
      letterSpacing: "0.2em",
      marginBottom: "16px",
    },
    title: {
      fontSize: isMobile ? "40px" : "64px",
      fontFamily: "'Instrument Serif', serif",
      fontWeight: 400,
      margin: 0,
      lineHeight: 1,
    },
    italic: {
      fontStyle: "italic",
    },
    subtitle: {
      fontSize: "16px",
      color: "#6B7280",
      marginTop: "16px",
      maxWidth: "520px",
      marginInline: "auto",
      lineHeight: 1.5,
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "32px",
      fontSize: "14px",
      color: "#6B7280",
    },
    breadcrumbBack: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      cursor: "pointer",
      color: "#34D399",
      fontWeight: 600,
      fontSize: "14px",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      background: "none",
      border: "none",
      padding: 0,
      fontFamily: "'Inter', sans-serif",
    },
    breadcrumbSep: {
      color: "#D1D5DB",
    },
    breadcrumbCurrent: {
      color: "#0E1512",
      fontWeight: 500,
    },
    subHeader: {
      textAlign: "center",
      marginBottom: "32px",
    },
    subLabel: {
      fontSize: "11px",
      fontWeight: 600,
      color: "#34D399",
      textTransform: "uppercase",
      letterSpacing: "0.2em",
      marginBottom: "10px",
    },
    subTitle: {
      fontSize: isMobile ? "28px" : "40px",
      fontFamily: "'Instrument Serif', serif",
      fontWeight: 400,
      margin: 0,
      lineHeight: 1.1,
    },
    subSubtitle: {
      fontSize: "14px",
      color: "#6B7280",
      marginTop: "10px",
      lineHeight: 1.5,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(260px, 1fr))",
      gap: "20px",
      width: "100%",
      maxWidth: "900px",
      marginInline: "auto",
    },
    card: {
      background: "#FFFFFF",
      borderRadius: "16px",
      border: "1px solid #E6E8E3",
      padding: "24px 28px",
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "180px",
      position: "relative",
      overflow: "hidden",
    },
    cardHover: {
      transform: "translateY(-4px)",
      borderColor: "#34D399",
      boxShadow: "0 12px 28px rgba(14, 21, 18, 0.06)",
    },
    cardNum: {
      fontSize: "11px",
      fontWeight: 600,
      color: "#34D399",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    cardTitle: {
      fontSize: "26px",
      fontFamily: "'Instrument Serif', serif",
      marginBottom: "10px",
    },
    cardDesc: {
      fontSize: "13px",
      color: "#6B7280",
      lineHeight: 1.5,
    },
    arrow: {
      position: "absolute",
      right: "28px",
      bottom: "24px",
      fontSize: "20px",
      color: "#0E1512",
    },
    footer: {
      marginTop: "auto",
      paddingTop: "24px",
      borderTop: "1px solid #E6E8E3",
      width: "100%",
      textAlign: "center",
      fontSize: "12px",
      color: "#9CA3AF",
      letterSpacing: "0.05em",
    },
  };

  const mainModules = [
    {
      id: "emission",
      num: "MODULE 01",
      title: "Emission",
      desc: "Simulate and analyze emission data streams across operational devices and API vectors with high-fidelity modeling.",
    },
    {
      id: "reduction",
      num: "MODULE 02",
      title: "Reduction",
      desc: "Model and project carbon reduction strategies with precision-calibrated stochastic and deterministic simulation engines.",
    },
  ];

  const subModules = {
    emission: [
      {
        id: "iot",
        num: "MODULE 01",
        title: "IoT Parameter Sync",
        desc: "Simulate real-time operational device data with high-fidelity stochastic or linear distribution models.",
        path: "/simulator/emission/iot",
      },
      {
        id: "api",
        num: "MODULE 02",
        title: "API Gateway Relay",
        desc: "Comprehensive API vector emulation for bulk historical ingestion or live mainframe activity mirroring.",
        path: "/simulator/emission/api",
      },
    ],
    reduction: [
      {
        id: "iot",
        num: "MODULE 01",
        title: "IoT Parameter Sync",
        desc: "Simulate real-time operational device data with high-fidelity stochastic or linear distribution models.",
        path: "/simulator/reduction/iot",
      },
      {
        id: "api",
        num: "MODULE 02",
        title: "API Gateway Relay",
        desc: "Comprehensive API vector emulation for bulk historical ingestion or live mainframe activity mirroring.",
        path: "/simulator/reduction/api",
      },
    ],
  };

  const subHeaderLabel = {
    emission: "Emission Simulators",
    reduction: "Reduction Simulators",
  };

  const subHeaderTitle = {
    emission: "Emission Simulation Tools",
    reduction: "Reduction Simulation Tools",
  };

  const subHeaderDesc = {
    emission:
      "Select your emission data simulation interface — IoT device sync or API gateway relay.",
    reduction:
      "Select your reduction modeling interface — IoT device sync or API gateway relay.",
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        {!selectedModule ? (
          <>
            <header style={styles.header}>
              <div style={styles.brand}>Ecological Intelligence</div>
              <h1 style={styles.title}>
                GreOn <span style={styles.italic}>IQ</span>{" "}
                <span style={{ color: "#34D399" }}>Simulators</span>
              </h1>
              <p style={styles.subtitle}>
                A premium collection of ecological emulation tools. Composed for
                researchers and engineers seeking high-precision baseline
                modeling.
              </p>
            </header>

            <div style={styles.grid}>
              {mainModules.map((m) => (
                <div
                  key={m.id}
                  style={{
                    ...styles.card,
                    ...(hovered === m.id ? styles.cardHover : {}),
                  }}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    setSelectedModule(m.id);
                    setHovered(null);
                  }}
                >
                  <div>
                    <div style={styles.cardNum}>{m.num}</div>
                    <div style={styles.cardTitle}>{m.title}</div>
                    <div style={styles.cardDesc}>{m.desc}</div>
                  </div>
                  <div
                    style={{
                      ...styles.arrow,
                      transform:
                        hovered === m.id ? "translateX(10px)" : "translateX(0)",
                      transition: "transform 0.3s",
                    }}
                  >
                    →
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={styles.breadcrumb}>
              <button
                style={styles.breadcrumbBack}
                onClick={() => {
                  setSelectedModule(null);
                  setHovered(null);
                }}
              >
                ← Back
              </button>
              <span style={styles.breadcrumbSep}>/</span>
              <span style={styles.breadcrumbCurrent}>
                {selectedModule.charAt(0).toUpperCase() +
                  selectedModule.slice(1)}
              </span>
            </div>

            <div style={styles.subHeader}>
              <div style={styles.subLabel}>
                {subHeaderLabel[selectedModule]}
              </div>
              <h2 style={styles.subTitle}>{subHeaderTitle[selectedModule]}</h2>
              <p style={styles.subSubtitle}>{subHeaderDesc[selectedModule]}</p>
            </div>

            <div style={styles.grid}>
              {subModules[selectedModule].map((m) => (
                <div
                  key={m.id}
                  style={{
                    ...styles.card,
                    ...(hovered === m.id ? styles.cardHover : {}),
                  }}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate(m.path)}
                >
                  <div>
                    <div style={styles.cardNum}>{m.num}</div>
                    <div style={styles.cardTitle}>{m.title}</div>
                    <div style={styles.cardDesc}>{m.desc}</div>
                  </div>
                  <div
                    style={{
                      ...styles.arrow,
                      transform:
                        hovered === m.id ? "translateX(10px)" : "translateX(0)",
                      transition: "transform 0.3s",
                    }}
                  >
                    →
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <footer style={styles.footer}>
          &copy; 2026 GREON INTELLIGENCE QUOTIENT &middot; EMISSION CONTROL
          PROTOCOL
        </footer>
      </div>
    </div>
  );
};

export default SimulatorModulesHome;
