import {
	Cancel as CancelIcon,
	Edit as EditIcon,
	ExpandMore as ExpandMoreIcon,
	PlayArrow as PlayIcon,
	Save as SaveIcon,
	Schedule as ScheduleIcon,
	Stop as StopIcon,
} from "@mui/icons-material";
import {
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
	Stack,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
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

	const { showFastCompleteNotification } = useNotifications();

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
	const [showRemainingTime, setShowRemainingTime] = useState(false);
	const [showStartTimeSection, setShowStartTimeSection] = useState(false);
	const [isEditingStartTime, setIsEditingStartTime] = useState(false);
	const [tempStartTime, setTempStartTime] = useState("");

	const progress = getProgress();
	const completed = isCompleted();

	// Handle fast completion notification
	useEffect(() => {
		if (completed && isRunning) {
			showFastCompleteNotification(targetDuration);
		}
	}, [completed, isRunning, targetDuration, showFastCompleteNotification]);

	const handleStart = () => {
		const duration = showCustomInput ? parseInt(customHours) : selectedDuration;
		if (showCustomInput && (!duration || duration <= 0)) {
			alert("Please enter a valid duration in hours");
			return;
		}
		startFast(duration);
	};

	const handleStopClick = () => {
		setShowStopConfirmation(true);
	};

	const handleConfirmStop = () => {
		stopFast();
		setShowStopConfirmation(false);
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
			hour12: true,
		});
	};

	const targetHours = Math.floor(targetDuration / (1000 * 60 * 60));

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
							isRunning ? formatTime(getDisplayTime()) : "Ready to fast?"
						}
						timeLabel={getTimeLabel()}
						onTimeToggle={handleTimeDisplayToggle}
						targetHours={targetHours}
					/>
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
								<Button
									variant="contained"
									size="large"
									startIcon={<PlayIcon />}
									onClick={handleStart}
									sx={{ minWidth: 140 }}
								>
									Start Fast
								</Button>
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
			</Stack>
		</Box>
	);
};

export default TimerScreen;
