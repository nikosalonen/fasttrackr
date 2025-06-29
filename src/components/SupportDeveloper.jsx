import {
	Close as CloseIcon,
	Coffee as CoffeeIcon,
	Favorite as FavoriteIcon,
	PlayCircleFilled as PlayIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import useAdSupport from "../hooks/useAdSupport";

const SupportDeveloper = () => {
	const theme = useTheme();
	const {
		supportCount,
		isShowingAd,
		showSupportAd,
		getSupportStats,
		hasEverSupported,
		isSupportDismissed,
		dismissSupport,
	} = useAdSupport();

	const [showThankYou, setShowThankYou] = useState(false);
	const [thankYouMessage, setThankYouMessage] = useState("");

	const stats = getSupportStats();

	// Auto-close thank you dialog after 3 seconds with proper cleanup
	useEffect(() => {
		if (showThankYou) {
			const timeoutId = setTimeout(() => {
				setShowThankYou(false);
			}, 3000);

			// Cleanup function to clear timeout on unmount or state change
			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [showThankYou]);

	// Don't render if dismissed
	if (isSupportDismissed) {
		return null;
	}

	const handleSupportClick = async () => {
		try {
			const result = await showSupportAd();
			if (result.success) {
				setThankYouMessage(result.message);
				setShowThankYou(true);
			}
		} catch (error) {
			console.error("Error showing support ad:", error);
		}
	};

	return (
		<>
			<Card sx={{ border: `1px solid ${theme.palette.primary.main}30` }}>
				<CardContent>
					<Stack spacing={2}>
						{/* Header */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<CoffeeIcon sx={{ color: "warning.main", fontSize: 24 }} />
								<Typography variant="subtitle1" fontWeight="600">
									Support Development
								</Typography>
							</Box>
							<IconButton
								onClick={dismissSupport}
								size="small"
								sx={{ color: "text.secondary" }}
								aria-label="Dismiss support section"
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>

						{/* Description */}
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ lineHeight: 1.6 }}
						>
							FastTrackr is completely free and ad-free. If you'd like to
							support continued development, you can voluntarily view an
							advertisement.
						</Typography>

						{/* Support Stats */}
						{hasEverSupported && (
							<Box
								sx={{
									p: 2,
									bgcolor: "success.light",
									borderRadius: 1,
									border: `1px solid ${theme.palette.success.main}20`,
								}}
							>
								<Typography
									variant="body2"
									color="success.dark"
									fontWeight="600"
								>
									🎉 Thank you for your support!
								</Typography>
								<Typography variant="caption" color="success.dark">
									You've supported {stats.totalSupports} time
									{stats.totalSupports !== 1 ? "s" : ""} total
									{stats.thisMonth > 0 && ` (${stats.thisMonth} this month)`}
								</Typography>
							</Box>
						)}

						{/* Support Button */}
						<Button
							variant="contained"
							onClick={handleSupportClick}
							disabled={isShowingAd}
							startIcon={
								isShowingAd ? <CircularProgress size={20} /> : <CoffeeIcon />
							}
							sx={{
								borderRadius: 2,
								textTransform: "none",
								fontWeight: 600,
								bgcolor: "warning.main",
								"&:hover": {
									bgcolor: "warning.dark",
								},
							}}
						>
							{isShowingAd ? "Loading..." : "☕ Support Dev"}
						</Button>

						{/* Info Note */}
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontStyle: "italic" }}
						>
							💡 No pressure, no reminders - just click when you want to help!
							You can also dismiss this section with the ✕ button above and it
							won't show again.
						</Typography>
					</Stack>
				</CardContent>
			</Card>

			{/* Ad Loading Dialog */}
			<Dialog
				open={isShowingAd}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 2,
						mx: 2,
					},
				}}
			>
				<DialogTitle sx={{ textAlign: "center" }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 1,
						}}
					>
						<PlayIcon sx={{ fontSize: 28, color: "primary.main" }} />
						<Typography variant="h6" fontWeight="600">
							Loading Advertisement
						</Typography>
					</Box>
				</DialogTitle>
				<DialogContent>
					<Box sx={{ textAlign: "center", py: 4 }}>
						<CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
						<Typography variant="body1" color="text.secondary">
							Thank you for supporting FastTrackr! 🙏
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							Your support helps keep the app free for everyone.
						</Typography>
					</Box>
				</DialogContent>
			</Dialog>

			{/* Thank You Dialog */}
			<Dialog
				open={showThankYou}
				onClose={() => setShowThankYou(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 2,
						mx: 2,
					},
				}}
			>
				<DialogContent sx={{ textAlign: "center", py: 4 }}>
					<FavoriteIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
					<Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
						Thank You!
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{thankYouMessage}
					</Typography>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default SupportDeveloper;
