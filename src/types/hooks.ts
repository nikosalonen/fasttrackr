// Hook return type interfaces

export interface FastRecord {
	id: number;
	startTime: string; // ISO string
	endTime?: string;
	targetDuration: number;
	actualDuration?: number;
	isRunning: boolean;
	completed?: boolean;
	pausedTime?: number;
}

export interface WindowControlsOverlayHook {
	isSupported: boolean;
	isActive: boolean;
	titleBarAreaRect: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	getTitleBarAreaCSS: () => Record<string, string>;
	isWindowControlsOverlayMode: boolean;
	isDraggableArea: (x: number, y: number) => boolean;
}

export interface NotificationContextValue {
	// State
	permission: NotificationPermission;
	isEnabled: boolean;
	milestoneNotifications: boolean;
	
	// Actions
	requestPermission: () => Promise<NotificationPermission | 'error' | 'unsupported'>;
	showNotification: (title: string, options?: NotificationOptions) => Notification | null;
	showFastCompleteNotification: (duration: number) => void;
	showMilestoneNotification: (hours: number) => void;
	toggleNotifications: (enabled: boolean) => Promise<void>;
	toggleMilestoneNotifications: (enabled: boolean) => void;
	
	// Computed
	canShowNotifications: () => boolean;
}

export interface FastTimerContextValue {
	// State
	isRunning: boolean;
	startTime: Date | null;
	targetDuration: number;
	elapsedTime: number;
	currentFast: FastRecord | null;
	
	// Actions
	startFast: (duration?: number) => void;
	stopFast: () => FastRecord | undefined;
	modifyStartTime: (newStartTime: Date) => void;
	
	// Computed
	formatTime: (milliseconds: number) => string;
	getProgress: () => number;
	isCompleted: () => boolean;
}
