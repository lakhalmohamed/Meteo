/**
 * AETHER Progressive Web Application (PWA) Manager
 * Manages service worker lifecycle, offline banner states, and install prompts.
 */

export class PwaManager {
  constructor(store, installBtnElement, offlineBannerElement) {
    this.store = store;
    this.installBtn = installBtnElement;
    this.offlineBanner = offlineBannerElement;
    this.deferredPrompt = null;

    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkMonitoring();

    this.store.subscribe('weather:updated', ({ isFromCache }) => {
      if (isFromCache || !navigator.onLine) {
        this.showOfflineBanner(true);
      } else {
        this.showOfflineBanner(false);
      }
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        console.log('[PWA] Service Worker registered with scope:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available! Activating...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      } catch (err) {
        console.warn('[PWA] Service Worker registration failed:', err);
      }
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent automatic mini-infobar
      e.preventDefault();
      this.deferredPrompt = e;

      if (this.installBtn) {
        this.installBtn.classList.add('visible');
        this.installBtn.addEventListener('click', async () => {
          if (!this.deferredPrompt) return;
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          console.log(`[PWA] Install prompt outcome: ${outcome}`);
          this.deferredPrompt = null;
          this.installBtn.classList.remove('visible');
        }, { once: true });
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] AETHER successfully installed on host system.');
      if (this.installBtn) {
        this.installBtn.classList.remove('visible');
      }
    });
  }

  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      console.log('[PWA] Network connection restored.');
      this.store.setOfflineStatus(false);
      this.showOfflineBanner(false);
      // Trigger fresh fetch
      this.store.setCity(this.store.currentCity);
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Network disconnected. Running offline.');
      this.store.setOfflineStatus(true);
      this.showOfflineBanner(true);
    });

    // Retry button on offline banner
    const retryBtn = document.getElementById('offline-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.store.setCity(this.store.currentCity);
      });
    }
  }

  showOfflineBanner(show) {
    if (!this.offlineBanner) return;

    if (show) {
      this.offlineBanner.classList.add('active');
      const timeNote = this.store.offlineCachedTime
        ? `Viewing cached satellite data from ${this.store.offlineCachedTime}.`
        : 'Network unavailable. Operating in offline mode.';
      const descElem = document.getElementById('offline-banner-desc');
      if (descElem) {
        descElem.textContent = timeNote;
      }
    } else {
      this.offlineBanner.classList.remove('active');
    }
  }
}
