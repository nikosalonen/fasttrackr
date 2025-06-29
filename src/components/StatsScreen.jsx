import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  useTheme,
} from '@mui/material'
import {
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  LocalFire as StreakIcon,
} from '@mui/icons-material'

const StatsScreen = () => {
  const theme = useTheme()
  const [stats, setStats] = useState({
    totalFasts: 0,
    completedFasts: 0,
    totalTime: 0,
    averageDuration: 0,
    longestFast: 0,
    currentStreak: 0,
    thisWeekFasts: 0,
    thisMonthFasts: 0,
    completionRate: 0,
  })

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = () => {
    const fasts = JSON.parse(localStorage.getItem('fastHistory') || '[]')
    const now = new Date()

    if (fasts.length === 0) {
      setStats({
        totalFasts: 0,
        completedFasts: 0,
        totalTime: 0,
        averageDuration: 0,
        longestFast: 0,
        currentStreak: 0,
        thisWeekFasts: 0,
        thisMonthFasts: 0,
        completionRate: 0,
      })
      return
    }

    const totalFasts = fasts.length
    const completedFasts = fasts.filter(f => f.completed).length
    const totalTime = fasts.reduce((sum, f) => sum + f.actualDuration, 0)
    const averageDuration = totalTime / totalFasts
    const longestFast = Math.max(...fasts.map(f => f.actualDuration))
    const completionRate = (completedFasts / totalFasts) * 100

    // Calculate recent activity
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const thisWeekFasts = fasts.filter(f => 
      new Date(f.startTime) >= weekAgo
    ).length
    
    const thisMonthFasts = fasts.filter(f => 
      new Date(f.startTime) >= monthAgo
    ).length

    // Calculate current streak (simplified - consecutive days with completed fasts)
    const completedFastDays = [...new Set(
      fasts
        .filter(f => f.completed)
        .map(f => new Date(f.startTime).toDateString())
    )].sort((a, b) => new Date(b) - new Date(a))
    
    let currentStreak = 0
    let currentDate = new Date().toDateString()
    
    for (const day of completedFastDays) {
      if (day === currentDate) {
        currentStreak++
        const date = new Date(currentDate)
        date.setDate(date.getDate() - 1)
        currentDate = date.toDateString()
      } else {
        break
      }
    }

    setStats({
      totalFasts,
      completedFasts,
      totalTime,
      averageDuration,
      longestFast,
      currentStreak,
      thisWeekFasts,
      thisMonthFasts,
      completionRate,
    })
  }

  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatTotalTime = (milliseconds) => {
    const totalHours = Math.floor(milliseconds / (1000 * 60 * 60))
    const days = Math.floor(totalHours / 24)
    const hours = totalHours % 24
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else {
      return `${hours}h`
    }
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card elevation={1}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              backgroundColor: `${color}.main`,
              color: 'white',
              borderRadius: 1,
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary" fontSize="0.875rem">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  if (stats.totalFasts === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No statistics available yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Complete some fasts to see your statistics here!
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Primary Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Fasts"
            value={stats.totalFasts}
            icon={<TimerIcon />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completedFasts}
            subtitle={`${Math.round(stats.completionRate)}% completion rate`}
            icon={<TrophyIcon />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon={<StreakIcon />}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Longest Fast"
            value={formatDuration(stats.longestFast)}
            icon={<TrendingIcon />}
            color="info"
          />
        </Grid>

        {/* Detailed Stats */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {formatDuration(stats.averageDuration)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Duration
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      {formatTotalTime(stats.totalTime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Fasting Time
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="info.main">
                      {stats.thisWeekFasts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Week
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Achievements
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {stats.totalFasts >= 1 && (
                  <Chip label="First Fast! 🎉" color="primary" variant="outlined" />
                )}
                {stats.totalFasts >= 10 && (
                  <Chip label="10 Fasts Milestone! 🏆" color="success" variant="outlined" />
                )}
                {stats.totalFasts >= 50 && (
                  <Chip label="50 Fasts Champion! 👑" color="warning" variant="outlined" />
                )}
                {stats.currentStreak >= 7 && (
                  <Chip label="Week Streak! 🔥" color="error" variant="outlined" />
                )}
                {stats.completionRate >= 80 && (
                  <Chip label="High Completion Rate! ⭐" color="info" variant="outlined" />
                )}
                {stats.longestFast >= 24 * 60 * 60 * 1000 && (
                  <Chip label="24+ Hour Fast! 💪" color="secondary" variant="outlined" />
                )}
              </Stack>
              
              {stats.totalFasts < 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Complete more fasts to unlock achievements!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default StatsScreen