import { useCallback, useEffect, useState } from "react";

const AD_SUPPORT_KEY = "fasttrackr_ad_support";
const FIRST_VISIT_KEY = "fasttrackr_first_visit";

const useAdSupport = () => {
	const [supportCount, setSupportCount] = useState(0);
	const [isFirstVisit, setIsFirstVisit] = useState(true);
	const [isShowingAd, setIsShowingAd] = useState(false);

	// Load data from localStorage on mount
	useEffect(() => {
		const storedSupport = localStorage.getItem(AD_SUPPORT_KEY);
		const storedFirstVisit = localStorage.getItem(FIRST_VISIT_KEY);

		if (storedSupport) {
			try {
				const data = JSON.parse(storedSupport);
				setSupportCount(data.count || 0);
			} catch (error) {
				console.error("Error parsing ad support data:", error);
				setSupportCount(0);
			}
		}

		// Check if this is the first visit
		setIsFirstVisit(storedFirstVisit !== "false");
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
						
						if (
							lastSupported.getMonth() === currentMonth.getMonth() &&
							lastSupported.getFullYear() === currentMonth.getFullYear()
						) {
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
				resolve({ success: true, message: "Thank you for supporting FastTrackr! 🙏" });
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
			if (
				lastSupported.getMonth() === currentMonth.getMonth() &&
				lastSupported.getFullYear() === currentMonth.getFullYear()
			) {
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

	// Reset support data (for testing or if user wants to clear)
	const resetSupportData = useCallback(() => {
		localStorage.removeItem(AD_SUPPORT_KEY);
		setSupportCount(0);
	}, []);

	// Check if user has ever supported
	const hasEverSupported = supportCount > 0;

	return {
		// State
		supportCount,
		isFirstVisit,
		isShowingAd,
		hasEverSupported,

		// Actions
		markFirstVisitComplete,
		showSupportAd,
		resetSupportData,

		// Getters
		getSupportStats,
		getTotalThisMonth,
	};
};

export default useAdSupport; 