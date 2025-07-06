// Regional Sustainability Feature
class RegionalSustainability {
    constructor() {
        this.currentUser = null;
        this.map = null;
        this.ecoResources = {
            recycling: [
                { name: "Harris County Recycling Center", lat: 29.7604, lng: -95.3698, type: "recycling" },
                { name: "Westpark Recycling Center", lat: 29.7372, lng: -95.4618, type: "recycling" },
                { name: "Northeast Recycling Center", lat: 29.8131, lng: -95.2861, type: "recycling" }
            ],
            solar: [
                { name: "Houston Solar Farm", lat: 29.7849, lng: -95.3414, type: "solar" },
                { name: "Community Solar Garden", lat: 29.7294, lng: -95.3927, type: "solar" }
            ],
            parks: [
                { name: "Hermann Park", lat: 29.7164, lng: -95.3900, type: "park" },
                { name: "Buffalo Bayou Park", lat: 29.7633, lng: -95.3832, type: "park" },
                { name: "Memorial Park", lat: 29.7631, lng: -95.4349, type: "park" }
            ],
            charging: [
                { name: "Tesla Supercharger", lat: 29.7372, lng: -95.4618, type: "charging" },
                { name: "ChargePoint Station", lat: 29.7604, lng: -95.3698, type: "charging" },
                { name: "EVgo Fast Charging", lat: 29.7849, lng: -95.3414, type: "charging" }
            ]
        };
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateLocationDisplay();
        this.initMap();
        this.updateEnvironmentalData();
    }

    loadUserData() {
        const userData = localStorage.getItem('ecolink_user');
        if (!userData) {
            window.location.href = '../index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    setupEventListeners() {
        // Change location button
        document.getElementById('changeLocationBtn').addEventListener('click', () => {
            this.openLocationModal();
        });

        // Location modal controls
        document.getElementById('closeLocationModal').addEventListener('click', () => {
            this.closeLocationModal();
        });

        document.getElementById('cancelLocationBtn').addEventListener('click', () => {
            this.closeLocationModal();
        });

        // Location form
        document.getElementById('locationForm').addEventListener('submit', (e) => {
            this.handleLocationUpdate(e);
        });

        // Action buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleActionClick(e);
            });
        });

        // Modal backdrop click
        document.getElementById('locationModal').addEventListener('click', (e) => {
            if (e.target.id === 'locationModal') {
                this.closeLocationModal();
            }
        });
    }

    updateLocationDisplay() {
        const locationElement = document.getElementById('currentLocation');
        if (this.currentUser.location && this.currentUser.location.city) {
            const location = this.currentUser.location;
            locationElement.textContent = `${location.city}, ${location.county}`;
        } else {
            locationElement.textContent = 'Houston, Harris County';
        }
    }

    initMap() {
        // Initialize Leaflet map centered on Houston
        this.map = L.map('sustainabilityMap').setView([29.7604, -95.3698], 11);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add eco-resource markers
        this.addEcoResourceMarkers();
    }

    addEcoResourceMarkers() {
        const markerIcons = {
            recycling: '♻️',
            solar: '☀️',
            park: '🌳',
            charging: '🔌'
        };

        const markerColors = {
            recycling: '#27ae60',
            solar: '#f39c12',
            park: '#2ecc71',
            charging: '#3498db'
        };

        Object.entries(this.ecoResources).forEach(([category, resources]) => {
            resources.forEach(resource => {
                const marker = L.marker([resource.lat, resource.lng], {
                    icon: L.divIcon({
                        html: `<div style="background: ${markerColors[resource.type]}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${markerIcons[resource.type]}</div>`,
                        className: 'custom-marker',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(this.map);

                marker.bindPopup(`
                    <div style="text-align: center; padding: 8px;">
                        <strong>${resource.name}</strong><br>
                        <span style="color: ${markerColors[resource.type]}; text-transform: capitalize;">${resource.type.replace('_', ' ')}</span>
                    </div>
                `);
            });
        });
    }

    updateEnvironmentalData() {
        // Simulate environmental data based on location
        const location = this.currentUser.location || { city: 'Houston', county: 'Harris County' };
        
        // Update data based on location (this would normally come from APIs)
        if (location.city === 'Houston') {
            this.updateHoustonData();
        } else {
            this.updateGenericData();
        }
    }

    updateHoustonData() {
        // Houston-specific environmental data
        document.getElementById('aqiValue').textContent = '42';
        document.getElementById('ecoScore').textContent = 'B+';
        document.getElementById('airQuality').textContent = 'Good';
        document.getElementById('recyclingRate').textContent = '68%';
    }

    updateGenericData() {
        // Generic environmental data for other locations
        const aqi = Math.floor(Math.random() * 50) + 30; // 30-80 range
        const recyclingRate = Math.floor(Math.random() * 30) + 60; // 60-90% range
        
        document.getElementById('aqiValue').textContent = aqi.toString();
        document.getElementById('recyclingRate').textContent = `${recyclingRate}%`;
        
        // Calculate EcoScore based on various factors
        const ecoScore = this.calculateEcoScore(aqi, recyclingRate);
        document.getElementById('ecoScore').textContent = ecoScore;
        
        // Update air quality status
        const airQualityStatus = aqi < 50 ? 'Good' : aqi < 100 ? 'Moderate' : 'Poor';
        document.getElementById('airQuality').textContent = airQualityStatus;
    }

    calculateEcoScore(aqi, recyclingRate) {
        // Simple EcoScore calculation
        const airScore = Math.max(0, 100 - aqi);
        const wasteScore = recyclingRate;
        const overallScore = (airScore + wasteScore) / 2;
        
        if (overallScore >= 90) return 'A+';
        if (overallScore >= 85) return 'A';
        if (overallScore >= 80) return 'A-';
        if (overallScore >= 75) return 'B+';
        if (overallScore >= 70) return 'B';
        if (overallScore >= 65) return 'B-';
        if (overallScore >= 60) return 'C+';
        if (overallScore >= 55) return 'C';
        return 'C-';
    }

    openLocationModal() {
        const modal = document.getElementById('locationModal');
        const location = this.currentUser.location || {};
        
        // Pre-fill current location
        document.getElementById('newCountry').value = location.country || 'United States';
        document.getElementById('newCity').value = location.city || 'Houston';
        document.getElementById('newCounty').value = location.county || 'Harris County';
        
        modal.classList.remove('hidden');
    }

    closeLocationModal() {
        document.getElementById('locationModal').classList.add('hidden');
    }

    handleLocationUpdate(e) {
        e.preventDefault();
        
        const newLocation = {
            country: document.getElementById('newCountry').value,
            city: document.getElementById('newCity').value,
            county: document.getElementById('newCounty').value
        };

        // Update user data
        this.currentUser.location = newLocation;
        this.updateUserData();

        // Update UI
        this.updateLocationDisplay();
        this.updateEnvironmentalData();
        
        // Update map center if it's a major city
        this.updateMapLocation(newLocation);
        
        // Close modal
        this.closeLocationModal();
        
        // Show success message
        this.showNotification('Location updated successfully!', 'success');
    }

    updateMapLocation(location) {
        // Simple city coordinates mapping (in a real app, you'd use a geocoding service)
        const cityCoordinates = {
            'Houston': [29.7604, -95.3698],
            'Austin': [30.2672, -97.7431],
            'Dallas': [32.7767, -96.7970],
            'San Antonio': [29.4241, -98.4936],
            'New York': [40.7128, -74.0060],
            'Los Angeles': [34.0522, -118.2437],
            'Chicago': [41.8781, -87.6298]
        };

        const coords = cityCoordinates[location.city];
        if (coords && this.map) {
            this.map.setView(coords, 11);
            
            // Clear existing markers and add new ones for the location
            this.map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    this.map.removeLayer(layer);
                }
            });
            
            // Add generic eco-resources for the new location
            this.addGenericEcoResources(coords);
        }
    }

    addGenericEcoResources(centerCoords) {
        const [lat, lng] = centerCoords;
        const genericResources = [
            { name: "Local Recycling Center", lat: lat + 0.02, lng: lng + 0.02, type: "recycling" },
            { name: "Community Solar Project", lat: lat - 0.01, lng: lng + 0.03, type: "solar" },
            { name: "City Park", lat: lat + 0.01, lng: lng - 0.02, type: "park" },
            { name: "EV Charging Station", lat: lat - 0.02, lng: lng - 0.01, type: "charging" }
        ];

        const markerIcons = {
            recycling: '♻️',
            solar: '☀️',
            park: '🌳',
            charging: '🔌'
        };

        const markerColors = {
            recycling: '#27ae60',
            solar: '#f39c12',
            park: '#2ecc71',
            charging: '#3498db'
        };

        genericResources.forEach(resource => {
            const marker = L.marker([resource.lat, resource.lng], {
                icon: L.divIcon({
                    html: `<div style="background: ${markerColors[resource.type]}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${markerIcons[resource.type]}</div>`,
                    className: 'custom-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(this.map);

            marker.bindPopup(`
                <div style="text-align: center; padding: 8px;">
                    <strong>${resource.name}</strong><br>
                    <span style="color: ${markerColors[resource.type]}; text-transform: capitalize;">${resource.type.replace('_', ' ')}</span>
                </div>
            `);
        });
    }

    handleActionClick(e) {
        const actionText = e.target.closest('.action-item').querySelector('h3').textContent;
        
        // Simulate action responses
        const actions = {
            'Improve Recycling': 'Opening recycling guide...',
            'Use Public Transit': 'Loading transit routes...',
            'Plant Native Species': 'Downloading planting guide...'
        };

        const message = actions[actionText] || 'Taking action...';
        this.showNotification(message, 'info');
        
        // In a real app, this would open relevant resources or external links
    }

    updateUserData() {
        const existingUsers = JSON.parse(localStorage.getItem('ecolink_users') || '{}');
        existingUsers[this.currentUser.username] = this.currentUser;
        localStorage.setItem('ecolink_users', JSON.stringify(existingUsers));
        localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));
    }

    showNotification(message, type = 'info') {
        // Create notification element
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegionalSustainability();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

