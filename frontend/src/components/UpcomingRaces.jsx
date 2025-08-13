import { useEffect, useState } from 'react';

const fallbackRaces = [
  {
    round: 1,
    Circuit: { Location: { country: 'Bahrain' } },
    date: '2024-03-02',
  },
  {
    round: 2,
    Circuit: { Location: { country: 'Saudi Arabia' } },
    date: '2024-03-09',
  },
  {
    round: 3,
    Circuit: { Location: { country: 'Australia' } },
    date: '2024-03-24',
  },
  {
    round: 4,
    Circuit: { Location: { country: 'Japan' } },
    date: '2024-04-07',
  },
  {
    round: 5,
    Circuit: { Location: { country: 'China' } },
    date: '2024-04-21',
  },
];

export default function UpcomingRaces() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch('https://ergast.com/api/f1/current.json')
      .then((res) => res.json())
      .then((data) => {
        const all = data.MRData.RaceTable.Races;
        const today = new Date();
        const upcoming = all.filter((r) => new Date(r.date) >= today).slice(0, 5);
        setRaces(upcoming);
        setLoading(false);
      })
      .catch(() => {
        setRaces(fallbackRaces);
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
