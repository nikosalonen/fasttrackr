import {
	Close as CloseIcon,
	Favorite as FavoriteIcon,
	Timer as TimerIcon,
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
	IconButton,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import React from "react";

const WelcomeScreen = ({ open, onClose }) => {
	const theme = useTheme();

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					mx: 2,
				},
			}}
		>
			<DialogTitle sx={{ textAlign: "center", pb: 1 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 1,
						mb: 1,
					}}
				>
					<TimerIcon sx={{ fontSize: 32, color: "primary.main" }} />
					<Typography
						variant="h4"
						component="span"
						fontWeight="bold"
						color="primary.main"
					>
						FastTrackr
					</Typography>
				</Box>
				<Typography
					variant="subtitle1"
					color="text.secondary"
					fontWeight="normal"
				>
					Welcome to your fasting journey! 🎉
				</Typography>
				<IconButton
					onClick={onClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: "grey.500",
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent>
				<Stack spacing={3}>
					{/* Main Welcome Message */}
					<Card
						sx={{
							bgcolor: "primary.50",
							border: `1px solid ${theme.palette.primary.main}20`,
						}}
					>
						<CardContent>
							<Typography variant="body1" sx={{ lineHeight: 1.6 }}>
								<strong>FastTrackr is completely free and ad-free!</strong>I
								believe your fasting journey should be peaceful and
								uninterrupted.
							</Typography>
						</CardContent>
					</Card>

					{/* Support Section */}
					<Box>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
							<FavoriteIcon sx={{ color: "error.main", fontSize: 20 }} />
							<Typography variant="h6" fontWeight="600">
								Support Development (Optional)
							</Typography>
						</Box>

						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ lineHeight: 1.6 }}
						>
							If you'd like to support the development of FastTrackr, you can
							voluntarily view an advertisement occasionally. You'll find a{" "}
							<strong>"☕ Support Dev"</strong> button in the settings - but
							it's entirely up to you!
						</Typography>

						<Box
							sx={{
								mt: 2,
								p: 2,
								bgcolor: "grey.50",
								borderRadius: 1,
								border: `1px solid ${theme.palette.grey[200]}`,
							}}
						>
							<Typography
								variant="body2"
								color="text.secondary"
								fontStyle="italic"
							>
								💡 <strong>No pressure, no reminders</strong> - just click when
								you want to help. Every voluntary view helps keep FastTrackr
								free and ad-free for everyone.
							</Typography>
						</Box>
					</Box>

					{/* Features Overview */}
					<Box>
						<Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
							What you can do with FastTrackr:
						</Typography>
						<Stack spacing={1}>
							<Typography variant="body2" color="text.secondary">
								⏱️ Track 16:8, 18:6, 24h, or custom fasting periods
							</Typography>
							<Typography variant="body2" color="text.secondary">
								📊 View detailed history and statistics
							</Typography>
							<Typography variant="body2" color="text.secondary">
								🔔 Get notified when your fast is complete
							</Typography>
							<Typography variant="body2" color="text.secondary">
								📱 Works offline as a Progressive Web App
							</Typography>
							<Typography variant="body2" color="text.secondary">
								🌙 Dark mode support for comfortable viewing
							</Typography>
						</Stack>
					</Box>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ p: 3, pt: 1 }}>
				<Button
					onClick={onClose}
					variant="contained"
					fullWidth
					size="large"
					sx={{ borderRadius: 2 }}
				>
					Start My Fasting Journey
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default WelcomeScreen;
