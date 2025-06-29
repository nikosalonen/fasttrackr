// FastTrackr PWA - Main App Controller

class FastTrackrApp {
  constructor() {
    this.currentScreen = 'timer';
    this.installPromptEvent = null;
    this.theme = localStorage.getItem('theme') || 'light';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeTheme();
    this.handleURLParams();
    this.setupPWAInstallation();
    this.hideLoadingScreen();
    
    console.log('FastTrackr app initialized');
  }

  setupEventListeners() {
    // Navigation
    document.getElementById('menu-btn').addEventListener('click', this.toggleMenu.bind(this));
    
    // Tab navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const screenId = e.target.id.replace('-tab', '');
        this.switchScreen(screenId);
      });
    });

    // Settings
    document.getElementById('dark-mode').addEventListener('change', this.toggleTheme.bind(this));
    document.getElementById('export-data').addEventListener('click', this.exportData.bind(this));
    document.getElementById('clear-data').addEventListener('click', this.clearAllData.bind(this));

    // Install prompt
    document.getElementById('install-btn').addEventListener('click', this.installApp.bind(this));
    document.getElementById('dismiss-install').addEventListener('click', this.dismissInstallPrompt.bind(this));

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

    // Handle clicks outside menu
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('nav-menu');
      const menuBtn = document.getElementById('menu-btn');
      if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });
  }

  hideLoadingScreen() {
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 300);
      }
    }, 1000);
  }

  toggleMenu() {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('hidden');
  }

  switchScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Remove active state from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected screen
    const targetScreen = document.getElementById(`${screenId}-screen`);
    const targetBtn = document.getElementById(`${screenId}-tab`);
    
    if (targetScreen && targetBtn) {
      targetScreen.classList.add('active');
      targetBtn.classList.add('active');
      this.currentScreen = screenId;
      
      // Hide menu on mobile
      document.getElementById('nav-menu').classList.add('hidden');
      
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('screen', screenId);
      window.history.pushState({}, '', url);
      
      // Trigger screen-specific updates
      this.onScreenChange(screenId);
    }
  }

  onScreenChange(screenId) {
    switch (screenId) {
      case 'history':
        if (window.fastHistory) {
          window.fastHistory.refreshHistory();
        }
        break;
      case 'stats':
        this.updateStats();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get('screen');
    const action = urlParams.get('action');

    if (screen && ['timer', 'history', 'stats', 'settings'].includes(screen)) {
      this.switchScreen(screen);
    }

    if (action === 'start' && window.fastTimer) {
      window.fastTimer.startFast();
    }
  }

  initializeTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const darkModeToggle = document.getElementById('dark-mode');
    if (darkModeToggle) {
      darkModeToggle.checked = this.theme === 'dark';
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }

  // PWA Installation
  setupPWAInstallation() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      this.installPromptEvent = e;
      this.showInstallPrompt();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallPrompt();
      this.showToast('App installed successfully!');
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('PWA is running in standalone mode');
      this.hideInstallPrompt();
    }
  }

  showInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.classList.remove('hidden');
    }
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.classList.add('hidden');
    }
  }

  async installApp() {
    if (this.installPromptEvent) {
      this.installPromptEvent.prompt();
      const { outcome } = await this.installPromptEvent.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        this.hideInstallPrompt();
      }
      
      this.installPromptEvent = null;
    }
  }

  dismissInstallPrompt() {
    this.hideInstallPrompt();
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  }

  // Data management
  exportData() {
    try {
      const data = {
        fasts: JSON.parse(localStorage.getItem('fastHistory') || '[]'),
        settings: {
          theme: this.theme,
          notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true',
          milestoneNotifications: localStorage.getItem('milestoneNotifications') === 'true'
        },
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `fasttrackr-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      this.showToast('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      this.showToast('Export failed. Please try again.', 'error');
    }
  }

  clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      location.reload();
    }
  }

  loadSettings() {
    // Load current settings into the settings screen
    document.getElementById('dark-mode').checked = this.theme === 'dark';
    document.getElementById('notifications-enabled').checked = 
      localStorage.getItem('notificationsEnabled') === 'true';
    document.getElementById('milestone-notifications').checked = 
      localStorage.getItem('milestoneNotifications') === 'true';
  }

  updateStats() {
    const fasts = JSON.parse(localStorage.getItem('fastHistory') || '[]');
    
    // Total fasts
    document.getElementById('total-fasts').textContent = fasts.length;
    
    // Average duration
    if (fasts.length > 0) {
      const totalDuration = fasts.reduce((sum, fast) => sum + fast.duration, 0);
      const avgHours = Math.round(totalDuration / fasts.length / (1000 * 60 * 60) * 10) / 10;
      document.getElementById('avg-duration').textContent = `${avgHours}h`;
    } else {
      document.getElementById('avg-duration').textContent = '0h';
    }
    
    // Longest fast
    if (fasts.length > 0) {
      const longestDuration = Math.max(...fasts.map(fast => fast.duration));
      const longestHours = Math.round(longestDuration / (1000 * 60 * 60) * 10) / 10;
      document.getElementById('longest-fast').textContent = `${longestHours}h`;
    } else {
      document.getElementById('longest-fast').textContent = '0h';
    }
    
    // Current streak (simplified - consecutive days with at least one fast)
    let streak = 0;
    const today = new Date().toDateString();
    const fastsToday = fasts.filter(fast => 
      new Date(fast.startTime).toDateString() === today
    );
    
    if (fastsToday.length > 0) {
      streak = 1; // At least today
      // This could be expanded to calculate actual streaks
    }
    
    document.getElementById('current-streak').textContent = streak;
  }

  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + number keys for navigation
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      const screens = ['timer', 'history', 'stats', 'settings'];
      const index = parseInt(e.key) - 1;
      if (screens[index]) {
        this.switchScreen(screens[index]);
      }
    }
    
    // Space to start/stop timer (when on timer screen)
    if (e.code === 'Space' && this.currentScreen === 'timer') {
      e.preventDefault();
      if (window.fastTimer) {
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (!startBtn.classList.contains('hidden')) {
          window.fastTimer.startFast();
        } else if (!stopBtn.classList.contains('hidden')) {
          window.fastTimer.stopFast();
        }
      }
    }
  }

  showToast(message, type = 'success') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#dc2626' : '#059669'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.fastTrackrApp = new FastTrackrApp();
}); 