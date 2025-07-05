import { Box, Chip, Typography, useTheme } from "@mui/material";

const CircularProgressTimer = ({
	progress,
	isRunning,
	completed,
	displayTime,
	timeLabel,
	onTimeToggle,
	targetHours,
	size = 300,
	strokeWidth = 12,
}) => {
	const theme = useTheme();

	// Calculate dynamic dimensions based on props
	const svgSize = size;
	const center = svgSize / 2;
	const radius = center - strokeWidth * 2; // Leave some padding for the stroke
	const circumference = 2 * Math.PI * radius;

	// Helper function to calculate stroke-dashoffset for circular progress
	const calculateStrokeDashOffset = (progressPercent) => {
		// For progress > 100%, show only the excess (e.g., 150% shows as 50%)
		const normalizedProgress =
			progressPercent > 100
				? (progressPercent % 100) / 100
				: progressPercent / 100;

		// Calculate offset: full circumference minus the progress portion
		return circumference * (1 - normalizedProgress);
	};

	// Helper function to get timer display styles based on current state
	const getTimerDisplayStyles = (isRunning, progress, completed) => {
		const baseStyles = {
			fontFamily: isRunning ? "monospace" : "inherit",
			fontWeight: "bold",
			fontSize: { xs: "2rem", sm: "2.5rem", md: "2.75rem" }, // Increased font sizes for better visibility in larger circle
			cursor: isRunning ? "pointer" : "default",
			userSelect: "none",
			transition: "transform 0.1s ease",
			lineHeight: 1.1, // Tighter line height for better fitting
		};

		// Button reset styles when component is rendered as button
		const buttonResetStyles = isRunning
			? {
					background: "none",
					border: "none",
					padding: 0,
					margin: 0,
					outline: "none",
					textAlign: "inherit",
					"&:focus-visible": {
						outline: "2px solid",
						outlineColor: "primary.main",
						outlineOffset: "2px",
					},
				}
			: {};

		// Determine color based on state
		let color = "primary.main";
		if (isRunning) {
			if (progress > 100) {
				color = "warning.main";
			} else if (completed) {
				color = "success.main";
			}
		}

		// Add interactive styles only when running
		const interactiveStyles = isRunning
			? {
					"&:hover": {
						transform: "scale(1.02)",
					},
					"&:active": {
						transform: "scale(0.98)",
					},
				}
			: {};

		// Different styles for running vs non-running states
		if (isRunning) {
			// Timer display - keep on single line
			return {
				...baseStyles,
				...buttonResetStyles,
				color,
				...interactiveStyles,
				maxWidth: `${size * 0.8}px`,
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis",
			};
		} else {
			// Ready state - allow wrapping and more space
			return {
				...baseStyles,
				...buttonResetStyles,
				color,
				...interactiveStyles,
				maxWidth: `${size * 0.9}px`, // More space for "Ready to fast?"
				textAlign: "center",
				wordWrap: "break-word",
				hyphens: "auto",
			};
		}
	};

	// Helper function to get dynamic description for accessibility
	const getProgressDescription = (
		isRunning,
		progress,
		completed,
		targetHours,
	) => {
		if (!isRunning) {
			return "Fasting timer is not currently running. Progress ring is inactive.";
		}

		const progressPercent = Math.round(progress);
		let status = "";

		if (progress > 100) {
			status = `Extended fasting: ${progressPercent}% of ${targetHours} hour target completed, exceeding goal.`;
		} else if (completed) {
			status = `Fasting complete: ${progressPercent}% of ${targetHours} hour target achieved.`;
		} else {
			status = `Fasting in progress: ${progressPercent}% of ${targetHours} hour target completed.`;
		}

		return `Circular progress indicator showing fasting status. ${status}`;
	};

	// Helper function to determine stroke color for progress circle
	const getProgressStrokeColor = (progress, completed, theme) => {
		if (progress > 100) {
			return "url(#extendedGradient)";
		}

		if (completed) {
			return theme.palette.success.main;
		}

		return theme.palette.primary.main;
	};

	// Helper function to get accessible chip content and label
	const getChipContent = (progress) => {
		const isExtended = progress > 100;

		return {
			label: (
				<>
					<span aria-hidden="true">{isExtended ? "🔥" : "🎉"}</span>{" "}
					{isExtended ? "Target Exceeded!" : "Fast Complete!"}
				</>
			),
			ariaLabel: isExtended
				? "Celebration: Fasting target exceeded!"
				: "Celebration: Fast completed successfully!",
		};
	};

	// Helper function to get status text for progress display
	const getStatusText = () => {
		const percentage = Math.round(progress);
		const status = progress > 100 ? "Extended" : "Complete";
		return `${percentage}% ${status}`;
	};

	// Calculate chip content once for efficiency
	const chipContent = completed ? getChipContent(progress) : null;

	// Helper function to calculate milestone position
	const getMilestonePosition = (percentage) => {
		const angle = (percentage / 100) * 2 * Math.PI; // Start from 3 o'clock (0 degrees), no offset
		const x = center + radius * Math.cos(angle);
		const y = center + radius * Math.sin(angle);
		return { x, y };
	};

	// Milestone data with positions and labels
	const milestones = [
		{ percentage: 25, label: "25%", color: theme.palette.grey[400] },
		{ percentage: 50, label: "50%", color: theme.palette.grey[400] },
		{ percentage: 75, label: "75%", color: theme.palette.grey[400] },
	];

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
				<svg
					width={svgSize}
					height={svgSize}
					style={{ transform: "rotate(-90deg)" }}
					role="img"
					aria-labelledby="fasting-progress-title fasting-progress-desc"
				>
					<title id="fasting-progress-title">Fasting Progress Ring</title>
					<desc id="fasting-progress-desc">
						{getProgressDescription(
							isRunning,
							progress,
							completed,
							targetHours,
						)}
					</desc>
					<defs>
						<linearGradient
							id="extendedGradient"
							gradientUnits="userSpaceOnUse"
							x1="0"
							y1="0"
							x2={svgSize}
							y2={svgSize}
						>
							<stop offset="0%" stopColor={theme.palette.success.main} />
							<stop offset="60%" stopColor={theme.palette.success.main} />
							<stop offset="90%" stopColor={theme.palette.warning.main} />
							<stop offset="100%" stopColor={theme.palette.warning.main} />
						</linearGradient>
					</defs>

					{/* Background circle */}
					<circle
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke={theme.palette.grey[200]}
						strokeWidth={strokeWidth}
					/>

					{/* Milestone markers */}
					{isRunning &&
						milestones.map((milestone) => {
							const position = getMilestonePosition(milestone.percentage);
							const isPassed = progress >= milestone.percentage;
							const isActive =
								progress >= milestone.percentage - 5 &&
								progress <= milestone.percentage + 5;

							return (
								<circle
									key={milestone.percentage}
									cx={position.x}
									cy={position.y}
									r={isActive ? 6 : 4}
									fill={isPassed ? theme.palette.primary.main : milestone.color}
									stroke={theme.palette.background.paper}
									strokeWidth={2}
									style={{
										transition: "all 0.3s ease",
										opacity: isActive ? 1 : 0.7,
									}}
								/>
							);
						})}

					{/* Base circle when extended (faded) */}
					{isRunning && progress > 100 && (
						<circle
							cx={center}
							cy={center}
							r={radius}
							fill="none"
							stroke={theme.palette.success.main}
							strokeWidth={strokeWidth}
							strokeOpacity="0.4"
							strokeLinecap="round"
							strokeDasharray={circumference}
							strokeDashoffset="0"
						/>
					)}

					{/* Active progress circle */}
					{isRunning && (
						<circle
							cx={center}
							cy={center}
							r={radius}
							fill="none"
							stroke={getProgressStrokeColor(progress, completed, theme)}
							strokeWidth={strokeWidth}
							strokeLinecap="round"
							strokeDasharray={circumference}
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
						component={isRunning ? "button" : "div"}
						onClick={onTimeToggle}
						sx={getTimerDisplayStyles(isRunning, progress, completed)}
						role={isRunning ? "button" : undefined}
						aria-label={
							isRunning
								? `Timer display: ${displayTime}. Click to toggle between elapsed time and remaining time.`
								: undefined
						}
						tabIndex={isRunning ? 0 : -1}
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
							{/* Accessible toggle instruction */}
							<span>
								{" • "}
								<span
									style={{
										position: "absolute",
										width: "1px",
										height: "1px",
										padding: 0,
										margin: "-1px",
										overflow: "hidden",
										clip: "rect(0, 0, 0, 0)",
										whiteSpace: "nowrap",
										border: 0,
									}}
								>
									Press timer to toggle between elapsed and remaining time.
								</span>
								<span aria-hidden="true">Click to toggle</span>
							</span>
						</Typography>
					)}

					{isRunning && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mt: 1, fontSize: "0.8rem" }}
						>
							{getStatusText()}
						</Typography>
					)}
				</Box>
			</Box>

			{isRunning && (
				<>
					<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
						Target: {targetHours}:00:00
					</Typography>

					{completed && chipContent && (
						<Chip
							label={chipContent.label}
							aria-label={chipContent.ariaLabel}
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
