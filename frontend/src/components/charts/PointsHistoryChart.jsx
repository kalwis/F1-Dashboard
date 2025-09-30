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

import { createChartOptions } from './PointsHistoryChart/chartOptions';
import { createPointsChartData } from '../shared/chartUtils';
import { getDriverColor, filterDrivers } from '../shared/utils';
import DriverSelector from '../shared/DriverSelector';
import api from '../../services/api';

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
  const [chartData, setChartData] = useState(null);
  const [originalPointsData, setOriginalPointsData] = useState({});
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDriverList, setShowDriverList] = useState(false);
  const [year, setYear] = useState('current');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Get drivers list
        const driversData = await api.getDrivers(year);
        const driversList = driversData.map(driver => ({
          id: driver.driverId,
          name: `${driver.givenName} ${driver.familyName}`,
          team: driver.constructorName || 'Unknown',
          color: getDriverColor(driver.driverId)
        }));
        setDrivers(driversList);

        // Get season schedule to know how many rounds
        const schedule = await api.getSeasonSchedule(year);
        const totalRounds = schedule.length;

        // Fetch race results for each round
        const pointsData = await fetchPointsData(totalRounds);
        setOriginalPointsData(pointsData);
        
        // Create chart data
        const chartData = createPointsChartData(pointsData, selectedDriver, driversList);
        setChartData(chartData);
      } catch (error) {
        console.error('Error fetching points data:', error);
        // Set empty data on error
        setChartData({
          labels: [],
          datasets: []
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [year, selectedDriver]);

  const fetchPointsData = async (totalRounds) => {
    const pointsData = {};
    
    for (let round = 1; round <= totalRounds; round++) {
      try {
        const raceResults = await api.getRaceResults(year, round);
        
        raceResults.forEach(result => {
          const driverId = result.driverId;
          const points = result.points || 0;
          const raceName = result.raceName || `Round ${round}`;
          
          if (!pointsData[driverId]) {
            pointsData[driverId] = {
              name: `${result.givenName} ${result.familyName}`,
              team: result.constructorName || 'Unknown',
              points: [],
              raceNames: []
            };
          }
          
          pointsData[driverId].points.push(points);
          pointsData[driverId].raceNames.push(raceName);
        });
      } catch (error) {
        console.error(`Error fetching race results for round ${round}:`, error);
        // Continue with next round
      }
    }
    
    return pointsData;
  };



  const handleDriverChange = (driverId) => {
    setSelectedDriver(driverId);
    setShowDriverList(false);
    setSearchTerm('');
    
    // Update chart data immediately for the new driver selection
    if (Object.keys(originalPointsData).length > 0) {
      const updatedChartData = createPointsChartData(
        originalPointsData, 
        driverId, 
        drivers
      );
      setChartData(updatedChartData);
    }
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

  const options = createChartOptions(selectedDriver, year);

  return (
    <div className="w-full h-full flex flex-col" key={`points-chart-container-${selectedDriver}`}>
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
        {chartData && <Line key={`points-chart-${selectedDriver}`} options={options} data={chartData} />}
      </div>

      {/* Chart Info */}
      <div className="mt-2 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>Points accumulation throughout the season</span>
          <span className="text-gray-500">
            {selectedDriver === 'all' ? 'All drivers' : drivers.find(d => d.id === selectedDriver)?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
