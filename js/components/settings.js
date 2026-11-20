/**
 * AETHER Settings Modal Component
 * Personalization interface containing ONLY two categories:
 * A. Appearance (Dark, Light, System themes with visual previews)
 * B. Language (English 🇬🇧, Français 🇫🇷, العربية ��)
 */

import { t, SUPPORTED_LANGUAGES } from '../utils/i18n.js';

export class SettingsComponent {
  constructor(modalBackdropElement, triggerBtnElement, store) {
    this.modal = modalBackdropElement;
    this.triggerBtn = triggerBtnElement;
    this.store = store;

    this.init();
  }

  init() {
    this.renderStructure();
    this.attachEvents();

    this.store.subscribe('themePreference:changed', () => {
      this.updateActiveThemeSelection();
    });

    this.store.subscribe('language:changed', () => {
      this.renderStructure();
      this.attachEvents();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  renderStructure() {
    const curTheme = this.store.themePreference || 'system';
    const curLang = this.store.language || 'en';

    this.modal.innerHTML = `
      <div class="settings-dialog" role="dialog" aria-modal="true" aria-label="${t('settings.title')}">
        
        <!-- Header -->
        <div class="settings-header">
          <div class="settings-title-wrap">
            <div class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              ${t('settings.title')}
            </div>
            <span class="settings-subtitle">${t('settings.subtitle')}</span>
          </div>

          <button class="modal-close-btn" id="settings-modal-close" title="Close (Esc)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Body with Exactly 2 Categories: Appearance & Language -->
        <div class="settings-content-body">
          
          <!-- ==========================================
               CATEGORY A: APPEARANCE — THEME SELECTION
               ========================================== -->
          <div class="settings-section">
            <div class="settings-category-header">
              <div class="category-icon-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <div class="category-title-group">
                <h3 class="category-title">${t('settings.categoryAppearance')}</h3>
                <span class="category-desc">${t('settings.categoryAppearanceDesc')}</span>
              </div>
            </div>

            <!-- 3 Theme Options with Visual Previews -->
            <div class="theme-options-grid">
              
              <!-- 1. Dark Theme Card -->
              <div class="theme-choice-card ${curTheme === 'dark' ? 'active' : ''}" data-theme-val="dark">
                <div class="theme-preview-box preview-dark">
                  <div class="preview-mini-header"></div>
                  <div class="preview-mini-sun"></div>
                  <div class="preview-mini-chart"></div>
                  <div class="preview-mini-card"></div>
                </div>
                <div class="theme-choice-info">
                  <div class="theme-name-row">
                    <span class="theme-choice-name">${t('settings.themeDark')}</span>
                    <span class="theme-check-dot"></span>
                  </div>
                  <p class="theme-choice-desc">${t('settings.themeDarkDesc')}</p>
                </div>
              </div>

              <!-- 2. Light Theme Card -->
              <div class="theme-choice-card ${curTheme === 'light' ? 'active' : ''}" data-theme-val="light">
                <div class="theme-preview-box preview-light">
                  <div class="preview-mini-header light"></div>
                  <div class="preview-mini-sun light"></div>
                  <div class="preview-mini-chart light"></div>
                  <div class="preview-mini-card light"></div>
                </div>
                <div class="theme-choice-info">
                  <div class="theme-name-row">
                    <span class="theme-choice-name">${t('settings.themeLight')}</span>
                    <span class="theme-check-dot"></span>
                  </div>
                  <p class="theme-choice-desc">${t('settings.themeLightDesc')}</p>
                </div>
              </div>

              <!-- 3. System Theme Card -->
              <div class="theme-choice-card ${curTheme === 'system' ? 'active' : ''}" data-theme-val="system">
                <div class="theme-preview-box preview-system">
                  <div class="preview-split-half dark">
                    <div class="preview-mini-sun"></div>
                  </div>
                  <div class="preview-split-half light">
                    <div class="preview-mini-sun light"></div>
                  </div>
                  <div class="preview-system-badge">AUTO</div>
                </div>
                <div class="theme-choice-info">
                  <div class="theme-name-row">
                    <span class="theme-choice-name">${t('settings.themeSystem')}</span>
                    <span class="theme-check-dot"></span>
                  </div>
                  <p class="theme-choice-desc">${t('settings.themeSystemDesc')}</p>
                </div>
              </div>

            </div>
          </div>

          <!-- ==========================================
               CATEGORY B: LANGUAGE — MULTILINGUAL SUPPORT
               ========================================== -->
          <div class="settings-section">
            <div class="settings-category-header">
              <div class="category-icon-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="category-title-group">
                <h3 class="category-title">${t('settings.categoryLanguage')}</h3>
                <span class="category-desc">${t('settings.categoryLanguageDesc')}</span>
              </div>
            </div>

            <!-- Exactly 3 Languages: English, Français, Español -->
            <div class="language-options-grid">
              ${SUPPORTED_LANGUAGES.map(lang => `
                <div class="language-choice-card ${curLang === lang.code ? 'active' : ''}" data-lang-val="${lang.code}">
                  <span class="language-flag-badge">${lang.flag}</span>
                  <div class="language-choice-names">
                    <span class="language-native-name">${lang.nativeName}</span>
                    <span class="language-intl-name">${lang.name}</span>
                  </div>
                  <div class="language-check-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <div class="settings-footer">
          <span class="settings-save-note">${t('settings.saveNote')}</span>
        </div>

      </div>
    `;
  }

  attachEvents() {
    // Trigger button
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.open());
    }

    // Modal Close
    const closeBtn = document.getElementById('settings-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Theme Choice Clicks
    this.modal.querySelectorAll('.theme-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        const selected = card.getAttribute('data-theme-val');
        this.store.setThemePreference(selected);
      });
    });

    // Language Choice Clicks
    this.modal.querySelectorAll('.language-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        const selected = card.getAttribute('data-lang-val');
        this.store.setLanguage(selected);
      });
    });
  }

  updateActiveThemeSelection() {
    const cur = this.store.themePreference || 'system';
    this.modal.querySelectorAll('.theme-choice-card').forEach(card => {
      const val = card.getAttribute('data-theme-val');
      card.classList.toggle('active', val === cur);
    });
  }

  open() {
    this.renderStructure();
    this.attachEvents();
    this.modal.classList.add('is-open');
  }

  close() {
    this.modal.classList.remove('is-open');
  }

  isOpen() {
    return this.modal.classList.contains('is-open');
  }
}
