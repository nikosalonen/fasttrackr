import { Close as CloseIcon, GetApp as InstallIcon } from "@mui/icons-material";
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const InstallPrompt = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [showPrompt, setShowPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);
	const [neverShowAgain, setNeverShowAgain] = useState(false);

	useEffect(() => {
		// Check if already installed
		const checkInstalled = () => {
			if (
				window.matchMedia("(display-mode: standalone)").matches ||
				window.navigator.standalone
			) {
				setIsInstalled(true);
				return;
			}
		};

		// Check if user has opted to never show the prompt again
		const checkNeverShowAgain = () => {
			return localStorage.getItem("installPromptNeverShow") === "true";
		};

		// Determine if we should show the prompt based on current launch count
		const shouldShowPrompt = () => {
			if (checkNeverShowAgain()) {
				return false;
			}

			// Get current launch count (already tracked in main.jsx)
			const launchCount = parseInt(
				localStorage.getItem("appLaunchCount") || "0",
			);

			// Show on 5th launch, then every 10th launch after that
			if (launchCount === 5) {
				return true;
			} else if (launchCount > 5 && (launchCount - 5) % 10 === 0) {
				return true;
			}

			return false;
		};

		// Listen for beforeinstallprompt event
		const handleBeforeInstallPrompt = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);

			// Show prompt after a delay if conditions are met
			setTimeout(() => {
				if (shouldShowPrompt()) {
					setShowPrompt(true);
				}
			}, 3000); // Show after 3 seconds to not be too aggressive
		};

		// Listen for app installation
		const handleAppInstalled = () => {
			setIsInstalled(true);
			setShowPrompt(false);
			setDeferredPrompt(null);
			localStorage.setItem("appInstalled", "true");
		};

		checkInstalled();
		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) {
			// Fallback for iOS Safari and other browsers
			setShowPrompt(false);
			showInstallInstructions();
			return;
		}

		try {
			const result = await deferredPrompt.prompt();
			console.log("Install prompt result:", result);

			if (result.outcome === "accepted") {
				console.log("User accepted the install prompt");
			} else {
				console.log("User dismissed the install prompt");
			}
		} catch (error) {
			console.error("Error showing install prompt:", error);
			showInstallInstructions();
		}

		setDeferredPrompt(null);
		setShowPrompt(false);

		// Save "never show again" preference if checked
		if (neverShowAgain) {
			localStorage.setItem("installPromptNeverShow", "true");
		}
	};

	const showInstallInstructions = () => {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isSafari =
			/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

		let instructions = "";

		if (isIOS && isSafari) {
			instructions =
				'To install FastTrackr:\n1. Tap the Share button at the bottom\n2. Tap "Add to Home Screen"\n3. Tap "Add" to confirm';
		} else if (navigator.userAgent.includes("Chrome")) {
			instructions =
				'To install FastTrackr:\n1. Click the menu (⋮) in your browser\n2. Select "Install FastTrackr" or "Add to Home Screen"';
		} else {
			instructions =
				'To install FastTrackr, look for "Install" or "Add to Home Screen" options in your browser menu.';
		}

		alert(instructions);
	};

	const handleDismiss = () => {
		setShowPrompt(false);

		// Save "never show again" preference if checked
		if (neverShowAgain) {
			localStorage.setItem("installPromptNeverShow", "true");
		}
	};

	// Don't show if already installed or no prompt available
	if (isInstalled || !showPrompt) {
		return null;
	}

	return (
		<Dialog
			open={showPrompt}
			onClose={handleDismiss}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					mx: 1,
				},
			}}
		>
			<DialogTitle sx={{ position: "relative", pb: 1 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<InstallIcon color="primary" />
					<Typography variant="h6">Install FastTrackr</Typography>
				</Box>
				<IconButton
					onClick={handleDismiss}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent>
				<Typography variant="body1" paragraph>
					Get the best experience with FastTrackr by installing it on your
					device!
				</Typography>

				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary" component="div">
						Installing FastTrackr gives you:
						<br />• Quick access from your home screen
						<br />• Offline functionality
						<br />• Push notifications
						<br />• Full-screen experience
						<br />• Faster loading times
					</Typography>
				</Box>

				{isMobile && (
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ fontStyle: "italic", mb: 2 }}
					>
						Perfect for tracking your fasts on the go! 📱
					</Typography>
				)}

				<FormControlLabel
					control={
						<Checkbox
							checked={neverShowAgain}
							onChange={(e) => setNeverShowAgain(e.target.checked)}
							size="small"
						/>
					}
					label={
						<Typography variant="body2" color="text.secondary">
							Don't show this again
						</Typography>
					}
				/>
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 3 }}>
				<Button onClick={handleDismiss} color="inherit">
					Not Now
				</Button>
				<Button
					onClick={handleInstall}
					variant="contained"
					startIcon={<InstallIcon />}
					sx={{ minWidth: 120 }}
				>
					Install
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default InstallPrompt;
