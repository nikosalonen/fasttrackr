// FastTrackr PWA - Notifications Manager

class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.isEnabled = false;
    this.milestoneNotifications = true;
    
    this.init();
  }

  init() {
    this.checkSupport();
    this.loadSettings();
    this.setupEventListeners();
    this.requestPermissionIfNeeded();
    
    console.log('Notification manager initialized');
  }

  checkSupport() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }
    
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }
    
    return true;
  }

  loadSettings() {
    this.isEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    this.milestoneNotifications = localStorage.getItem('milestoneNotifications') !== 'false';
    this.permission = Notification.permission;
  }

  setupEventListeners() {
    // Settings toggles
    const enabledToggle = document.getElementById('notifications-enabled');
    const milestoneToggle = document.getElementById('milestone-notifications');

    if (enabledToggle) {
      enabledToggle.addEventListener('change', (e) => {
        this.toggleNotifications(e.target.checked);
      });
    }

    if (milestoneToggle) {
      milestoneToggle.addEventListener('change', (e) => {
        this.toggleMilestoneNotifications(e.target.checked);
      });
    }

    // Service worker message handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    }
  }

  async requestPermissionIfNeeded() {
    if (this.permission === 'default' && this.isEnabled) {
      await this.requestPermission();
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        this.showTestNotification();
      } else if (permission === 'denied') {
        console.log('Notification permission denied');
        this.isEnabled = false;
        localStorage.setItem('notificationsEnabled', 'false');
        this.updateSettingsUI();
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'error';
    }
  }

  toggleNotifications(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('notificationsEnabled', enabled.toString());
    
    if (enabled && this.permission !== 'granted') {
      this.requestPermission();
    }
    
    console.log('Notifications', enabled ? 'enabled' : 'disabled');
  }

  toggleMilestoneNotifications(enabled) {
    this.milestoneNotifications = enabled;
    localStorage.setItem('milestoneNotifications', enabled.toString());
    
    console.log('Milestone notifications', enabled ? 'enabled' : 'disabled');
  }

  updateSettingsUI() {
    const enabledToggle = document.getElementById('notifications-enabled');
    const milestoneToggle = document.getElementById('milestone-notifications');
    
    if (enabledToggle) {
      enabledToggle.checked = this.isEnabled && this.permission === 'granted';
      enabledToggle.disabled = this.permission === 'denied';
    }
    
    if (milestoneToggle) {
      milestoneToggle.checked = this.milestoneNotifications;
      milestoneToggle.disabled = !this.isEnabled || this.permission !== 'granted';
    }
  }

  showTestNotification() {
    if (this.canShowNotifications()) {
      this.showNotification('FastTrackr Notifications Enabled', {
        body: 'You will now receive notifications for your fasting progress!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test'
      });
    }
  }

  canShowNotifications() {
    return this.isEnabled && 
           this.permission === 'granted' && 
           'Notification' in window;
  }

  showNotification(title, options = {}) {
    if (!this.canShowNotifications()) {
      console.log('Cannot show notification:', title);
      return null;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      requireInteraction: false,
      silent: false
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const notification = new Notification(title, finalOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle notification actions
        if (options.action) {
          this.handleNotificationAction(options.action);
        }
      };

      notification.onshow = () => {
        console.log('Notification shown:', title);
      };

      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  showFastStartNotification() {
    if (this.canShowNotifications()) {
      this.showNotification('Fast Started', {
        body: 'Your fasting session has begun. Good luck!',
        tag: 'fast-start',
        actions: [
          { action: 'view', title: 'View Progress' }
        ]
      });
    }
  }

  showFastCompleteNotification(duration) {
    if (this.canShowNotifications()) {
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      this.showNotification('Fast Complete! 🎉', {
        body: `Congratulations! You've completed your ${hours}h ${minutes}m fast!`,
        tag: 'fast-complete',
        requireInteraction: true,
        actions: [
          { action: 'stop', title: 'Stop Fast' },
          { action: 'continue', title: 'Continue' }
        ]
      });
    }
  }

  showMilestoneNotification(hours) {
    if (this.canShowNotifications() && this.milestoneNotifications) {
      const milestoneMessages = {
        1: 'Great start! 1 hour down.',
        4: 'You\'re doing great! 4 hours completed.',
        8: 'Halfway to 16 hours! Keep it up!',
        12: 'Excellent progress! 12 hours done.',
        16: 'Amazing! You\'ve hit the 16-hour mark!',
        18: 'Outstanding! 18 hours completed!',
        20: 'Incredible dedication! 20 hours done!',
        24: 'Phenomenal! You\'ve reached 24 hours!'
      };

      const message = milestoneMessages[hours] || `${hours} hours completed! Keep going!`;
      
      this.showNotification(`${hours}-Hour Milestone`, {
        body: message,
        tag: `milestone-${hours}`,
        actions: [
          { action: 'view', title: 'View Progress' }
        ]
      });
    }
  }

  showPauseNotification() {
    if (this.canShowNotifications()) {
      this.showNotification('Fast Paused', {
        body: 'Your fasting session is now paused. Resume when ready!',
        tag: 'fast-pause'
      });
    }
  }

  showResumeNotification() {
    if (this.canShowNotifications()) {
      this.showNotification('Fast Resumed', {
        body: 'Your fasting session has resumed. Keep going!',
        tag: 'fast-resume'
      });
    }
  }

  scheduleNotification(title, body, delay, tag = null) {
    if (!this.canShowNotifications()) {
      return null;
    }

    return setTimeout(() => {
      this.showNotification(title, {
        body,
        tag: tag || `scheduled-${Date.now()}`
      });
    }, delay);
  }

  scheduleMilestoneNotifications(targetDuration) {
    if (!this.canShowNotifications() || !this.milestoneNotifications) {
      return [];
    }

    const milestones = [1, 4, 8, 12, 16, 18, 20, 24]; // hours
    const schedules = [];

    milestones.forEach(hours => {
      const milestoneMs = hours * 60 * 60 * 1000;
      if (milestoneMs < targetDuration) {
        const timeoutId = this.scheduleNotification(
          `${hours}-Hour Milestone`,
          `${hours} hours completed! Keep going!`,
          milestoneMs,
          `milestone-${hours}`
        );
        schedules.push({ hours, timeoutId });
      }
    });

    return schedules;
  }

  clearScheduledNotifications(schedules) {
    if (schedules && Array.isArray(schedules)) {
      schedules.forEach(schedule => {
        if (schedule.timeoutId) {
          clearTimeout(schedule.timeoutId);
        }
      });
    }
  }

  handleNotificationAction(action) {
    switch (action) {
      case 'view':
        // Switch to timer screen
        if (window.fastTrackrApp) {
          window.fastTrackrApp.switchScreen('timer');
        }
        break;
      case 'stop':
        // Stop the current fast
        if (window.fastTimer) {
          window.fastTimer.stopFast();
        }
        break;
      case 'continue':
        // Just dismiss - fast continues
        break;
    }
  }

  handleServiceWorkerMessage(data) {
    if (data.type === 'NOTIFICATION_CLICK') {
      this.handleNotificationAction(data.action);
    }
  }

  // Background notification scheduling (for service worker)
  registerBackgroundNotification(type, delay, data = {}) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        notificationType: type,
        delay: delay,
        data: data
      });
    }
  }

  // Utility methods
  formatTimeUntilNotification(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  getPermissionStatus() {
    return {
      supported: 'Notification' in window,
      permission: this.permission,
      enabled: this.isEnabled,
      canShow: this.canShowNotifications()
    };
  }
}

// Initialize notification manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.notificationManager = new NotificationManager();
}); 