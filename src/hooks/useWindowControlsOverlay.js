import { useEffect, useState } from "react";

/**
 * Hook to detect and manage Window Controls Overlay API
 * @returns {Object} WCO state and utilities
 */
export const useWindowControlsOverlay = () => {
	const [isSupported, setIsSupported] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const [titleBarAreaRect, setTitleBarAreaRect] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});

	useEffect(() => {
		// Check if Window Controls Overlay is supported
		const checkSupport = () => {
			const supported =
				"windowControlsOverlay" in navigator &&
				CSS.supports("top: env(titlebar-area-height)");
			setIsSupported(supported);

			if (supported && navigator.windowControlsOverlay) {
				// Check if WCO is currently active
				setIsActive(navigator.windowControlsOverlay.visible);

				// Get initial title bar area rect
				if (navigator.windowControlsOverlay.visible) {
					setTitleBarAreaRect(
						navigator.windowControlsOverlay.getTitlebarAreaRect(),
					);
				}
			}
		};

		checkSupport();

		// Listen for changes in WCO visibility
		const handleGeometryChange = (_) => {
			setIsActive(navigator.windowControlsOverlay.visible);
			if (navigator.windowControlsOverlay.visible) {
				setTitleBarAreaRect(
					navigator.windowControlsOverlay.getTitlebarAreaRect(),
				);
			}
		};

		if (isSupported && navigator.windowControlsOverlay) {
			navigator.windowControlsOverlay.addEventListener(
				"geometrychange",
				handleGeometryChange,
			);

			return () => {
				navigator.windowControlsOverlay.removeEventListener(
					"geometrychange",
					handleGeometryChange,
				);
			};
		}
	}, [isSupported]);

	// Get CSS environment variables for title bar area
	const getTitleBarAreaCSS = () => {
		if (!isActive) return {};

		return {
			"--titlebar-area-x": `${titleBarAreaRect.x}px`,
			"--titlebar-area-y": `${titleBarAreaRect.y}px`,
			"--titlebar-area-width": `${titleBarAreaRect.width}px`,
			"--titlebar-area-height": `${titleBarAreaRect.height}px`,
		};
	};

	// Check if current display mode is window-controls-overlay
	const isWindowControlsOverlayMode = () => {
		return window.matchMedia("(display-mode: window-controls-overlay)").matches;
	};

	return {
		isSupported,
		isActive,
		titleBarAreaRect,
		getTitleBarAreaCSS,
		isWindowControlsOverlayMode: isWindowControlsOverlayMode(),

		// Utility functions
		isDraggableArea: (x, y) => {
			if (!isActive) return false;
			return (
				x >= titleBarAreaRect.x &&
				x <= titleBarAreaRect.x + titleBarAreaRect.width &&
				y >= titleBarAreaRect.y &&
				y <= titleBarAreaRect.y + titleBarAreaRect.height
			);
		},
	};
};

export default useWindowControlsOverlay;
