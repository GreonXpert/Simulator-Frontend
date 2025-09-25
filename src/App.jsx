import { BrowserRouter, Routes, Route } from "react-router-dom";
import IoTSimulator from "./pages/IoTSimulator/IoTSimulator";
import TabStructureSimulator from "./pages/Tabs/TabStructureSimulator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/simulator" element={<TabStructureSimulator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
