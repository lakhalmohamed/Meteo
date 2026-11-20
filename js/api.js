/**
 * AETHER Open-Meteo API Service
 * Handles Geocoding, Forecasts, Reverse Geocoding, and Error Resiliency.
 */

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const REVERSE_GEO_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/**
 * Searches worldwide cities via Open-Meteo Geocoding API
 */
export async function searchLocations(query, signal) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country || '',
      country_code: item.country_code || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
      elevation: item.elevation
    }));
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err; // Re-throw aborts for search debouncers
    }
    console.error('[API] Geocoding error:', err);
    throw new Error('Unable to connect to location search service. Please check your network.');
  }
}

/**
 * Retrieves comprehensive real-time and forecast weather data from Open-Meteo
 */
export async function fetchForecast(latitude, longitude, timezone = 'auto', signal) {
  if (latitude === undefined || longitude === undefined) {
    throw new Error('Valid coordinates are required to fetch weather forecast.');
  }

  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    timezone: timezone || 'auto',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'pressure_msl',
      'surface_pressure',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'is_day'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max'
    ].join(',')
  });

  const url = `${FORECAST_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, { signal });
    const isFromCache = response.headers.get('X-Aether-Offline-Cached') === 'true';

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.reason || `Weather forecast API responded with HTTP ${response.status}`);
    }

    const data = await response.json();

    // Basic structure validation
    if (!data.current || !data.hourly || !data.daily) {
      throw new Error('Weather API returned incomplete weather structures.');
    }

    return {
      data,
      isFromCache
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.error('[API] Forecast fetch error:', err);
    throw new Error(err.message || 'Failed to retrieve real-time weather information.');
  }
}

/**
 * Reverse geocodes coordinates to a human-readable city & country name
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `${REVERSE_GEO_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || '';
      const country_code = data.countryCode || '';
      const admin1 = data.principalSubdivision || '';
      return { name, country, country_code, admin1 };
    }
  } catch (e) {
    console.warn('[API] Reverse geocode fallback:', e);
  }

  // Graceful fallback to formatted coordinate label
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  return {
    name: `${Math.abs(latitude).toFixed(2)}°${latDir}, ${Math.abs(longitude).toFixed(2)}°${lonDir}`,
    country: 'Coordinates',
    country_code: '',
    admin1: ''
  };
}

/**
 * Retrieves official real-time Atmospheric Air Quality telemetry from Open-Meteo
 */
export async function fetchAirQuality(latitude, longitude, signal) {
  if (latitude === undefined || longitude === undefined) return null;

  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone'
  });

  const url = `${AIR_QUALITY_BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const json = await res.json();
    return json.current || null;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[API] Air quality fetch warning:', err.message);
    return null;
  }
}

