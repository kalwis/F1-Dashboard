// FastF1 API Service for CRA + Vercel

const BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, ''); // strip trailing slashes

function join(base, path) {
  // ensures exactly one slash between base and path
  return `${base}/${String(path).replace(/^\/+/, '')}`;
}

class FastF1ApiService {
  constructor() {
    // Use local prediction API for race predictions, production API for other data
    this.baseUrl = 'https://f1-dashboard-doj4.onrender.com/api';
    this.predictionBaseUrl = 'http://localhost:8000';
    //this.baseUrl = BASE_URL;        // e.g. https://f1-dashboard-doj4.onrender.com/api
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
  }

  async fetchWithCache(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data;
    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(join(this.baseUrl, endpoint));
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.append(k, v);
    });

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Endpoints
  getDriverStandings(year = 'current') {
    return this.fetchWithCache(`driverStandings_${year}`, () =>
      this.makeRequest('/driver-standings', { year })
    );
  }

  getConstructorStandings(year = 'current') {
    return this.fetchWithCache(`constructorStandings_${year}`, () =>
      this.makeRequest('/constructor-standings', { year })
    );
  }

  getSeasonSchedule(year = 'current') {
    return this.fetchWithCache(`schedule_${year}`, () =>
      this.makeRequest('/season-schedule', { year })
    );
  }

  getRaceResults(year = 'current', round = null) {
    return this.fetchWithCache(`raceResults_${year}_${round || 'latest'}`, () =>
      this.makeRequest('/race-results', { year, round })
    );
  }

  getQualifyingResults(year = 'current', round = null) {
    return this.fetchWithCache(`qualifying_${year}_${round || 'latest'}`, () =>
      this.makeRequest('/qualifying-results', { year, round })
    );
  }

  getConstructors(year = 'current') {
    return this.fetchWithCache(`constructors_${year}`, () =>
      this.makeRequest('/constructors', { year })
    );
  }

  getDrivers(year = 'current') {
    return this.fetchWithCache(`drivers_${year}`, () =>
      this.makeRequest('/drivers', { year })
    );
  }

  getCircuits(year = 'current') {
    return this.fetchWithCache(`circuits_${year}`, () =>
      this.makeRequest('/circuits', { year })
    );
  }

  async healthCheck() {
    const res = await fetch(join(this.baseUrl, '/health'));
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }

  clearCache() { this.cache.clear(); }
  getCacheStatus() {
    const now = Date.now();
    return [...this.cache.entries()].map(([key, v]) => ({
      key, age: now - v.timestamp, isValid: now - v.timestamp < this.cacheTimeout
    }));
  }

  async isAvailable() {
    try { await this.healthCheck(); return true; } catch { return false; }
  }

  // Race Prediction API
  // Race Prediction API
  async getRacePrediction(year, gpName) {
    return this.fetchWithCache(`racePrediction_${year}_${gpName}`, () => {
      const url = new URL(join(this.predictionBaseUrl, '/api/race_predict'));
      url.searchParams.append('year', year);
      url.searchParams.append('gp_name', gpName);
      
      return fetch(url.toString()).then(async res => {
        if (!res.ok) {
          const errorData = await res.json();
          const error = new Error(errorData.detail || `HTTP ${res.status}`);
          error.response = {
            status: res.status,
            data: errorData
          };
          throw error;
        }
        return res.json();
      });
    });
  }
}

export default new FastF1ApiService();
