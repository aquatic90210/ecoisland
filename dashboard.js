// Dashboard functionality
class Dashboard {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateDashboard();
        this.animateElements();
    }

    loadUserData() {
        const userData = localStorage.getItem('ecolink_user');
        if (!userData) {
            // Redirect to login if no user data
            window.location.href = '../index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    setupEventListeners() {
        // Feature card clicks
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                const feature = card.dataset.feature;
                this.navigateToFeature(feature);
            });
        });

        // User avatar click for quick settings
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', () => {
                this.navigateToFeature('settings');
            });
        }
    }

    updateDashboard() {
        if (!this.currentUser) return;

        // Update user name
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.username;
        }

        // Update impact score
        const impactScore = this.calculateImpactScore();
        const impactScoreElement = document.getElementById('userImpactScore');
        if (impactScoreElement) {
            impactScoreElement.textContent = impactScore;
        }

        // Update location
        const userLocationElement = document.getElementById('userLocation');
        if (userLocationElement && this.currentUser.location) {
            const location = this.currentUser.location;
            if (location.city && location.county) {
                userLocationElement.textContent = `${location.city}, ${location.county}`;
            } else {
                userLocationElement.textContent = 'Your Area';
            }
        }

        // Update stats
        this.updateStats();

        // Update member since
        const memberSinceElement = document.getElementById('memberSince');
        if (memberSinceElement && this.currentUser.createdAt) {
            const date = new Date(this.currentUser.createdAt);
            memberSinceElement.textContent = date.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
        }

        // Update activity feed
        this.updateActivityFeed();
    }

    updateStats() {
        // Carbon saved calculation
        const carbonSaved = this.calculateCarbonSaved();
        const carbonSavedElement = document.getElementById('carbonSaved');
        if (carbonSavedElement) {
            carbonSavedElement.textContent = carbonSaved.toFixed(1);
        }

        // Reports submitted
        const reportsSubmittedElement = document.getElementById('reportsSubmitted');
        if (reportsSubmittedElement) {
            reportsSubmittedElement.textContent = this.currentUser.reportsSubmitted || 0;
        }

        // Community actions
        const communityActionsElement = document.getElementById('communityActions');
        if (communityActionsElement) {
            const communityActions = this.calculateCommunityActions();
            communityActionsElement.textContent = communityActions;
        }

        // Today's carbon footprint
        const todayCarbonElement = document.getElementById('todayCarbon');
        if (todayCarbonElement) {
            const todayCarbon = this.calculateTodayCarbon();
            todayCarbonElement.textContent = todayCarbon.toFixed(1);
        }

        // Active issues
        const activeIssuesElement = document.getElementById('activeIssues');
        if (activeIssuesElement) {
            const activeIssues = this.calculateActiveIssues();
            activeIssuesElement.textContent = activeIssues;
        }

        // Feed updates
        const feedUpdatesElement = document.getElementById('feedUpdates');
        if (feedUpdatesElement) {
            const feedUpdates = this.calculateFeedUpdates();
            feedUpdatesElement.textContent = feedUpdates;
        }

        // User level
        const userLevelElement = document.getElementById('userLevel');
        if (userLevelElement) {
            const userLevel = this.calculateUserLevel();
            userLevelElement.textContent = userLevel;
        }
    }

    calculateImpactScore() {
        if (!this.currentUser) return 0;

        let score = 0;
        
        // Points for reports submitted
        score += (this.currentUser.reportsSubmitted || 0) * 10;
        
        // Points for consistent carbon tracking
        const activities = this.currentUser.activities || [];
        const carbonTrackingActivities = activities.filter(a => a.type === 'carbon-tracking');
        score += carbonTrackingActivities.length * 5;
        
        // Points for community engagement
        const communityActivities = activities.filter(a => a.type === 'community-action');
        score += communityActivities.length * 15;
        
        // Bonus for low carbon footprint
        if (this.currentUser.carbonFootprint && this.currentUser.carbonFootprint.total < 5) {
            score += 50;
        }

        return Math.min(score, 1000); // Cap at 1000 points
    }

    calculateCarbonSaved() {
        // Simulate carbon saved based on user activities
        const activities = this.currentUser.activities || [];
        const carbonActivities = activities.filter(a => a.type === 'carbon-tracking');
        return carbonActivities.length * 2.5; // 2.5 kg per tracking activity
    }

    calculateCommunityActions() {
        const activities = this.currentUser.activities || [];
        return activities.filter(a => a.type === 'community-action').length;
    }

    calculateTodayCarbon() {
        // Simulate today's carbon footprint
        const today = new Date().toDateString();
        const activities = this.currentUser.activities || [];
        const todayActivities = activities.filter(a => {
            const activityDate = new Date(a.timestamp).toDateString();
            return activityDate === today && a.type === 'carbon-tracking';
        });
        
        return todayActivities.length > 0 ? Math.random() * 5 + 2 : 0;
    }

    calculateActiveIssues() {
        // Simulate active issues based on reports
        return Math.floor((this.currentUser.reportsSubmitted || 0) * 0.7);
    }

    calculateFeedUpdates() {
        // Simulate feed updates
        return Math.floor(Math.random() * 10) + 1;
    }

    calculateUserLevel() {
        const impactScore = this.calculateImpactScore();
        return Math.floor(impactScore / 100) + 1;
    }

    updateActivityFeed() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        // Clear existing activities except welcome message
        const existingActivities = activityList.querySelectorAll('.activity-item');
        existingActivities.forEach((item, index) => {
            if (index > 0) item.remove(); // Keep first welcome message
        });

        // Add recent activities
        const activities = this.currentUser.activities || [];
        const recentActivities = activities.slice(-5).reverse(); // Last 5 activities

        recentActivities.forEach(activity => {
            const activityItem = this.createActivityItem(activity);
            activityList.appendChild(activityItem);
        });
    }

    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const iconMap = {
            'carbon-tracking': 'fas fa-chart-line',
            'community-action': 'fas fa-users',
            'photo-report': 'fas fa-camera',
            'default': 'fas fa-leaf'
        };

        const icon = iconMap[activity.type] || iconMap.default;
        const timeAgo = this.getTimeAgo(activity.timestamp);

        item.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <span class="activity-text">${this.getActivityText(activity)}</span>
                <span class="activity-time">${timeAgo}</span>
            </div>
        `;

        return item;
    }

    getActivityText(activity) {
        const textMap = {
            'carbon-tracking': 'Tracked carbon footprint',
            'community-action': 'Participated in community action',
            'photo-report': 'Submitted environmental report',
            'default': 'Completed an eco-friendly action'
        };

        return textMap[activity.type] || textMap.default;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    navigateToFeature(feature) {
        const featurePages = {
            'carbon-footprint': 'carbon-footprint.html',
            'regional-sustainability': 'regional-sustainability.html',
            'photo-reporting': 'photo-reporting.html',
            'action-feed': 'action-feed.html',
            'impact-visualizer': 'impact-visualizer.html',
            'settings': 'settings.html'
        };

        const page = featurePages[feature];
        if (page) {
            // Add loading animation
            this.showLoadingTransition(() => {
                window.location.href = page;
            });
        }
    }

    showLoadingTransition(callback) {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(45, 90, 39, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease-out;
        `;

        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 48px; margin-bottom: 16px; animation: spin 1s linear infinite;">🌿</div>
                <div style="font-size: 18px; font-weight: 500;">Loading...</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Execute callback after animation
        setTimeout(() => {
            callback();
        }, 800);
    }

    animateElements() {
        // Add staggered animation to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.setProperty('--delay', `${index * 0.1}s`);
            card.classList.add('fade-in-up', 'stagger-animation');
        });

        // Add animation to stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.setProperty('--delay', `${index * 0.15}s`);
            card.classList.add('fade-in-up', 'stagger-animation');
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

