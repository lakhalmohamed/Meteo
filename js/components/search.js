/**
 * AETHER Worldwide Search & Command Palette Component
 * Debounced search, keyboard navigation, popular suggestions, and search history.
 */

import { searchLocations } from '../api.js';

const POPULAR_CITIES = [
  { name: 'Tokyo', country: 'Japan', country_code: 'JP', admin1: 'Tokyo Prefecture', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Paris', country: 'France', country_code: 'FR', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'New York', country: 'United States', country_code: 'US', admin1: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', country_code: 'GB', admin1: 'Greater London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Reykjavik', country: 'Iceland', country_code: 'IS', admin1: 'Capital Region', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
  { name: 'Sydney', country: 'Australia', country_code: 'AU', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Dubai', country: 'United Arab Emirates', country_code: 'AE', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Cairo', country: 'Egypt', country_code: 'EG', admin1: 'Cairo Governorate', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' }
];

export class SearchComponent {
  constructor(modalBackdropElement, triggerBtnElement, store) {
    this.modal = modalBackdropElement;
    this.triggerBtn = triggerBtnElement;
    this.store = store;

    this.input = null;
    this.resultsContainer = null;
    this.historyContainer = null;
    this.clearBtn = null;
    this.abortController = null;
    this.debounceTimer = null;
    this.selectedIndex = -1;
    this.currentResults = [];

    this.init();
  }

  init() {
    this.renderModalStructure();
    this.attachEvents();

    this.store.subscribe('recentSearches:updated', () => {
      this.renderHistory();
    });
  }

  renderModalStructure() {
    this.modal.innerHTML = `
      <div class="search-dialog-box" role="dialog" aria-modal="true" aria-label="City search">
        <div class="search-input-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" 
                 class="search-text-input" 
                 id="search-input-field" 
                 placeholder="Search city, region or country worldwide..." 
                 autocomplete="off" 
                 spellcheck="false" />
          <button class="search-clear-btn" id="search-clear-input" style="display:none;" title="Clear search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button class="modal-close-btn" id="search-modal-close" title="Close (Esc)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="search-dialog-content">
          <!-- Live Results Area -->
          <div id="search-live-results" style="display:none;"></div>

          <!-- Quick Popular Cities -->
          <div id="search-popular-section">
            <div class="search-section-label">Popular Destinations</div>
            <div class="quick-cities-grid">
              ${POPULAR_CITIES.map(c => `
                <button class="quick-city-chip" data-city='${JSON.stringify(c)}'>
                  ${c.name}, ${c.country}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Recent Searches -->
          <div id="search-history-section">
            <div class="search-section-label">
              <span>Recent Searches</span>
              <button class="clear-history-link" id="clear-search-history-btn">Clear all</button>
            </div>
            <div id="search-history-list" class="search-results-list"></div>
          </div>
        </div>
      </div>
    `;

    this.input = document.getElementById('search-input-field');
    this.resultsContainer = document.getElementById('search-live-results');
    this.historyContainer = document.getElementById('search-history-list');
    this.clearBtn = document.getElementById('search-clear-input');

    this.renderHistory();
  }

  attachEvents() {
    // Open trigger button
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.open());
    }

    // Keyboard Shortcuts: Ctrl+K, Cmd+K, or Slash "/"
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.open();
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Close button & backdrop click
    document.getElementById('search-modal-close').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Input events with debouncing
    this.input.addEventListener('input', () => {
      const val = this.input.value.trim();
      this.clearBtn.style.display = val.length > 0 ? 'flex' : 'none';

      clearTimeout(this.debounceTimer);
      if (val.length < 2) {
        this.resultsContainer.style.display = 'none';
        document.getElementById('search-popular-section').style.display = 'block';
        document.getElementById('search-history-section').style.display = 'block';
        return;
      }

      this.debounceTimer = setTimeout(() => {
        this.performSearch(val);
      }, 300);
    });

    // Clear input button
    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.clearBtn.style.display = 'none';
      this.resultsContainer.style.display = 'none';
      document.getElementById('search-popular-section').style.display = 'block';
      document.getElementById('search-history-section').style.display = 'block';
      this.input.focus();
    });

    // Keyboard navigation in search results
    this.input.addEventListener('keydown', (e) => {
      if (!this.currentResults || this.currentResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
        this.highlightSelectedItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.currentResults.length) % this.currentResults.length;
        this.highlightSelectedItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.currentResults.length) {
          this.selectCity(this.currentResults[this.selectedIndex]);
        }
      }
    });

    // Quick chips clicks
    this.modal.querySelectorAll('.quick-city-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const cityData = JSON.parse(btn.getAttribute('data-city'));
        this.selectCity(cityData);
      });
    });

    // Clear history button
    document.getElementById('clear-search-history-btn').addEventListener('click', () => {
      this.store.clearRecentSearches();
    });
  }

  async performSearch(query) {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.resultsContainer.style.display = 'block';
    this.resultsContainer.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:2rem; color:var(--text-muted);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="locating-pulse" style="width:20px;height:20px;">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span>Searching satellite database...</span>
      </div>
    `;

    document.getElementById('search-popular-section').style.display = 'none';
    document.getElementById('search-history-section').style.display = 'none';

    try {
      const results = await searchLocations(query, this.abortController.signal);
      this.currentResults = results;
      this.selectedIndex = -1;

      if (results.length === 0) {
        this.resultsContainer.innerHTML = `
          <div class="search-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <div style="font-weight:700; color:#fff;">No matching locations found</div>
            <div style="font-size:0.85rem;">Check your spelling or try searching for a nearby major city.</div>
          </div>
        `;
        return;
      }

      this.resultsContainer.innerHTML = `
        <div class="search-section-label">Search Results (${results.length})</div>
        <div class="search-results-list" id="search-items-list">
          ${results.map((loc, idx) => `
            <div class="search-result-item" data-index="${idx}">
              <div class="result-location-info">
                <span class="result-city-name">${loc.name}</span>
                <span class="result-admin-name">
                  ${[loc.admin1, loc.country].filter(Boolean).join(', ')}
                </span>
              </div>
              <div class="result-coords">
                ${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Wire result click handlers
      const items = this.resultsContainer.querySelectorAll('.search-result-item');
      items.forEach((item) => {
        item.addEventListener('click', () => {
          const idx = Number(item.getAttribute('data-index'));
          this.selectCity(this.currentResults[idx]);
        });
      });

    } catch (err) {
      if (err.name === 'AbortError') return;
      this.resultsContainer.innerHTML = `
        <div class="search-empty-state" style="color:#ef4444;">
          <div style="font-weight:700;">Search Connection Error</div>
          <div style="font-size:0.85rem;">${err.message || 'Unable to retrieve locations.'}</div>
        </div>
      `;
    }
  }

  highlightSelectedItem() {
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === this.selectedIndex);
      if (idx === this.selectedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  selectCity(city) {
    this.store.setCity(city);
    this.close();
  }

  renderHistory() {
    const recents = this.store.recentSearches;
    const historySection = document.getElementById('search-history-section');

    if (!recents || recents.length === 0) {
      if (historySection) historySection.style.display = 'none';
      return;
    }

    if (historySection) historySection.style.display = 'block';
    this.historyContainer.innerHTML = recents.map((item, idx) => `
      <div class="search-result-item" data-history-idx="${idx}">
        <div class="result-location-info">
          <span class="result-city-name">${item.name}</span>
          <span class="result-admin-name">${[item.admin1, item.country].filter(Boolean).join(', ')}</span>
        </div>
        <div class="result-coords">Recent</div>
      </div>
    `).join('');

    this.historyContainer.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-history-idx'));
        this.selectCity(recents[idx]);
      });
    });
  }

  open() {
    this.modal.classList.add('is-open');
    this.input.value = '';
    this.clearBtn.style.display = 'none';
    this.resultsContainer.style.display = 'none';
    document.getElementById('search-popular-section').style.display = 'block';
    document.getElementById('search-history-section').style.display = 'block';
    this.renderHistory();
    setTimeout(() => this.input.focus(), 80);
  }

  close() {
    this.modal.classList.remove('is-open');
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  isOpen() {
    return this.modal.classList.contains('is-open');
  }
}
