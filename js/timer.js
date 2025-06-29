// FastTrackr PWA - Timer Controller

class FastTimer {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.targetDuration = 16 * 60 * 60 * 1000; // 16 hours in milliseconds
    this.currentFast = null;
    this.timerInterval = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadCurrentFast();
    this.updateDisplay();
    
    console.log('Timer initialized');
  }

  setupEventListeners() {
    // Timer controls
    document.getElementById('start-btn').addEventListener('click', this.startFast.bind(this));
    document.getElementById('stop-btn').addEventListener('click', this.stopFast.bind(this));
    document.getElementById('pause-btn').addEventListener('click', this.togglePause.bind(this));
    
    // Duration selection
    document.getElementById('fast-duration').addEventListener('change', this.handleDurationChange.bind(this));
    document.getElementById('custom-hours').addEventListener('input', this.handleCustomDuration.bind(this));
  }

  loadCurrentFast() {
    const savedFast = localStorage.getItem('currentFast');
    if (savedFast) {
      this.currentFast = JSON.parse(savedFast);
      this.startTime = new Date(this.currentFast.startTime);
      this.targetDuration = this.currentFast.targetDuration;
      this.isRunning = this.currentFast.isRunning;
      this.isPaused = this.currentFast.isPaused || false;
      this.pausedTime = this.currentFast.pausedTime || 0;
      
      if (this.isRunning && !this.isPaused) {
        this.startTimer();
      }
      
      this.updateControls();
    }
  }

  startFast() {
    const duration = document.getElementById('fast-duration').value;
    let targetHours = 16;
    
    if (duration === 'custom') {
      const customHours = parseInt(document.getElementById('custom-hours').value);
      if (customHours && customHours > 0) {
        targetHours = customHours;
      } else {
        alert('Please enter a valid duration in hours');
        return;
      }
    } else {
      targetHours = parseInt(duration);
    }
    
    this.targetDuration = targetHours * 60 * 60 * 1000;
    this.startTime = new Date();
    this.isRunning = true;
    this.isPaused = false;
    this.pausedTime = 0;
    
    this.currentFast = {
      id: Date.now(),
      startTime: this.startTime.toISOString(),
      targetDuration: this.targetDuration,
      isRunning: true,
      isPaused: false,
      pausedTime: 0
    };
    
    localStorage.setItem('currentFast', JSON.stringify(this.currentFast));
    
    this.startTimer();
    this.updateControls();
    this.scheduleNotifications();
    
    console.log('Fast started:', this.currentFast);
  }

  stopFast() {
    if (!this.isRunning) return;
    
    const endTime = new Date();
    const actualDuration = endTime.getTime() - this.startTime.getTime() - this.pausedTime;
    
    // Save to history
    const fastRecord = {
      id: this.currentFast.id,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      targetDuration: this.targetDuration,
      actualDuration: actualDuration,
      completed: actualDuration >= this.targetDuration,
      pausedTime: this.pausedTime
    };
    
    this.saveFastToHistory(fastRecord);
    
    // Clear current fast
    this.isRunning = false;
    this.isPaused = false;
    this.currentFast = null;
    this.pausedTime = 0;
    
    localStorage.removeItem('currentFast');
    clearInterval(this.timerInterval);
    
    this.updateControls();
    this.updateDisplay();
    this.clearNotifications();
    
    // Show completion message
    const isCompleted = actualDuration >= this.targetDuration;
    const message = isCompleted ? 
      'Congratulations! Fast completed successfully!' : 
      'Fast stopped. You can view your progress in History.';
    
    if (window.fastTrackrApp) {
      window.fastTrackrApp.showToast(message, isCompleted ? 'success' : 'info');
    }
    
    console.log('Fast stopped:', fastRecord);
  }

  togglePause() {
    if (!this.isRunning) return;
    
    if (this.isPaused) {
      // Resume
      this.isPaused = false;
      this.pauseStartTime = null;
      this.startTimer();
    } else {
      // Pause
      this.isPaused = true;
      this.pauseStartTime = new Date();
      clearInterval(this.timerInterval);
    }
    
    this.currentFast.isPaused = this.isPaused;
    localStorage.setItem('currentFast', JSON.stringify(this.currentFast));
    
    this.updateControls();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.isPaused && this.pauseStartTime) {
        this.pausedTime += 1000; // Add 1 second to paused time
      }
      this.updateDisplay();
      this.checkCompletion();
    }, 1000);
  }

  updateDisplay() {
    if (!this.isRunning) {
      document.getElementById('elapsed-time').textContent = '00:00:00';
      document.getElementById('progress-fill').style.width = '0%';
      document.getElementById('progress-text').textContent = '0%';
      return;
    }
    
    const now = new Date();
    const elapsed = now.getTime() - this.startTime.getTime() - this.pausedTime;
    const progress = Math.min((elapsed / this.targetDuration) * 100, 100);
    
    // Update timer display
    document.getElementById('elapsed-time').textContent = this.formatTime(elapsed);
    
    // Update target display
    const targetHours = Math.floor(this.targetDuration / (1000 * 60 * 60));
    document.getElementById('target-time').textContent = `Target: ${targetHours}:00:00`;
    
    // Update progress bar
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${Math.round(progress)}%`;
    
    // Change color when complete
    const progressFill = document.getElementById('progress-fill');
    if (progress >= 100) {
      progressFill.style.backgroundColor = 'var(--success-color)';
    } else {
      progressFill.style.backgroundColor = 'var(--primary-color)';
    }
  }

  updateControls() {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const durationSelect = document.getElementById('fast-duration');
    const customInput = document.getElementById('custom-hours');
    
    if (this.isRunning) {
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      pauseBtn.classList.remove('hidden');
      durationSelect.disabled = true;
      customInput.disabled = true;
      
      pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
      pauseBtn.className = this.isPaused ? 'btn btn-success' : 'btn btn-warning';
    } else {
      startBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
      pauseBtn.classList.add('hidden');
      durationSelect.disabled = false;
      customInput.disabled = false;
    }
  }

  handleDurationChange(e) {
    const customInput = document.getElementById('custom-hours');
    if (e.target.value === 'custom') {
      customInput.classList.remove('hidden');
      customInput.focus();
    } else {
      customInput.classList.add('hidden');
    }
  }

  handleCustomDuration(e) {
    const hours = parseInt(e.target.value);
    if (hours && hours > 0 && hours <= 168) { // Max 1 week
      this.targetDuration = hours * 60 * 60 * 1000;
    }
  }

  checkCompletion() {
    if (!this.isRunning) return;
    
    const elapsed = new Date().getTime() - this.startTime.getTime() - this.pausedTime;
    if (elapsed >= this.targetDuration) {
      this.showCompletionNotification();
    }
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  saveFastToHistory(fastRecord) {
    const history = JSON.parse(localStorage.getItem('fastHistory') || '[]');
    history.unshift(fastRecord); // Add to beginning of array
    
    // Keep only last 100 fasts
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem('fastHistory', JSON.stringify(history));
  }

  scheduleNotifications() {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Schedule milestone notifications
      const milestones = [12, 16, 18, 24]; // hours
      
      milestones.forEach(hours => {
        if (hours * 60 * 60 * 1000 <= this.targetDuration) {
          setTimeout(() => {
            if (this.isRunning) {
              new Notification('FastTrackr Milestone', {
                body: `${hours} hours completed! Keep going!`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png'
              });
            }
          }, hours * 60 * 60 * 1000);
        }
      });
      
      // Schedule completion notification
      setTimeout(() => {
        if (this.isRunning) {
          this.showCompletionNotification();
        }
      }, this.targetDuration);
    }
  }

  showCompletionNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('FastTrackr - Fast Complete!', {
        body: 'Congratulations! You have successfully completed your fast!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        requireInteraction: true,
        actions: [
          {
            action: 'stop',
            title: 'Stop Fast'
          },
          {
            action: 'continue',
            title: 'Continue'
          }
        ]
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  clearNotifications() {
    // Clear any scheduled notifications
    // This is a simplified approach - in a real app you'd track notification IDs
  }
}

// Initialize timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.fastTimer = new FastTimer();
}); 