/**
 * AETHER Interactive 24-Hour Forecast Chart
 * Custom lightweight Canvas chart with cubic Bézier splines and interactive scrubber.
 */

import { formatTemp, formatWind, formatHour, cToF } from './utils/formatters.js';
import { getWeatherMeta } from './utils/weather-codes.js';

export class ForecastChart {
  constructor(canvasElement, tooltipElement, store) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.tooltip = tooltipElement;
    this.store = store;

    this.points = [];
    this.hourlyData = null;
    this.activeTab = 'temp'; // 'temp' | 'rain' | 'wind'
    this.hoverIndex = -1;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.draw();
    }, { passive: true });

    // Scrubber interaction
    this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handlePointerLeave());
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerMove(e.touches[0]);
      }
    }, { passive: true });
    this.canvas.addEventListener('touchend', () => this.handlePointerLeave());

    this.store.subscribe('weather:updated', ({ weather }) => {
      if (weather && weather.hourly) {
        this.setData(weather.hourly);
      }
    });

    this.store.subscribe('units:changed', () => {
      this.draw();
    });

    this.store.subscribe('chart:tab', (tab) => {
      this.activeTab = tab;
      this.draw();
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 220;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  setData(hourly) {
    this.hourlyData = hourly;
    this.draw();
  }

  draw() {
    if (!this.hourlyData || !this.hourlyData.time) return;

    this.resize();
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Take next 24 hours
    const count = 24;
    const times = this.hourlyData.time.slice(0, count);
    const temps = this.hourlyData.temperature_2m.slice(0, count);
    const rains = this.hourlyData.precipitation_probability.slice(0, count);
    const winds = this.hourlyData.wind_speed_10m.slice(0, count);
    const codes = this.hourlyData.weather_code.slice(0, count);
    const isDays = this.hourlyData.is_day.slice(0, count);

    const isImperial = this.store.units === 'imperial';

    let values = [];
    let unitLabel = '°';
    let lineColor = '#38bdf8';
    let gradientStart = 'rgba(56, 189, 248, 0.45)';
    let gradientEnd = 'rgba(56, 189, 248, 0.01)';

    if (this.activeTab === 'temp') {
      values = temps.map(t => isImperial ? cToF(t) : t);
      unitLabel = '°';
      lineColor = '#f59e0b';
      gradientStart = 'rgba(245, 158, 11, 0.4)';
      gradientEnd = 'rgba(245, 158, 11, 0.01)';
    } else if (this.activeTab === 'rain') {
      values = rains.map(r => r || 0);
      unitLabel = '%';
      lineColor = '#38bdf8';
      gradientStart = 'rgba(56, 189, 248, 0.45)';
      gradientEnd = 'rgba(56, 189, 248, 0.01)';
    } else if (this.activeTab === 'wind') {
      values = winds.map(w => isImperial ? w * 0.621371 : w);
      unitLabel = isImperial ? ' mph' : ' km/h';
      lineColor = '#c084fc';
      gradientStart = 'rgba(192, 132, 252, 0.4)';
      gradientEnd = 'rgba(192, 132, 252, 0.01)';
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;

    const padLeft = 40;
    const padRight = 30;
    const padTop = 35;
    const padBottom = 45;

    const plotWidth = this.width - padLeft - padRight;
    const plotHeight = this.height - padTop - padBottom;

    // Calculate canvas coordinates
    this.points = values.map((val, i) => {
      const x = padLeft + (i / (count - 1)) * plotWidth;
      const normalized = (val - minVal) / range;
      const y = padTop + (1 - normalized) * plotHeight;
      return {
        x,
        y,
        val,
        time: times[i],
        code: codes[i],
        isDay: isDays[i],
        rain: rains[i],
        wind: winds[i]
      };
    });

    // 1. Draw horizontal guide lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 6]);

    for (let g = 0; g <= 3; g++) {
      const gy = padTop + (g / 3) * plotHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(padLeft, gy);
      this.ctx.lineTo(this.width - padRight, gy);
      this.ctx.stroke();

      // Guide label
      const gVal = Math.round(maxVal - (g / 3) * range);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${gVal}${unitLabel}`, padLeft - 8, gy + 3);
    }
    this.ctx.setLineDash([]);

    // 2. Draw smooth cubic Bézier spline curve & gradient area
    if (this.points.length > 1) {
      // Area Fill
      const grad = this.ctx.createLinearGradient(0, padTop, 0, this.height - padBottom);
      grad.addColorStop(0, gradientStart);
      grad.addColorStop(1, gradientEnd);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.moveTo(this.points[0].x, this.height - padBottom);
      this.ctx.lineTo(this.points[0].x, this.points[0].y);

      for (let i = 0; i < this.points.length - 1; i++) {
        const p0 = this.points[i];
        const p1 = this.points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        this.ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p1.x, p1.y);
      }

      this.ctx.lineTo(this.points[this.points.length - 1].x, this.height - padBottom);
      this.ctx.closePath();
      this.ctx.fill();

      // Curve Stroke
      this.ctx.strokeStyle = lineColor;
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = lineColor;
      this.ctx.shadowBlur = 10;

      this.ctx.beginPath();
      this.ctx.moveTo(this.points[0].x, this.points[0].y);

      for (let i = 0; i < this.points.length - 1; i++) {
        const p0 = this.points[i];
        const p1 = this.points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        this.ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p1.x, p1.y);
      }
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    // 3. Draw Time Labels on X-axis (every 3 hours)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';

    this.points.forEach((p, i) => {
      if (i % 3 === 0 || i === this.points.length - 1) {
        const hourStr = formatHour(p.time, this.store.timeFormat);
        this.ctx.fillText(hourStr, p.x, this.height - 12);

        // Small tick
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = lineColor;
        this.ctx.fill();
      }
    });

    // 4. Draw Scrubber if hovered
    if (this.hoverIndex >= 0 && this.hoverIndex < this.points.length) {
      const hp = this.points[this.hoverIndex];

      // Vertical line
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([3, 4]);
      this.ctx.beginPath();
      this.ctx.moveTo(hp.x, padTop);
      this.ctx.lineTo(hp.x, this.height - padBottom);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Glow circle at point
      this.ctx.beginPath();
      this.ctx.arc(hp.x, hp.y, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = lineColor;
      this.ctx.shadowBlur = 12;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }

  handlePointerMove(e) {
    if (!this.points || this.points.length === 0) return;
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;

    let closestIdx = 0;
    let minDistance = Infinity;

    this.points.forEach((p, i) => {
      const dist = Math.abs(p.x - clientX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    });

    this.hoverIndex = closestIdx;
    this.draw();
    this.updateTooltip(this.points[closestIdx]);
  }

  handlePointerLeave() {
    this.hoverIndex = -1;
    this.draw();
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  updateTooltip(point) {
    if (!this.tooltip) return;

    const meta = getWeatherMeta(point.code, point.isDay);
    const hour = formatHour(point.time, this.store.timeFormat);
    const tempStr = formatTemp(point.val, this.store.units);
    const rainStr = `${point.rain || 0}% rain`;

    let metricText = '';
    if (this.activeTab === 'temp') {
      metricText = `<span style="color:#fbbf24; font-weight:700;">${Math.round(point.val)}°</span>`;
    } else if (this.activeTab === 'rain') {
      metricText = `<span style="color:#38bdf8; font-weight:700;">${Math.round(point.val)}%</span>`;
    } else {
      metricText = `<span style="color:#c084fc; font-weight:700;">${Math.round(point.val)} ${this.store.units === 'imperial' ? 'mph' : 'km/h'}</span>`;
    }

    this.tooltip.innerHTML = `
      <div style="font-weight:700; margin-bottom:2px;">${hour} · ${meta.label}</div>
      <div>${metricText} · ${rainStr}</div>
    `;

    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${point.x}px`;
    this.tooltip.style.top = `${Math.max(10, point.y - 12)}px`;
  }
}
