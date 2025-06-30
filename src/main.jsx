import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/window-controls-overlay.css";
import workboxManager from "./utils/serviceWorkerManager";

// Theme Provider Component
const DynamicThemeProvider = ({ children }) => {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		// Get theme preference from localStorage, default to "system"
		const savedTheme = localStorage.getItem("theme") || "system";

		// Function to get system theme preference
		const getSystemTheme = () => {
			return window.matchMedia("(prefers-color-scheme: dark)").matches;
		};

		// Function to determine if dark mode should be active
		const shouldUseDarkMode = (themePreference) => {
			switch (themePreference) {
				case "dark":
					return true;
				case "light":
					return false;
				default:
					return getSystemTheme();
			}
		};

		// Set initial theme
		setDarkMode(shouldUseDarkMode(savedTheme));

		// Listen for system theme changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemThemeChange = () => {
			const currentTheme = localStorage.getItem("theme") || "system";
			if (currentTheme === "system") {
				setDarkMode(getSystemTheme());
			}
		};

		// Listen for storage changes (theme preference changes)
		const handleStorageChange = (e) => {
			if (e.key === "theme") {
				setDarkMode(shouldUseDarkMode(e.newValue || "system"));
			}
		};

		// Listen for custom theme change events
		const handleThemeChange = (e) => {
			setDarkMode(shouldUseDarkMode(e.detail.theme));
		};

		mediaQuery.addEventListener("change", handleSystemThemeChange);
		window.addEventListener("storage", handleStorageChange);
		window.addEventListener("themeChanged", handleThemeChange);

		return () => {
			mediaQuery.removeEventListener("change", handleSystemThemeChange);
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("themeChanged", handleThemeChange);
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

// Initialize Workbox service worker
if ("serviceWorker" in navigator) {
	workboxManager.init().catch((error) => {
		console.error("Failed to initialize Workbox:", error);
	});
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<DynamicThemeProvider>
			<App />
		</DynamicThemeProvider>
	</React.StrictMode>,
);
