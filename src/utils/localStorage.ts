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
export class LocalStorageManager {
	// Fast tracking methods
	static getCurrentFast(): CurrentFast | null {
		return getLocalStorageJSON(
			LocalStorageKeys.CURRENT_FAST,
			isValidCurrentFast,
			null,
		);
	}

	static setCurrentFast(fast: CurrentFast): boolean {
		return setLocalStorageJSON(LocalStorageKeys.CURRENT_FAST, fast);
	}

	static clearCurrentFast(): boolean {
		try {
			localStorage.removeItem(LocalStorageKeys.CURRENT_FAST);
			return true;
		} catch {
			return false;
		}
	}

	static getFastHistory(): StoredFastRecord[] {
		return getLocalStorageJSON(
			LocalStorageKeys.FAST_HISTORY,
			isValidFastHistory,
			[],
		);
	}

	static setFastHistory(history: StoredFastRecord[]): boolean {
		return setLocalStorageJSON(LocalStorageKeys.FAST_HISTORY, history);
	}

	static addFastRecord(record: StoredFastRecord): boolean {
		try {
			const history = LocalStorageManager.getFastHistory();
			history.push(record);
			return LocalStorageManager.setFastHistory(history);
		} catch {
			return false;
		}
	}

	static updateFastRecord(
		id: string,
		updates: Partial<StoredFastRecord>,
	): boolean {
		try {
			const history = LocalStorageManager.getFastHistory();
			const index = history.findIndex((record) => record.id === id);

			if (index === -1) return false;

			history[index] = { ...history[index], ...updates };
			return LocalStorageManager.setFastHistory(history);
		} catch {
			return false;
		}
	}

	static deleteFastRecord(id: string): boolean {
		try {
			const history = LocalStorageManager.getFastHistory();
			const filtered = history.filter((record) => record.id !== id);
			return LocalStorageManager.setFastHistory(filtered);
		} catch {
			return false;
		}
	}

	// Settings methods
	static getDarkMode(): boolean {
		return getLocalStorageBoolean(LocalStorageKeys.DARK_MODE, false);
	}

	static setDarkMode(enabled: boolean): boolean {
		return setLocalStorageValue(LocalStorageKeys.DARK_MODE, enabled);
	}

	static getNotificationsEnabled(): boolean {
		return getLocalStorageBoolean(
			LocalStorageKeys.NOTIFICATIONS_ENABLED,
			false,
		);
	}

	static setNotificationsEnabled(enabled: boolean): boolean {
		return setLocalStorageValue(
			LocalStorageKeys.NOTIFICATIONS_ENABLED,
			enabled,
		);
	}

	static getMilestoneNotifications(): boolean {
		return getLocalStorageBoolean(
			LocalStorageKeys.MILESTONE_NOTIFICATIONS,
			true,
		);
	}

	static setMilestoneNotifications(enabled: boolean): boolean {
		return setLocalStorageValue(
			LocalStorageKeys.MILESTONE_NOTIFICATIONS,
			enabled,
		);
	}

	// Timer preferences
	static getSelectedDuration(): FastingDuration {
		const value = getLocalStorageString(LocalStorageKeys.SELECTED_DURATION);
		return validateFastingDuration(value || null);
	}

	static setSelectedDuration(duration: FastingDuration): boolean {
		return setLocalStorageValue(LocalStorageKeys.SELECTED_DURATION, duration);
	}

	static getCustomHours(): number {
		const value = getLocalStorageString(LocalStorageKeys.CUSTOM_HOURS);
		return validateCustomHours(value || null);
	}

	static setCustomHours(hours: number): boolean {
		if (hours < 1 || hours > 168) return false;
		return setLocalStorageValue(LocalStorageKeys.CUSTOM_HOURS, hours);
	}

	static getShowCustomInput(): boolean {
		return getLocalStorageBoolean(LocalStorageKeys.SHOW_CUSTOM_INPUT, false);
	}

	static setShowCustomInput(show: boolean): boolean {
		return setLocalStorageValue(LocalStorageKeys.SHOW_CUSTOM_INPUT, show);
	}

	// App state methods
	static isFirstVisit(): boolean {
		return getLocalStorageString(LocalStorageKeys.FIRST_VISIT) !== "false";
	}

	static setFirstVisitComplete(): boolean {
		return setLocalStorageValue(LocalStorageKeys.FIRST_VISIT, "false");
	}

	static getInstallPromptShown(): boolean {
		return getLocalStorageBoolean(LocalStorageKeys.INSTALL_PROMPT_SHOWN, false);
	}

	static setInstallPromptShown(): boolean {
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

	static getLastInstallPrompt(): number {
		return getLocalStorageNumber(LocalStorageKeys.LAST_INSTALL_PROMPT, 0);
	}

	static getAppInstalled(): boolean {
		return getLocalStorageBoolean(LocalStorageKeys.APP_INSTALLED, false);
	}

	static setAppInstalled(): boolean {
		return setLocalStorageValue(LocalStorageKeys.APP_INSTALLED, true);
	}

	static getSupportDismissed(): boolean {
		return getLocalStorageBoolean(LocalStorageKeys.SUPPORT_DISMISSED, false);
	}

	static setSupportDismissed(): boolean {
		return setLocalStorageValue(LocalStorageKeys.SUPPORT_DISMISSED, true);
	}

	// Export/import methods
	static exportAppData(): AppExportData {
		return {
			version: "1.0",
			timestamp: new Date().toISOString(),
			data: {
				fastHistory: JSON.stringify(LocalStorageManager.getFastHistory()),
				settings: {
					notificationsEnabled: String(
						LocalStorageManager.getNotificationsEnabled(),
					),
					milestoneNotifications: String(
						LocalStorageManager.getMilestoneNotifications(),
					),
					darkMode: String(LocalStorageManager.getDarkMode()),
				},
			},
		};
	}

	static importAppData(data: AppExportData): boolean {
		if (!isValidAppExportData(data)) return false;

		try {
			// Import fast history
			const fastHistory = JSON.parse(data.data.fastHistory);
			if (isValidFastHistory(fastHistory)) {
				LocalStorageManager.setFastHistory(fastHistory);
			}

			// Import settings
			if (data.data.settings.notificationsEnabled !== null) {
				LocalStorageManager.setNotificationsEnabled(
					data.data.settings.notificationsEnabled === "true",
				);
			}
			if (data.data.settings.milestoneNotifications !== null) {
				LocalStorageManager.setMilestoneNotifications(
					data.data.settings.milestoneNotifications === "true",
				);
			}
			if (data.data.settings.darkMode !== null) {
				LocalStorageManager.setDarkMode(data.data.settings.darkMode === "true");
			}

			return true;
		} catch {
			return false;
		}
	}

	// Utility methods
	static clearAllData(): boolean {
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

	static getStorageSize(): number {
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

	static isLocalStorageAvailable(): boolean {
		try {
			const test = "__localStorage_test__";
			localStorage.setItem(test, "test");
			localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	}
}
