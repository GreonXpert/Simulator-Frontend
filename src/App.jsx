import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SimulatorModulesHome from "./pages/SimulatorModulesHome";
import TabStructureSimulator from "./pages/EmissionSimulator/Tabs/TabStructureSimulator";
import IoTDataSimulator from "./pages/EmissionSimulator/IoTSimulator/IoTSimulator";
import APIDataSimulator from "./pages/EmissionSimulator/APISimulator/APIDataSimulator";
import ReductionTabStructure from "./pages/ReductionSimulator/Tabs/ReductionTabStructure";
import ReductionIoTSimulator from "./pages/ReductionSimulator/IoTSimulator/ReductionIoTSimulator";
import ReductionAPISimulator from "./pages/ReductionSimulator/APISimulator/ReductionAPISimulator";

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

        {/* Reduction modules */}
        <Route
          path="/simulator/reduction"
          element={<ReductionTabStructure />}
        />
        <Route
          path="/simulator/reduction/iot"
          element={<ReductionIoTSimulator />}
        />
        <Route
          path="/simulator/reduction/api"
          element={<ReductionAPISimulator />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
