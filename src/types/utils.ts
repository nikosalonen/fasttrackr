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

// localStorage data types
export interface CurrentFast {
	id: string;
	startTime: string; // ISO string
	targetHours: number;
	notes?: string;
}

export interface AppExportData {
	version: string;
	timestamp: string;
	data: {
		fastHistory: string; // JSON string
		settings: {
			notificationsEnabled: string | null;
			milestoneNotifications: string | null;
			darkMode: string | null;
		};
	};
}

// localStorage keys enum for type safety
export const LocalStorageKeys = {
	// Fast tracking
	CURRENT_FAST: 'currentFast',
	FAST_HISTORY: 'fastHistory',

	// Settings
	DARK_MODE: 'darkMode',
	NOTIFICATIONS_ENABLED: 'notificationsEnabled',
	MILESTONE_NOTIFICATIONS: 'milestoneNotifications',

	// Timer preferences
	SELECTED_DURATION: 'selectedDuration',
	CUSTOM_HOURS: 'customHours',
	SHOW_CUSTOM_INPUT: 'showCustomInput',

	// App state
	FIRST_VISIT: 'fasttrackr_first_visit',
	INSTALL_PROMPT_SHOWN: 'installPromptShown',
	LAST_INSTALL_PROMPT: 'lastInstallPrompt',
	APP_INSTALLED: 'appInstalled',
	SUPPORT_DISMISSED: 'fasttrackr_support_dismissed',
} as const;

// Basic type guards
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

// localStorage type guards
export const isValidStoredFastRecord = (obj: unknown): obj is StoredFastRecord => {
	if (typeof obj !== 'object' || obj === null) return false;

	const record = obj as Record<string, unknown>;

	return (
		typeof record.id === 'string' &&
		typeof record.startTime === 'string' &&
		(record.endTime === null || typeof record.endTime === 'string') &&
		typeof record.targetHours === 'number' &&
		typeof record.completed === 'boolean' &&
		(record.notes === undefined || typeof record.notes === 'string')
	);
};

export const isValidCurrentFast = (obj: unknown): obj is CurrentFast => {
	if (typeof obj !== 'object' || obj === null) return false;

	const fast = obj as Record<string, unknown>;

	return (
		typeof fast.id === 'string' &&
		typeof fast.startTime === 'string' &&
		typeof fast.targetHours === 'number' &&
		(fast.notes === undefined || typeof fast.notes === 'string')
	);
};

export const isValidFastHistory = (obj: unknown): obj is StoredFastRecord[] => {
	if (!Array.isArray(obj)) return false;

	return obj.every(isValidStoredFastRecord);
};

export const isValidAppExportData = (obj: unknown): obj is AppExportData => {
	if (typeof obj !== 'object' || obj === null) return false;

	const data = obj as Record<string, unknown>;

	return (
		typeof data.version === 'string' &&
		typeof data.timestamp === 'string' &&
		typeof data.data === 'object' &&
		data.data !== null &&
		typeof (data.data as Record<string, unknown>).fastHistory === 'string' &&
		typeof (data.data as Record<string, unknown>).settings === 'object'
	);
};

// localStorage helper functions with type safety
export const getLocalStorageBoolean = (key: string, defaultValue = false): boolean => {
	try {
		const value = localStorage.getItem(key);
		return value === 'true';
	} catch {
		return defaultValue;
	}
};

export const getLocalStorageNumber = (key: string, defaultValue = 0): number => {
	try {
		const value = localStorage.getItem(key);
		if (value === null) return defaultValue;

		const parsed = Number(value);
		return Number.isNaN(parsed) ? defaultValue : parsed;
	} catch {
		return defaultValue;
	}
};

export const getLocalStorageString = (key: string, defaultValue = ''): string => {
	try {
		return localStorage.getItem(key) || defaultValue;
	} catch {
		return defaultValue;
	}
};

export const getLocalStorageJSON = <T>(
	key: string,
	validator: (obj: unknown) => obj is T,
	defaultValue: T
): T => {
	try {
		const value = localStorage.getItem(key);
		if (value === null) return defaultValue;

		const parsed = JSON.parse(value);
		return validator(parsed) ? parsed : defaultValue;
	} catch {
		return defaultValue;
	}
};

export const setLocalStorageJSON = <T>(key: string, value: T): boolean => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
};

export const setLocalStorageValue = (key: string, value: string | number | boolean): boolean => {
	try {
		localStorage.setItem(key, String(value));
		return true;
	} catch {
		return false;
	}
};

// Validation helpers for specific localStorage keys
export const validateFastingDuration = (value: string | null): FastingDuration => {
	if (value === null) return 16; // default

	const parsed = Number(value);
	return isValidFastingDuration(parsed) ? parsed : 16;
};

export const validateCustomHours = (value: string | null): number => {
	if (value === null) return 1;

	const parsed = Number(value);
	return (parsed >= 1 && parsed <= 168) ? parsed : 1;
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
