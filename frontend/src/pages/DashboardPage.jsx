import DashboardCard from '../components/DashboardCard';
import EloHistoryChart from '../components/EloHistoryChart';
import UpcomingRaces from '../components/UpcomingRaces';
import DriverStandings from '../components/DriverStandings';
import { FaChartLine, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

export default function DashboardPage() {
  return (
    <div className="p-6 font-sans text-gray-800 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        Dashboard Overview
      </h1>

      {/* Main grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Elo Rating History */}
        <DashboardCard
          title="Elo Rating History"
          icon={FaChartLine}
          className="md:col-span-2 xl:col-span-3"
        >
          <div className="flex flex-col h-60 p-4 bg-white rounded shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm">Filter by:</label>
              <select className="border px-2 py-1 text-sm rounded">
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

        {/* Driver Standings */}
        <DashboardCard title="Top Drivers" icon={FaTrophy}>
          <div className="h-60 p-4 bg-white rounded shadow-inner text-sm overflow-y-auto">
            <DriverStandings />
          </div>
        </DashboardCard>

        {/* Upcoming Races */}
        <DashboardCard title="Upcoming Races" icon={FaCalendarAlt}>
          <div className="h-60 p-4 bg-white rounded shadow-inner text-sm text-gray-700 overflow-y-auto">
            <UpcomingRaces />
          </div>
        </DashboardCard>

        {/* Constructor Leaderboard */}
        <DashboardCard title="Constructor Leaderboard" icon={FaTrophy}>
          <div className="h-60 p-4 bg-white rounded shadow-inner text-sm">
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Red Bull – 520 pts</li>
              <li>Ferrari – 455 pts</li>
              <li>McLaren – 392 pts</li>
              <li>Mercedes – 311 pts</li>
              <li>Aston Martin – 210 pts</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Points updated after each race (F3, F5).
            </p>
          </div>
        </DashboardCard>

        

      </div>

      {/* Footer Sync Info */}
      <div className="mt-6 text-xs text-gray-500 text-right">
        Last synced with official API: <strong>6 minutes ago</strong> (Auto-updates daily, no manual input required)
      </div>
    </div>
  );
}
