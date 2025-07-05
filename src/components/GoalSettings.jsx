import {
	Add as AddIcon,
	CheckCircle as CheckIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Flag as GoalIcon,
	TrendingUp as TrendingUpIcon,
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
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const GoalSettings = () => {
	const theme = useTheme();
	const [goals, setGoals] = useState(() => {
		const saved = localStorage.getItem("fastingGoals");
		return saved ? JSON.parse(saved) : [];
	});
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [editingGoal, setEditingGoal] = useState(null);
	const [newGoal, setNewGoal] = useState({
		title: "",
		type: "weekly", // weekly, monthly, custom
		target: "",
		metric: "fasts", // fasts, completion_rate, total_hours
		period: "current", // current, next
	});

	const [fasts, setFasts] = useState([]);

	// Load fasting history
	useEffect(() => {
		const history = JSON.parse(localStorage.getItem("fastHistory") || "[]");
		setFasts(history);
	}, []);

	// Save goals to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem("fastingGoals", JSON.stringify(goals));
	}, [goals]);

	// Goal type options
	const goalTypes = [
		{ value: "weekly", label: "Weekly Goal" },
		{ value: "monthly", label: "Monthly Goal" },
		{ value: "custom", label: "Custom Period" },
	];

	// Metric options
	const metricOptions = [
		{ value: "fasts", label: "Number of Fasts" },
		{ value: "completion_rate", label: "Completion Rate (%)" },
		{ value: "total_hours", label: "Total Fasting Hours" },
	];

	// Calculate goal progress
	const calculateGoalProgress = useCallback(
		(goal) => {
			const now = dayjs();
			let periodStart, periodEnd;

			// Determine the period for the goal
			if (goal.type === "weekly") {
				if (goal.period === "current") {
					periodStart = now.startOf("week");
					periodEnd = now.endOf("week");
				} else {
					periodStart = now.add(1, "week").startOf("week");
					periodEnd = now.add(1, "week").endOf("week");
				}
			} else if (goal.type === "monthly") {
				if (goal.period === "current") {
					periodStart = now.startOf("month");
					periodEnd = now.endOf("month");
				} else {
					periodStart = now.add(1, "month").startOf("month");
					periodEnd = now.add(1, "month").endOf("month");
				}
			} else {
				// Custom period - for now, use current week as default
				periodStart = now.startOf("week");
				periodEnd = now.endOf("week");
			}

			// Filter fasts within the period
			const periodFasts = fasts.filter((fast) => {
				const fastDate = dayjs(fast.startTime);
				return fastDate.isAfter(periodStart) && fastDate.isBefore(periodEnd);
			});

			let current = 0;
			const target = parseInt(goal.target);

			// Calculate current value based on metric
			switch (goal.metric) {
				case "fasts":
					current = periodFasts.length;
					break;
				case "completion_rate":
					if (periodFasts.length > 0) {
						const completed = periodFasts.filter((f) => f.completed).length;
						current = Math.round((completed / periodFasts.length) * 100);
					}
					break;
				case "total_hours":
					current = Math.round(
						periodFasts.reduce((sum, fast) => {
							return sum + fast.actualDuration / (1000 * 60 * 60);
						}, 0),
					);
					break;
				default:
					current = 0;
			}

			const progress = target > 0 ? (current / target) * 100 : 0;
			const isCompleted = current >= target;

			return {
				current,
				target,
				progress: Math.min(progress, 100),
				isCompleted,
				periodStart,
				periodEnd,
				periodFasts: periodFasts.length,
			};
		},
		[fasts],
	);

	// Add or update goal
	const handleSaveGoal = () => {
		if (
			!newGoal.title.trim() ||
			!newGoal.target ||
			parseInt(newGoal.target) <= 0
		) {
			alert("Please fill in all fields with valid values");
			return;
		}

		const goalData = {
			id: editingGoal ? editingGoal.id : Date.now(),
			...newGoal,
			target: parseInt(newGoal.target),
			createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		if (editingGoal) {
			setGoals(goals.map((g) => (g.id === editingGoal.id ? goalData : g)));
		} else {
			setGoals([...goals, goalData]);
		}

		resetForm();
	};

	// Delete goal
	const handleDeleteGoal = (goalId) => {
		if (window.confirm("Are you sure you want to delete this goal?")) {
			setGoals(goals.filter((g) => g.id !== goalId));
		}
	};

	// Edit goal
	const handleEditGoal = (goal) => {
		setEditingGoal(goal);
		setNewGoal({
			title: goal.title,
			type: goal.type,
			target: goal.target.toString(),
			metric: goal.metric,
			period: goal.period,
		});
		setShowAddDialog(true);
	};

	// Reset form
	const resetForm = () => {
		setNewGoal({
			title: "",
			type: "weekly",
			target: "",
			metric: "fasts",
			period: "current",
		});
		setEditingGoal(null);
		setShowAddDialog(false);
	};

	// Format metric display
	const formatMetricDisplay = (metric, value) => {
		switch (metric) {
			case "fasts":
				return `${value} fast${value !== 1 ? "s" : ""}`;
			case "completion_rate":
				return `${value}%`;
			case "total_hours":
				return `${value}h`;
			default:
				return value;
		}
	};

	// Get period display text
	const getPeriodDisplay = (goal) => {
		const now = dayjs();
		if (goal.type === "weekly") {
			if (goal.period === "current") {
				return `This Week (${now.startOf("week").format("MMM D")} - ${now.endOf("week").format("MMM D")})`;
			} else {
				const nextWeek = now.add(1, "week");
				return `Next Week (${nextWeek.startOf("week").format("MMM D")} - ${nextWeek.endOf("week").format("MMM D")})`;
			}
		} else if (goal.type === "monthly") {
			if (goal.period === "current") {
				return `This Month (${now.format("MMMM YYYY")})`;
			} else {
				return `Next Month (${now.add(1, "month").format("MMMM YYYY")})`;
			}
		}
		return "Custom Period";
	};

	// Active goals (current period)
	const activeGoals = useMemo(() => {
		return goals.filter((goal) => goal.period === "current");
	}, [goals]);

	// Upcoming goals (next period)
	const upcomingGoals = useMemo(() => {
		return goals.filter((goal) => goal.period === "next");
	}, [goals]);

	const GoalCard = ({ goal }) => {
		const progress = calculateGoalProgress(goal);
		const isActive = goal.period === "current";

		return (
			<Card elevation={1} sx={{ height: "100%" }}>
				<CardContent>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							mb: 2,
						}}
					>
						<Box sx={{ flex: 1 }}>
							<Typography variant="h6" gutterBottom>
								{goal.title}
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
								{getPeriodDisplay(goal)}
							</Typography>
							<Chip
								size="small"
								label={isActive ? "Active" : "Upcoming"}
								color={isActive ? "primary" : "default"}
								icon={isActive ? <TrendingUpIcon /> : <GoalIcon />}
							/>
						</Box>
						<Box>
							<IconButton size="small" onClick={() => handleEditGoal(goal)}>
								<EditIcon fontSize="small" />
							</IconButton>
							<IconButton
								size="small"
								onClick={() => handleDeleteGoal(goal.id)}
								color="error"
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</Box>
					</Box>

					{isActive && (
						<>
							<Box sx={{ mb: 2 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 1,
									}}
								>
									<Typography variant="body2" color="text.secondary">
										Progress
									</Typography>
									<Typography
										variant="body2"
										fontWeight="bold"
										color={
											progress.isCompleted ? "success.main" : "text.primary"
										}
									>
										{formatMetricDisplay(goal.metric, progress.current)} /{" "}
										{formatMetricDisplay(goal.metric, progress.target)}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={progress.progress}
									sx={{
										height: 8,
										borderRadius: 4,
										backgroundColor: "grey.200",
										"& .MuiLinearProgress-bar": {
											backgroundColor: progress.isCompleted
												? theme.palette.success.main
												: progress.progress > 75
													? theme.palette.warning.main
													: theme.palette.primary.main,
										},
									}}
								/>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ mt: 0.5, display: "block" }}
								>
									{Math.round(progress.progress)}% complete
									{progress.isCompleted && " 🎉"}
								</Typography>
							</Box>

							{progress.isCompleted && (
								<Alert severity="success" size="small" icon={<CheckIcon />}>
									Goal achieved! Great work! 🎉
								</Alert>
							)}

							{!progress.isCompleted && progress.periodFasts > 0 && (
								<Typography variant="caption" color="text.secondary">
									Based on {progress.periodFasts} fast
									{progress.periodFasts !== 1 ? "s" : ""} this period
								</Typography>
							)}
						</>
					)}

					{!isActive && (
						<Typography variant="body2" color="text.secondary">
							Target: {formatMetricDisplay(goal.metric, goal.target)}
						</Typography>
					)}
				</CardContent>
			</Card>
		);
	};

	return (
		<Box sx={{ maxWidth: 1000, mx: "auto" }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
				}}
			>
				<Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
					Fasting Goals
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setShowAddDialog(true)}
				>
					Add Goal
				</Button>
			</Box>

			{goals.length === 0 && (
				<Card elevation={1}>
					<CardContent sx={{ textAlign: "center", py: 6 }}>
						<GoalIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No goals set yet
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							Set personal fasting goals to stay motivated and track your
							progress!
						</Typography>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setShowAddDialog(true)}
						>
							Create Your First Goal
						</Button>
					</CardContent>
				</Card>
			)}

			{activeGoals.length > 0 && (
				<Box sx={{ mb: 4 }}>
					<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
						Active Goals
					</Typography>
					<Grid container spacing={3}>
						{activeGoals.map((goal) => (
							<Grid key={goal.id} size={{ xs: 12, md: 6 }}>
								<GoalCard goal={goal} />
							</Grid>
						))}
					</Grid>
				</Box>
			)}

			{upcomingGoals.length > 0 && (
				<Box>
					<Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
						Upcoming Goals
					</Typography>
					<Grid container spacing={3}>
						{upcomingGoals.map((goal) => (
							<Grid key={goal.id} size={{ xs: 12, md: 6 }}>
								<GoalCard goal={goal} />
							</Grid>
						))}
					</Grid>
				</Box>
			)}

			{/* Add/Edit Goal Dialog */}
			<Dialog open={showAddDialog} onClose={resetForm} maxWidth="sm" fullWidth>
				<DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<TextField
							label="Goal Title"
							value={newGoal.title}
							onChange={(e) =>
								setNewGoal({ ...newGoal, title: e.target.value })
							}
							placeholder="e.g., Complete 5 fasts this week"
							fullWidth
							autoFocus
						/>

						<FormControl fullWidth>
							<InputLabel>Goal Type</InputLabel>
							<Select
								value={newGoal.type}
								label="Goal Type"
								onChange={(e) =>
									setNewGoal({ ...newGoal, type: e.target.value })
								}
							>
								{goalTypes.map((type) => (
									<MenuItem key={type.value} value={type.value}>
										{type.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Period</InputLabel>
							<Select
								value={newGoal.period}
								label="Period"
								onChange={(e) =>
									setNewGoal({ ...newGoal, period: e.target.value })
								}
							>
								<MenuItem value="current">
									{newGoal.type === "weekly" ? "This Week" : "This Month"}
								</MenuItem>
								<MenuItem value="next">
									{newGoal.type === "weekly" ? "Next Week" : "Next Month"}
								</MenuItem>
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Metric</InputLabel>
							<Select
								value={newGoal.metric}
								label="Metric"
								onChange={(e) =>
									setNewGoal({ ...newGoal, metric: e.target.value })
								}
							>
								{metricOptions.map((metric) => (
									<MenuItem key={metric.value} value={metric.value}>
										{metric.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							label="Target Value"
							type="number"
							value={newGoal.target}
							onChange={(e) =>
								setNewGoal({ ...newGoal, target: e.target.value })
							}
							inputProps={{ min: 1, max: 100 }}
							helperText={
								newGoal.metric === "fasts"
									? "Number of fasts to complete"
									: newGoal.metric === "completion_rate"
										? "Percentage of fasts to complete successfully"
										: "Total hours of fasting to achieve"
							}
							fullWidth
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={resetForm}>Cancel</Button>
					<Button onClick={handleSaveGoal} variant="contained">
						{editingGoal ? "Update Goal" : "Create Goal"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default GoalSettings;
