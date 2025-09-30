export function createChartOptions(selectedDriver, year) {
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
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `Round ${context[0].label}`;
          },
          label: function(context) {
            const driverName = context.dataset.label;
            const points = context.parsed.y;
            const raceName = context.raw.raceName || '';
            return `${driverName}: ${points} points${raceName ? ` (${raceName})` : ''}`;
          }
        }
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
          text: 'Points',
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
          },
          stepSize: 5
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
}
