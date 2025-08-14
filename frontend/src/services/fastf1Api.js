// FastF1 API Service - Uses Flask backend API

class FastF1ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async fetchWithCache(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      console.log('Fetching from API:', key);
      const data = await fetchFunction();
      console.log('Data received from API:', data);
      
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('API fetch error for key:', key);
      console.error('Error details:', error);
      throw error;
    }
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Driver Standings
  async getDriverStandings(year = 'current') {
    return this.fetchWithCache(`driverStandings_${year}`, async () => {
      return this.makeRequest('/driver-standings', { year });
    });
  }

  // Constructor Standings
  async getConstructorStandings(year = 'current') {
    return this.fetchWithCache(`constructorStandings_${year}`, async () => {
      return this.makeRequest('/constructor-standings', { year });
    });
  }

  // Season Schedule
  async getSeasonSchedule(year = 'current') {
    return this.fetchWithCache(`schedule_${year}`, async () => {
      return this.makeRequest('/season-schedule', { year });
    });
  }

  // Race Results
  async getRaceResults(year = 'current', round = null) {
    const key = `raceResults_${year}_${round || 'latest'}`;
    return this.fetchWithCache(key, async () => {
      return this.makeRequest('/race-results', { year, round });
    });
  }

  // Qualifying Results
  async getQualifyingResults(year = 'current', round = null) {
    const key = `qualifying_${year}_${round || 'latest'}`;
    return this.fetchWithCache(key, async () => {
      return this.makeRequest('/qualifying-results', { year, round });
    });
  }

  // Constructor List
  async getConstructors(year = 'current') {
    return this.fetchWithCache(`constructors_${year}`, async () => {
      return this.makeRequest('/constructors', { year });
    });
  }

  // Driver List
  async getDrivers(year = 'current') {
    return this.fetchWithCache(`drivers_${year}`, async () => {
      return this.makeRequest('/drivers', { year });
    });
  }

  // Circuit List
  async getCircuits(year = 'current') {
    return this.fetchWithCache(`circuits_${year}`, async () => {
      return this.makeRequest('/circuits', { year });
    });
  }

  // Lap Times for a specific race
  async getLapTimes(year = 'current', round, lap = null) {
    const key = `lapTimes_${year}_${round}_${lap || 'all'}`;
    return this.fetchWithCache(key, async () => {
      // This endpoint would need to be implemented in the backend
      throw new Error('Lap times endpoint not yet implemented');
    });
  }

  // Pit Stops for a specific race
  async getPitStops(year = 'current', round) {
    const key = `pitStops_${year}_${round}`;
    return this.fetchWithCache(key, async () => {
      // This endpoint would need to be implemented in the backend
      throw new Error('Pit stops endpoint not yet implemented');
    });
  }

  // Fastest Laps for a specific race
  async getFastestLaps(year = 'current', round) {
    const key = `fastestLaps_${year}_${round}`;
    return this.fetchWithCache(key, async () => {
      // This endpoint would need to be implemented in the backend
      throw new Error('Fastest laps endpoint not yet implemented');
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.json();
    } catch (error) {
      throw new Error('Backend API is not available');
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache status
  getCacheStatus() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, data]) => ({
      key,
      age: now - data.timestamp,
      isValid: now - data.timestamp < this.cacheTimeout
    }));
    return entries;
  }

  // Check if API is available
  async isAvailable() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new FastF1ApiService();
