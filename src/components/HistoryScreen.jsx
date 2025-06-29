import {
	CheckCircle as CompleteIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Cancel as IncompleteIcon,
	MoreVert as MoreIcon,
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
import React, { useEffect, useState } from "react";

const HistoryScreen = () => {
	const [fasts, setFasts] = useState([]);
	const [editingFast, setEditingFast] = useState(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [selectedFast, setSelectedFast] = useState(null);

	useEffect(() => {
		loadHistory();
	}, []);

	const loadHistory = () => {
		const history = JSON.parse(localStorage.getItem("fastHistory") || "[]");
		setFasts(history);
	};

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

	const formatDateTime = (dateString) => {
		return dayjs(dateString).format("MMM D, YYYY h:mm A");
	};

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

				<Stack spacing={2}>
					{fasts.map((fast) => (
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
