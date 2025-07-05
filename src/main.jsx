import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/window-controls-overlay.css";
import {
	registerServiceWorker,
	setupOnlineOfflineListeners,
} from "./utils/serviceWorkerManager.js";

// Theme Provider Component
const DynamicThemeProvider = ({ children }) => {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		// Load dark mode preference from localStorage
		const savedDarkMode = localStorage.getItem("darkMode") === "true";
		setDarkMode(savedDarkMode);

		// Listen for changes to dark mode setting
		const handleStorageChange = (e) => {
			if (e.key === "darkMode") {
				setDarkMode(e.newValue === "true");
			}
		};

		// Listen for custom dark mode change events
		const handleDarkModeChange = (e) => {
			setDarkMode(e.detail.darkMode);
		};

		window.addEventListener("storage", handleStorageChange);
		window.addEventListener("darkModeChanged", handleDarkModeChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("darkModeChanged", handleDarkModeChange);
		};
	}, []);

	// Create theme based on dark mode preference
	const theme = createTheme({
		palette: {
			mode: darkMode ? "dark" : "light",
			primary: {
				main: "#2563eb",
			},
			secondary: {
				main: "#10b981",
			},
			warning: {
				light: "#ffb74d",
				main: "#ff9800",
				dark: "#f57c00",
				contrastText: "#000000",
			},
			background: {
				default: darkMode ? "#121212" : "#f8fafc",
				paper: darkMode ? "#1e1e1e" : "#ffffff",
			},
		},
		typography: {
			fontFamily: "Roboto, Arial, sans-serif",
			h4: {
				fontWeight: 600,
			},
			h5: {
				fontWeight: 500,
			},
		},
		shape: {
			borderRadius: 8,
		},
		components: {
			MuiButton: {
				styleOverrides: {
					root: {
						textTransform: "none",
						fontWeight: 500,
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						boxShadow: darkMode
							? "0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.06)"
							: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
					},
				},
			},
		},
	});

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
};

// Initialize PWA features
const initializePWA = async () => {
	try {
		// Register service worker (may be null in development)
		const registration = await registerServiceWorker();

		if (registration) {
			console.log("PWA features initialized successfully with service worker");
		} else {
			console.log(
				"PWA features initialized without service worker (development mode)",
			);
		}

		// Setup online/offline listeners (works without service worker)
		setupOnlineOfflineListeners();
	} catch (error) {
		console.error("Failed to initialize PWA features:", error);
		// Continue without PWA features in development
		if (import.meta.env.DEV) {
			console.log("Continuing without PWA features in development mode");
		}
	}
};

// Track app launches for install prompt timing
const trackAppLaunch = () => {
	// Only track if not already installed
	const isInstalled =
		window.matchMedia("(display-mode: standalone)").matches ||
		window.navigator.standalone ||
		localStorage.getItem("appInstalled") === "true";

	if (!isInstalled) {
		const currentCount = parseInt(
			localStorage.getItem("appLaunchCount") || "0",
		);
		const newCount = currentCount + 1;
		localStorage.setItem("appLaunchCount", newCount.toString());
		console.log(`App launch count: ${newCount}`);
	}
};

// Initialize PWA when the app starts
initializePWA();

// Track app launch for install prompt timing
trackAppLaunch();

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<DynamicThemeProvider>
			<App />
		</DynamicThemeProvider>
	</React.StrictMode>,
);
