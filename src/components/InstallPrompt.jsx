import { Close as CloseIcon, GetApp as InstallIcon } from "@mui/icons-material";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

const InstallPrompt = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [showPrompt, setShowPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

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

		// Listen for beforeinstallprompt event
		const handleBeforeInstallPrompt = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);

			// Show prompt after a delay (don't be too aggressive)
			setTimeout(() => {
				const hasBeenPrompted = localStorage.getItem("installPromptShown");
				const lastPrompted = localStorage.getItem("lastInstallPrompt");
				const now = Date.now();
				const oneDayAgo = now - 24 * 60 * 60 * 1000;

				if (
					!hasBeenPrompted ||
					(lastPrompted && Number.parseInt(lastPrompted) < oneDayAgo)
				) {
					setShowPrompt(true);
				}
			}, 10000); // Show after 10 seconds
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
		localStorage.setItem("installPromptShown", "true");
		localStorage.setItem("lastInstallPrompt", Date.now().toString());
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
		localStorage.setItem("installPromptShown", "true");
		localStorage.setItem("lastInstallPrompt", Date.now().toString());
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
						sx={{ fontStyle: "italic" }}
					>
						Perfect for tracking your fasts on the go! 📱
					</Typography>
				)}
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
