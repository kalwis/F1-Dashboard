import { useEffect, useState } from 'react';

const fallbackDrivers = [
  { Driver: { driverId: 'max_verstappen', familyName: 'Verstappen' }, points: 575 },
  { Driver: { driverId: 'sergio_perez', familyName: 'Perez' }, points: 285 },
  { Driver: { driverId: 'lewis_hamilton', familyName: 'Hamilton' }, points: 234 },
  { Driver: { driverId: 'fernando_alonso', familyName: 'Alonso' }, points: 206 },
  { Driver: { driverId: 'charles_leclerc', familyName: 'Leclerc' }, points: 206 },
];

export default function DriverStandings() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch('https://ergast.com/api/f1/current/driverStandings.json')
      .then((res) => res.json())
      .then((data) => {
        const standings =
          data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        setDrivers(standings.slice(0, 5));
        setLoading(false);
      })
      .catch(() => {
        setDrivers(fallbackDrivers);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <ol className="list-decimal list-inside space-y-1">
      {drivers.map((driver) => (
        <li key={driver.Driver.driverId}>
          {driver.Driver.familyName} – {driver.points} pts
        </li>
      ))}
    </ol>
  );
}
