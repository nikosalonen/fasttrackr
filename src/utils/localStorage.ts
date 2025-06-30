import {
	type AppExportData,
	type CurrentFast,
	type FastingDuration,
	getLocalStorageBoolean,
	getLocalStorageJSON,
	getLocalStorageNumber,
	getLocalStorageString,
	isValidAppExportData,
	isValidCurrentFast,
	isValidFastHistory,
	LocalStorageKeys,
	type StoredFastRecord,
	setLocalStorageJSON,
	setLocalStorageValue,
	validateCustomHours,
	validateFastingDuration,
} from "../types/utils";

/**
 * Type-safe localStorage utilities for FastTrackr app
 */

// Fast tracking methods
export function getCurrentFast(): CurrentFast | null {
	return getLocalStorageJSON(
		LocalStorageKeys.CURRENT_FAST,
		isValidCurrentFast,
		null,
	);
}

export function setCurrentFast(fast: CurrentFast): boolean {
	return setLocalStorageJSON(LocalStorageKeys.CURRENT_FAST, fast);
}

export function clearCurrentFast(): boolean {
	try {
		localStorage.removeItem(LocalStorageKeys.CURRENT_FAST);
		return true;
	} catch {
		return false;
	}
}

export function getFastHistory(): StoredFastRecord[] {
	return getLocalStorageJSON(
		LocalStorageKeys.FAST_HISTORY,
		isValidFastHistory,
		[],
	);
}

export function setFastHistory(history: StoredFastRecord[]): boolean {
	return setLocalStorageJSON(LocalStorageKeys.FAST_HISTORY, history);
}

export function addFastRecord(record: StoredFastRecord): boolean {
	try {
		const history = getFastHistory();
		history.push(record);
		return setFastHistory(history);
	} catch {
		return false;
	}
}

export function updateFastRecord(
	id: string,
	updates: Partial<StoredFastRecord>,
): boolean {
	try {
		const history = getFastHistory();
		const index = history.findIndex((record) => record.id === id);

		if (index === -1) return false;

		history[index] = { ...history[index], ...updates };
		return setFastHistory(history);
	} catch {
		return false;
	}
}

export function deleteFastRecord(id: string): boolean {
	try {
		const history = getFastHistory();
		const filtered = history.filter((record) => record.id !== id);
		return setFastHistory(filtered);
	} catch {
		return false;
	}
}

// Settings methods
export function getDarkMode(): boolean {
	// Legacy support - check if old darkMode setting exists
	const legacyDarkModeValue = localStorage.getItem(LocalStorageKeys.DARK_MODE);
	if (legacyDarkModeValue !== null) {
		// Migrate from old boolean to new theme system
		const legacyDarkMode = legacyDarkModeValue === "true";
		const theme = legacyDarkMode ? "dark" : "light";
		setTheme(theme);
		localStorage.removeItem(LocalStorageKeys.DARK_MODE);
		return legacyDarkMode;
	}

	// Use new theme system
	const theme = getTheme();
	return (
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches)
	);
}

export function setDarkMode(enabled: boolean): boolean {
	// Legacy support - convert to new theme system
	const theme = enabled ? "dark" : "light";
	return setTheme(theme);
}

export function getTheme(): "light" | "dark" | "system" {
	const theme = localStorage.getItem("theme");
	if (theme === "light" || theme === "dark" || theme === "system") {
		return theme;
	}
	return "system"; // Default to system theme
}

export function setTheme(theme: "light" | "dark" | "system"): boolean {
	return setLocalStorageValue("theme", theme);
}

export function getNotificationsEnabled(): boolean {
	return getLocalStorageBoolean(LocalStorageKeys.NOTIFICATIONS_ENABLED, false);
}

export function setNotificationsEnabled(enabled: boolean): boolean {
	return setLocalStorageValue(LocalStorageKeys.NOTIFICATIONS_ENABLED, enabled);
}

export function getMilestoneNotifications(): boolean {
	return getLocalStorageBoolean(LocalStorageKeys.MILESTONE_NOTIFICATIONS, true);
}

export function setMilestoneNotifications(enabled: boolean): boolean {
	return setLocalStorageValue(
		LocalStorageKeys.MILESTONE_NOTIFICATIONS,
		enabled,
	);
}

// Timer preferences
export function getSelectedDuration(): FastingDuration {
	const value = getLocalStorageString(LocalStorageKeys.SELECTED_DURATION);
	return validateFastingDuration(value || null);
}

export function setSelectedDuration(duration: FastingDuration): boolean {
	return setLocalStorageValue(LocalStorageKeys.SELECTED_DURATION, duration);
}

export function getCustomHours(): number {
	const value = getLocalStorageString(LocalStorageKeys.CUSTOM_HOURS);
	return validateCustomHours(value || null);
}

export function setCustomHours(hours: number): boolean {
	if (hours < 1 || hours > 168) return false;
	return setLocalStorageValue(LocalStorageKeys.CUSTOM_HOURS, hours);
}

export function getShowCustomInput(): boolean {
	return getLocalStorageBoolean(LocalStorageKeys.SHOW_CUSTOM_INPUT, false);
}

export function setShowCustomInput(show: boolean): boolean {
	return setLocalStorageValue(LocalStorageKeys.SHOW_CUSTOM_INPUT, show);
}

// App state methods
export function isFirstVisit(): boolean {
	return getLocalStorageString(LocalStorageKeys.FIRST_VISIT) !== "false";
}

export function setFirstVisitComplete(): boolean {
	return setLocalStorageValue(LocalStorageKeys.FIRST_VISIT, "false");
}

export function getInstallPromptShown(): boolean {
	return getLocalStorageBoolean(LocalStorageKeys.INSTALL_PROMPT_SHOWN, false);
}

export function setInstallPromptShown(): boolean {
	const success1 = setLocalStorageValue(
		LocalStorageKeys.INSTALL_PROMPT_SHOWN,
		true,
	);
	const success2 = setLocalStorageValue(
		LocalStorageKeys.LAST_INSTALL_PROMPT,
		Date.now(),
	);
	return success1 && success2;
}

export function getLastInstallPrompt(): number {
	return getLocalStorageNumber(LocalStorageKeys.LAST_INSTALL_PROMPT, 0);
}

export function getAppInstalled(): boolean {
	return getLocalStorageBoolean(LocalStorageKeys.APP_INSTALLED, false);
}

export function setAppInstalled(): boolean {
	return setLocalStorageValue(LocalStorageKeys.APP_INSTALLED, true);
}

export function getSupportDismissed(): boolean {
	return getLocalStorageBoolean(LocalStorageKeys.SUPPORT_DISMISSED, false);
}

export function setSupportDismissed(): boolean {
	return setLocalStorageValue(LocalStorageKeys.SUPPORT_DISMISSED, true);
}

// Export/import methods
export function exportAppData(): AppExportData {
	return {
		version: "1.0",
		timestamp: new Date().toISOString(),
		data: {
			fastHistory: JSON.stringify(getFastHistory()),
			settings: {
				notificationsEnabled: String(getNotificationsEnabled()),
				milestoneNotifications: String(getMilestoneNotifications()),
				darkMode: String(getDarkMode()), // Legacy support
				theme: getTheme(), // New theme system
			},
		},
	};
}

export function importAppData(data: AppExportData): boolean {
	if (!isValidAppExportData(data)) return false;

	try {
		// Import fast history
		const fastHistory = JSON.parse(data.data.fastHistory);
		if (isValidFastHistory(fastHistory)) {
			setFastHistory(fastHistory);
		}

		// Import settings
		if (data.data.settings.notificationsEnabled !== null) {
			setNotificationsEnabled(
				data.data.settings.notificationsEnabled === "true",
			);
		}
		if (data.data.settings.milestoneNotifications !== null) {
			setMilestoneNotifications(
				data.data.settings.milestoneNotifications === "true",
			);
		}
		// Handle both legacy darkMode and new theme settings
		if (
			data.data.settings.theme !== null &&
			data.data.settings.theme !== undefined
		) {
			const theme = data.data.settings.theme;
			if (theme === "light" || theme === "dark" || theme === "system") {
				setTheme(theme);
			}
		} else if (data.data.settings.darkMode !== null) {
			// Legacy support for old darkMode exports
			const theme = data.data.settings.darkMode === "true" ? "dark" : "light";
			setTheme(theme);
		}

		return true;
	} catch {
		return false;
	}
}

// Utility methods
export function clearAllData(): boolean {
	try {
		const keysToRemove = Object.values(LocalStorageKeys);
		keysToRemove.forEach((key) => {
			localStorage.removeItem(key);
		});
		return true;
	} catch {
		return false;
	}
}

export function getStorageSize(): number {
	try {
		let total = 0;
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) {
				total += localStorage.getItem(key)?.length || 0;
			}
		}
		return total;
	} catch {
		return 0;
	}
}

export function isLocalStorageAvailable(): boolean {
	try {
		const test = "__localStorage_test__";
		localStorage.setItem(test, "test");
		localStorage.removeItem(test);
		return true;
	} catch {
		return false;
	}
}
