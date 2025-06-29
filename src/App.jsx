import React, { useState, useEffect } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Timer as TimerIcon,
  History as HistoryIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

import TimerScreen from './components/TimerScreen'
import HistoryScreen from './components/HistoryScreen'
import StatsScreen from './components/StatsScreen'
import SettingsScreen from './components/SettingsScreen'
import InstallPrompt from './components/InstallPrompt'
import UpdateNotification from './components/UpdateNotification'
import { FastTimerProvider } from './hooks/useFastTimer'
import { NotificationProvider } from './hooks/useNotifications'

function App() {
  const [currentTab, setCurrentTab] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    // Handle URL parameters for deep linking
    const urlParams = new URLSearchParams(window.location.search)
    const screen = urlParams.get('screen')
    const action = urlParams.get('action')

    if (screen) {
      switch (screen) {
        case 'history':
          setCurrentTab(1)
          break
        case 'stats':
          setCurrentTab(2)
          break
        case 'settings':
          setCurrentTab(3)
          break
        default:
          setCurrentTab(0)
      }
    }

    if (action === 'start') {
      setCurrentTab(0)
      // Timer will handle the auto-start
    }
  }, [])

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    
    // Update URL without reload
    const screens = ['timer', 'history', 'stats', 'settings']
    const url = new URL(window.location)
    url.searchParams.set('screen', screens[newValue])
    window.history.pushState({}, '', url)
  }

  const screens = [
    { component: <TimerScreen />, label: 'Timer', icon: <TimerIcon /> },
    { component: <HistoryScreen />, label: 'History', icon: <HistoryIcon /> },
    { component: <StatsScreen />, label: 'Stats', icon: <StatsIcon /> },
    { component: <SettingsScreen />, label: 'Settings', icon: <SettingsIcon /> },
  ]

  return (
    <FastTimerProvider>
      <NotificationProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* App Header */}
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  flexGrow: 1,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                ⏰ FastTrackr
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Container
            maxWidth="md"
            sx={{
              flex: 1,
              py: 2,
              pb: isMobile ? 10 : 2, // Extra padding for mobile bottom nav
            }}
          >
            {screens[currentTab].component}
          </Container>

          {/* Bottom Navigation for Mobile */}
          {isMobile && (
            <BottomNavigation
              value={currentTab}
              onChange={handleTabChange}
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              {screens.map((screen, index) => (
                <BottomNavigationAction
                  key={index}
                  label={screen.label}
                  icon={screen.icon}
                />
              ))}
            </BottomNavigation>
          )}

          {/* Tab Navigation for Desktop */}
          {!isMobile && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Container maxWidth="md">
                <BottomNavigation
                  value={currentTab}
                  onChange={handleTabChange}
                  sx={{ backgroundColor: 'transparent' }}
                >
                  {screens.map((screen, index) => (
                    <BottomNavigationAction
                      key={index}
                      label={screen.label}
                      icon={screen.icon}
                    />
                  ))}
                </BottomNavigation>
              </Container>
            </Box>
          )}

          {/* PWA Install Prompt */}
          <InstallPrompt />

          {/* Service Worker Update Notifications */}
          <UpdateNotification />
        </Box>
      </NotificationProvider>
    </FastTimerProvider>
  )
}

export default App 