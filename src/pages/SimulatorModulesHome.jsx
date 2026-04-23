import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SimulatorModulesHome = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const styles = {
    wrap: {
      width: "100%",
      minHeight: "100vh",
      background: "#F4F5F2",
      color: "#0E1512",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: isMobile ? "40px 20px" : "80px 40px",
      boxSizing: "border-box"
    },
    container: {
      width: "100%",
      maxWidth: "1000px"
    },
    header: {
      textAlign: "center",
      marginBottom: "80px"
    },
    brand: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#34D399",
      textTransform: "uppercase",
      letterSpacing: "0.2em",
      marginBottom: "16px"
    },
    title: {
      fontSize: isMobile ? "48px" : "80px",
      fontFamily: "'Instrument Serif', serif",
      fontWeight: 400,
      margin: 0,
      lineHeight: 1
    },
    italic: {
      fontStyle: "italic"
    },
    subtitle: {
      fontSize: "18px",
      color: "#6B7280",
      marginTop: "24px",
      maxWidth: "600px",
      marginInline: "auto",
      lineHeight: 1.5
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "32px",
      width: "100%"
    },
    card: {
      background: "#FFFFFF",
      borderRadius: "24px",
      border: "1px solid #E6E8E3",
      padding: "48px",
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "320px",
      position: "relative",
      overflow: "hidden"
    },
    cardHover: {
      transform: "translateY(-8px)",
      borderColor: "#34D399",
      boxShadow: "0 20px 40px rgba(14, 21, 18, 0.05)"
    },
    cardNum: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#34D399",
      marginBottom: "40px"
    },
    cardTitle: {
      fontSize: "32px",
      fontFamily: "'Instrument Serif', serif",
      marginBottom: "16px"
    },
    cardDesc: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: 1.6
    },
    arrow: {
      position: "absolute",
      right: "48px",
      bottom: "48px",
      fontSize: "24px",
      color: "#0E1512"
    },
    footer: {
      marginTop: "120px",
      paddingTop: "40px",
      borderTop: "1px solid #E6E8E3",
      width: "100%",
      textAlign: "center",
      fontSize: "12px",
      color: "#9CA3AF",
      letterSpacing: "0.05em"
    }
  };

  const [hovered, setHovered] = useState(null);

  const modules = [
    {
      id: "iot",
      num: "MODULE 01",
      title: "IoT Parameter Sync",
      desc: "Simulate real-time operational device data with high-fidelity stochastic or linear distribution models.",
      path: "/simulator/emission/iot"
    },
    {
      id: "api",
      num: "MODULE 02",
      title: "API Gateway Relay",
      desc: "Comprehensive API vector emulation for bulk historical ingestion or live mainframe activity mirroring.",
      path: "/simulator/emission/api"
    }
  ];

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.brand}>Ecological Intelligence</div>
          <h1 style={styles.title}>
            GreOn <span style={styles.italic}>IQ</span> <span style={{ color: "#34D399" }}>Simulators</span>
          </h1>
          <p style={styles.subtitle}>
            A premium collection of ecological emulation tools. Composed for researchers and engineers seeking high-precision baseline modeling.
          </p>
        </header>

        <div style={styles.grid}>
          {modules.map((m, idx) => (
            <div
              key={m.id}
              style={{
                ...styles.card,
                ...(hovered === m.id ? styles.cardHover : {})
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
              <div style={{
                ...styles.arrow,
                transform: hovered === m.id ? "translateX(10px)" : "translateX(0)",
                transition: "transform 0.3s"
              }}>
                →
              </div>
            </div>
          ))}
        </div>

        <footer style={styles.footer}>
          &copy; 2026 GREON INTELLIGENCE QUOTIENT &middot; EMISSION CONTROL PROTOCOL
        </footer>
      </div>
    </div>
  );
};

export default SimulatorModulesHome;
