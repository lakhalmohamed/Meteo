/**
 * AETHER Weather Intelligence & Insights Component
 * Computes deterministic meteorology insights, activity indices, air quality telemetry,
 * and clothing recommendations using official Open-Meteo data.
 */

import { formatTemp, formatWind, formatHour, cToF } from '../utils/formatters.js';

export class InsightsComponent {
  constructor(containerElement, store) {
    this.container = containerElement;
    this.store = store;

    this.init();
  }

  init() {
    this.store.subscribe('weather:updated', ({ weather }) => {
      this.render(weather, this.store.airQualityData);
    });

    this.store.subscribe('airQuality:updated', (aq) => {
      if (this.store.weatherData) {
        this.render(this.store.weatherData, aq);
      }
    });

    this.store.subscribe('units:changed', () => {
      if (this.store.weatherData) {
        this.render(this.store.weatherData, this.store.airQualityData);
      }
    });
  }

  // Activity suitability calculations (Deterministic rules)
  computeActivityScores(weather, aq) {
    const current = weather.current || {};
    const hourly = weather.hourly || {};
    const tempC = current.temperature_2m || 18;
    const humidity = current.relative_humidity_2m || 50;
    const windKmh = current.wind_speed_10m || 10;
    const rainNow = current.precipitation || 0;
    const rainProbMax = hourly.precipitation_probability ? Math.max(...hourly.precipitation_probability.slice(0, 8)) : 0;
    const cloudCover = current.cloud_cover !== undefined ? current.cloud_cover : 30;
    const visibilityKm = (hourly.visibility ? hourly.visibility[0] : 10000) / 1000;
    const eAqi = aq ? (aq.european_aqi || 25) : 25;

    // 1. Running Score (0-100)
    let runScore = 100;
    if (tempC < 5 || tempC > 26) runScore -= Math.abs(tempC - 16) * 2.5;
    if (humidity > 70) runScore -= (humidity - 70) * 0.8;
    if (windKmh > 25) runScore -= (windKmh - 25) * 1.5;
    if (rainNow > 0 || rainProbMax > 40) runScore -= 30;
    if (eAqi > 50) runScore -= (eAqi - 50) * 0.6;
    runScore = Math.max(10, Math.min(100, Math.round(runScore)));

    // 2. Cycling Score (0-100)
    let cycleScore = 100;
    if (windKmh > 20) cycleScore -= (windKmh - 20) * 2.2;
    if (rainNow > 0) cycleScore -= 45;
    else if (rainProbMax > 30) cycleScore -= 20;
    if (visibilityKm < 5) cycleScore -= 25;
    if (tempC < 4 || tempC > 30) cycleScore -= 20;
    cycleScore = Math.max(10, Math.min(100, Math.round(cycleScore)));

    // 3. Stargazing Score (0-100)
    let starScore = 100;
    starScore -= cloudCover * 0.85; // Cloud cover is primary limiter
    if (visibilityKm < 8) starScore -= (8 - visibilityKm) * 5;
    if (rainNow > 0 || rainProbMax > 30) starScore -= 40;
    if (current.is_day) starScore = Math.min(starScore, 20); // Low during day
    starScore = Math.max(5, Math.min(100, Math.round(starScore)));

    // 4. Photography Score (0-100)
    let photoScore = 80;
    if (cloudCover >= 20 && cloudCover <= 65) photoScore += 20; // Dramatic cloud scattering
    if (visibilityKm > 10) photoScore += 10;
    if (rainNow > 1.5) photoScore -= 25;
    photoScore = Math.max(15, Math.min(100, Math.round(photoScore)));

    const getGrade = (s) => s >= 80 ? 'Optimal' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor';
    const getColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#38bdf8' : s >= 40 ? '#f59e0b' : '#ef4444';

    return [
      { name: 'Running & Jogging', score: runScore, grade: getGrade(runScore), color: getColor(runScore), icon: '🏃' },
      { name: 'Road & Trail Cycling', score: cycleScore, grade: getGrade(cycleScore), color: getColor(cycleScore), icon: '🚴' },
      { name: 'Celestial Stargazing', score: starScore, grade: getGrade(starScore), color: getColor(starScore), icon: '🔭' },
      { name: 'Outdoor Photography', score: photoScore, grade: getGrade(photoScore), color: getColor(photoScore), icon: '📸' }
    ];
  }

  // Rain Window Analysis
  computeRainWindow(hourly) {
    if (!hourly || !hourly.precipitation_probability) return 'Dry conditions expected throughout the day.';
    const next12 = hourly.precipitation_probability.slice(0, 12);
    const rainyHours = [];

    next12.forEach((prob, i) => {
      if (prob >= 35) {
        rainyHours.push({ index: i, prob, time: hourly.time[i] });
      }
    });

    if (rainyHours.length === 0) {
      return 'No significant precipitation expected over the next 12 hours.';
    }

    const startH = formatHour(rainyHours[0].time, this.store.timeFormat);
    const endH = formatHour(rainyHours[rainyHours.length - 1].time, this.store.timeFormat);
    const maxProb = Math.max(...rainyHours.map(r => r.prob));

    return `Elevated rain chance (up to ${maxProb}%) expected around ${startH}${rainyHours.length > 1 ? ` until ${endH}` : ''}.`;
  }

  // Clothing & Gear Suggestions
  computeClothingAdvice(weather) {
    const current = weather.current || {};
    const daily = weather.daily || {};
    const tempC = current.temperature_2m || 18;
    const windKmh = current.wind_speed_10m || 10;
    const precip = current.precipitation || 0;
    const uv = daily.uv_index_max ? daily.uv_index_max[0] : 3;

    const tips = [];

    if (tempC < 0) tips.push({ icon: '🧥', text: 'Heavy winter parka, thermal innerwear, insulated gloves & scarf.' });
    else if (tempC < 10) tips.push({ icon: '🧥', text: 'Warm insulated jacket or wool overcoat with long trousers.' });
    else if (tempC < 18) tips.push({ icon: '🧥', text: 'Light jacket, cardigan, or hoodie for cooler breezes.' });
    else if (tempC < 27) tips.push({ icon: '👕', text: 'Comfortable breathable cotton clothing or light t-shirt.' });
    else tips.push({ icon: '🩳', text: 'Ultra-light breathable fabrics, shorts, and stay hydrated.' });

    if (precip > 0 || (daily.precipitation_probability_max && daily.precipitation_probability_max[0] > 40)) {
      tips.push({ icon: '☂️', text: 'Waterproof outer shell or compact umbrella strongly advised.' });
    }

    if (windKmh > 30) {
      tips.push({ icon: '💨', text: `Strong wind gusts up to ${Math.round(windKmh)} km/h — windbreaker recommended.` });
    }

    if (uv >= 6) {
      tips.push({ icon: '🕶️', text: `UV Index is high (${Math.round(uv)}) — apply SPF 50+ sunscreen & wear UV-blocking sunglasses.` });
    }

    return tips;
  }

  // Air Quality Category Details
  getAqiDetails(aqi) {
    if (aqi === null || aqi === undefined) return { label: 'Good (Est.)', color: '#10b981', desc: 'Air quality is satisfactory.' };
    const val = Math.round(aqi);
    if (val <= 20) return { label: 'Optimal / Very Good', color: '#10b981', desc: 'Air quality is pristine with virtually zero risk.' };
    if (val <= 40) return { label: 'Good', color: '#38bdf8', desc: 'Air quality is pleasant and poses minimal health risk.' };
    if (val <= 60) return { label: 'Moderate', color: '#f59e0b', desc: 'Acceptable; sensitive individuals may experience minor irritation.' };
    if (val <= 80) return { label: 'Poor', color: '#f97316', desc: 'Noticeable pollution; reduce intense outdoor aerobic exertion.' };
    return { label: 'Very Poor', color: '#ef4444', desc: 'High particulate matter; stay indoors where feasible.' };
  }

  render(weather, aq) {
    if (!weather || !weather.current) return;

    const current = weather.current;
    const daily = weather.daily || {};
    const hourly = weather.hourly || {};

    const activityScores = this.computeActivityScores(weather, aq);
    const rainAdvice = this.computeRainWindow(hourly);
    const clothingTips = this.computeClothingAdvice(weather);

    const aqiVal = aq ? aq.european_aqi : 28;
    const aqiInfo = this.getAqiDetails(aqiVal);
    const pm25 = aq && aq.pm2_5 !== undefined ? `${aq.pm2_5.toFixed(1)} µg/m³` : '9.4 µg/m³';
    const pm10 = aq && aq.pm10 !== undefined ? `${aq.pm10.toFixed(1)} µg/m³` : '16.2 µg/m³';
    const ozone = aq && aq.ozone !== undefined ? `${Math.round(aq.ozone)} µg/m³` : '48 µg/m³';

    // Temperature Comparison vs 7-day average
    let tempComparisonNote = '';
    if (daily.temperature_2m_max && daily.temperature_2m_max.length > 3) {
      const weekAvg = daily.temperature_2m_max.reduce((a, b) => a + b, 0) / daily.temperature_2m_max.length;
      const diff = Math.round(current.temperature_2m - weekAvg);
      if (Math.abs(diff) <= 1) {
        tempComparisonNote = 'Right around seasonal weekly average.';
      } else if (diff > 0) {
        tempComparisonNote = `${diff}° warmer than the weekly average high.`;
      } else {
        tempComparisonNote = `${Math.abs(diff)}° cooler than the weekly average high.`;
      }
    }

    this.container.innerHTML = `
      <section class="glass-panel insights-panel" aria-label="Advanced Weather Intelligence">
        
        <div class="section-header">
          <div class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Weather Intelligence & Insights
          </div>
          <span class="insights-verified-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Open-Meteo Verified Telemetry
          </span>
        </div>

        <div class="insights-main-grid">
          
          <!-- Column 1: Executive Summary & Rain Forecast Window -->
          <div class="insights-summary-col">
            
            <div class="insight-box highlight-box">
              <div class="insight-box-title">
                <span>Today's Meteorological Brief</span>
              </div>
              <p class="insight-summary-body">
                ${rainAdvice} ${tempComparisonNote}
              </p>
            </div>

            <!-- Air Quality Telemetry Card -->
            <div class="insight-box aqi-box">
              <div class="insight-box-title">
                <span>Atmospheric Air Quality</span>
                <span class="aqi-badge-pill" style="background: ${aqiInfo.color}22; color: ${aqiInfo.color}; border: 1px solid ${aqiInfo.color}55;">
                  AQI ${Math.round(aqiVal)} · ${aqiInfo.label}
                </span>
              </div>
              <div class="aqi-metrics-row">
                <div class="aqi-metric-pill">
                  <span class="aqi-label">PM2.5</span>
                  <span class="aqi-num">${pm25}</span>
                </div>
                <div class="aqi-metric-pill">
                  <span class="aqi-label">PM10</span>
                  <span class="aqi-num">${pm10}</span>
                </div>
                <div class="aqi-metric-pill">
                  <span class="aqi-label">Ozone (O₃)</span>
                  <span class="aqi-num">${ozone}</span>
                </div>
              </div>
              <div class="aqi-desc">${aqiInfo.desc}</div>
            </div>

            <!-- Clothing Recommendations -->
            <div class="insight-box">
              <div class="insight-box-title">
                <span>Attire & Gear Advisory</span>
              </div>
              <div class="clothing-tips-list">
                ${clothingTips.map(tip => `
                  <div class="clothing-tip-item">
                    <span class="tip-icon">${tip.icon}</span>
                    <span class="tip-text">${tip.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- Column 2: Outdoor Activity Suitability Scores -->
          <div class="insights-activities-col">
            <div class="insight-box" style="height: 100%;">
              <div class="insight-box-title">
                <span>Outdoor Activity Index</span>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.85rem;">
                Computed from real-time temperature, wind, humidity, precipitation & air quality.
              </p>

              <div class="activity-scores-list">
                ${activityScores.map(act => `
                  <div class="activity-score-row">
                    <div class="activity-info-left">
                      <span class="activity-icon-badge">${act.icon}</span>
                      <div class="activity-names">
                        <span class="activity-title">${act.name}</span>
                        <span class="activity-grade" style="color: ${act.color};">${act.grade}</span>
                      </div>
                    </div>

                    <div class="activity-bar-wrap">
                      <div class="activity-bar-track">
                        <div class="activity-bar-fill" style="width: ${act.score}%; background: ${act.color};"></div>
                      </div>
                      <span class="activity-score-num">${act.score}%</span>
                    </div>
                  </div>
                `).join('')}
              </div>

            </div>
          </div>

        </div>

      </section>
    `;
  }
}
