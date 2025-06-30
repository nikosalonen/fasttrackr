// Workbox Service Worker Manager
import { Workbox } from "workbox-window";

interface WorkboxCallbacks {
	onUpdateAvailable: Array<() => void>;
	onUpdateInstalled: Array<() => void>;
	onOfflineReady: Array<() => void>;
}

type UpdateCallback = () => void;

export class WorkboxServiceWorkerManager {
	private workbox: Workbox | null;
	private registration: ServiceWorkerRegistration | undefined;
	private updateAvailable: boolean;
	private callbacks: WorkboxCallbacks;

	constructor() {
		this.workbox = null;
		this.registration = undefined;
		this.updateAvailable = false;
		this.callbacks = {
			onUpdateAvailable: [],
			onUpdateInstalled: [],
			onOfflineReady: [],
		};
	}

	// Initialize Workbox service worker
	async init(): Promise<ServiceWorkerRegistration | undefined> {
		if (!("serviceWorker" in navigator)) {
			console.warn("Service Worker not supported");
			return undefined;
		}

		try {
			// Create Workbox instance
			this.workbox = new Workbox("/sw.js", {
				scope: "/",
			});

			// Set up event listeners
			this.setupWorkboxListeners();

			// Register the service worker
			this.registration = await this.workbox.register();

			console.log("Workbox service worker registered successfully");
			return this.registration;
		} catch (error) {
			console.error("Workbox service worker registration failed:", error);
			throw error;
		}
	}

	// Set up Workbox event listeners
	private setupWorkboxListeners(): void {
		if (!this.workbox) return;

		// Service worker is installed and ready to control the page
		this.workbox.addEventListener("installed", (event) => {
			if (!event.isUpdate) {
				console.log("Service worker installed for the first time");
				this.notifyOfflineReady();
			}
		});

		// Service worker has been updated and is waiting to activate
		this.workbox.addEventListener("waiting", () => {
			console.log("New service worker installed, update available");
			this.updateAvailable = true;
			this.notifyUpdateAvailable();
		});

		// Service worker has been activated and is now controlling the page
		this.workbox.addEventListener("controlling", () => {
			console.log("Service worker is now controlling the page");
			this.notifyUpdateInstalled();
		});

		// Service worker activation was skipped
		this.workbox.addEventListener("activated", (event) => {
			if (!event.isUpdate) {
				console.log("Service worker activated for the first time");
			} else {
				console.log("Service worker updated and activated");
			}
		});

		// Handle service worker errors
		this.workbox.addEventListener("redundant", () => {
			console.warn("Service worker became redundant");
		});
	}

	// Force apply pending updates
	async applyUpdate(): Promise<boolean> {
		if (this.workbox && this.updateAvailable) {
			try {
				// Tell the waiting service worker to skip waiting and become active
				await this.workbox.messageSkipWaiting();

				// The controlling event will trigger page reload
				return true;
			} catch (error) {
				console.error("Failed to apply update:", error);
				return false;
			}
		}
		return false;
	}

	// Check for service worker updates manually
	async checkForUpdates(): Promise<void> {
		if (this.workbox) {
			try {
				await this.workbox.update();
				console.log("Workbox update check completed");
			} catch (error) {
				console.error("Workbox update check failed:", error);
			}
		}
	}

	// Force refresh - clear caches and reload
	async forceRefresh(): Promise<void> {
		try {
			// Clear all caches
			if ("caches" in window) {
				const cacheNames = await caches.keys();
				await Promise.all(
					cacheNames.map((cacheName) => caches.delete(cacheName)),
				);
				console.log("All caches cleared");
			}

			// Unregister service worker
			if (this.registration) {
				await this.registration.unregister();
				console.log("Service worker unregistered");
			}

			// Force reload
			window.location.reload();
		} catch (error) {
			console.error("Force refresh failed:", error);
			// Fallback: just reload
			window.location.reload();
		}
	}

	// Add callback for update events
	onUpdateAvailable(callback: UpdateCallback): void {
		this.callbacks.onUpdateAvailable.push(callback);
	}

	onUpdateInstalled(callback: UpdateCallback): void {
		this.callbacks.onUpdateInstalled.push(callback);
	}

	onOfflineReady(callback: UpdateCallback): void {
		this.callbacks.onOfflineReady.push(callback);
	}

	// Notify callbacks
	private notifyUpdateAvailable(): void {
		this.callbacks.onUpdateAvailable.forEach((callback) => callback());
	}

	private notifyUpdateInstalled(): void {
		this.callbacks.onUpdateInstalled.forEach((callback) => callback());
	}

	private notifyOfflineReady(): void {
		this.callbacks.onOfflineReady.forEach((callback) => callback());
	}

	// Send message to service worker
	async postMessage<T extends object = object, R = unknown>(
		message: T,
	): Promise<R | null> {
		if (this.workbox) {
			return await this.workbox.messageSW(message);
		}
		return null;
	}

	// Get current cache status
	async getCacheStatus(): Promise<{ size: number; cacheNames: string[] }> {
		if ("caches" in window) {
			try {
				const cacheNames = await caches.keys();
				let totalSize = 0;

				for (const cacheName of cacheNames) {
					const cache = await caches.open(cacheName);
					const requests = await cache.keys();
					for (const request of requests) {
						const response = await cache.match(request);
						if (response) {
							const blob = await response.blob();
							totalSize += blob.size;
						}
					}
				}

				return {
					size: totalSize,
					cacheNames,
				};
			} catch (error) {
				console.error("Failed to get cache status:", error);
			}
		}

		return {
			size: 0,
			cacheNames: [],
		};
	}

	// Get cache version information
	async getCacheVersion(): Promise<string> {
		try {
			const cacheStatus = await this.getCacheStatus();
			if (cacheStatus.cacheNames.length > 0) {
				// Return the first cache name as version identifier
				// This typically contains workbox version info
				return cacheStatus.cacheNames[0];
			}
			// Fallback to a timestamp-based version
			return `v${Date.now()}`;
		} catch (error) {
			console.error("Failed to get cache version:", error);
			return `v${Date.now()}`;
		}
	}

	// Getters for read-only access to internal state
	get isUpdateAvailable(): boolean {
		return this.updateAvailable;
	}

	get serviceWorkerRegistration(): ServiceWorkerRegistration | undefined {
		return this.registration;
	}

	get workboxInstance(): Workbox | null {
		return this.workbox;
	}
}

// Create singleton instance
const workboxManager = new WorkboxServiceWorkerManager();

export default workboxManager;
