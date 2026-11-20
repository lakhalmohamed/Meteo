# 🌌 MeteoLive — A Live Weather Experience

> **MeteoLive** is a living, cinematic weather web application and Progressive Web Application (PWA) built with vanilla HTML5, modern CSS3, and ES6+ JavaScript. Designed as a flagship academic and commercial-grade product, it unites real-time meteorological telemetry from **Open-Meteo** with an interactive **Canvas particle physics engine**, **modern glassmorphism**, **procedural Web Audio soundscapes**, a **Weather Time Machine**, a **World Weather Explorer**, and **deterministic weather intelligence**.

---

## 🌟 Living Weather Engine & Visual Philosophy

- **Dynamic Atmospheric Engine (`js/weather-engine.js`)**:
  - **Rain & Showers**: Realistic angled velocity streaks, bottom splash ripples, and **physical raindrops on glass** with water bead condensation and gravity streak physics. Rain density scales dynamically with actual Open-Meteo `precipitation` volume.
  - **Snow & Blizzard**: Multi-layered 3D depth snow (foreground blurred fast flakes, midground crystalline flakes with horizontal sine-wave sway, and background soft snow dust).
  - **Thunderstorms**: Volumetric dark rolling clouds, procedural multi-branch lightning discharges, and ambient screen illumination flashes.
  - **Sunny / Clear Day**: Volumetric solar corona, rotating atmospheric rays, and floating golden dust motes.
  - **Clear Night & Twilight**: 3-tier parallax starfield with spectral color diversity (white, amber, violet, cyan), glowing lunar aura, and shooting star trails.
  - **Accessibility**: Strictly honors `@media (prefers-reduced-motion: reduce)`.
  - **Battery & Efficiency**: Automatically pauses rendering during `document.hidden` (Page Visibility API) to conserve GPU and CPU.

---

## 🚀 Key Feature Suites

### 1. ⏳ Weather Time Machine (`js/components/time-machine.js`)
- Scrub through upcoming 24 hours of forecast telemetry with an interactive horizontal slider.
- Scrubbing dynamically updates the **Hero card**, **Weather condition**, **Temperature counter**, **Precipitation probability**, **Wind metrics**, and the **Atmospheric canvas background** (sunlight position, stars, rain) in real time.
- Instant preset jump buttons: `Now`, `+3 Hours`, `+6 Hours`, `+12 Hours`, `Evening`, `Tomorrow Dawn`.
- Features a prominent **Reset to Now** action to return to live telemetry.

### 2. 🌍 World Weather Explorer (`js/components/world-explorer.js`)
- Interactive vector world map displaying global telemetry markers.
- Displays interactive pins for current location, saved favorites, and global hubs (Tokyo, Paris, New York, London, Reykjavik, Sydney, Dubai, Cairo, etc.).
- Hover HUD displaying real-time geodetic coordinates (`Lat°N/S, Lon°E/W`).
- Click any pin or anywhere on earth to reverse geocode and instantly load live weather for that location.

### 3. ⚖️ Meteorological City Comparison (`js/components/comparison.js`)
- Side-by-side comparison between the user's current city and any global destination or saved favorite.
- Computes and displays dynamic deltas:
  - Temperature difference (e.g. `+4° Warmer` or `-3° Cooler`)
  - Humidity comparison (`15% more humid` / `drier`)
  - Wind velocity delta
  - Day range (min/max), rain probability, and UV index.

### 4. 🧠 Weather Intelligence & Insights (`js/components/insights.js`)
- **Today's Meteorological Brief**: Natural narrative summary of atmospheric trends and temperature comparison against the 7-day average.
- **Air Quality Telemetry (Open-Meteo Air Quality API)**: European AQI / US AQI index, PM2.5, PM10, and Ozone (O₃) concentrations with color-coded health advisories.
- **Rain Window Prediction**: Exact window of elevated rain probability over the next 12–24 hours.
- **Outdoor Activity Index**: Deterministic suitability scores (0–100%) and ratings for:
  - 🏃 *Running & Jogging* (factors temp, humidity, wind, AQI)
  - 🚴 *Road & Trail Cycling* (factors wind gusts, precipitation, visibility)
  - 🔭 *Celestial Stargazing* (factors cloud cover, visibility, night cycle)
  - 📸 *Outdoor Photography* (factors lighting, cloud dynamics, golden hour)
- **Attire & Gear Advisory**: Deterministic clothing suggestions based on windchill, rain chance, and UV index.

### 5. 🎵 Procedural Web Audio Soundscapes (`js/audio-engine.js`)
- Synthesizes organic soundscapes (filtered white/pink noise rain, resonant low-pass thunder rumbles, wind breeze sweeps, and serene harmonic chords) using the native **Web Audio API** without requiring any external audio files.
- Controlled via a floating ambience pill with volume slider and animated equalizer bars. Strictly adheres to browser autoplay policies (requires user gesture to activate).

### 6. 📈 Interactive 24-Hour Telemetry Chart (`js/chart.js`)
- Custom canvas chart utilizing cubic Bézier splines, vertical gradient fills, and high-DPI rendering.
- Interactive touch and mouse hover scrubber with a dynamic glassmorphic tooltip.
- Metric toggle tabs: **Temperature (°C/°F)**, **Precipitation Probability (%)**, and **Wind Speed (km/h or mph)**.

---

## 📡 Real-Time Open-Meteo REST API Services

AETHER consumes zero mock or fake data in production:

1. **Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
   - Debounced search (300ms) with `AbortController` cancellation.
2. **Forecast API**: `https://api.open-meteo.com/v1/forecast`
   - Parameters: `latitude`, `longitude`, `timezone=auto`, `current`, `hourly` (24–48h), and `daily` (7-day).
3. **Air Quality API**: `https://air-quality-api.open-meteo.com/v1/air-quality`
   - Telemetry: European AQI, US AQI, PM2.5, PM10, O3, NO2.
4. **WMO Code Mapping**: All WMO weather interpretation codes mapped to descriptions, dynamic themes, audio presets, and animated icons in `js/utils/weather-codes.js`.

---

## 📱 Progressive Web Application (PWA) Implementation

- **Manifest** (`manifest.webmanifest` & `manifest.json`): Standalone display mode, shortcuts, high-resolution icons (192, 512, maskable, apple-touch-icon, and favicon SVG).
- **Service Worker** (`service-worker.js`):
  - Version `aether-v2.0.0`
  - Precaches all application shell assets.
  - Network-First caching strategy for Open-Meteo forecast and air quality APIs.
  - Decorates cached offline responses with `X-Aether-Offline-Cached: true`.
- **PWA Manager** (`js/pwa-manager.js`):
  - Intercepts `beforeinstallprompt` to surface custom in-app "Install" button.
  - Offline status banner with cached timestamps and manual "Reconnect" button.

---

## 📁 Project Directory Structure

```
Application_meteo/
├── index.html                   # Semantic HTML5 Application Shell
├── manifest.webmanifest         # PWA Manifest v2.0.0
├── manifest.json                # PWA Manifest (backward compatibility)
├── service-worker.js            # PWA Service Worker (offline caching)
├── server.js                    # Built-in lightweight Node.js HTTP server
├── package.json                 # Project configuration
├── README.md                    # Documentation & Architecture Guide
├── css/
│   ├── variables.css            # Design tokens, glassmorphism, metrics
│   ├── weather-themes.css       # Dynamic weather color palettes
│   ├── base.css                 # Reset, typography, app header, offline banner
│   └── components.css           # Glass panels, hero card, time machine, explorer, comparison
├── js/
│   ├── app.js                   # Main application entry point & orchestrator
│   ├── state.js                 # Centralized Pub/Sub state store & localStorage
│   ├── api.js                   # Open-Meteo Geocoding, Forecast & Air Quality client
│   ├── weather-engine.js        # Living Canvas engine (Rain on glass, 3D snow, lightning)
│   ├── audio-engine.js          # Procedural Web Audio API soundscape generator
│   ├── chart.js                 # Custom 24-hour cubic Bézier canvas forecast chart
│   ├── pwa-manager.js           # Service worker registration & install prompts
│   ├── components/
│   │   ├── hero.js              # Hero weather display & Time Machine reflection
│   │   ├── time-machine.js      # 24h interactive timeline simulation scrubber
│   │   ├── insights.js          # Weather Intelligence, Activity Index & Air Quality
│   │   ├── world-explorer.js    # Interactive Vector World Map & Geodetic HUD
│   │   ├── comparison.js        # Side-by-side city meteorological comparison
│   │   ├── hourly.js            # Horizontal 24h scrollable forecast timeline
│   │   ├── daily.js             # 7-day forecast with proportional range bars
│   │   ├── details.js           # 8 detail cards (Wind compass, Solar arc, UV, etc.)
│   │   ├── search.js            # Search modal, debouncing & history
│   │   └── favorites.js         # Saved places drawer & mini weather cards
│   └── utils/
│       ├── weather-codes.js     # WMO code mappings, themes, and narratives
│       ├── formatters.js        # Units (°C/°F, km/h/mph), timezones & dates
│       └── icons.js             # Animated vector SVG weather icons
├── assets/
│   └── icons/
│       ├── favicon.svg          # Vector weather insignia
│       ├── icon-192.png         # PWA standard icon
│       ├── icon-512.png         # PWA high-res icon
│       ├── icon-maskable.png    # PWA adaptive maskable icon
│       └── apple-touch-icon.png # iOS home screen icon
└── scripts/
    └── generate-icons.js        # Pure Node.js script generating PNG & SVG icons
```

---

## 🚀 Running the Application Locally

```bash
# Start built-in server on http://localhost:3000
npm start
# or
node server.js
```
Then navigate to `http://localhost:3000` in any modern web browser.
