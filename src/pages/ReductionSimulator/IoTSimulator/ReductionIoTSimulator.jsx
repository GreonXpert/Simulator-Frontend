import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ReductionIoTSimulator = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // ── Gateway config ───────────────────────────────────────────────────────────
  // baseUrl is the SERVER ADDRESS only (e.g. http://localhost:5000)
  // The /api/net-reduction path is always appended in code — do NOT include it here
  const [baseUrl, setBaseUrl] = useState("http://localhost:5000");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [calculationMethodology, setCalculationMethodology] = useState("methodology1");
  const [apiKey, setApiKey] = useState("");
  const [deviceId, setDeviceId] = useState("");

  // ── Broadcaster state ────────────────────────────────────────────────────────
  const [intervalMs, setIntervalMs] = useState(5000);
  const [status, setStatus] = useState("STOPPED");
  const [totalSent, setTotalSent] = useState(0);
  const [success, setSuccess] = useState(0);
  const [lastHttp, setLastHttp] = useState("—");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ── M1: mode + distribution + random ────────────────────────────────────────
  const [m1Mode, setM1Mode] = useState("random"); // "random" | "distribution"
  const [randomMin, setRandomMin] = useState(50);
  const [randomMax, setRandomMax] = useState(500);
  const [totalValue, setTotalValue] = useState(1000);
  const [sourcePeriod, setSourcePeriod] = useState("Yearly");
  const [targetFrequency, setTargetFrequency] = useState("Monthly");
  const [minuteInterval, setMinuteInterval] = useState(1);
  const [sendsCompleted, setSendsCompleted] = useState(0);

  // ── M2: formula variables ────────────────────────────────────────────────────
  const [formulaExpr, setFormulaExpr] = useState("");
  const [m2Vars, setM2Vars] = useState([{ key: "", value: "" }]);

  // ── M3: B/P/L entries ───────────────────────────────────────────────────────
  const [m3Entries, setM3Entries] = useState([{ itemId: "B1", varName: "", varValue: "" }]);

  // ── Template persistence ─────────────────────────────────────────────────────
  const [templateSaved, setTemplateSaved] = useState(false);


  // ── Distribution computation (M1 distribution mode only) ────────────────────
  const distributions = React.useMemo(() => {
    const durations = {
      Daily: 24 * 60, Monthly: 30 * 24 * 60,
      Quarterly: 91.25 * 24 * 60, "Half-yearly": 182.5 * 24 * 60,
      Yearly: 365 * 24 * 60
    };
    const targetDurations = {
      Monthly: 30 * 24 * 60, Daily: 24 * 60,
      Hourly: 60, Minutes: parseInt(minuteInterval) || 1
    };
    const sourceMins = durations[sourcePeriod] || durations.Yearly;
    const targetMins = targetDurations[targetFrequency] || targetDurations.Monthly;
    const totalIntervals = Math.max(1, Math.floor(sourceMins / targetMins));
    const valuePerInterval = totalValue / totalIntervals;
    return { totalIntervals, valuePerInterval };
  }, [totalValue, sourcePeriod, targetFrequency, minuteInterval]);

  const logRef = useRef(null);
  const timerRef = useRef(null);

  // ── Live ref — always holds latest state so interval callback never goes stale ──
  const liveRef = useRef({});
  liveRef.current = {
    baseUrl, clientId, projectId, calculationMethodology, apiKey, deviceId,
    intervalMs, targetFrequency, minuteInterval,
    m1Mode, randomMin, randomMax, totalValue, sendsCompleted, distributions,
    m2Vars, m3Entries
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSendsCompleted(0);
    setApiKey("");
    setTemplateSaved(false);
    setFormulaExpr("");
  }, [calculationMethodology]);

  // ── Load saved template when project + methodology is selected ───────────────
  useEffect(() => {
    if (!clientId || !projectId) return;
    setTemplateSaved(false);
    if (calculationMethodology === "methodology3") {
      const saved = localStorage.getItem(`zc-m3-tpl-${clientId}-${projectId}`);
      if (saved) {
        try {
          const rows = JSON.parse(saved);
          if (Array.isArray(rows) && rows.length > 0) {
            setM3Entries(rows.map(r => ({ itemId: r.itemId, varName: r.varName, varValue: "" })));
            setTemplateSaved(true);
          }
        } catch {}
      }
    }
    if (calculationMethodology === "methodology2") {
      const saved = localStorage.getItem(`zc-m2-tpl-${clientId}-${projectId}`);
      if (saved) {
        try {
          const tpl = JSON.parse(saved);
          if (tpl.formulaExpr) setFormulaExpr(tpl.formulaExpr);
          if (Array.isArray(tpl.vars) && tpl.vars.length > 0) {
            setM2Vars(tpl.vars.map(k => ({ key: k, value: "" })));
            setTemplateSaved(true);
          }
        } catch {}
      }
    }
  }, [clientId, projectId, calculationMethodology]);

  // ── Parse formula expression → extract variable names ────────────────────────
  const parseFormulaExpr = () => {
    if (!formulaExpr.trim()) return;
    const mathKeywords = new Set(['sin','cos','tan','log','exp','sqrt','abs','min','max','pow','PI','E']);
    const matches = formulaExpr.match(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g) || [];
    const names = [...new Set(matches.filter(n => !mathKeywords.has(n)))];
    if (names.length === 0) return;
    setM2Vars(names.map(n => ({ key: n, value: "" })));
  };

  // ── Payload builders ─────────────────────────────────────────────────────────
  const buildPayload = () => {
    const L = liveRef.current;
    const now = new Date();
    const base = {
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB", { hour12: false }),
      timestamp: now.toISOString(),
      deviceId: L.deviceId.trim()
    };

    if (L.calculationMethodology === "methodology1") {
      let value;
      if (L.m1Mode === "random") {
        const lo = parseFloat(L.randomMin) || 0;
        const hi = parseFloat(L.randomMax) || lo + 1;
        value = +(lo + Math.random() * (hi - lo)).toFixed(4);
      } else {
        const isLast = L.sendsCompleted === L.distributions.totalIntervals - 1;
        if (isLast) {
          const accumulated = L.distributions.valuePerInterval * (L.distributions.totalIntervals - 1);
          value = +(L.totalValue - accumulated).toFixed(4);
        } else {
          value = +L.distributions.valuePerInterval.toFixed(4);
        }
      }
      return { ...base, value };
    }

    if (L.calculationMethodology === "methodology2") {
      const variables = {};
      L.m2Vars.forEach(({ key, value }) => {
        if (key.trim()) variables[key.trim()] = Number(value) || 0;
      });
      return { ...base, variables };
    }

    if (L.calculationMethodology === "methodology3") {
      const entry = {};
      L.m3Entries.forEach(({ itemId, varName, varValue }) => {
        if (itemId.trim() && varName.trim()) {
          if (!entry[itemId.trim()]) entry[itemId.trim()] = {};
          entry[itemId.trim()][varName.trim()] = Number(varValue) || 0;
        }
      });
      return { ...base, entry };
    }

    return base;
  };

  // ── Log helper ───────────────────────────────────────────────────────────────
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

  // ── Send ─────────────────────────────────────────────────────────────────────
  const sendOnce = async () => {
    // Always read from liveRef.current to avoid stale closure in interval
    const L = liveRef.current;

    if (!L.baseUrl || !L.clientId || !L.projectId || !L.calculationMethodology) {
      log("Configuration incomplete — fill all gateway fields", "err"); return;
    }
    if (!L.apiKey) {
      log("❌ NET_IOT key required — enter key in IoT Credential", "err"); return;
    }
    if (!L.deviceId.trim()) {
      log("❌ Device ID required — enter the physical device identifier", "err"); return;
    }

    // Build URL: serverAddress + fixed /api/net-reduction/ prefix + path params
    const url = `${L.baseUrl}/api/net-reduction/${L.clientId}/${L.projectId}/${L.calculationMethodology}/iot`;

    if (L.calculationMethodology === "methodology1" && L.m1Mode === "distribution"
        && L.sendsCompleted >= L.distributions.totalIntervals) {
      log("🎉 Cycle complete", "ok"); stopAuto(); return;
    }

    if (L.calculationMethodology === "methodology2") {
      const hasVars = L.m2Vars.some(v => v.key.trim());
      if (!hasVars) { log("Schema required — add at least one variable", "err"); return; }
    }

    if (L.calculationMethodology === "methodology3") {
      const hasEntries = L.m3Entries.some(e => e.itemId.trim() && e.varName.trim());
      if (!hasEntries) { log("Schema required — add at least one B/P/L entry", "err"); return; }
    }

    const payload = buildPayload();

    try {
      log(`POST → IoT [${L.calculationMethodology}]`, "info");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": L.apiKey },
        body: JSON.stringify(payload)
      });
      setLastHttp(res.status);
      setTotalSent(prev => prev + 1);
      if (res.ok) {
        setSuccess(prev => prev + 1);
        if (L.calculationMethodology === "methodology1" && L.m1Mode === "distribution") {
          setSendsCompleted(prev => prev + 1);
        }
        // Save project template so fields auto-load next time
        if (L.calculationMethodology === "methodology3" && L.clientId && L.projectId) {
          const tpl = L.m3Entries.filter(e => e.itemId.trim() && e.varName.trim())
            .map(e => ({ itemId: e.itemId.trim(), varName: e.varName.trim() }));
          if (tpl.length) {
            localStorage.setItem(`zc-m3-tpl-${L.clientId}-${L.projectId}`, JSON.stringify(tpl));
            setTemplateSaved(true);
          }
        }
        if (L.calculationMethodology === "methodology2" && L.clientId && L.projectId) {
          const varNames = L.m2Vars.filter(v => v.key.trim()).map(v => v.key.trim());
          if (varNames.length) {
            localStorage.setItem(`zc-m2-tpl-${L.clientId}-${L.projectId}`, JSON.stringify({ formulaExpr: formulaExpr, vars: varNames }));
            setTemplateSaved(true);
          }
        }
        if (res.status === 202) {
          log(`⚠ Anomaly flagged — entry held for consultant_admin approval (202)`, "warn");
        } else {
          log(`✓ Net Reduction saved via IoT`, "ok");
        }
      } else {
        const errBody = await res.json().catch(() => ({}));
        log(`✖ ${res.status}${errBody.message ? ' — ' + errBody.message : ''}`, "err");
      }
    } catch { setLastHttp("ERR"); log(`✖ Network Fail — check server address`, "err"); }
  };

  const startAuto = () => {
    if (timerRef.current) return;
    const L = liveRef.current;
    const ms = L.targetFrequency === "Minutes"
      ? Math.max(1000, parseInt(L.minuteInterval) * 60 * 1000)
      : Math.max(300, parseInt(L.intervalMs || 5000, 10));
    setStatus("RUNNING");
    log(`IoT Stream Active @ ${ms}ms`, "ok");
    timerRef.current = setInterval(sendOnce, ms);
  };

  const stopAuto = () => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
    setStatus("STOPPED");
    log("IoT Stream halted", "warn");
  };

  const resetControlled = () => { setSendsCompleted(0); log("Cycle reset", "info"); };
  const clearLog = () => { if (logRef.current) logRef.current.innerHTML = ""; };

  // ── M2 helpers ───────────────────────────────────────────────────────────────
  const addM2Var = () => setM2Vars(prev => [...prev, { key: "", value: "" }]);
  const removeM2Var = (i) => setM2Vars(prev => prev.filter((_, idx) => idx !== i));
  const updateM2Var = (i, field, val) =>
    setM2Vars(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));

  // ── M3 helpers ───────────────────────────────────────────────────────────────
  const addM3Entry = () => setM3Entries(prev => [...prev, { itemId: "", varName: "", varValue: "" }]);
  const removeM3Entry = (i) => setM3Entries(prev => prev.filter((_, idx) => idx !== i));
  const updateM3Entry = (i, field, val) =>
    setM3Entries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const isMobile = windowWidth <= 768;

  // ── Styles ───────────────────────────────────────────────────────────────────
  const styles = {
    wrap: { width: "100%", minHeight: "100vh", background: "#F4F5F2", color: "#0E1512", fontFamily: "'Inter', sans-serif", padding: isMobile ? "24px 16px" : "40px 60px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" },
    pageShell: { width: "100%" },
    header: { borderBottom: "1px solid #E6E8E3", paddingBottom: "40px", marginBottom: "40px" },
    brand: { fontSize: "12px", fontWeight: 600, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" },
    title: { fontSize: isMobile ? "36px" : "56px", fontFamily: "'Instrument Serif', serif", color: "#0E1512", margin: 0, fontWeight: 400, lineHeight: 1.1 },
    italic: { fontStyle: "italic" },
    grid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 420px", gap: "32px", alignItems: "start" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" },
    card: { background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E6E8E3", padding: isMobile ? "24px" : "32px", marginBottom: "32px", boxShadow: "0 2px 10px rgba(14,21,18,0.02)" },
    sectionHeading: { fontFamily: "'Instrument Serif', serif", fontSize: "24px", marginBottom: "24px", color: "#0E1512", display: "flex", alignItems: "center", gap: "10px" },
    label: { fontSize: "11px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", marginBottom: "8px", display: "block" },
    input: { width: "100%", background: "#F9FAF9", border: "1px solid #E6E8E3", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", fontFamily: "'Inter', sans-serif", color: "#0E1512", outline: "none", boxSizing: "border-box", marginBottom: "20px" },
    inputSm: { width: "100%", background: "#F9FAF9", border: "1px solid #E6E8E3", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", fontFamily: "'Inter', sans-serif", color: "#0E1512", outline: "none", boxSizing: "border-box" },
    select: { width: "100%", background: "#F9FAF9", border: "1px solid #E6E8E3", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", fontFamily: "'Inter', sans-serif", color: "#0E1512", cursor: "pointer", marginBottom: "20px" },
    btnBlack: { background: "#0E1512", color: "#FFFFFF", borderRadius: "100px", padding: "14px 28px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" },
    btnMint: { background: "#34D399", color: "#0E1512", borderRadius: "100px", padding: "14px 28px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" },
    btnOutline: { background: "transparent", border: "1px solid #E6E8E3", borderRadius: "100px", padding: "14px 28px", fontSize: "13px", fontWeight: 600, color: "#0E1512", cursor: "pointer" },
    btnSmall: { background: "transparent", border: "1px solid #E6E8E3", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#6B7280", cursor: "pointer" },
    btnAdd: { background: "#E7FBF2", border: "1px solid #34D399", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, color: "#0E1512", cursor: "pointer", marginTop: "12px" },
    summaryBox: { background: "#E7FBF2", borderRadius: "16px", padding: "24px", marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
    summaryItem: { display: "flex", flexDirection: "column", gap: "4px" },
    summaryLabel: { fontSize: "10px", fontWeight: 600, color: "#10B981", textTransform: "uppercase" },
    summaryValue: { fontSize: "20px", fontWeight: 500, color: "#0E1512", fontFamily: "'Instrument Serif', serif" },
    console: { background: "#FFFFFF", border: "1px solid #E6E8E3", borderRadius: "16px", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", overflow: "hidden", position: isMobile ? "static" : "sticky", top: "40px" },
    sidePanelCol: { alignSelf: "stretch" },
    consoleHeader: { padding: "20px", borderBottom: "1px solid #E6E8E3", fontSize: "14px", fontWeight: 600, color: "#0E1512" },
    consoleLog: { flex: 1, padding: "20px", overflow: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", lineHeight: 1.6, background: "#F9FAF9" },
    urlPreview: { fontSize: "10px", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", marginTop: "12px", wordBreak: "break-all", padding: "12px", background: "#F9FAF9", borderRadius: "8px", border: "1px solid #E6E8E3" },
    flexRow: { display: "flex", gap: "16px", width: "100%", flexWrap: isMobile ? "wrap" : "nowrap" },
    badge: { display: "inline-block", background: "#E7FBF2", color: "#10B981", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 },
    modeBtnActive: { background: "#0E1512", color: "#FFF", border: "1px solid #0E1512", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
    modeBtnInactive: { background: "transparent", color: "#6B7280", border: "1px solid #E6E8E3", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
    fixedPath: { fontSize: "11px", color: "#34D399", fontFamily: "'JetBrains Mono', monospace", padding: "8px 12px", background: "#E7FBF2", borderRadius: "8px", marginBottom: "20px", wordBreak: "break-all" }
  };

  const builtUrl = `${baseUrl}/api/net-reduction/${clientId || "•"}/${projectId || "•"}/${calculationMethodology}/iot`;

  return (
    <div style={styles.wrap}>
      <div style={styles.pageShell}>

        {/* Nav */}
        <nav style={{ marginBottom: "32px" }}>
          <button
            onClick={() => navigate("/simulator", { state: { module: "reduction" } })}
            style={{ background: "transparent", border: "none", color: "#6B7280", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: 0 }}
          >
            ← Back to Reduction
          </button>
        </nav>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.brand}>GreOn IQ System · Reduction Module</div>
          <h1 style={styles.title}>IoT Data <span style={styles.italic}>Simulator</span></h1>
        </header>

        <div style={styles.grid}>
          <div className="mainControl">

            {/* ── GATEWAY CONFIGURATION ─────────────────────────────────── */}
            <div style={styles.card}>
              <div style={styles.sectionHeading}>⇥ Gateway Configuration</div>

              <label style={styles.label}>
                Server Address
                <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: "8px" }}>(domain only — do not include /api/net-reduction)</span>
              </label>
              <input style={styles.input} value={baseUrl} onChange={e => setBaseUrl(e.target.value.replace(/\/api\/net-reduction.*/i, "").replace(/\/$/, ""))} placeholder="http://localhost:5000" />

              <div style={styles.fixedPath}>
                Fixed path: /api/net-reduction/<span style={{ color: "#6B7280" }}>:clientId/:projectId/:methodology/iot</span>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Client Reference</label>
                  <input style={styles.input} value={clientId} onChange={e => setClientId(e.target.value)} placeholder="e.g. Greon001" />
                </div>
                <div>
                  <label style={styles.label}>Project ID</label>
                  <input style={styles.input} value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="e.g. Greon001-RED-Greon001-0001" />
                </div>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Calculation Methodology</label>
                  <select style={styles.select} value={calculationMethodology} onChange={e => setCalculationMethodology(e.target.value)}>
                    <option value="methodology1">Methodology 1 (ABD/APD rate)</option>
                    <option value="methodology2">Methodology 2 (Formula)</option>
                    <option value="methodology3">Methodology 3 (B/P/L items)</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>IoT Credential <span style={styles.badge}>NET_IOT key</span></label>
                  <input style={styles.input} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter NET_IOT key" />
                  <div style={{ fontSize: "10px", color: "#F59E0B", marginTop: "-14px", marginBottom: "20px", fontFamily: "'Inter', sans-serif" }}>
                    ⚠ Each methodology has its own dedicated key. Changing methodology clears this field.
                  </div>
                </div>
              </div>

              <label style={styles.label}>Device ID <span style={styles.badge}>Required</span></label>
              <input style={styles.input} value={deviceId} onChange={e => setDeviceId(e.target.value)} placeholder="e.g. SOLAR-METER-01" />

              <label style={styles.label}>Cycle Interval (MS)</label>
              <input style={styles.input} type="number" value={intervalMs} onChange={e => setIntervalMs(e.target.value)} />

              {/* URL Preview */}
              <div style={styles.urlPreview}>
                <div style={{ marginBottom: "6px", color: "#6B7280" }}>📡 Request Preview</div>
                <div>
                  <span style={{ color: "#34D399" }}>POST</span>{" "}{builtUrl}
                </div>
                <div style={{ marginTop: "8px", borderTop: "1px solid #E6E8E3", paddingTop: "8px" }}>
                  <div style={{ color: "#6B7280", marginBottom: "4px" }}>Headers sent with request:</div>
                  <div><span style={{ color: "#F59E0B" }}>Content-Type:</span> application/json</div>
                  <div>
                    <span style={{ color: "#F59E0B" }}>X-API-Key:</span>{" "}
                    <span style={{ color: apiKey ? "#34D399" : "#EF4444" }}>
                      {apiKey ? `${apiKey.substring(0, 8)}${"•".repeat(12)} (key hidden)` : "⚠ Not entered yet"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── M1: VALUE GENERATION ──────────────────────────────────── */}
            {calculationMethodology === "methodology1" && (
              <div style={{ ...styles.card, background: "#E7FBF2", border: "none" }}>
                <div style={styles.sectionHeading}>◜ Value Generation</div>

                {/* Mode toggle */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                  <button
                    style={m1Mode === "random" ? styles.modeBtnActive : styles.modeBtnInactive}
                    onClick={() => setM1Mode("random")}
                  >
                    Random Range
                  </button>
                  <button
                    style={m1Mode === "distribution" ? styles.modeBtnActive : styles.modeBtnInactive}
                    onClick={() => setM1Mode("distribution")}
                  >
                    Pool Distribution
                  </button>
                </div>

                {/* Random mode */}
                {m1Mode === "random" && (
                  <>
                    <div style={styles.grid2}>
                      <div>
                        <label style={styles.label}>Min Value</label>
                        <input style={styles.input} type="number" value={randomMin} onChange={e => setRandomMin(e.target.value)} />
                      </div>
                      <div>
                        <label style={styles.label}>Max Value</label>
                        <input style={styles.input} type="number" value={randomMax} onChange={e => setRandomMax(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ ...styles.urlPreview, background: "#FFFFFF", color: "#34D399", fontWeight: 600 }}>
                      Each packet: <span style={{ color: "#0E1512" }}>{"{ "}</span>
                      <span style={{ color: "#34D399" }}>"value"</span>: <span style={{ color: "#0E1512" }}>random({randomMin} – {randomMax})</span>
                      <span style={{ color: "#0E1512" }}>{`, "deviceId": "${deviceId || "..."}", "date": "...", "time": "..." }`}</span>
                    </div>
                  </>
                )}

                {/* Distribution mode */}
                {m1Mode === "distribution" && (
                  <>
                    <div style={styles.grid2}>
                      <div>
                        <label style={styles.label}>Quantity Pool</label>
                        <input style={styles.input} type="number" value={totalValue} onChange={e => setTotalValue(parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label style={styles.label}>Source Period</label>
                        <select style={styles.select} value={sourcePeriod} onChange={e => setSourcePeriod(e.target.value)}>
                          <option value="Yearly">Yearly Base</option>
                          <option value="Half-yearly">H1/H2 Base</option>
                          <option value="Quarterly">Qtr Base</option>
                          <option value="Monthly">Monthly Base</option>
                          <option value="Daily">Daily Base</option>
                        </select>
                      </div>
                    </div>
                    <div style={styles.grid2}>
                      <div>
                        <label style={styles.label}>Target Granularity</label>
                        <select style={styles.select} value={targetFrequency} onChange={e => setTargetFrequency(e.target.value)}>
                          <option value="Monthly">Monthly Packets</option>
                          <option value="Daily">Daily Packets</option>
                          <option value="Hourly">Hourly Packets</option>
                          <option value="Minutes">Minute Packets</option>
                        </select>
                      </div>
                      {targetFrequency === "Minutes" && (
                        <div>
                          <label style={styles.label}>Minute Step</label>
                          <input style={styles.input} type="number" value={minuteInterval} onChange={e => setMinuteInterval(e.target.value)} />
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
                    {sendsCompleted > 0 && (
                      <button style={{ ...styles.btnBlack, width: "100%", marginTop: "16px" }} onClick={resetControlled}>
                        Reset Cycle
                      </button>
                    )}
                    <div style={{ ...styles.urlPreview, marginTop: "16px", background: "#FFFFFF", color: "#34D399", fontWeight: 600 }}>
                      Payload: {`{ "value": ${distributions.valuePerInterval.toFixed(4)}, "deviceId": "${deviceId || "..."}", "date": "...", "time": "..." }`}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── M2: FORMULA VARIABLES ──────────────────────────────────── */}
            {calculationMethodology === "methodology2" && (
              <div style={styles.card}>
                <div style={styles.sectionHeading}>◞ Formula Variables</div>

                {templateSaved && (
                  <div style={{ fontSize: "12px", color: "#10B981", background: "#E7FBF2", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px" }}>
                    ✓ Variable fields loaded from saved project template
                  </div>
                )}

                {/* Formula expression parser */}
                <div style={{ background: "#F9FAF9", borderRadius: "12px", padding: "16px", marginBottom: "24px", border: "1px solid #E6E8E3" }}>
                  <label style={{ ...styles.label, marginBottom: "6px" }}>
                    Formula Expression <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: 400, textTransform: "none" }}>(paste to auto-populate variables)</span>
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      style={{ ...styles.inputSm, flex: 1, marginBottom: 0 }}
                      value={formulaExpr}
                      onChange={e => setFormulaExpr(e.target.value)}
                      placeholder="e.g.  NCV * EF_CO2 * OX * 0.001"
                    />
                    <button
                      style={{ ...styles.btnBlack, padding: "10px 20px", fontSize: "12px", whiteSpace: "nowrap", borderRadius: "10px" }}
                      onClick={parseFormulaExpr}
                    >
                      Parse Variables
                    </button>
                  </div>
                  {formulaExpr && (
                    <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "8px", fontFamily: "'JetBrains Mono', monospace" }}>
                      Expression: <span style={{ color: "#34D399" }}>{formulaExpr}</span>
                    </div>
                  )}
                </div>

                {m2Vars.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                    <input style={{ ...styles.inputSm, flex: 2 }} placeholder="Variable name (e.g. NCV)" value={v.key} onChange={e => updateM2Var(i, "key", e.target.value)} />
                    <input style={{ ...styles.inputSm, flex: 1 }} type="number" placeholder="Value" value={v.value} onChange={e => updateM2Var(i, "value", e.target.value)} />
                    {m2Vars.length > 1 && (
                      <button style={styles.btnSmall} onClick={() => removeM2Var(i)}>✕</button>
                    )}
                  </div>
                ))}
                <button style={styles.btnAdd} onClick={addM2Var}>+ Add Variable</button>

                <div style={{ ...styles.urlPreview, marginTop: "16px", background: "#FFFFFF", color: "#34D399", fontWeight: 600 }}>
                  Payload: {`{ "variables": { ${m2Vars.filter(v => v.key).map(v => `"${v.key}": ${Number(v.value)||0}`).join(", ")} }, "deviceId": "${deviceId || "..."}", "date": "...", "time": "..." }`}
                </div>
              </div>
            )}

            {/* ── M3: B/P/L ENTRIES ─────────────────────────────────────── */}
            {calculationMethodology === "methodology3" && (
              <div style={styles.card}>
                <div style={styles.sectionHeading}>◞ B / P / L Entry Schema</div>

                {templateSaved ? (
                  <div style={{ fontSize: "12px", color: "#10B981", background: "#E7FBF2", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px" }}>
                    ✓ Item fields loaded from saved project template — fill in values and send
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px", marginTop: 0 }}>
                    Enter each item ID (B1, P1, L1…) and variable name as configured in the project.
                    After the first successful send, these fields will auto-load next time.
                  </p>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 40px", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ ...styles.label, marginBottom: 0 }}>Item ID</span>
                  <span style={{ ...styles.label, marginBottom: 0 }}>Variable Name</span>
                  <span style={{ ...styles.label, marginBottom: 0 }}>Value</span>
                  <span />
                </div>
                {m3Entries.map((e, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 40px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <input style={styles.inputSm} placeholder="B1 / P1 / L1" value={e.itemId} onChange={ev => updateM3Entry(i, "itemId", ev.target.value)} />
                    <input style={styles.inputSm} placeholder="e.g. A" value={e.varName} onChange={ev => updateM3Entry(i, "varName", ev.target.value)} />
                    <input style={styles.inputSm} type="number" placeholder="0" value={e.varValue} onChange={ev => updateM3Entry(i, "varValue", ev.target.value)} />
                    {m3Entries.length > 1 && (
                      <button style={{ ...styles.btnSmall, padding: "6px 8px" }} onClick={() => removeM3Entry(i)}>✕</button>
                    )}
                  </div>
                ))}
                <button style={styles.btnAdd} onClick={addM3Entry}>+ Add Row</button>

                <div style={{ ...styles.urlPreview, marginTop: "16px", background: "#FFFFFF", color: "#34D399", fontWeight: 600, whiteSpace: "pre-wrap" }}>
                  {(() => {
                    const entry = {};
                    m3Entries.forEach(({ itemId, varName, varValue }) => {
                      if (itemId.trim() && varName.trim()) {
                        if (!entry[itemId.trim()]) entry[itemId.trim()] = {};
                        entry[itemId.trim()][varName.trim()] = Number(varValue) || 0;
                      }
                    });
                    return `Payload: ${JSON.stringify({ entry, deviceId: deviceId || "...", date: "...", time: "..." }, null, 2)}`;
                  })()}
                </div>
              </div>
            )}

            {/* ── ACTION BUTTONS ────────────────────────────────────────── */}
            <div style={{ ...styles.flexRow, gap: "20px", paddingBottom: "60px" }}>
              <button style={{ ...styles.btnBlack, flex: 1 }} onClick={sendOnce}>
                Send Single Vector
              </button>
              <button
                style={{ ...styles.btnMint, flex: 1.5, background: status === "RUNNING" ? "#0E1512" : "#34D399", color: status === "RUNNING" ? "#FFF" : "#0E1512" }}
                onClick={status === "RUNNING" ? stopAuto : startAuto}
              >
                {status === "RUNNING" ? "Shutdown Carrier" : "Execute Continuous Stream"}
              </button>
              <button style={{ ...styles.btnOutline, flex: 1 }} onClick={clearLog}>
                Flush Board
              </button>
            </div>
          </div>

          {/* ── CONSOLE ───────────────────────────────────────────────────── */}
          <div className="sidePanel" style={styles.sidePanelCol}>
            <div style={styles.console}>
              <div style={styles.consoleHeader}>Active Activity Log</div>
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid #E6E8E3" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={styles.summaryLabel}>Success</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#10B981" }}>
                    {totalSent > 0 ? Math.round((success / totalSent) * 100) : 0}%
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={styles.summaryLabel}>Response</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: lastHttp === 200 ? "#10B981" : lastHttp === 202 ? "#F59E0B" : "#EF4444" }}>
                    {lastHttp}
                  </div>
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

export default ReductionIoTSimulator;
