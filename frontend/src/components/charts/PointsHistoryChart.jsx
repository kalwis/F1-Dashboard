import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import fastf1Api from '../../services/api.js';
import { FaChartLine } from 'react-icons/fa';
import { createChartOptions } from './PointsHistoryChart/chartOptions';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PointsHistoryChart() {
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDrivers, setSelectedDrivers] = useState([]);

  // Color palette for driver lines
  const driverColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#A9DFBF', '#F9E79F', '#D5DBDB', '#AED6F1', '#FADBD8'
  ];

  useEffect(() => {
    const fetchPointsHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fastf1Api.getPointsHistory();
        setPointsData(data);
        
        // Default to top 5 drivers by final points
        if (data.pointsHistory && data.pointsHistory.length > 0) {
          const finalStandings = data.pointsHistory[data.pointsHistory.length - 1].standings;
          const topDrivers = finalStandings.slice(0, 5).map(standing => standing.driver);
          setSelectedDrivers(topDrivers);
        }
      } catch (err) {
        console.error('Error fetching points history:', err);
        setError('Failed to load points history data');
      } finally {
        setLoading(false);
      }
    };

    fetchPointsHistory();
  }, []);


  const prepareChartData = () => {
    if (!pointsData || !pointsData.pointsHistory) return null;

    const rounds = pointsData.pointsHistory.map(race => `R${race.round}`);
    const datasets = selectedDrivers.map((driverName, index) => {
      const points = pointsData.pointsHistory.map(race => {
        const driverStanding = race.standings.find(standing => standing.driver === driverName);
        return driverStanding ? driverStanding.points : 0;
      });

      return {
        label: driverName,
        data: points,
        borderColor: driverColors[index % driverColors.length],
        backgroundColor: driverColors[index % driverColors.length] + '20',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.1
      };
    });

    return {
      labels: rounds,
      datasets: datasets
    };
  };

  const chartOptions = createChartOptions('all', '2025');

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-2"></div>
          <div className="text-sm">Loading points history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center text-red-400">
          <FaChartLine className="mx-auto mb-2 text-2xl" />
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!pointsData || !pointsData.pointsHistory || pointsData.pointsHistory.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FaChartLine className="mx-auto mb-2 text-2xl" />
          <div className="text-sm">No points history data available</div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  if (!chartData) return null;

  return (
    <div className="h-full w-full">
      {/* Chart */}
      <div className="h-full w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}