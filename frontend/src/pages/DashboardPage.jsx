import DashboardCard from '../components/DashboardCard';
import EloHistoryChart from '../components/EloHistoryChart';
import UpcomingRaces from '../components/UpcomingRaces';
import DriverStandings from '../components/DriverStandings';
import ConstructorStandings from '../components/ConstructorStandings';
import LatestRaceResults from '../components/LatestRaceResults';
import { FaChartLine, FaCalendarAlt, FaTrophy, FaFlagCheckered } from 'react-icons/fa';

export default function DashboardPage() {
  return (
    <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
      
      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Elo Rating History - Full width at top */}
        <div className="lg:col-span-3">
          <DashboardCard
            title="Elo Rating History"
            icon={FaChartLine}
          >
            <div className="flex flex-col h-60 p-4 bg-black/10 rounded shadow-inner text-white">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-white/80">Filter by:</label>
                <select className="border border-white/20 bg-black/20 text-white px-2 py-1 text-sm rounded">
                  <option>Driver</option>
                  <option>Constructor</option>
                  <option>Driver-Car Pair</option>
                </select>
              </div>
              <div className="flex-1">
                <EloHistoryChart />
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Driver Standings */}
        <DashboardCard title="Top Drivers" icon={FaTrophy}>
          <div className="h-80 p-4 bg-black/10 rounded shadow-inner text-sm text-white overflow-y-auto custom-scrollbar">
            <DriverStandings />
          </div>
        </DashboardCard>

        {/* Left Column - Upcoming Races and Latest Race Results */}
        <div className="space-y-6">
          <DashboardCard title="Upcoming Races" icon={FaCalendarAlt}>
            <div className="h-60 p-4 bg-black/10 rounded shadow-inner text-sm text-white overflow-y-auto custom-scrollbar">
              <UpcomingRaces />
            </div>
          </DashboardCard>

          <DashboardCard title="Latest Race Results" icon={FaFlagCheckered}>
            <div className="h-60 p-4 bg-black/10 rounded shadow-inner text-sm text-white overflow-y-auto custom-scrollbar">
              <LatestRaceResults />
            </div>
          </DashboardCard>
        </div>

        {/* Constructor Leaderboard */}
        <DashboardCard title="Constructor Leaderboard" icon={FaTrophy}>
          <div className="h-80 p-4 bg-black/10 rounded shadow-inner text-sm text-white overflow-y-auto custom-scrollbar">
            <ConstructorStandings />
            <p className="text-xs text-white/60 mt-3 text-center">
              Points updated after each race (F3, F5).
            </p>
          </div>
        </DashboardCard>
        
      </div>

      {/* Footer Sync Info */}
      <div className="mt-6 text-xs text-gray-400 text-right">
        Last synced with official API: <strong>6 minutes ago</strong> (Auto-updates daily, no manual input required)
      </div>
    </div>
  );
}