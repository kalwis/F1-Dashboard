import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import PredictionsPage from "./pages/PredictionsPage";
import RankingsPage from "./pages/RankingsPage";
import ComparePage from "./pages/ComparePage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black font-sans">
        <Routes>
          {/* Welcome page without navbar */}
          <Route path="/" element={<WelcomePage />} />
          
          {/* All other pages with navbar and consistent background */}
          <Route path="/dashboard" element={
            <div className="relative min-h-screen bg-black overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-red-900/20"></div>
              </div>
              <div className="relative z-10">
                <Navbar />
                <DashboardPage />
              </div>
            </div>
          } />
          <Route path="/predictions" element={
            <div className="relative min-h-screen bg-black overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-red-900/20"></div>
              </div>
              <div className="relative z-10">
                <Navbar />
                <PredictionsPage />
              </div>
            </div>
          } />
          <Route path="/rankings" element={
            <div className="relative min-h-screen bg-black overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-red-900/20"></div>
              </div>
              <div className="relative z-10">
                <Navbar />
                <RankingsPage />
              </div>
            </div>
          } />
          <Route path="/compare" element={
            <div className="relative min-h-screen bg-black overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-red-900/20"></div>
              </div>
              <div className="relative z-10">
                <Navbar />
                <ComparePage />
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}