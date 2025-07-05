import {
	Cancel as CancelIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	ExpandMore as ExpandMoreIcon,
	PlayArrow as PlayIcon,
	Save as SaveIcon,
	Schedule as ScheduleIcon,
	Star as StarIcon,
	Stop as StopIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Fade,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Snackbar,
	Stack,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useFastTimer } from "../hooks/useFastTimer";
import { useNotifications } from "../hooks/useNotifications";
import CircularProgressTimer from "./CircularProgressTimer";

const TimerScreen = () => {
	const _theme = useTheme();
	const {
		isRunning,
		elapsedTime,
		targetDuration,
		startTime,
		startFast,
		stopFast,
		modifyStartTime,
		formatTime,
		getProgress,
		isCompleted,
	} = useFastTimer();

	const {
		showFastCompleteNotification,
		showCustomMilestoneNotification,
		getCustomMilestones,
	} = useNotifications();

	const [selectedDuration, setSelectedDuration] = useState(() => {
		const saved = localStorage.getItem("selectedDuration");
		return saved ? parseInt(saved) : 16;
	});
	const [customHours, setCustomHours] = useState(() => {
		return localStorage.getItem("customHours") || "";
	});
	const [showCustomInput, setShowCustomInput] = useState(() => {
		return localStorage.getItem("showCustomInput") === "true";
	});
	const [showStopConfirmation, setShowStopConfirmation] = useState(false);
	const [showNotesDialog, setShowNotesDialog] = useState(false);
	const [fastNote, setFastNote] = useState("");
	const [showRemainingTime, setShowRemainingTime] = useState(false);
	const [showStartTimeSection, setShowStartTimeSection] = useState(false);
	const [isEditingStartTime, setIsEditingStartTime] = useState(false);
	const [tempStartTime, setTempStartTime] = useState("");
	const [lastFastDuration, setLastFastDuration] = useState(() => {
		const history = JSON.parse(localStorage.getItem("fastHistory") || "[]");
		return history.length > 0
			? Math.floor(history[0].targetDuration / (1000 * 60 * 60))
			: null;
	});
	const [celebratedMilestones, setCelebratedMilestones] = useState(() => {
		// Load celebrated milestones from localStorage, tied to current fast
		const currentFast = JSON.parse(localStorage.getItem("currentFast") || "{}");
		if (currentFast.id) {
			const saved = localStorage.getItem(
				`celebratedMilestones_${currentFast.id}`,
			);
			return saved ? new Set(JSON.parse(saved)) : new Set();
		}
		return new Set();
	});
	const [showCelebration, setShowCelebration] = useState(false);
	const [celebrationMessage, setCelebrationMessage] = useState("");
	const [useCompactTimeFormat, setUseCompactTimeFormat] = useState(() => {
		return localStorage.getItem("useCompactTimeFormat") === "true";
	});
	const [notifiedCustomMilestones, setNotifiedCustomMilestones] = useState(
		() => {
			// Load notified custom milestones from localStorage, tied to current fast
			const currentFast = JSON.parse(
				localStorage.getItem("currentFast") || "{}",
			);
			if (currentFast.id) {
				const saved = localStorage.getItem(
					`notifiedCustomMilestones_${currentFast.id}`,
				);
				return saved ? new Set(JSON.parse(saved)) : new Set();
			}
			return new Set();
		},
	);
	const [use12HourClock, setUse12HourClock] = useState(() => {
		return localStorage.getItem("use12HourClock") !== "false";
	});
	const [swipeGesturesEnabled, setSwipeGesturesEnabled] = useState(() => {
		return localStorage.getItem("swipeGesturesEnabled") !== "false";
	});
	const [templates, setTemplates] = useState(() => {
		const saved = localStorage.getItem("fastTemplates");
		return saved ? JSON.parse(saved) : [];
	});
	const [showTemplateDialog, setShowTemplateDialog] = useState(false);
	const [newTemplateName, setNewTemplateName] = useState("");
	const [newTemplateDuration, setNewTemplateDuration] = useState("");

	const progress = getProgress();
	const completed = isCompleted();

	// Milestone celebration messages
	const milestoneMessages = {
		25: "Great start! 🌟 You're 25% there!",
		50: "Halfway there! 🎉 Keep going strong!",
		75: "Amazing progress! 💪 You're 75% complete!",
	};

	// Format time in compact format (16h 23m)
	const formatTimeCompact = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	};

	// Get formatted time based on user preference
	const getFormattedTime = (milliseconds) => {
		return useCompactTimeFormat
			? formatTimeCompact(milliseconds)
			: formatTime(milliseconds);
	};

	// Toggle time format and save preference
	const handleTimeFormatToggle = () => {
		const newFormat = !useCompactTimeFormat;
		setUseCompactTimeFormat(newFormat);
		localStorage.setItem("useCompactTimeFormat", newFormat.toString());
	};

	// Listen for changes to 12-hour clock and swipe gestures settings
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key === "use12HourClock") {
				setUse12HourClock(e.newValue !== "false");
			} else if (e.key === "swipeGesturesEnabled") {
				setSwipeGesturesEnabled(e.newValue !== "false");
			}
		};

		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	// Handle fast completion notification
	useEffect(() => {
		if (completed && isRunning) {
			showFastCompleteNotification(targetDuration);
		}
	}, [completed, isRunning, targetDuration, showFastCompleteNotification]);

	// Save celebrated milestones to localStorage when they change
	useEffect(() => {
		const currentFast = JSON.parse(localStorage.getItem("currentFast") || "{}");
		if (currentFast.id && celebratedMilestones.size > 0) {
			localStorage.setItem(
				`celebratedMilestones_${currentFast.id}`,
				JSON.stringify([...celebratedMilestones]),
			);
		}
	}, [celebratedMilestones]);

	// Save notified custom milestones to localStorage when they change
	useEffect(() => {
		const currentFast = JSON.parse(localStorage.getItem("currentFast") || "{}");
		if (currentFast.id && notifiedCustomMilestones.size > 0) {
			localStorage.setItem(
				`notifiedCustomMilestones_${currentFast.id}`,
				JSON.stringify([...notifiedCustomMilestones]),
			);
		}
	}, [notifiedCustomMilestones]);

	// Handle milestone celebrations
	useEffect(() => {
		if (!isRunning || progress === 0) return;

		const milestones = [25, 50, 75];

		for (const milestone of milestones) {
			if (progress >= milestone && !celebratedMilestones.has(milestone)) {
				setCelebratedMilestones((prev) => new Set([...prev, milestone]));
				setCelebrationMessage(milestoneMessages[milestone]);
				setShowCelebration(true);
				break; // Only show one celebration at a time
			}
		}
	}, [progress, isRunning, celebratedMilestones]);

	// Handle custom milestone notifications
	useEffect(() => {
		if (!isRunning || elapsedTime === 0) return;

		const customMilestones = getCustomMilestones();
		const currentHours = Math.floor(elapsedTime / (1000 * 60 * 60));

		for (const milestoneHours of customMilestones) {
			if (
				currentHours >= milestoneHours &&
				!notifiedCustomMilestones.has(milestoneHours)
			) {
				setNotifiedCustomMilestones(
					(prev) => new Set([...prev, milestoneHours]),
				);
				showCustomMilestoneNotification(milestoneHours);
			}
		}
	}, [
		elapsedTime,
		isRunning,
		getCustomMilestones,
		showCustomMilestoneNotification,
		notifiedCustomMilestones,
	]);

	// Reset celebrated milestones when starting a new fast
	useEffect(() => {
		if (isRunning && progress < 5) {
			setCelebratedMilestones(new Set());
			setNotifiedCustomMilestones(new Set());

			// Clear localStorage entries for milestone celebrations
			const currentFast = JSON.parse(
				localStorage.getItem("currentFast") || "{}",
			);
			if (currentFast.id) {
				localStorage.removeItem(`celebratedMilestones_${currentFast.id}`);
				localStorage.removeItem(`notifiedCustomMilestones_${currentFast.id}`);
			}
		}
	}, [isRunning, progress]);

	const handleStart = () => {
		const duration = showCustomInput ? parseInt(customHours) : selectedDuration;
		if (showCustomInput && (!duration || duration <= 0)) {
			alert("Please enter a valid duration in hours");
			return;
		}
		startFast(duration);
		setLastFastDuration(duration);
		setCelebratedMilestones(new Set()); // Reset celebrations for new fast
		setNotifiedCustomMilestones(new Set()); // Reset custom milestone notifications

		// Clear localStorage entries for milestone celebrations from previous fast
		setTimeout(() => {
			const currentFast = JSON.parse(
				localStorage.getItem("currentFast") || "{}",
			);
			if (currentFast.id) {
				localStorage.removeItem(`celebratedMilestones_${currentFast.id}`);
				localStorage.removeItem(`notifiedCustomMilestones_${currentFast.id}`);
			}
		}, 100); // Small delay to ensure currentFast is updated
	};

	const handleQuickRestart = () => {
		if (lastFastDuration) {
			startFast(lastFastDuration);
			setCelebratedMilestones(new Set()); // Reset celebrations for new fast
			setNotifiedCustomMilestones(new Set()); // Reset custom milestone notifications

			// Clear localStorage entries for milestone celebrations from previous fast
			setTimeout(() => {
				const currentFast = JSON.parse(
					localStorage.getItem("currentFast") || "{}",
				);
				if (currentFast.id) {
					localStorage.removeItem(`celebratedMilestones_${currentFast.id}`);
					localStorage.removeItem(`notifiedCustomMilestones_${currentFast.id}`);
				}
			}, 100); // Small delay to ensure currentFast is updated
		}
	};

	const handleStopClick = () => {
		setShowStopConfirmation(true);
	};

	const handleConfirmStop = () => {
		// Show notes dialog instead of immediately stopping
		setShowStopConfirmation(false);
		setShowNotesDialog(true);
	};

	const handleFinalStop = () => {
		const stoppedFast = stopFast(fastNote);
		if (stoppedFast) {
			setLastFastDuration(
				Math.floor(stoppedFast.targetDuration / (1000 * 60 * 60)),
			);
		}
		setShowNotesDialog(false);
		setFastNote("");
	};

	const handleCancelNotes = () => {
		setShowNotesDialog(false);
		setFastNote("");
	};

	const handleCancelStop = () => {
		setShowStopConfirmation(false);
	};

	const handleDurationChange = (value) => {
		if (value === "custom") {
			setShowCustomInput(true);
			localStorage.setItem("showCustomInput", "true");
		} else {
			setSelectedDuration(value);
			setShowCustomInput(false);
			localStorage.setItem("selectedDuration", value.toString());
			localStorage.setItem("showCustomInput", "false");
		}
	};

	const handleTimeDisplayToggle = () => {
		if (isRunning) {
			setShowRemainingTime(!showRemainingTime);
		}
	};

	const getRemainingTime = () => {
		if (!isRunning || completed) return 0;
		const remaining = targetDuration - elapsedTime;
		return Math.max(0, remaining);
	};

	const getDisplayTime = () => {
		if (!isRunning) return 0;
		// If fast is completed, always show elapsed time
		if (completed) return elapsedTime;
		return showRemainingTime ? getRemainingTime() : elapsedTime;
	};

	const getTimeLabel = () => {
		if (!isRunning) return "";
		// If fast is completed, always show elapsed
		if (completed) return "Elapsed";
		return showRemainingTime ? "Remaining" : "Elapsed";
	};

	const getEstimatedEndTime = () => {
		if (!isRunning || !startTime) return "";
		const endTime = new Date(startTime.getTime() + targetDuration);
		return endTime.toLocaleString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: use12HourClock,
		});
	};

	const handleEditStartTime = () => {
		if (startTime) {
			// Format the current start time for the datetime-local input
			const localTime = new Date(
				startTime.getTime() - startTime.getTimezoneOffset() * 60000,
			)
				.toISOString()
				.slice(0, 16);
			setTempStartTime(localTime);
			setIsEditingStartTime(true);
		}
	};

	const handleSaveStartTime = () => {
		if (tempStartTime) {
			const newStartTime = new Date(tempStartTime);
			modifyStartTime(newStartTime);
			setIsEditingStartTime(false);
			setTempStartTime("");
		}
	};

	const handleCancelEditStartTime = () => {
		setIsEditingStartTime(false);
		setTempStartTime("");
	};

	const formatStartTime = (date) => {
		if (!date) return "";
		return date.toLocaleString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: use12HourClock,
		});
	};

	const targetHours = Math.floor(targetDuration / (1000 * 60 * 60));

	// Template management functions
	const saveTemplate = useCallback(() => {
		if (!newTemplateName.trim()) {
			alert("Please enter a template name");
			return;
		}

		const duration = parseInt(newTemplateDuration);
		if (!duration || duration <= 0 || duration > 168) {
			alert("Please enter a valid duration (1-168 hours)");
			return;
		}

		const template = {
			id: Date.now(),
			name: newTemplateName.trim(),
			duration: duration,
			createdAt: new Date().toISOString(),
		};

		const updatedTemplates = [...templates, template];
		setTemplates(updatedTemplates);
		localStorage.setItem("fastTemplates", JSON.stringify(updatedTemplates));

		setNewTemplateName("");
		setNewTemplateDuration("");
		setShowTemplateDialog(false);
	}, [newTemplateName, newTemplateDuration, templates]);

	const deleteTemplate = useCallback(
		(templateId) => {
			if (window.confirm("Are you sure you want to delete this template?")) {
				const updatedTemplates = templates.filter((t) => t.id !== templateId);
				setTemplates(updatedTemplates);
				localStorage.setItem("fastTemplates", JSON.stringify(updatedTemplates));
			}
		},
		[templates],
	);

	const applyTemplate = useCallback((template) => {
		const standardDurations = [12, 16, 18, 20, 24];
		const isStandardDuration = standardDurations.includes(template.duration);

		// Always update both states, but only one will be used
		setSelectedDuration(isStandardDuration ? template.duration : 16);
		setCustomHours(template.duration.toString());
		setShowCustomInput(!isStandardDuration);

		// Update localStorage accordingly
		if (isStandardDuration) {
			localStorage.setItem("selectedDuration", template.duration.toString());
			localStorage.setItem("showCustomInput", "false");
		} else {
			localStorage.setItem("customHours", template.duration.toString());
			localStorage.setItem("showCustomInput", "true");
		}
	}, []);

	const saveCurrentAsTemplate = useCallback(() => {
		const duration = showCustomInput ? parseInt(customHours) : selectedDuration;
		if (!duration || duration <= 0) {
			alert("Please select a valid duration first");
			return;
		}

		setNewTemplateDuration(duration.toString());
		setShowTemplateDialog(true);
	}, [showCustomInput, customHours, selectedDuration]);

	return (
		<Box sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
			<Stack spacing={3}>
				{/* Timer Display */}
				<Card elevation={2}>
					<CircularProgressTimer
						progress={progress}
						isRunning={isRunning}
						completed={completed}
						displayTime={
							isRunning ? getFormattedTime(getDisplayTime()) : "Ready to fast?"
						}
						timeLabel={getTimeLabel()}
						onTimeToggle={handleTimeDisplayToggle}
						targetHours={targetHours}
						onSwipeStart={
							swipeGesturesEnabled && !isRunning ? handleStart : undefined
						}
						onSwipeStop={
							swipeGesturesEnabled && isRunning ? handleStopClick : undefined
						}
					/>

					{/* Estimated End Time and Time Format Toggle */}
					{isRunning && (
						<Box sx={{ textAlign: "center", pb: 2 }}>
							<Typography variant="caption" color="text.secondary">
								Ends at {getEstimatedEndTime()}
							</Typography>
							<Box sx={{ mt: 1 }}>
								<Button
									size="small"
									variant="text"
									onClick={handleTimeFormatToggle}
									sx={{
										fontSize: "0.7rem",
										minWidth: "auto",
										textTransform: "none",
										color: "text.secondary",
									}}
								>
									{useCompactTimeFormat ? "Show HH:MM:SS" : "Show compact"}
								</Button>
							</Box>
						</Box>
					)}
				</Card>

				{/* Start Time Section */}
				{isRunning && (
					<Card elevation={1}>
						<CardContent>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									mb: 1,
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<ScheduleIcon color="primary" fontSize="small" />
									<Typography variant="h6">Start Time</Typography>
								</Box>
								<IconButton
									size="small"
									onClick={() => setShowStartTimeSection(!showStartTimeSection)}
									sx={{
										transform: showStartTimeSection
											? "rotate(180deg)"
											: "rotate(0deg)",
										transition: "transform 0.2s ease",
									}}
								>
									<ExpandMoreIcon />
								</IconButton>
							</Box>

							<Collapse in={showStartTimeSection}>
								<Box sx={{ pt: 2 }}>
									{!isEditingStartTime ? (
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												gap: 2,
											}}
										>
											<Typography
												variant="body1"
												sx={{ fontFamily: "monospace" }}
											>
												{startTime ? formatStartTime(startTime) : "Not set"}
											</Typography>
											<Button
												size="small"
												startIcon={<EditIcon />}
												onClick={handleEditStartTime}
												variant="outlined"
											>
												Edit
											</Button>
										</Box>
									) : (
										<Stack spacing={2}>
											<TextField
												label="Start Time"
												type="datetime-local"
												value={tempStartTime}
												onChange={(e) => setTempStartTime(e.target.value)}
												fullWidth
												size="small"
												InputLabelProps={{
													shrink: true,
												}}
											/>
											<Stack
												direction="row"
												spacing={1}
												justifyContent="flex-end"
											>
												<Button
													size="small"
													startIcon={<CancelIcon />}
													onClick={handleCancelEditStartTime}
												>
													Cancel
												</Button>
												<Button
													size="small"
													variant="contained"
													startIcon={<SaveIcon />}
													onClick={handleSaveStartTime}
												>
													Save
												</Button>
											</Stack>
										</Stack>
									)}
								</Box>
							</Collapse>
						</CardContent>
					</Card>
				)}

				{/* Timer Controls */}
				<Card elevation={1}>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Controls
						</Typography>

						<Stack
							direction="row"
							spacing={2}
							justifyContent="center"
							sx={{ mb: 3 }}
						>
							{!isRunning ? (
								<>
									<Button
										variant="contained"
										size="large"
										startIcon={<PlayIcon />}
										onClick={handleStart}
										sx={{ minWidth: 140 }}
									>
										Start Fast
									</Button>

									{/* Quick Restart Button */}
									{lastFastDuration && (
										<Button
											variant="outlined"
											size="large"
											startIcon={<PlayIcon />}
											onClick={handleQuickRestart}
											sx={{ minWidth: 140 }}
										>
											Restart {lastFastDuration}h
										</Button>
									)}
								</>
							) : (
								<Button
									variant="contained"
									color="error"
									size="large"
									startIcon={<StopIcon />}
									onClick={handleStopClick}
								>
									Stop Fast
								</Button>
							)}
						</Stack>
					</CardContent>
				</Card>

				{/* Duration Setup */}
				{!isRunning && (
					<Fade in={!isRunning}>
						<Card elevation={1}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Fast Duration
								</Typography>

								<Stack spacing={2}>
									<FormControl fullWidth>
										<InputLabel>Duration</InputLabel>
										<Select
											value={showCustomInput ? "custom" : selectedDuration}
											label="Duration"
											onChange={(e) => handleDurationChange(e.target.value)}
										>
											<MenuItem value={12}>12 hours</MenuItem>
											<MenuItem value={16}>16 hours (Recommended)</MenuItem>
											<MenuItem value={18}>18 hours</MenuItem>
											<MenuItem value={20}>20 hours</MenuItem>
											<MenuItem value={24}>24 hours</MenuItem>
											<MenuItem value="custom">Custom</MenuItem>
										</Select>
									</FormControl>

									{showCustomInput && (
										<Fade in={showCustomInput}>
											<TextField
												label="Custom Hours"
												type="number"
												value={customHours}
												onChange={(e) => {
													setCustomHours(e.target.value);
													localStorage.setItem("customHours", e.target.value);
												}}
												inputProps={{ min: 1, max: 168 }}
												helperText="Enter hours (1-168)"
												fullWidth
											/>
										</Fade>
									)}

									{/* Save Current as Template Button */}
									<Box
										sx={{ display: "flex", justifyContent: "center", mt: 2 }}
									>
										<Button
											variant="outlined"
											startIcon={<StarIcon />}
											onClick={saveCurrentAsTemplate}
											size="small"
										>
											Save as Template
										</Button>
									</Box>

									{/* Template Selection */}
									{templates.length > 0 && (
										<Box sx={{ mt: 3 }}>
											<Typography variant="subtitle2" gutterBottom>
												Quick Templates
											</Typography>
											<Stack spacing={1}>
												{templates.map((template) => (
													<Box
														key={template.id}
														sx={{
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
															p: 1,
															border: 1,
															borderColor: "divider",
															borderRadius: 1,
														}}
													>
														<Box sx={{ flex: 1 }}>
															<Typography variant="body2" fontWeight="medium">
																{template.name}
															</Typography>
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{template.duration}h duration
															</Typography>
														</Box>
														<Stack direction="row" spacing={1}>
															<Button
																size="small"
																onClick={() => applyTemplate(template)}
																variant="outlined"
															>
																Use
															</Button>
															<IconButton
																size="small"
																onClick={() => deleteTemplate(template.id)}
																color="error"
															>
																<DeleteIcon fontSize="small" />
															</IconButton>
														</Stack>
													</Box>
												))}
											</Stack>
										</Box>
									)}
								</Stack>
							</CardContent>
						</Card>
					</Fade>
				)}

				{/* Fasting Tips */}
				{!isRunning && (
					<Card elevation={1} sx={{ backgroundColor: "background.default" }}>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								💡 Fasting Tips
							</Typography>
							<Typography variant="body2" color="text.secondary">
								• Stay hydrated with water, herbal tea, or black coffee
								<br />• Listen to your body and stop if you feel unwell
								<br />• Start with shorter fasts and gradually increase duration
								<br />• Break your fast with nutritious, easy-to-digest foods
							</Typography>
						</CardContent>
					</Card>
				)}

				{/* Stop Confirmation Dialog */}
				<Dialog
					open={showStopConfirmation}
					onClose={handleCancelStop}
					aria-labelledby="stop-confirmation-title"
					aria-describedby="stop-confirmation-description"
				>
					<DialogTitle id="stop-confirmation-title">Stop Fast?</DialogTitle>
					<DialogContent>
						<DialogContentText id="stop-confirmation-description">
							Are you sure you want to stop your fast? Your progress will be
							saved to your history.
						</DialogContentText>
						{elapsedTime > 0 && (
							<DialogContentText sx={{ mt: 2, fontWeight: "medium" }}>
								Current time: {formatTime(elapsedTime)}
							</DialogContentText>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCancelStop} color="primary">
							Cancel
						</Button>
						<Button
							onClick={handleConfirmStop}
							color="error"
							variant="contained"
						>
							Stop Fast
						</Button>
					</DialogActions>
				</Dialog>

				{/* Notes Dialog */}
				<Dialog
					open={showNotesDialog}
					onClose={handleCancelNotes}
					aria-labelledby="notes-dialog-title"
					aria-describedby="notes-dialog-description"
				>
					<DialogTitle id="notes-dialog-title">Fast Notes</DialogTitle>
					<DialogContent>
						<DialogContentText id="notes-dialog-description">
							Please provide a note for your fast:
						</DialogContentText>
						<TextField
							label="Note"
							multiline
							rows={4}
							value={fastNote}
							onChange={(e) => setFastNote(e.target.value)}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCancelNotes} color="primary">
							Cancel
						</Button>
						<Button
							onClick={handleFinalStop}
							color="primary"
							variant="contained"
						>
							Save
						</Button>
					</DialogActions>
				</Dialog>

				{/* Milestone Celebration Snackbar */}
				<Snackbar
					open={showCelebration}
					autoHideDuration={4000}
					onClose={() => setShowCelebration(false)}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert
						onClose={() => setShowCelebration(false)}
						severity="success"
						variant="filled"
						sx={{ width: "100%" }}
					>
						{celebrationMessage}
					</Alert>
				</Snackbar>

				{/* Template Creation Dialog */}
				<Dialog
					open={showTemplateDialog}
					onClose={() => setShowTemplateDialog(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>Save Fast Template</DialogTitle>
					<DialogContent>
						<Stack spacing={2} sx={{ mt: 1 }}>
							<TextField
								label="Template Name"
								value={newTemplateName}
								onChange={(e) => setNewTemplateName(e.target.value)}
								placeholder="e.g., Weekend 24h, Weekday 16h"
								fullWidth
								autoFocus
							/>
							<TextField
								label="Duration (hours)"
								type="number"
								value={newTemplateDuration}
								onChange={(e) => setNewTemplateDuration(e.target.value)}
								inputProps={{ min: 1, max: 168 }}
								fullWidth
							/>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
						<Button onClick={saveTemplate} variant="contained">
							Save Template
						</Button>
					</DialogActions>
				</Dialog>
			</Stack>
		</Box>
	);
};

export default TimerScreen;
