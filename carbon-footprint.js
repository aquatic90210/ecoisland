// Carbon Footprint Feature
class CarbonFootprint {
    constructor() {
        this.currentUser = null;
        this.carbonChart = null;
        this.breakdownChart = null;
        this.carbonFactors = {
            // Transportation (kg CO2 per km)
            car: 0.21,
            bus: 0.089,
            train: 0.041,
            plane: 0.255,
            // Energy (kg CO2 per kWh/m³)
            electricity: 0.5,
            gas: 2.3,
            // Food (kg CO2 per kg)
            meat: 6.61,
            dairy: 3.2,
            vegetables: 0.4
        };
        this.activityTypes = {
            transport: {
                car: { label: 'Car', unit: 'km', icon: 'fas fa-car' },
                bus: { label: 'Bus', unit: 'km', icon: 'fas fa-bus' },
                train: { label: 'Train', unit: 'km', icon: 'fas fa-train' },
                plane: { label: 'Flight', unit: 'km', icon: 'fas fa-plane' }
            },
            energy: {
                electricity: { label: 'Electricity', unit: 'kWh', icon: 'fas fa-bolt' },
                gas: { label: 'Gas', unit: 'm³', icon: 'fas fa-fire' }
            },
            food: {
                meat: { label: 'Meat', unit: 'kg', icon: 'fas fa-drumstick-bite' },
                dairy: { label: 'Dairy', unit: 'kg', icon: 'fas fa-cheese' },
                vegetables: { label: 'Vegetables', unit: 'kg', icon: 'fas fa-carrot' }
            }
        };
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateStats();
        this.loadTodayActivities();
        this.generateSuggestions();
        this.initCharts();
        this.setDefaultDate();
    }

    loadUserData() {
        const userData = localStorage.getItem('ecolink_user');
        if (!userData) {
            window.location.href = '../index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
        
        // Initialize carbon footprint data if not exists
        if (!this.currentUser.carbonFootprint) {
            this.currentUser.carbonFootprint = {
                daily: [],
                weekly: [],
                total: 0,
                activities: []
            };
            this.updateUserData();
        }
    }

    setupEventListeners() {
        // Quick add buttons
        const quickAddBtns = document.querySelectorAll('.quick-add-btn');
        quickAddBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                const type = btn.dataset.type;
                this.openActivityModal(category, type);
            });
        });

        // Add activity button
        document.getElementById('addActivityBtn').addEventListener('click', () => {
            this.openActivityModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeActivityModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeActivityModal();
        });

        // Activity form
        document.getElementById('activityForm').addEventListener('submit', (e) => {
            this.handleActivitySubmit(e);
        });

        // Category change
        document.getElementById('activityCategory').addEventListener('change', (e) => {
            this.updateActivityTypes(e.target.value);
        });

        // Type change
        document.getElementById('activityType').addEventListener('change', (e) => {
            this.updateActivityUnit(e.target.value);
        });

        // Chart controls
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChart(btn.dataset.period);
            });
        });

        // Modal backdrop click
        document.getElementById('activityModal').addEventListener('click', (e) => {
            if (e.target.id === 'activityModal') {
                this.closeActivityModal();
            }
        });
    }

    openActivityModal(category = '', type = '') {
        const modal = document.getElementById('activityModal');
        const categorySelect = document.getElementById('activityCategory');
        const typeSelect = document.getElementById('activityType');
        
        // Reset form
        document.getElementById('activityForm').reset();
        
        // Set category if provided
        if (category) {
            categorySelect.value = category;
            this.updateActivityTypes(category);
            
            if (type) {
                typeSelect.value = type;
                this.updateActivityUnit(type);
            }
        }
        
        modal.classList.remove('hidden');
    }

    closeActivityModal() {
        document.getElementById('activityModal').classList.add('hidden');
    }

    updateActivityTypes(category) {
        const typeSelect = document.getElementById('activityType');
        const unitSpan = document.getElementById('activityUnit');
        
        typeSelect.innerHTML = '<option value="">Select type</option>';
        
        if (category && this.activityTypes[category]) {
            Object.entries(this.activityTypes[category]).forEach(([key, value]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value.label;
                typeSelect.appendChild(option);
            });
        }
        
        unitSpan.textContent = 'unit';
    }

    updateActivityUnit(type) {
        const unitSpan = document.getElementById('activityUnit');
        const category = document.getElementById('activityCategory').value;
        
        if (category && type && this.activityTypes[category][type]) {
            unitSpan.textContent = this.activityTypes[category][type].unit;
        }
    }

    setDefaultDate() {
        const dateInput = document.getElementById('activityDate');
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        dateInput.value = todayStr;
    }

    handleActivitySubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const activity = {
            id: Date.now(),
            category: document.getElementById('activityCategory').value,
            type: document.getElementById('activityType').value,
            amount: parseFloat(document.getElementById('activityAmount').value),
            date: document.getElementById('activityDate').value,
            timestamp: new Date().toISOString()
        };

        // Calculate carbon footprint
        activity.carbon = this.calculateActivityCarbon(activity);

        // Add to user data
        if (!this.currentUser.carbonFootprint.activities) {
            this.currentUser.carbonFootprint.activities = [];
        }
        
        this.currentUser.carbonFootprint.activities.push(activity);
        this.updateUserData();

        // Update UI
        this.updateStats();
        this.loadTodayActivities();
        this.updateCharts();
        this.generateSuggestions();
        
        // Close modal
        this.closeActivityModal();
        
        // Show success message
        this.showNotification('Activity added successfully!', 'success');
    }

    calculateActivityCarbon(activity) {
        const factor = this.carbonFactors[activity.type] || 0;
        return Math.round(activity.amount * factor * 100) / 100;
    }

    updateStats() {
        const activities = this.currentUser.carbonFootprint.activities || [];
        
        // Total carbon
        const totalCarbon = activities.reduce((sum, activity) => sum + activity.carbon, 0);
        document.getElementById('totalCarbon').textContent = totalCarbon.toFixed(1);
        
        // Weekly average
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyActivities = activities.filter(activity => 
            new Date(activity.date) >= weekAgo
        );
        const weeklyAverage = weeklyActivities.length > 0 ? 
            weeklyActivities.reduce((sum, activity) => sum + activity.carbon, 0) / 7 : 0;
        document.getElementById('weeklyAverage').textContent = weeklyAverage.toFixed(1);
        
        // Today's carbon
        const today = new Date().toISOString().split('T')[0];
        const todayActivities = activities.filter(activity => activity.date === today);
        const todayCarbon = todayActivities.reduce((sum, activity) => sum + activity.carbon, 0);
        document.getElementById('todayCarbon').textContent = todayCarbon.toFixed(1);
    }

    loadTodayActivities() {
        const activityList = document.getElementById('activityList');
        const today = new Date().toISOString().split('T')[0];
        const activities = this.currentUser.carbonFootprint.activities || [];
        const todayActivities = activities.filter(activity => activity.date === today);

        if (todayActivities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-leaf"></i>
                    <p>No activities logged today</p>
                    <span>Start tracking your carbon footprint by adding an activity above</span>
                </div>
            `;
            return;
        }

        activityList.innerHTML = todayActivities.map(activity => {
            const typeInfo = this.activityTypes[activity.category][activity.type];
            return `
                <div class="activity-item">
                    <div class="activity-info">
                        <div class="activity-icon">
                            <i class="${typeInfo.icon}"></i>
                        </div>
                        <div class="activity-details">
                            <h4>${typeInfo.label}</h4>
                            <p>${activity.amount} ${typeInfo.unit}</p>
                        </div>
                    </div>
                    <div class="activity-carbon">${activity.carbon.toFixed(1)} kg CO₂</div>
                </div>
            `;
        }).join('');
    }

    generateSuggestions() {
        const activities = this.currentUser.carbonFootprint.activities || [];
        const totalCarbon = activities.reduce((sum, activity) => sum + activity.carbon, 0);
        const purposes = this.currentUser.purposes || [];
        
        const suggestions = [];
        
        // High carbon footprint suggestions
        if (totalCarbon > 50) {
            suggestions.push({
                icon: 'fas fa-bicycle',
                title: 'Try cycling or walking',
                description: 'Replace short car trips with cycling or walking to reduce emissions',
                impact: 'high'
            });
        }
        
        // Transport-heavy suggestions
        const transportActivities = activities.filter(a => a.category === 'transport');
        if (transportActivities.length > 5) {
            suggestions.push({
                icon: 'fas fa-bus',
                title: 'Use public transportation',
                description: 'Public transport can reduce your carbon footprint by up to 45%',
                impact: 'high'
            });
        }
        
        // Energy suggestions
        if (purposes.includes('carbon-tracking')) {
            suggestions.push({
                icon: 'fas fa-lightbulb',
                title: 'Switch to LED bulbs',
                description: 'LED bulbs use 75% less energy than traditional incandescent bulbs',
                impact: 'medium'
            });
        }
        
        // Food suggestions
        const meatActivities = activities.filter(a => a.type === 'meat');
        if (meatActivities.length > 3) {
            suggestions.push({
                icon: 'fas fa-seedling',
                title: 'Try plant-based meals',
                description: 'Reducing meat consumption can significantly lower your carbon footprint',
                impact: 'high'
            });
        }
        
        // Default suggestions
        if (suggestions.length === 0) {
            suggestions.push(
                {
                    icon: 'fas fa-recycle',
                    title: 'Improve recycling habits',
                    description: 'Properly sort waste and learn about local recycling programs',
                    impact: 'medium'
                },
                {
                    icon: 'fas fa-shopping-bag',
                    title: 'Use reusable bags',
                    description: 'Bring your own bags when shopping to reduce plastic waste',
                    impact: 'low'
                }
            );
        }
        
        this.displaySuggestions(suggestions.slice(0, 3));
    }

    displaySuggestions(suggestions) {
        const suggestionsList = document.getElementById('suggestionsList');
        
        suggestionsList.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-icon">
                    <i class="${suggestion.icon}"></i>
                </div>
                <div class="suggestion-content">
                    <h3>${suggestion.title}</h3>
                    <p>${suggestion.description}</p>
                    <span class="impact-badge ${suggestion.impact}">${suggestion.impact} Impact</span>
                </div>
            </div>
        `).join('');
    }

    initCharts() {
        this.initCarbonChart();
        this.initBreakdownChart();
    }

    initCarbonChart() {
        const ctx = document.getElementById('carbonChart').getContext('2d');
        const weekData = this.getWeeklyData();
        
        this.carbonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weekData.labels,
                datasets: [{
                    label: 'Daily Carbon Footprint (kg CO₂)',
                    data: weekData.data,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
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
                            color: '#f0f0f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initBreakdownChart() {
        const ctx = document.getElementById('breakdownChart').getContext('2d');
        const breakdownData = this.getTodayBreakdown();
        
        this.breakdownChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Transport', 'Energy', 'Food'],
                datasets: [{
                    data: [breakdownData.transport, breakdownData.energy, breakdownData.food],
                    backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        this.updateBreakdownLegend(breakdownData);
    }

    getWeeklyData() {
        const activities = this.currentUser.carbonFootprint.activities || [];
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const dayActivities = activities.filter(activity => activity.date === dateStr);
            const dayCarbon = dayActivities.reduce((sum, activity) => sum + activity.carbon, 0);
            data.push(dayCarbon);
        }
        
        return { labels, data };
    }

    getTodayBreakdown() {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.currentUser.carbonFootprint.activities || [];
        const todayActivities = activities.filter(activity => activity.date === today);
        
        const breakdown = {
            transport: 0,
            energy: 0,
            food: 0
        };
        
        todayActivities.forEach(activity => {
            breakdown[activity.category] += activity.carbon;
        });
        
        return breakdown;
    }

    updateBreakdownLegend(breakdown) {
        const legend = document.getElementById('breakdownLegend');
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #e74c3c;"></div>
                <span>Transport: ${breakdown.transport.toFixed(1)} kg</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f39c12;"></div>
                <span>Energy: ${breakdown.energy.toFixed(1)} kg</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #27ae60;"></div>
                <span>Food: ${breakdown.food.toFixed(1)} kg</span>
            </div>
        `;
    }

    updateChart(period) {
        if (period === 'week') {
            const weekData = this.getWeeklyData();
            this.carbonChart.data.labels = weekData.labels;
            this.carbonChart.data.datasets[0].data = weekData.data;
        } else if (period === 'month') {
            const monthData = this.getMonthlyData();
            this.carbonChart.data.labels = monthData.labels;
            this.carbonChart.data.datasets[0].data = monthData.data;
        }
        
        this.carbonChart.update();
    }

    getMonthlyData() {
        const activities = this.currentUser.carbonFootprint.activities || [];
        const labels = [];
        const data = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (i % 5 === 0) { // Show every 5th day
                labels.push(date.getDate().toString());
            } else {
                labels.push('');
            }
            
            const dayActivities = activities.filter(activity => activity.date === dateStr);
            const dayCarbon = dayActivities.reduce((sum, activity) => sum + activity.carbon, 0);
            data.push(dayCarbon);
        }
        
        return { labels, data };
    }

    updateCharts() {
        if (this.carbonChart) {
            const weekData = this.getWeeklyData();
            this.carbonChart.data.labels = weekData.labels;
            this.carbonChart.data.datasets[0].data = weekData.data;
            this.carbonChart.update();
        }
        
        if (this.breakdownChart) {
            const breakdownData = this.getTodayBreakdown();
            this.breakdownChart.data.datasets[0].data = [
                breakdownData.transport,
                breakdownData.energy,
                breakdownData.food
            ];
            this.breakdownChart.update();
            this.updateBreakdownLegend(breakdownData);
        }
    }

    updateUserData() {
        const existingUsers = JSON.parse(localStorage.getItem('ecolink_users') || '{}');
        existingUsers[this.currentUser.username] = this.currentUser;
        localStorage.setItem('ecolink_users', JSON.stringify(existingUsers));
        localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));
    }

    showNotification(message, type = 'info') {
        // Use the global app notification system
        if (window.EcoLinkApp) {
            window.EcoLinkApp.showNotification(message, type);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarbonFootprint();
});

