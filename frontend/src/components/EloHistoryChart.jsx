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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function EloHistoryChart() {
  const [chartData, setChartData] = useState(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  const defaultData = {
    labels: ['Race 1', 'Race 2', 'Race 3', 'Race 4', 'Race 5'],
    datasets: [
      {
        label: 'Elo Rating',
        data: [1500, 1520, 1535, 1510, 1540],
        borderColor: '#e10600',
        backgroundColor: 'rgba(225, 6, 0, 0.3)',
      },
    ],
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const jolpicaRes = await fetch('https://api.jolpica.com/f1/elo-history');
        const jolpicaData = await jolpicaRes.json();
        const fastf1Res = await fetch('https://fastf1.jolpica.com/elo-history');
        const fastf1Data = await fastf1Res.json();
        const labels =
          jolpicaData.labels || fastf1Data.labels || ['Race 1', 'Race 2'];
        const ratings =
          jolpicaData.ratings || fastf1Data.ratings || [1500, 1510];
        setChartData({
          labels,
          datasets: [
            {
              label: 'Elo Rating',
              data: ratings,
              borderColor: '#e10600',
              backgroundColor: 'rgba(225, 6, 0, 0.3)',
            },
          ],
        });
      } catch (err) {
        setChartData(null);
      }
    }
    fetchData();
  }, []);

  return <Line options={options} data={chartData || defaultData} />;
}
