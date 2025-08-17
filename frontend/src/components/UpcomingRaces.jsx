import { useEffect, useState } from 'react';
import fastf1Api from '../services/fastf1Api';
import { FaCalendarAlt, FaFlag, FaClock } from 'react-icons/fa';

export default function UpcomingRaces() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const raceDate = new Date(dateString);
    const diffTime = raceDate - currentTime;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCountdown = (dateString) => {
    const raceDate = new Date(dateString);
    const diffTime = raceDate - currentTime;
    
    if (diffTime <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-2"></div>
          <div className="text-sm">Loading races...</div>
        </div>
      </div>
    );
  }

  if (races.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <FaCalendarAlt className="mx-auto mb-2 text-2xl" />
          <div className="text-sm">No upcoming races</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {races.map((race, index) => {
        const daysUntil = getDaysUntil(race.date);
        const countdown = getCountdown(race.date);
        const isNextRace = index === 0;
        
        return (
          <div 
            key={race.round} 
            className={`p-3 rounded-lg border transition-all duration-200 hover:bg-white/5 ${
              isNextRace 
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            {/* Race Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FaFlag className={`text-sm ${isNextRace ? 'text-blue-400' : 'text-white/60'}`} />
                <span className={`font-semibold text-sm ${isNextRace ? 'text-blue-300' : 'text-white'}`}>
                  {race.Circuit.Location.country} GP
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60">Round {race.round}</div>
                <div className="text-xs text-white/40">{formatDate(race.date)}</div>
              </div>
            </div>

            {/* Countdown for next race */}
            {isNextRace && (
              <div className="mb-3 p-2 bg-blue-500/10 rounded border border-blue-400/20">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <FaClock className="text-blue-400 text-xs" />
                  <span className="text-xs text-blue-300 font-medium">Countdown to Race</span>
                </div>
                <div className="flex justify-center space-x-2">
                  {countdown.days > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-300">{countdown.days}</div>
                      <div className="text-xs text-blue-400">Days</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-300">{countdown.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-400">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-300">{countdown.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-400">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-300">{countdown.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-blue-400">Seconds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Countdown */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/50">
                {!isNextRace && (daysUntil === 0 ? 'Today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} away`)}
              </div>
              <div className="text-xs text-white/70">
                {race.Circuit.Location.locality}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
