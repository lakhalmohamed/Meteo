/**
 * AETHER Living Atmospheric Canvas Visual Engine
 * Renders cinematic particle simulations, raindrops on glass, volumetric sun rays,
 * 3D multi-layered snow, starfields, procedural lightning, and procedural clouds.
 */

export class WeatherEngine {
  constructor(canvasElement, flashOverlayElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.flashOverlay = flashOverlayElement;

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.mode = 'clear-night';
    this.targetMode = 'clear-night';
    this.intensity = 1.0; // Dynamic intensity factor from API (precipitation rate, wind, etc.)

    // Particle Collections
    this.rainDrops = [];
    this.splashes = [];
    this.glassDroplets = []; // Realistic raindrops-on-glass condensation & streak layer!
    this.snowFlakes = [];    // 3D multi-layered snow
    this.stars = [];
    this.shootingStars = [];
    this.sunMotes = [];
    this.clouds = [];
    this.lightningBolts = [];
    this.lightningTimer = 0;

    this.sunAngle = 0;
    this.animId = null;
    this.lastTime = 0;
    this.isRunning = false;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      this.initParticles();
    });

    this.initParticles();
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    this.initParticles();
  }

  setWeather(themeName, intensity = 1.0) {
    this.intensity = Math.max(0.5, Math.min(2.5, intensity));
    if (this.targetMode === themeName && Math.abs(this.intensity - intensity) < 0.2) return;
    this.targetMode = themeName;
    this.mode = themeName;
    this.initParticles();
  }

  initParticles() {
    const w = this.width || 1200;
    const h = this.height || 800;

    // 1. Rain Drops (scaled by intensity)
    this.rainDrops = [];
    const isRain = this.mode === 'rain' || this.mode === 'thunderstorm';
    const baseRain = isRain ? (this.reducedMotion ? 50 : Math.round(160 * this.intensity)) : 0;
    for (let i = 0; i < baseRain; i++) {
      this.rainDrops.push({
        x: Math.random() * (w + 300) - 150,
        y: Math.random() * h,
        speed: (14 + Math.random() * 14) * Math.min(1.4, this.intensity),
        length: (18 + Math.random() * 26) * Math.min(1.3, this.intensity),
        angle: 0.18 + Math.random() * 0.08,
        opacity: 0.25 + Math.random() * 0.45,
        width: 1 + Math.random() * 1.5
      });
    }

    // 2. Raindrops on Glass (Realistic window bead condensation with surface gravity)
    this.glassDroplets = [];
    if (isRain && !this.reducedMotion) {
      const beadCount = Math.round(35 * this.intensity);
      for (let i = 0; i < beadCount; i++) {
        this.glassDroplets.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 1.5 + Math.random() * 3.5,
          vy: 0.15 + Math.random() * 0.6,
          trailTimer: 0,
          trail: [],
          alpha: 0.35 + Math.random() * 0.45,
          nextDrip: 1 + Math.random() * 5
        });
      }
    }

    // 3. Multi-layer 3D Snow Flakes
    this.snowFlakes = [];
    if (this.mode === 'snow') {
      const snowCount = this.reducedMotion ? 40 : 130;
      for (let i = 0; i < snowCount; i++) {
        // Depth layer: 0 = background, 1 = midground, 2 = foreground
        const layer = Math.random() < 0.2 ? 2 : (Math.random() < 0.5 ? 0 : 1);
        let radius, speed, opacity;

        if (layer === 2) {
          // Foreground: large, fast, slightly blurred
          radius = 4.5 + Math.random() * 3.5;
          speed = 2.2 + Math.random() * 2.0;
          opacity = 0.55 + Math.random() * 0.35;
        } else if (layer === 1) {
          // Midground: crisp, medium
          radius = 2.0 + Math.random() * 2.0;
          speed = 1.2 + Math.random() * 1.2;
          opacity = 0.45 + Math.random() * 0.4;
        } else {
          // Background: tiny, gentle
          radius = 0.8 + Math.random() * 1.2;
          speed = 0.6 + Math.random() * 0.8;
          opacity = 0.25 + Math.random() * 0.3;
        }

        this.snowFlakes.push({
          layer,
          x: Math.random() * w,
          y: Math.random() * h,
          radius,
          speed,
          swaySpeed: 0.015 + Math.random() * 0.03,
          swayAmp: (1.5 + Math.random() * 3.5) * (layer + 1) * 0.6,
          angle: Math.random() * Math.PI * 2,
          opacity
        });
      }
    }

    // 4. Stars (Night & Twilight) with spectral color diversity
    this.stars = [];
    if (this.mode.includes('night') || this.mode === 'sunset') {
      const starCount = this.reducedMotion ? 50 : 150;
      const colors = ['#ffffff', '#e0e7ff', '#fef3c7', '#c7d2fe', '#f3e8ff'];
      for (let i = 0; i < starCount; i++) {
        this.stars.push({
          x: Math.random() * w,
          y: Math.random() * (h * 0.8),
          radius: 0.6 + Math.random() * 1.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          baseAlpha: 0.25 + Math.random() * 0.7,
          alpha: 0.5,
          twinkleSpeed: 0.012 + Math.random() * 0.045,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    // 5. Sun Motes (Golden atmospheric particles)
    this.sunMotes = [];
    if (this.mode === 'clear-day' || this.mode === 'partly-cloudy-day') {
      const moteCount = this.reducedMotion ? 20 : 70;
      for (let i = 0; i < moteCount; i++) {
        this.sunMotes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 1 + Math.random() * 2.8,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -0.25 - Math.random() * 0.65,
          alpha: 0.2 + Math.random() * 0.6,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }

    // 6. Procedural Soft Volumetric Clouds
    this.clouds = [];
    if (this.mode.includes('cloud') || this.mode === 'fog' || this.mode === 'thunderstorm') {
      const cloudCount = this.mode === 'thunderstorm' ? 8 : 6;
      for (let i = 0; i < cloudCount; i++) {
        this.clouds.push({
          x: (i * (w / (cloudCount / 2))) - 150,
          y: 30 + Math.random() * (h * 0.4),
          width: 360 + Math.random() * 320,
          height: 130 + Math.random() * 120,
          speed: 0.12 + Math.random() * 0.28,
          alpha: this.mode === 'thunderstorm' ? (0.16 + Math.random() * 0.15) : (0.1 + Math.random() * 0.14)
        });
      }
    }
  }

  triggerLightning() {
    if (this.mode !== 'thunderstorm') return;

    const startX = this.width * 0.15 + Math.random() * (this.width * 0.7);
    const startY = 0;
    const segments = [];
    let curX = startX;
    let curY = startY;

    const maxSteps = 16 + Math.floor(Math.random() * 8);
    const stepY = (this.height * 0.72) / maxSteps;

    for (let i = 0; i < maxSteps; i++) {
      const nextX = curX + (Math.random() - 0.5) * 65;
      const nextY = curY + stepY;
      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

      // Secondary branches
      if (Math.random() < 0.32) {
        const branchX = nextX + (Math.random() - 0.5) * 80;
        const branchY = nextY + stepY * 0.85;
        segments.push({ x1: nextX, y1: nextY, x2: branchX, y2: branchY });
      }

      curX = nextX;
      curY = nextY;
    }

    this.lightningBolts.push({
      segments,
      alpha: 1,
      fadeRate: 0.075 + Math.random() * 0.05
    });

    // Realistic Screen Illumination Flash
    if (this.flashOverlay && !this.reducedMotion) {
      this.flashOverlay.style.opacity = '0.38';
      setTimeout(() => {
        if (this.flashOverlay) this.flashOverlay.style.opacity = '0';
      }, 70);
      setTimeout(() => {
        if (this.flashOverlay && Math.random() < 0.6) {
          this.flashOverlay.style.opacity = '0.22';
          setTimeout(() => {
            if (this.flashOverlay) this.flashOverlay.style.opacity = '0';
          }, 50);
        }
      }, 140);
    }
  }

  render(timestamp) {
    if (!this.isRunning) return;

    const dt = Math.min((timestamp - (this.lastTime || timestamp)) / 1000, 0.1);
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sun / Sunlight Rays
    if (this.mode === 'clear-day' || this.mode === 'partly-cloudy-day') {
      this.drawSunRays(dt);
      this.drawSunMotes(dt);
    }

    // 2. Stars & Shooting Stars (Night & Twilight)
    if (this.mode.includes('night') || this.mode === 'sunset') {
      this.drawStars(dt);
      this.updateShootingStars(dt);
    }

    // 3. Clouds
    if (this.clouds.length > 0) {
      this.drawClouds(dt);
    }

    // 4. Rain & Splash Rings
    if (this.rainDrops.length > 0) {
      this.drawRain(dt);
    }

    // 5. Raindrops on Glass (Realistic Condensation & Gravity Trails)
    if (this.glassDroplets.length > 0) {
      this.drawGlassDroplets(dt);
    }

    // 6. Snow (3D Multi-Layered)
    if (this.snowFlakes.length > 0) {
      this.drawSnow(dt);
    }

    // 7. Thunderstorm Lightning
    if (this.mode === 'thunderstorm') {
      this.lightningTimer += dt;
      if (this.lightningTimer > 3.2 + Math.random() * 4.0) {
        this.triggerLightning();
        this.lightningTimer = 0;
      }
      this.drawLightning();
    }

    this.animId = requestAnimationFrame((t) => this.render(t));
  }

  // --- Particle Sub-Renderers ---

  drawSunRays(dt) {
    const sunX = this.width * 0.8;
    const sunY = 70;
    this.sunAngle += (this.reducedMotion ? 0.001 : 0.004);

    this.ctx.save();
    // Ambient Corona
    const grad = this.ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 360);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.32)');
    grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.12)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Radiant Light Spokes
    const rayCount = 10;
    this.ctx.strokeStyle = 'rgba(254, 240, 138, 0.045)';
    this.ctx.lineWidth = 48;
    for (let i = 0; i < rayCount; i++) {
      const angle = this.sunAngle + (i * Math.PI * 2) / rayCount;
      const endX = sunX + Math.cos(angle) * 750;
      const endY = sunY + Math.sin(angle) * 750;
      this.ctx.beginPath();
      this.ctx.moveTo(sunX, sunY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawSunMotes(dt) {
    this.ctx.save();
    this.ctx.fillStyle = '#fde047';
    for (const m of this.sunMotes) {
      m.x += m.vx;
      m.y += m.vy;
      m.pulse += 0.02;

      if (m.y < -10) m.y = this.height + 10;
      if (m.x < -10) m.x = this.width + 10;
      if (m.x > this.width + 10) m.x = -10;

      const currentAlpha = m.alpha * (0.6 + 0.4 * Math.sin(m.pulse));
      this.ctx.globalAlpha = currentAlpha;
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawStars(dt) {
    this.ctx.save();
    for (const s of this.stars) {
      s.phase += s.twinkleSpeed;
      const alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.phase));
      this.ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
      this.ctx.fillStyle = s.color || '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  updateShootingStars(dt) {
    if (this.reducedMotion) return;

    if (Math.random() < 0.006 && this.shootingStars.length < 2) {
      this.shootingStars.push({
        x: Math.random() * this.width * 0.85,
        y: Math.random() * (this.height * 0.35),
        length: 80 + Math.random() * 90,
        speed: 18 + Math.random() * 14,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.22,
        alpha: 1
      });
    }

    this.ctx.save();
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.024;

      if (ss.alpha <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      this.ctx.strokeStyle = `rgba(192, 132, 252, ${ss.alpha})`;
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.moveTo(ss.x, ss.y);
      this.ctx.lineTo(
        ss.x - Math.cos(ss.angle) * ss.length,
        ss.y - Math.sin(ss.angle) * ss.length
      );
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawClouds(dt) {
    this.ctx.save();
    for (const c of this.clouds) {
      c.x += c.speed;
      if (c.x - c.width > this.width) {
        c.x = -c.width - 60;
      }

      const grad = this.ctx.createRadialGradient(
        c.x + c.width / 2, c.y + c.height / 2, 20,
        c.x + c.width / 2, c.y + c.height / 2, c.width / 2
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
      grad.addColorStop(0.7, `rgba(180, 200, 220, ${c.alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.ellipse(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, c.height / 2, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawRain(dt) {
    this.ctx.save();
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineCap = 'round';

    for (const d of this.rainDrops) {
      d.x += Math.sin(d.angle) * d.speed;
      d.y += Math.cos(d.angle) * d.speed;

      if (d.y > this.height) {
        if (Math.random() < 0.28 && !this.reducedMotion) {
          this.splashes.push({
            x: d.x,
            y: this.height - 4,
            radius: 1,
            maxRadius: 6 + Math.random() * 8,
            alpha: 0.5
          });
        }
        d.y = -25;
        d.x = Math.random() * (this.width + 300) - 150;
      }

      this.ctx.lineWidth = d.width;
      this.ctx.globalAlpha = d.opacity;
      this.ctx.beginPath();
      this.ctx.moveTo(d.x, d.y);
      this.ctx.lineTo(
        d.x + Math.sin(d.angle) * d.length,
        d.y + Math.cos(d.angle) * d.length
      );
      this.ctx.stroke();
    }

    // Splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const sp = this.splashes[i];
      sp.radius += 0.42;
      sp.alpha -= 0.032;

      if (sp.alpha <= 0) {
        this.splashes.splice(i, 1);
        continue;
      }

      this.ctx.globalAlpha = sp.alpha;
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.ellipse(sp.x, sp.y, sp.radius * 2, sp.radius * 0.7, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // Realistic Raindrops on Glass Window (Water bead condensation with gravity streak physics)
  drawGlassDroplets(dt) {
    this.ctx.save();

    for (const drop of this.glassDroplets) {
      drop.nextDrip -= dt;
      if (drop.nextDrip <= 0) {
        // Accelerate bead downward like real water on glass
        drop.y += drop.vy * 4;
        drop.trail.push({ x: drop.x, y: drop.y, radius: drop.radius * 0.6, alpha: 0.25 });
        if (drop.trail.length > 8) drop.trail.shift();
      }

      // Draw faint streak trail
      for (let i = 0; i < drop.trail.length; i++) {
        const tr = drop.trail[i];
        this.ctx.fillStyle = `rgba(186, 230, 253, ${tr.alpha * 0.6})`;
        this.ctx.beginPath();
        this.ctx.arc(tr.x, tr.y, tr.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Main water bead with highlight refraction
      const grad = this.ctx.createRadialGradient(
        drop.x - drop.radius * 0.3, drop.y - drop.radius * 0.3, drop.radius * 0.2,
        drop.x, drop.y, drop.radius
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.15)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Lower crescent shadow
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, drop.radius, 0.2 * Math.PI, 0.8 * Math.PI);
      this.ctx.stroke();

      // Reset when droplet reaches bottom
      if (drop.y > this.height + 10) {
        drop.y = -10;
        drop.x = Math.random() * this.width;
        drop.trail = [];
        drop.nextDrip = 2 + Math.random() * 6;
      }
    }

    this.ctx.restore();
  }

  // 3D Multi-Layered Snow
  drawSnow(dt) {
    this.ctx.save();

    for (const f of this.snowFlakes) {
      f.angle += f.swaySpeed;
      f.y += f.speed;
      f.x += Math.sin(f.angle) * f.swayAmp;

      if (f.y > this.height + 10) {
        f.y = -10;
        f.x = Math.random() * this.width;
      }

      this.ctx.globalAlpha = f.opacity;

      if (f.layer === 2) {
        // Foreground flake: soft radial gradient for camera blur
        const grad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.5, 'rgba(224, 242, 254, 0.6)');
        grad.addColorStop(1, 'rgba(224, 242, 254, 0)');
        this.ctx.fillStyle = grad;
      } else {
        this.ctx.fillStyle = '#ffffff';
      }

      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawLightning() {
    this.ctx.save();
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const bolt = this.lightningBolts[i];
      bolt.alpha -= bolt.fadeRate;

      if (bolt.alpha <= 0) {
        this.lightningBolts.splice(i, 1);
        continue;
      }

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha})`;
      this.ctx.shadowColor = '#c084fc';
      this.ctx.shadowBlur = 22;
      this.ctx.lineWidth = 2.6;

      this.ctx.beginPath();
      for (const seg of bolt.segments) {
        this.ctx.moveTo(seg.x1, seg.y1);
        this.ctx.lineTo(seg.x2, seg.y2);
      }
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animId = requestAnimationFrame((t) => this.render(t));
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}
