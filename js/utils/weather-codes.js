/**
 * Open-Meteo WMO Weather Interpretation Codes
 * Maps WMO code to human description, visual theme, audio preset, and icon identifier.
 */

export const WMO_CODES = {
  0: {
    label: 'Clear Sky',
    dayTheme: 'clear-day',
    nightTheme: 'clear-night',
    icon: 'clear',
    audio: 'breeze',
    narrative: 'Crisp, crystal clear skies with unobstructed celestial visibility.'
  },
  1: {
    label: 'Mainly Clear',
    dayTheme: 'clear-day',
    nightTheme: 'clear-night',
    icon: 'partly-cloudy',
    audio: 'breeze',
    narrative: 'Mostly sunny with a few lingering high-altitude wisps of cloud.'
  },
  2: {
    label: 'Partly Cloudy',
    dayTheme: 'partly-cloudy-day',
    nightTheme: 'partly-cloudy-night',
    icon: 'partly-cloudy',
    audio: 'breeze',
    narrative: 'Sunlight filtering gracefully through scattered decorative clouds.'
  },
  3: {
    label: 'Overcast',
    dayTheme: 'cloudy',
    nightTheme: 'cloudy',
    icon: 'overcast',
    audio: 'breeze',
    narrative: 'A uniform atmospheric blanket of clouds covering the entire horizon.'
  },
  45: {
    label: 'Fog',
    dayTheme: 'fog',
    nightTheme: 'fog',
    icon: 'fog',
    audio: 'breeze',
    narrative: 'Dense rolling mist reducing terrestrial visibility across the landscape.'
  },
  48: {
    label: 'Depositing Rime Fog',
    dayTheme: 'fog',
    nightTheme: 'fog',
    icon: 'fog',
    audio: 'breeze',
    narrative: 'Sub-zero freezing fog forming delicate crystalline rime upon surfaces.'
  },
  51: {
    label: 'Light Drizzle',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'drizzle',
    audio: 'rain',
    narrative: 'Delicate misty precipitation floating gently through cool air currents.'
  },
  53: {
    label: 'Moderate Drizzle',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'drizzle',
    audio: 'rain',
    narrative: 'Consistent fine drizzle dampening pathways and glistening under ambient light.'
  },
  55: {
    label: 'Dense Drizzle',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'rain',
    audio: 'rain',
    narrative: 'Heavy atmospheric drizzle creating low cloud ceilings and damp conditions.'
  },
  61: {
    label: 'Slight Rain',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'rain',
    audio: 'rain',
    narrative: 'Gentle raindrops falling steadily, cooling the atmosphere.'
  },
  63: {
    label: 'Moderate Rain',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'rain',
    audio: 'rain',
    narrative: 'Steady rhythmic rainfall with reflective pavement and refreshing breeze.'
  },
  65: {
    label: 'Heavy Rain',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'heavy-rain',
    audio: 'rain',
    narrative: 'Intense cinematic downpours with strong atmospheric runoff.'
  },
  71: {
    label: 'Slight Snow Fall',
    dayTheme: 'snow',
    nightTheme: 'snow',
    icon: 'snow',
    audio: 'snow-wind',
    narrative: 'Quiet individual snowflakes tumbling softly through the stillness.'
  },
  73: {
    label: 'Moderate Snow Fall',
    dayTheme: 'snow',
    nightTheme: 'snow',
    icon: 'snow',
    audio: 'snow-wind',
    narrative: 'Scenic snowfall accumulating into an icy pristine winter landscape.'
  },
  75: {
    label: 'Heavy Snow Fall',
    dayTheme: 'snow',
    nightTheme: 'snow',
    icon: 'heavy-snow',
    audio: 'snow-wind',
    narrative: 'Substantial swirling blizzard conditions with dramatic powder drifts.'
  },
  77: {
    label: 'Snow Grains',
    dayTheme: 'snow',
    nightTheme: 'snow',
    icon: 'snow',
    audio: 'snow-wind',
    narrative: 'Tiny opaque pellets of white ice floating delicately through freezing air.'
  },
  80: {
    label: 'Slight Rain Showers',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'rain',
    audio: 'rain',
    narrative: 'Spontaneous brief rain showers with sunny intervals breaking through.'
  },
  81: {
    label: 'Moderate Rain Showers',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'rain',
    audio: 'rain',
    narrative: 'Passing squalls of rain accompanied by gusty localized wind shifts.'
  },
  82: {
    label: 'Violent Rain Showers',
    dayTheme: 'rain',
    nightTheme: 'rain',
    icon: 'heavy-rain',
    audio: 'rain',
    narrative: 'Violent torrential cloudbursts with sudden surges in precipitation.'
  },
  85: {
    label: 'Slight Snow Showers',
    dayTheme: 'snow',
    nightTheme: 'snow',
    icon: 'snow',
    audio: 'snow-wind',
    narrative: 'Intermittent flurries of dancing snow dancing across the skyline.'
  },
  86: {
    label: 'Heavy Snow Showers',
    dayTheme: 'snow',
    nightTheme: 'snow',
    icon: 'heavy-snow',
    audio: 'snow-wind',
    narrative: 'Dense squalls of snow causing rapid accumulation and low visibility.'
  },
  95: {
    label: 'Thunderstorm',
    dayTheme: 'thunderstorm',
    nightTheme: 'thunderstorm',
    icon: 'thunderstorm',
    audio: 'thunder',
    narrative: 'Dynamic electric storm cells with dramatic lightning arcs and deep thunder rolls.'
  },
  96: {
    label: 'Thunderstorm with Slight Hail',
    dayTheme: 'thunderstorm',
    nightTheme: 'thunderstorm',
    icon: 'thunderstorm',
    audio: 'thunder',
    narrative: 'Electric atmospheric convection bringing small hail and turbulent gusts.'
  },
  99: {
    label: 'Thunderstorm with Heavy Hail',
    dayTheme: 'thunderstorm',
    nightTheme: 'thunderstorm',
    icon: 'thunderstorm',
    audio: 'thunder',
    narrative: 'Severe supercell thunderstorm accompanied by heavy hail stones and electric strikes.'
  }
};

/**
 * Returns weather metadata for given WMO code and day/night status
 */
export function getWeatherMeta(wmoCode, isDay = 1) {
  const codeInfo = WMO_CODES[wmoCode] || {
    label: 'Variable Sky',
    dayTheme: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night',
    nightTheme: 'clear-night',
    icon: 'partly-cloudy',
    audio: 'breeze',
    narrative: 'Atmospheric conditions shifting across local regional microclimates.'
  };

  const theme = isDay ? codeInfo.dayTheme : codeInfo.nightTheme;
  return {
    ...codeInfo,
    theme,
    isDay: Boolean(isDay)
  };
}
