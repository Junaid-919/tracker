import { Routes, Route } from "react-router-dom";
import BusStopScreen from "./pages/BusStopScreen";
import BusStopList from "./pages/BustopList";
function App() {
  return (
    <Routes>
      <Route
        path="/bus"
        element={<BusStopScreen />}
      />

      <Route
        path="/BusStopList"
        element={<BusStopList />}
      />
    </Routes>
  );
}

export default App;