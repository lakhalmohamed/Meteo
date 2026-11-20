/**
 * AETHER World Weather Explorer Component
 * Interactive vector world map displaying global telemetry markers, favorite cities,
 * and seamless location navigation with real-time Open-Meteo data.
 */

import { formatTemp } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weather-codes.js';
import { getWeatherSvg } from '../utils/icons.js';
import { fetchForecast, reverseGeocode } from '../api.js';

// Key global meteorological benchmark hubs
const GLOBAL_HUBS = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, tz: 'America/Sao_Paulo' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, tz: 'Africa/Johannesburg' }
];

export class WorldExplorerComponent {
  constructor(modalBackdropElement, triggerBtnElement, store) {
    this.modal = modalBackdropElement;
    this.triggerBtn = triggerBtnElement;
    this.store = store;

    this.canvas = null;
    this.ctx = null;
    this.pinsData = [];
    this.hoveredPin = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.init();
  }

  init() {
    this.renderStructure();
    this.attachEvents();

    this.store.subscribe('favorites:updated', () => {
      this.refreshPinsTelemetry();
    });

    this.store.subscribe('city:changed', () => {
      if (this.isOpen()) {
        this.drawMap();
      }
    });

    this.store.subscribe('units:changed', () => {
      if (this.isOpen()) {
        this.drawMap();
      }
    });
  }

  renderStructure() {
    this.modal.innerHTML = `
      <div class="world-explorer-dialog" role="dialog" aria-modal="true" aria-label="World Weather Explorer">
        <div class="explorer-header">
          <div class="explorer-title-wrap">
            <div class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              World Weather Explorer
            </div>
            <span class="explorer-subtitle">Interactive geographical telemetry map. Click any pin to jump to that city.</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="explorer-coords-readout" id="explorer-coords-hud">0.00°N, 0.00°E</div>
            <button class="modal-close-btn" id="explorer-modal-close" title="Close Explorer (Esc)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Canvas World Map Viewport -->
        <div class="explorer-map-viewport" id="explorer-map-container">
          <canvas id="explorer-canvas"></canvas>
          <div class="explorer-pin-tooltip" id="explorer-pin-tooltip"></div>
        </div>

        <!-- Bottom Telemetry Chips of Global Hubs -->
        <div class="explorer-hubs-bar" id="explorer-hubs-list"></div>
      </div>
    `;

    this.canvas = document.getElementById('explorer-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  attachEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.open());
    }

    document.getElementById('explorer-modal-close').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Canvas Mouse Interaction (Hover HUD & Click navigation)
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  async open() {
    this.modal.classList.add('is-open');
    this.resizeCanvas();
    await this.refreshPinsTelemetry();
    this.drawMap();
    this.renderHubsBar();
  }

  close() {
    this.modal.classList.remove('is-open');
  }

  isOpen() {
    return this.modal.classList.contains('is-open');
  }

  resizeCanvas() {
    const container = document.getElementById('explorer-map-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = Math.max(380, rect.height || 440);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  // Convert Latitude & Longitude to Canvas Coordinates (Equirectangular Projection)
  latLonToCanvas(lat, lon) {
    // lon: -180 to +180 -> x: 0 to width
    // lat: +90 to -90 -> y: 0 to height
    const x = ((lon + 180) / 360) * this.width;
    const y = ((90 - lat) / 180) * this.height;
    return { x, y };
  }

  // Convert Canvas Coordinates to Lat/Lon
  canvasToLatLon(x, y) {
    const lon = (x / this.width) * 360 - 180;
    const lat = 90 - (y / this.height) * 180;
    return { lat, lon };
  }

  async refreshPinsTelemetry() {
    // Combine Current City, Favorites, and Global Hubs
    const list = [];

    // Current City
    const cur = this.store.currentCity;
    list.push({
      name: cur.name,
      country: cur.country,
      lat: cur.latitude,
      lon: cur.longitude,
      tz: cur.timezone,
      isCurrent: true
    });

    // Favorites
    this.store.favorites.forEach(f => {
      if (!list.some(item => Math.abs(item.lat - f.latitude) < 0.2 && Math.abs(item.lon - f.longitude) < 0.2)) {
        list.push({
          name: f.name,
          country: f.country,
          lat: f.latitude,
          lon: f.longitude,
          tz: f.timezone,
          isFavorite: true
        });
      }
    });

    // Global Hubs
    GLOBAL_HUBS.forEach(h => {
      if (!list.some(item => Math.abs(item.lat - h.lat) < 0.2 && Math.abs(item.lon - h.lon) < 0.2)) {
        list.push({
          ...h,
          isHub: true
        });
      }
    });

    this.pinsData = list;

    // Fetch live weather telemetry for top pins
    for (const p of this.pinsData) {
      if (p.isCurrent && this.store.weatherData && this.store.weatherData.current) {
        p.temp = this.store.weatherData.current.temperature_2m;
        p.code = this.store.weatherData.current.weather_code;
        p.isDay = this.store.weatherData.current.is_day;
      }
    }
  }

  drawMap() {
    if (!this.ctx || !this.width) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Space / Ocean Background
    const oceanGrad = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 50,
      this.width / 2, this.height / 2, this.width / 2
    );
    oceanGrad.addColorStop(0, '#0f172a');
    oceanGrad.addColorStop(1, '#05070f');
    this.ctx.fillStyle = oceanGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw Geodetic Lat/Lon Grid lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 4]);

    // Longitude Meridians (every 30°)
    for (let lon = -150; lon <= 150; lon += 30) {
      const { x } = this.latLonToCanvas(0, lon);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    // Latitude Parallels (every 30°)
    for (let lat = -60; lat <= 60; lat += 30) {
      const { y } = this.latLonToCanvas(lat, 0);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Equator Line (Prominent)
    const eq = this.latLonToCanvas(0, 0);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, eq.y);
    this.ctx.lineTo(this.width, eq.y);
    this.ctx.stroke();

    // 3. Draw Stylized Continents (Vector Simplified Polygons for clean offline rendering)
    this.drawStylizedContinents();

    // 4. Draw City Telemetry Pins
    this.pinsData.forEach((pin, idx) => {
      const { x, y } = this.latLonToCanvas(pin.lat, pin.lon);
      pin.canvasX = x;
      pin.canvasY = y;

      const isCurrent = pin.isCurrent;
      const isFavorite = pin.isFavorite;

      // Glow Ring for Current City
      if (isCurrent) {
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#f59e0b';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 9, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }

      // Pin Center Dot
      this.ctx.fillStyle = isCurrent ? '#f59e0b' : (isFavorite ? '#fbbf24' : '#38bdf8');
      this.ctx.beginPath();
      this.ctx.arc(x, y, isCurrent ? 5 : 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Pin Label
      this.ctx.font = '10px -apple-system, sans-serif';
      this.ctx.fillStyle = isCurrent ? '#fbbf24' : 'rgba(255, 255, 255, 0.85)';
      this.ctx.textAlign = 'left';
      const labelText = pin.temp !== undefined ? `${pin.name} · ${formatTemp(pin.temp, this.store.units)}` : pin.name;
      this.ctx.fillText(labelText, x + 8, y + 3);
    });
  }

  // Procedural vector landmass outlines for offline visual fidelity
  drawStylizedContinents() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    this.ctx.lineWidth = 1.2;

    const continents = [
      // North America
      [[-165, 68], [-140, 70], [-100, 72], [-80, 70], [-60, 50], [-70, 42], [-80, 25], [-90, 18], [-105, 20], [-120, 35], [-125, 50], [-165, 60]],
      // South America
      [[-78, 10], [-50, -5], [-35, -5], [-40, -22], [-55, -45], [-70, -55], [-75, -45], [-72, -18], [-80, 0]],
      // Europe
      [[-10, 36], [0, 42], [15, 38], [25, 36], [30, 45], [40, 55], [30, 68], [10, 62], [5, 50], [-5, 48]],
      // Africa
      [[-15, 32], [10, 36], [32, 32], [50, 12], [42, -5], [30, -32], [18, -34], [12, -18], [0, 5], [-15, 12]],
      // Asia
      [[35, 35], [50, 40], [70, 25], [80, 15], [95, 20], [105, 10], [120, 22], [125, 40], [140, 50], [165, 65], [170, 72], [100, 75], [60, 70], [45, 55]],
      // Australia
      [[115, -22], [130, -12], [145, -15], [152, -28], [145, -38], [128, -35], [115, -32]]
    ];

    continents.forEach(poly => {
      this.ctx.beginPath();
      poly.forEach(([lon, lat], i) => {
        const { x, y } = this.latLonToCanvas(lat, lon);
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Update Coordinates HUD
    const { lat, lon } = this.canvasToLatLon(clientX, clientY);
    const hud = document.getElementById('explorer-coords-hud');
    if (hud) {
      const latStr = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
      const lonStr = `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;
      hud.textContent = `${latStr}, ${lonStr}`;
    }

    // Check Pin Hover
    let hovered = null;
    for (const p of this.pinsData) {
      if (p.canvasX !== undefined && p.canvasY !== undefined) {
        const dist = Math.hypot(p.canvasX - clientX, p.canvasY - clientY);
        if (dist < 14) {
          hovered = p;
          break;
        }
      }
    }

    this.hoveredPin = hovered;
    this.canvas.style.cursor = hovered ? 'pointer' : 'crosshair';

    // Tooltip
    const tooltip = document.getElementById('explorer-pin-tooltip');
    if (hovered && tooltip) {
      tooltip.innerHTML = `
        <div style="font-weight:700;">${hovered.name}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${hovered.country || ''}</div>
        <div style="font-size:0.72rem; color:var(--theme-primary); margin-top:2px;">Click to switch location</div>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = `${hovered.canvasX}px`;
      tooltip.style.top = `${hovered.canvasY - 10}px`;
    } else if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  handleMouseLeave() {
    this.hoveredPin = null;
    const tooltip = document.getElementById('explorer-pin-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  }

  async handleClick(e) {
    if (this.hoveredPin) {
      this.store.setCity({
        name: this.hoveredPin.name,
        country: this.hoveredPin.country,
        latitude: this.hoveredPin.lat,
        longitude: this.hoveredPin.lon,
        timezone: this.hoveredPin.tz || 'auto'
      });
      this.close();
      return;
    }

    // Click anywhere on earth: Reverse Geocode and load that exact coordinate!
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const { lat, lon } = this.canvasToLatLon(clientX, clientY);

    try {
      const geo = await reverseGeocode(lat, lon);
      this.store.setCity({
        name: geo.name,
        country: geo.country,
        country_code: geo.country_code,
        admin1: geo.admin1,
        latitude: lat,
        longitude: lon,
        timezone: 'auto'
      });
      this.close();
    } catch (err) {
      console.warn('Map click reverse error:', err);
    }
  }

  renderHubsBar() {
    const list = document.getElementById('explorer-hubs-list');
    if (!list) return;

    list.innerHTML = GLOBAL_HUBS.map(h => `
      <button class="explorer-hub-chip" data-hub='${JSON.stringify(h)}'>
        ${h.name}
      </button>
    `).join('');

    list.querySelectorAll('.explorer-hub-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const hub = JSON.parse(btn.getAttribute('data-hub'));
        this.store.setCity({
          name: hub.name,
          country: hub.country,
          latitude: hub.lat,
          longitude: hub.lon,
          timezone: hub.tz
        });
        this.close();
      });
    });
  }
}
