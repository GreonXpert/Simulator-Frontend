import React, { useState, useRef, useEffect } from "react";

const APIDataSimulator = () => {
  // State variables
  const [apiUrl, setApiUrl] = useState(
    "http://localhost:5000/api/data-collection/clients/:clientId/nodes/:nodeId/scopes/:scopeId/api-data"
  );
  const [token, setToken] = useState("");
  const [intervalMs, setIntervalMs] = useState(15000);
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

  // Date selection
  const [selectedDate, setSelectedDate] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);

  // Batch processing
  const [batchMode, setBatchMode] = useState(false);
  const [batchSize, setBatchSize] = useState(5);

  // Scope 1+2 API Integration
  const [clientId, setClientId] = useState("");
  const [scope12Data, setScope12Data] = useState(null);
  const [scope12Loading, setScope12Loading] = useState(false);
  const [scope12Error, setScope12Error] = useState(null);
  const [scope12LastFetch, setScope12LastFetch] = useState(null);

  // Refs
  const logRef = useRef(null);
  const timerRef = useRef(null);

  // FULLY CORRECTED configuration data
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
            "tier 1": ["nameplateCapacity"],
            "tier 2": ["decreaseInventory", "acquisitions", "disbursements", "netCapacityIncrease"]
          },
          "CH4-Leaks": {
            "tier 1": ["activityData"],
            "tier 2": ["numberOfComponents"]
          },
          Refrigeration: {
            "tier 1": ["numberOfUnits"],
            "tier 2": ["installedCapacity", "endYearCapacity", "purchases", "disposals"]
          },
          Generic: {
            "tier 1": ["numberOfUnits"],
            "tier 2": ["installedCapacity", "endYearCapacity", "purchases", "disposals"]
          }
        }
      },
      "Process Emission": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["productionOutput"],
          "tier 2": ["rawMaterialInput"]
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
            "tier 1": ["consumed_fuel"],
            "tier 2": ["consumed_fuel"]
          },
          "T&D losses": {
            "tier 1": ["electricityConsumption"],
            "tier 2": ["electricityConsumption"]
          }
        }
      },
      "Upstream Transport and Distribution": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["transportationSpend"],
          "tier 2": ["allocation", "distance"]
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
        activities: ["travelbased", "hotelbased"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          travelbased: {
            "tier 1": ["travelSpend"],
            "tier 2": ["numberOfPassengers", "distanceTravelled"]
          },
          hotelbased: {
            "tier 1": ["hotelNights"],
            "tier 2": ["hotelNights"]
          }
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
        activities: ["energybased", "areabased"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          energybased: {
            "tier 1": ["leasedArea"],
            "tier 2": ["energyConsumption"]
          },
          areabased: {
            "tier 1": ["leasedArea"],
            "tier 2": ["leasedArea", "totalArea", "BuildingTotalS1_S2"]
          }
        }
      },
      "Downstream Leased Assets": {
        activities: ["energybased", "areabased"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          energybased: {
            "tier 1": ["leasedArea"],
            "tier 2": ["energyConsumption"]
          },
          areabased: {
            "tier 1": ["leasedArea"],
            "tier 2": ["leasedArea", "totalArea", "BuildingTotalS1_S2"]
          }
        }
      },
      "Downstream Transport and Distribution": {
        activities: [],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "tier 1": ["transportSpend"],
          "tier 2": ["allocation", "distance"]
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
          "tier 1": ["productQuantity"],
          "tier 2": ["productQuantity"]
        }
      },
      "End-of-Life Treatment of Sold Products": {
        activities: ["Disposal", "Landfill", "Incineration"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          "Disposal": {
            "tier 1": ["massEol"],
            "tier 2": ["massEol"]
          },
          "Landfill": {
            "tier 1": ["massEol"],
            "tier 2": ["massEol"]
          },
          "Incineration": {
            "tier 1": ["massEol"],
            "tier 2": ["massEol"]
          }
        }
      },
      "Franchises": {
        activities: ["emissionbased", "energybased"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          emissionbased: {
            "tier 1": ["franchiseCount", "avgEmissionPerFranchise"],
            "tier 2": ["franchiseTotalS1Emission", "franchiseTotalS2Emission"]
          },
          energybased: {
            "tier 1": ["franchiseCount", "avgEmissionPerFranchise"],
            "tier 2": ["energyConsumption"]
          }
        }
      },
      "Investments": {
        activities: ["investmentbased", "energybased"],
        tiers: ["tier 1", "tier 2"],
        fields: {
          investmentbased: {
            "tier 1": ["investeeRevenue"],
            "tier 2": ["investeeScope1Emission", "investeeScope2Emission"]
          },
          energybased: {
            "tier 1": ["investeeRevenue"],
            "tier 2": ["energyConsumption"]
          }
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

  // Auto-detect clientId from API URL
  useEffect(() => {
    const urlPattern = /clients\/([^\/]+)/;
    const match = apiUrl.match(urlPattern);
    if (match && match[1] && match[1] !== ':clientId') {
      setClientId(match[1]);
      log(`Auto-detected clientId: ${match[1]}`, "info");
    }
  }, [apiUrl]);

  // Check if current config requires BuildingTotalS1_S2
  const requiresScope12Data = () => {
    const fields = getCurrentFields();
    return fields.includes('BuildingTotalS1_S2');
  };

  // Fetch Scope 1+2 Total from Backend
  const fetchScope12Total = async () => {
    if (!clientId || clientId === ':clientId') {
      setScope12Error('Please enter a valid Client ID');
      log('❌ Client ID is required to fetch Scope 1+2 data', 'err');
      return;
    }

    setScope12Loading(true);
    setScope12Error(null);
    log(`🔄 Fetching Scope 1+2 total for client: ${clientId}`, 'info');

    try {
      let baseUrl = 'http://localhost:5000';
      try {
        const urlObj = new URL(apiUrl);
        baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      } catch (e) {
        log('Using default base URL: http://localhost:5000', 'warn');
      }

      const fetchUrl = `${baseUrl}/api/summaries/${encodeURIComponent(clientId)}/scope12-total`;

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      if (result.success && result.data) {
        setScope12Data(result.data);
        setScope12LastFetch(new Date());
        log(`✅ Scope 1+2 fetched: ${result.data.scope12TotalCO2e} tCO₂e`, 'ok');
        log(`   Scope 1: ${result.data.scope1CO2e} | Scope 2: ${result.data.scope2CO2e}`, 'info');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMsg = `Failed to fetch Scope 1+2: ${error.message}`;
      setScope12Error(errorMsg);
      log(`❌ ${errorMsg}`, 'err');
    } finally {
      setScope12Loading(false);
    }
  };

  // Helper functions for generating random data - ALL VALUES UNDER 50
  const rand = (min, max, decimals = 2) => {
    const value = Math.random() * (max - min) + min;
    return +value.toFixed(decimals);
  };

  const getFieldValue = (fieldName) => {
    if (fieldName === 'BuildingTotalS1_S2' && scope12Data) {
      return scope12Data.scope12TotalCO2e;
    }

    // ⭐ ONLY CHANGE THE NUMBERS ON THESE EXISTING LINES ⭐
    if (/consumption|consumed|fuel/i.test(fieldName)) return rand(5, 45, 2);  // OLD: (10, 5000, 2)
    if (/electricity|kwh/i.test(fieldName)) return rand(10, 48, 2);  // OLD: (100, 50000, 2)
    if (/capacity|nameplate/i.test(fieldName)) return rand(8, 45, 2);  // OLD: (50, 10000, 2)
    if (/leakage|rate/i.test(fieldName)) return rand(0.5, 10, 3);  // OLD: (0.1, 50, 3)
    if (/mass|weight/i.test(fieldName)) return rand(5, 48, 2);  // OLD: (1, 10000, 2)
    if (/distance|km/i.test(fieldName)) return rand(5, 45, 2);  // OLD: (1, 5000, 2)
    if (/count|number|units/i.test(fieldName)) return rand(1, 48, 0);  // OLD: (1, 1000, 0)
    if (/spend|revenue/i.test(fieldName)) return rand(10, 49, 2);  // OLD: (1000, 1000000, 2)
    if (/percentage|pct/i.test(fieldName)) return rand(1, 45, 2);  // OLD: (0.1, 100, 2)
    if (/temperature|temp/i.test(fieldName)) return rand(10, 45, 1);  // OLD: (-20, 100, 1)
    if (/pressure/i.test(fieldName)) return rand(1, 45, 2);  // OLD: (0.5, 50, 2)
    if (/efficiency/i.test(fieldName)) return rand(0.5, 0.98, 3);  // OLD: (0.1, 1.0, 3)
    if (/days/i.test(fieldName)) return rand(200, 365, 0);  // NO CHANGE
    if (/nights/i.test(fieldName)) return rand(1, 30, 0);  // NO CHANGE
    if (/area/i.test(fieldName)) return rand(10, 48, 2);  // OLD: (100, 50000, 2)
    if (/pattern/i.test(fieldName)) return rand(0.5, 2.0, 2);  // NO CHANGE
    if (/type/i.test(fieldName)) return ["Landfill", "Incineration", "Recycling", "Composting"][Math.floor(Math.random() * 4)];  // NO CHANGE
    if (/tdLoss|loss/i.test(fieldName)) return rand(0.01, 0.15, 4);  // NO CHANGE
    if (/massEol/i.test(fieldName)) return rand(10, 48, 2);  // OLD: (100, 50000, 2)
    if (/toDisposal/i.test(fieldName)) return rand(0.1, 1.0, 2);  // NO CHANGE
    if (/toLandfill/i.test(fieldName)) return rand(0.1, 1.0, 2);  // NO CHANGE
    if (/toIncineration/i.test(fieldName)) return rand(0.1, 1.0, 2);  // NO CHANGE
    if (/investeeRevenue/i.test(fieldName)) return rand(15, 49, 2);  // OLD: (100000, 10000000, 2)
    if (/investeeScope1Emission|investeeS1/i.test(fieldName)) return rand(10, 45, 2);  // OLD: (100, 50000, 2)
    if (/investeeScope2Emission|investeeS2/i.test(fieldName)) return rand(10, 45, 2);  // OLD: (100, 50000, 2)
    if (/franchiseCount/i.test(fieldName)) return rand(2, 48, 0);  // OLD: (1, 500, 0)
    if (/avgEmission/i.test(fieldName)) return rand(5, 45, 2);  // OLD: (10, 5000, 2)
    if (/franchiseTotal/i.test(fieldName)) return rand(20, 49, 2);  // OLD: (1000, 100000, 2)
    if (/BuildingTotalS1_S2/i.test(fieldName)) return rand(20, 49, 2);  // OLD: (1000, 50000, 2)
    if (/passengers/i.test(fieldName)) return rand(1, 20, 0);  // OLD: (1, 100, 0)
    if (/travelled/i.test(fieldName)) return rand(5, 48, 2);  // OLD: (10, 5000, 2)

    return rand(1, 48, 2);  // OLD: (1, 1000, 2)
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

  const makeDataValues = () => {
    const fields = getCurrentFields();
    const data = {};

    fields.forEach(field => {
      data[field] = getFieldValue(field);
    });

    return data;
  };

  const buildPayload = (customTimestamp) => {
    let now;

    if (useCustomDate && selectedDate) {
      const [year, month, day] = selectedDate.split('-');
      now = customTimestamp || new Date();
      now.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      now = customTimestamp || new Date();
    }

    return {
      dataValues: makeDataValues(),
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB", { hour12: false }),
      timestamp: now.toISOString()
    };
  };

  const buildBatchPayload = () => {
    let baseDate;

    if (useCustomDate && selectedDate) {
      const [year, month, day] = selectedDate.split('-');
      baseDate = new Date();
      baseDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      baseDate = new Date();
    }

    const batch = [];

    for (let i = 0; i < batchSize; i++) {
      const timestamp = new Date(baseDate.getTime() - (i * 10 * 60 * 1000));
      batch.push(buildPayload(timestamp));
    }

    return { batchData: batch };
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

    const fields = getCurrentFields();

    if (fields.length === 0) {
      log("No fields available for current configuration", "err");
      return;
    }

    if (fields.includes('BuildingTotalS1_S2') && !scope12Data) {
      log("⚠️ BuildingTotalS1_S2 required but not fetched. Click 'Fetch S1+S2' first!", "warn");
      return;
    }

    const payload = batchMode ? buildBatchPayload() : buildPayload();

    try {
      const dateInfo = useCustomDate && selectedDate ? ` [Date: ${selectedDate}]` : '';
      log(`POST ${url} ${batchMode ? `(batch: ${batchSize} entries)` : ''}${dateInfo} with fields: [${fields.join(', ')}]`, "info");

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
      setTotalSent(prev => prev + (batchMode ? batchSize : 1));

      if (res.ok) {
        setSuccess(prev => prev + (batchMode ? batchSize : 1));
        log(`✅ ${res.status} OK — ${batchMode ? 'Batch' : 'Single'} API data sent successfully${dateInfo}`, "ok");
        if (!batchMode) {
          log(`   Date: ${payload.date} | Time: ${payload.time}`, "info");
          log(`   Fields: ${JSON.stringify(payload.dataValues, null, 2)}`, "info");
        } else {
          log(`   Batch size: ${batchSize} entries`, "info");
        }
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

    const fields = getCurrentFields();

    if (fields.includes('BuildingTotalS1_S2') && !scope12Data) {
      log("⚠️ Cannot start auto mode: BuildingTotalS1_S2 required but not fetched!", "err");
      return;
    }

    const ms = Math.max(300, parseInt(intervalMs || 15000, 10));
    setStatus("RUNNING");
    const dateInfo = useCustomDate && selectedDate ? ` with date: ${selectedDate}` : '';
    log(`API Auto mode started @ every ${ms} ms ${batchMode ? `(batch: ${batchSize})` : '(single)'}${dateInfo}`, "ok");
    log(`Configuration: ${selectedScope} > ${selectedCategory} > ${selectedActivity || 'N/A'} > ${selectedTier}`, "info");
    timerRef.current = setInterval(sendOnce, ms);
  };

  const stopAuto = () => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
    setStatus("STOPPED");
    log("API Auto mode stopped", "warn");
  };

  const clearLog = () => {
    if (logRef.current) logRef.current.innerHTML = "";
    log("API Data Simulator log cleared");
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
      log("API Data Simulator Ready");
      log("📡 Simulates external API data integration");
      log("✨ All random values capped under 50 for stability");
      log("1. Configure scope, category, and tier selections");
      log("2. Set your API endpoint URL and authentication");
      log("3. (Optional) Select a custom date for data entries");
      log("4. For Leased Assets: Enter Client ID and fetch Scope 1+2 data");
      log("5. Choose single or batch mode for data transmission");
      log("6. Click 'Send once' to test or 'Start auto' for continuous data flow");
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
      background: "linear-gradient(135deg, #1a1f2e 0%, #2d3b4f 100%)",
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
      background: "#1f2937",
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
      background: "#1f2937",
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
      background: "#1f2937",
      borderRadius: isMobile ? 8 : 16,
      padding: isMobile ? 12 : 20,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
    },
    logCard: {
      background: "#1f2937",
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
      background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
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
      border: "2px solid #374151",
      background: "#111827",
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
      border: "2px solid #374151",
      background: "#111827",
      color: "#e5e7eb",
      outline: "none",
      fontSize: isMobile ? 12 : 14,
      transition: "border-color 0.2s",
      boxSizing: "border-box",
      cursor: "pointer"
    },
    checkbox: {
      marginRight: 8,
      transform: "scale(1.2)"
    },
    grid: {
      display: "grid",
      gap: isMobile ? 12 : 20,
      gridTemplateColumns: "1fr",
      flex: 1
    },
    configSection: {
      background: "#111827",
      border: "2px solid #374151",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 16 : 20,
      marginBottom: isMobile ? 12 : 20
    },
    configTitle: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: 700,
      color: "#06b6d4",
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
      background: "#111827",
      border: "2px solid #374151",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 12 : 16,
      marginBottom: isMobile ? 12 : 20
    },
    fieldTitle: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: 600,
      color: "#7c3aed",
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
    batchRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: 12
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
      background: "#7c3aed",
      color: "white"
    },
    ghost: {
      background: "#111827",
      color: "#cbd5e1",
      border: "2px solid #374151"
    },
    danger: {
      background: "#dc2626",
      color: "white"
    },
    ok: {
      background: "#059669",
      color: "white"
    },
    warning: {
      background: "#f59e0b",
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
      background: "#111827",
      border: "2px solid #374151",
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
      background: "#111827",
      border: "2px solid #374151",
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
    },
    scope12Section: {
      background: "#1e3a8a",
      border: "2px solid #3b82f6",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 12 : 16,
      marginBottom: isMobile ? 12 : 20
    },
    scope12Title: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: 700,
      color: "#60a5fa",
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    scope12Data: {
      background: "#111827",
      border: "2px solid #374151",
      borderRadius: isMobile ? 6 : 8,
      padding: isMobile ? 8 : 12,
      marginTop: 8
    },
    scope12Value: {
      fontSize: isMobile ? 16 : 20,
      fontWeight: 800,
      color: "#22c55e",
      marginTop: 4
    },
    dateSection: {
      background: "#065f46",
      border: "2px solid #10b981",
      borderRadius: isMobile ? 8 : 12,
      padding: isMobile ? 12 : 16,
      marginBottom: isMobile ? 12 : 20
    },
    dateTitle: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: 700,
      color: "#34d399",
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  };

  const currentFields = getCurrentFields();
  const needsScope12 = requiresScope12Data();

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>API Data Simulator</h1>
          <p style={styles.sub}>Simulate external API data integration for emission scope categories and tiers. All random values capped under 50 for stability. Perfect for testing utility APIs, meter APIs, and third-party data sources.</p>
        </div>

        <div style={styles.main}>
          <div style={styles.leftPanel}>
            <div style={styles.grid}>
              {/* Configuration Section */}
              <div style={styles.configSection}>
                <div style={styles.configTitle}>
                  📡 API Configuration
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

              {/* Date Selection Section */}
              <div style={styles.dateSection}>
                <div style={styles.dateTitle}>
                  📅 Date Configuration
                </div>

                <div style={styles.batchRow}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={useCustomDate}
                    onChange={(e) => setUseCustomDate(e.target.checked)}
                  />
                  <label style={{ ...styles.label, marginBottom: 0, color: "#34d399" }}>
                    Use Custom Date (default: today's date)
                  </label>
                </div>

                {useCustomDate && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ ...styles.label, color: "#34d399" }}>Select Date *</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {selectedDate && (
                      <div style={{
                        marginTop: 8,
                        fontSize: isMobile ? 11 : 12,
                        color: "#6ee7b7"
                      }}>
                        📌 Data will be sent with date: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scope 1+2 Integration Section */}
              {needsScope12 && (
                <div style={styles.scope12Section}>
                  <div style={styles.scope12Title}>
                    🔗 Scope 1+2 Data Required
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ ...styles.label, color: "#60a5fa" }}>Client ID *</label>
                    <input
                      style={styles.input}
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Enter Client ID or auto-detect from URL"
                    />
                  </div>

                  <button
                    style={{
                      ...styles.button,
                      ...styles.warning,
                      width: "100%",
                      ...(scope12Loading || !clientId || clientId === ':clientId' ? styles.disabled : {})
                    }}
                    onClick={fetchScope12Total}
                    disabled={scope12Loading || !clientId || clientId === ':clientId'}
                  >
                    {scope12Loading ? '⏳ Fetching...' : '📥 Fetch S1+S2 Total'}
                  </button>

                  {scope12Data && (
                    <div style={styles.scope12Data}>
                      <div style={{ fontSize: isMobile ? 11 : 12, color: "#94a3b8" }}>
                        Scope 1: {scope12Data.scope1CO2e} | Scope 2: {scope12Data.scope2CO2e}
                      </div>
                      <div style={styles.scope12Value}>
                        Total: {scope12Data.scope12TotalCO2e} tCO₂e
                      </div>
                      <div style={{ fontSize: isMobile ? 10 : 11, color: "#6b7280", marginTop: 4 }}>
                        Last fetched: {scope12LastFetch?.toLocaleTimeString() || 'N/A'}
                      </div>
                    </div>
                  )}

                  {scope12Error && (
                    <div style={{
                      background: "#7f1d1d",
                      border: "2px solid #dc2626",
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 12,
                      fontSize: isMobile ? 11 : 12,
                      color: "#fca5a5"
                    }}>
                      ❌ {scope12Error}
                    </div>
                  )}
                </div>
              )}

              {/* Field Preview */}
              {currentFields.length > 0 && (
                <div style={styles.fieldPreview}>
                  <div style={styles.fieldTitle}>
                    📋 API Data Fields ({currentFields.length})
                    {needsScope12 && !scope12Data && (
                      <span style={{ color: "#f59e0b", marginLeft: 8 }}>⚠️ S1+S2 Required</span>
                    )}
                  </div>
                  <div style={styles.fieldList}>
                    {currentFields.map((field, idx) => (
                      <span key={field}>
                        {field}
                        {field === 'BuildingTotalS1_S2' && scope12Data && (
                          <span style={{ color: "#22c55e" }}> ✓</span>
                        )}
                        {idx < currentFields.length - 1 && ', '}
                      </span>
                    ))}
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
                  placeholder="http://localhost:5000/api/data-collection/clients/:clientId/nodes/:nodeId/scopes/:scopeId/api-data"
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
                    placeholder="Bearer JWT token for API authentication"
                  />
                </div>

                <div>
                  <label style={styles.label}>Interval (ms)</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="5000"
                    step="1000"
                    value={intervalMs}
                    onChange={(e) => setIntervalMs(e.target.value)}
                  />
                </div>
              </div>

              {/* Batch Mode Configuration */}
              <div style={styles.configSection}>
                <div style={styles.configTitle}>
                  📦 Batch Processing
                </div>
                <div style={styles.batchRow}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={batchMode}
                    onChange={(e) => setBatchMode(e.target.checked)}
                  />
                  <label style={styles.label}>Enable Batch Mode (send multiple records at once)</label>
                </div>
                {batchMode && (
                  <div style={{ marginTop: 12 }}>
                    <label style={styles.label}>Batch Size</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="2"
                      max="100"
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value) || 5)}
                    />
                  </div>
                )}
              </div>

              <div style={styles.btns}>
                <button
                  style={{
                    ...styles.button,
                    ...styles.primary,
                    ...(currentFields.length === 0 || (needsScope12 && !scope12Data) ? styles.disabled : {})
                  }}
                  onClick={sendOnce}
                  disabled={currentFields.length === 0 || (needsScope12 && !scope12Data)}
                >
                  📤 Send {batchMode ? 'Batch' : 'Once'}
                </button>
                <button
                  style={{
                    ...styles.button,
                    ...styles.ok,
                    ...(status === "RUNNING" || currentFields.length === 0 || (needsScope12 && !scope12Data) ? styles.disabled : {})
                  }}
                  onClick={startAuto}
                  disabled={status === "RUNNING" || currentFields.length === 0 || (needsScope12 && !scope12Data)}
                >
                  ▶️ Start Auto
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
                  🧹 Clear Log
                </button>
              </div>
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.statsCard}>
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Records Sent</div>
                  <div style={styles.statValue}>{totalSent}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Status</div>
                  <div style={{ ...styles.statValue, color: status === "RUNNING" ? "#059669" : "#94a3b8" }}>{status}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Last HTTP</div>
                  <div style={styles.statValue}>{lastHttp}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statTitle}>Success</div>
                  <div style={{ ...styles.statValue, color: "#059669" }}>{success}</div>
                </div>
              </div>
            </div>

            <div style={styles.logCard}>
              <div style={styles.logTitle}>API Activity Log</div>
              <div style={styles.log} ref={logRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDataSimulator;