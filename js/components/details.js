/**
 * AETHER Weather Details Grid Component
 * Renders 8 specialized detail cards with custom interactive micro-visualizations.
 */

import {
  formatWind,
  formatPressure,
  getCardinalDirection,
  getBeaufortScale,
  getUvCategory,
  getHumidityComfort,
  getVisibilityDescription,
  formatHour
} from '../utils/formatters.js';

export class DetailsComponent {
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
    if (!weather || !weather.current) return;

    const current = weather.current;
    const daily = weather.daily || {};
    const hourly = weather.hourly || {};
    const units = this.store.units;

    // 1. Wind & Compass
    const windSpeed = current.wind_speed_10m || 0;
    const windDeg = current.wind_direction_10m || 0;
    const cardinal = getCardinalDirection(windDeg);
    const beaufort = getBeaufortScale(windSpeed);
    const formattedWind = formatWind(windSpeed, units);

    // 2. Sunrise & Sunset Solar Arc
    const sunriseIso = daily.sunrise ? daily.sunrise[0] : null;
    const sunsetIso = daily.sunset ? daily.sunset[0] : null;
    let sunriseTime = '--:--';
    let sunsetTime = '--:--';
    let sunProgress = 0.5; // 0 to 1
    let sunStatusNote = 'Daylight active';

    if (sunriseIso && sunsetIso) {
      sunriseTime = formatHour(sunriseIso, this.store.timeFormat);
      sunsetTime = formatHour(sunsetIso, this.store.timeFormat);

      const nowMs = Date.now();
      const riseMs = new Date(sunriseIso).getTime();
      const setMs = new Date(sunsetIso).getTime();

      if (nowMs < riseMs) {
        sunProgress = 0;
        const diffHrs = Math.max(0, ((riseMs - nowMs) / 3600000)).toFixed(1);
        sunStatusNote = `Dawn in ~${diffHrs}h`;
      } else if (nowMs > setMs) {
        sunProgress = 1;
        sunStatusNote = `Dusk passed. Night sky active.`;
      } else {
        sunProgress = (nowMs - riseMs) / (setMs - riseMs);
        const remainingHrs = Math.max(0, ((setMs - nowMs) / 3600000)).toFixed(1);
        sunStatusNote = `Sunset in ~${remainingHrs}h`;
      }
    }

    // Coordinates for sun dot on arc (radius 55, center 80, 60)
    const arcAngle = Math.PI - sunProgress * Math.PI;
    const sunDotX = 90 - Math.cos(arcAngle) * 70;
    const sunDotY = 60 - Math.sin(arcAngle) * 45;

    // 3. UV Index
    const uvVal = daily.uv_index_max ? daily.uv_index_max[0] : (hourly.uv_index ? hourly.uv_index[0] : 0);
    const uvInfo = getUvCategory(uvVal);
    const uvDotPercent = Math.min(100, Math.max(0, (uvVal / 11) * 100));

    // 4. Humidity & Comfort
    const humidity = current.relative_humidity_2m || 0;
    const tempC = current.temperature_2m || 20;
    const comfort = getHumidityComfort(humidity, tempC);

    // 5. Atmospheric Pressure
    const pressure = current.pressure_msl || current.surface_pressure || 1013;
    const formattedPress = formatPressure(pressure, units);
    let pressureTrend = 'Steady system';
    if (pressure > 1020) pressureTrend = 'High pressure system (fair)';
    else if (pressure < 1005) pressureTrend = 'Low pressure system (unsettled)';

    // 6. Visibility
    const rawVis = hourly.visibility ? hourly.visibility[0] : 10000;
    const vis = getVisibilityDescription(rawVis, units);

    // 7. Cloud Cover
    const cloudCover = current.cloud_cover !== undefined ? current.cloud_cover : 20;

    // 8. Precipitation
    const precipSum = daily.precipitation_sum ? daily.precipitation_sum[0] : (current.precipitation || 0);
    const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : (current.precipitation ? 100 : 0);
    const precipDisplay = units === 'imperial'
      ? `${(precipSum * 0.03937).toFixed(2)} in`
      : `${precipSum.toFixed(1)} mm`;

    this.container.innerHTML = `
      <div class="weather-details-grid">
        
        <!-- 1. Wind & Compass -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>Wind & Direction</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
            </svg>
          </div>
          <div class="detail-card-main" style="align-items: center; width: 100%;">
            <div class="compass-widget">
              <span class="compass-cardinal compass-n">N</span>
              <span class="compass-cardinal compass-e">E</span>
              <span class="compass-cardinal compass-s">S</span>
              <span class="compass-cardinal compass-w">W</span>
              <div class="compass-needle" style="transform: rotate(${windDeg}deg);"></div>
              <div class="compass-center-point"></div>
            </div>
            <div class="detail-large-val" style="margin-top: 0.2rem;">${formattedWind}</div>
            <div class="detail-sub-val">${cardinal} (${windDeg}°)</div>
          </div>
          <div class="detail-card-footer">
            ${beaufort.text} · Stable breeze
          </div>
        </div>

        <!-- 2. Sunrise & Sunset Solar Arc -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>Sun Horizon Arc</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </div>
          <div class="detail-card-main" style="width: 100%;">
            <div class="solar-arc-wrap">
              <svg class="solar-arc-svg" viewBox="0 0 180 65">
                <!-- Horizon line -->
                <line x1="10" y1="60" x2="170" y2="60" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
                <!-- Arc trajectory -->
                <path d="M 20 60 A 70 45 0 0 1 160 60" fill="none" stroke="rgba(251, 191, 36, 0.3)" stroke-width="2" stroke-dasharray="4 4" />
                <!-- Active Sun position -->
                <circle cx="${sunDotX}" cy="${sunDotY}" r="7" fill="#fbbf24" style="filter: drop-shadow(0 0 8px #f59e0b);" />
              </svg>
            </div>
            <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.82rem;">
              <span>🌅 Rise: <strong>${sunriseTime}</strong></span>
              <span>🌇 Set: <strong>${sunsetTime}</strong></span>
            </div>
          </div>
          <div class="detail-card-footer">
            ${sunStatusNote}
          </div>
        </div>

        <!-- 3. UV Index -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>UV Radiation Index</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="detail-card-main" style="width: 100%;">
            <div style="display: flex; align-items: baseline; gap: 0.5rem;">
              <span class="detail-large-val" style="color: ${uvInfo.color};">${Math.round(uvVal)}</span>
              <span class="detail-sub-val" style="font-weight: 700; color: ${uvInfo.color};">${uvInfo.level}</span>
            </div>
            <div class="uv-scale-bar">
              <div class="uv-indicator-dot" style="left: ${uvDotPercent}%;"></div>
            </div>
          </div>
          <div class="detail-card-footer">
            ${uvInfo.advice}
          </div>
        </div>

        <!-- 4. Humidity & Comfort -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>Relative Humidity</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <div class="detail-card-main">
            <div class="detail-large-val">${humidity}%</div>
            <div class="detail-sub-val">Dew point is ${comfort.dewPoint}° · ${comfort.rating}</div>
          </div>
          <div class="detail-card-footer">
            ${comfort.desc}
          </div>
        </div>

        <!-- 5. Atmospheric Pressure -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>Barometer Pressure</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 10"/>
            </svg>
          </div>
          <div class="detail-card-main">
            <div class="detail-large-val">${formattedPress}</div>
            <div class="detail-sub-val">${pressureTrend}</div>
          </div>
          <div class="detail-card-footer">
            MSL Barometric equilibrium
          </div>
        </div>

        <!-- 6. Visibility -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>Visibility Horizon</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div class="detail-card-main">
            <div class="detail-large-val">${vis.value}</div>
            <div class="detail-sub-val">${vis.label}</div>
          </div>
          <div class="detail-card-footer">
            Optical light path transmission
          </div>
        </div>

        <!-- 7. Cloud Cover -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>Cloud Sky Coverage</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            </svg>
          </div>
          <div class="detail-card-main">
            <div class="detail-large-val">${cloudCover}%</div>
            <div class="detail-sub-val">${cloudCover > 70 ? 'Heavy overcast' : cloudCover > 30 ? 'Scattered cumulus' : 'Clear expanse'}</div>
          </div>
          <div class="detail-card-footer">
            Tropospheric cloud condensation
          </div>
        </div>

        <!-- 8. Precipitation -->
        <div class="glass-panel detail-card">
          <div class="detail-card-header">
            <span>24h Precipitation</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
              <path d="M8 19l4 4 4-4"/>
            </svg>
          </div>
          <div class="detail-card-main">
            <div class="detail-large-val">${precipDisplay}</div>
            <div class="detail-sub-val">${precipProb}% probability today</div>
          </div>
          <div class="detail-card-footer">
            Cumulative regional moisture volume
          </div>
        </div>

      </div>
    `;
  }
}
