// Settings & Profile Feature
class Settings {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadSettings();
        this.setupEventListeners();
        this.updateProfileDisplay();
    }

    loadUserData() {
        const userData = localStorage.getItem('ecolink_user');
        if (!userData) {
            window.location.href = '../index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('ecolink_settings') || '{}');
        
        // Apply saved settings
        document.getElementById('darkModeToggle').checked = settings.darkMode || false;
        document.getElementById('notificationsToggle').checked = settings.notifications !== false;
        document.getElementById('autoSyncToggle').checked = settings.autoSync !== false;
        document.getElementById('weeklyReportsToggle').checked = settings.weeklyReports !== false;

        // Apply dark mode if enabled
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    setupEventListeners() {
        // Profile editing
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.openEditProfileModal();
        });

        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.closeEditProfileModal();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeEditProfileModal();
        });

        document.getElementById('editProfileForm').addEventListener('submit', (e) => {
            this.handleProfileUpdate(e);
        });

        // Settings toggles
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
        });

        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.updateSetting('notifications', e.target.checked);
        });

        document.getElementById('autoSyncToggle').addEventListener('change', (e) => {
            this.updateSetting('autoSync', e.target.checked);
        });

        document.getElementById('weeklyReportsToggle').addEventListener('change', (e) => {
            this.updateSetting('weeklyReports', e.target.checked);
        });

        // Data management
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clearCacheBtn').addEventListener('click', () => {
            this.clearCache();
        });

        document.getElementById('resetDataBtn').addEventListener('click', () => {
            this.resetAllData();
        });

        // Account actions
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.changePassword();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Modal backdrop click
        document.getElementById('editProfileModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeEditProfileModal();
            }
        });
    }

    updateProfileDisplay() {
        document.getElementById('profileUsername').textContent = this.currentUser.username;
        
        const location = this.currentUser.location;
        if (location) {
            document.getElementById('profileLocation').textContent = 
                `${location.city}, ${location.county}, ${location.country}`;
        } else {
            document.getElementById('profileLocation').textContent = 'Location not set';
        }

        // Calculate and display user stats
        this.updateProfileStats();
    }

    updateProfileStats() {
        // Get user data from various features
        const carbonData = JSON.parse(localStorage.getItem('ecolink_carbon_activities') || '[]');
        const reportsData = JSON.parse(localStorage.getItem('ecolink_reports') || '[]');
        const userReports = reportsData.filter(report => report.userId === this.currentUser.username);
        
        // Calculate level and XP (simplified)
        const totalActivities = carbonData.length + userReports.length;
        const xp = totalActivities * 25 + Math.floor(Math.random() * 200) + 500;
        const level = Math.floor(xp / 200) + 1;
        
        // Calculate days active (simplified)
        const joinDate = new Date(this.currentUser.joinDate || Date.now() - 14 * 24 * 60 * 60 * 1000);
        const daysActive = Math.floor((Date.now() - joinDate.getTime()) / (24 * 60 * 60 * 1000));

        document.getElementById('profileLevel').textContent = level;
        document.getElementById('profileXP').textContent = xp;
        document.getElementById('profileDays').textContent = Math.max(1, daysActive);
    }

    openEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        
        // Pre-fill form with current data
        document.getElementById('editUsername').value = this.currentUser.username;
        
        if (this.currentUser.location) {
            document.getElementById('editCountry').value = this.currentUser.location.country || '';
            document.getElementById('editCity').value = this.currentUser.location.city || '';
            document.getElementById('editCounty').value = this.currentUser.location.county || '';
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newUsername = document.getElementById('editUsername').value.trim();
        const newCountry = document.getElementById('editCountry').value.trim();
        const newCity = document.getElementById('editCity').value.trim();
        const newCounty = document.getElementById('editCounty').value.trim();

        if (!newUsername || !newCountry || !newCity || !newCounty) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Update user data
        this.currentUser.username = newUsername;
        this.currentUser.location = {
            country: newCountry,
            city: newCity,
            county: newCounty
        };

        // Save to localStorage
        localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));

        // Update display
        this.updateProfileDisplay();
        this.closeEditProfileModal();
        this.showNotification('Profile updated successfully!', 'success');
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        this.updateSetting('darkMode', enabled);
    }

    updateSetting(key, value) {
        const settings = JSON.parse(localStorage.getItem('ecolink_settings') || '{}');
        settings[key] = value;
        localStorage.setItem('ecolink_settings', JSON.stringify(settings));
        
        this.showNotification(`${key} ${value ? 'enabled' : 'disabled'}`, 'info');
    }

    exportData() {
        try {
            const userData = {
                user: this.currentUser,
                carbonActivities: JSON.parse(localStorage.getItem('ecolink_carbon_activities') || '[]'),
                reports: JSON.parse(localStorage.getItem('ecolink_reports') || '[]'),
                actionFeed: JSON.parse(localStorage.getItem('ecolink_action_feed') || '[]'),
                settings: JSON.parse(localStorage.getItem('ecolink_settings') || '{}')
            };

            const dataStr = JSON.stringify(userData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `ecolink-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            this.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to export data', 'error');
        }
    }

    clearCache() {
        if (confirm('Are you sure you want to clear the cache? This will remove temporary data but keep your main data intact.')) {
            // In a real app, this would clear specific cache data
            // For now, we'll just show a success message
            this.showNotification('Cache cleared successfully!', 'success');
        }
    }

    resetAllData() {
        if (confirm('⚠️ WARNING: This will permanently delete ALL your data including activities, reports, and settings. This action cannot be undone. Are you absolutely sure?')) {
            if (confirm('This is your final warning. All data will be lost forever. Continue?')) {
                // Clear all EcoLink data
                const keys = Object.keys(localStorage).filter(key => key.startsWith('ecolink_'));
                keys.forEach(key => localStorage.removeItem(key));
                
                this.showNotification('All data has been reset', 'info');
                
                // Redirect to welcome screen after a delay
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            }
        }
    }

    changePassword() {
        const newPassword = prompt('Enter your new password:');
        if (newPassword && newPassword.trim()) {
            // In a real app, this would involve server-side password hashing
            this.currentUser.password = newPassword.trim();
            localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));
            this.showNotification('Password changed successfully!', 'success');
        }
    }

    logout() {
        if (confirm('Are you sure you want to log out?')) {
            // Clear user session (but keep data)
            localStorage.removeItem('ecolink_user');
            this.showNotification('Logged out successfully', 'info');
            
            // Redirect to welcome screen
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Settings();
});

// Add CSS for settings page
const style = document.createElement('style');
style.textContent = `
    .settings-grid {
        display: grid;
        gap: 32px;
        max-width: 800px;
        margin: 0 auto;
    }

    .settings-section {
        background: var(--white);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px var(--shadow);
    }

    .settings-section h2 {
        font-size: 20px;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 2px solid #f0f0f0;
    }

    .profile-card {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 24px;
        background: linear-gradient(135deg, var(--very-light-green), #ffffff);
        border-radius: 12px;
        border: 2px solid var(--primary-green);
    }

    .profile-avatar {
        width: 80px;
        height: 80px;
        background: var(--primary-green);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--white);
        font-size: 32px;
        flex-shrink: 0;
    }

    .profile-info {
        flex: 1;
    }

    .profile-info h3 {
        font-size: 24px;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 4px;
    }

    .profile-info p {
        color: var(--light-text);
        margin-bottom: 16px;
    }

    .profile-stats {
        display: flex;
        gap: 24px;
    }

    .stat {
        text-align: center;
    }

    .stat-value {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: var(--primary-green);
    }

    .stat-label {
        font-size: 12px;
        color: var(--light-text);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .settings-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 12px;
        transition: var(--transition);
    }

    .setting-item:hover {
        background: #e9ecef;
    }

    .setting-info h4 {
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 4px;
    }

    .setting-info p {
        color: var(--light-text);
        font-size: 14px;
    }

    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 24px;
    }

    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked + .toggle-slider {
        background-color: var(--primary-green);
    }

    input:checked + .toggle-slider:before {
        transform: translateX(26px);
    }

    .data-actions {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .data-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        transition: var(--transition);
    }

    .data-item:hover {
        border-color: var(--primary-green);
        background: var(--very-light-green);
    }

    .data-info h4 {
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 4px;
    }

    .data-info p {
        color: var(--light-text);
        font-size: 14px;
    }

    .about-content {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .app-info {
        display: flex;
        gap: 20px;
        align-items: center;
        padding: 24px;
        background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
        border-radius: 12px;
        color: var(--white);
    }

    .app-logo {
        width: 64px;
        height: 64px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        flex-shrink: 0;
    }

    .app-details h3 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .app-details p {
        opacity: 0.9;
        margin-bottom: 8px;
    }

    .app-description {
        font-size: 14px;
        line-height: 1.5;
    }

    .support-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
    }

    .support-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        color: var(--dark-text);
        text-decoration: none;
        transition: var(--transition);
    }

    .support-link:hover {
        background: var(--very-light-green);
        color: var(--primary-green);
    }

    .support-link i {
        width: 20px;
        text-align: center;
    }

    .credits {
        text-align: center;
        padding: 24px;
        background: #f8f9fa;
        border-radius: 12px;
    }

    .credits h4 {
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 12px;
    }

    .credits p {
        color: var(--light-text);
        margin-bottom: 8px;
    }

    .social-links {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 16px;
    }

    .social-link {
        width: 40px;
        height: 40px;
        background: var(--primary-green);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--white);
        text-decoration: none;
        transition: var(--transition);
    }

    .social-link:hover {
        background: var(--secondary-green);
        transform: translateY(-2px);
    }

    .account-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .modal.hidden {
        display: none;
    }

    .modal-content {
        background: var(--white);
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #f0f0f0;
    }

    .modal-header h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--dark-text);
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        color: var(--light-text);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: var(--transition);
    }

    .modal-close:hover {
        background: #f0f0f0;
        color: var(--dark-text);
    }

    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label {
        font-weight: 500;
        color: var(--dark-text);
    }

    .form-group input {
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        transition: var(--transition);
    }

    .form-group input:focus {
        outline: none;
        border-color: var(--primary-green);
    }

    .form-actions {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
        margin-top: 24px;
    }

    /* Dark mode styles */
    .dark-mode {
        background: #1a1a1a;
        color: #ffffff;
    }

    .dark-mode .settings-section {
        background: #2d2d2d;
        color: #ffffff;
    }

    .dark-mode .setting-item {
        background: #3a3a3a;
    }

    .dark-mode .setting-item:hover {
        background: #4a4a4a;
    }

    .dark-mode .modal-content {
        background: #2d2d2d;
        color: #ffffff;
    }

    .dark-mode .form-group input {
        background: #3a3a3a;
        border-color: #555;
        color: #ffffff;
    }

    @media (max-width: 768px) {
        .profile-card {
            flex-direction: column;
            text-align: center;
        }
        
        .profile-stats {
            justify-content: center;
        }
        
        .account-actions {
            flex-direction: column;
        }
        
        .support-links {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

