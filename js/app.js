/**
 * AETHER Main Application Orchestrator
 * Bootstraps Single Page Application architecture, reactive stores, living visual engine,
 * and high-order meteorological components (Time Machine, Insights, Explorer, Comparison).
 */

import { store } from './state.js';
import { fetchForecast, fetchAirQuality, reverseGeocode } from './api.js';
import { getWeatherMeta } from './utils/weather-codes.js';
import { WeatherEngine } from './weather-engine.js';
import { audioEngine } from './audio-engine.js';
import { ForecastChart } from './chart.js';
import { HeroComponent } from './components/hero.js';
import { HourlyComponent } from './components/hourly.js';
import { DailyComponent } from './components/daily.js';
import { DetailsComponent } from './components/details.js';
import { SearchComponent } from './components/search.js';
import { FavoritesComponent } from './components/favorites.js';
import { TimeMachineComponent } from './components/time-machine.js';
import { InsightsComponent } from './components/insights.js';
import { WorldExplorerComponent } from './components/world-explorer.js';
import { SettingsComponent } from './components/settings.js';
import { PwaManager } from './pwa-manager.js';

class AetherApp {
  constructor() {
    this.weatherEngine = null;
    this.chart = null;
    this.hero = null;
    this.hourly = null;
    this.daily = null;
    this.details = null;
    this.search = null;
    this.favorites = null;
    this.timeMachine = null;
    this.insights = null;
    this.explorer = null;
    this.settings = null;
    this.pwa = null;
  }

  async init() {
    console.log('🚀 Initializing AETHER Living Weather System...');

    // 1. Initialize Visual Background Engine
    const canvas = document.getElementById('weather-canvas');
    const flashOverlay = document.getElementById('lightning-flash-overlay');
    this.weatherEngine = new WeatherEngine(canvas, flashOverlay);

    // 2. Initialize UI Components
    const heroContainer = document.getElementById('hero-weather-container');
    this.hero = new HeroComponent(heroContainer, store);

    const timeMachineContainer = document.getElementById('time-machine-container');
    this.timeMachine = new TimeMachineComponent(timeMachineContainer, store);

    const hourlyContainer = document.getElementById('hourly-forecast-container');
    this.hourly = new HourlyComponent(hourlyContainer, store);

    const dailyContainer = document.getElementById('daily-forecast-container');
    this.daily = new DailyComponent(dailyContainer, store);

    const detailsContainer = document.getElementById('weather-details-container');
    this.details = new DetailsComponent(detailsContainer, store);

    const insightsContainer = document.getElementById('weather-insights-container');
    this.insights = new InsightsComponent(insightsContainer, store);

    const chartCanvas = document.getElementById('forecast-chart-canvas');
    const chartTooltip = document.getElementById('chart-tooltip');
    this.chart = new ForecastChart(chartCanvas, chartTooltip, store);

    // Modals & Drawers
    const searchModal = document.getElementById('search-modal-backdrop');
    const searchTriggerBtn = document.getElementById('header-search-btn');
    this.search = new SearchComponent(searchModal, searchTriggerBtn, store);

    const favBackdrop = document.getElementById('favorites-drawer-backdrop');
    const favTriggerBtn = document.getElementById('header-favorites-btn');
    this.favorites = new FavoritesComponent(favBackdrop, favTriggerBtn, store);

    const explorerBackdrop = document.getElementById('world-explorer-backdrop');
    const explorerBtn = document.getElementById('header-explorer-btn');
    this.explorer = new WorldExplorerComponent(explorerBackdrop, explorerBtn, store);

    // Settings modal is now handled via inline HTML/onclick handlers

    const installBtn = document.getElementById('header-pwa-install-btn');
    const offlineBanner = document.getElementById('offline-notification-banner');
    this.pwa = new PwaManager(store, installBtn, offlineBanner);

    // 3. Attach Global Event Listeners
    this.attachHeaderControls();
    this.attachAudioControls();
    this.attachChartTabs();

    // 4. Reactive Weather Synchronization
    store.subscribe('city:changed', (city) => {
      // Reset time machine to live mode on city change
      store.setTimeMachineHour(0);
      this.loadWeatherForCity(city);
    });

    store.subscribe('weather:updated', ({ weather }) => {
      this.onWeatherUpdated(weather);
    });

    // React to Time Machine scrubbing to dynamically adapt visual canvas atmosphere
    store.subscribe('timeMachine:scrub', (hourOffset) => {
      this.onTimeMachineScrub(hourOffset);
    });

    // 5. Handle URL Actions (PWA Shortcuts or Direct Links)
    this.handleUrlActions();

    // 6. Load Initial Weather Data
    await this.loadWeatherForCity(store.currentCity);
  }

  attachHeaderControls() {
    // Unit Toggle Pill (°C / °F)
    const unitCelsiusBtn = document.getElementById('unit-celsius-btn');
    const unitFahrenheitBtn = document.getElementById('unit-fahrenheit-btn');

    const updateUnitButtons = (unit) => {
      unitCelsiusBtn.classList.toggle('active', unit === 'metric');
      unitFahrenheitBtn.classList.toggle('active', unit === 'imperial');
    };

    updateUnitButtons(store.units);

    unitCelsiusBtn.addEventListener('click', () => {
      store.setUnits('metric');
      updateUnitButtons('metric');
    });

    unitFahrenheitBtn.addEventListener('click', () => {
      store.setUnits('imperial');
      updateUnitButtons('imperial');
    });

    // Geolocation "Locate Me" Button
    const geolocateBtn = document.getElementById('header-locate-btn');
    if (geolocateBtn) {
      geolocateBtn.addEventListener('click', () => this.handleGeolocation());
    }
  }

  attachAudioControls() {
    const audioToggleBtn = document.getElementById('soundscape-toggle-btn');
    const audioVolumeSlider = document.getElementById('soundscape-volume-slider');

    if (audioToggleBtn) {
      audioToggleBtn.addEventListener('click', () => {
        const newState = !store.audioEnabled;
        store.setAudioEnabled(newState);

        audioToggleBtn.classList.toggle('is-playing', newState);
        if (newState) {
          const currentMeta = store.weatherData && store.weatherData.current
            ? getWeatherMeta(store.weatherData.current.weather_code, store.weatherData.current.is_day)
            : { audio: 'breeze' };
          audioEngine.play(currentMeta.audio);
        } else {
          audioEngine.stop();
        }
      });
    }

    if (audioVolumeSlider) {
      audioVolumeSlider.value = store.audioVolume;
      audioVolumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        store.setAudioVolume(val);
        audioEngine.setVolume(val);
      });
    }
  }

  attachChartTabs() {
    const tabButtons = document.querySelectorAll('.chart-tab-btn');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        store.setChartTab(tab);
      });
    });
  }

  handleUrlActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (action === 'search' && this.search) {
      setTimeout(() => this.search.open(), 300);
    } else if (action === 'favorites' && this.favorites) {
      setTimeout(() => this.favorites.open(), 300);
    } else if (action === 'geolocate') {
      setTimeout(() => this.handleGeolocation(), 300);
    } else if (action === 'explorer' && this.explorer) {
      setTimeout(() => this.explorer.open(), 300);
    } else if (action === 'compare' && this.comparison) {
      setTimeout(() => this.comparison.open(), 300);
    }
  }

  async handleGeolocation() {
    const geolocateBtn = document.getElementById('header-locate-btn');
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    if (geolocateBtn) {
      geolocateBtn.classList.add('locating-pulse');
      geolocateBtn.setAttribute('disabled', 'true');
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (geolocateBtn) {
          geolocateBtn.classList.remove('locating-pulse');
          geolocateBtn.removeAttribute('disabled');
        }

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const geoInfo = await reverseGeocode(lat, lon);
          store.setCity({
            name: geoInfo.name,
            country: geoInfo.country,
            country_code: geoInfo.country_code,
            admin1: geoInfo.admin1,
            latitude: lat,
            longitude: lon,
            timezone: 'auto'
          });
        } catch (err) {
          console.warn('Geolocation reverse error:', err);
          store.setCity({
            name: 'Current Location',
            country: '',
            latitude: lat,
            longitude: lon,
            timezone: 'auto'
          });
        }
      },
      (err) => {
        if (geolocateBtn) {
          geolocateBtn.classList.remove('locating-pulse');
          geolocateBtn.removeAttribute('disabled');
        }

        let message = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location access was denied. You can search for your city using the search bar.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }
        alert(message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async loadWeatherForCity(city) {
    store.setLoading(true);

    try {
      // Parallel fetch of Forecast Telemetry and Atmospheric Air Quality
      const [forecastRes, airQualityData] = await Promise.all([
        fetchForecast(city.latitude, city.longitude, city.timezone),
        fetchAirQuality(city.latitude, city.longitude)
      ]);

      store.setWeatherData(forecastRes.data, forecastRes.isFromCache);
      if (airQualityData) {
        store.setAirQualityData(airQualityData);
      }
    } catch (err) {
      console.error('[AETHER] Failed to load weather:', err);
      store.setError(err.message || 'Unable to retrieve real-time weather information.');
    }
  }

  onWeatherUpdated(weather) {
    if (!weather || !weather.current) return;

    const current = weather.current;
    const meta = getWeatherMeta(current.weather_code, current.is_day);

    // Dynamic Weather Theme
    store.setTheme(meta.theme);

    // Calculate precipitation intensity (0.5 = drizzle, 1.0 = normal, 2.0 = heavy)
    const precip = current.precipitation || 0;
    const intensity = Math.max(0.6, Math.min(2.5, precip > 0 ? precip * 0.8 + 0.6 : 1.0));

    // Update Living Atmospheric Canvas Engine
    if (this.weatherEngine) {
      this.weatherEngine.setWeather(meta.theme, intensity);
    }

    // Update Audio Soundscape Preset if active
    if (store.audioEnabled) {
      audioEngine.setPreset(meta.audio);
    }
  }

  onTimeMachineScrub(hourOffset) {
    if (!this.weatherEngine || !store.weatherData || !store.weatherData.hourly) return;

    if (hourOffset === 0) {
      // Restore live real-time conditions
      this.onWeatherUpdated(store.weatherData);
      return;
    }

    const hourly = store.weatherData.hourly;
    const code = hourly.weather_code[hourOffset];
    const isDay = hourly.is_day[hourOffset];
    const precip = hourly.precipitation ? hourly.precipitation[hourOffset] : 0;
    const meta = getWeatherMeta(code, isDay);

    store.setTheme(meta.theme);
    const intensity = Math.max(0.6, Math.min(2.5, precip > 0 ? precip * 0.8 + 0.6 : 1.0));
    this.weatherEngine.setWeather(meta.theme, intensity);

    if (store.audioEnabled) {
      audioEngine.setPreset(meta.audio);
    }
  }
}

// Bootstrap app on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new AetherApp();
  app.init();
});
