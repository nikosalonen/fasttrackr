import { useCallback, useEffect, useState } from "react";

const AD_SUPPORT_KEY = "fasttrackr_ad_support";
const FIRST_VISIT_KEY = "fasttrackr_first_visit";
const SUPPORT_DISMISSED_KEY = "fasttrackr_support_dismissed";

// Utility function to check if two dates are in the same month and year
const isSameMonthAndYear = (date1, date2) => {
	return (
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
};

const useAdSupport = () => {
	// Initialize states more carefully to prevent render issues
	const [supportCount, setSupportCount] = useState(() => {
		const storedSupport = localStorage.getItem(AD_SUPPORT_KEY);
		if (storedSupport) {
			try {
				const data = JSON.parse(storedSupport);
				return data.count || 0;
			} catch (error) {
				console.error("Error parsing ad support data:", error);
				return 0;
			}
		}
		return 0;
	});

	const [isFirstVisit, setIsFirstVisit] = useState(() => {
		const storedFirstVisit = localStorage.getItem(FIRST_VISIT_KEY);
		return storedFirstVisit !== "false";
	});

	const [isShowingAd, setIsShowingAd] = useState(false);

	const [isSupportDismissed, setIsSupportDismissed] = useState(() => {
		const storedDismissed = localStorage.getItem(SUPPORT_DISMISSED_KEY);
		return storedDismissed === "true";
	});

	// Load any remaining data from localStorage on mount (if needed)
	useEffect(() => {
		// This effect is now just for any additional initialization if needed
		// Most state is initialized lazily above to prevent render issues
	}, []);

	// Mark that the user has completed their first visit
	const markFirstVisitComplete = useCallback(() => {
		localStorage.setItem(FIRST_VISIT_KEY, "false");
		setIsFirstVisit(false);
	}, []);

	// Show a voluntary ad
	const showSupportAd = useCallback(() => {
		setIsShowingAd(true);

		// Simulate ad loading/showing (replace with actual ad network integration)
		return new Promise((resolve) => {
			// This would be replaced with actual ad network code
			// For now, we'll simulate an ad with a timeout
			setTimeout(() => {
				// Increment support count
				const newCount = supportCount + 1;
				setSupportCount(newCount);

				// Get current month total directly to avoid dependency issues
				const getCurrentMonthTotal = () => {
					const storedSupport = localStorage.getItem(AD_SUPPORT_KEY);
					if (!storedSupport) return 0;

					try {
						const data = JSON.parse(storedSupport);
						const lastSupported = new Date(data.lastSupported);
						const currentMonth = new Date();

						if (isSameMonthAndYear(lastSupported, currentMonth)) {
							return data.totalThisMonth || 0;
						}
						return 0;
					} catch {
						return 0;
					}
				};

				// Save to localStorage
				const supportData = {
					count: newCount,
					lastSupported: new Date().toISOString(),
					totalThisMonth: getCurrentMonthTotal() + 1,
				};

				localStorage.setItem(AD_SUPPORT_KEY, JSON.stringify(supportData));
				setIsShowingAd(false);
				resolve({
					success: true,
					message: "Thank you for supporting FastTrackr! 🙏",
				});
			}, 2000); // Simulate 2-second ad
		});
	}, [supportCount]);

	// Get support count for current month
	const getTotalThisMonth = useCallback(() => {
		const storedSupport = localStorage.getItem(AD_SUPPORT_KEY);
		if (!storedSupport) return 0;

		try {
			const data = JSON.parse(storedSupport);
			const lastSupported = new Date(data.lastSupported);
			const currentMonth = new Date();

			// Check if last support was in current month
			if (isSameMonthAndYear(lastSupported, currentMonth)) {
				return data.totalThisMonth || 0;
			}
			return 0;
		} catch {
			return 0;
		}
	}, []);

	// Get formatted support stats
	const getSupportStats = useCallback(() => {
		const storedSupport = localStorage.getItem(AD_SUPPORT_KEY);
		if (!storedSupport) {
			return {
				totalSupports: 0,
				thisMonth: 0,
				lastSupported: null,
			};
		}

		try {
			const data = JSON.parse(storedSupport);
			return {
				totalSupports: data.count || 0,
				thisMonth: getTotalThisMonth(),
				lastSupported: data.lastSupported ? new Date(data.lastSupported) : null,
			};
		} catch {
			return {
				totalSupports: 0,
				thisMonth: 0,
				lastSupported: null,
			};
		}
	}, [getTotalThisMonth]);

	// Dismiss the support section permanently
	const dismissSupport = useCallback(() => {
		localStorage.setItem(SUPPORT_DISMISSED_KEY, "true");
		setIsSupportDismissed(true);
	}, []);

	// Reset support data (for testing or if user wants to clear)
	const resetSupportData = useCallback(() => {
		localStorage.removeItem(AD_SUPPORT_KEY);
		localStorage.removeItem(SUPPORT_DISMISSED_KEY);
		setSupportCount(0);
		setIsSupportDismissed(false);
	}, []);

	// Check if user has ever supported
	const hasEverSupported = supportCount > 0;

	return {
		// State
		supportCount,
		isFirstVisit,
		isShowingAd,
		hasEverSupported,
		isSupportDismissed,

		// Actions
		markFirstVisitComplete,
		showSupportAd,
		dismissSupport,
		resetSupportData,

		// Getters
		getSupportStats,
		getTotalThisMonth,
	};
};

export default useAdSupport;
