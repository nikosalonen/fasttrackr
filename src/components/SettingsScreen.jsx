import {
	Add as AddIcon,
	Close as CloseIcon,
	DarkMode as DarkModeIcon,
	Delete as DeleteIcon,
	Download as ExportIcon,
	Flag as GoalIcon,
	Upload as ImportIcon,
	Info as InfoIcon,
	Notifications as NotificationIcon,
	Refresh as RefreshIcon,
	Update as UpdateIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Snackbar,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import GoalSettings from "./GoalSettings";

import SupportDeveloper from "./SupportDeveloper";
import { updateUtils } from "./UpdateNotification";

const SettingsScreen = () => {
	const {
		isEnabled: notificationsEnabled,
		milestoneNotifications,
		toggleNotifications,
		toggleMilestoneNotifications,
		permission,
		requestPermission,
	} = useNotifications();

	const [darkMode, setDarkMode] = useState(false);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [clearDialogOpen, setClearDialogOpen] = useState(false);
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [importData, setImportData] = useState("");
	const [customMilestones, setCustomMilestones] = useState(() => {
		const saved = localStorage.getItem("customMilestones");
		return saved ? JSON.parse(saved) : [];
	});
	const [newMilestone, setNewMilestone] = useState("");
	const [quietHoursEnabled, setQuietHoursEnabled] = useState(() => {
		return localStorage.getItem("quietHoursEnabled") === "true";
	});
	const [quietHoursStart, setQuietHoursStart] = useState(() => {
		return localStorage.getItem("quietHoursStart") || "23:00";
	});
	const [quietHoursEnd, setQuietHoursEnd] = useState(() => {
		return localStorage.getItem("quietHoursEnd") || "07:00";
	});
	const [use12HourClock, setUse12HourClock] = useState(() => {
		return localStorage.getItem("use12HourClock") !== "false";
	});
	const [firstDayOfWeek, setFirstDayOfWeek] = useState(() => {
		return localStorage.getItem("firstDayOfWeek") || "sunday";
	});
	const [quietHoursStatus, setQuietHoursStatus] = useState("");
	const [showGoalSettings, setShowGoalSettings] = useState(false);
	const [swipeGesturesEnabled, setSwipeGesturesEnabled] = useState(() => {
		return localStorage.getItem("swipeGesturesEnabled") !== "false";
	});

	useEffect(() => {
		// Load dark mode setting
		setDarkMode(localStorage.getItem("darkMode") === "true");
	}, []);

	const handleNotificationToggle = async (enabled) => {
		if (enabled) {
			// Check if notifications are supported
			if (!("Notification" in window)) {
				showSnackbar("Notifications are not supported in this browser");
				return;
			}

			// If permission isn't granted yet, request it
			if (permission !== "granted") {
				showSnackbar(
					"Please allow notifications when prompted by your browser",
				);
				const permissionResult = await requestPermission();

				if (permissionResult === "granted") {
					await toggleNotifications(true);
					showSnackbar("Notifications enabled successfully!");
				} else if (permissionResult === "denied") {
					showSnackbar(
						"Notifications were denied. Please enable them in your browser settings.",
					);
				} else {
					showSnackbar("Failed to enable notifications. Please try again.");
				}
			} else {
				// Permission already granted
				await toggleNotifications(true);
				showSnackbar("Notifications enabled");
			}
		} else {
			// Disabling notifications
			await toggleNotifications(false);
			showSnackbar("Notifications disabled");
		}
	};

	const handleMilestoneToggle = (enabled) => {
		toggleMilestoneNotifications(enabled);
		showSnackbar(
			enabled
				? "Milestone notifications enabled"
				: "Milestone notifications disabled",
		);
	};

	const handleQuietHoursToggle = (enabled) => {
		setQuietHoursEnabled(enabled);
		localStorage.setItem("quietHoursEnabled", enabled.toString());
		showSnackbar(enabled ? "Quiet hours enabled" : "Quiet hours disabled");
	};

	const handleQuietHoursStartChange = (time) => {
		setQuietHoursStart(time);
		localStorage.setItem("quietHoursStart", time);
	};

	const handleQuietHoursEndChange = (time) => {
		setQuietHoursEnd(time);
		localStorage.setItem("quietHoursEnd", time);
	};

	const handle12HourClockToggle = (enabled) => {
		setUse12HourClock(enabled);
		localStorage.setItem("use12HourClock", enabled.toString());
		showSnackbar(enabled ? "12-hour clock enabled" : "24-hour clock enabled");
	};

	const handleFirstDayOfWeekChange = (day) => {
		setFirstDayOfWeek(day);
		localStorage.setItem("firstDayOfWeek", day);
		showSnackbar(`Week starts on ${day === "sunday" ? "Sunday" : "Monday"}`);
	};

	const handleSwipeGesturesToggle = (enabled) => {
		setSwipeGesturesEnabled(enabled);
		localStorage.setItem("swipeGesturesEnabled", enabled.toString());
		showSnackbar(
			enabled ? "Swipe gestures enabled" : "Swipe gestures disabled",
		);
	};

	const addCustomMilestone = () => {
		const hours = parseInt(newMilestone);
		if (!hours || hours <= 0 || hours > 168) {
			showSnackbar("Please enter a valid number of hours (1-168)");
			return;
		}

		if (customMilestones.includes(hours)) {
			showSnackbar("This milestone already exists");
			return;
		}

		const updatedMilestones = [...customMilestones, hours].sort(
			(a, b) => a - b,
		);
		setCustomMilestones(updatedMilestones);
		localStorage.setItem("customMilestones", JSON.stringify(updatedMilestones));
		setNewMilestone("");
		showSnackbar(`${hours}-hour milestone added`);
	};

	const removeCustomMilestone = (hours) => {
		const updatedMilestones = customMilestones.filter((h) => h !== hours);
		setCustomMilestones(updatedMilestones);
		localStorage.setItem("customMilestones", JSON.stringify(updatedMilestones));
		showSnackbar(`${hours}-hour milestone removed`);
	};

	const handleDarkModeToggle = (enabled) => {
		setDarkMode(enabled);
		localStorage.setItem("darkMode", enabled.toString());
		showSnackbar(enabled ? "Dark mode enabled" : "Dark mode disabled");

		// Trigger theme update by dispatching custom event
		window.dispatchEvent(
			new CustomEvent("darkModeChanged", {
				detail: { darkMode: enabled },
			}),
		);
	};

	const showSnackbar = (message) => {
		setSnackbarMessage(message);
		setSnackbarOpen(true);
	};

	const handleExportData = () => {
		try {
			const fastHistory = JSON.parse(
				localStorage.getItem("fastHistory") || "[]",
			);
			const settings = {
				notificationsEnabled: localStorage.getItem("notificationsEnabled"),
				milestoneNotifications: localStorage.getItem("milestoneNotifications"),
				darkMode: localStorage.getItem("darkMode"),
				customMilestones: localStorage.getItem("customMilestones"),
				quietHoursEnabled: localStorage.getItem("quietHoursEnabled"),
				quietHoursStart: localStorage.getItem("quietHoursStart"),
				quietHoursEnd: localStorage.getItem("quietHoursEnd"),
				use12HourClock: localStorage.getItem("use12HourClock"),
			};

			const exportData = {
				version: "1.0",
				exportDate: new Date().toISOString(),
				fastHistory,
				settings,
			};

			const dataStr = JSON.stringify(exportData, null, 2);
			const dataBlob = new Blob([dataStr], { type: "application/json" });
			const url = URL.createObjectURL(dataBlob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `fasttrackr-export-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			showSnackbar("Data exported successfully!");
		} catch (error) {
			console.error("Export failed:", error);
			showSnackbar("Export failed. Please try again.");
		}
	};

	const handleImportData = () => {
		try {
			const data = JSON.parse(importData);

			if (!data.version || !data.fastHistory) {
				throw new Error("Invalid data format");
			}

			// Validate data structure
			if (!Array.isArray(data.fastHistory)) {
				throw new Error("Invalid fast history format");
			}

			// Import fast history
			const existingHistory = JSON.parse(
				localStorage.getItem("fastHistory") || "[]",
			);
			const mergedHistory = [...data.fastHistory, ...existingHistory];

			// Remove duplicates based on ID
			const uniqueHistory = mergedHistory.filter(
				(fast, index, self) =>
					index === self.findIndex((f) => f.id === fast.id),
			);

			// Sort by date
			uniqueHistory.sort(
				(a, b) => new Date(b.startTime) - new Date(a.startTime),
			);

			localStorage.setItem("fastHistory", JSON.stringify(uniqueHistory));

			// Import settings if available
			if (data.settings) {
				if (data.settings.notificationsEnabled !== undefined) {
					localStorage.setItem(
						"notificationsEnabled",
						data.settings.notificationsEnabled,
					);
				}
				if (data.settings.milestoneNotifications !== undefined) {
					localStorage.setItem(
						"milestoneNotifications",
						data.settings.milestoneNotifications,
					);
				}
				if (data.settings.darkMode !== undefined) {
					localStorage.setItem("darkMode", data.settings.darkMode);
					setDarkMode(data.settings.darkMode === "true");
				}
				if (data.settings.customMilestones !== undefined) {
					localStorage.setItem(
						"customMilestones",
						data.settings.customMilestones,
					);
					setCustomMilestones(
						JSON.parse(data.settings.customMilestones || "[]"),
					);
				}
				if (data.settings.quietHoursEnabled !== undefined) {
					localStorage.setItem(
						"quietHoursEnabled",
						data.settings.quietHoursEnabled,
					);
					setQuietHoursEnabled(data.settings.quietHoursEnabled === "true");
				}
				if (data.settings.quietHoursStart !== undefined) {
					localStorage.setItem(
						"quietHoursStart",
						data.settings.quietHoursStart,
					);
					setQuietHoursStart(data.settings.quietHoursStart);
				}
				if (data.settings.quietHoursEnd !== undefined) {
					localStorage.setItem("quietHoursEnd", data.settings.quietHoursEnd);
					setQuietHoursEnd(data.settings.quietHoursEnd);
				}
				if (data.settings.use12HourClock !== undefined) {
					localStorage.setItem("use12HourClock", data.settings.use12HourClock);
					setUse12HourClock(data.settings.use12HourClock === "true");
				}
			}

			setImportDialogOpen(false);
			setImportData("");
			showSnackbar(`Imported ${data.fastHistory.length} fasts successfully!`);

			// Refresh the page to reflect changes
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		} catch (error) {
			console.error("Import failed:", error);
			showSnackbar("Import failed. Please check your data format.");
		}
	};

	const handleClearAllData = () => {
		localStorage.removeItem("fastHistory");
		localStorage.removeItem("currentFast");
		localStorage.removeItem("notificationsEnabled");
		localStorage.removeItem("milestoneNotifications");
		localStorage.removeItem("darkMode");
		localStorage.removeItem("customMilestones");
		localStorage.removeItem("quietHoursEnabled");
		localStorage.removeItem("quietHoursStart");
		localStorage.removeItem("quietHoursEnd");
		localStorage.removeItem("use12HourClock");

		setClearDialogOpen(false);
		showSnackbar("All data cleared successfully!");

		// Refresh the page
		setTimeout(() => {
			window.location.reload();
		}, 1500);
	};

	const handleCheckForUpdates = async () => {
		try {
			showSnackbar("Checking for updates...");
			await updateUtils.checkForUpdates();
			// The UpdateNotification component will handle showing update notifications
			setTimeout(() => {
				showSnackbar("Update check completed");
			}, 2000);
		} catch (error) {
			console.error("Update check failed:", error);
			showSnackbar("Failed to check for updates");
		}
	};

	const handleForceRefresh = async () => {
		try {
			showSnackbar("Force refreshing app...");
			await updateUtils.forceRefresh();
		} catch (error) {
			console.error("Force refresh failed:", error);
			showSnackbar("Force refresh failed");
		}
	};

	const isCurrentlyInQuietHours = useCallback(() => {
		const now = new Date();
		const currentTime = now.getHours() * 60 + now.getMinutes();

		const [startHour, startMin] = quietHoursStart.split(":").map(Number);
		const [endHour, endMin] = quietHoursEnd.split(":").map(Number);

		const startTime = startHour * 60 + startMin;
		const endTime = endHour * 60 + endMin;

		// Handle case where quiet hours span midnight
		if (startTime > endTime) {
			return currentTime >= startTime || currentTime <= endTime;
		} else {
			return currentTime >= startTime && currentTime <= endTime;
		}
	}, [quietHoursStart, quietHoursEnd]);

	const getQuietHoursStatus = useCallback(() => {
		const isActive = isCurrentlyInQuietHours();

		if (isActive) {
			return `🔕 Quiet hours active (${quietHoursStart} - ${quietHoursEnd})`;
		} else {
			return `🔔 Notifications enabled (quiet hours: ${quietHoursStart} - ${quietHoursEnd})`;
		}
	}, [isCurrentlyInQuietHours, quietHoursStart, quietHoursEnd]);

	// Update quiet hours status every minute
	useEffect(() => {
		const updateStatus = () => {
			if (quietHoursEnabled) {
				setQuietHoursStatus(getQuietHoursStatus());
			}
		};

		updateStatus(); // Initial update
		const interval = setInterval(updateStatus, 60000); // Update every minute

		return () => clearInterval(interval);
	}, [quietHoursEnabled, getQuietHoursStatus]);

	const SettingCard = ({ title, icon, children }) => (
		<Card elevation={1}>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
					{icon}
					<Typography variant="h6">{title}</Typography>
				</Box>
				{children}
			</CardContent>
		</Card>
	);

	return (
		<Box sx={{ maxWidth: 600, mx: "auto" }}>
			<Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
				Settings
			</Typography>

			<Stack spacing={3}>
				{/* Notifications */}
				<SettingCard
					title="Notifications"
					icon={<NotificationIcon color="primary" />}
				>
					<Stack spacing={2}>
						<FormControlLabel
							control={
								<Switch
									checked={notificationsEnabled && permission === "granted"}
									onChange={(e) => handleNotificationToggle(e.target.checked)}
								/>
							}
							label="Enable Notifications"
						/>

						{permission === "denied" && (
							<Alert severity="warning" size="small">
								Notifications are blocked in your browser. Please enable them in
								your browser settings.
							</Alert>
						)}

						{permission === "granted" && notificationsEnabled && (
							<Alert severity="success" size="small">
								Notifications are enabled and working.
							</Alert>
						)}

						<FormControlLabel
							control={
								<Switch
									checked={milestoneNotifications}
									onChange={(e) => handleMilestoneToggle(e.target.checked)}
									disabled={!notificationsEnabled}
								/>
							}
							label="Milestone Notifications"
						/>

						{/* Custom Milestone Notifications */}
						{notificationsEnabled && milestoneNotifications && (
							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									Custom Milestone Notifications
								</Typography>

								{/* Add new milestone */}
								<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
									<TextField
										size="small"
										placeholder="Hours (e.g., 14)"
										value={newMilestone}
										onChange={(e) => setNewMilestone(e.target.value)}
										type="number"
										inputProps={{ min: 1, max: 168 }}
										sx={{ width: 150 }}
									/>
									<Button
										variant="outlined"
										size="small"
										startIcon={<AddIcon />}
										onClick={addCustomMilestone}
										disabled={!newMilestone}
									>
										Add
									</Button>
								</Stack>

								{/* Display existing milestones */}
								{customMilestones.length > 0 && (
									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ mb: 1 }}
										>
											Your custom milestones:
										</Typography>
										<Stack
											direction="row"
											spacing={1}
											flexWrap="wrap"
											sx={{ gap: 1 }}
										>
											{customMilestones.map((hours) => (
												<Chip
													key={hours}
													label={`${hours}h`}
													size="small"
													onDelete={() => removeCustomMilestone(hours)}
													deleteIcon={<CloseIcon />}
													color="primary"
													variant="outlined"
												/>
											))}
										</Stack>
									</Box>
								)}
							</Box>
						)}

						<Typography variant="body2" color="text.secondary">
							Get notified when you complete fasts and reach milestones like 16
							hours, 24 hours, etc.
						</Typography>

						{/* Quiet Hours */}
						{notificationsEnabled && (
							<Box sx={{ mt: 2 }}>
								<FormControlLabel
									control={
										<Switch
											checked={quietHoursEnabled}
											onChange={(e) => handleQuietHoursToggle(e.target.checked)}
										/>
									}
									label="Quiet Hours"
								/>

								{quietHoursEnabled && (
									<Box sx={{ mt: 2 }}>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ mb: 1 }}
										>
											Notifications will be disabled during these hours:
										</Typography>
										<Stack direction="row" spacing={2} sx={{ mt: 1 }}>
											<TextField
												label="Start Time"
												type="time"
												value={quietHoursStart}
												onChange={(e) =>
													handleQuietHoursStartChange(e.target.value)
												}
												size="small"
												InputLabelProps={{
													shrink: true,
												}}
											/>
											<TextField
												label="End Time"
												type="time"
												value={quietHoursEnd}
												onChange={(e) =>
													handleQuietHoursEndChange(e.target.value)
												}
												size="small"
												InputLabelProps={{
													shrink: true,
												}}
											/>
										</Stack>

										{/* Quiet Hours Status */}
										<Box
											sx={{
												mt: 2,
												p: 1,
												bgcolor: "background.default",
												borderRadius: 1,
											}}
										>
											<Typography variant="caption" color="text.secondary">
												Status: {quietHoursStatus}
											</Typography>
										</Box>
									</Box>
								)}
							</Box>
						)}
					</Stack>
				</SettingCard>

				{/* Appearance */}
				<SettingCard title="Appearance" icon={<DarkModeIcon color="primary" />}>
					<Stack spacing={2}>
						<FormControlLabel
							control={
								<Switch
									checked={darkMode}
									onChange={(e) => handleDarkModeToggle(e.target.checked)}
								/>
							}
							label="Dark Mode"
						/>

						<FormControlLabel
							control={
								<Switch
									checked={use12HourClock}
									onChange={(e) => handle12HourClockToggle(e.target.checked)}
								/>
							}
							label="12-Hour Clock"
						/>

						<FormControl>
							<InputLabel id="first-day-of-week-label">
								Week starts on
							</InputLabel>
							<Select
								labelId="first-day-of-week-label"
								id="first-day-of-week"
								value={firstDayOfWeek}
								onChange={(e) => handleFirstDayOfWeekChange(e.target.value)}
								label="First Day of Week"
							>
								<MenuItem value="sunday">Sunday</MenuItem>
								<MenuItem value="monday">Monday</MenuItem>
							</Select>
						</FormControl>

						<FormControlLabel
							control={
								<Switch
									checked={swipeGesturesEnabled}
									onChange={(e) => handleSwipeGesturesToggle(e.target.checked)}
								/>
							}
							label="Swipe Gestures on Timer"
						/>

						<Typography variant="body2" color="text.secondary">
							Toggle between light and dark themes for better viewing comfort.
							Use 12-hour or 24-hour time format for displaying times. Enable
							swipe gestures on the timer for quick start/stop actions on
							mobile.
						</Typography>
					</Stack>
				</SettingCard>

				{/* Goals */}
				<SettingCard title="Goals" icon={<GoalIcon color="primary" />}>
					<Stack spacing={2}>
						<Button
							variant="outlined"
							startIcon={<GoalIcon />}
							onClick={() => setShowGoalSettings(true)}
							fullWidth
						>
							Manage Fasting Goals
						</Button>

						<Typography variant="body2" color="text.secondary">
							Set personal fasting goals to stay motivated and track your
							progress over time.
						</Typography>
					</Stack>
				</SettingCard>

				{/* Support Developer */}
				<SupportDeveloper />

				{/* Data Management */}
				<SettingCard
					title="Data Management"
					icon={<InfoIcon color="primary" />}
				>
					<Stack spacing={2}>
						<Button
							variant="outlined"
							startIcon={<ExportIcon />}
							onClick={handleExportData}
							fullWidth
						>
							Export Data
						</Button>

						<Button
							variant="outlined"
							startIcon={<ImportIcon />}
							onClick={() => setImportDialogOpen(true)}
							fullWidth
						>
							Import Data
						</Button>

						<Divider />

						<Button
							variant="outlined"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={() => setClearDialogOpen(true)}
							fullWidth
						>
							Clear All Data
						</Button>

						<Typography variant="body2" color="text.secondary">
							Export your data to backup your fasting history. Import to restore
							from a backup.
						</Typography>
					</Stack>
				</SettingCard>

				{/* App Management */}
				<SettingCard
					title="App Management"
					icon={<UpdateIcon color="primary" />}
				>
					<Stack spacing={2}>
						<Button
							variant="outlined"
							startIcon={<UpdateIcon />}
							onClick={handleCheckForUpdates}
							fullWidth
						>
							Check for Updates
						</Button>

						<Button
							variant="outlined"
							color="warning"
							startIcon={<RefreshIcon />}
							onClick={handleForceRefresh}
							fullWidth
						>
							Force Refresh App
						</Button>

						{/* Debug: Reset Install Prompt */}
						{import.meta.env.DEV && (
							<Button
								variant="outlined"
								color="info"
								onClick={() => {
									localStorage.removeItem("appLaunchCount");
									localStorage.removeItem("installPromptNeverShow");
									showSnackbar("Install prompt settings reset (dev mode)");
								}}
								fullWidth
							>
								Reset Install Prompt (Dev)
							</Button>
						)}

						{/* Debug: Reset Initial Setup */}
						{import.meta.env.DEV && (
							<Button
								variant="outlined"
								color="info"
								onClick={() => {
									localStorage.removeItem("initialSetupCompleted");
									localStorage.removeItem("fasttrackr_first_visit");
									showSnackbar(
										"Initial setup reset - refresh to see setup dialog (dev mode)",
									);
								}}
								fullWidth
							>
								Reset Initial Setup (Dev)
							</Button>
						)}

						<Typography variant="body2" color="text.secondary">
							Check for updates manually or force refresh to clear all cached
							data and reload the latest version.
						</Typography>
					</Stack>
				</SettingCard>

				{/* App Info */}
				<Card elevation={1}>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							About FastTrackr
						</Typography>
						<Typography variant="body2" color="text.secondary" paragraph>
							FastTrackr is a Progressive Web App (PWA) designed to help you
							track your intermittent fasting journey. Install it on your device
							for the best experience!
						</Typography>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Version: 1.0.3
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Built with Material UI and React
							</Typography>
						</Box>
					</CardContent>
				</Card>
			</Stack>

			{/* Confirmation Dialogs */}
			<Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
				<DialogTitle>Clear All Data?</DialogTitle>
				<DialogContent>
					<Typography>
						This will permanently delete all your fasting history, current fast,
						and settings. This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleClearAllData} color="error">
						Clear All Data
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={importDialogOpen}
				onClose={() => setImportDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Import Data</DialogTitle>
				<DialogContent>
					<Typography variant="body2" sx={{ mb: 2 }}>
						Paste your exported FastTrackr data below:
					</Typography>
					<TextField
						multiline
						rows={10}
						fullWidth
						value={importData}
						onChange={(e) => setImportData(e.target.value)}
						placeholder="Paste your JSON data here..."
						variant="outlined"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleImportData}
						variant="contained"
						disabled={!importData.trim()}
					>
						Import
					</Button>
				</DialogActions>
			</Dialog>

			{/* Goal Settings Dialog */}
			<Dialog
				open={showGoalSettings}
				onClose={() => setShowGoalSettings(false)}
				maxWidth="lg"
				fullWidth
				PaperProps={{
					sx: {
						height: "90vh",
						maxHeight: "90vh",
					},
				}}
			>
				<DialogTitle>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography variant="h6">Fasting Goals</Typography>
						<IconButton onClick={() => setShowGoalSettings(false)}>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent sx={{ p: 0 }}>
					<GoalSettings />
				</DialogContent>
			</Dialog>

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={3000}
				onClose={() => setSnackbarOpen(false)}
				message={snackbarMessage}
			/>
		</Box>
	);
};

export default SettingsScreen;
