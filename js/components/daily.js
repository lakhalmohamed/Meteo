/**
 * AETHER 7-Day Forecast Component
 * Displays 7-day daily forecast with proportional min-max temperature range bars.
 */

import { formatTemp, formatDayLabel, formatShortDate } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weather-codes.js';
import { getWeatherSvg } from '../utils/icons.js';

export class DailyComponent {
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
  }

  render(weather) {
    if (!weather || !weather.daily || !weather.daily.time) return;

    const daily = weather.daily;
    const currentTemp = weather.current ? weather.current.temperature_2m : null;
    const daysCount = Math.min(daily.time.length, 7);

    // Compute weekly global min and max for proportion bars
    const allMins = daily.temperature_2m_min.slice(0, daysCount);
    const allMaxs = daily.temperature_2m_max.slice(0, daysCount);
    const weekMin = Math.min(...allMins);
    const weekMax = Math.max(...allMaxs);
    const weekRange = (weekMax - weekMin) || 1;

    let rowsHtml = '';

    for (let i = 0; i < daysCount; i++) {
      const dateIso = daily.time[i];
      const dayMin = daily.temperature_2m_min[i];
      const dayMax = daily.temperature_2m_max[i];
      const code = daily.weather_code[i];
      const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

      const meta = getWeatherMeta(code, 1);
      const iconSvg = getWeatherSvg(meta.icon, true, 'daily-svg');

      const isToday = i === 0;
      const dayLabel = formatDayLabel(dateIso, i);
      const shortDate = formatShortDate(dateIso);

      const minStr = formatTemp(dayMin, this.store.units);
      const maxStr = formatTemp(dayMax, this.store.units);

      // Bar percentages
      const leftPercent = Math.max(0, Math.min(100, ((dayMin - weekMin) / weekRange) * 100));
      const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((dayMax - dayMin) / weekRange) * 100));

      // Today's current temperature dot position
      let currentDotHtml = '';
      if (isToday && currentTemp !== null) {
        const dotOffset = Math.max(0, Math.min(100, ((currentTemp - weekMin) / weekRange) * 100));
        currentDotHtml = `<div class="temp-current-dot" style="left: ${dotOffset}%;" title="Current Temp: ${formatTemp(currentTemp, this.store.units)}"></div>`;
      }

      rowsHtml += `
        <div class="daily-forecast-row ${isToday ? 'is-today' : ''}" title="${meta.label}">
          <div class="daily-day-info">
            <span class="daily-day-name">${dayLabel}</span>
            <span class="daily-day-date">${shortDate}</span>
          </div>

          <div class="daily-icon-wrap">
            <div class="daily-icon">${iconSvg}</div>
          </div>

          <div class="daily-temp-bar-container">
            <span class="daily-temp-min">${minStr}</span>
            <div class="temp-track-bar">
              <div class="temp-fill-bar" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
              ${currentDotHtml}
            </div>
            <span class="daily-temp-max">${maxStr}</span>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="glass-panel daily-forecast-panel">
        <div class="section-header" style="margin-bottom: 0.5rem;">
          <div class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            7-Day Forecast
          </div>
        </div>

        <div class="daily-forecast-list">
          ${rowsHtml}
        </div>
      </div>
    `;
  }
}
