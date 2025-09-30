// Shared chart utilities for Elo and Points history charts

export const createEloChartData = (data, selectedDriver, drivers) => {
  const labels = Array.from({ length: 7 }, (_, i) => `Race ${i + 1}`);
  
  if (selectedDriver === 'all') {
    // Show all drivers
    const datasets = Object.entries(data).map(([driverId, ratings]) => {
      const driver = drivers.find(d => d.id === driverId);
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
    const driver = drivers.find(d => d.id === selectedDriver);
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

export const createPointsChartData = (pointsData, selectedDriver, driversList) => {
  const labels = [];
  const datasets = [];
  
  // Handle empty data
  if (!pointsData || Object.keys(pointsData).length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }
  
  // Create labels based on rounds
  const driverPointsArrays = Object.values(pointsData).map(driver => driver.points || []);
  if (driverPointsArrays.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }
  
  const maxRounds = Math.max(...driverPointsArrays.map(points => points.length));
  for (let i = 1; i <= maxRounds; i++) {
    labels.push(`R${i}`);
  }

  if (selectedDriver === 'all') {
    // Show all drivers
    Object.entries(pointsData).forEach(([driverId, data]) => {
      const driver = driversList.find(d => d.id === driverId);
      if (driver) {
        datasets.push({
          label: data.name,
          data: data.points,
          borderColor: driver.color,
          backgroundColor: driver.color + '20',
          fill: false,
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 5,
          raceNames: data.raceNames
        });
      }
    });
  } else {
    // Show selected driver only
    const driverData = pointsData[selectedDriver];
    if (driverData) {
      const driver = driversList.find(d => d.id === selectedDriver);
      datasets.push({
        label: driverData.name,
        data: driverData.points,
        borderColor: driver?.color || '#e10600',
        backgroundColor: (driver?.color || '#e10600') + '20',
        fill: true,
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        raceNames: driverData.raceNames
      });
    }
  }

  return {
    labels,
    datasets
  };
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
