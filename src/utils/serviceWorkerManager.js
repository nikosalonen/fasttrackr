// Service Worker Update Manager
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.callbacks = {
      onUpdateAvailable: [],
      onUpdateInstalled: [],
    };
  }

  // Initialize service worker with update handling
  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered successfully');

        // Check for updates immediately
        await this.checkForUpdates();

        // Set up update listeners
        this.setupUpdateListeners();

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));

        return this.registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service Worker not supported');
    }
  }

  // Set up listeners for service worker updates
  setupUpdateListeners() {
    if (!this.registration) return;

    // Listen for new service worker installing
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;
      console.log('New service worker found, installing...');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New update available
            console.log('New service worker installed, update available');
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          } else {
            // First time install
            console.log('Service worker installed for first time');
            this.notifyUpdateInstalled();
          }
        }
      });
    });

    // Listen for controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed, reloading...');
      window.location.reload();
    });
  }

  // Handle messages from service worker
  handleSWMessage(event) {
    const { data } = event;
    
    if (data.type === 'SW_UPDATED') {
      console.log('Service worker updated:', data.message);
      this.notifyUpdateInstalled();
    }
  }

  // Check for service worker updates
  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('Service worker update check completed');
      } catch (error) {
        console.error('Service worker update check failed:', error);
      }
    }
  }

  // Force apply pending updates
  async applyUpdate() {
    if (this.registration && this.registration.waiting) {
      // Tell the waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    return false;
  }

  // Force refresh - clear caches and reload
  async forceRefresh() {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      }

      // Unregister service worker
      if (this.registration) {
        await this.registration.unregister();
        console.log('Service worker unregistered');
      }

      // Force reload
      window.location.reload(true);
    } catch (error) {
      console.error('Force refresh failed:', error);
      // Fallback: just reload
      window.location.reload();
    }
  }

  // Add callback for update events
  onUpdateAvailable(callback) {
    this.callbacks.onUpdateAvailable.push(callback);
  }

  onUpdateInstalled(callback) {
    this.callbacks.onUpdateInstalled.push(callback);
  }

  // Notify callbacks
  notifyUpdateAvailable() {
    this.callbacks.onUpdateAvailable.forEach(callback => callback());
  }

  notifyUpdateInstalled() {
    this.callbacks.onUpdateInstalled.forEach(callback => callback());
  }

  // Get current cache version
  async getCacheVersion() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
      });
    }
    return null;
  }
}

// Create singleton instance
const swManager = new ServiceWorkerManager();

export default swManager; 