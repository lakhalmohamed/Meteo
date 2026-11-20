/**
 * AETHER Hourly Forecast Timeline Component
 * Horizontal, smooth-scrolling timeline with animated icons and rain chances.
 */

import { formatTemp, formatHour } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weather-codes.js';
import { getWeatherSvg } from '../utils/icons.js';

export class HourlyComponent {
  constructor(containerElement, store) {
    this.container = containerElement;
    this.store = store;

    this.init();
  }

  init() {
    this.store.subscribe('weather:updated', ({ weather }) => {
      this.render(weather);
    });

    this.store.subscribe('units:changed', () => {
      if (this.store.weatherData) {
        this.render(this.store.weatherData);
      }
    });

    this.store.subscribe('timeFormat:changed', () => {
      if (this.store.weatherData) {
        this.render(this.store.weatherData);
      }
    });
  }

  render(weather) {
    if (!weather || !weather.hourly || !weather.hourly.time) return;

    const hourly = weather.hourly;
    const hoursCount = 24; // Show next 24 hours

    let itemsHtml = '';

    for (let i = 0; i < hoursCount; i++) {
      const timeIso = hourly.time[i];
      const temp = hourly.temperature_2m[i];
      const code = hourly.weather_code[i];
      const isDay = hourly.is_day[i];
      const rainProb = hourly.precipitation_probability[i] || 0;

      const isNow = i === 0;
      const timeLabel = isNow ? 'Now' : formatHour(timeIso, this.store.timeFormat);
      const meta = getWeatherMeta(code, isDay);
      const iconSvg = getWeatherSvg(meta.icon, meta.isDay, 'hourly-svg');
      const tempStr = formatTemp(temp, this.store.units);

      itemsHtml += `
        <div class="hourly-item-card ${isNow ? 'is-now' : ''}" title="${meta.label}">
          <span class="hourly-time">${timeLabel}</span>
          <div class="hourly-icon">${iconSvg}</div>
          <span class="hourly-temp">${tempStr}</span>
          ${rainProb > 0 ? `
            <span class="hourly-rain-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              ${rainProb}%
            </span>
          ` : '<span style="height:19px;"></span>'}
        </div>
      `;
    }

    this.container.innerHTML = `
      <section class="hourly-forecast-section">
        <div class="section-header">
          <div class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Hourly Outlook (Next 24h)
          </div>
        </div>

        <div class="hourly-timeline-scroll" id="hourly-scroll-container">
          ${itemsHtml}
        </div>
      </section>
    `;
  }
}
