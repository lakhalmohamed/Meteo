/**
 * AETHER Favorites Drawer Component
 * Slide-over drawer with saved places, live mini weather cards, and quick switching.
 */

import { formatTemp, getLocalTime } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weather-codes.js';
import { getWeatherSvg } from '../utils/icons.js';
import { fetchForecast } from '../api.js';

export class FavoritesComponent {
  constructor(backdropElement, triggerBtnElement, store) {
    this.backdrop = backdropElement;
    this.triggerBtn = triggerBtnElement;
    this.store = store;
    this.cachedWeatherMap = {};

    this.init();
  }

  init() {
    this.renderStructure();
    this.attachEvents();

    this.store.subscribe('favorites:updated', (favs) => {
      this.updateBadge(favs.length);
      this.renderList();
    });

    this.store.subscribe('units:changed', () => {
      this.renderList();
    });

    this.updateBadge(this.store.favorites.length);
  }

  renderStructure() {
    this.backdrop.innerHTML = `
      <div class="favorites-drawer-panel" role="dialog" aria-modal="true" aria-label="Favorites drawer">
        <div class="favorites-drawer-header">
          <div class="favorites-title">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Saved Places
          </div>
          <button class="modal-close-btn" id="favorites-drawer-close" title="Close drawer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="favorites-list-container" id="favorites-cards-list"></div>

        <div style="padding: 1.25rem; border-top: 1px solid var(--glass-border);">
          <button class="search-trigger-btn" id="drawer-save-current-btn" style="width:100%; justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Save Current Location</span>
          </button>
        </div>
      </div>
    `;

    this.renderList();
  }

  attachEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.toggle());
    }

    document.getElementById('favorites-drawer-close').addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    document.getElementById('drawer-save-current-btn').addEventListener('click', () => {
      this.store.toggleCurrentCityFavorite();
    });
  }

  updateBadge(count) {
    let badge = this.triggerBtn.querySelector('.btn-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'btn-badge';
      this.triggerBtn.appendChild(badge);
    }
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  async fetchFavoriteWeather(fav) {
    const key = `${fav.latitude.toFixed(2)},${fav.longitude.toFixed(2)}`;
    if (this.cachedWeatherMap[key]) {
      return this.cachedWeatherMap[key];
    }

    try {
      const res = await fetchForecast(fav.latitude, fav.longitude, fav.timezone);
      if (res && res.data && res.data.current) {
        this.cachedWeatherMap[key] = res.data.current;
        return res.data.current;
      }
    } catch (e) {
      console.warn(`[Favorites] Mini weather load failed for ${fav.name}:`, e);
    }
    return null;
  }

  async renderList() {
    const listContainer = document.getElementById('favorites-cards-list');
    if (!listContainer) return;

    const favs = this.store.favorites;

    if (favs.length === 0) {
      listContainer.innerHTML = `
        <div class="search-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <div style="font-weight:700; color:#fff;">No Favorite Cities Saved</div>
          <div style="font-size:0.85rem;">Click the star icon on any city to bookmark it for fast access.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = favs.map((fav, idx) => {
      const { timeStr } = getLocalTime(fav.timezone, this.store.timeFormat);
      const cached = this.cachedWeatherMap[`${fav.latitude.toFixed(2)},${fav.longitude.toFixed(2)}`];
      const tempStr = cached ? formatTemp(cached.temperature_2m, this.store.units) : '--';
      const meta = cached ? getWeatherMeta(cached.weather_code, cached.is_day) : { icon: 'clear', isDay: true, label: 'Loading' };
      const iconSvg = getWeatherSvg(meta.icon, meta.isDay, 'fav-card-icon');

      return `
        <div class="favorite-city-card" data-fav-idx="${idx}">
          <div class="favorite-card-left">
            <span class="favorite-city-heading">${fav.name}</span>
            <span class="favorite-city-sub">${[fav.country, timeStr].filter(Boolean).join(' · ')}</span>
          </div>

          <div class="favorite-card-right">
            <div class="favorite-icon">${iconSvg}</div>
            <div class="favorite-temp-badge" id="fav-temp-${idx}">${tempStr}</div>
            <button class="favorite-delete-btn" data-delete-idx="${idx}" title="Remove favorite">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    listContainer.querySelectorAll('.favorite-city-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-delete-btn')) return;
        const idx = Number(card.getAttribute('data-fav-idx'));
        this.store.setCity(favs[idx]);
        this.close();
      });
    });

    listContainer.querySelectorAll('.favorite-delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute('data-delete-idx'));
        this.store.removeFavorite(idx);
      });
    });

    // Asynchronously fetch weather data for any uncached cards
    favs.forEach(async (fav, idx) => {
      const key = `${fav.latitude.toFixed(2)},${fav.longitude.toFixed(2)}`;
      if (!this.cachedWeatherMap[key]) {
        const current = await this.fetchFavoriteWeather(fav);
        if (current) {
          const tempElem = document.getElementById(`fav-temp-${idx}`);
          if (tempElem) {
            tempElem.textContent = formatTemp(current.temperature_2m, this.store.units);
          }
        }
      }
    });
  }

  open() {
    this.backdrop.classList.add('is-open');
    this.renderList();
  }

  close() {
    this.backdrop.classList.remove('is-open');
  }

  toggle() {
    if (this.backdrop.classList.contains('is-open')) {
      this.close();
    } else {
      this.open();
    }
  }
}
