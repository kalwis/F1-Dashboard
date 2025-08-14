import { useEffect, useState } from 'react';
import fastf1Api from '../services/fastf1Api';

export default function UpcomingRaces() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fastf1Api.getSeasonSchedule()
      .then((data) => {
        const all = data.MRData.RaceTable.Races;
        const today = new Date();
        const upcoming = all.filter((r) => new Date(r.date) >= today).slice(0, 5);
        setRaces(upcoming);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <ul className="space-y-1">
      {races.map((race) => (
        <li key={race.round}>
          {race.Circuit.Location.country} GP –{' '}
          {new Date(race.date).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
