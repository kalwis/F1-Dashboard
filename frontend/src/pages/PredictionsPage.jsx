import React, { useState } from 'react';
import DashboardCard from '../components/DashboardCard';

export default function PredictionsPage() {
  // Available races to demonstrate filtering capability
  const raceOptions = [
    { id: 'bahrain', name: 'Bahrain GP' },
    { id: 'saudi', name: 'Saudi Arabian GP' },
    { id: 'australia', name: 'Australian GP' },
  ];

  // Sample predictions for each race
  const sampleData = {
    bahrain: {
      qualifying: [
        { position: 1, driver: 'Max Verstappen', probability: '38%' },
        { position: 2, driver: 'Lando Norris', probability: '22%' },
        { position: 3, driver: 'Charles Leclerc', probability: '15%' },
        { position: 4, driver: 'George Russell', probability: '9%' },
        { position: 5, driver: 'Sergio Perez', probability: '7%' },
      ],
      race: [
        { position: 1, driver: 'Max Verstappen', probability: '35%' },
        { position: 2, driver: 'Lando Norris', probability: '20%' },
        { position: 3, driver: 'Charles Leclerc', probability: '12%' },
        { position: 4, driver: 'George Russell', probability: '10%' },
        { position: 5, driver: 'Sergio Perez', probability: '6%' },
      ],
    },
    saudi: {
      qualifying: [
        { position: 1, driver: 'Max Verstappen', probability: '40%' },
        { position: 2, driver: 'Charles Leclerc', probability: '18%' },
        { position: 3, driver: 'Sergio Perez', probability: '17%' },
        { position: 4, driver: 'Lando Norris', probability: '15%' },
        { position: 5, driver: 'Lewis Hamilton', probability: '5%' },
      ],
      race: [
        { position: 1, driver: 'Max Verstappen', probability: '37%' },
        { position: 2, driver: 'Sergio Perez', probability: '22%' },
        { position: 3, driver: 'Charles Leclerc', probability: '14%' },
        { position: 4, driver: 'Lando Norris', probability: '12%' },
        { position: 5, driver: 'Lewis Hamilton', probability: '8%' },
      ],
    },
    australia: {
      qualifying: [
        { position: 1, driver: 'Lando Norris', probability: '34%' },
        { position: 2, driver: 'Max Verstappen', probability: '30%' },
        { position: 3, driver: 'Charles Leclerc', probability: '16%' },
        { position: 4, driver: 'Oscar Piastri', probability: '12%' },
        { position: 5, driver: 'George Russell', probability: '8%' },
      ],
      race: [
        { position: 1, driver: 'Max Verstappen', probability: '33%' },
        { position: 2, driver: 'Lando Norris', probability: '25%' },
        { position: 3, driver: 'Oscar Piastri', probability: '15%' },
        { position: 4, driver: 'Charles Leclerc', probability: '14%' },
        { position: 5, driver: 'George Russell', probability: '9%' },
      ],
    },
  };

  const [selectedRace, setSelectedRace] = useState(raceOptions[0].id);

  const qualifyingPredictions = sampleData[selectedRace].qualifying;
  const racePredictions = sampleData[selectedRace].race;

  return (
    <div className="p-6 font-sans text-gray-800 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">Predictions</h1>

      {/* Race selection and future filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <select
          className="border rounded p-2 text-sm"
          value={selectedRace}
          onChange={(e) => setSelectedRace(e.target.value)}
        >
          {raceOptions.map((race) => (
            <option key={race.id} value={race.id}>
              {race.name}
            </option>
          ))}
        </select>

        {/* Disabled driver/constructor filters to illustrate planned functionality */}
        <div className="flex gap-4 flex-1">
          <select className="border rounded p-2 text-sm w-full" disabled>
            <option>Filter Driver</option>
          </select>
          <select className="border rounded p-2 text-sm w-full" disabled>
            <option>Filter Constructor</option>
          </select>
        </div>
      </div>

      <DashboardCard title="Q3 Qualifying Prediction">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-2">Pos</th>
                <th className="pb-2">Driver</th>
                <th className="pb-2">Probability</th>
              </tr>
            </thead>
            <tbody>
              {qualifyingPredictions.map((row) => (
                <tr key={row.position} className="border-t">
                  <td className="py-1 pr-4">{row.position}</td>
                  <td className="py-1 pr-4">{row.driver}</td>
                  <td className="py-1">{row.probability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">Automatically generated from practice, Q1 and Q2 data (F2).</p>
      </DashboardCard>

      <DashboardCard title="Race Outcome Prediction">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-2">Pos</th>
                <th className="pb-2">Driver</th>
                <th className="pb-2">Probability</th>
              </tr>
            </thead>
            <tbody>
              {racePredictions.map((row) => (
                <tr key={row.position} className="border-t">
                  <td className="py-1 pr-4">{row.position}</td>
                  <td className="py-1 pr-4">{row.driver}</td>
                  <td className="py-1">{row.probability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">Based on start position and practice race pace (F3).</p>
      </DashboardCard>

      <div className="text-xs text-gray-500 text-right">
        Predictions updated daily from official session data (NF2).
      </div>
    </div>
  );
}
