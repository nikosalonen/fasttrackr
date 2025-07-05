import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

const FastTimerContext = createContext();

export const useFastTimer = () => {
	const context = useContext(FastTimerContext);
	if (!context) {
		throw new Error("useFastTimer must be used within a FastTimerProvider");
	}
	return context;
};

export const FastTimerProvider = ({ children }) => {
	const [isRunning, setIsRunning] = useState(false);
	const [startTime, setStartTime] = useState(null);
	const [targetDuration, setTargetDuration] = useState(16 * 60 * 60 * 1000); // 16 hours
	const [currentFast, setCurrentFast] = useState(null);
	const [elapsedTime, setElapsedTime] = useState(0);

	// Load saved fast on mount
	useEffect(() => {
		const savedFast = localStorage.getItem("currentFast");
		if (savedFast) {
			const fast = JSON.parse(savedFast);
			setCurrentFast(fast);
			setStartTime(new Date(fast.startTime));
			setTargetDuration(fast.targetDuration);
			setIsRunning(fast.isRunning);
		}
	}, []);

	// Update elapsed time
	useEffect(() => {
		let interval = null;

		if (isRunning && startTime) {
			interval = setInterval(() => {
				const now = new Date();
				const elapsed = now.getTime() - startTime.getTime();
				setElapsedTime(elapsed);
			}, 1000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isRunning, startTime]);

	const startFast = useCallback((duration = null) => {
		const targetHours = duration || 16;
		const target = targetHours * 60 * 60 * 1000;

		const now = new Date();
		const fast = {
			id: Date.now(),
			startTime: now.toISOString(),
			targetDuration: target,
			isRunning: true,
		};

		setCurrentFast(fast);
		setStartTime(now);
		setTargetDuration(target);
		setIsRunning(true);
		setElapsedTime(0);

		localStorage.setItem("currentFast", JSON.stringify(fast));
	}, []);

	const stopFast = useCallback(
		(note = "") => {
			if (!isRunning || !currentFast) return;

			const endTime = new Date();
			const actualDuration = endTime.getTime() - startTime.getTime();

			// Save to history
			const fastRecord = {
				id: currentFast.id,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				targetDuration,
				actualDuration,
				completed: actualDuration >= targetDuration,
				note: note.trim(),
			};

			const history = JSON.parse(localStorage.getItem("fastHistory") || "[]");
			history.unshift(fastRecord);

			// Keep only last 100 fasts
			if (history.length > 100) {
				history.splice(100);
			}

			localStorage.setItem("fastHistory", JSON.stringify(history));

			// Clear current fast
			setIsRunning(false);
			setCurrentFast(null);
			setElapsedTime(0);

			localStorage.removeItem("currentFast");

			return fastRecord;
		},
		[isRunning, currentFast, startTime, targetDuration],
	);

	const modifyStartTime = useCallback(
		(newStartTime) => {
			if (!isRunning || !currentFast) return;

			const updatedStartTime = new Date(newStartTime);
			const updatedFast = {
				...currentFast,
				startTime: updatedStartTime.toISOString(),
			};

			setCurrentFast(updatedFast);
			setStartTime(updatedStartTime);

			// Update localStorage
			localStorage.setItem("currentFast", JSON.stringify(updatedFast));

			// Immediately update elapsed time
			const now = new Date();
			const elapsed = now.getTime() - updatedStartTime.getTime();
			setElapsedTime(elapsed);
		},
		[isRunning, currentFast],
	);

	const formatTime = useCallback((milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}, []);

	const getProgress = useCallback(() => {
		if (!targetDuration || targetDuration === 0) return 0;
		return (elapsedTime / targetDuration) * 100;
	}, [elapsedTime, targetDuration]);

	const isCompleted = useCallback(() => {
		return elapsedTime >= targetDuration;
	}, [elapsedTime, targetDuration]);

	// Add function to update existing fast notes
	const updateFastNote = useCallback((fastId, note) => {
		const history = JSON.parse(localStorage.getItem("fastHistory") || "[]");
		const updatedHistory = history.map((fast) => {
			if (fast.id === fastId) {
				return { ...fast, note: note.trim() };
			}
			return fast;
		});
		localStorage.setItem("fastHistory", JSON.stringify(updatedHistory));
		return updatedHistory;
	}, []);

	const value = {
		// State
		isRunning,
		startTime,
		targetDuration,
		elapsedTime,
		currentFast,

		// Actions
		startFast,
		stopFast,
		modifyStartTime,
		updateFastNote,

		// Computed
		formatTime,
		getProgress,
		isCompleted,
	};

	return (
		<FastTimerContext.Provider value={value}>
			{children}
		</FastTimerContext.Provider>
	);
};
