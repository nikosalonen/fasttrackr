import {
	Timer as ActiveIcon,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	CheckCircle as CompleteIcon,
	Cancel as IncompleteIcon,
} from "@mui/icons-material";
import {
	Box,
	Card,
	CardContent,
	Chip,
	Grid,
	IconButton,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFastTimer } from "../hooks/useFastTimer";

const CalendarView = () => {
	const theme = useTheme();
	const { isRunning, startTime } = useFastTimer();
	const [currentDate, setCurrentDate] = useState(dayjs());
	const [fasts, setFasts] = useState([]);

	// Load fasting history
	useEffect(() => {
		const history = JSON.parse(localStorage.getItem("fastHistory") || "[]");
		setFasts(history);
	}, []);

	// Navigate to previous month
	const handlePreviousMonth = () => {
		setCurrentDate(currentDate.subtract(1, "month"));
	};

	// Navigate to next month
	const handleNextMonth = () => {
		setCurrentDate(currentDate.add(1, "month"));
	};

	// Get fasts for a specific date
	const getFastsForDate = useCallback(
		(date) => {
			const dateStr = date.format("YYYY-MM-DD");
			return fasts.filter((fast) => {
				const startDate = dayjs(fast.startTime).format("YYYY-MM-DD");
				const endDate = dayjs(fast.endTime).format("YYYY-MM-DD");
				return startDate === dateStr || endDate === dateStr;
			});
		},
		[fasts],
	);

	// Check if there's an active fast on a specific date
	const hasActiveFastOnDate = useCallback(
		(date) => {
			if (!isRunning || !startTime) return false;
			const fastStartDate = dayjs(startTime).format("YYYY-MM-DD");
			const checkDate = date.format("YYYY-MM-DD");
			return fastStartDate === checkDate;
		},
		[isRunning, startTime],
	);

	// Get calendar days for the current month
	const calendarDays = useMemo(() => {
		const startOfMonth = currentDate.startOf("month");
		const endOfMonth = currentDate.endOf("month");
		const startOfCalendar = startOfMonth.startOf("week");
		const endOfCalendar = endOfMonth.endOf("week");

		const days = [];
		let day = startOfCalendar;

		while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, "day")) {
			days.push(day);
			day = day.add(1, "day");
		}

		return days;
	}, [currentDate]);

	// Get day status and color
	const getDayStatus = useCallback(
		(date) => {
			const dayFasts = getFastsForDate(date);
			const hasActiveFast = hasActiveFastOnDate(date);

			if (hasActiveFast) {
				return {
					type: "active",
					color: theme.palette.primary.main,
					icon: <ActiveIcon fontSize="small" />,
					tooltip: "Active fast",
				};
			}

			if (dayFasts.length === 0) {
				return {
					type: "none",
					color: "transparent",
					icon: null,
					tooltip: "",
				};
			}

			const completedFasts = dayFasts.filter((f) => f.completed);
			const incompleteFasts = dayFasts.filter((f) => !f.completed);

			if (completedFasts.length > 0 && incompleteFasts.length === 0) {
				return {
					type: "completed",
					color: theme.palette.success.main,
					icon: <CompleteIcon fontSize="small" />,
					tooltip: `${completedFasts.length} completed fast${completedFasts.length > 1 ? "s" : ""}`,
				};
			}

			if (incompleteFasts.length > 0 && completedFasts.length === 0) {
				return {
					type: "incomplete",
					color: theme.palette.warning.main,
					icon: <IncompleteIcon fontSize="small" />,
					tooltip: `${incompleteFasts.length} incomplete fast${incompleteFasts.length > 1 ? "s" : ""}`,
				};
			}

			// Mixed completed and incomplete
			return {
				type: "mixed",
				color: theme.palette.info.main,
				icon: <CompleteIcon fontSize="small" />,
				tooltip: `${completedFasts.length} completed, ${incompleteFasts.length} incomplete`,
			};
		},
		[getFastsForDate, hasActiveFastOnDate, theme],
	);

	// Format duration for tooltip
	const formatDuration = useCallback((milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	}, []);

	// Get detailed tooltip for a day
	const getDayTooltip = useCallback(
		(date) => {
			const dayFasts = getFastsForDate(date);
			const hasActiveFast = hasActiveFastOnDate(date);

			if (hasActiveFast) {
				return "Active fast in progress";
			}

			if (dayFasts.length === 0) {
				return "";
			}

			const tooltipLines = dayFasts.map((fast) => {
				const duration = formatDuration(fast.actualDuration);
				const status = fast.completed ? "✓" : "✗";
				return `${status} ${duration}`;
			});

			return tooltipLines.join("\n");
		},
		[getFastsForDate, hasActiveFastOnDate, formatDuration],
	);

	// Calculate monthly statistics
	const monthlyStats = useMemo(() => {
		const monthStart = currentDate.startOf("month");
		const monthEnd = currentDate.endOf("month");

		const monthFasts = fasts.filter((fast) => {
			const fastDate = dayjs(fast.startTime);
			return fastDate.isAfter(monthStart) && fastDate.isBefore(monthEnd);
		});

		const totalFasts = monthFasts.length;
		const completedFasts = monthFasts.filter((f) => f.completed).length;
		const completionRate =
			totalFasts > 0 ? (completedFasts / totalFasts) * 100 : 0;

		// Count unique fasting days
		const fastingDays = new Set();
		monthFasts.forEach((fast) => {
			fastingDays.add(dayjs(fast.startTime).format("YYYY-MM-DD"));
		});

		return {
			totalFasts,
			completedFasts,
			completionRate,
			fastingDays: fastingDays.size,
		};
	}, [fasts, currentDate]);

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<Box sx={{ maxWidth: 800, mx: "auto" }}>
			<Card elevation={1}>
				<CardContent>
					{/* Calendar Header */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 3,
						}}
					>
						<IconButton onClick={handlePreviousMonth} size="small">
							<ChevronLeftIcon />
						</IconButton>

						<Typography variant="h5" fontWeight="600">
							{currentDate.format("MMMM YYYY")}
						</Typography>

						<IconButton onClick={handleNextMonth} size="small">
							<ChevronRightIcon />
						</IconButton>
					</Box>

					{/* Monthly Stats */}
					<Box sx={{ mb: 3 }}>
						<Stack
							direction="row"
							spacing={2}
							justifyContent="center"
							flexWrap="wrap"
						>
							<Chip
								label={`${monthlyStats.totalFasts} fasts`}
								color="primary"
								variant="outlined"
								size="small"
							/>
							<Chip
								label={`${monthlyStats.completedFasts} completed`}
								color="success"
								variant="outlined"
								size="small"
							/>
							<Chip
								label={`${Math.round(monthlyStats.completionRate)}% completion`}
								color={
									monthlyStats.completionRate >= 80
										? "success"
										: monthlyStats.completionRate >= 60
											? "warning"
											: "error"
								}
								variant="outlined"
								size="small"
							/>
							<Chip
								label={`${monthlyStats.fastingDays} active days`}
								color="info"
								variant="outlined"
								size="small"
							/>
						</Stack>
					</Box>

					{/* Week Day Headers */}
					<Grid container spacing={1} sx={{ mb: 1 }}>
						{weekDays.map((day) => (
							<Grid key={day} size={{ xs: 12 / 7 }}>
								<Typography
									variant="caption"
									fontWeight="600"
									color="text.secondary"
									sx={{
										display: "block",
										textAlign: "center",
										py: 1,
									}}
								>
									{day}
								</Typography>
							</Grid>
						))}
					</Grid>

					{/* Calendar Grid */}
					<Grid container spacing={1}>
						{calendarDays.map((day) => {
							const isCurrentMonth = day.month() === currentDate.month();
							const isToday = day.isSame(dayjs(), "day");
							const dayStatus = getDayStatus(day);
							const tooltip = getDayTooltip(day);

							return (
								<Grid key={day.format("YYYY-MM-DD")} size={{ xs: 12 / 7 }}>
									<Tooltip title={tooltip} arrow placement="top">
										<Box
											sx={{
												position: "relative",
												height: 48,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												borderRadius: 1,
												border: isToday ? 2 : 1,
												borderColor: isToday ? "primary.main" : "divider",
												backgroundColor: isCurrentMonth
													? "background.paper"
													: "background.default",
												opacity: isCurrentMonth ? 1 : 0.5,
												cursor: tooltip ? "pointer" : "default",
												"&:hover": {
													backgroundColor: isCurrentMonth
														? "action.hover"
														: "background.default",
												},
											}}
										>
											{/* Day Number */}
											<Typography
												variant="body2"
												fontWeight={isToday ? "bold" : "normal"}
												color={
													isCurrentMonth ? "text.primary" : "text.secondary"
												}
											>
												{day.date()}
											</Typography>

											{/* Fast Status Indicator */}
											{dayStatus.icon && (
												<Box
													sx={{
														position: "absolute",
														bottom: 2,
														right: 2,
														color: dayStatus.color,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													{dayStatus.icon}
												</Box>
											)}

											{/* Multiple Fasts Indicator */}
											{getFastsForDate(day).length > 1 && (
												<Box
													sx={{
														position: "absolute",
														top: 2,
														right: 2,
														width: 6,
														height: 6,
														borderRadius: "50%",
														backgroundColor: "info.main",
													}}
												/>
											)}
										</Box>
									</Tooltip>
								</Grid>
							);
						})}
					</Grid>

					{/* Legend */}
					<Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
						<Typography variant="subtitle2" gutterBottom>
							Legend
						</Typography>
						<Stack direction="row" spacing={3} flexWrap="wrap">
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<ActiveIcon fontSize="small" color="primary" />
								<Typography variant="caption">Active Fast</Typography>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<CompleteIcon fontSize="small" color="success" />
								<Typography variant="caption">Completed</Typography>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<IncompleteIcon fontSize="small" color="warning" />
								<Typography variant="caption">Incomplete</Typography>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Box
									sx={{
										width: 6,
										height: 6,
										borderRadius: "50%",
										backgroundColor: "info.main",
									}}
								/>
								<Typography variant="caption">Multiple Fasts</Typography>
							</Box>
						</Stack>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default CalendarView;
