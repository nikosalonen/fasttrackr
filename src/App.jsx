import {
	History as HistoryIcon,
	Settings as SettingsIcon,
	Assessment as StatsIcon,
	Timer as TimerIcon,
} from "@mui/icons-material";
import {
	AppBar,
	BottomNavigation,
	BottomNavigationAction,
	Box,
	Container,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import HistoryScreen from "./components/HistoryScreen";
import InstallPrompt from "./components/InstallPrompt";
import SettingsScreen from "./components/SettingsScreen";
import StatsScreen from "./components/StatsScreen";
import TimerScreen from "./components/TimerScreen";
import UpdateNotification from "./components/UpdateNotification";
import WelcomeScreen from "./components/WelcomeScreen";
import { FastTimerProvider } from "./hooks/useFastTimer";
import { NotificationProvider } from "./hooks/useNotifications";
import { useWindowControlsOverlay } from "./hooks/useWindowControlsOverlay";
import useAdSupport from "./hooks/useAdSupport";

function App() {
	const [currentTab, setCurrentTab] = useState(0);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const { isActive: isWCOActive, getTitleBarAreaCSS } =
		useWindowControlsOverlay();
	const { isFirstVisit, markFirstVisitComplete } = useAdSupport();

	useEffect(() => {
		// Handle URL parameters for deep linking
		const urlParams = new URLSearchParams(window.location.search);
		const screen = urlParams.get("screen");
		const action = urlParams.get("action");

		if (screen) {
			switch (screen) {
				case "history":
					setCurrentTab(1);
					break;
				case "stats":
					setCurrentTab(2);
					break;
				case "settings":
					setCurrentTab(3);
					break;
				default:
					setCurrentTab(0);
			}
		}

		if (action === "start") {
			setCurrentTab(0);
			// Timer will handle the auto-start
		}
	}, []);

	const handleTabChange = (_, newValue) => {
		setCurrentTab(newValue);

		// Update URL without reload
		const screens = ["timer", "history", "stats", "settings"];
		const url = new URL(window.location);
		url.searchParams.set("screen", screens[newValue]);
		window.history.pushState({}, "", url);
	};

	const screens = [
		{ component: <TimerScreen />, label: "Timer", icon: <TimerIcon /> },
		{ component: <HistoryScreen />, label: "History", icon: <HistoryIcon /> },
		{ component: <StatsScreen />, label: "Stats", icon: <StatsIcon /> },
		{
			component: <SettingsScreen />,
			label: "Settings",
			icon: <SettingsIcon />,
		},
	];

	return (
		<FastTimerProvider>
			<NotificationProvider>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						minHeight: "100vh",
						// Apply WCO CSS variables
						...getTitleBarAreaCSS(),
					}}
				>
					{/* App Header */}
					<AppBar
						position="static"
						elevation={1}
						sx={{
							// Window Controls Overlay support
							WebkitAppRegion: isWCOActive ? "drag" : "initial",
							"& .MuiToolbar-root": {
								WebkitAppRegion: "no-drag",
								paddingLeft: isWCOActive
									? "env(titlebar-area-x, 16px)"
									: "16px",
								paddingRight: isWCOActive
									? "calc(env(titlebar-area-width, 100vw) - env(titlebar-area-x, 0px) - 100vw + 100vw - 16px)"
									: "16px",
								minHeight: isWCOActive
									? "env(titlebar-area-height, 64px)"
									: "64px",
								display: "flex",
								alignItems: "center",
							},
						}}
					>
						<Toolbar>
							<Typography
								variant="h6"
								component="h1"
								sx={{
									flexGrow: 1,
									fontWeight: 600,
									display: "flex",
									alignItems: "center",
									gap: 1,
									WebkitAppRegion: "no-drag",
								}}
							>
								⏰ FastTrackr
							</Typography>
						</Toolbar>
					</AppBar>

					{/* Main Content */}
					<Container
						maxWidth="md"
						sx={{
							flex: 1,
							py: 2,
							pb: isMobile ? 10 : 2, // Extra padding for mobile bottom nav
						}}
					>
						{screens[currentTab].component}
					</Container>

					{/* Bottom Navigation for Mobile */}
					{isMobile && (
						<BottomNavigation
							value={currentTab}
							onChange={handleTabChange}
							sx={{
								position: "fixed",
								bottom: 0,
								left: 0,
								right: 0,
								zIndex: 1000,
								borderTop: 1,
								borderColor: "divider",
								backgroundColor: "background.paper",
							}}
						>
							{screens.map((screen, _) => (
								<BottomNavigationAction
									key={screen.label}
									label={screen.label}
									icon={screen.icon}
								/>
							))}
						</BottomNavigation>
					)}

					{/* Tab Navigation for Desktop */}
					{!isMobile && (
						<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
							<Container maxWidth="md">
								<BottomNavigation
									value={currentTab}
									onChange={handleTabChange}
									sx={{ backgroundColor: "transparent" }}
								>
									{screens.map((screen, _) => (
										<BottomNavigationAction
											key={screen.label}
											label={screen.label}
											icon={screen.icon}
										/>
									))}
								</BottomNavigation>
							</Container>
						</Box>
					)}

					{/* PWA Install Prompt */}
					<InstallPrompt />

					{/* Service Worker Update Notifications */}
					<UpdateNotification />

					{/* Welcome Screen for First-Time Users */}
					<WelcomeScreen open={isFirstVisit} onClose={markFirstVisitComplete} />
				</Box>
			</NotificationProvider>
		</FastTimerProvider>
	);
}

export default App;
