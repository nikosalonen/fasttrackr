import {
	Close as CloseIcon,
	CloudDownload as CloudDownloadIcon,
	Refresh as RefreshIcon,
	Update as UpdateIcon,
} from "@mui/icons-material";
import {
	Alert,
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
import {
	checkForUpdates,
	updateServiceWorker,
} from "../utils/serviceWorkerManager.js";

// Standalone update utility functions
export const updateUtils = {
	checkForUpdates: async () => {
		try {
			await checkForUpdates();
			console.log("Manual update check completed");
		} catch (error) {
			console.error("Manual update check failed:", error);
		}
	},
	forceUpdate: async () => {
		try {
			window.location.reload();
		} catch (error) {
			console.error("Force update failed:", error);
		}
	},
};

const UpdateNotification = () => {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [showForceUpdateDialog, setShowForceUpdateDialog] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateMessage, setUpdateMessage] = useState("");

	useEffect(() => {
		// Listen for service worker update events
		const handleUpdateAvailable = (_event) => {
			console.log("Update available notification triggered");
			setUpdateAvailable(true);
			setUpdateMessage(
				"New version available! Tap Update to get the latest features.",
			);
		};

		const handleOfflineReady = (_event) => {
			console.log("App ready for offline use");
			setUpdateMessage("App is now ready for offline use!");
			setUpdateAvailable(true);
			// Auto-hide after 5 seconds
			setTimeout(() => setUpdateAvailable(false), 5000);
		};

		const handleUpdateFound = (_event) => {
			console.log("Update found, downloading...");
			setUpdateMessage("Downloading update...");
			setUpdateAvailable(true);
		};

		// Add event listeners
		window.addEventListener("sw-update-available", handleUpdateAvailable);
		window.addEventListener("sw-offline-ready", handleOfflineReady);
		window.addEventListener("sw-update-found", handleUpdateFound);

		// Cleanup event listeners
		return () => {
			window.removeEventListener("sw-update-available", handleUpdateAvailable);
			window.removeEventListener("sw-offline-ready", handleOfflineReady);
			window.removeEventListener("sw-update-found", handleUpdateFound);
		};
	}, []);

	const handleApplyUpdate = async () => {
		setIsUpdating(true);
		try {
			await updateServiceWorker();
			// The page will reload automatically after the update
		} catch (error) {
			console.error("Update application failed:", error);
			setIsUpdating(false);
			setUpdateMessage("Update failed. Please try again.");
		}
	};

	const handleForceUpdate = async () => {
		setIsUpdating(true);
		setShowForceUpdateDialog(false);
		try {
			// Force reload the page
			window.location.reload();
		} catch (error) {
			console.error("Force update failed:", error);
			setIsUpdating(false);
		}
	};

	const _handleCheckForUpdates = async () => {
		setIsUpdating(true);
		try {
			await checkForUpdates();
			// Give it a moment to detect updates
			setTimeout(() => {
				if (!updateAvailable) {
					setUpdateMessage("No updates available.");
					setUpdateAvailable(true);
					// Auto-hide after 3 seconds
					setTimeout(() => setUpdateAvailable(false), 3000);
				}
				setIsUpdating(false);
			}, 2000);
		} catch (error) {
			console.error("Check for updates failed:", error);
			setIsUpdating(false);
			setUpdateMessage("Failed to check for updates.");
			setUpdateAvailable(true);
			// Auto-hide after 3 seconds
			setTimeout(() => setUpdateAvailable(false), 3000);
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
						{updateMessage ||
							"🎉 New version available! Tap Update to get the latest features."}
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

export default UpdateNotification;
