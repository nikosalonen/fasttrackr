// Service Worker Update Manager

interface ServiceWorkerCallbacks {
	onUpdateAvailable: Array<() => void>;
	onUpdateInstalled: Array<() => void>;
}

interface ServiceWorkerMessage {
	type: string;
	message?: string;
	version?: string;
}

interface ServiceWorkerManagerOptions {
	scope?: string;
	scriptURL?: string;
}

type UpdateCallback = () => void;

export class ServiceWorkerManager {
	private registration: ServiceWorkerRegistration | null;
	private updateAvailable: boolean;
	private callbacks: ServiceWorkerCallbacks;

	constructor() {
		this.registration = null;
		this.updateAvailable = false;
		this.callbacks = {
			onUpdateAvailable: [],
			onUpdateInstalled: [],
		};
	}

	// Initialize service worker with update handling
	async init(options: ServiceWorkerManagerOptions = {}): Promise<ServiceWorkerRegistration> {
		if (!("serviceWorker" in navigator)) {
			throw new Error("Service Worker not supported");
		}

		const { scope = "/", scriptURL = "/sw.js" } = options;

		try {
			this.registration = await navigator.serviceWorker.register(scriptURL, {
				scope,
			});

			console.log("Service Worker registered successfully");

			// Check for updates immediately
			await this.checkForUpdates();

			// Set up update listeners
			this.setupUpdateListeners();

			// Listen for messages from service worker
			navigator.serviceWorker.addEventListener(
				"message",
				this.handleSWMessage.bind(this),
			);

			return this.registration;
		} catch (error) {
			console.error("Service Worker registration failed:", error);
			throw error;
		}
	}

	// Set up listeners for service worker updates
	private setupUpdateListeners(): void {
		if (!this.registration) return;

		// Listen for new service worker installing
		this.registration.addEventListener("updatefound", () => {
			const newWorker = this.registration?.installing;
			if (!newWorker) return;

			console.log("New service worker found, installing...");

			newWorker.addEventListener("statechange", () => {
				if (newWorker.state === "installed") {
					if (navigator.serviceWorker.controller) {
						// New update available
						console.log("New service worker installed, update available");
						this.updateAvailable = true;
						this.notifyUpdateAvailable();
					} else {
						// First time install
						console.log("Service worker installed for first time");
						this.notifyUpdateInstalled();
					}
				}
			});
		});

		// Listen for controlling service worker change
		navigator.serviceWorker.addEventListener("controllerchange", () => {
			console.log("Service worker controller changed, reloading...");
			window.location.reload();
		});
	}

	// Handle messages from service worker
	private handleSWMessage(event: MessageEvent<ServiceWorkerMessage>): void {
		const { data } = event;

		if (data.type === "SW_UPDATED") {
			console.log("Service worker updated:", data.message);
			this.notifyUpdateInstalled();
		}
	}

	// Check for service worker updates
	async checkForUpdates(): Promise<void> {
		if (this.registration) {
			try {
				await this.registration.update();
				console.log("Service worker update check completed");
			} catch (error) {
				console.error("Service worker update check failed:", error);
			}
		}
	}

	// Force apply pending updates
	async applyUpdate(): Promise<boolean> {
		if (this.registration?.waiting) {
			// Tell the waiting service worker to skip waiting
			this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
			return true;
		}
		return false;
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

	// Notify callbacks
	private notifyUpdateAvailable(): void {
		this.callbacks.onUpdateAvailable.forEach((callback) => callback());
	}

	private notifyUpdateInstalled(): void {
		this.callbacks.onUpdateInstalled.forEach((callback) => callback());
	}

	// Get current cache version
	async getCacheVersion(): Promise<string | null> {
		if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
			return new Promise<string | null>((resolve) => {
				const messageChannel = new MessageChannel();
				messageChannel.port1.onmessage = (event: MessageEvent<{ version?: string }>) => {
					resolve(event.data.version || null);
				};
				navigator.serviceWorker.controller?.postMessage(
					{ type: "GET_VERSION" },
					[messageChannel.port2],
				);
			});
		}
		return null;
	}

	// Getters for read-only access to internal state
	get isUpdateAvailable(): boolean {
		return this.updateAvailable;
	}

	get serviceWorkerRegistration(): ServiceWorkerRegistration | null {
		return this.registration;
	}
}

// Create singleton instance
const swManager = new ServiceWorkerManager();

export default swManager;
