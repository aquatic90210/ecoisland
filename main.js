// Main utility functions and global app logic
class EcoLinkApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupGlobalEventListeners();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('ecolink_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    setupGlobalEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadCurrentUser();
            }
        });

        // Handle storage changes (for multi-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'ecolink_user') {
                this.loadCurrentUser();
            }
        });
    }

    // Utility function to format dates
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    // Utility function to calculate carbon footprint
    calculateCarbonFootprint(activities) {
        const carbonFactors = {
            car: 0.21, // kg CO2 per km
            bus: 0.089, // kg CO2 per km
            train: 0.041, // kg CO2 per km
            plane: 0.255, // kg CO2 per km
            electricity: 0.5, // kg CO2 per kWh
            gas: 2.3, // kg CO2 per cubic meter
            meat: 6.61, // kg CO2 per kg
            dairy: 3.2, // kg CO2 per kg
            vegetables: 0.4 // kg CO2 per kg
        };

        let totalCarbon = 0;
        activities.forEach(activity => {
            const factor = carbonFactors[activity.type] || 0;
            totalCarbon += activity.amount * factor;
        });

        return Math.round(totalCarbon * 100) / 100; // Round to 2 decimal places
    }

    // Utility function to generate eco-friendly suggestions
    generateEcoSuggestions(carbonFootprint, userPurposes) {
        const suggestions = [];
        
        if (carbonFootprint > 10) {
            suggestions.push({
                icon: '🚲',
                title: 'Try cycling or walking',
                description: 'Replace short car trips with cycling or walking to reduce emissions',
                impact: 'High'
            });
        }

        if (userPurposes.includes('carbon-tracking')) {
            suggestions.push({
                icon: '💡',
                title: 'Switch to LED bulbs',
                description: 'LED bulbs use 75% less energy than traditional incandescent bulbs',
                impact: 'Medium'
            });
        }

        if (userPurposes.includes('community-action')) {
            suggestions.push({
                icon: '🌱',
                title: 'Start a community garden',
                description: 'Organize neighbors to create a local food source and green space',
                impact: 'High'
            });
        }

        suggestions.push({
            icon: '♻️',
            title: 'Improve recycling habits',
            description: 'Properly sort waste and learn about local recycling programs',
            impact: 'Medium'
        });

        suggestions.push({
            icon: '🌿',
            title: 'Use reusable bags',
            description: 'Bring your own bags when shopping to reduce plastic waste',
            impact: 'Low'
        });

        return suggestions.slice(0, 3); // Return top 3 suggestions
    }

    // Utility function to save user activity
    saveUserActivity(activityType, data) {
        if (!this.currentUser) return;

        const activity = {
            type: activityType,
            data: data,
            timestamp: new Date().toISOString()
        };

        // Initialize activities array if it doesn't exist
        if (!this.currentUser.activities) {
            this.currentUser.activities = [];
        }

        this.currentUser.activities.push(activity);
        this.updateUserData();
    }

    // Update user data in localStorage
    updateUserData() {
        if (!this.currentUser) return;

        const existingUsers = JSON.parse(localStorage.getItem('ecolink_users') || '{}');
        existingUsers[this.currentUser.username] = this.currentUser;
        localStorage.setItem('ecolink_users', JSON.stringify(existingUsers));
        localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));
    }

    // Logout function
    logout() {
        localStorage.removeItem('ecolink_user');
        this.currentUser = null;
        window.location.href = '../index.html';
    }

    // Get user's impact score
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

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInNotification 0.3s ease-out;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app
const app = new EcoLinkApp();

// Add notification animations CSS
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInNotification {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutNotification {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);

// Export for use in other modules
window.EcoLinkApp = app;

