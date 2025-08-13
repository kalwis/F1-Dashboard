import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PredictionsPage from "./pages/PredictionsPage";
import RankingsPage from "./pages/RankingsPage";
import ComparePage from "./pages/ComparePage";
import Navbar from "./components/Navbar";


export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </div>
    </Router>
  );
}