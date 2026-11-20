# MeteoLive - Technical Architecture Guide

## Table of Contents
1. [Overview](#overview)
2. [Application Architecture](#application-architecture)
3. [Initialization Process](#initialization-process)
4. [State Management](#state-management)
5. [Data Flow](#data-flow)
6. [Component Structure](#component-structure)
7. [Weather Visualization Engine](#weather-visualization-engine)
8. [API Integration](#api-integration)
9. [File Structure](#file-structure)

---

## Overview

MeteoLive is a Progressive Web Application (PWA) that displays real-time weather data using the Open-Meteo API. It features:

- **Real-time weather data** from Open-Meteo REST API
- **Canvas-based particle animations** for weather effects (rain, snow, lightning, etc.)
- **Reactive state management** using a custom Pub/Sub pattern
- **Modular component architecture** for UI elements
- **Service Worker** for offline caching
- **Time Machine feature** to simulate future weather conditions

---

## Application Architecture

### High-Level Flow

```
User Action → Component → State Store → API → State Update → Component Re-render
```

1. **User interacts** with UI (searches city, clicks buttons)
2. **Component** captures event and calls State Store methods
3. **State Store** updates internal state and emits events
4. **API Layer** fetches data from Open-Meteo
5. **State Store** receives data and emits update events
6. **Components** subscribed to events re-render with new data

### Key Architectural Patterns

- **Pub/Sub Event Bus**: Components subscribe to state changes rather than direct coupling
- **Single Source of Truth**: All application state lives in `StateStore`
- **LocalStorage Persistence**: User preferences and last city are saved
- **Module System**: ES6 modules for clean code organization

---

## Initialization Process

### Entry Point: `index.html`

1. HTML structure loads with empty containers for dynamic content
2. `<script type="module" src="/js/app.js">` loads the main application

### Main Application: `js/app.js`

```javascript
class AetherApp {
  async init() {
    // 1. Initialize Weather Engine (canvas animations)
    this.weatherEngine = new WeatherEngine(canvas, flashOverlay);
    
    // 2. Initialize UI Components
    this.hero = new HeroComponent(heroContainer, store);
    this.hourly = new HourlyComponent(hourlyContainer, store);
    this.daily = new DailyComponent(dailyContainer, store);
    // ... more components
    
    // 3. Attach Event Listeners
    this.attachHeaderControls();
    
    // 4. Load Initial Weather Data
    store.loadLastCity();
  }
}
```

### State Store Initialization: `js/state.js`

```javascript
class StateStore {
  constructor() {
    // Load persisted settings from localStorage
    this.units = localStorage.getItem('aether_units') || 'metric';
    this.themePreference = localStorage.getItem('aether_theme_pref') || 'system';
    this.currentCity = this.loadSavedLastCity() || DEFAULT_CITY;
    
    // Apply theme immediately
    this.applyThemePreference(this.themePreference);
  }
}
```

---

## State Management

### The State Store (`js/state.js`)

The `StateStore` is the central hub for all application data. It implements a **Pub/Sub pattern**:

```javascript
class StateStore {
  constructor() {
    this.events = {}; // Event name → array of callbacks
    this.currentCity = { name, country, latitude, longitude, timezone };
    this.weatherData = null;
    this.units = 'metric'; // or 'imperial'
    this.themePreference = 'system'; // or 'dark'/'light'
  }
  
  // Subscribe to state changes
  subscribe(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  
  // Emit events to notify subscribers
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
}
```

### Key State Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentCity` | Object | Currently selected city (name, lat, lon, timezone) |
| `weatherData` | Object | Full weather data from Open-Meteo API |
| `units` | String | 'metric' or 'imperial' |
| `timeMachineHour` | Number | 0 = live, 1-23 = future hour simulation |
| `favorites` | Array | List of saved cities |
| `themePreference` | String | 'dark', 'light', or 'system' |

### Key State Methods

```javascript
// Change current city and fetch weather
setCurrentCity(city) {
  this.currentCity = city;
  this.saveLastCity(city);
  this.emit('city:changed', city);
  this.fetchWeatherForCity(city);
}

// Update weather data
setWeatherData(data) {
  this.weatherData = data;
  this.emit('weather:updated', { weather: data });
}

// Change units (metric/imperial)
setUnits(units) {
  this.units = units;
  localStorage.setItem('aether_units', units);
  this.emit('units:changed', units);
}
```

---

## Data Flow

### Example: User Searches for a City

1. **User types** in search box → `SearchComponent` captures input
2. **Debounced API call** → `searchLocations()` in `js/api.js`
3. **API returns** city suggestions → Search displays results
4. **User clicks** a city → `SearchComponent` calls `store.setCurrentCity(city)`
5. **State emits** 'city:changed' event
6. **App.js listener** calls `fetchForecast()` for the new city
7. **API returns** weather data → `store.setWeatherData(data)`
8. **State emits** 'weather:updated' event
9. **All components** (Hero, Hourly, Daily, etc.) re-render with new data

### Example: Changing Temperature Units

1. **User clicks** units toggle button
2. **Component calls** `store.setUnits('imperial')`
3. **State updates** and saves to localStorage
4. **State emits** 'units:changed' event
5. **Hero, Hourly, Daily components** re-render using new units
6. **Formatters** convert Celsius to Fahrenheit

---

## Component Structure

### Component Base Pattern

All UI components follow this pattern:

```javascript
export class HeroComponent {
  constructor(containerElement, store) {
    this.container = containerElement;
    this.store = store;
    this.init();
  }
  
  init() {
    // Subscribe to relevant state events
    this.store.subscribe('weather:updated', ({ weather }) => {
      this.render(weather);
    });
    
    this.store.subscribe('city:changed', () => {
      this.startClock();
    });
  }
  
  render(weather) {
    // Generate HTML based on weather data
    this.container.innerHTML = `...`;
  }
}
```

### Main Components

| Component | File | Purpose |
|-----------|------|---------|
| **Hero** | `js/components/hero.js` | Main weather display (temp, condition, location) |
| **Hourly** | `js/components/hourly.js` | 24-hour horizontal forecast timeline |
| **Daily** | `js/components/daily.js` | 7-day daily forecast with temperature bars |
| **Details** | `js/components/details.js` | Additional metrics (UV, sunrise, wind, etc.) |
| **Search** | `js/components/search.js` | City search modal with suggestions |
| **Favorites** | `js/components/favorites.js` | Saved cities drawer |
| **TimeMachine** | `js/components/time-machine.js` | Slider to simulate future weather |
| **Insights** | `js/components/insights.js` | Clothing/activity recommendations |
| **WorldExplorer** | `js/components/world-explorer.js` | Interactive world map |

---

## Weather Visualization Engine

### Canvas Engine (`js/weather-engine.js`)

The `WeatherEngine` renders atmospheric particle effects on an HTML5 canvas:

```javascript
class WeatherEngine {
  constructor(canvas, flashOverlay) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.weatherCode = null;
  }
  
  setWeather(code, isDay) {
    this.weatherCode = code;
    this.isDay = isDay;
    this.initParticles();
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles.forEach(p => {
      p.update();
      p.draw(this.ctx);
    });
    
    requestAnimationFrame(() => this.animate());
  }
}
```

### Weather Effects

| Weather Code | Effect | Implementation |
|--------------|--------|----------------|
| Rain (51-67) | Raindrops with splash ripples | Lines with velocity, circles on ground |
| Snow (71-77) | Multi-layered snowflakes | 3 layers with different speeds/blur |
| Thunderstorm (95-99) | Lightning flashes | Random flash overlay + procedural bolts |
| Clear (0) | Sun rays + dust motes | Rotating lines + floating particles |
| Cloudy (1-3) | Drifting cloud shapes | Soft gradients with parallax |

### Time Machine Integration

When user scrubs the Time Machine slider:

```javascript
store.setTimeMachineHour(5); // Simulate 5 hours in future
```

Components receive 'timeMachine:scrub' event and render data from the corresponding hour in the forecast array.

---

## API Integration

### Open-Meteo API (`js/api.js`)

The app uses Open-Meteo's free REST API:

```javascript
export async function fetchForecast(lat, lon, timezone) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${timezone}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,wind_speed_10m`;
  
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
```

### API Endpoints Used

1. **Geocoding API**: Search cities by name
   - `https://geocoding-api.open-meteo.com/v1/search?name={query}`

2. **Forecast API**: Get weather data for coordinates
   - `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&...`

3. **Air Quality API**: Get pollution data
   - `https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}`

### Data Transformation

Raw API data is processed in `js/app.js`:

```javascript
async function loadWeatherForCity(city) {
  const weatherData = await fetchForecast(city.latitude, city.longitude, city.timezone);
  store.setWeatherData(weatherData);
  
  // Also fetch air quality
  const airQuality = await fetchAirQuality(city.latitude, city.longitude);
  store.setAirQualityData(airQuality);
}
```

---

## File Structure

```
Application_meteo/
├── index.html              # Main HTML structure
├── server.js               # Development server
├── service-worker.js       # PWA offline caching
├── manifest.json           # PWA manifest
├── package.json            # Node.js dependencies
├── README.md               # User documentation
├── TECHNICAL_GUIDE.md      # This file
│
├── css/
│   ├── base.css            # Core styles
│   ├── variables.css       # CSS variables (colors, z-index)
│   ├── weather-themes.css   # Weather-specific themes
│   └── components.css      # Component-specific styles
│
├── js/
│   ├── app.js              # Main application entry point
│   ├── state.js            # Central state store
│   ├── api.js              # API integration layer
│   ├── chart.js            # Forecast chart rendering
│   ├── audio-engine.js     # Procedural weather sounds
│   ├── weather-engine.js   # Canvas particle effects
│   │
│   ├── components/         # UI components
│   │   ├── hero.js         # Main weather display
│   │   ├── hourly.js       # Hourly forecast
│   │   ├── daily.js        # Daily forecast
│   │   ├── details.js      # Weather details
│   │   ├── search.js       # City search
│   │   ├── favorites.js    # Saved cities
│   │   ├── time-machine.js # Time simulation
│   │   ├── insights.js     # Recommendations
│   │   └── world-explorer.js # World map
│   │
│   └── utils/              # Utility functions
│       ├── formatters.js   # Temperature, date formatting
│       ├── weather-codes.js # WMO code → label mapping
│       └── icons.js        # SVG weather icons
```

---

## How to Extend the Application

### Adding a New Component

1. Create file in `js/components/your-component.js`
2. Follow the component pattern:
   ```javascript
   export class YourComponent {
     constructor(container, store) {
       this.container = container;
       this.store = store;
       this.init();
     }
     
     init() {
       this.store.subscribe('weather:updated', ({ weather }) => {
         this.render(weather);
       });
     }
     
     render(weather) {
       this.container.innerHTML = `...`;
     }
   }
   ```
3. Import and initialize in `js/app.js`
4. Add container element to `index.html`

### Adding a New State Property

1. Add property to `StateStore` constructor in `js/state.js`
2. Add setter method that emits an event
3. Subscribe to the event in components that need it

### Adding a New Weather Effect

1. Add particle class to `js/weather-engine.js`
2. Map weather code to effect in `setWeather()` method
3. Implement `update()` and `draw()` methods for particles

---

## Summary

MeteoLive follows a clean, modular architecture:

- **State-driven**: All UI updates flow through the central State Store
- **Event-based**: Components react to state changes via Pub/Sub
- **API-first**: Real data from Open-Meteo, no mock data
- **Canvas-powered**: Smooth, performant weather animations
- **PWA-ready**: Works offline with service worker caching

The separation of concerns (state, UI, API, visualization) makes the codebase maintainable and extensible.
