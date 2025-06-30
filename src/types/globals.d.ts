// PWA-specific type definitions

interface WindowControlsOverlay extends EventTarget {
	visible: boolean;
	getTitlebarAreaRect(): DOMRect;
}

interface Navigator {
	windowControlsOverlay?: WindowControlsOverlay;
	share?: (data: ShareData) => Promise<void>;
	canShare?: (data: ShareData) => boolean;
}

// Service Worker types
interface ServiceWorkerRegistration {
	showNotification(title: string, options?: NotificationOptions): Promise<void>;
}

interface ShareData {
	title?: string;
	text?: string;
	url?: string;
}
