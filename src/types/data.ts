export interface FastRecord {
	id: string;
	startTime: Date;
	endTime: Date | null;
	targetHours: number;
	completed: boolean;
	notes?: string;
}

export interface AppSettings {
	notifications: boolean;
	theme: "light" | "dark" | "system";
	defaultFastingHours: number;
	timeFormat: "12h" | "24h";
}
