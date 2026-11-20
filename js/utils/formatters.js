/**
 * AETHER Formatters & Unit Converters
 */

/**
 * Converts Celsius to Fahrenheit
 */
export function cToF(c) {
  return (c * 9) / 5 + 32;
}

/**
 * Converts Fahrenheit to Celsius
 */
export function fToC(f) {
  return ((f - 32) * 5) / 9;
}

/**
 * Formats temperature value according to user unit preference
 */
export function formatTemp(celsius, unit = 'metric', showUnit = true) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = unit === 'imperial' ? cToF(celsius) : celsius;
  const rounded = Math.round(val);
  return showUnit ? `${rounded}°` : `${rounded}`;
}

/**
 * Converts km/h to mph or m/s
 */
export function formatWind(kmh, unit = 'metric') {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
  if (unit === 'imperial') {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Converts pressure hPa to inHg
 */
export function formatPressure(hpa, unit = 'metric') {
  if (!hpa) return '--';
  if (unit === 'imperial') {
    const inHg = (hpa * 0.02953).toFixed(2);
    return `${inHg} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

/**
 * Calculates Cardinal Direction from Degrees (0-360)
 */
export function getCardinalDirection(deg) {
  if (deg === null || deg === undefined) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index];
}

/**
 * Beaufort Wind Scale description
 */
export function getBeaufortScale(kmh) {
  if (kmh < 1) return { scale: 0, text: 'Calm' };
  if (kmh <= 5) return { scale: 1, text: 'Light Air' };
  if (kmh <= 11) return { scale: 2, text: 'Light Breeze' };
  if (kmh <= 19) return { scale: 3, text: 'Gentle Breeze' };
  if (kmh <= 28) return { scale: 4, text: 'Moderate Breeze' };
  if (kmh <= 38) return { scale: 5, text: 'Fresh Breeze' };
  if (kmh <= 49) return { scale: 6, text: 'Strong Breeze' };
  if (kmh <= 61) return { scale: 7, text: 'High Wind' };
  if (kmh <= 74) return { scale: 8, text: 'Gale' };
  if (kmh <= 88) return { scale: 9, text: 'Strong Gale' };
  if (kmh <= 102) return { scale: 10, text: 'Storm' };
  return { scale: 11, text: 'Violent Storm' };
}

/**
 * UV Index categorization & health guidance
 */
export function getUvCategory(uv) {
  const num = Math.round(uv || 0);
  if (num <= 2) {
    return { level: 'Low', color: '#10b981', advice: 'No protection needed. Safe for outdoor activities.' };
  }
  if (num <= 5) {
    return { level: 'Moderate', color: '#f59e0b', advice: 'Wear sunglasses & SPF 30+ if outdoors midday.' };
  }
  if (num <= 7) {
    return { level: 'High', color: '#f97316', advice: 'Protection essential. Seek shade during midday peak.' };
  }
  if (num <= 10) {
    return { level: 'Very High', color: '#ef4444', advice: 'Extra precautions required. Minimize sun exposure.' };
  }
  return { level: 'Extreme', color: '#a855f7', advice: 'Avoid direct sunlight. Full sun protection required.' };
}

/**
 * Humidity Comfort Level and Dew Point estimation
 */
export function getHumidityComfort(humidity, tempC) {
  // Approximate Dew Point: T - ((100 - RH) / 5)
  const dewPoint = Math.round(tempC - ((100 - humidity) / 5));
  let rating = 'Comfortable';
  let desc = 'Balanced moisture levels in the ambient air.';

  if (humidity < 30) {
    rating = 'Very Dry';
    desc = 'Low air moisture. Increased hydration recommended.';
  } else if (humidity <= 55) {
    rating = 'Pleasant';
    desc = 'Optimal atmospheric moisture balance.';
  } else if (humidity <= 70) {
    rating = 'Moderately Humid';
    desc = 'Noticeable atmospheric moisture in the air.';
  } else {
    rating = 'High Humidity';
    desc = 'Heavy moisture content; sweat evaporation is slowed.';
  }

  return { dewPoint, rating, desc };
}

/**
 * Visibility rating
 */
export function getVisibilityDescription(meters, unit = 'metric') {
  const km = (meters / 1000).toFixed(1);
  const miles = (meters * 0.000621371).toFixed(1);

  let label = 'Crystal Clear';
  if (meters < 1000) label = 'Dense Fog / Low';
  else if (meters < 4000) label = 'Moderate Haze';
  else if (meters < 10000) label = 'Good Visibility';

  return {
    value: unit === 'imperial' ? `${miles} mi` : `${km} km`,
    label
  };
}

/**
 * Formats time in a specific IANA Timezone (e.g. 'Europe/Paris', 'America/New_York')
 */
export function getLocalTime(timezone = 'auto', timeFormat = '24h') {
  try {
    const now = new Date();
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: timeFormat === '12h'
    };
    if (timezone && timezone !== 'auto') {
      options.timeZone = timezone;
    }
    const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);

    const dateOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    if (timezone && timezone !== 'auto') {
      dateOptions.timeZone = timezone;
    }
    const dateStr = new Intl.DateTimeFormat('en-US', dateOptions).format(now);

    return { timeStr, dateStr };
  } catch (err) {
    const now = new Date();
    return {
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
    };
  }
}

/**
 * Formats ISO date string to short hour (e.g. "14:00" or "2 PM")
 */
export function formatHour(isoString, timeFormat = '24h') {
  try {
    const d = new Date(isoString);
    if (timeFormat === '12h') {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    }
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) {
    return isoString.split('T')[1]?.slice(0, 5) || isoString;
  }
}

/**
 * Formats ISO date string to Day name (e.g. "Tomorrow", "Wed, Nov 18")
 */
export function formatDayLabel(isoDate, index = 0) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatShortDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
