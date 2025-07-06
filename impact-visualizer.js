// Impact Visualizer Feature
class ImpactVisualizer {
    constructor() {
        this.currentUser = null;
        this.carbonChart = null;
        this.activityChart = null;
        this.achievements = [
            { id: 'first_report', name: 'First Report', description: 'Made your first environmental report', icon: 'camera', earned: true, xp: 50 },
            { id: 'carbon_saver', name: 'Carbon Saver', description: 'Saved 10kg of CO₂', icon: 'leaf', earned: true, xp: 100 },
            { id: 'week_streak', name: 'Week Warrior', description: '7-day activity streak', icon: 'fire', earned: true, xp: 75 },
            { id: 'community_hero', name: 'Community Hero', description: 'Inspired 20 people', icon: 'users', earned: false, xp: 200 },
            { id: 'eco_expert', name: 'Eco Expert', description: 'Reached Level 5', icon: 'graduation-cap', earned: false, xp: 300 },
            { id: 'green_guardian', name: 'Green Guardian', description: 'Saved 50kg of CO₂', icon: 'shield-alt', earned: false, xp: 250 }
        ];
        this.init();
    }

    init() {
        this.loadUserData();
        this.updateStats();
        this.renderAchievements();
        this.initCharts();
        this.startAnimations();
    }

    loadUserData() {
        const userData = localStorage.getItem('ecolink_user');
        if (!userData) {
            window.location.href = '../index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    updateStats() {
        // Calculate user stats from stored data
        const carbonData = this.getCarbonFootprintData();
        const reportsData = this.getReportsData();
        const actionFeedData = this.getActionFeedData();

        // Update carbon saved (difference from baseline)
        const totalCarbon = carbonData.reduce((sum, entry) => sum + entry.amount, 0);
        const carbonSaved = Math.max(0, 50 - totalCarbon); // Assuming 50kg baseline
        document.getElementById('carbonSaved').textContent = carbonSaved.toFixed(1);

        // Update reports made
        document.getElementById('reportsMade').textContent = reportsData.length;

        // Update community impact (likes + comments)
        const communityImpact = actionFeedData.reduce((sum, item) => sum + item.likes + item.comments.length, 0);
        document.getElementById('communityImpact').textContent = communityImpact;

        // Update streak (simplified calculation)
        const streakDays = this.calculateStreak();
        document.getElementById('streakDays').textContent = streakDays;

        // Update level and XP
        this.updateLevel(carbonSaved, reportsData.length, communityImpact, streakDays);
    }

    getCarbonFootprintData() {
        const activities = JSON.parse(localStorage.getItem('ecolink_carbon_activities') || '[]');
        return activities;
    }

    getReportsData() {
        const reports = JSON.parse(localStorage.getItem('ecolink_reports') || '[]');
        return reports.filter(report => report.userId === this.currentUser.username);
    }

    getActionFeedData() {
        const feed = JSON.parse(localStorage.getItem('ecolink_action_feed') || '[]');
        return feed.filter(item => item.userId === this.currentUser.username);
    }

    calculateStreak() {
        // Simplified streak calculation - in a real app, this would be more sophisticated
        const activities = this.getCarbonFootprintData();
        const reports = this.getReportsData();
        const totalActivities = activities.length + reports.length;
        return Math.min(totalActivities * 2, 30); // Cap at 30 days
    }

    updateLevel(carbonSaved, reports, communityImpact, streak) {
        // Calculate total XP
        const xp = Math.floor(carbonSaved * 10 + reports * 25 + communityImpact * 5 + streak * 10);
        
        // Determine level
        let level = 1;
        let levelName = 'Eco Beginner';
        let nextLevelXP = 100;
        
        if (xp >= 1000) {
            level = 5;
            levelName = 'Eco Expert';
            nextLevelXP = 2000;
        } else if (xp >= 500) {
            level = 4;
            levelName = 'Green Guardian';
            nextLevelXP = 1000;
        } else if (xp >= 200) {
            level = 3;
            levelName = 'Eco Warrior';
            nextLevelXP = 500;
        } else if (xp >= 100) {
            level = 2;
            levelName = 'Green Sprout';
            nextLevelXP = 200;
        }

        // Update UI
        document.getElementById('currentLevel').textContent = levelName;
        document.getElementById('currentXP').textContent = xp;
        document.getElementById('nextLevelXP').textContent = nextLevelXP;
        
        const progressPercent = (xp / nextLevelXP) * 100;
        document.getElementById('levelProgress').style.width = Math.min(progressPercent, 100) + '%';
    }

    renderAchievements() {
        const achievementsGrid = document.getElementById('achievementsGrid');
        
        achievementsGrid.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.earned ? 'earned' : 'locked'}">
                <div class="achievement-icon">
                    <i class="fas fa-${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-xp">
                        <i class="fas fa-star"></i>
                        <span>+${achievement.xp} XP</span>
                    </div>
                </div>
                ${achievement.earned ? '<div class="achievement-badge"><i class="fas fa-check"></i></div>' : ''}
            </div>
        `).join('');
    }

    initCharts() {
        this.initCarbonChart();
        this.initActivityChart();
    }

    initCarbonChart() {
        const ctx = document.getElementById('carbonChart').getContext('2d');
        
        // Generate sample data for the last 7 days
        const labels = [];
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(Math.random() * 5 + 2); // Random data between 2-7
        }

        this.carbonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CO₂ Saved (kg)',
                    data: data,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#27ae60',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    initActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        this.activityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Transportation', 'Energy', 'Waste', 'Reports'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: [
                        '#3498db',
                        '#f39c12',
                        '#27ae60',
                        '#e74c3c'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#666'
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    startAnimations() {
        // Floating leaves animation
        this.animateFloatingLeaves();
        
        // Pulse effects
        this.animatePulseEffects();
        
        // Ripple effects
        this.animateRippleEffects();
        
        // Flame animation
        this.animateFlame();
        
        // Tree animation
        this.animateTreeGrowth();
        
        // Energy animation
        this.animateEnergyBolt();
        
        // Water animation
        this.animateWaterDrops();
    }

    animateFloatingLeaves() {
        const leaves = document.querySelectorAll('.floating-leaves i');
        leaves.forEach((leaf, index) => {
            leaf.style.animationDelay = `${index * 0.5}s`;
            leaf.style.animation = 'floatLeaf 3s ease-in-out infinite';
        });
    }

    animatePulseEffects() {
        const pulseElements = document.querySelectorAll('.pulse-effect');
        pulseElements.forEach(element => {
            element.style.animation = 'pulse 2s ease-in-out infinite';
        });
    }

    animateRippleEffects() {
        const rippleElements = document.querySelectorAll('.ripple-effect');
        rippleElements.forEach(element => {
            element.style.animation = 'ripple 3s ease-out infinite';
        });
    }

    animateFlame() {
        const flames = document.querySelectorAll('.flame-animation i');
        flames.forEach(flame => {
            flame.style.animation = 'flicker 1.5s ease-in-out infinite alternate';
        });
    }

    animateTreeGrowth() {
        const trees = document.querySelectorAll('.tree-animation i');
        trees.forEach((tree, index) => {
            tree.style.animationDelay = `${index * 0.3}s`;
            tree.style.animation = 'growTree 4s ease-in-out infinite';
        });
    }

    animateEnergyBolt() {
        const bolts = document.querySelectorAll('.energy-animation i');
        bolts.forEach(bolt => {
            bolt.style.animation = 'energyPulse 1s ease-in-out infinite';
        });
    }

    animateWaterDrops() {
        const drops = document.querySelectorAll('.water-animation i');
        drops.forEach((drop, index) => {
            drop.style.animationDelay = `${index * 0.2}s`;
            drop.style.animation = 'waterDrop 2s ease-in-out infinite';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImpactVisualizer();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    /* Impact Visualizer Styles */
    .achievement-level {
        background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
        border-radius: 20px;
        padding: 32px;
        margin-bottom: 32px;
        color: var(--white);
    }

    .level-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 32px;
    }

    .level-info {
        flex: 1;
    }

    .level-badge {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
    }

    .level-icon {
        width: 80px;
        height: 80px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
    }

    .level-details h3 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .level-details p {
        opacity: 0.9;
        font-size: 16px;
    }

    .level-progress {
        max-width: 400px;
    }

    .progress-bar {
        height: 12px;
        background: rgba(255,255,255,0.2);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 8px;
    }

    .progress-fill {
        height: 100%;
        background: var(--white);
        border-radius: 6px;
        transition: width 0.3s ease;
    }

    .progress-fill.completed {
        background: #27ae60;
    }

    .progress-text {
        font-size: 14px;
        opacity: 0.9;
    }

    .next-level {
        display: flex;
        align-items: center;
        gap: 16px;
        background: rgba(255,255,255,0.1);
        padding: 20px;
        border-radius: 12px;
    }

    .next-level-icon {
        width: 48px;
        height: 48px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }

    .impact-stats {
        margin-bottom: 48px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
    }

    .stat-card {
        background: var(--white);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px var(--shadow);
        position: relative;
        overflow: hidden;
        transition: var(--transition);
    }

    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: var(--white);
        margin-bottom: 16px;
    }

    .carbon-saved .stat-icon {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
    }

    .reports-made .stat-icon {
        background: linear-gradient(135deg, #e74c3c, #ec7063);
    }

    .community-impact .stat-icon {
        background: linear-gradient(135deg, #3498db, #5dade2);
    }

    .streak-counter .stat-icon {
        background: linear-gradient(135deg, #f39c12, #f7dc6f);
    }

    .stat-value {
        font-size: 36px;
        font-weight: 700;
        color: var(--dark-text);
        line-height: 1;
        margin-bottom: 4px;
    }

    .stat-unit {
        color: var(--light-text);
        font-size: 14px;
        margin-bottom: 12px;
    }

    .stat-comparison {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #27ae60;
        font-size: 14px;
        font-weight: 500;
    }

    .stat-visual {
        position: absolute;
        top: 20px;
        right: 20px;
        opacity: 0.1;
        font-size: 48px;
    }

    .impact-visualization {
        margin-bottom: 48px;
    }

    .visualization-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 32px;
    }

    .chart-container {
        background: var(--white);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px var(--shadow);
        height: 400px;
    }

    .chart-container h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 20px;
    }

    .chart-container canvas {
        height: 300px !important;
    }

    .achievements {
        margin-bottom: 48px;
    }

    .achievements h2 {
        font-size: 24px;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 24px;
    }

    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }

    .achievement-card {
        background: var(--white);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        position: relative;
        transition: var(--transition);
    }

    .achievement-card.earned {
        border: 2px solid #27ae60;
        background: linear-gradient(135deg, #e8f5e8, #ffffff);
    }

    .achievement-card.locked {
        opacity: 0.6;
        filter: grayscale(100%);
    }

    .achievement-card:hover {
        transform: translateY(-2px);
    }

    .achievement-icon {
        width: 48px;
        height: 48px;
        background: var(--primary-green);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--white);
        font-size: 20px;
        margin-bottom: 16px;
    }

    .achievement-content h4 {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--dark-text);
    }

    .achievement-content p {
        color: var(--light-text);
        font-size: 14px;
        margin-bottom: 12px;
    }

    .achievement-xp {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #f39c12;
        font-weight: 500;
        font-size: 14px;
    }

    .achievement-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        background: #27ae60;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--white);
        font-size: 16px;
    }

    .environmental-impact {
        margin-bottom: 48px;
    }

    .environmental-impact h2 {
        font-size: 24px;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 24px;
    }

    .impact-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
    }

    .impact-card {
        background: var(--white);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px var(--shadow);
        display: flex;
        align-items: center;
        gap: 20px;
        transition: var(--transition);
    }

    .impact-card:hover {
        transform: translateY(-4px);
    }

    .impact-visual {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
    }

    .trees .impact-visual {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: var(--white);
    }

    .energy .impact-visual {
        background: linear-gradient(135deg, #f39c12, #f7dc6f);
        color: var(--white);
    }

    .water .impact-visual {
        background: linear-gradient(135deg, #3498db, #5dade2);
        color: var(--white);
    }

    .impact-content h4 {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--dark-text);
    }

    .impact-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--primary-green);
        margin-bottom: 8px;
    }

    .impact-content p {
        color: var(--light-text);
        font-size: 14px;
        line-height: 1.4;
    }

    .goals-challenges h2 {
        font-size: 24px;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 24px;
    }

    .goals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 24px;
    }

    .goal-card {
        background: var(--white);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px var(--shadow);
        transition: var(--transition);
    }

    .goal-card.active {
        border: 2px solid var(--primary-green);
    }

    .goal-card.completed {
        background: linear-gradient(135deg, #e8f5e8, #ffffff);
        border: 2px solid #27ae60;
    }

    .goal-card:hover {
        transform: translateY(-2px);
    }

    .goal-header {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
    }

    .goal-icon {
        width: 48px;
        height: 48px;
        background: var(--primary-green);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--white);
        font-size: 20px;
        flex-shrink: 0;
    }

    .goal-info h4 {
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--dark-text);
    }

    .goal-info p {
        color: var(--light-text);
        font-size: 14px;
    }

    .goal-progress {
        margin-bottom: 16px;
    }

    .goal-reward {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f39c12;
        font-weight: 500;
    }

    .goal-reward.completed {
        color: #27ae60;
    }

    /* Animations */
    @keyframes floatLeaf {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(5deg); }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 1; }
    }

    @keyframes ripple {
        0% { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(1.4); opacity: 0; }
    }

    @keyframes flicker {
        0%, 100% { transform: scale(1) rotate(-2deg); }
        50% { transform: scale(1.1) rotate(2deg); }
    }

    @keyframes growTree {
        0% { transform: scale(0.8) translateY(5px); }
        50% { transform: scale(1.1) translateY(-2px); }
        100% { transform: scale(1) translateY(0); }
    }

    @keyframes energyPulse {
        0%, 100% { transform: scale(1); color: #f39c12; }
        50% { transform: scale(1.2); color: #f7dc6f; }
    }

    @keyframes waterDrop {
        0% { transform: translateY(-5px); opacity: 0.7; }
        50% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(5px); opacity: 0.7; }
    }

    @media (max-width: 1024px) {
        .visualization-grid {
            grid-template-columns: 1fr;
        }
        
        .level-container {
            flex-direction: column;
            text-align: center;
        }
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .impact-card {
            flex-direction: column;
            text-align: center;
        }
        
        .goals-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

