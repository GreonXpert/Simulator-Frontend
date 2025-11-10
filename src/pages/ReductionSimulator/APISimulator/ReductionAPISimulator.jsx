import React, { useState, useEffect } from 'react'

const ReductionAPISimulator = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const isMobile = windowWidth <= 768

    const styles = {
        container: {
            width: "100%",
            minHeight: "calc(100vh - 200px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "20px" : "40px",
            background: "transparent"
        },
        card: {
            background: "rgba(17, 24, 39, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: isMobile ? "20px" : "30px",
            padding: isMobile ? "40px 20px" : "60px 40px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: "600px",
            textAlign: "center"
        },
        icon: {
            fontSize: isMobile ? "60px" : "80px",
            marginBottom: "20px",
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))"
        },
        title: {
            fontSize: isMobile ? "24px" : "32px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #a855f7, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "16px",
            letterSpacing: "0.5px"
        },
        description: {
            fontSize: isMobile ? "14px" : "16px",
            color: "#94a3b8",
            lineHeight: "1.6",
            marginBottom: "30px"
        },
        badge: {
            display: "inline-block",
            padding: "8px 20px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "20px",
            color: "#22c55e",
            fontSize: isMobile ? "12px" : "14px",
            fontWeight: "600",
            letterSpacing: "0.5px"
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>🔗</div>
                <h2 style={styles.title}>Reduction API Data Simulator</h2>
                <p style={styles.description}>
                    This simulator will enable you to test reduction data flows through API integrations. 
                    Simulate reduction initiatives, track progress, and validate data pipelines for sustainability metrics.
                </p>
                <div style={styles.badge}>
                    ♻️ Coming Soon
                </div>
            </div>
        </div>
    )
}

export default ReductionAPISimulator