import { sampleDrivers } from './sampleData';

export const createChartData = (data, selectedDriver) => {
  const labels = Array.from({ length: 7 }, (_, i) => `Race ${i + 1}`);
  
  if (selectedDriver === 'all') {
    // Show all drivers
    const datasets = Object.entries(data).map(([driverId, ratings]) => {
      const driver = sampleDrivers.find(d => d.id === driverId);
      return {
        label: driver.name,
        data: ratings,
        borderColor: driver.color,
        backgroundColor: `${driver.color}20`,
        fill: false,
        tension: 0.3,
      };
    });
    
    return { labels, datasets };
  } else {
    const driver = sampleDrivers.find(d => d.id === selectedDriver);
    const ratings = data[selectedDriver];
    
    return {
      labels,
      datasets: [{
        label: driver.name,
        data: ratings,
        borderColor: driver.color,
        backgroundColor: `${driver.color}20`,
        fill: true,
        tension: 0.3,
      }]
    };
  }
};

export const fetchEloData = async () => {
  try {
    const response = await fetch('https://f1-dashboard-doj4.onrender.com/api/elo?year=2025&type=0');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('API not available');
    }
  } catch (error) {
    console.log('Using sample data:', error.message);
    throw error;
  }
};
