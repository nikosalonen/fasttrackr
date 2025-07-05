import {
	Whatshot as StreakIcon,
	Timer as TimerIcon,
	TrendingUp as TrendingIcon,
	EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import {
	Box,
	Card,
	CardContent,
	Chip,
	Grid,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

const StatsScreen = () => {
	const theme = useTheme();
	const [stats, setStats] = useState({
		totalFasts: 0,
		completedFasts: 0,
		totalTime: 0,
		averageDuration: 0,
		longestFast: 0,
		currentStreak: 0,
		thisWeekFasts: 0,
		thisMonthFasts: 0,
		completionRate: 0,
	});

	const calculateStats = useCallback(() => {
		const fasts = JSON.parse(localStorage.getItem("fastHistory") || "[]");
		const now = new Date();

		if (fasts.length === 0) {
			setStats({
				totalFasts: 0,
				completedFasts: 0,
				totalTime: 0,
				averageDuration: 0,
				longestFast: 0,
				currentStreak: 0,
				thisWeekFasts: 0,
				thisMonthFasts: 0,
				completionRate: 0,
			});
			return;
		}

		const totalFasts = fasts.length;
		const completedFasts = fasts.filter((f) => f.completed).length;
		const totalTime = fasts.reduce((sum, f) => sum + f.actualDuration, 0);
		const averageDuration = totalTime / totalFasts;
		const longestFast = Math.max(...fasts.map((f) => f.actualDuration));
		const completionRate = (completedFasts / totalFasts) * 100;

		// Calculate recent activity
		const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		const thisWeekFasts = fasts.filter(
			(f) => new Date(f.startTime) >= weekAgo,
		).length;

		const thisMonthFasts = fasts.filter(
			(f) => new Date(f.startTime) >= monthAgo,
		).length;

		// Calculate current streak (simplified - consecutive days with completed fasts)
		const completedFastDays = [
			...new Set(
				fasts
					.filter((f) => f.completed)
					.map((f) => new Date(f.startTime).toDateString()),
			),
		].sort((a, b) => new Date(b) - new Date(a));

		let currentStreak = 0;
		let currentDate = new Date().toDateString();

		for (const day of completedFastDays) {
			if (day === currentDate) {
				currentStreak++;
				const date = new Date(currentDate);
				date.setDate(date.getDate() - 1);
				currentDate = date.toDateString();
			} else {
				break;
			}
		}

		setStats({
			totalFasts,
			completedFasts,
			totalTime,
			averageDuration,
			longestFast,
			currentStreak,
			thisWeekFasts,
			thisMonthFasts,
			completionRate,
		});
	}, []);

	useEffect(() => {
		calculateStats();
	}, [calculateStats]);

	const formatDuration = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	};

	const formatTotalTime = (milliseconds) => {
		const totalHours = Math.floor(milliseconds / (1000 * 60 * 60));
		const days = Math.floor(totalHours / 24);
		const hours = totalHours % 24;

		if (days > 0) {
			return `${days}d ${hours}h`;
		} else {
			return `${hours}h`;
		}
	};

	const StatCard = ({ title, value, subtitle, icon, color = "primary" }) => (
		<Card elevation={1} sx={{ height: "100%" }}>
			<CardContent
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					py: 3,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<Box
						sx={{
							backgroundColor: `${color}.main`,
							color: "white",
							borderRadius: 2,
							p: 1.5,
							mr: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							minWidth: 48,
							minHeight: 48,
						}}
					>
						{icon}
					</Box>
					<Typography
						variant="subtitle1"
						color="text.secondary"
						fontWeight={500}
						sx={{ lineHeight: 1.2 }}
					>
						{title}
					</Typography>
				</Box>

				<Box
					sx={{
						textAlign: "center",
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<Typography
						variant="h3"
						fontWeight="bold"
						color={`${color}.main`}
						sx={{ mb: 0.5, lineHeight: 1 }}
					>
						{value}
					</Typography>
					{subtitle && (
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{
								fontSize: "0.8rem",
								lineHeight: 1.2,
								display: "block",
							}}
						>
							{subtitle}
						</Typography>
					)}
				</Box>
			</CardContent>
		</Card>
	);

	if (stats.totalFasts === 0) {
		return (
			<Box sx={{ textAlign: "center", mt: 4 }}>
				<Typography variant="h6" color="text.secondary">
					No statistics available yet
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
					Complete some fasts to see your statistics here!
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ maxWidth: 1000, mx: "auto" }}>
			<Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
				Statistics
			</Typography>

			<Grid container spacing={2.5}>
				{/* Primary Stats Row - Ensure equal heights and perfect width alignment */}
				<Grid item xs={6} sm={3}>
					<StatCard
						title="Total Fasts"
						value={stats.totalFasts}
						icon={<TimerIcon />}
						color="primary"
					/>
				</Grid>

				<Grid item xs={6} sm={3}>
					<StatCard
						title="Completed"
						value={stats.completedFasts}
						subtitle={`${Math.round(stats.completionRate)}% completion rate`}
						icon={<TrophyIcon />}
						color="success"
					/>
				</Grid>

				<Grid item xs={6} sm={3}>
					<StatCard
						title="Current Streak"
						value={`${stats.currentStreak}`}
						subtitle="days"
						icon={<StreakIcon />}
						color="warning"
					/>
				</Grid>

				<Grid item xs={6} sm={3}>
					<StatCard
						title="Longest Fast"
						value={formatDuration(stats.longestFast)}
						icon={<TrendingIcon />}
						color="info"
					/>
				</Grid>

				{/* Detailed Stats - Full width to match the 4 cards above */}
				<Grid item xs={12}>
					<Card elevation={1}>
						<CardContent sx={{ py: 4 }}>
							<Typography
								variant="h5"
								gutterBottom
								sx={{ mb: 3, fontWeight: 600 }}
							>
								Detailed Statistics
							</Typography>

							<Grid container spacing={2.5}>
								<Grid item xs={12} sm={4}>
									<Box sx={{ textAlign: "center", py: 3 }}>
										<Typography
											variant="h4"
											fontWeight="bold"
											color="primary.main"
											sx={{ mb: 1 }}
										>
											{formatDuration(stats.averageDuration)}
										</Typography>
										<Typography
											variant="subtitle1"
											color="text.secondary"
											fontWeight={500}
										>
											Average Duration
										</Typography>
									</Box>
								</Grid>

								<Grid item xs={12} sm={4}>
									<Box sx={{ textAlign: "center", py: 3 }}>
										<Typography
											variant="h4"
											fontWeight="bold"
											color="secondary.main"
											sx={{ mb: 1 }}
										>
											{formatTotalTime(stats.totalTime)}
										</Typography>
										<Typography
											variant="subtitle1"
											color="text.secondary"
											fontWeight={500}
										>
											Total Fasting Time
										</Typography>
									</Box>
								</Grid>

								<Grid item xs={12} sm={4}>
									<Box sx={{ textAlign: "center", py: 3 }}>
										<Typography
											variant="h4"
											fontWeight="bold"
											color="info.main"
											sx={{ mb: 1 }}
										>
											{stats.thisWeekFasts}
										</Typography>
										<Typography
											variant="subtitle1"
											color="text.secondary"
											fontWeight={500}
										>
											This Week
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>

				{/* Achievements - Full width to match the 4 cards above */}
				<Grid item xs={12}>
					<Card elevation={1}>
						<CardContent sx={{ py: 4 }}>
							<Typography
								variant="h5"
								gutterBottom
								sx={{ mb: 3, fontWeight: 600 }}
							>
								Achievements
							</Typography>

							<Stack direction="row" spacing={1} flexWrap="wrap" gap={1.5}>
								{stats.totalFasts >= 1 && (
									<Chip
										label="First Fast! 🎉"
										color="primary"
										variant="filled"
										sx={{ fontSize: "0.875rem", py: 2 }}
									/>
								)}
								{stats.totalFasts >= 10 && (
									<Chip
										label="10 Fasts Milestone! 🏆"
										color="success"
										variant="filled"
										sx={{ fontSize: "0.875rem", py: 2 }}
									/>
								)}
								{stats.totalFasts >= 50 && (
									<Chip
										label="50 Fasts Champion! 👑"
										color="warning"
										variant="filled"
										sx={{ fontSize: "0.875rem", py: 2 }}
									/>
								)}
								{stats.currentStreak >= 7 && (
									<Chip
										label="Week Streak! 🔥"
										color="error"
										variant="filled"
										sx={{ fontSize: "0.875rem", py: 2 }}
									/>
								)}
								{stats.completionRate >= 80 && (
									<Chip
										label="High Completion Rate! ⭐"
										color="info"
										variant="filled"
										sx={{ fontSize: "0.875rem", py: 2 }}
									/>
								)}
								{stats.longestFast >= 24 * 60 * 60 * 1000 && (
									<Chip
										label="24+ Hour Fast! 💪"
										color="secondary"
										variant="filled"
										sx={{ fontSize: "0.875rem", py: 2 }}
									/>
								)}
							</Stack>

							{stats.totalFasts < 5 && (
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{ mt: 3, textAlign: "center", fontStyle: "italic" }}
								>
									Complete more fasts to unlock achievements!
								</Typography>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default StatsScreen;
