import { Box, Chip, Typography, useTheme } from "@mui/material";

const CircularProgressTimer = ({
	progress,
	isRunning,
	completed,
	displayTime,
	timeLabel,
	onTimeToggle,
	targetHours,
}) => {
	const theme = useTheme();

	// Constants for the progress ring
	const PROGRESS_RING_RADIUS = 108;
	const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;

	// Helper function to calculate stroke-dashoffset for circular progress
	const calculateStrokeDashOffset = (progressPercent) => {
		// For progress > 100%, show only the excess (e.g., 150% shows as 50%)
		const normalizedProgress =
			progressPercent > 100
				? (progressPercent % 100) / 100
				: progressPercent / 100;

		// Calculate offset: full circumference minus the progress portion
		return PROGRESS_RING_CIRCUMFERENCE * (1 - normalizedProgress);
	};

	return (
		<Box sx={{ textAlign: "center", py: 4 }}>
			<Box
				sx={{
					position: "relative",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					mb: 2,
				}}
			>
				{/* Custom SVG for gradient progress */}
				<svg width="240" height="240" style={{ transform: "rotate(-90deg)" }}>
					<title>Fasting Progress Ring</title>
					<defs>
						<linearGradient
							id="extendedGradient"
							gradientUnits="userSpaceOnUse"
							x1="0"
							y1="0"
							x2="240"
							y2="240"
						>
							<stop offset="0%" stopColor={theme.palette.success.main} />
							<stop offset="60%" stopColor={theme.palette.success.main} />
							<stop offset="90%" stopColor={theme.palette.warning.main} />
							<stop offset="100%" stopColor={theme.palette.warning.main} />
						</linearGradient>
					</defs>

					{/* Background circle */}
					<circle
						cx="120"
						cy="120"
						r={PROGRESS_RING_RADIUS}
						fill="none"
						stroke={theme.palette.grey[200]}
						strokeWidth="12"
					/>

					{/* Base circle when extended (faded) */}
					{isRunning && progress > 100 && (
						<circle
							cx="120"
							cy="120"
							r={PROGRESS_RING_RADIUS}
							fill="none"
							stroke={theme.palette.success.main}
							strokeWidth="12"
							strokeOpacity="0.4"
							strokeLinecap="round"
							strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
							strokeDashoffset="0"
						/>
					)}

					{/* Active progress circle */}
					{isRunning && (
						<circle
							cx="120"
							cy="120"
							r={PROGRESS_RING_RADIUS}
							fill="none"
							stroke={
								progress > 100
									? "url(#extendedGradient)"
									: completed
										? theme.palette.success.main
										: theme.palette.primary.main
							}
							strokeWidth="12"
							strokeLinecap="round"
							strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
							strokeDashoffset={calculateStrokeDashOffset(progress)}
							style={{
								transition: "stroke-dashoffset 0.3s ease",
							}}
						/>
					)}
				</svg>

				{/* Timer content in center */}
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
					}}
				>
					<Typography
						variant="h2"
						component="div"
						onClick={onTimeToggle}
						sx={{
							fontFamily: isRunning ? "monospace" : "inherit",
							fontWeight: "bold",
							color: isRunning
								? progress > 100
									? "warning.main"
									: completed
										? "success.main"
										: "primary.main"
								: "primary.main",
							fontSize: { xs: "1.75rem", sm: "2.25rem" },
							cursor: isRunning ? "pointer" : "default",
							userSelect: "none",
							transition: "transform 0.1s ease",
							"&:hover": isRunning
								? {
										transform: "scale(1.02)",
									}
								: {},
							"&:active": isRunning
								? {
										transform: "scale(0.98)",
									}
								: {},
						}}
					>
						{displayTime}
					</Typography>

					{timeLabel && isRunning && (
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{
								fontSize: "0.7rem",
								opacity: 0.8,
								mt: 0.5,
							}}
						>
							{timeLabel}
							{isRunning && " • Click to toggle"}
						</Typography>
					)}

					{isRunning && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mt: 1, fontSize: "0.8rem" }}
						>
							{Math.round(progress)}% {progress > 100 ? "Extended" : "Complete"}
						</Typography>
					)}
				</Box>
			</Box>

			{isRunning && (
				<>
					<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
						Target: {targetHours}:00:00
					</Typography>

					{completed && (
						<Chip
							label={
								progress > 100 ? "🔥 Target Exceeded!" : "🎉 Fast Complete!"
							}
							color={progress > 100 ? "warning" : "success"}
							variant="filled"
							sx={{ fontSize: "1rem", py: 2, px: 1 }}
						/>
					)}
				</>
			)}
		</Box>
	);
};

export default CircularProgressTimer;
