import {
	CheckCircle as CompleteIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Cancel as IncompleteIcon,
	MoreVert as MoreIcon,
	Search as SearchIcon,
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
	IconButton,
	InputAdornment,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const HistoryScreen = () => {
	const [fasts, setFasts] = useState([]);
	const [editingFast, setEditingFast] = useState(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [selectedFast, setSelectedFast] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilters, setActiveFilters] = useState(new Set());
	const [use12HourClock, setUse12HourClock] = useState(() => {
		return localStorage.getItem("use12HourClock") !== "false";
	});

	const loadHistory = useCallback(() => {
		const history = JSON.parse(localStorage.getItem("fastHistory") || "[]");
		setFasts(history);
	}, []);

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	// Listen for changes to 12-hour clock setting
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key === "use12HourClock") {
				setUse12HourClock(e.newValue !== "false");
			}
		};

		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

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

	const formatDateTime = useCallback(
		(dateString) => {
			const format = use12HourClock
				? "MMM D, YYYY h:mm A"
				: "MMM D, YYYY HH:mm";
			return dayjs(dateString).format(format);
		},
		[use12HourClock],
	);

	// Filter definitions
	const filterOptions = useMemo(
		() => [
			{
				id: "last-7-days",
				label: "Last 7 days",
				filterFn: (fast) => {
					const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
					return new Date(fast.startTime) >= weekAgo;
				},
			},
			{
				id: "completed-only",
				label: "Completed only",
				filterFn: (fast) => fast.completed,
			},
			{
				id: "16-plus-hours",
				label: "16+ hours",
				filterFn: (fast) => fast.actualDuration >= 16 * 60 * 60 * 1000,
			},
		],
		[],
	);

	// Toggle filter function
	const toggleFilter = (filterId) => {
		setActiveFilters((prev) => {
			const newFilters = new Set(prev);
			if (newFilters.has(filterId)) {
				newFilters.delete(filterId);
			} else {
				newFilters.add(filterId);
			}
			return newFilters;
		});
	};

	// Clear all filters
	const clearAllFilters = () => {
		setActiveFilters(new Set());
		setSearchQuery("");
	};

	// Filter fasts based on search query and active filters
	const filteredFasts = useMemo(() => {
		let result = fasts;

		// Apply search query filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter((fast) => {
				// Search in duration
				const durationText = formatDuration(fast.actualDuration).toLowerCase();
				const targetText = formatDuration(fast.targetDuration).toLowerCase();

				// Search in dates
				const startDate = formatDateTime(fast.startTime).toLowerCase();
				const endDate = formatDateTime(fast.endTime).toLowerCase();

				// Search in completion status
				const statusText = fast.completed ? "completed" : "stopped early";

				return (
					durationText.includes(query) ||
					targetText.includes(query) ||
					startDate.includes(query) ||
					endDate.includes(query) ||
					statusText.includes(query)
				);
			});
		}

		// Apply active filters
		activeFilters.forEach((filterId) => {
			const filter = filterOptions.find((f) => f.id === filterId);
			if (filter) {
				result = result.filter(filter.filterFn);
			}
		});

		return result;
	}, [
		fasts,
		searchQuery,
		activeFilters,
		formatDuration,
		formatDateTime,
		filterOptions,
	]);

	const handleMenuOpen = (event, fast) => {
		setMenuAnchor(event.currentTarget);
		setSelectedFast(fast);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
		setSelectedFast(null);
	};

	const handleEdit = () => {
		setEditingFast({
			...selectedFast,
			startTime: dayjs(selectedFast.startTime),
			endTime: dayjs(selectedFast.endTime),
		});
		setEditDialogOpen(true);
		handleMenuClose();
	};

	const handleDelete = () => {
		if (
			window.confirm(
				"Are you sure you want to delete this fast? This action cannot be undone.",
			)
		) {
			const updatedFasts = fasts.filter((f) => f.id !== selectedFast.id);
			setFasts(updatedFasts);
			localStorage.setItem("fastHistory", JSON.stringify(updatedFasts));
		}
		handleMenuClose();
	};

	const handleSaveEdit = () => {
		if (!editingFast.startTime || !editingFast.endTime) {
			alert("Please select both start and end times");
			return;
		}

		if (editingFast.endTime.isBefore(editingFast.startTime)) {
			alert("End time must be after start time");
			return;
		}

		if (editingFast.startTime.isAfter(dayjs())) {
			alert("Start time cannot be in the future");
			return;
		}

		const actualDuration = editingFast.endTime.diff(editingFast.startTime);

		const updatedFast = {
			...editingFast,
			startTime: editingFast.startTime.toISOString(),
			endTime: editingFast.endTime.toISOString(),
			actualDuration,
			completed: actualDuration >= editingFast.targetDuration,
		};

		const updatedFasts = fasts.map((f) =>
			f.id === editingFast.id ? updatedFast : f,
		);

		setFasts(updatedFasts);
		localStorage.setItem("fastHistory", JSON.stringify(updatedFasts));
		setEditDialogOpen(false);
		setEditingFast(null);
	};

	const handleCancelEdit = () => {
		setEditDialogOpen(false);
		setEditingFast(null);
	};

	if (fasts.length === 0) {
		return (
			<Box sx={{ textAlign: "center", mt: 4 }}>
				<Typography variant="h6" color="text.secondary">
					No fasts recorded yet
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
					Start your first fast to see your history here!
				</Typography>
			</Box>
		);
	}

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box sx={{ maxWidth: 800, mx: "auto" }}>
				<Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
					Fast History
				</Typography>

				{/* Search Input */}
				<TextField
					fullWidth
					placeholder="Search fasts by duration, date, or status..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					sx={{ mb: 2 }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon color="action" />
							</InputAdornment>
						),
					}}
				/>

				{/* Filter Chips */}
				<Box sx={{ mb: 3 }}>
					<Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
						{filterOptions.map((filter) => (
							<Chip
								key={filter.id}
								label={filter.label}
								onClick={() => toggleFilter(filter.id)}
								variant={activeFilters.has(filter.id) ? "filled" : "outlined"}
								color={activeFilters.has(filter.id) ? "primary" : "default"}
								clickable
							/>
						))}
						{(activeFilters.size > 0 || searchQuery.trim()) && (
							<Button
								size="small"
								onClick={clearAllFilters}
								sx={{ ml: 1, textTransform: "none" }}
							>
								Clear All
							</Button>
						)}
					</Stack>
				</Box>

				{/* Search Results Info */}
				{(searchQuery.trim() || activeFilters.size > 0) && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{filteredFasts.length === 0
							? "No fasts found matching your search and filters"
							: `Showing ${filteredFasts.length} fast${filteredFasts.length === 1 ? "" : "s"}`}
					</Typography>
				)}

				<Stack spacing={2}>
					{filteredFasts.map((fast) => (
						<Card key={fast.id} elevation={1}>
							<CardContent>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
									}}
								>
									<Box sx={{ flex: 1 }}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
												mb: 1,
											}}
										>
											<Typography variant="h6">
												{formatDuration(fast.actualDuration)}
											</Typography>
											<Chip
												icon={
													fast.completed ? <CompleteIcon /> : <IncompleteIcon />
												}
												label={fast.completed ? "Completed" : "Stopped Early"}
												color={fast.completed ? "success" : "warning"}
												size="small"
											/>
										</Box>

										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 0.5 }}
										>
											Started: {formatDateTime(fast.startTime)}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 0.5 }}
										>
											Ended: {formatDateTime(fast.endTime)}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Target: {formatDuration(fast.targetDuration)}
										</Typography>

										{fast.pausedTime > 0 && (
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mt: 0.5 }}
											>
												Paused: {formatDuration(fast.pausedTime)}
											</Typography>
										)}
									</Box>

									<IconButton
										onClick={(e) => handleMenuOpen(e, fast)}
										size="small"
									>
										<MoreIcon />
									</IconButton>
								</Box>
							</CardContent>
						</Card>
					))}
				</Stack>

				{/* Actions Menu */}
				<Menu
					anchorEl={menuAnchor}
					open={Boolean(menuAnchor)}
					onClose={handleMenuClose}
				>
					<MenuItem onClick={handleEdit}>
						<ListItemIcon>
							<EditIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Edit</ListItemText>
					</MenuItem>
					<MenuItem onClick={handleDelete}>
						<ListItemIcon>
							<DeleteIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Delete</ListItemText>
					</MenuItem>
				</Menu>

				{/* Edit Dialog */}
				<Dialog
					open={editDialogOpen}
					onClose={handleCancelEdit}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>Edit Fast</DialogTitle>
					<DialogContent>
						<Stack spacing={3} sx={{ mt: 1 }}>
							<DateTimePicker
								label="Start Date & Time"
								value={editingFast?.startTime}
								onChange={(newValue) =>
									setEditingFast((prev) => ({ ...prev, startTime: newValue }))
								}
								renderInput={(params) => <TextField {...params} fullWidth />}
							/>

							<DateTimePicker
								label="End Date & Time"
								value={editingFast?.endTime}
								onChange={(newValue) =>
									setEditingFast((prev) => ({ ...prev, endTime: newValue }))
								}
								renderInput={(params) => <TextField {...params} fullWidth />}
							/>

							{editingFast?.startTime && editingFast?.endTime && (
								<Alert severity="info">
									Duration:{" "}
									{formatDuration(
										editingFast.endTime.diff(editingFast.startTime),
									)}
								</Alert>
							)}
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCancelEdit}>Cancel</Button>
						<Button onClick={handleSaveEdit} variant="contained">
							Save Changes
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</LocalizationProvider>
	);
};

export default HistoryScreen;
