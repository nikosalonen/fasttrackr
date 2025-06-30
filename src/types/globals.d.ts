// PWA-specific type definitions

interface WindowControlsOverlay {
	visible: boolean;
	getTitlebarAreaRect(): DOMRect;
}

interface Navigator {
	windowControlsOverlay?: WindowControlsOverlay;
}

// Service Worker types
interface ServiceWorkerRegistration {
	showNotification(title: string, options?: NotificationOptions): Promise<void>;
}

// Web Share API
interface Navigator {
	share?: (data: ShareData) => Promise<void>;
	canShare?: (data: ShareData) => boolean;
}

interface ShareData {
	title?: string;
	text?: string;
	url?: string;
}
