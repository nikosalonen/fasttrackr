// Utility type definitions and type guards

export type TimeFormat = "12h" | "24h";

export type FastingDuration = 12 | 16 | 18 | 20 | 24;

export type NotificationPermission = "default" | "granted" | "denied";

// Service Worker types
export interface ServiceWorkerUpdateEvent {
	type: 'updateAvailable' | 'updateInstalled';
	registration: ServiceWorkerRegistration;
}

export interface ServiceWorkerCacheInfo {
	name: string;
	version: string;
	size?: number;
}

export type ServiceWorkerState = 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';

// Type guards
export const isValidFastingDuration = (duration: number): duration is FastingDuration => {
	return [12, 16, 18, 20, 24].includes(duration);
};

export const isValidTimeFormat = (format: string): format is TimeFormat => {
	return format === "12h" || format === "24h";
};

export const isServiceWorkerSupported = (): boolean => {
	return 'serviceWorker' in navigator;
};

export const isNotificationSupported = (): boolean => {
	return 'Notification' in window;
};

// Utility types for localStorage
export interface StoredFastRecord {
	id: string;
	startTime: string; // ISO string
	endTime: string | null; // ISO string or null
	targetHours: number;
	completed: boolean;
	notes?: string;
}
