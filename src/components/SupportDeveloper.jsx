import { SportsBar as BeerIcon, Close as CloseIcon } from "@mui/icons-material";
import {
	Box,
	Card,
	CardContent,
	IconButton,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import { useState } from "react";

const SupportDeveloper = () => {
	const theme = useTheme();
	const [isDismissed, setIsDismissed] = useState(() => {
		return localStorage.getItem("fasttrackr_support_dismissed") === "true";
	});

	// Don't render if dismissed
	if (isDismissed) {
		return null;
	}

	const handleDismiss = () => {
		localStorage.setItem("fasttrackr_support_dismissed", "true");
		setIsDismissed(true);
	};

	return (
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
							<BeerIcon sx={{ color: "warning.main", fontSize: 24 }} />
							<Typography variant="subtitle1" fontWeight="600">
								Support Development
							</Typography>
						</Box>
						<IconButton
							onClick={handleDismiss}
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
						FastTrackr is completely free and ad-free. If you'd like to support
						continued development, you can buy me a beer!
					</Typography>

					{/* Buy Me a Beer Button */}
					<Box sx={{ display: "flex", justifyContent: "center" }}>
						<a
							href="https://www.buymeacoffee.com/nikosalonen"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍺&slug=nikosalonen&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
								alt="Buy Me A Beer"
								style={{ height: "60px", width: "217px" }}
							/>
						</a>
					</Box>

					{/* Info Note */}
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ fontStyle: "italic" }}
					>
						💡 No pressure, no reminders - just click when you want to help! You
						can also dismiss this section with the ✕ button above and it won't
						show again.
					</Typography>
				</Stack>
			</CardContent>
		</Card>
	);
};

export default SupportDeveloper;
