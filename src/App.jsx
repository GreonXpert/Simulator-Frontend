import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SimulatorModulesHome from "./pages/SimulatorModulesHome";
import TabStructureSimulator from "./pages/EmissionSimulator/Tabs/TabStructureSimulator";
import IoTDataSimulator from "./pages/EmissionSimulator/IoTSimulator/IoTSimulator";
import APIDataSimulator from "./pages/EmissionSimulator/APISimulator/APIDataSimulator";
import ReductionTabStructure from "./pages/ReductionSimulator/Tabs/ReductionTabStructure";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default → modules chooser */}
        <Route path="/" element={<Navigate to="/simulator" replace />} />

        {/* Modules hub */}
        <Route path="/simulator" element={<SimulatorModulesHome />} />

        {/* Emission modules */}
        <Route path="/simulator/emission" element={<TabStructureSimulator />} />
        <Route path="/simulator/emission/iot" element={<IoTDataSimulator />} />
        <Route path="/simulator/emission/api" element={<APIDataSimulator />} />

        {/* Reduction module */}
        <Route path="/simulator/reduction" element={<ReductionTabStructure />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
