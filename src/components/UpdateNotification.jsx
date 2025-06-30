import {
	Close as CloseIcon,
	CloudDownload as CloudDownloadIcon,
	Refresh as RefreshIcon,
	Update as UpdateIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Snackbar,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import swManager from "../utils/serviceWorkerManager";

const UpdateNotification = () => {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [showForceUpdateDialog, setShowForceUpdateDialog] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [cacheVersion, setCacheVersion] = useState(null);

	useEffect(() => {
		// Set up service worker update listeners
		swManager.onUpdateAvailable(() => {
			console.log("Update available notification triggered");
			setUpdateAvailable(true);
		});

		swManager.onUpdateInstalled(() => {
			console.log("Update installed notification triggered");
			// Auto-hide the notification after successful update
			setUpdateAvailable(false);
			setIsUpdating(false);
		});

		// Get current cache version
		swManager.getCacheVersion().then((version) => {
			setCacheVersion(version);
		});

		// Initialize service worker
		swManager.init().catch((error) => {
			console.error("Service worker initialization failed:", error);
		});
	}, []);

	const handleApplyUpdate = async () => {
		setIsUpdating(true);
		try {
			const success = await swManager.applyUpdate();
			if (!success) {
				// No pending update, force refresh instead
				await swManager.forceRefresh();
			}
		} catch (error) {
			console.error("Update application failed:", error);
			setIsUpdating(false);
		}
	};

	const handleForceUpdate = async () => {
		setIsUpdating(true);
		setShowForceUpdateDialog(false);
		try {
			await swManager.forceRefresh();
		} catch (error) {
			console.error("Force update failed:", error);
			setIsUpdating(false);
		}
	};

	const _handleCheckForUpdates = async () => {
		setIsUpdating(true);
		try {
			await swManager.checkForUpdates();
			// Give it a moment to detect updates
			setTimeout(() => {
				if (!updateAvailable) {
					// No updates found, show notification
					setIsUpdating(false);
				}
			}, 2000);
		} catch (error) {
			console.error("Check for updates failed:", error);
			setIsUpdating(false);
		}
	};

	const handleDismiss = () => {
		setUpdateAvailable(false);
	};

	if (isUpdating) {
		return (
			<Snackbar
				open={true}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert severity="info" variant="filled">
					<Stack direction="row" alignItems="center" spacing={1}>
						<RefreshIcon className="animate-spin" />
						<Typography>Updating app...</Typography>
					</Stack>
				</Alert>
			</Snackbar>
		);
	}

	return (
		<>
			{/* Update Available Notification */}
			<Snackbar
				open={updateAvailable}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				onClose={handleDismiss}
				autoHideDuration={null} // Don't auto-hide
			>
				<Alert
					severity="success"
					variant="filled"
					action={
						<Stack direction="row" spacing={1}>
							<Button
								color="inherit"
								size="small"
								startIcon={<UpdateIcon />}
								onClick={handleApplyUpdate}
								sx={{ color: "white" }}
							>
								Update
							</Button>
							<IconButton
								size="small"
								color="inherit"
								onClick={handleDismiss}
								sx={{ color: "white" }}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Stack>
					}
				>
					<Typography variant="body2">
						🎉 New version available! Tap Update to get the latest features.
					</Typography>
				</Alert>
			</Snackbar>

			{/* Force Update Dialog */}
			<Dialog
				open={showForceUpdateDialog}
				onClose={() => setShowForceUpdateDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Force App Update</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This will clear all cached data and force reload the app with the
						latest version. Your fasting data will be preserved as it's stored
						locally.
					</DialogContentText>
					{cacheVersion && (
						<Box
							sx={{ mt: 2, p: 2, backgroundColor: "grey.100", borderRadius: 1 }}
						>
							<Typography variant="caption" color="text.secondary">
								Current cache version: {cacheVersion}
							</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowForceUpdateDialog(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleForceUpdate}
						variant="contained"
						color="warning"
						startIcon={<CloudDownloadIcon />}
					>
						Force Update
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

// Export functions for manual update checking
export const updateUtils = {
	checkForUpdates: () => swManager.checkForUpdates(),
	forceRefresh: () => swManager.forceRefresh(),
	showForceUpdateDialog: () => {
		// This would need to be connected to the component state
		// For now, just trigger force refresh directly
		swManager.forceRefresh();
	},
};

export default UpdateNotification;
