import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

const NotificationContext = createContext();

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used within a NotificationProvider",
		);
	}
	return context;
};

export const NotificationProvider = ({ children }) => {
	const [permission, setPermission] = useState("default");
	const [isEnabled, setIsEnabled] = useState(false);
	const [milestoneNotifications, setMilestoneNotifications] = useState(true);

	useEffect(() => {
		// Load settings
		setIsEnabled(localStorage.getItem("notificationsEnabled") === "true");
		setMilestoneNotifications(
			localStorage.getItem("milestoneNotifications") !== "false",
		);
		setPermission(Notification.permission);
	}, []);

	const requestPermission = useCallback(async () => {
		if (!("Notification" in window)) {
			return "unsupported";
		}

		try {
			const result = await Notification.requestPermission();
			setPermission(result);
			return result;
		} catch (error) {
			console.error("Error requesting notification permission:", error);
			return "error";
		}
	}, []);

	const canShowNotifications = useCallback(() => {
		return isEnabled && permission === "granted" && "Notification" in window;
	}, [isEnabled, permission]);

	const showNotification = useCallback(
		(title, options = {}) => {
			if (!canShowNotifications()) {
				console.log("Cannot show notification:", title);
				return null;
			}

			const defaultOptions = {
				icon: "/icons/manifest-icon-192.maskable.png",
				badge: "/icons/manifest-icon-192.maskable.png",
				vibrate: [100, 50, 100],
				requireInteraction: false,
				silent: false,
			};

			const finalOptions = { ...defaultOptions, ...options };

			try {
				const notification = new Notification(title, finalOptions);

				notification.onclick = () => {
					window.focus();
					notification.close();
				};

				return notification;
			} catch (error) {
				console.error("Failed to show notification:", error);
				return null;
			}
		},
		[canShowNotifications],
	);

	const showFastCompleteNotification = useCallback(
		(duration) => {
			if (canShowNotifications()) {
				const hours = Math.floor(duration / (1000 * 60 * 60));
				const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

				showNotification("Fast Complete! 🎉", {
					body: `Congratulations! You've completed your ${hours}h ${minutes}m fast!`,
					tag: "fast-complete",
					requireInteraction: true,
				});
			}
		},
		[canShowNotifications, showNotification],
	);

	const showMilestoneNotification = useCallback(
		(hours) => {
			if (canShowNotifications() && milestoneNotifications) {
				const milestoneMessages = {
					1: "Great start! 1 hour down.",
					4: "You're doing great! 4 hours completed.",
					8: "Halfway to 16 hours! Keep it up!",
					12: "Excellent progress! 12 hours done.",
					16: "Amazing! You've hit the 16-hour mark!",
					18: "Outstanding! 18 hours completed!",
					20: "Incredible dedication! 20 hours done!",
					24: "Phenomenal! You've reached 24 hours!",
				};

				const message =
					milestoneMessages[hours] || `${hours} hours completed! Keep going!`;

				showNotification(`${hours}-Hour Milestone`, {
					body: message,
					tag: `milestone-${hours}`,
				});
			}
		},
		[canShowNotifications, milestoneNotifications, showNotification],
	);

	const toggleNotifications = useCallback(async (enabled) => {
		setIsEnabled(enabled);
		localStorage.setItem("notificationsEnabled", enabled.toString());
	}, []);

	const toggleMilestoneNotifications = useCallback((enabled) => {
		setMilestoneNotifications(enabled);
		localStorage.setItem("milestoneNotifications", enabled.toString());
	}, []);

	const value = {
		// State
		permission,
		isEnabled,
		milestoneNotifications,

		// Actions
		requestPermission,
		showNotification,
		showFastCompleteNotification,
		showMilestoneNotification,
		toggleNotifications,
		toggleMilestoneNotifications,

		// Computed
		canShowNotifications,
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};
