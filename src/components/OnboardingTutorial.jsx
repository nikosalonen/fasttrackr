import {
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
	CalendarMonth as CalendarIcon,
	Close as CloseIcon,
	Flag as GoalIcon,
	Notifications as NotificationIcon,
	PlayArrow as PlayIcon,
	Schedule as ScheduleIcon,
	Settings as SettingsIcon,
	Assessment as StatsIcon,
	Swipe as SwipeIcon,
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
	Fade,
	IconButton,
	LinearProgress,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const OnboardingTutorial = ({ open, onClose, onTabChange }) => {
	const theme = useTheme();
	const [currentStep, setCurrentStep] = useState(0);
	const [showOverlay, setShowOverlay] = useState(false);

	const tutorialSteps = [
		{
			title: "Welcome to FastTrackr! 🎉",
			content:
				"Let's take a quick tour to help you get started with your intermittent fasting journey.",
			icon: <PlayIcon sx={{ fontSize: 48, color: "primary.main" }} />,
			action: null,
			highlight: null,
		},
		{
			title: "Starting Your First Fast ⏰",
			content:
				"The timer is the heart of FastTrackr. Choose your fasting duration (16 hours is recommended for beginners) and tap 'Start Fast' to begin.",
			icon: <PlayIcon sx={{ fontSize: 48, color: "primary.main" }} />,
			action: () => onTabChange && onTabChange(0),
			highlight: "timer",
		},
		{
			title: "Swipe Gestures 📱",
			content:
				"On mobile, you can swipe right or up on the timer to start a fast, and swipe left or down to stop. This makes it super quick to control your fasts!",
			icon: <SwipeIcon sx={{ fontSize: 48, color: "secondary.main" }} />,
			action: null,
			highlight: "timer",
		},
		{
			title: "Track Your Progress 📊",
			content:
				"The circular progress ring shows your fasting progress. It changes colors as you progress: blue for start, orange for halfway, green for completion!",
			icon: <ScheduleIcon sx={{ fontSize: 48, color: "warning.main" }} />,
			action: null,
			highlight: "timer",
		},
		{
			title: "View Your History 📋",
			content:
				"All your completed fasts are saved in the History tab. You can view, edit, or delete past fasts, and search through your fasting journey.",
			icon: <ScheduleIcon sx={{ fontSize: 48, color: "info.main" }} />,
			action: () => onTabChange && onTabChange(1),
			highlight: "history",
		},
		{
			title: "Calendar View 📅",
			content:
				"See your fasting patterns at a glance! The calendar shows which days you fasted, completion status, and monthly statistics.",
			icon: <CalendarIcon sx={{ fontSize: 48, color: "success.main" }} />,
			action: () => onTabChange && onTabChange(2),
			highlight: "calendar",
		},
		{
			title: "Statistics & Insights 📈",
			content:
				"Track your progress with detailed statistics including completion rates, streaks, achievements, and weekly/monthly trends.",
			icon: <StatsIcon sx={{ fontSize: 48, color: "error.main" }} />,
			action: () => onTabChange && onTabChange(3),
			highlight: "stats",
		},
		{
			title: "Settings & Goals 🎯",
			content:
				"Customize your experience! Set up notifications, create fasting goals, manage templates, and export your data.",
			icon: <SettingsIcon sx={{ fontSize: 48, color: "secondary.main" }} />,
			action: () => onTabChange && onTabChange(4),
			highlight: "settings",
		},
		{
			title: "Notifications 🔔",
			content:
				"Enable notifications to get alerted when your fast is complete and when you reach milestones like 16 or 24 hours. You can even set custom milestones!",
			icon: <NotificationIcon sx={{ fontSize: 48, color: "warning.main" }} />,
			action: null,
			highlight: "settings",
		},
		{
			title: "Set Goals 🏆",
			content:
				"Stay motivated by setting weekly or monthly fasting goals. Track completion rates, number of fasts, or total fasting hours.",
			icon: <GoalIcon sx={{ fontSize: 48, color: "primary.main" }} />,
			action: null,
			highlight: "settings",
		},
		{
			title: "Pro Tips 💡",
			content:
				"• Start with shorter fasts (12-14h) and gradually increase\n• Stay hydrated with water, herbal tea, or black coffee\n• Listen to your body and stop if you feel unwell\n• Break fasts with nutritious, easy-to-digest foods",
			icon: <PlayIcon sx={{ fontSize: 48, color: "success.main" }} />,
			action: null,
			highlight: null,
		},
		{
			title: "You're All Set! 🚀",
			content:
				"That's it! You're ready to start your fasting journey. Remember, consistency is key. Start with what feels comfortable and gradually build up your fasting duration.",
			icon: <PlayIcon sx={{ fontSize: 48, color: "primary.main" }} />,
			action: () => onTabChange && onTabChange(0),
			highlight: null,
		},
	];

	const currentStepData = tutorialSteps[currentStep];
	const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

	useEffect(() => {
		if (open && currentStepData.action) {
			// Small delay to let dialog open first
			setTimeout(() => {
				currentStepData.action();
			}, 300);
		}
	}, [open, currentStepData.action]);

	useEffect(() => {
		setShowOverlay(open && currentStepData.highlight);
	}, [open, currentStepData.highlight]);

	const handleNext = () => {
		if (currentStep < tutorialSteps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			handleComplete();
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleComplete = () => {
		// Mark tutorial as completed
		localStorage.setItem("onboardingCompleted", "true");
		setCurrentStep(0);
		onClose();
	};

	const handleSkip = () => {
		localStorage.setItem("onboardingCompleted", "true");
		setCurrentStep(0);
		onClose();
	};

	return (
		<>
			{/* Tutorial Dialog */}
			<Dialog
				open={open}
				onClose={handleSkip}
				maxWidth="sm"
				fullWidth
				sx={{
					zIndex: 2100, // Higher than MUI modal backdrop (1300) and our overlay
				}}
				PaperProps={{
					sx: {
						borderRadius: 2,
						mx: 1,
						position: "relative",
						zIndex: 2101, // Ensure dialog content is above everything
					},
				}}
			>
				<DialogTitle component="div" sx={{ textAlign: "center", pb: 1 }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 2,
						}}
					>
						<Typography variant="h6" component="h2" sx={{ flex: 1 }}>
							FastTrackr Tutorial
						</Typography>
						<IconButton
							onClick={handleSkip}
							sx={{ color: "grey.500" }}
							aria-label="Skip tutorial"
						>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Progress Bar */}
					<Box sx={{ mb: 2 }}>
						<LinearProgress
							variant="determinate"
							value={progress}
							sx={{
								height: 6,
								borderRadius: 3,
								backgroundColor: "grey.200",
								"& .MuiLinearProgress-bar": {
									borderRadius: 3,
								},
							}}
						/>
						<Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
							Step {currentStep + 1} of {tutorialSteps.length}
						</Typography>
					</Box>
				</DialogTitle>

				<DialogContent>
					<Fade in={true} key={currentStep}>
						<Card
							elevation={0}
							sx={{
								bgcolor: "background.default",
								border: `1px solid ${theme.palette.divider}`,
							}}
						>
							<CardContent sx={{ textAlign: "center", py: 4 }}>
								{/* Step Icon */}
								<Box sx={{ mb: 3 }}>{currentStepData.icon}</Box>

								{/* Step Title */}
								<Typography
									variant="h5"
									component="h3"
									fontWeight="bold"
									color="primary.main"
									sx={{ mb: 2 }}
								>
									{currentStepData.title}
								</Typography>

								{/* Step Content */}
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{
										lineHeight: 1.6,
										whiteSpace: "pre-line",
										maxWidth: 400,
										mx: "auto",
									}}
								>
									{currentStepData.content}
								</Typography>

								{/* Special highlight for current feature */}
								{currentStepData.highlight && (
									<Box
										sx={{
											mt: 3,
											p: 2,
											bgcolor: "primary.50",
											borderRadius: 1,
											border: `1px solid ${theme.palette.primary.main}20`,
										}}
									>
										<Typography
											variant="body2"
											color="primary.main"
											fontWeight="medium"
										>
											💡 Look for the highlighted area in the app!
										</Typography>
									</Box>
								)}
							</CardContent>
						</Card>
					</Fade>
				</DialogContent>

				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Stack
						direction="row"
						spacing={2}
						justifyContent="space-between"
						sx={{ width: "100%" }}
					>
						{/* Back Button */}
						<Button
							onClick={handleBack}
							disabled={currentStep === 0}
							startIcon={<ArrowBackIcon />}
							sx={{ minWidth: 100 }}
						>
							Back
						</Button>

						{/* Skip Button */}
						<Button
							onClick={handleSkip}
							color="inherit"
							sx={{ textTransform: "none" }}
						>
							Skip Tutorial
						</Button>

						{/* Next/Complete Button */}
						<Button
							onClick={handleNext}
							variant="contained"
							endIcon={
								currentStep === tutorialSteps.length - 1 ? (
									<PlayIcon />
								) : (
									<ArrowForwardIcon />
								)
							}
							sx={{ minWidth: 100 }}
						>
							{currentStep === tutorialSteps.length - 1
								? "Get Started"
								: "Next"}
						</Button>
					</Stack>
				</DialogActions>
			</Dialog>

			{/* Highlight Overlay */}
			{showOverlay && (
				<Box
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 2099, // Below the dialog but above everything else
						pointerEvents: "none",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							width: "90%",
							maxWidth: 600,
							height: "60%",
							border: `3px solid ${theme.palette.primary.main}`,
							borderRadius: 2,
							boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
							animation: "pulse 2s infinite",
							"@keyframes pulse": {
								"0%": {
									boxShadow: `0 0 0 0 ${theme.palette.primary.main}40, 0 0 0 9999px rgba(0, 0, 0, 0.5)`,
								},
								"70%": {
									boxShadow: `0 0 0 10px ${theme.palette.primary.main}00, 0 0 0 9999px rgba(0, 0, 0, 0.5)`,
								},
								"100%": {
									boxShadow: `0 0 0 0 ${theme.palette.primary.main}00, 0 0 0 9999px rgba(0, 0, 0, 0.5)`,
								},
							},
						}}
					/>
				</Box>
			)}
		</>
	);
};

export default OnboardingTutorial;
