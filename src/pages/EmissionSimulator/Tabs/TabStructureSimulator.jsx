import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import IoTDataSimulator from '../IoTSimulator/IoTSimulator'
import APIDataSimulator from '../APISimulator/APIDataSimulator'

const TabStructureSimulator = () => {
    const [activeTab, setActiveTab] = useState('iot')
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const navigate = useNavigate();

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const tabs = [
        {
            id: 'iot',
            label: 'IoT Data Simulator',
            icon: '📡',
            component: <IoTDataSimulator />,
            gradient: 'from-blue-500 to-green-400'
        },
        {
            id: 'api',
            label: 'API Data Simulator',
            icon: '🔗',
            component: <APIDataSimulator />,
            gradient: 'from-purple-500 to-cyan-400'
        }
    ]

    // Define breakpoints
    const isMobile = windowWidth <= 768
    const isTablet = windowWidth > 768 && windowWidth <= 1024

    // Styles matching the simulator aesthetic
    const styles = {
        container: {
            width: "100vw",
            minHeight: "100vh",
            margin: 0,
            padding: 0,
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a1f2e 100%)",
            overflow: "auto"
        },
        backBtn: {
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '8px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
        },
        backBtnHover: { background: 'rgba(255,255,255,0.15)' },
        tabWrapper: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: isMobile ? "20px 12px 0" : "32px 20px 0",
            background: "transparent"
        },
        tabContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(17, 24, 39, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: isMobile ? "16px" : "24px",
            padding: isMobile ? "8px" : "12px",
            gap: isMobile ? "8px" : "12px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: isMobile ? "20px" : "32px",
            maxWidth: "fit-content"
        },
        tabButton: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "8px" : "12px",
            padding: isMobile ? "12px 20px" : "16px 28px",
            borderRadius: isMobile ? "12px" : "18px",
            border: "none",
            background: "transparent",
            color: "#94a3b8",
            fontSize: isMobile ? "14px" : "16px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            minWidth: isMobile ? "auto" : "180px",
            justifyContent: "center",
            textAlign: "center"
        },
        tabButtonActive: {
            color: "#ffffff",
            background: "rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
        },
        tabIcon: {
            fontSize: isMobile ? "16px" : "18px",
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
        },
        tabLabel: {
            background: "transparent",
            fontWeight: "800",
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
        },
        tabLabelActive: {
            background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
        },
        contentContainer: {
            width: "100%",
            minHeight: "calc(100vh - 140px)",
            position: "relative"
        },
        tabContent: {
            width: "100%",
            height: "100%",
            display: "none"
        },
        tabContentActive: {
            width: "100%",
            height: "100%",
            display: "block",
            animation: "fadeInUp 0.3s ease-out"
        },
        gradientOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
            opacity: 0,
            transition: "opacity 0.3s ease",
            borderRadius: "inherit",
            pointerEvents: "none"
        },
        gradientOverlayActive: {
            opacity: 0.1
        }
    }

    const currentTab = tabs.find(tab => tab.id === activeTab)

    return (
        <div style={styles.container}>
            <button
                style={styles.backBtn}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onClick={() => navigate('/simulator')}
            >
                ← Back
            </button>
            <div style={styles.tabWrapper}>
                {/* Tab Navigation */}
                <div style={styles.tabContainer}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    ...styles.tabButton,
                                    ...(isActive ? styles.tabButtonActive : {}),
                                    '--gradient-from': tab.gradient.includes('blue') ? '#60a5fa' : '#a855f7',
                                    '--gradient-to': tab.gradient.includes('green') ? '#34d399' : '#06b6d4'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                                        e.target.style.color = '#e2e8f0'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.target.style.background = 'transparent'
                                        e.target.style.color = '#94a3b8'
                                    }
                                }}
                            >
                                <div
                                    style={{
                                        ...styles.gradientOverlay,
                                        ...(isActive ? styles.gradientOverlayActive : {})
                                    }}
                                />

                                <span style={styles.tabIcon}>{tab.icon}</span>
                                <span
                                    style={{
                                        ...styles.tabLabel,
                                        ...(isActive ? styles.tabLabelActive : {})
                                    }}
                                >
                                    {isMobile ? tab.label.split(' ')[0] : tab.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div style={styles.contentContainer}>
                <div style={styles.tabContentActive}>
                    {currentTab?.component}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

export default TabStructureSimulator