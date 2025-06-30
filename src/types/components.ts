export interface CircularProgressTimerProps {
	progress: number;
	isRunning: boolean;
	completed: boolean;
	displayTime: string;
	timeLabel?: string;
	onTimeToggle?: () => void;
	targetHours: number;
	size?: number;
	strokeWidth?: number;
}
