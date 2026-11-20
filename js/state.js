/**
 * AETHER Centralized Application State Store
 * Implements a reactive Pub/Sub event bus with localStorage persistence.
 */

const STORAGE_KEYS = {
  UNITS: 'aether_units',
  TIME_FORMAT: 'aether_time_format',
  FAVORITES: 'aether_favorites',
  RECENT_SEARCHES: 'aether_recent_searches',
  LAST_CITY: 'aether_last_city',
  AUDIO_ENABLED: 'aether_audio_enabled',
  THEME_PREFERENCE: 'aether_theme_pref'
};

const DEFAULT_CITY = {
  name: 'Paris',
  country: 'France',
  country_code: 'FR',
  admin1: 'Île-de-France',
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 'Europe/Paris'
};

class StateStore {
  constructor() {
    this.events = {};
    
    // Load persisted configurations
    this.units = localStorage.getItem(STORAGE_KEYS.UNITS) || 'metric';
    this.timeFormat = localStorage.getItem(STORAGE_KEYS.TIME_FORMAT) || '24h';
    this.audioEnabled = localStorage.getItem(STORAGE_KEYS.AUDIO_ENABLED) === 'true';
    this.audioVolume = 0.45;
    this.chartTab = 'temp'; // 'temp' | 'rain' | 'wind'

    this.currentCity = this.loadSavedLastCity() || DEFAULT_CITY;
    this.weatherData = null;
    this.isOffline = !navigator.onLine;
    this.offlineCachedTime = null;
    this.isLoading = false;
    this.error = null;
    this.activeTheme = 'clear-night';

    this.favorites = this.loadFavorites();
    this.recentSearches = this.loadRecentSearches();

    // Time Machine Simulation State (0 = live, 1..23 = upcoming hour)
    this.timeMachineHour = 0;
    this.airQualityData = null;
    this.comparisonCities = []; // Array of cities being compared

    // Theme Personalization
    this.themePreference = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE) || 'system';
    this.applyThemePreference(this.themePreference);
    this.setupSystemThemeListener();
  }

  // --- Pub / Sub Event Bus ---
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in subscriber for event "${event}":`, err);
        }
      });
    }
  }

  // --- City & Location Actions ---
  setCity(city) {
    if (!city || !city.latitude || !city.longitude) return;
    this.currentCity = {
      name: city.name || 'Current Location',
      country: city.country || '',
      country_code: city.country_code || '',
      admin1: city.admin1 || '',
      latitude: Number(city.latitude),
      longitude: Number(city.longitude),
      timezone: city.timezone || 'auto'
    };

    localStorage.setItem(STORAGE_KEYS.LAST_CITY, JSON.stringify(this.currentCity));
    this.addRecentSearch(this.currentCity);
    this.emit('city:changed', this.currentCity);
  }

  loadSavedLastCity() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_CITY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // --- Weather Data Actions ---
  setWeatherData(data, isFromCache = false) {
    this.weatherData = data;
    this.isLoading = false;
    this.error = null;
    if (isFromCache) {
      this.offlineCachedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      this.offlineCachedTime = null;
    }
    this.emit('weather:updated', { weather: data, isFromCache });
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    this.emit('weather:loading', isLoading);
  }

  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.emit('weather:error', error);
  }

  // --- Dynamic Theme ---
  setTheme(themeName) {
    if (this.activeTheme === themeName) return;
    this.activeTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    this.emit('theme:changed', themeName);
  }

  // --- Unit Management ---
  setUnits(unit) {
    if (unit !== 'metric' && unit !== 'imperial') return;
    this.units = unit;
    localStorage.setItem(STORAGE_KEYS.UNITS, unit);
    this.emit('units:changed', unit);
  }

  toggleUnits() {
    this.setUnits(this.units === 'metric' ? 'imperial' : 'metric');
  }

  setTimeFormat(format) {
    this.timeFormat = format;
    localStorage.setItem(STORAGE_KEYS.TIME_FORMAT, format);
    this.emit('timeFormat:changed', format);
  }

  // --- Favorites Management ---
  loadFavorites() {
    try {
      const favs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favs ? JSON.parse(favs) : [
        { name: 'Tokyo', country: 'Japan', country_code: 'JP', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
        { name: 'New York', country: 'United States', country_code: 'US', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
        { name: 'Reykjavik', country: 'Iceland', country_code: 'IS', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' }
      ];
    } catch {
      return [];
    }
  }

  isCurrentCityFavorite() {
    return this.favorites.some(
      f => Math.abs(f.latitude - this.currentCity.latitude) < 0.05 &&
           Math.abs(f.longitude - this.currentCity.longitude) < 0.05
    );
  }

  toggleCurrentCityFavorite() {
    const isFav = this.isCurrentCityFavorite();
    if (isFav) {
      this.favorites = this.favorites.filter(
        f => !(Math.abs(f.latitude - this.currentCity.latitude) < 0.05 &&
               Math.abs(f.longitude - this.currentCity.longitude) < 0.05)
      );
    } else {
      this.favorites.unshift({
        name: this.currentCity.name,
        country: this.currentCity.country,
        country_code: this.currentCity.country_code,
        admin1: this.currentCity.admin1,
        latitude: this.currentCity.latitude,
        longitude: this.currentCity.longitude,
        timezone: this.currentCity.timezone
      });
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
    this.emit('favorites:updated', this.favorites);
  }

  removeFavorite(index) {
    if (index >= 0 && index < this.favorites.length) {
      this.favorites.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
      this.emit('favorites:updated', this.favorites);
    }
  }

  // --- Recent Searches ---
  loadRecentSearches() {
    try {
      const rec = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return rec ? JSON.parse(rec) : [];
    } catch {
      return [];
    }
  }

  addRecentSearch(city) {
    this.recentSearches = this.recentSearches.filter(
      item => !(Math.abs(item.latitude - city.latitude) < 0.05 &&
                Math.abs(item.longitude - city.longitude) < 0.05)
    );
    this.recentSearches.unshift({
      name: city.name,
      country: city.country,
      admin1: city.admin1,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone
    });
    if (this.recentSearches.length > 8) {
      this.recentSearches.pop();
    }
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(this.recentSearches));
    this.emit('recentSearches:updated', this.recentSearches);
  }

  clearRecentSearches() {
    this.recentSearches = [];
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    this.emit('recentSearches:updated', []);
  }

  // --- Network State ---
  setOfflineStatus(isOffline) {
    this.isOffline = isOffline;
    this.emit('network:status', isOffline);
  }

  // --- Audio State ---
  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
    localStorage.setItem(STORAGE_KEYS.AUDIO_ENABLED, String(enabled));
    this.emit('audio:toggle', enabled);
  }

  setAudioVolume(vol) {
    this.audioVolume = Math.max(0, Math.min(1, vol));
    this.emit('audio:volume', this.audioVolume);
  }

  // --- Chart Tabs ---
  setChartTab(tab) {
    this.chartTab = tab;
    this.emit('chart:tab', tab);
  }

  // --- Weather Time Machine ---
  setTimeMachineHour(hourIndex) {
    this.timeMachineHour = Math.max(0, Math.min(23, hourIndex));
    this.emit('timeMachine:scrub', this.timeMachineHour);
  }

  // --- Air Quality ---
  setAirQualityData(data) {
    this.airQualityData = data;
    this.emit('airQuality:updated', data);
  }

  // --- Weather Comparison ---
  setComparisonCities(cities) {
    this.comparisonCities = cities;
    this.emit('comparison:updated', cities);
  }

  // --- Theme & Appearance Preference ---
  applyThemePreference(pref) {
    let resolved = pref;
    if (pref === 'system') {
      resolved = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-mode', resolved);
    }
    return resolved;
  }

  setThemePreference(pref) {
    if (pref !== 'dark' && pref !== 'light' && pref !== 'system') return;
    this.themePreference = pref;
    localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, pref);
    this.applyThemePreference(pref);
    this.emit('themePreference:changed', pref);
  }

  setupSystemThemeListener() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', () => {
        if (this.themePreference === 'system') {
          this.applyThemePreference('system');
          this.emit('themePreference:changed', 'system');
        }
      });
    }
  }
}

export const store = new StateStore();
