// FastTrackr PWA - Storage and History Manager

class FastHistory {
  constructor() {
    this.fasts = [];
    this.init();
  }

  init() {
    this.loadHistory();
    this.setupEventListeners();
    this.refreshHistory();
    
    console.log('History manager initialized');
  }

  setupEventListeners() {
    // History will be refreshed when the history screen is shown
    // Individual event listeners will be added dynamically to history items
  }

  loadHistory() {
    this.fasts = JSON.parse(localStorage.getItem('fastHistory') || '[]');
  }

  refreshHistory() {
    this.loadHistory();
    this.renderHistory();
  }

  renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (this.fasts.length === 0) {
      historyList.innerHTML = '<p class="empty-state">No fasts recorded yet. Start your first fast!</p>';
      return;
    }

    historyList.innerHTML = this.fasts.map(fast => this.createHistoryItemHTML(fast)).join('');
    
    // Add event listeners to action buttons
    this.attachHistoryEventListeners();
  }

  createHistoryItemHTML(fast) {
    const startDate = new Date(fast.startTime);
    const endDate = new Date(fast.endTime);
    const duration = this.formatDuration(fast.actualDuration);
    const targetDuration = this.formatDuration(fast.targetDuration);
    const isCompleted = fast.completed;
    const completionText = isCompleted ? 'Completed' : 'Stopped Early';
    const completionClass = isCompleted ? 'success' : 'warning';

    return `
      <div class="history-item" data-fast-id="${fast.id}">
        <div class="history-details">
          <h3>${completionText} - ${duration}</h3>
          <div class="history-meta">
            <div>Started: ${this.formatDateTime(startDate)}</div>
            <div>Ended: ${this.formatDateTime(endDate)}</div>
            <div>Target: ${targetDuration}</div>
            ${fast.pausedTime > 0 ? `<div>Paused: ${this.formatDuration(fast.pausedTime)}</div>` : ''}
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-small btn-secondary edit-fast" data-action="edit" data-fast-id="${fast.id}">
            Edit
          </button>
          <button class="btn btn-small btn-danger delete-fast" data-action="delete" data-fast-id="${fast.id}">
            Delete
          </button>
        </div>
      </div>
    `;
  }

  attachHistoryEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-fast').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fastId = parseInt(e.target.dataset.fastId);
        this.editFast(fastId);
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-fast').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fastId = parseInt(e.target.dataset.fastId);
        this.deleteFast(fastId);
      });
    });
  }

  editFast(fastId) {
    const fast = this.fasts.find(f => f.id === fastId);
    if (!fast) return;

    this.showEditModal(fast);
  }

  showEditModal(fast) {
    const startDate = new Date(fast.startTime);
    const endDate = new Date(fast.endTime);

    // Create modal HTML
    const modalHTML = `
      <div class="modal-overlay" id="edit-modal">
        <div class="modal-content">
          <h3>Edit Fast</h3>
          <div class="edit-form">
            <label for="edit-start-date">Start Date:</label>
            <input type="datetime-local" id="edit-start-date" value="${this.toDateTimeLocal(startDate)}">
            
            <label for="edit-end-date">End Date:</label>
            <input type="datetime-local" id="edit-end-date" value="${this.toDateTimeLocal(endDate)}">
            
            <div class="modal-actions">
              <button class="btn btn-primary" id="save-edit">Save Changes</button>
              <button class="btn btn-secondary" id="cancel-edit">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add modal styles
    this.addModalStyles();

    // Add event listeners
    document.getElementById('save-edit').addEventListener('click', () => {
      this.saveEditedFast(fast);
    });

    document.getElementById('cancel-edit').addEventListener('click', () => {
      this.closeEditModal();
    });

    // Close on overlay click
    document.getElementById('edit-modal').addEventListener('click', (e) => {
      if (e.target.id === 'edit-modal') {
        this.closeEditModal();
      }
    });
  }

  saveEditedFast(originalFast) {
    const startInput = document.getElementById('edit-start-date');
    const endInput = document.getElementById('edit-end-date');
    
    const newStartTime = new Date(startInput.value);
    const newEndTime = new Date(endInput.value);

    // Validation
    if (newStartTime >= newEndTime) {
      alert('End time must be after start time');
      return;
    }

    if (newStartTime > new Date()) {
      alert('Start time cannot be in the future');
      return;
    }

    // Update the fast
    const fastIndex = this.fasts.findIndex(f => f.id === originalFast.id);
    if (fastIndex !== -1) {
      const updatedFast = {
        ...originalFast,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        actualDuration: newEndTime.getTime() - newStartTime.getTime(),
        completed: (newEndTime.getTime() - newStartTime.getTime()) >= originalFast.targetDuration
      };

      this.fasts[fastIndex] = updatedFast;
      localStorage.setItem('fastHistory', JSON.stringify(this.fasts));
      
      this.refreshHistory();
      this.closeEditModal();
      
      if (window.fastTrackrApp) {
        window.fastTrackrApp.showToast('Fast updated successfully!');
      }
    }
  }

  deleteFast(fastId) {
    if (confirm('Are you sure you want to delete this fast? This action cannot be undone.')) {
      this.fasts = this.fasts.filter(f => f.id !== fastId);
      localStorage.setItem('fastHistory', JSON.stringify(this.fasts));
      this.refreshHistory();
      
      if (window.fastTrackrApp) {
        window.fastTrackrApp.showToast('Fast deleted successfully!');
      }
    }
  }

  closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
      modal.remove();
    }
  }

  addModalStyles() {
    if (!document.getElementById('modal-styles')) {
      const styles = `
        <style id="modal-styles">
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          }
          
          .modal-content {
            background: var(--background-color);
            border-radius: var(--border-radius);
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: var(--shadow-lg);
          }
          
          .modal-content h3 {
            margin-bottom: 1.5rem;
            color: var(--text-primary);
          }
          
          .edit-form label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-primary);
          }
          
          .edit-form input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background-color: var(--surface-color);
            color: var(--text-primary);
            margin-bottom: 1rem;
            font-size: 1rem;
          }
          
          .modal-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
            margin-top: 1.5rem;
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', styles);
    }
  }

  formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  formatDateTime(date) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Export functions
  exportToJSON() {
    const data = {
      fasts: this.fasts,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(data, null, 2);
  }

  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.fasts && Array.isArray(data.fasts)) {
        // Validate fast objects
        const validFasts = data.fasts.filter(fast => 
          fast.id && fast.startTime && fast.endTime && fast.actualDuration
        );
        
        if (validFasts.length > 0) {
          // Merge with existing fasts, avoiding duplicates
          const existingIds = new Set(this.fasts.map(f => f.id));
          const newFasts = validFasts.filter(f => !existingIds.has(f.id));
          
          this.fasts = [...this.fasts, ...newFasts];
          this.fasts.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
          
          localStorage.setItem('fastHistory', JSON.stringify(this.fasts));
          this.refreshHistory();
          
          return {
            success: true,
            imported: newFasts.length,
            skipped: validFasts.length - newFasts.length
          };
        }
      }
      
      return { success: false, error: 'Invalid data format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Statistics helpers
  getStats() {
    const now = new Date();
    const stats = {
      totalFasts: this.fasts.length,
      completedFasts: this.fasts.filter(f => f.completed).length,
      totalTime: this.fasts.reduce((sum, f) => sum + f.actualDuration, 0),
      averageDuration: 0,
      longestFast: 0,
      currentStreak: 0,
      thisWeekFasts: 0,
      thisMonthFasts: 0
    };

    if (stats.totalFasts > 0) {
      stats.averageDuration = stats.totalTime / stats.totalFasts;
      stats.longestFast = Math.max(...this.fasts.map(f => f.actualDuration));
      
      // Calculate streaks and recent activity
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      stats.thisWeekFasts = this.fasts.filter(f => 
        new Date(f.startTime) >= weekAgo
      ).length;
      
      stats.thisMonthFasts = this.fasts.filter(f => 
        new Date(f.startTime) >= monthAgo
      ).length;
      
      // Simple streak calculation (days with at least one fast)
      const fastDays = [...new Set(this.fasts.map(f => 
        new Date(f.startTime).toDateString()
      ))].sort((a, b) => new Date(b) - new Date(a));
      
      let streak = 0;
      let currentDate = new Date().toDateString();
      
      for (const day of fastDays) {
        if (day === currentDate) {
          streak++;
          const date = new Date(currentDate);
          date.setDate(date.getDate() - 1);
          currentDate = date.toDateString();
        } else {
          break;
        }
      }
      
      stats.currentStreak = streak;
    }

    return stats;
  }
}

// Initialize history manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.fastHistory = new FastHistory();
}); 