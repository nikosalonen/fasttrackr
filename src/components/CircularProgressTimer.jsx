import { Box, Chip, Typography, useTheme } from "@mui/material";
import { useCallback, useRef, useState } from "react";

const CircularProgressTimer = ({
	progress,
	isRunning,
	completed,
	displayTime,
	timeLabel,
	onTimeToggle,
	targetHours,
	onSwipeStart,
	onSwipeStop,
	size = 300,
	strokeWidth = 12,
}) => {
	const theme = useTheme();
	const [swipeState, setSwipeState] = useState({
		isDragging: false,
		startX: 0,
		startY: 0,
		currentX: 0,
		currentY: 0,
		direction: null,
		threshold: 50, // Minimum distance for swipe
	});
	const timerRef = useRef(null);

	// Calculate dynamic dimensions based on props
	const svgSize = size;
	const center = svgSize / 2;
	const radius = center - strokeWidth * 2; // Leave some padding for the stroke
	const circumference = 2 * Math.PI * radius;

	// Swipe gesture handlers
	const handleTouchStart = useCallback(
		(e) => {
			if (!onSwipeStart && !onSwipeStop) return;

			const touch = e.touches[0];
			setSwipeState((prev) => ({
				...prev,
				isDragging: true,
				startX: touch.clientX,
				startY: touch.clientY,
				currentX: touch.clientX,
				currentY: touch.clientY,
				direction: null,
			}));
		},
		[onSwipeStart, onSwipeStop],
	);

	const handleTouchMove = useCallback(
		(e) => {
			if (!swipeState.isDragging) return;

			const touch = e.touches[0];
			const deltaX = touch.clientX - swipeState.startX;
			const deltaY = touch.clientY - swipeState.startY;

			// Determine swipe direction
			let direction = null;
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				// Horizontal swipe
				if (Math.abs(deltaX) > swipeState.threshold) {
					direction = deltaX > 0 ? "right" : "left";
				}
			} else {
				// Vertical swipe
				if (Math.abs(deltaY) > swipeState.threshold) {
					direction = deltaY > 0 ? "down" : "up";
				}
			}

			setSwipeState((prev) => ({
				...prev,
				currentX: touch.clientX,
				currentY: touch.clientY,
				direction,
			}));

			// Prevent scrolling during swipe
			if (direction) {
				e.preventDefault();
			}
		},
		[
			swipeState.isDragging,
			swipeState.startX,
			swipeState.startY,
			swipeState.threshold,
		],
	);

	const handleTouchEnd = useCallback(
		(e) => {
			if (!swipeState.isDragging) return;

			const deltaX = swipeState.currentX - swipeState.startX;
			const deltaY = swipeState.currentY - swipeState.startY;

			// Determine final swipe direction and execute action
			if (
				Math.abs(deltaX) > Math.abs(deltaY) &&
				Math.abs(deltaX) > swipeState.threshold
			) {
				// Horizontal swipe
				if (deltaX > 0) {
					// Swipe right - start fast (if not running)
					if (!isRunning && onSwipeStart) {
						onSwipeStart();
					}
				} else {
					// Swipe left - stop fast (if running)
					if (isRunning && onSwipeStop) {
						onSwipeStop();
					}
				}
			} else if (Math.abs(deltaY) > swipeState.threshold) {
				// Vertical swipe
				if (deltaY < 0) {
					// Swipe up - start fast (if not running)
					if (!isRunning && onSwipeStart) {
						onSwipeStart();
					}
				} else {
					// Swipe down - stop fast (if running)
					if (isRunning && onSwipeStop) {
						onSwipeStop();
					}
				}
			}

			// Reset swipe state
			setSwipeState((prev) => ({
				...prev,
				isDragging: false,
				startX: 0,
				startY: 0,
				currentX: 0,
				currentY: 0,
				direction: null,
			}));
		},
		[swipeState, isRunning, onSwipeStart, onSwipeStop],
	);

	// Get swipe visual feedback
	const getSwipeTransform = () => {
		if (!swipeState.isDragging || !swipeState.direction) return "";

		const deltaX = swipeState.currentX - swipeState.startX;
		const deltaY = swipeState.currentY - swipeState.startY;

		// Limit movement to prevent excessive dragging
		const maxOffset = 20;
		const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.3));
		const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY * 0.3));

		return `translate(${clampedX}px, ${clampedY}px)`;
	};

	// Get swipe hint text
	const getSwipeHint = () => {
		if (onSwipeStart || onSwipeStop) {
			if (isRunning) {
				return "Swipe ← or ↓ to stop";
			} else {
				return "Swipe → or ↑ to start";
			}
		}
		return "";
	};

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

		// Determine color based on state - use same logic as progress ring
		let color = "primary.main";
		if (isRunning) {
			if (progress > 100) {
				color = "warning.main";
			} else if (completed) {
				color = "success.main";
			} else if (progress >= 75) {
				color = "success.main";
			} else if (progress >= 50) {
				color = "warning.main";
			} else if (progress >= 25) {
				color = "secondary.main";
			} else {
				color = "primary.main";
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

		// Color stages based on progress
		if (progress >= 75) {
			return theme.palette.success.main; // Green for final stretch
		} else if (progress >= 50) {
			return theme.palette.warning.main; // Orange for halfway
		} else if (progress >= 25) {
			return theme.palette.secondary.main; // Secondary color for building momentum
		} else {
			return theme.palette.primary.main; // Primary blue for start
		}
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

	// Helper function to get milestone color based on progress
	const getMilestoneColor = (milestonePercentage, currentProgress) => {
		if (currentProgress >= milestonePercentage) {
			// Use the same color logic as the progress ring
			if (milestonePercentage >= 75) {
				return theme.palette.success.main;
			} else if (milestonePercentage >= 50) {
				return theme.palette.warning.main;
			} else if (milestonePercentage >= 25) {
				return theme.palette.secondary.main;
			}
		}
		return theme.palette.grey[400]; // Default inactive color
	};

	// Milestone data with dynamic colors
	const milestones = [
		{
			percentage: 25,
			label: "25%",
			color: getMilestoneColor(25, progress),
		},
		{
			percentage: 50,
			label: "50%",
			color: getMilestoneColor(50, progress),
		},
		{
			percentage: 75,
			label: "75%",
			color: getMilestoneColor(75, progress),
		},
	];

	return (
		<Box sx={{ textAlign: "center", py: 4 }}>
			<Box
				ref={timerRef}
				sx={{
					position: "relative",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					mb: 2,
					transform: getSwipeTransform(),
					transition: swipeState.isDragging ? "none" : "transform 0.2s ease",
					touchAction: onSwipeStart || onSwipeStop ? "none" : "auto",
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
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
							const isApproaching =
								progress >= milestone.percentage - 10 &&
								progress < milestone.percentage;

							return (
								<circle
									key={milestone.percentage}
									cx={position.x}
									cy={position.y}
									r={isActive ? 7 : isApproaching ? 5 : 4}
									fill={isPassed ? milestone.color : theme.palette.grey[300]}
									stroke={theme.palette.background.paper}
									strokeWidth={2}
									style={{
										transition: "all 0.4s ease",
										opacity: isPassed ? 1 : isApproaching ? 0.8 : 0.6,
										filter: isPassed
											? "drop-shadow(0 0 3px rgba(0,0,0,0.3))"
											: "none",
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

				{/* Swipe visual feedback overlay */}
				{swipeState.isDragging && swipeState.direction && (
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							borderRadius: "50%",
							backgroundColor:
								swipeState.direction === "right" ||
								swipeState.direction === "up"
									? "success.main"
									: "error.main",
							opacity: 0.1,
							pointerEvents: "none",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Typography
							variant="h4"
							sx={{
								color:
									swipeState.direction === "right" ||
									swipeState.direction === "up"
										? "success.main"
										: "error.main",
								opacity: 0.6,
								fontWeight: "bold",
							}}
						>
							{swipeState.direction === "right" && "▶"}
							{swipeState.direction === "left" && "◀"}
							{swipeState.direction === "up" && "▲"}
							{swipeState.direction === "down" && "▼"}
						</Typography>
					</Box>
				)}

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
							sx={{
								mt: 1,
								fontSize: "0.8rem",
								color:
									progress > 100
										? "warning.main"
										: completed
											? "success.main"
											: progress >= 75
												? "success.main"
												: progress >= 50
													? "warning.main"
													: progress >= 25
														? "secondary.main"
														: "primary.main",
							}}
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

			{/* Swipe hint text */}
			{getSwipeHint() && (
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						mt: 1,
						fontSize: "0.7rem",
						opacity: 0.7,
						display: "block",
					}}
				>
					{getSwipeHint()}
				</Typography>
			)}
		</Box>
	);
};

export default CircularProgressTimer;
