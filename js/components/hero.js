/**
 * AETHER Hero Weather Component
 * Displays main location, live local time, animated temperature counter, dynamic illustration,
 * and responds in real time to Weather Time Machine simulation scrubbing.
 */

import { formatTemp, getLocalTime, formatHour } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weather-codes.js';
import { getWeatherSvg } from '../utils/icons.js';

export class HeroComponent {
  constructor(containerElement, store) {
    this.container = containerElement;
    this.store = store;
    this.clockInterval = null;
    this.prevTemp = null;

    this.init();
  }

  init() {
    this.store.subscribe('weather:updated', ({ weather }) => {
      this.render(weather);
    });

    this.store.subscribe('city:changed', () => {
      this.startClock();
    });

    this.store.subscribe('units:changed', () => {
      if (this.store.weatherData) {
        this.render(this.store.weatherData);
      }
    });

    this.store.subscribe('favorites:updated', () => {
      this.updateFavoriteButton();
    });

    // React to Time Machine scrubbing!
    this.store.subscribe('timeMachine:scrub', () => {
      if (this.store.weatherData) {
        this.render(this.store.weatherData);
      }
    });

    this.startClock();
  }

  startClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

    const tick = () => {
      const timeElem = document.getElementById('hero-local-time');
      const dateElem = document.getElementById('hero-local-date');
      if (timeElem && dateElem) {
        const { timeStr, dateStr } = getLocalTime(
          this.store.currentCity.timezone,
          this.store.timeFormat
        );
        timeElem.textContent = timeStr;
        dateElem.textContent = dateStr;
      }
    };

    tick();
    this.clockInterval = setInterval(tick, 1000);
  }

  animateTemperature(from, to, element) {
    if (from === null || from === undefined || isNaN(from)) {
      element.textContent = `${Math.round(to)}`;
      return;
    }

    const duration = 500;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(from + (to - from) * ease);
      element.textContent = `${currentVal}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  render(weather) {
    if (!weather || !weather.current) return;

    const hourly = weather.hourly || {};
    const daily = weather.daily || {};
    const city = this.store.currentCity;
    const hourOffset = this.store.timeMachineHour || 0;
    const isSimulating = hourOffset > 0 && hourly.time && hourly.time[hourOffset];

    // Determine active metrics: Live vs Time Machine Simulation
    let tempCelsius, apparentTemp, wmoCode, isDay, humidity, timeNote;

    if (isSimulating) {
      tempCelsius = hourly.temperature_2m[hourOffset];
      apparentTemp = hourly.apparent_temperature ? hourly.apparent_temperature[hourOffset] : tempCelsius;
      wmoCode = hourly.weather_code[hourOffset];
      isDay = hourly.is_day[hourOffset];
      humidity = hourly.relative_humidity_2m ? hourly.relative_humidity_2m[hourOffset] : 50;
      const simHourLabel = formatHour(hourly.time[hourOffset], this.store.timeFormat);
      timeNote = `<span class="time-machine-pill-sim">Simulation: +${hourOffset}h (${simHourLabel})</span>`;
    } else {
      tempCelsius = weather.current.temperature_2m;
      apparentTemp = weather.current.apparent_temperature;
      wmoCode = weather.current.weather_code;
      isDay = weather.current.is_day;
      humidity = weather.current.relative_humidity_2m;
      timeNote = '';
    }

    const meta = getWeatherMeta(wmoCode, isDay);
    const isImperial = this.store.units === 'imperial';
    const currentTempRounded = isImperial
      ? Math.round((tempCelsius * 9) / 5 + 32)
      : Math.round(tempCelsius);

    const feelsLikeStr = formatTemp(apparentTemp, this.store.units);
    const highStr = daily.temperature_2m_max ? formatTemp(daily.temperature_2m_max[0], this.store.units) : '--';
    const lowStr = daily.temperature_2m_min ? formatTemp(daily.temperature_2m_min[0], this.store.units) : '--';

    const isFav = this.store.isCurrentCityFavorite();

    this.container.innerHTML = `
      <div class="glass-panel hero-weather-card ${isSimulating ? 'is-simulated-view' : ''}">
        <div class="hero-primary-info">
          
          <!-- Location and Favorite Row -->
          <div class="location-meta-bar">
            <div class="location-title-wrap">
              <h1 class="location-name">${city.name}</h1>
              ${city.country ? `<span class="country-pill">${city.country}</span>` : ''}
              ${timeNote}
            </div>

            <button class="favorite-toggle-btn ${isFav ? 'is-favorite' : ''}" 
                    id="hero-fav-btn" 
                    title="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
                    aria-label="Toggle favorite">
              <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>

          <!-- Local Time & Date -->
          <div class="local-time-bar">
            <span class="time-badge" id="hero-local-time">--:--:--</span>
            <span id="hero-local-date">Loading date...</span>
            ${city.admin1 ? `<span>· ${city.admin1}</span>` : ''}
          </div>

          <!-- Giant Temperature & Condition -->
          <div class="temp-display-wrap">
            <span class="hero-temp-number" id="hero-temp-value">${currentTempRounded}</span>
            <span class="hero-temp-unit">°</span>
          </div>

          <div class="weather-condition-text">
            ${meta.label}
          </div>

          <p class="weather-narrative-text">
            ${meta.narrative} Feels like ${feelsLikeStr} with high of ${highStr} and low of ${lowStr}.
          </p>

          <!-- Metric Pills Row -->
          <div class="hero-pills-row">
            <div class="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <span>High: <strong>${highStr}</strong></span>
            </div>
            <div class="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              <span>Low: <strong>${lowStr}</strong></span>
            </div>
            <div class="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
              <span>Feels like: <strong>${feelsLikeStr}</strong></span>
            </div>
            <div class="hero-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              <span>Humidity: <strong>${humidity}%</strong></span>
            </div>
          </div>

        </div>

        <!-- Big Animated Illustration -->
        <div class="hero-illustration-wrap">
          <div class="hero-weather-icon-art">
            ${getWeatherSvg(meta.icon, meta.isDay, 'hero-svg')}
          </div>
        </div>
      </div>
    `;

    // Wire up favorite button
    const favBtn = document.getElementById('hero-fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        this.store.toggleCurrentCityFavorite();
      });
    }

    // Number roll animation
    const tempElem = document.getElementById('hero-temp-value');
    if (tempElem && this.prevTemp !== null && this.prevTemp !== currentTempRounded) {
      this.animateTemperature(this.prevTemp, currentTempRounded, tempElem);
    }
    this.prevTemp = currentTempRounded;

    this.startClock();
  }

  updateFavoriteButton() {
    const favBtn = document.getElementById('hero-fav-btn');
    if (favBtn) {
      const isFav = this.store.isCurrentCityFavorite();
      favBtn.classList.toggle('is-favorite', isFav);
      favBtn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
    }
  }
}
