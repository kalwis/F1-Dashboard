// Shared utilities for chart components

export const getDriverColor = (driverId) => {
  const colors = [
    '#e10600', '#00d2be', '#ff8700', '#006f62', '#dc143c',
    '#0090ff', '#ffd700', '#8b0000', '#ff69b4', '#32cd32',
    '#ff4500', '#4169e1', '#ff1493', '#00ced1', '#ff8c00',
    '#9370db', '#20b2aa', '#ff6347', '#40e0d0', '#ee82ee'
  ];
  
  // Simple hash function to assign consistent colors
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = driverId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const filterDrivers = (drivers, searchTerm) => {
  return drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.team.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const createBaseChartOptions = (selectedDriver, title, yAxisLabel) => {
  const isAllDrivers = selectedDriver === 'all';
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: isAllDrivers,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
            family: 'Titillium Web'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Race Round',
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
            family: 'Titillium Web'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11,
            family: 'Titillium Web'
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yAxisLabel,
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
            family: 'Titillium Web'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11,
            family: 'Titillium Web'
          }
        },
        beginAtZero: true
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      },
      line: {
        tension: 0.1,
        borderWidth: 2
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };
};
