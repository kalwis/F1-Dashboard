export const createChartOptions = (selectedDriver) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false, // We'll handle legend manually
    },
    tooltip: {
      enabled: selectedDriver !== 'all', // Only show tooltip for individual drivers
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#e10600',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: function(context) {
          return `Round ${context[0].parsed.x + 1}`;
        },
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y.toFixed(0)}`;
        },
        afterLabel: function(context) {
          const currentElo = context.parsed.y;
          const previousElo = context.dataset.data[context.dataIndex - 1];
          if (previousElo) {
            const change = currentElo - previousElo;
            const changeText = change > 0 ? `+${change.toFixed(0)}` : change.toFixed(0);
            return `Change: ${changeText}`;
          }
          return '';
        }
      }
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 11,
        },
        callback: function(value, index) {
          return `R${index + 1}`;
        }
      },
      border: {
        color: 'rgba(255, 255, 255, 0.2)',
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 11,
        },
        callback: function(value) {
          return value.toFixed(0);
        }
      },
      border: {
        color: 'rgba(255, 255, 255, 0.2)',
      }
    },
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: '#e10600',
      borderColor: '#ffffff',
      borderWidth: 2,
    },
    line: {
      tension: 0.3,
      borderWidth: 3,
    }
  },
});
