import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SimulatorModulesHome from "./pages/SimulatorModulesHome";
import TabStructureSimulator from "./pages/EmissionSimulator/Tabs/TabStructureSimulator"; // existing file (UNCHANGED)
import ReductionTabStructure from "./pages/ReductionSimulator/Tabs/ReductionTabStructure";     // new file


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default → modules chooser */}
        <Route path="/" element={<Navigate to="/simulator" replace />} />

        {/* Modules hub */}
        <Route path="/simulator" element={<SimulatorModulesHome />} />

        {/* Emission module → uses your existing TabStructureSimulator exactly as-is */}
        <Route path="/simulator/emission" element={<TabStructureSimulator />} />

        {/* Reduction module → uses the new reduction tab structure */}
        <Route path="/simulator/reduction" element={<ReductionTabStructure />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
