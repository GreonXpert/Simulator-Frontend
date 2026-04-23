import React, { useState, useRef, useEffect } from "react";

const IoTDataSimulator = () => {
  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // State variables - ✅ Refactored Endpoint State
  const [baseUrl, setBaseUrl] = useState("http://localhost:5000/api/data-collection");
  const [clientId, setClientId] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [apiKey, setApiKey] = useState("");
  
  const [intervalMs, setIntervalMs] = useState(5000);
  const [status, setStatus] = useState("STOPPED");
  const [totalSent, setTotalSent] = useState(0);
  const [success, setSuccess] = useState(0);
  const [lastHttp, setLastHttp] = useState("—");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Simulation Mode state
  const [simMode, setSimMode] = useState("random"); 
  const [totalValue, setTotalValue] = useState(1000);
  const [sourcePeriod, setSourcePeriod] = useState("Yearly");
  const [targetFrequency, setTargetFrequency] = useState("Monthly");
  const [minuteInterval, setMinuteInterval] = useState(1);
  const [sendsCompleted, setSendsCompleted] = useState(0);

  // Configuration state
  const [selectedScope, setSelectedScope] = useState("Scope 1");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedTier, setSelectedTier] = useState("tier 1");

  // ✅ Scope 1+2 API Integration state
  const [scope12Data, setScope12Data] = useState(null);
  const [scope12Loading, setScope12Loading] = useState(false);
  const [scope12Error, setScope12Error] = useState(null);
  const [scope12LastFetch, setScope12LastFetch] = useState(null);

  // Calculation Logic for controlled distribution
  const distributions = React.useMemo(() => {
    const durations = {
      "Monthly": 30 * 24 * 60,
      "Quarterly": 91.25 * 24 * 60,
      "Half-yearly": 182.5 * 24 * 60,
      "Yearly": 365 * 24 * 60
    };

    const targetDurations = {
      "Monthly": 30 * 24 * 60,
      "Daily": 24 * 60,
      "Hourly": 60,
      "Minutes": parseInt(minuteInterval) || 1
    };

    const sourceMins = durations[sourcePeriod] || durations["Yearly"];
    const targetMins = targetDurations[targetFrequency] || targetDurations["Monthly"];
    const totalIntervals = Math.max(1, Math.floor(sourceMins / targetMins));
    const valuePerInterval = totalValue / totalIntervals;

    return { totalIntervals, valuePerInterval };
  }, [totalValue, sourcePeriod, targetFrequency, minuteInterval]);

  // Refs
  const logRef = useRef(null);
  const timerRef = useRef(null);

  // ✅ FULLY CORRECTED configuration data
  const scopeConfig = {
    "Scope 1": {
      "Combustion": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["fuelConsumption"], "tier 2": ["fuelConsumption"] } },
      "Fugitive": {
        activities: ["SF6", "CH4-Leaks", "Refrigeration", "Generic"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          SF6: { "tier 1": ["nameplateCapacity"], "tier 2": ["decreaseInventory", "acquisitions", "disbursements", "netCapacityIncrease"] },
          "CH4-Leaks": { "tier 1": ["activityData"], "tier 2": ["numberOfComponents"] },
          Refrigeration: { "tier 1": ["numberOfUnits"], "tier 2": ["installedCapacity", "endYearCapacity", "purchases", "disposals"] },
          Generic: { "tier 1": ["numberOfUnits"], "tier 2": ["installedCapacity", "endYearCapacity", "purchases", "disposals"] }
        }
      },
      "Process Emission": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["productionOutput"], "tier 2": ["rawMaterialInput"] } }
    },
    "Scope 2": {
      "Purchased Electricity": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["consumed_electricity"], "tier 2": ["consumed_electricity"] } },
      "Purchased Steam": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["consumed_steam"], "tier 2": ["consumed_steam"] } },
      "Purchased Heating": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["consumed_heating"], "tier 2": ["consumed_heating"] } },
      "Purchased Cooling": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["consumed_cooling"], "tier 2": ["consumed_cooling"] } }
    },
    "Scope 3": {
      "Purchased Goods and Services": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["procurementSpend"], "tier 2": ["physicalQuantity"] } },
      "Capital Goods": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["procurementSpend"], "tier 2": ["assetQuantity"] } },
      "Fuel and energy": {
        activities: ["Upstream fuel", "WTT", "T&D losses"],
        tiers: ["tier 1", "tier 2"],
        fields: { "Upstream fuel": { "tier 1": ["fuelConsumed"], "tier 2": ["fuelConsumed"] }, "WTT": { "tier 1": ["consumed_fuel"], "tier 2": ["consumed_fuel"] }, "T&D losses": { "tier 1": ["electricityConsumption"], "tier 2": ["electricityConsumption"] } }
      },
      "Upstream Transport and Distribution": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["transportationSpend"], "tier 2": ["allocation", "distance"] } },
      "Waste Generated in Operation": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["wasteMass"], "tier 2": ["wasteMass"] } },
      "Business Travel": {
        activities: ["travelbased", "hotelbased"],
        tiers: ["tier 1", "tier 2"],
        fields: { travelbased: { "tier 1": ["travelSpend"], "tier 2": ["numberOfPassengers", "distanceTravelled"] }, hotelbased: { "tier 1": ["hotelNights"], "tier 2": ["hotelNights"] } }
      },
      "Employee Commuting": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["employeeCount", "averageCommuteDistance", "workingDays"], "tier 2": ["employeeCount", "averageCommuteDistance", "workingDays"] } },
      "Upstream Leased Assets": {
        activities: ["energybased", "areabased"],
        tiers: ["tier 1", "tier 2"],
        fields: { energybased: { "tier 1": ["leasedArea"], "tier 2": ["energyConsumption"] }, areabased: { "tier 1": ["leasedArea"], "tier 2": ["leasedArea", "totalArea", "BuildingTotalS1_S2"] } }
      },
      "Downstream Leased Assets": {
        activities: ["energybased", "areabased"],
        tiers: ["tier 1", "tier 2"],
        fields: { energybased: { "tier 1": ["leasedArea"], "tier 2": ["energyConsumption"] }, areabased: { "tier 1": ["leasedArea"], "tier 2": ["leasedArea", "totalArea", "BuildingTotalS1_S2"] } }
      },
      "Downstream Transport and Distribution": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["transportSpend"], "tier 2": ["allocation", "distance"] } },
      "Processing of Sold Products": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["productQuantity"], "tier 2": ["productQuantity"] } },
      "Use of Sold Products": { activities: [], tiers: ["tier 1", "tier 2"], fields: { "tier 1": ["productQuantity"], "tier 2": ["productQuantity"] } },
      "End-of-Life Treatment of Sold Products": {
        activities: ["Disposal", "Landfill", "Incineration"],
        tiers: ["tier 1", "tier 2"],
        fields: { "Disposal": { "tier 1": ["massEol"], "tier 2": ["massEol"] }, "Landfill": { "tier 1": ["massEol"], "tier 2": ["massEol"] }, "Incineration": { "tier 1": ["massEol"], "tier 2": ["massEol"] } }
      },
      "Franchises": {
        activities: ["emissionbased", "energybased"],
        tiers: ["tier 1", "tier 2"],
        fields: { emissionbased: { "tier 1": ["franchiseCount", "avgEmissionPerFranchise"], "tier 2": ["franchiseTotalS1Emission", "franchiseTotalS2Emission"] }, energybased: { "tier 1": ["franchiseCount", "avgEmissionPerFranchise"], "tier 2": ["energyConsumption"] } }
      },
      "Investments": {
        activities: ["investmentbased", "energybased"],
        tiers: ["tier 1", "tier 2"],
        fields: { investmentbased: { "tier 1": ["investeeRevenue"], "tier 2": ["investeeScope1Emission", "investeeScope2Emission"] }, energybased: { "tier 1": ["investeeRevenue"], "tier 2": ["energyConsumption"] } }
      }
    }
  };

  // Lifecycle updates
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSelectedCategory("");
    setSelectedActivity("");
  }, [selectedScope]);

  useEffect(() => {
    setSelectedActivity("");
  }, [selectedCategory]);

  const requiresScope12Data = () => {
    const fields = getCurrentFields();
    return fields.includes('BuildingTotalS1_S2');
  };

  const fetchScope12Total = async () => {
    if (!clientId) {
      setScope12Error('Client ID required');
      log('❌ Client ID is required for baseline sync', 'err');
      return;
    }
    setScope12Loading(true);
    setScope12Error(null);
    log(`🔄 Fetching baseline sync for: ${clientId}`, 'info');
    try {
      const fetchUrl = `${baseUrl}/clients/${encodeURIComponent(clientId)}/scope12-total`;
      const response = await fetch(fetchUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);
      if (result.success && result.data) {
        setScope12Data(result.data);
        setScope12LastFetch(new Date());
        log(`✅ Baseline Synchronized: ${result.data.scope12TotalCO2e} tCO₂e`, 'ok');
      } else throw new Error('Invalid response');
    } catch (error) {
      setScope12Error(error.message);
      log(`❌ Sync failed: ${error.message}`, 'err');
    } finally { setScope12Loading(false); }
  };

  const rand = (min, max, decimals = 2) => {
    const value = Math.random() * (max - min) + min;
    return +value.toFixed(decimals);
  };

  const getFieldValue = (fieldName) => {
    if (simMode === "controlled") return +distributions.valuePerInterval.toFixed(4);
    if (fieldName === 'BuildingTotalS1_S2' && scope12Data) return scope12Data.scope12TotalCO2e;
    return rand(1, 48, 2);
  };

  const getCurrentFields = () => {
    if (!selectedScope || !selectedCategory) return [];
    const categoryConfig = scopeConfig[selectedScope][selectedCategory];
    if (!categoryConfig) return [];
    if (categoryConfig.activities && categoryConfig.activities.length > 0) {
      if (!selectedActivity) return [];
      return categoryConfig.fields[selectedActivity]?.[selectedTier] || [];
    }
    return categoryConfig.fields[selectedTier] || [];
  };

  const buildPayload = () => {
    const now = new Date();
    return {
      dataValues: getCurrentFields().reduce((acc, field) => {
        const isLast = sendsCompleted === distributions.totalIntervals - 1;
        if (simMode === "controlled" && isLast) {
          const accumulated = distributions.valuePerInterval * (distributions.totalIntervals - 1);
          acc[field] = +(totalValue - accumulated).toFixed(4);
        } else {
          acc[field] = getFieldValue(field);
        }
        return acc;
      }, {}),
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB", { hour12: false }),
      timestamp: now.toISOString()
    };
  };

  const log = (msg, type = "info") => {
    if (!logRef.current) return;
    const t = new Date().toLocaleTimeString();
    const line = document.createElement("div");
    line.style.borderBottom = "1px solid #E6E8E3";
    line.style.padding = "4px 0";
    line.style.color = type === "ok" ? "#10B981" : type === "err" ? "#EF4444" : type === "warn" ? "#F59E0B" : "#0E1512";
    line.textContent = `[${t}] ${msg}`;
    logRef.current.prepend(line);
    while (logRef.current.childNodes.length > 500) logRef.current.removeChild(logRef.current.lastChild);
  };

  const sendOnce = async () => {
    if (!baseUrl || !clientId || !nodeId || !scopeId) {
       log("Missing configuration fields", "err");
       return;
    }
    const url = `${baseUrl}/clients/${clientId}/nodes/${nodeId}/scopes/${scopeId}/${apiKey}/api-data`;
    if (simMode === "controlled" && sendsCompleted >= distributions.totalIntervals) {
      log("🎉 Cycle completed", "ok");
      stopAuto();
      return;
    }
    if (!selectedScope || !selectedCategory) { log("Selection incomplete", "err"); return; }
    const fields = getCurrentFields();
    if (fields.length === 0) { log("No schema defined", "err"); return; }
    if (fields.includes('BuildingTotalS1_S2') && !scope12Data) { log("Baseline sync required", "warn"); return; }
    
    const payload = buildPayload();
    try {
      log(`POST → ${url.split('/').pop()}`, "info");
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setLastHttp(res.status);
      setTotalSent(prev => prev + 1);
      if (res.ok) {
        setSuccess(prev => prev + 1);
        if (simMode === "controlled") setSendsCompleted(prev => prev + 1);
        log(`✓ Transmission Success`, "ok");
      } else { log(`✖ ${res.status}`, "err"); }
    } catch (e) { setLastHttp("ERR"); log(`✖ Network Fail`, "err"); }
  };

  const startAuto = () => {
    if (timerRef.current) return;
    const ms = (simMode === "controlled" && targetFrequency === "Minutes") 
      ? Math.max(1000, parseInt(minuteInterval) * 60 * 1000)
      : Math.max(300, parseInt(intervalMs || 5000, 10));
    setStatus("RUNNING");
    log(`Broadcaster launched @ ${ms}ms`, "ok");
    timerRef.current = setInterval(sendOnce, ms);
  };

  const stopAuto = () => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
    setStatus("STOPPED");
    log("Broadcaster terminated", "warn");
  };

  const resetControlled = () => { setSendsCompleted(0); log("Cycle reset", "info"); };
  const clearLog = () => { if (logRef.current) logRef.current.innerHTML = ""; };

  // Breakpoints
  const isMobile = windowWidth <= 768;

  const getAvailableCategories = () => Object.keys(scopeConfig[selectedScope] || {});
  const getAvailableActivities = () => scopeConfig[selectedScope]?.[selectedCategory]?.activities || [];
  const getAvailableTiers = () => scopeConfig[selectedScope]?.[selectedCategory]?.tiers || [];
  const hasActivityField = () => {
    const config = scopeConfig[selectedScope]?.[selectedCategory];
    return config?.activities && config.activities.length > 0;
  };

  // GreOn IQ Design System
  const styles = {
    wrap: {
      width: "100%",
      minHeight: "100vh",
      background: "#F4F5F2",
      color: "#0E1512",
      fontFamily: "'Inter', sans-serif",
      padding: isMobile ? "24px 16px" : "40px 60px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    pageShell: {
      width: "100%",
      maxWidth: "1200px",
    },
    header: {
      borderBottom: "1px solid #E6E8E3",
      paddingBottom: "40px",
      marginBottom: "40px"
    },
    brand: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#34D399",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      marginBottom: "12px"
    },
    title: {
      fontSize: isMobile ? "36px" : "56px",
      fontFamily: "'Instrument Serif', serif",
      color: "#0E1512",
      margin: 0,
      fontWeight: 400,
      lineHeight: 1.1
    },
    italic: { fontStyle: "italic" },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
      gap: "48px",
      alignItems: "start"
    },
    card: {
      background: "#FFFFFF",
      borderRadius: "16px",
      border: "1px solid #E6E8E3",
      padding: isMobile ? "24px" : "32px",
      marginBottom: "32px",
      boxShadow: "0 2px 10px rgba(14,21,18,0.02)"
    },
    sectionHeading: {
      fontFamily: "'Instrument Serif', serif",
      fontSize: "24px",
      marginBottom: "24px",
      color: "#0E1512",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    label: {
      fontSize: "11px",
      fontWeight: 600,
      color: "#6B7280",
      textTransform: "uppercase",
      marginBottom: "8px",
      display: "block"
    },
    input: {
      width: "100%",
      background: "#F9FAF9",
      border: "1px solid #E6E8E3",
      borderRadius: "10px",
      padding: "14px 16px",
      fontSize: "14px",
      fontFamily: "'Inter', sans-serif",
      color: "#0E1512",
      outline: "none",
      boxSizing: "border-box",
      marginBottom: "20px",
      transition: "border-color 0.2s"
    },
    select: {
      width: "100%",
      background: "#F9FAF9",
      border: "1px solid #E6E8E3",
      borderRadius: "10px",
      padding: "14px 16px",
      fontSize: "14px",
      fontFamily: "'Inter', sans-serif",
      color: "#0E1512",
      cursor: "pointer",
      marginBottom: "20px"
    },
    btnBlack: {
      background: "#0E1512",
      color: "#FFFFFF",
      borderRadius: "100px",
      padding: "14px 28px",
      fontSize: "13px",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      transition: "transform 0.1s"
    },
    btnMint: {
      background: "#34D399",
      color: "#0E1512",
      borderRadius: "100px",
      padding: "14px 28px",
      fontSize: "13px",
      fontWeight: 600,
      border: "none",
      cursor: "pointer"
    },
    btnOutline: {
      background: "transparent",
      border: "1px solid #E6E8E3",
      borderRadius: "100px",
      padding: "14px 28px",
      fontSize: "13px",
      fontWeight: 600,
      color: "#0E1512",
      cursor: "pointer"
    },
    summaryBox: {
      background: "#E7FBF2",
      borderRadius: "16px",
      padding: "24px",
      marginTop: "12px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px"
    },
    summaryItem: {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    },
    summaryLabel: { fontSize: "10px", fontWeight: 600, color: "#10B981", textTransform: "uppercase" },
    summaryValue: { fontSize: "20px", fontWeight: 500, color: "#0E1512", fontFamily: "'Instrument Serif', serif" },
    console: {
      background: "#FFFFFF",
      border: "1px solid #E6E8E3",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      height: "640px",
      overflow: "hidden",
      position: isMobile ? "static" : "sticky",
      top: "40px"
    },
    consoleHeader: {
      padding: "20px",
      borderBottom: "1px solid #E6E8E3",
      fontSize: "14px",
      fontWeight: 600,
      color: "#0E1512"
    },
    consoleLog: {
      flex: 1,
      padding: "20px",
      overflow: "auto",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "11px",
      lineHeight: 1.6,
      background: "#F9FAF9"
    },
    urlPreview: {
      fontSize: "10px",
      color: "#6B7280",
      fontFamily: "'JetBrains Mono', monospace",
      marginTop: "12px",
      wordBreak: "break-all",
      padding: "12px",
      background: "#F9FAF9",
      borderRadius: "8px",
      border: "1px solid #E6E8E3"
    },
    flexRow: {
      display: "flex",
      gap: "16px",
      width: "100%",
      flexWrap: isMobile ? "wrap" : "nowrap"
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.pageShell}>
        <nav style={{ marginBottom: "32px" }}>
           <button 
             onClick={() => navigate("/simulator")}
             style={{
               background: "transparent",
               border: "none",
               color: "#6B7280",
               fontSize: "14px",
               fontWeight: 500,
               cursor: "pointer",
               display: "flex",
               alignItems: "center",
               gap: "8px",
               padding: 0
             }}
           >
             ← Back to Simulator Matrix
           </button>
        </nav>
        <header style={styles.header}>
          <div style={styles.brand}>GreOn IQ System</div>
          <h1 style={styles.title}>
            IoT Data <span style={styles.italic}>Simulator</span>
          </h1>
        </header>

        <div style={styles.grid}>
          <div className="mainControl">
            {/* Engine Modes */}
            <div style={styles.card}>
              <div style={styles.sectionHeading}>◯ Calibration Mode</div>
              <div style={styles.flexRow}>
                <button 
                  style={{...styles.btnOutline, flex: 1, background: simMode === "random" ? "#0E1512" : "transparent", color: simMode === "random" ? "#FFF" : "#0E1512"}}
                  onClick={() => setSimMode("random")}
                >
                  Stochastic Random
                </button>
                <button 
                  style={{...styles.btnOutline, flex: 1, background: simMode === "controlled" ? "#34D399" : "transparent", borderColor: simMode === "controlled" ? "#34D399" : "#E6E8E3"}}
                  onClick={() => setSimMode("controlled")}
                >
                  Linear Distribution
                </button>
              </div>
            </div>

            {/* Distribution Controls */}
            {simMode === "controlled" && (
              <div style={{...styles.card, background: "#E7FBF2", border: "none"}}>
                <div style={styles.sectionHeading}>◜ Parameter Allocation</div>
                <div style={styles.grid}>
                   <div>
                      <label style={styles.label}>Quantity Pool</label>
                      <input style={styles.input} type="number" value={totalValue} onChange={(e) => setTotalValue(parseFloat(e.target.value))} />
                   </div>
                   <div>
                      <label style={styles.label}>Source Period</label>
                      <select style={styles.select} value={sourcePeriod} onChange={(e) => setSourcePeriod(e.target.value)}>
                        <option value="Yearly">Yearly Base</option>
                        <option value="Half-yearly">H1/H2 Base</option>
                        <option value="Quarterly">Qtr Base</option>
                        <option value="Monthly">Monthly Base</option>
                      </select>
                   </div>
                </div>
                <div style={styles.grid}>
                   <div>
                      <label style={styles.label}>Target Granularity</label>
                      <select style={styles.select} value={targetFrequency} onChange={(e) => setTargetFrequency(e.target.value)}>
                        <option value="Monthly">Monthly Packets</option>
                        <option value="Daily">Daily Packets</option>
                        <option value="Hourly">Hourly Packets</option>
                        <option value="Minutes">Minute Packets</option>
                      </select>
                   </div>
                   {targetFrequency === "Minutes" && (
                     <div>
                        <label style={styles.label}>Minute Step</label>
                        <input style={styles.input} type="number" value={minuteInterval} onChange={(e) => setMinuteInterval(e.target.value)} />
                     </div>
                   )}
                </div>
                <div style={styles.summaryBox}>
                   <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>VPD Protocol</span>
                      <span style={styles.summaryValue}>{distributions.valuePerInterval.toFixed(4)}</span>
                   </div>
                   <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>Total Nodes</span>
                      <span style={styles.summaryValue}>{sendsCompleted} / {distributions.totalIntervals}</span>
                   </div>
                </div>
                {sendsCompleted > 0 && <button style={{...styles.btnBlack, width: "100%", marginTop: "16px"}} onClick={resetControlled}>Reset Cycle</button>}
              </div>
            )}

            {/* Selection */}
            <div style={styles.card}>
              <div style={styles.sectionHeading}>◟ Emission Taxonomy</div>
              <div style={styles.grid}>
                <div>
                  <label style={styles.label}>Selected Scope</label>
                  <select style={styles.select} value={selectedScope} onChange={(e) => setSelectedScope(e.target.value)}>
                    <option value="Scope 1">Scope 1</option>
                    <option value="Scope 2">Scope 2</option>
                    <option value="Scope 3">Scope 3</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Taxonomy Category</label>
                  <select style={styles.select} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {getAvailableCategories().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.grid}>
                 {hasActivityField() && (
                  <div>
                    <label style={styles.label}>Sub-Activity</label>
                    <select style={styles.select} value={selectedActivity} onChange={(e) => setSelectedActivity(e.target.value)}>
                      <option value="">Select Activity</option>
                      {getAvailableActivities().map(act => <option key={act} value={act}>{act}</option>)}
                    </select>
                  </div>
                 )}
                 <div>
                    <label style={styles.label}>Tier Level</label>
                    <select style={styles.select} value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
                      {getAvailableTiers().map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                 </div>
              </div>
              {currentFields.length > 0 && (
                <div style={{...styles.urlPreview, background: "#FFFFFF", color: "#34D399", fontWeight: 600}}>
                  Active Schema: {currentFields.join(' · ')}
                </div>
              )}
            </div>

            {/* Baseline Sync */}
            {needsScope12 && (
              <div style={{...styles.card, border: "2px solid #E6E8E3", background: "#F9FAF9"}}>
                <div style={styles.sectionHeading}>⊷ Baseline Synchronisation</div>
                <label style={styles.label}>Client Reference</label>
                <input style={styles.input} value={clientId} onChange={(e) => setClientId(e.target.value)} />
                <button style={styles.btnMint} onClick={fetchScope12Total} disabled={scope12Loading || !clientId}>
                  {scope12Loading ? "Synchronising..." : "Sync Baseline"}
                </button>
                {scope12Data && <div style={{marginTop: "12px", fontSize: "12px", color: "#10B981"}}>✓ Sync Confirmed: {scope12Data.scope12TotalCO2e} tCO₂e</div>}
              </div>
            )}

            {/* Config */}
            <div style={styles.card}>
              <div style={styles.sectionHeading}>⇥ Gateway Configuration</div>
              <label style={styles.label}>Root API Endpoint</label>
              <input style={styles.input} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
              <div style={styles.grid}>
                <div>
                   <label style={styles.label}>Node Serial</label>
                   <input style={styles.input} value={nodeId} onChange={(e) => setNodeId(e.target.value)} />
                </div>
                <div>
                   <label style={styles.label}>API Credential</label>
                   <input style={styles.input} type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                </div>
              </div>
              <label style={styles.label}>Cycle Interval (MS)</label>
              <input style={styles.input} type="number" value={intervalMs} onChange={(e) => setIntervalMs(e.target.value)} />
              <div style={styles.urlPreview}>
                Live Route: {`${baseUrl}/clients/${clientId || "•"}/nodes/${nodeId || "•"}/scopes/${scopeId || "•"}/${apiKey || "•"}/api-data`}
              </div>
            </div>

            {/* Final Actions */}
            <div style={{...styles.flexRow, gap: "20px", paddingBottom: "60px"}}>
               <button style={{...styles.btnBlack, flex: 1}} onClick={sendOnce}>Send Single Vector</button>
               <button 
                  style={{...styles.btnMint, flex: 1.5, background: status === "RUNNING" ? "#0E1512" : "#34D399", color: status === "RUNNING" ? "#FFF" : "#0E1512"}} 
                  onClick={status === "RUNNING" ? stopAuto : startAuto}
               >
                  {status === "RUNNING" ? "Shutdown Carrier" : "Execute Continuous Stream"}
               </button>
               <button style={{...styles.btnOutline, flex: 1}} onClick={clearLog}>Flush Board</button>
            </div>
          </div>

          {/* Console */}
          <div className="sidePanel">
             <div style={styles.console}>
                <div style={styles.consoleHeader}>Active Activity Log</div>
                <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid #E6E8E3" }}>
                   <div style={{ textAlign: "center" }}>
                      <div style={styles.summaryLabel}>Success</div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#10B981" }}>{totalSent > 0 ? Math.round((success/totalSent)*100) : 0}%</div>
                   </div>
                   <div style={{ textAlign: "center" }}>
                      <div style={styles.summaryLabel}>Response</div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: lastHttp === 200 ? "#10B981" : "#EF4444" }}>{lastHttp}</div>
                   </div>
                </div>
                <div style={styles.consoleLog} ref={logRef} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDataSimulator;