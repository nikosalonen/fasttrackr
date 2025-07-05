import {
	Close as CloseIcon,
	Settings as SettingsIcon,
	Timer as TimerIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Switch,
	Typography,
	useTheme,
} from "@mui/material";
import React, { useState } from "react";

const InitialSetup = ({ open, onClose }) => {
	const theme = useTheme();
	const [settings, setSettings] = useState({
		darkMode: false,
		use12HourClock: true,
		firstDayOfWeek: "sunday",
		swipeGesturesEnabled: true,
		notificationsEnabled: false,
	});

	const handleSettingChange = (key, value) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSaveSettings = async () => {
		// Save all settings to localStorage
		localStorage.setItem("darkMode", settings.darkMode.toString());
		localStorage.setItem("use12HourClock", settings.use12HourClock.toString());
		localStorage.setItem("firstDayOfWeek", settings.firstDayOfWeek);
		localStorage.setItem(
			"swipeGesturesEnabled",
			settings.swipeGesturesEnabled.toString(),
		);

		// Handle notifications separately since it requires permission
		if (settings.notificationsEnabled) {
			if ("Notification" in window) {
				try {
					const permission = await Notification.requestPermission();
					if (permission === "granted") {
						localStorage.setItem("notificationsEnabled", "true");
						localStorage.setItem("milestoneNotifications", "true");
					}
				} catch (error) {
					console.error("Failed to request notification permission:", error);
				}
			}
		} else {
			localStorage.setItem("notificationsEnabled", "false");
			localStorage.setItem("milestoneNotifications", "false");
		}

		// Mark initial setup as completed
		localStorage.setItem("initialSetupCompleted", "true");

		// Trigger theme update if dark mode was enabled
		if (settings.darkMode) {
			window.dispatchEvent(
				new CustomEvent("darkModeChanged", {
					detail: { darkMode: settings.darkMode },
				}),
			);
		}

		onClose();
	};

	const handleSkipSetup = () => {
		// Set default values for all settings
		localStorage.setItem("darkMode", "false");
		localStorage.setItem("use12HourClock", "true");
		localStorage.setItem("firstDayOfWeek", "sunday");
		localStorage.setItem("swipeGesturesEnabled", "true");
		localStorage.setItem("notificationsEnabled", "false");
		localStorage.setItem("milestoneNotifications", "false");
		localStorage.setItem("initialSetupCompleted", "true");

		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleSkipSetup}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					mx: 2,
				},
			}}
		>
			<DialogTitle component="div" sx={{ textAlign: "center", pb: 1 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 1,
						mb: 1,
					}}
				>
					<SettingsIcon sx={{ fontSize: 32, color: "primary.main" }} />
					<Typography
						variant="h4"
						component="h2"
						fontWeight="bold"
						color="primary.main"
					>
						Quick Setup
					</Typography>
				</Box>
				<Typography
					variant="subtitle1"
					component="p"
					color="text.secondary"
					fontWeight="normal"
				>
					Let's configure your preferences! ⚙️
				</Typography>
				<IconButton
					onClick={handleSkipSetup}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: "grey.500",
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent>
				<Stack spacing={3}>
					{/* Welcome Message */}
					<Card
						sx={{
							bgcolor: "primary.50",
							border: `1px solid ${theme.palette.primary.main}20`,
						}}
					>
						<CardContent>
							<Typography variant="body1" sx={{ lineHeight: 1.6 }}>
								<strong>Welcome to FastTrackr!</strong> Let's quickly set up
								your preferences to personalize your fasting experience.
							</Typography>
						</CardContent>
					</Card>

					{/* Appearance Settings */}
					<Box>
						<Typography
							variant="h6"
							component="h3"
							fontWeight="600"
							sx={{ mb: 2 }}
						>
							Appearance
						</Typography>
						<Stack spacing={2}>
							<FormControlLabel
								control={
									<Switch
										checked={settings.darkMode}
										onChange={(e) =>
											handleSettingChange("darkMode", e.target.checked)
										}
									/>
								}
								label="Dark Mode"
							/>

							<FormControlLabel
								control={
									<Switch
										checked={settings.use12HourClock}
										onChange={(e) =>
											handleSettingChange("use12HourClock", e.target.checked)
										}
									/>
								}
								label="12-Hour Clock Format"
							/>

							<FormControl fullWidth>
								<InputLabel>Week starts on</InputLabel>
								<Select
									value={settings.firstDayOfWeek}
									label="Week starts on"
									onChange={(e) =>
										handleSettingChange("firstDayOfWeek", e.target.value)
									}
								>
									<MenuItem value="sunday">Sunday</MenuItem>
									<MenuItem value="monday">Monday</MenuItem>
								</Select>
							</FormControl>
						</Stack>
					</Box>

					{/* Interaction Settings */}
					<Box>
						<Typography
							variant="h6"
							component="h3"
							fontWeight="600"
							sx={{ mb: 2 }}
						>
							Interaction
						</Typography>
						<Stack spacing={2}>
							<FormControlLabel
								control={
									<Switch
										checked={settings.swipeGesturesEnabled}
										onChange={(e) =>
											handleSettingChange(
												"swipeGesturesEnabled",
												e.target.checked,
											)
										}
									/>
								}
								label="Swipe Gestures on Timer"
							/>
							<Typography variant="body2" color="text.secondary">
								Enable swipe gestures on the timer for quick start/stop actions
								on mobile devices.
							</Typography>
						</Stack>
					</Box>

					{/* Notifications Settings */}
					<Box>
						<Typography
							variant="h6"
							component="h3"
							fontWeight="600"
							sx={{ mb: 2 }}
						>
							Notifications
						</Typography>
						<Stack spacing={2}>
							<FormControlLabel
								control={
									<Switch
										checked={settings.notificationsEnabled}
										onChange={(e) =>
											handleSettingChange(
												"notificationsEnabled",
												e.target.checked,
											)
										}
									/>
								}
								label="Enable Notifications"
							/>
							<Typography variant="body2" color="text.secondary">
								Get notified when your fast is complete and when you reach
								milestones like 16 hours, 24 hours, etc.
							</Typography>
						</Stack>
					</Box>

					{/* Info Message */}
					<Box
						sx={{
							p: 2,
							bgcolor: "grey.50",
							borderRadius: 1,
							border: `1px solid ${theme.palette.grey[200]}`,
						}}
					>
						<Typography
							variant="body2"
							color="text.secondary"
							fontStyle="italic"
						>
							💡 <strong>Don't worry!</strong> You can change all these settings
							later in the Settings tab. This is just to get you started with
							your preferred configuration.
						</Typography>
					</Box>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ p: 3, pt: 1 }}>
				<Button onClick={handleSkipSetup} color="inherit">
					Skip Setup
				</Button>
				<Button
					onClick={handleSaveSettings}
					variant="contained"
					size="large"
					startIcon={<TimerIcon />}
					sx={{ borderRadius: 2, minWidth: 160 }}
				>
					Start Fasting!
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default InitialSetup;
