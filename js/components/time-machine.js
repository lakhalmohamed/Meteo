/**
 * AETHER Weather Time Machine Component
 * Allows users to scrub through upcoming 24-hour forecast telemetry and simulate atmospheric conditions.
 */

import { formatTemp, formatWind, formatHour, getCardinalDirection } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weather-codes.js';
import { getWeatherSvg } from '../utils/icons.js';

export class TimeMachineComponent {
  constructor(containerElement, store) {
    this.container = containerElement;
    this.store = store;
    this.slider = null;
    this.resetBtn = null;
    this.hourly = null;

    this.init();
  }

  init() {
    this.store.subscribe('weather:updated', ({ weather }) => {
      if (weather && weather.hourly) {
        this.hourly = weather.hourly;
        this.render();
      }
    });

    this.store.subscribe('units:changed', () => {
      if (this.hourly) {
        this.render();
      }
    });

    this.store.subscribe('timeFormat:changed', () => {
      if (this.hourly) {
        this.render();
      }
    });

    this.store.subscribe('timeMachine:scrub', (hourIndex) => {
      this.updateSimulationState(hourIndex);
    });
  }

  render() {
    if (!this.hourly || !this.hourly.time) return;

    const count = Math.min(24, this.hourly.time.length);
    const curHour = this.store.timeMachineHour || 0;
    const isLive = curHour === 0;

    // Current scrubbed values
    const timeIso = this.hourly.time[curHour];
    const temp = this.hourly.temperature_2m[curHour];
    const code = this.hourly.weather_code[curHour];
    const isDay = this.hourly.is_day[curHour];
    const rainProb = this.hourly.precipitation_probability ? this.hourly.precipitation_probability[curHour] : 0;
    const windSpeed = this.hourly.wind_speed_10m ? this.hourly.wind_speed_10m[curHour] : 0;
    const windDir = this.hourly.wind_direction_10m ? this.hourly.wind_direction_10m[curHour] : 0;

    const meta = getWeatherMeta(code, isDay);
    const hourLabel = isLive ? 'Current Hour (Live)' : formatHour(timeIso, this.store.timeFormat);
    const tempStr = formatTemp(temp, this.store.units);
    const windStr = formatWind(windSpeed, this.store.units);
    const cardinal = getCardinalDirection(windDir);

    this.container.innerHTML = `
      <section class="glass-panel time-machine-panel" aria-label="Weather Time Machine">
        <div class="time-machine-header">
          <div class="time-machine-title-wrap">
            <div class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 14 10"/>
                <path d="M12 2v2M12 20v2M20 12h2M2 12h2"/>
              </svg>
              Weather Time Machine
            </div>
            <p class="time-machine-subtitle">
              Scrub the timeline to simulate atmospheric conditions across the next 24 hours.
            </p>
          </div>

          <div class="time-machine-controls-top">
            <div class="time-machine-status-badge ${isLive ? 'is-live' : 'is-simulated'}">
              <span class="status-indicator-dot"></span>
              <span>${isLive ? 'LIVE TELEMETRY' : `SIMULATED: +${curHour}h (${hourLabel})`}</span>
            </div>

            <button class="time-machine-reset-btn ${isLive ? 'disabled' : ''}" id="time-machine-reset" title="Reset to current live conditions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span>Reset to Now</span>
            </button>
          </div>
        </div>

        <!-- Interactive Scrubber -->
        <div class="time-machine-scrubber-wrap">
          <div class="scrubber-track-container">
            <input type="range" 
                   class="time-machine-slider" 
                   id="time-machine-range" 
                   min="0" 
                   max="${count - 1}" 
                   step="1" 
                   value="${curHour}" 
                   aria-label="Time Machine hour slider" />

            <!-- Track Ticks and Labels -->
            <div class="time-machine-ticks">
              ${Array.from({ length: 9 }).map((_, idx) => {
                const hIdx = Math.min(count - 1, idx * 3);
                const tIso = this.hourly.time[hIdx];
                const hLabel = hIdx === 0 ? 'Now' : formatHour(tIso, this.store.timeFormat);
                const isDayTick = this.hourly.is_day[hIdx];
                return `
                  <div class="tick-mark ${hIdx === curHour ? 'active' : ''}" style="left: ${(hIdx / (count - 1)) * 100}%;">
                    <span class="tick-label">${hLabel}</span>
                    <span class="tick-sub">${isDayTick ? '☀️' : '🌙'}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Telemetry Snapshot at Scrubbed Hour -->
        <div class="time-machine-snapshot-grid">
          
          <div class="snapshot-card">
            <div class="snapshot-label">Simulated Temp</div>
            <div class="snapshot-val" style="color:var(--theme-primary);">${tempStr}</div>
            <div class="snapshot-sub">${meta.label}</div>
          </div>

          <div class="snapshot-card">
            <div class="snapshot-label">Atmosphere & Sky</div>
            <div class="snapshot-icon-row">
              <div class="snapshot-mini-icon">${getWeatherSvg(meta.icon, meta.isDay, 'tm-icon')}</div>
              <span>${isDay ? 'Daytime' : 'Night Sky'}</span>
            </div>
            <div class="snapshot-sub">${meta.theme.replace('-', ' ').toUpperCase()}</div>
          </div>

          <div class="snapshot-card">
            <div class="snapshot-label">Precipitation Chance</div>
            <div class="snapshot-val" style="color:#38bdf8;">${rainProb}%</div>
            <div class="snapshot-sub">${rainProb > 50 ? 'Precipitation expected' : rainProb > 20 ? 'Isolated showers' : 'Dry conditions'}</div>
          </div>

          <div class="snapshot-card">
            <div class="snapshot-label">Wind Velocity</div>
            <div class="snapshot-val">${windStr}</div>
            <div class="snapshot-sub">${cardinal} · ${windDir}°</div>
          </div>

        </div>

        <!-- Quick Jump Preset Chips -->
        <div class="time-machine-presets">
          <span class="presets-label">Quick Jump:</span>
          <button class="preset-chip ${curHour === 0 ? 'active' : ''}" data-hour="0">Now</button>
          <button class="preset-chip ${curHour === 3 ? 'active' : ''}" data-hour="3">+3 Hours</button>
          <button class="preset-chip ${curHour === 6 ? 'active' : ''}" data-hour="6">+6 Hours</button>
          <button class="preset-chip ${curHour === 12 ? 'active' : ''}" data-hour="12">+12 Hours</button>
          <button class="preset-chip" id="preset-evening-btn">Evening</button>
          <button class="preset-chip" id="preset-dawn-btn">Tomorrow Dawn</button>
        </div>

      </section>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.slider = document.getElementById('time-machine-range');
    this.resetBtn = document.getElementById('time-machine-reset');

    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        const h = parseInt(e.target.value, 10);
        this.store.setTimeMachineHour(h);
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.store.setTimeMachineHour(0);
        if (this.slider) this.slider.value = 0;
      });
    }

    // Preset buttons
    this.container.querySelectorAll('.preset-chip[data-hour]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const h = parseInt(btn.getAttribute('data-hour'), 10);
        this.store.setTimeMachineHour(h);
        if (this.slider) this.slider.value = h;
      });
    });

    const eveningBtn = document.getElementById('preset-evening-btn');
    if (eveningBtn && this.hourly) {
      eveningBtn.addEventListener('click', () => {
        // Find hour around 18:00 (6 PM)
        const targetIdx = this.findHourIndex(18);
        this.store.setTimeMachineHour(targetIdx);
        if (this.slider) this.slider.value = targetIdx;
      });
    }

    const dawnBtn = document.getElementById('preset-dawn-btn');
    if (dawnBtn && this.hourly) {
      dawnBtn.addEventListener('click', () => {
        // Find hour around 06:00 (6 AM tomorrow)
        const targetIdx = this.findHourIndex(6, true);
        this.store.setTimeMachineHour(targetIdx);
        if (this.slider) this.slider.value = targetIdx;
      });
    }
  }

  findHourIndex(targetHour, lookAheadNextDay = false) {
    if (!this.hourly || !this.hourly.time) return 0;
    const count = Math.min(24, this.hourly.time.length);
    for (let i = lookAheadNextDay ? 6 : 0; i < count; i++) {
      const d = new Date(this.hourly.time[i]);
      if (d.getHours() === targetHour) {
        return i;
      }
    }
    return Math.min(count - 1, targetHour);
  }

  updateSimulationState(hourIndex) {
    // Re-render UI to update snapshot values and active presets
    this.render();
  }
}
