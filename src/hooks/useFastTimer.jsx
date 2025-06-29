import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const FastTimerContext = createContext()

export const useFastTimer = () => {
  const context = useContext(FastTimerContext)
  if (!context) {
    throw new Error('useFastTimer must be used within a FastTimerProvider')
  }
  return context
}

export const FastTimerProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [pausedTime, setPausedTime] = useState(0)
  const [targetDuration, setTargetDuration] = useState(16 * 60 * 60 * 1000) // 16 hours
  const [currentFast, setCurrentFast] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Load saved fast on mount
  useEffect(() => {
    const savedFast = localStorage.getItem('currentFast')
    if (savedFast) {
      const fast = JSON.parse(savedFast)
      setCurrentFast(fast)
      setStartTime(new Date(fast.startTime))
      setTargetDuration(fast.targetDuration)
      setIsRunning(fast.isRunning)
      setIsPaused(fast.isPaused || false)
      setPausedTime(fast.pausedTime || 0)
    }
  }, [])

  // Update elapsed time
  useEffect(() => {
    let interval = null
    
    if (isRunning && !isPaused && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = now.getTime() - startTime.getTime() - pausedTime
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, isPaused, startTime, pausedTime])

  const startFast = useCallback((duration = null) => {
    const targetHours = duration || 16
    const target = targetHours * 60 * 60 * 1000
    
    const now = new Date()
    const fast = {
      id: Date.now(),
      startTime: now.toISOString(),
      targetDuration: target,
      isRunning: true,
      isPaused: false,
      pausedTime: 0,
    }

    setCurrentFast(fast)
    setStartTime(now)
    setTargetDuration(target)
    setIsRunning(true)
    setIsPaused(false)
    setPausedTime(0)
    setElapsedTime(0)

    localStorage.setItem('currentFast', JSON.stringify(fast))
  }, [])

  const stopFast = useCallback(() => {
    if (!isRunning || !currentFast) return

    const endTime = new Date()
    const actualDuration = endTime.getTime() - startTime.getTime() - pausedTime

    // Save to history
    const fastRecord = {
      id: currentFast.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      targetDuration,
      actualDuration,
      completed: actualDuration >= targetDuration,
      pausedTime,
    }

    const history = JSON.parse(localStorage.getItem('fastHistory') || '[]')
    history.unshift(fastRecord)
    
    // Keep only last 100 fasts
    if (history.length > 100) {
      history.splice(100)
    }
    
    localStorage.setItem('fastHistory', JSON.stringify(history))

    // Clear current fast
    setIsRunning(false)
    setIsPaused(false)
    setCurrentFast(null)
    setPausedTime(0)
    setElapsedTime(0)
    
    localStorage.removeItem('currentFast')

    return fastRecord
  }, [isRunning, currentFast, startTime, pausedTime, targetDuration])

  const pauseFast = useCallback(() => {
    if (!isRunning) return

    setIsPaused(true)
    
    if (currentFast) {
      const updatedFast = { ...currentFast, isPaused: true }
      setCurrentFast(updatedFast)
      localStorage.setItem('currentFast', JSON.stringify(updatedFast))
    }
  }, [isRunning, currentFast])

  const resumeFast = useCallback(() => {
    if (!isRunning || !isPaused) return

    setIsPaused(false)
    
    if (currentFast) {
      const updatedFast = { ...currentFast, isPaused: false }
      setCurrentFast(updatedFast)
      localStorage.setItem('currentFast', JSON.stringify(updatedFast))
    }
  }, [isRunning, isPaused, currentFast])

  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const getProgress = useCallback(() => {
    if (!targetDuration || targetDuration === 0) return 0
    return Math.min((elapsedTime / targetDuration) * 100, 100)
  }, [elapsedTime, targetDuration])

  const isCompleted = useCallback(() => {
    return elapsedTime >= targetDuration
  }, [elapsedTime, targetDuration])

  const value = {
    // State
    isRunning,
    isPaused,
    startTime,
    targetDuration,
    elapsedTime,
    currentFast,
    
    // Actions
    startFast,
    stopFast,
    pauseFast,
    resumeFast,
    
    // Computed
    formatTime,
    getProgress,
    isCompleted,
  }

  return (
    <FastTimerContext.Provider value={value}>
      {children}
    </FastTimerContext.Provider>
  )
} 