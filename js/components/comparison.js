/**
 * AETHER Weather Comparison Component
 * Side-by-side meteorological comparison of two or more cities using real-time Open-Meteo telemetry.
 */

import { formatTemp, formatWind } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weather-codes.js';
import { getWeatherSvg } from '../utils/icons.js';
import { fetchForecast } from '../api.js';

export class ComparisonComponent {
  constructor(modalBackdropElement, triggerBtnElement, store) {
    this.modal = modalBackdropElement;
    this.triggerBtn = triggerBtnElement;
    this.store = store;

    this.comparedCity = null;
    this.comparedWeather = null;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.renderStructure();
    this.attachEvents();

    this.store.subscribe('city:changed', () => {
      if (this.isOpen()) {
        this.renderComparison();
      }
    });

    this.store.subscribe('units:changed', () => {
      if (this.isOpen()) {
        this.renderComparison();
      }
    });
  }

  renderStructure() {
    this.modal.innerHTML = `
      <div class="comparison-dialog" role="dialog" aria-modal="true" aria-label="City Weather Comparison">
        <div class="comparison-header">
          <div class="comparison-title-wrap">
            <div class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="9" height="18" rx="2"/>
                <rect x="13" y="3" width="9" height="18" rx="2"/>
              </svg>
              Meteorological Comparison
            </div>
            <span class="comparison-subtitle">Side-by-side telemetry comparison of current city against global destinations.</span>
          </div>

          <button class="modal-close-btn" id="comparison-modal-close" title="Close (Esc)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- City Selector Quick Bar -->
        <div class="comparison-selector-bar">
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Compare with:</span>
          <div class="comparison-chips-list" id="comparison-presets-chips"></div>
        </div>

        <!-- Comparison Cards Viewport -->
        <div class="comparison-cards-grid" id="comparison-cards-content">
          <div style="text-align:center; padding:3rem; color:var(--text-muted);">
            Select a target city above to compare telemetry.
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.open());
    }

    document.getElementById('comparison-modal-close').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
  }

  open() {
    this.modal.classList.add('is-open');
    this.renderPresets();

    // Default compared city: First favorite or Tokyo
    if (!this.comparedCity) {
      const defaultTarget = this.store.favorites[0] || {
        name: 'Tokyo',
        country: 'Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo'
      };
      this.selectTargetCity(defaultTarget);
    } else {
      this.renderComparison();
    }
  }

  close() {
    this.modal.classList.remove('is-open');
  }

  isOpen() {
    return this.modal.classList.contains('is-open');
  }

  renderPresets() {
    const list = document.getElementById('comparison-presets-chips');
    if (!list) return;

    // Combine favorites and popular benchmark cities
    const candidates = [
      ...this.store.favorites,
      { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
      { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
      { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
      { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
      { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' }
    ];

    // Filter out current city
    const curCity = this.store.currentCity;
    const unique = [];
    candidates.forEach(c => {
      if (Math.abs(c.latitude - curCity.latitude) > 0.1 &&
          !unique.some(u => u.name === c.name)) {
        unique.push(c);
      }
    });

    list.innerHTML = unique.map((c, i) => `
      <button class="comparison-chip-btn ${this.comparedCity && this.comparedCity.name === c.name ? 'active' : ''}" 
              data-city-idx="${i}">
        ${c.name}
      </button>
    `).join('');

    list.querySelectorAll('.comparison-chip-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        this.selectTargetCity(unique[i]);
      });
    });
  }

  async selectTargetCity(city) {
    this.comparedCity = city;
    this.isLoading = true;
    this.renderPresets();

    const container = document.getElementById('comparison-cards-content');
    if (container) {
      container.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; gap:0.6rem; padding:3rem; color:var(--text-muted);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="locating-pulse" style="width:20px;height:20px;">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <span>Retrieving atmospheric telemetry for ${city.name}...</span>
        </div>
      `;
    }

    try {
      const res = await fetchForecast(city.latitude, city.longitude, city.timezone);
      this.comparedWeather = res.data;
      this.isLoading = false;
      this.renderComparison();
    } catch (err) {
      this.isLoading = false;
      if (container) {
        container.innerHTML = `
          <div style="text-align:center; padding:2rem; color:#ef4444;">
            Failed to load weather for ${city.name}: ${err.message}
          </div>
        `;
      }
    }
  }

  renderComparison() {
    const container = document.getElementById('comparison-cards-content');
    if (!container || !this.comparedWeather || !this.store.weatherData) return;

    const cityA = this.store.currentCity;
    const weatherA = this.store.weatherData;

    const cityB = this.comparedCity;
    const weatherB = this.comparedWeather;

    // Metrics for City A
    const curA = weatherA.current || {};
    const dailyA = weatherA.daily || {};
    const tempA = curA.temperature_2m || 0;
    const metaA = getWeatherMeta(curA.weather_code, curA.is_day);
    const humidityA = curA.relative_humidity_2m || 0;
    const windA = curA.wind_speed_10m || 0;
    const highA = dailyA.temperature_2m_max ? dailyA.temperature_2m_max[0] : tempA;
    const lowA = dailyA.temperature_2m_min ? dailyA.temperature_2m_min[0] : tempA;
    const rainA = dailyA.precipitation_probability_max ? dailyA.precipitation_probability_max[0] : 0;
    const uvA = dailyA.uv_index_max ? dailyA.uv_index_max[0] : 0;

    // Metrics for City B
    const curB = weatherB.current || {};
    const dailyB = weatherB.daily || {};
    const tempB = curB.temperature_2m || 0;
    const metaB = getWeatherMeta(curB.weather_code, curB.is_day);
    const humidityB = curB.relative_humidity_2m || 0;
    const windB = curB.wind_speed_10m || 0;
    const highB = dailyB.temperature_2m_max ? dailyB.temperature_2m_max[0] : tempB;
    const lowB = dailyB.temperature_2m_min ? dailyB.temperature_2m_min[0] : tempB;
    const rainB = dailyB.precipitation_probability_max ? dailyB.precipitation_probability_max[0] : 0;
    const uvB = dailyB.uv_index_max ? dailyB.uv_index_max[0] : 0;

    // Calculate Deltas
    const tempDiff = Math.round(tempA - tempB);
    const humidityDiff = Math.round(humidityA - humidityB);
    const windDiff = Math.round(windA - windB);

    container.innerHTML = `
      <div class="comparison-side-by-side">
        
        <!-- City A Card -->
        <div class="comparison-column glass-panel">
          <div class="comparison-badge-tag">Current City</div>
          <div class="comparison-city-name">${cityA.name}</div>
          <div class="comparison-city-country">${cityA.country}</div>

          <div class="comparison-hero-metric">
            <span class="comp-temp-val">${formatTemp(tempA, this.store.units)}</span>
            <div class="comp-icon-box">${getWeatherSvg(metaA.icon, metaA.isDay, 'comp-svg')}</div>
          </div>
          <div class="comp-condition-label">${metaA.label}</div>

          <div class="comparison-metrics-list">
            <div class="comp-metric-row">
              <span class="m-label">Day Range</span>
              <span class="m-val">${formatTemp(lowA, this.store.units)} ~ ${formatTemp(highA, this.store.units)}</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Humidity</span>
              <span class="m-val">${humidityA}%</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Wind Velocity</span>
              <span class="m-val">${formatWind(windA, this.store.units)}</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Rain Chance</span>
              <span class="m-val" style="color:#38bdf8;">${rainA}%</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Max UV Index</span>
              <span class="m-val">${Math.round(uvA)}</span>
            </div>
          </div>
        </div>

        <!-- Delta / Comparison Indicator Column -->
        <div class="comparison-delta-column">
          <div class="delta-circle-pill">VS</div>
          <div class="delta-stat-badge ${tempDiff > 0 ? 'warmer' : tempDiff < 0 ? 'cooler' : 'equal'}">
            ${tempDiff > 0 ? `+${tempDiff}° Warmer` : tempDiff < 0 ? `${tempDiff}° Cooler` : 'Equal Temp'}
          </div>
          <div class="delta-sub-stat">
            ${humidityDiff !== 0 ? `${Math.abs(humidityDiff)}% ${humidityDiff > 0 ? 'more humid' : 'drier'}` : 'Equal humidity'}
          </div>
          <div class="delta-sub-stat">
            ${windDiff !== 0 ? `${Math.abs(windDiff)} km/h ${windDiff > 0 ? 'windier' : 'calmer'}` : 'Equal wind'}
          </div>
        </div>

        <!-- City B Card -->
        <div class="comparison-column glass-panel">
          <div class="comparison-badge-tag" style="background:rgba(56,189,248,0.15); color:#38bdf8;">Comparison Target</div>
          <div class="comparison-city-name">${cityB.name}</div>
          <div class="comparison-city-country">${cityB.country}</div>

          <div class="comparison-hero-metric">
            <span class="comp-temp-val">${formatTemp(tempB, this.store.units)}</span>
            <div class="comp-icon-box">${getWeatherSvg(metaB.icon, metaB.isDay, 'comp-svg')}</div>
          </div>
          <div class="comp-condition-label">${metaB.label}</div>

          <div class="comparison-metrics-list">
            <div class="comp-metric-row">
              <span class="m-label">Day Range</span>
              <span class="m-val">${formatTemp(lowB, this.store.units)} ~ ${formatTemp(highB, this.store.units)}</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Humidity</span>
              <span class="m-val">${humidityB}%</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Wind Velocity</span>
              <span class="m-val">${formatWind(windB, this.store.units)}</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Rain Chance</span>
              <span class="m-val" style="color:#38bdf8;">${rainB}%</span>
            </div>
            <div class="comp-metric-row">
              <span class="m-label">Max UV Index</span>
              <span class="m-val">${Math.round(uvB)}</span>
            </div>
          </div>

          <button class="search-trigger-btn" id="comp-switch-city-btn" style="width:100%; margin-top:1rem; justify-content:center;">
            <span>Switch to ${cityB.name}</span>
          </button>
        </div>

      </div>
    `;

    const switchBtn = document.getElementById('comp-switch-city-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.store.setCity(this.comparedCity);
        this.close();
      });
    }
  }
}
