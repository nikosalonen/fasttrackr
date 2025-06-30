import type { FastRecord } from "./data";

export interface FastTimerContextValue {
	fastRecords: FastRecord[];
	fastingType: "16/8" | "18/6" | "20/4" | "21/3" | "22/2" | "23/1";
	fastingTime: number;
	notes: string;
}

export interface NotificationContextValue {
	showNotification: (title: string, options: NotificationOptions) => void;
}

export interface WindowControlsOverlayHook {
	windowControlsOverlay: WindowControlsOverlay;
}
