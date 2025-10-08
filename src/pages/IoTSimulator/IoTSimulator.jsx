import React, { useState, useRef, useEffect } from "react";

const IoTDataSimulator = () => {
  // State variables
  const [apiUrl, setApiUrl] = useState(
    "http://localhost:5000/api/data-collection/clients/:clientId/nodes/:nodeId/scopes/:scopeId/iot-data"
  );
  const [token, setToken] = useState("");
  const [intervalMs, setIntervalMs] = useState(5000);
  const [status, setStatus] = useState("STOPPED");
  const [totalSent, setTotalSent] = useState(0);
  const [success, setSuccess] = useState(0);
  const [lastHttp, setLastHttp] = useState("—");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Configuration state
  const [selectedScope, setSelectedScope] = useState("Scope 1");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedTier, setSelectedTier] = useState("tier 1");

  // Refs
  const logRef = useRef(null);
  const timerRef = useRef(null);

  // Updated configuration data with End-of-Life activities
  const scopeConfig = {
    "Scope 1": {
      "Combustion": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["fuelConsumption"],
          "tier 2": ["fuelConsumption"]

        }
      },
      "Fugitive": {
        activities: ["SF6", "CH4-Leaks", "Refrigeration", "Generic"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          SF6: {
            "tier 1": ["nameplateCapacity", "defaultLeakageRate"],
            "tier 2": ["decreaseInventory", "acquisitions", "disbursements", "netCapacityIncrease"]
          },
          "CH4-Leaks": {
            "tier 1": ["activityData", "numberOfComponents"],
            "tier 2": ["activityData", "numberOfComponents"]
          },
          Refrigeration: {
            "tier 1": ["numberOfUnits", "leakageRate"],
            "tier 2": ["numberOfUnits", "leakageRate", "installedCapacity", "endYearCapacity", "purchases", "disposals"]
          },
          Generic: {
            "tier 1": ["numberOfUnits", "leakageRate"],
            "tier 2": ["numberOfUnits", "leakageRate", "installedCapacity", "endYearCapacity", "purchases", "disposals"]
          }
        }
      },
      "Process Emission": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["productionOutput"],
          "tier 2": ["productionOutput", "rawMaterialInput"]
        }
      }
    },
    "Scope 2": {
      "Purchased Electricity": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["consumed_electricity"],
          "tier 2": ["consumed_electricity"]
        }
      },
      "Purchased Steam": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["consumed_steam"],
          "tier 2": ["consumed_steam"]
        }
      },
      "Purchased Heating": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["consumed_heating"],
          "tier 2": ["consumed_heating"]
        }
      },
      "Purchased Cooling": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["consumed_cooling"],
          "tier 2": ["consumed_cooling"]
        }
      }
    },
    "Scope 3": {
      "Purchased Goods and Services": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["procurementSpend"],
          "tier 2": ["physicalQuantity"]
        }
      },
      "Capital Goods": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["procurementSpend"],
          "tier 2": ["assetQuantity"]
        }
      },
      "Fuel and energy": {
        activities: ["Upstream fuel", "WTT", "T&D losses"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "Upstream fuel": {
            "tier 1": ["fuelConsumed"],
            "tier 2": ["fuelConsumed"]
          },
          "WTT": {
            "tier 1": ["consumed_fuel"],   // or send BOTH keys
            "tier 2": ["consumed_fuel"]
          },
          "T&D losses": {
            "tier 1": ["electricityConsumption", "tdLossFactor"],
            "tier 2": ["electricityConsumption", "tdLossFactor"]
          }
        }
      },
      "Upstream Transport and Distribution": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["transportationSpend"],
          "tier 2": ["mass", "distance"]
        }
      },
      "Waste Generated in Operation": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["wasteMass"],
          "tier 2": ["wasteMass"]
        }
      },
      "Business Travel": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["travelSpend", "hotelNights"],
          "tier 2": ["numberOfPassengers", "distanceTravelled", "hotelNights"]
        }
      },
      "Employee Commuting": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["employeeCount", "averageCommuteDistance", "workingDays"],
          "tier 2": ["employeeCount", "averageCommuteDistance", "workingDays"]
        }
      },
      "Upstream Leased Assets": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["leasedArea"],
          "tier 2": ["totalArea", "energyConsumption", "BuildingTotalS1_S2"]
        }
      },
      "Downstream Leased Assets": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["leasedArea"],
          "tier 2": ["totalArea", "energyConsumption", "BuildingTotalS1_S2"]
        }
      },
      "Downstream Transport and Distribution": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["transportSpend"],
          "tier 2": ["mass", "distance"]
        }
      },
      "Processing of Sold Products": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["productQuantity"],
          "tier 2": ["productQuantity"]
        }
      },
      "Use of Sold Products": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["productQuantity", "averageLifetimeEnergyConsumption"],
          "tier 2": ["productQuantity", "usePattern", "energyEfficiency"]
        }
      },
      "End-of-Life Treatment of Sold Products": {
        activities: ["Disposal", "Landfill", "Incineration"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "Disposal": {
            "tier 1": ["massEol", "toDisposal"],
            "tier 2": ["massEol", "toDisposal"]
          },
          "Landfill": {
            "tier 1": ["massEol", "toLandfill"],
            "tier 2": ["massEol", "toLandfill"]
          },
          "Incineration": {
            "tier 1": ["massEol", "toIncineration"],
            "tier 2": ["massEol", "toIncineration"]
          }
        }
      },
      "Franchises": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["franchiseCount", "avgEmissionPerFranchise"],
          "tier 2": ["franchiseTotalS1Emission", "franchiseTotalS2Emission", "energyConsumption"]
        }
      },
      "Investments": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["equitySharePercentage", "investeeRevenue"],
          "tier 2": ["equitySharePercentage", "investeeScope1Emission", "investeeScope2Emission", "energyConsumption"]
        }
      }
    }
  };

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset category when scope changes
  useEffect(() => {
    setSelectedCategory("");
    setSelectedActivity("");
  }, [selectedScope]);

  // Reset activity when category changes
  useEffect(() => {
    setSelectedActivity("");
  }, [selectedCategory]);

  // Helper functions for generating random data
  const rand = (min, max, decimals = 2) => {
    const value = Math.random() * (max - min) + min;
    return +value.toFixed(decimals);
  };

  const getFieldValue = (fieldName) => {
    // Generate realistic values based on field type
    if (/consumption|consumed|fuel/i.test(fieldName)) return rand(10, 5000, 2);
    if (/electricity|kwh/i.test(fieldName)) return rand(100, 50000, 2);
    if (/capacity|nameplate/i.test(fieldName)) return rand(50, 10000, 2);
    if (/leakage|rate/i.test(fieldName)) return rand(0.1, 50, 3);
    if (/mass|weight/i.test(fieldName)) return rand(1, 10000, 2);
    if (/distance|km/i.test(fieldName)) return rand(1, 5000, 2);
    if (/count|number|units/i.test(fieldName)) return rand(1, 1000, 0);
    if (/spend|revenue/i.test(fieldName)) return rand(1000, 1000000, 2);
    if (/percentage|pct/i.test(fieldName)) return rand(0.1, 100, 2);
    if (/temperature|temp/i.test(fieldName)) return rand(-20, 100, 1);
    if (/pressure/i.test(fieldName)) return rand(0.5, 50, 2);
    if (/efficiency/i.test(fieldName)) return rand(0.1, 1.0, 3);
    if (/days/i.test(fieldName)) return rand(200, 365, 0);
    if (/nights/i.test(fieldName)) return rand(1, 30, 0);
    if (/area/i.test(fieldName)) return rand(100, 50000, 2);
    if (/pattern/i.test(fieldName)) return rand(0.5, 2.0, 2);
    if (/type/i.test(fieldName)) return ["Landfill", "Incineration", "Recycling", "Composting"][Math.floor(Math.random() * 4)];
    if (/tdLoss|loss/i.test(fieldName)) return rand(0.01, 0.15, 4); // T&D loss factor typically 1-15%

    // End-of-Life specific fields
    if (/massEol/i.test(fieldName)) return rand(100, 50000, 2); // Mass of end-of-life products in kg
    if (/toDisposal/i.test(fieldName)) return rand(0.1, 1.0, 2); // Fraction going to disposal
    if (/toLandfill/i.test(fieldName)) return rand(0.1, 1.0, 2); // Fraction going to landfill
    if (/toIncineration/i.test(fieldName)) return rand(0.1, 1.0, 2); // Fraction going to incineration

    // Default range for unspecified fields
    return rand(1, 1000, 2);
  };

  const getCurrentFields = () => {
    if (!selectedScope || !selectedCategory) return [];

    const categoryConfig = scopeConfig[selectedScope][selectedCategory];
    if (!categoryConfig) return [];

    // For categories with activities
    if (categoryConfig.activities && categoryConfig.activities.length > 0) {
      if (!selectedActivity) return [];
      return categoryConfig.fields[selectedActivity]?.[selectedTier] || [];
    }

    // For categories without activities
    return categoryConfig.fields[selectedTier] || [];
  };

  const makeDataValues = () => {
    const fields = getCurrentFields();
    const data = {};

    fields.forEach(field => {
      data[field] = getFieldValue(field);
    });

    return data;
  };

  const buildPayload = () => {
    const now = new Date();
    return {
      dataValues: makeDataValues(),
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB", { hour12: false }),
      timestamp: now.toISOString()
    };
  };

  // Logging function
  const log = (msg, type = "info") => {
    if (!logRef.current) return;
    const t = new Date().toLocaleTimeString();
    const line = document.createElement("div");

    switch (type) {
      case "ok":
        line.style.color = "#22c55e";
        break;
      case "warn":
        line.style.color = "#f59e0b";
        break;
      case "err":
        line.style.color = "#ef4444";
        break;
      default:
        line.style.color = "#60a5fa";
    }

    line.textContent = `[${t}] ${msg}`;
    logRef.current.prepend(line);

    while (logRef.current.childNodes.length > 500) {
      logRef.current.removeChild(logRef.current.lastChild);
    }
  };

  // Networking functions
  const sendOnce = async () => {
    const url = apiUrl.trim();
    if (!url) {
      log("API URL is required", "err");
      setLastHttp("—");
      return;
    }

    if (!selectedScope || !selectedCategory) {
      log("Please select scope and category", "err");
      return;
    }

    const categoryConfig = scopeConfig[selectedScope][selectedCategory];
    const requiresActivity = categoryConfig?.activities && categoryConfig.activities.length > 0;

    if (requiresActivity && !selectedActivity) {
      log(`Please select activity for ${selectedCategory} category`, "err");
      return;
    }

    const payload = buildPayload();
    const fields = getCurrentFields();

    if (fields.length === 0) {
      log("No fields available for current configuration", "err");
      return;
    }

    try {
      log(`POST ${url} with fields: [${fields.join(', ')}]`, "info");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      setLastHttp(res.status);
      const text = await res.text();
      setTotalSent(prev => prev + 1);

      if (res.ok) {
        setSuccess(prev => prev + 1);
        log(`✅ ${res.status} OK — Data sent successfully`, "ok");
        log(`   Fields: ${JSON.stringify(payload.dataValues, null, 2)}`, "info");
      } else {
        log(`❌ ${res.status} — ${text.slice(0, 200)}`, "err");
      }
    } catch (e) {
      setLastHttp("ERR");
      log(`❌ Network error: ${e.message}`, "err");
    }
  };

  const startAuto = () => {
    if (timerRef.current) return;

    if (!selectedScope || !selectedCategory) {
      log("Please select scope and category before starting auto mode", "err");
      return;
    }

    const categoryConfig = scopeConfig[selectedScope][selectedCategory];
    const requiresActivity = categoryConfig?.activities && categoryConfig.activities.length > 0;

    if (requiresActivity && !selectedActivity) {
      log(`Please select activity for ${selectedCategory} category`, "err");
      return;
    }

    const ms = Math.max(300, parseInt(intervalMs || 5000, 10));
    setStatus("RUNNING");
    log(`Auto mode started @ every ${ms} ms`, "ok");
    log(`Configuration: ${selectedScope} > ${selectedCategory} > ${selectedActivity || 'N/A'} > ${selectedTier}`, "info");
    timerRef.current = setInterval(sendOnce, ms);
  };

  const stopAuto = () => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
    setStatus("STOPPED");
    log("Auto mode stopped", "warn");
  };

  const clearLog = () => {
    if (logRef.current) logRef.current.innerHTML = "";
    log("Log cleared");
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initial log message
  useEffect(() => {
    if (logRef.current && logRef.current.children.length === 0) {
      log("IoT Data Simulator Ready");
      log("1. Configure your scope, category, and tier selections");
      log("2. Set your API endpoint URL");
      log("3. Click 'Send once' to test or 'Start auto' for continuous sending");
    }
  }, []);

  // Define breakpoints
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  // Get available options based on current selection
  const getAvailableCategories = () => {
    return Object.keys(scopeConfig[selectedScope] || {});
  };

  const getAvailableActivities = () => {
    if (!selectedScope || !selectedCategory) return [];
    return scopeConfig[selectedScope]?.[selectedCategory]?.activities || [];
  };

  const getAvailableTiers = () => {
    if (!selectedScope || !selectedCategory) return [];
    return scopeConfig[selectedScope]?.[selectedCategory]?.tiers || [];
  };

  const hasActivityField = () => {
    if (!selectedScope || !selectedCategory) return false;
    const categoryConfig = scopeConfig[selectedScope][selectedCategory];
    return categoryConfig?.activities && categoryConfig.activities.length > 0;
  };

  // Styles
  const styles = {
    wrap: {
      width: "100vw",
      height: "100vh",
      margin: 0,
      padding: isMobile ? 12 : 20,
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      overflow: "auto",
      boxSizing: "border-box"
    },
    container: {
      display: "grid",
      gridTemplateRows: "auto 1fr",
      height: "100%",
      gap: isMobile ? 12 : 20
    },
    header: {
      background: "#111827",
      borderRadius: isMobile ? 8 : 16,
      padding: isMobile ? 16 : 24,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
    },
    main: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 400px",
      gap: isMobile ? 12 : 20,
      height: "100%",
      minHeight: 0
    },
    leftPanel: {
      background: "#111827",
      borderRadius: isMobile ? 8 : 16,
      padding: isMobile ? 16 : 24,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
      display: "flex",
      flexDirection: "column"
    },
    rightPanel: {
      display: "grid",
      gridTemplateRows: isMobile ? "auto auto" : "auto 1fr",
      gap: isMobile ? 12 : 20
    },
    statsCard: {
      background: "#111827",
      borderRadius: isMobile ? 8 : 16,
      padding: isMobile ? 12 : 20,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
    },
    logCard: {
      background: "#111827",
      borderRadius: isMobile ? 8 : 16,
      padding: isMobile ? 12 : 20,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
      display: "flex",
      flexDirection: "column",
      minHeight: 0
    },
    heading: {
      margin: "0 0 8px",
      fontSize: isMobile ? 24 : 32,
      fontWeight: 800,
      background: "linear-gradient(135deg, #60a5fa 0%, #34d399 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text"
    },
    sub: {
      margin: "0 0 20px",
      color: "#94a3b8",
      fontSize: isMobile ? 14 : 16
    },
    label: {
      fontSize: isMobile ? 12 : 14,
      color: "#94a3b8",
      display: "block",
      marginBottom: 8,
      fontWeight: 600
    },
    input: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "14px 16px",
      borderRadius: isMobile ? 8 : 12,
      border: "2px solid #253047",
      background: "#0b1220",
      color: "#e5e7eb",
      outline: "none",
      fontSize: isMobile ? 12 : 14,
      transition: "border-color 0.2s",
      boxSizing: "border-box"
    },
    select: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "14px 16px",
      borderRadius: isMobile ? 8 : 12,
      border: "2px solid #253047",
      background: "#0b1220",
      color: "#e5e7eb",
      outline: "none",
      fontSize: isMobile ? 12 : 14,
      transition: "border-color 0.2s",
      boxSizing: "border-box",
      cursor: "pointer"
    },
    grid: {
      display: "grid",
      gap: isMobile ? 12 : 20,
      gridTemplateColumns: "1fr",
      flex: 1
    },
    configSection: {
      background: "#0b1220",
      border: "2px solid #1f2937",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 16 : 20,
      marginBottom: isMobile ? 12 : 20
    },
    configTitle: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: 700,
      color: "#34d399",
      marginBottom: isMobile ? 12 : 16,
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    configGrid: {
      display: "grid",
      gap: isMobile ? 12 : 16,
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))"
    },
    fieldPreview: {
      background: "#0b1220",
      border: "2px solid #1f2937",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 12 : 16,
      marginBottom: isMobile ? 12 : 20
    },
    fieldTitle: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: 600,
      color: "#60a5fa",
      marginBottom: 8
    },
    fieldList: {
      fontSize: isMobile ? 12 : 14,
      color: "#94a3b8",
      fontFamily: "ui-monospace, monospace"
    },
    row: {
      display: "grid",
      gap: isMobile ? 12 : 16,
      gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr"
    },
    btns: {
      display: "flex",
      gap: isMobile ? 8 : 12,
      flexWrap: "wrap",
      marginTop: isMobile ? 16 : 24,
      justifyContent: isMobile ? "center" : "flex-start"
    },
    button: {
      cursor: "pointer",
      border: "none",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? "10px 16px" : "12px 20px",
      fontWeight: 700,
      fontSize: isMobile ? 12 : 14,
      transition: "all 0.2s",
      minWidth: isMobile ? "auto" : "120px"
    },
    primary: {
      background: "#2563eb",
      color: "white"
    },
    ghost: {
      background: "#0b1220",
      color: "#cbd5e1",
      border: "2px solid #1f2937"
    },
    danger: {
      background: "#b91c1c",
      color: "white"
    },
    ok: {
      background: "#15803d",
      color: "white"
    },
    disabled: {
      opacity: 0.5,
      cursor: "not-allowed"
    },
    stats: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: isMobile ? 8 : 12
    },
    stat: {
      background: "#0b1220",
      border: "2px solid #1f2937",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 12 : 16,
      textAlign: "center"
    },
    statTitle: {
      fontSize: isMobile ? 10 : 12,
      color: "#94a3b8",
      marginBottom: 8,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    statValue: {
      fontSize: isMobile ? 18 : 24,
      fontWeight: 800,
      color: "#e5e7eb"
    },
    log: {
      background: "#0b1220",
      border: "2px solid #1f2937",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 12 : 16,
      flex: 1,
      overflow: "auto",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: isMobile ? 11 : 13,
      lineHeight: 1.4,
      minHeight: 0
    },
    logTitle: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: 700,
      color: "#e5e7eb",
      marginBottom: 12
    }
  };

  const currentFields = getCurrentFields();

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>IoT Data Simulator</h1>
          <p style={styles.sub}>Generate and send realistic IoT sensor data based on emission scope categories and tiers.</p>
        </div>

        <div style={styles.main}>
          <div style={styles.leftPanel}>
            <div style={styles.grid}>
              {/* Configuration Section */}
              <div style={styles.configSection}>
                <div style={styles.configTitle}>
                  ⚙️ Data Configuration
                </div>
                <div style={styles.configGrid}>
                  <div>
                    <label style={styles.label}>Scope *</label>
                    <select
                      style={styles.select}
                      value={selectedScope}
                      onChange={(e) => setSelectedScope(e.target.value)}
                    >
                      <option value="Scope 1">Scope 1</option>
                      <option value="Scope 2">Scope 2</option>
                      <option value="Scope 3">Scope 3</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Category *</label>
                    <select
                      style={styles.select}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {getAvailableCategories().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {hasActivityField() && (
                    <div>
                      <label style={styles.label}>Activity *</label>
                      <select
                        style={styles.select}
                        value={selectedActivity}
                        onChange={(e) => setSelectedActivity(e.target.value)}
                      >
                        <option value="">Select Activity</option>
                        {getAvailableActivities().map(act => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={styles.label}>Tier *</label>
                    <select
                      style={styles.select}
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                    >
                      {getAvailableTiers().map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Field Preview */}
              {currentFields.length > 0 && (
                <div style={styles.fieldPreview}>
                  <div style={styles.fieldTitle}>
                    📋 Generated Fields ({currentFields.length})
                  </div>
                  <div style={styles.fieldList}>
                    {currentFields.join(', ')}
                  </div>
                </div>
              )}

              {/* API Configuration */}
              <div>
                <label style={styles.label}>API Endpoint URL *</label>
                <input
                  style={styles.input}
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:5000/api/data-collection/clients/:clientId/nodes/:nodeId/scopes/:scopeId/iot-data"
                />
              </div>

              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Auth Token (optional)</label>
                  <input
                    style={styles.input}
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="JWT / Bearer token"
                  />
                </div>

                <div>
                  <label style={styles.label}>Interval (ms)</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="500"
                    step="500"
                    value={intervalMs}
                    onChange={(e) => setIntervalMs(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.btns}>
                <button
                  style={{
                    ...styles.button,
                    ...styles.primary,
                    ...(currentFields.length === 0 ? styles.disabled : {})
                  }}
                  onClick={sendOnce}
                  disabled={currentFields.length === 0}
                >
                  📤 Send once
                </button>
                <button
                  style={{
                    ...styles.button,
                    ...styles.ok,
                    ...(status === "RUNNING" || currentFields.length === 0 ? styles.disabled : {})
                  }}
                  onClick={startAuto}
                  disabled={status === "RUNNING" || currentFields.length === 0}
                >
                  ▶️ Start auto
                </button>
                <button
                  style={{
                    ...styles.button,
                    ...styles.danger,
                    ...(status !== "RUNNING" ? styles.disabled : {})
                  }}
                  onClick={stopAuto}
                  disabled={status !== "RUNNING"}
                >
                  ⏹ Stop
                </button>
                <button
                  style={{ ...styles.button, ...styles.ghost }}
                  onClick={clearLog}
                >
                  🧹 Clear log
                </button>
              </div>
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.statsCard}>
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Total Sent</div>
                  <div style={styles.statValue}>{totalSent}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Status</div>
                  <div style={{ ...styles.statValue, color: status === "RUNNING" ? "#22c55e" : "#94a3b8" }}>{status}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Last HTTP</div>
                  <div style={styles.statValue}>{lastHttp}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Success</div>
                  <div style={{ ...styles.statValue, color: "#22c55e" }}>{success}</div>
                </div>
              </div>
            </div>

            <div style={styles.logCard}>
              <div style={styles.logTitle}>Live Activity Log</div>
              <div style={styles.log} ref={logRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDataSimulator;