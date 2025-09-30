import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { createChartOptions } from './EloHistoryChart/chartOptions';
import { sampleDrivers, sampleData } from './EloHistoryChart/sampleData';
import { createEloChartData, fetchEloData } from '../shared/chartUtils';
import { filterDrivers } from '../shared/utils';
import DriverSelector from '../shared/DriverSelector';

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

export default function EloHistoryChart() {
  const [chartData, setChartData] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDriverList, setShowDriverList] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await fetchEloData();
        // Process real data here
        setDrivers(sampleDrivers);
        setChartData(createEloChartData(sampleData, selectedDriver, sampleDrivers));
      } catch (error) {
        // Fallback to sample data
        setDrivers(sampleDrivers);
        setChartData(createEloChartData(sampleData, selectedDriver, sampleDrivers));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDriverChange = (driverId) => {
    setSelectedDriver(driverId);
    setChartData(createEloChartData(sampleData, driverId, sampleDrivers));
    setShowDriverList(false);
    setSearchTerm('');
  };

  // Filter drivers based on search term
  const filteredDrivers = filterDrivers(drivers, searchTerm);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const options = createChartOptions(selectedDriver);

  return (
    <div className="w-full h-full flex flex-col" key={`elo-chart-container-${selectedDriver}`}>
      {/* Driver Selection */}
      <DriverSelector
        selectedDriver={selectedDriver}
        drivers={drivers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showDriverList={showDriverList}
        setShowDriverList={setShowDriverList}
        handleDriverChange={handleDriverChange}
        filteredDrivers={filteredDrivers}
      />

      {/* Chart */}
      <div className="flex-1 min-h-0 relative">
        {chartData && <Line key={`elo-chart-${selectedDriver}`} options={options} data={chartData} />}
      </div>

      {/* Chart Info */}
      <div className="mt-2 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>Elo ratings track driver performance over time</span>
          <span className="text-gray-500">
            Higher rating = Better performance
          </span>
        </div>
      </div>
    </div>
  );
}
