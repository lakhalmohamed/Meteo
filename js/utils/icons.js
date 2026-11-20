/**
 * AETHER Animated SVG Weather Icons
 * Self-contained, lightweight, vector animated SVGs
 */

export function getWeatherSvg(iconType, isDay = true, className = '') {
  switch (iconType) {
    case 'clear':
      return isDay ? getSunSvg(className) : getMoonSvg(className);
    case 'partly-cloudy':
      return isDay ? getSunCloudSvg(className) : getMoonCloudSvg(className);
    case 'overcast':
    case 'cloudy':
      return getCloudSvg(className);
    case 'drizzle':
      return getDrizzleSvg(className);
    case 'rain':
      return getRainSvg(className);
    case 'heavy-rain':
      return getHeavyRainSvg(className);
    case 'thunderstorm':
      return getThunderstormSvg(className);
    case 'snow':
    case 'heavy-snow':
      return getSnowSvg(className);
    case 'fog':
      return getFogSvg(className);
    default:
      return isDay ? getSunCloudSvg(className) : getMoonCloudSvg(className);
  }
}

// 1. Radiant Animated Sun
function getSunSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .sun-core { fill: url(#sunGrad); animation: pulseSun 4s ease-in-out infinite alternate; }
      .sun-rays { stroke: #f59e0b; stroke-width: 2.5; stroke-linecap: round; transform-origin: 32px 32px; animation: rotateSun 20s linear infinite; }
      @keyframes rotateSun { to { transform: rotate(360deg); } }
      @keyframes pulseSun { 0% { transform: scale(0.96); } 100% { transform: scale(1.04); } }
    </style>
    <defs>
      <linearGradient id="sunGrad" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fbbf24"/>
        <stop offset="1" stop-color="#ea580c"/>
      </linearGradient>
    </defs>
    <g class="sun-rays">
      <line x1="32" y1="8" x2="32" y2="14" />
      <line x1="32" y1="50" x2="32" y2="56" />
      <line x1="8" y1="32" x2="14" y2="32" />
      <line x1="50" y1="32" x2="56" y2="32" />
      <line x1="15.03" y1="15.03" x2="19.27" y2="19.27" />
      <line x1="44.73" y1="44.73" x2="48.97" y2="48.97" />
      <line x1="15.03" y1="48.97" x2="19.27" y2="44.73" />
      <line x1="44.73" y1="19.27" x2="48.97" y2="15.03" />
    </g>
    <circle class="sun-core" cx="32" cy="32" r="14" />
  </svg>`;
}

// 2. Crescent Moon with Twinkling Stars
function getMoonSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .moon-body { fill: url(#moonGrad); }
      .star-sparkle-1 { fill: #c084fc; animation: twinkle 2s ease-in-out infinite; }
      .star-sparkle-2 { fill: #38bdf8; animation: twinkle 2.5s ease-in-out infinite 0.7s; }
      @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
    </style>
    <defs>
      <linearGradient id="moonGrad" x1="20" y1="12" x2="44" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#e0e7ff"/>
        <stop offset="1" stop-color="#818cf8"/>
      </linearGradient>
    </defs>
    <path class="moon-body" d="M38 14C25.85 14 16 23.85 16 36C16 48.15 25.85 58 38 58C42.84 58 47.33 56.43 51 53.77C38.6 51.68 29.2 41 29.2 28C29.2 21.84 31.7 16.27 35.8 12.2C36.5 12.06 37.24 12 38 12V14Z" />
    <circle class="star-sparkle-1" cx="48" cy="20" r="2.5" />
    <circle class="star-sparkle-2" cx="42" cy="34" r="2" />
  </svg>`;
}

// 3. Sun and Cloud
function getSunCloudSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .sun-bg { fill: #f59e0b; animation: rotateSun 16s linear infinite; transform-origin: 24px 24px; }
      .cloud-fg { fill: url(#cloudWhiteGrad); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); animation: floatCloud 4s ease-in-out infinite alternate; }
      @keyframes floatCloud { 0% { transform: translateX(0); } 100% { transform: translateX(2px); } }
    </style>
    <defs>
      <linearGradient id="cloudWhiteGrad" x1="10" y1="26" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffffff"/>
        <stop offset="1" stop-color="#cbd5e1"/>
      </linearGradient>
    </defs>
    <g class="sun-bg">
      <circle cx="24" cy="24" r="10" />
      <line x1="24" y1="8" x2="24" y2="11" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="24" x2="11" y2="24" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
      <line x1="12.7" y1="12.7" x2="14.8" y2="14.8" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
    </g>
    <path class="cloud-fg" d="M22 50H46C50.42 50 54 46.42 54 42C54 37.8 50.77 34.37 46.66 34.04C45.69 26.68 39.42 21 31.8 21C25.04 21 19.34 25.53 17.55 31.8C13.88 32.61 11 35.88 11 39.8C11 44.33 14.67 48 19.2 48H22V50Z"/>
  </svg>`;
}

// 4. Moon and Cloud
function getMoonCloudSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .cloud-night { fill: url(#cloudNightGrad); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); animation: floatCloud 4s ease-in-out infinite alternate; }
    </style>
    <defs>
      <linearGradient id="cloudNightGrad" x1="10" y1="26" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stop-color="#cbd5e1"/>
        <stop offset="1" stop-color="#64748b"/>
      </linearGradient>
    </defs>
    <path d="M30 16C23 16 17 21 17 28C17 35 23 41 30 41C32 41 34 40.5 36 39.5C28 38 23 31 23 24C23 19 26 16.5 28 16Z" fill="#a5b4fc" />
    <path class="cloud-night" d="M22 50H46C50.42 50 54 46.42 54 42C54 37.8 50.77 34.37 46.66 34.04C45.69 26.68 39.42 21 31.8 21C25.04 21 19.34 25.53 17.55 31.8C13.88 32.61 11 35.88 11 39.8C11 44.33 14.67 48 19.2 48H22V50Z"/>
  </svg>`;
}

// 5. Cloud / Overcast
function getCloudSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .cloud-body { fill: url(#cloudOvercastGrad); animation: breatheCloud 4s ease-in-out infinite alternate; }
      @keyframes breatheCloud { 0% { transform: scale(0.97); } 100% { transform: scale(1.02); } }
    </style>
    <defs>
      <linearGradient id="cloudOvercastGrad" x1="12" y1="20" x2="52" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#e2e8f0"/>
        <stop offset="1" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <path class="cloud-body" d="M22 48H46C50.42 48 54 44.42 54 40C54 35.8 50.77 32.37 46.66 32.04C45.69 24.68 39.42 19 31.8 19C25.04 19 19.34 23.53 17.55 29.8C13.88 30.61 11 33.88 11 37.8C11 42.33 14.67 46 19.2 46H22V48Z"/>
  </svg>`;
}

// 6. Rain
function getRainSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .rain-drop-1 { stroke: #38bdf8; stroke-width: 2.5; stroke-linecap: round; animation: dropRain 1s linear infinite; }
      .rain-drop-2 { stroke: #38bdf8; stroke-width: 2.5; stroke-linecap: round; animation: dropRain 1s linear infinite 0.35s; }
      .rain-drop-3 { stroke: #38bdf8; stroke-width: 2.5; stroke-linecap: round; animation: dropRain 1s linear infinite 0.7s; }
      @keyframes dropRain { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(8px); opacity: 0; } }
    </style>
    <path d="M22 42H46C49.5 42 52 39.5 52 36C52 32.8 49.5 30 46.5 29.8C45.5 24 40.5 19 34 19C28 19 23 23 21.5 28C18.5 28.5 16 31 16 34C16 37.5 19 40.5 22.5 40.5H22V42Z" fill="#94a3b8" />
    <line class="rain-drop-1" x1="24" y1="46" x2="22" y2="52" />
    <line class="rain-drop-2" x1="33" y1="46" x2="31" y2="52" />
    <line class="rain-drop-3" x1="42" y1="46" x2="40" y2="52" />
  </svg>`;
}

// 7. Heavy Rain
function getHeavyRainSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .h-drop-1 { stroke: #0284c7; stroke-width: 3; stroke-linecap: round; animation: dropRainFast 0.6s linear infinite; }
      .h-drop-2 { stroke: #38bdf8; stroke-width: 3; stroke-linecap: round; animation: dropRainFast 0.6s linear infinite 0.2s; }
      .h-drop-3 { stroke: #0284c7; stroke-width: 3; stroke-linecap: round; animation: dropRainFast 0.6s linear infinite 0.4s; }
      @keyframes dropRainFast { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(12px); opacity: 0; } }
    </style>
    <path d="M22 40H46C49.5 40 52 37.5 52 34C52 30.8 49.5 28 46.5 27.8C45.5 22 40.5 17 34 17C28 17 23 21 21.5 26C18.5 26.5 16 29 16 32C16 35.5 19 38.5 22.5 38.5H22V40Z" fill="#475569" />
    <line class="h-drop-1" x1="22" y1="44" x2="19" y2="54" />
    <line class="h-drop-2" x1="32" y1="44" x2="29" y2="54" />
    <line class="h-drop-3" x1="42" y1="44" x2="39" y2="54" />
  </svg>`;
}

// 8. Drizzle
function getDrizzleSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 42H46C49.5 42 52 39.5 52 36C52 32.8 49.5 30 46.5 29.8C45.5 24 40.5 19 34 19C28 19 23 23 21.5 28C18.5 28.5 16 31 16 34C16 37.5 19 40.5 22.5 40.5H22V42Z" fill="#94a3b8" />
    <circle cx="25" cy="48" r="1.5" fill="#38bdf8" />
    <circle cx="34" cy="52" r="1.5" fill="#38bdf8" />
    <circle cx="43" cy="47" r="1.5" fill="#38bdf8" />
  </svg>`;
}

// 9. Thunderstorm
function getThunderstormSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .lightning-bolt { fill: #facc15; filter: drop-shadow(0 0 6px #facc15); animation: flashBolt 2s ease-in-out infinite; }
      @keyframes flashBolt { 0%, 80%, 100% { opacity: 0.2; } 85%, 95% { opacity: 1; } }
    </style>
    <path d="M22 38H46C49.5 38 52 35.5 52 32C52 28.8 49.5 26 46.5 25.8C45.5 20 40.5 15 34 15C28 15 23 19 21.5 24C18.5 24.5 16 27 16 30C16 33.5 19 36.5 22.5 36.5H22V38Z" fill="#334155" />
    <polygon class="lightning-bolt" points="33,36 27,47 32,47 29,57 39,44 33,44" />
  </svg>`;
}

// 10. Snow
function getSnowSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .snowflake-1 { transform-origin: 24px 48px; animation: spinSnow 5s linear infinite; }
      .snowflake-2 { transform-origin: 38px 50px; animation: spinSnow 6s linear infinite reverse; }
      @keyframes spinSnow { to { transform: rotate(360deg); } }
    </style>
    <path d="M22 40H46C49.5 40 52 37.5 52 34C52 30.8 49.5 28 46.5 27.8C45.5 22 40.5 17 34 17C28 17 23 21 21.5 26C18.5 26.5 16 29 16 32C16 35.5 19 38.5 22.5 38.5H22V40Z" fill="#94a3b8" />
    <g class="snowflake-1">
      <line x1="24" y1="44" x2="24" y2="52" stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="20" y1="48" x2="28" y2="48" stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <g class="snowflake-2">
      <line x1="38" y1="46" x2="38" y2="54" stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="34" y1="50" x2="42" y2="50" stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// 11. Fog
function getFogSvg(className) {
  return `<svg class="aether-svg-icon ${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .fog-line-1 { stroke: #cbd5e1; stroke-width: 3; stroke-linecap: round; animation: driftFog 3s ease-in-out infinite alternate; }
      .fog-line-2 { stroke: #94a3b8; stroke-width: 3; stroke-linecap: round; animation: driftFog 3.5s ease-in-out infinite alternate-reverse; }
      @keyframes driftFog { 0% { transform: translateX(-2px); } 100% { transform: translateX(2px); } }
    </style>
    <line class="fog-line-1" x1="16" y1="28" x2="48" y2="28" />
    <line class="fog-line-2" x1="20" y1="36" x2="44" y2="36" />
    <line class="fog-line-1" x1="14" y1="44" x2="50" y2="44" />
  </svg>`;
}
