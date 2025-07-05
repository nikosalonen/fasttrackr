import { Workbox } from "workbox-window";

let wb = null;
let swRegistration = null;

export const registerServiceWorker = async () => {
	if ("serviceWorker" in navigator) {
		try {
			// Check if we're in development mode and service worker exists
			const isDev = import.meta.env.DEV;
			const swPath = isDev ? "/dev-sw.js?dev-sw" : "/sw.js";

			// Test if service worker file exists before registering
			try {
				const response = await fetch(swPath, { method: "HEAD" });
				if (!response.ok) {
					console.log(
						"Service Worker file not found, skipping registration in development",
					);
					return null;
				}
			} catch (fetchError) {
				console.log(
					"Service Worker file not accessible, skipping registration",
				);
				return null;
			}

			wb = new Workbox(swPath);

			wb.addEventListener("waiting", (_event) => {
				console.log("Service Worker: New version waiting");
				window.dispatchEvent(
					new CustomEvent("sw-update-available", {
						detail: { registration: swRegistration },
					}),
				);
			});

			wb.addEventListener("externalwaiting", (_event) => {
				console.log("Service Worker: External waiting");
				window.dispatchEvent(
					new CustomEvent("sw-update-available", {
						detail: { registration: swRegistration },
					}),
				);
			});

			wb.addEventListener("activated", (event) => {
				if (!event.isUpdate) {
					console.log("Service Worker: Ready for offline use");
					window.dispatchEvent(
						new CustomEvent("sw-offline-ready", {
							detail: { registration: swRegistration },
						}),
					);
				}
			});

			wb.addEventListener("controlling", () => {
				window.location.reload();
			});

			await wb.register();
			swRegistration = await navigator.serviceWorker.ready;
			console.log("Service Worker registered successfully");
			return swRegistration;
		} catch (error) {
			console.error("Service Worker registration failed:", error);
			// In development, this is not critical, so we don't throw
			if (import.meta.env.DEV) {
				console.log(
					"Service Worker registration failed in development mode - this is normal",
				);
				return null;
			}
			return null;
		}
	} else {
		console.log("Service Worker not supported");
		return null;
	}
};

export const updateServiceWorker = async () => {
	if (wb) {
		wb.messageSkipWaiting();
	}
};

export const checkForUpdates = async () => {
	if (wb) {
		try {
			await wb.update();
		} catch (error) {
			console.error("Failed to check for updates:", error);
		}
	}
};

export const unregisterServiceWorker = async () => {
	if ("serviceWorker" in navigator) {
		try {
			const registrations = await navigator.serviceWorker.getRegistrations();
			for (const registration of registrations) {
				await registration.unregister();
			}
			console.log("Service Worker unregistered");
		} catch (error) {
			console.error("Failed to unregister Service Worker:", error);
		}
	}
};

// Background sync registration
export const registerBackgroundSync = async (tag, _data) => {
	if (
		"serviceWorker" in navigator &&
		"sync" in window.ServiceWorkerRegistration.prototype
	) {
		try {
			const registration = await navigator.serviceWorker.ready;
			await registration.sync.register(tag);
			console.log("Background sync registered:", tag);
		} catch (error) {
			console.error("Background sync registration failed:", error);
		}
	}
};

// Push notification registration
export const registerPushNotifications = async () => {
	if ("serviceWorker" in navigator && "PushManager" in window) {
		try {
			const registration = await navigator.serviceWorker.ready;
			const permission = await Notification.requestPermission();

			if (permission === "granted") {
				const subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(
						"YOUR_VAPID_PUBLIC_KEY", // Replace with your VAPID public key
					),
				});
				console.log("Push notification subscription:", subscription);
				return subscription;
			}
		} catch (error) {
			console.error("Push notification registration failed:", error);
		}
	}
	return null;
};

// Utility function to convert VAPID key
const urlBase64ToUint8Array = (base64String) => {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

// Check if app is running in standalone mode (installed PWA)
export const isStandalone = () => {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		window.navigator.standalone === true
	);
};

// Check if app is online
export const isOnline = () => {
	return navigator.onLine;
};

// Listen for online/offline events
export const setupOnlineOfflineListeners = () => {
	window.addEventListener("online", () => {
		console.log("App is online");
		window.dispatchEvent(new CustomEvent("app-online"));
	});

	window.addEventListener("offline", () => {
		console.log("App is offline");
		window.dispatchEvent(new CustomEvent("app-offline"));
	});
};

// Get service worker registration
export const getServiceWorkerRegistration = () => {
	return swRegistration;
};
