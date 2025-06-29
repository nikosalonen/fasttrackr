import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Fade,
  useTheme,
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayCircle as ResumeIcon,
} from '@mui/icons-material'
import { useFastTimer } from '../hooks/useFastTimer'
import { useNotifications } from '../hooks/useNotifications'

const TimerScreen = () => {
  const theme = useTheme()
  const {
    isRunning,
    isPaused,
    elapsedTime,
    targetDuration,
    startFast,
    stopFast,
    pauseFast,
    resumeFast,
    formatTime,
    getProgress,
    isCompleted,
  } = useFastTimer()

  const { showFastCompleteNotification } = useNotifications()

  const [selectedDuration, setSelectedDuration] = useState(16)
  const [customHours, setCustomHours] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const progress = getProgress()
  const completed = isCompleted()

  // Handle fast completion notification
  useEffect(() => {
    if (completed && isRunning) {
      showFastCompleteNotification(targetDuration)
    }
  }, [completed, isRunning, targetDuration, showFastCompleteNotification])

  const handleStart = () => {
    const duration = showCustomInput ? parseInt(customHours) : selectedDuration
    if (showCustomInput && (!duration || duration <= 0)) {
      alert('Please enter a valid duration in hours')
      return
    }
    startFast(duration)
  }

  const handleDurationChange = (value) => {
    setSelectedDuration(value)
    setShowCustomInput(value === 'custom')
  }

  const targetHours = Math.floor(targetDuration / (1000 * 60 * 60))

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Stack spacing={3}>
        {/* Timer Display */}
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography
              variant="h2"
              component="div"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: completed ? 'success.main' : 'primary.main',
                fontSize: { xs: '2.5rem', sm: '3.5rem' },
                mb: 1,
              }}
            >
              {formatTime(elapsedTime)}
            </Typography>
            
            {isRunning && (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Target: {targetHours}:00:00
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: completed ? theme.palette.success.main : theme.palette.primary.main,
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {Math.round(progress)}% Complete
                  </Typography>
                </Box>

                {completed && (
                  <Chip
                    label="🎉 Fast Complete!"
                    color="success"
                    variant="filled"
                    sx={{ fontSize: '1rem', py: 2, px: 1 }}
                  />
                )}

                {isPaused && (
                  <Chip
                    label="⏸️ Paused"
                    color="warning"
                    variant="filled"
                    sx={{ fontSize: '1rem', py: 2, px: 1 }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Timer Controls */}
        <Card elevation={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Controls
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              {!isRunning ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={handleStart}
                  sx={{ minWidth: 140 }}
                >
                  Start Fast
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<StopIcon />}
                    onClick={stopFast}
                  >
                    Stop Fast
                  </Button>
                  
                  {isPaused ? (
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<ResumeIcon />}
                      onClick={resumeFast}
                    >
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="warning"
                      size="large"
                      startIcon={<PauseIcon />}
                      onClick={pauseFast}
                    >
                      Pause
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Duration Setup */}
        {!isRunning && (
          <Fade in={!isRunning}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fast Duration
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Duration</InputLabel>
                    <Select
                      value={showCustomInput ? 'custom' : selectedDuration}
                      label="Duration"
                      onChange={(e) => handleDurationChange(e.target.value)}
                    >
                      <MenuItem value={12}>12 hours</MenuItem>
                      <MenuItem value={16}>16 hours (Recommended)</MenuItem>
                      <MenuItem value={18}>18 hours</MenuItem>
                      <MenuItem value={20}>20 hours</MenuItem>
                      <MenuItem value={24}>24 hours</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {showCustomInput && (
                    <Fade in={showCustomInput}>
                      <TextField
                        label="Custom Hours"
                        type="number"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                        inputProps={{ min: 1, max: 168 }}
                        helperText="Enter hours (1-168)"
                        fullWidth
                      />
                    </Fade>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Fasting Tips */}
        {!isRunning && (
          <Card elevation={1} sx={{ backgroundColor: 'background.default' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Fasting Tips
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Stay hydrated with water, herbal tea, or black coffee
                <br />
                • Listen to your body and stop if you feel unwell
                <br />
                • Start with shorter fasts and gradually increase duration
                <br />
                • Break your fast with nutritious, easy-to-digest foods
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  )
}

export default TimerScreen 