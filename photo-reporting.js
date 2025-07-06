// Civic Photo Reporting Feature
class PhotoReporting {
    constructor() {
        this.currentUser = null;
        this.currentPhoto = null;
        this.reports = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadReports();
        this.setupEventListeners();
        this.updateStats();
    }

    loadUserData() {
        const userData = localStorage.getItem('ecolink_user');
        if (!userData) {
            window.location.href = '../index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    loadReports() {
        const savedReports = localStorage.getItem('ecolink_reports');
        this.reports = savedReports ? JSON.parse(savedReports) : [];
        this.renderReports();
    }

    setupEventListeners() {
        // Camera and upload buttons
        document.getElementById('cameraBtn').addEventListener('click', () => {
            this.openCamera();
        });

        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Retake button
        document.getElementById('retakeBtn').addEventListener('click', () => {
            this.resetUpload();
        });

        // Submit report button
        document.getElementById('submitReportBtn').addEventListener('click', () => {
            this.submitReport();
        });

        // Share to action feed button
        document.getElementById('shareActionBtn').addEventListener('click', () => {
            this.shareToActionFeed();
        });

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });
    }

    openCamera() {
        // Trigger file input with camera capture
        const fileInput = document.getElementById('fileInput');
        fileInput.setAttribute('capture', 'environment');
        fileInput.click();
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentPhoto = {
                file: file,
                dataUrl: e.target.result,
                timestamp: new Date().toISOString()
            };
            this.showAnalysisSection();
            this.analyzeImage();
        };
        reader.readAsDataURL(file);
    }

    showAnalysisSection() {
        const analysisSection = document.getElementById('analysisSection');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = this.currentPhoto.dataUrl;
        analysisSection.classList.remove('hidden');
        
        // Scroll to analysis section
        analysisSection.scrollIntoView({ behavior: 'smooth' });
    }

    analyzeImage() {
        const statusElement = document.getElementById('analysisStatus');
        const issueDetection = document.getElementById('issueDetection');
        const actionSuggestions = document.getElementById('actionSuggestions');

        // Show loading state
        statusElement.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Analyzing image...</span>
        `;

        // Simulate AI analysis delay
        setTimeout(() => {
            const analysis = this.simulateAIAnalysis();
            
            // Update status
            statusElement.innerHTML = `
                <i class="fas fa-check-circle" style="color: #27ae60;"></i>
                <span>Analysis complete</span>
            `;

            // Show detection results
            issueDetection.innerHTML = `
                <h4>Issue Detected</h4>
                <div class="issue-tag ${analysis.type.toLowerCase()}">
                    <i class="fas fa-${analysis.icon}"></i>
                    <span>${analysis.type}</span>
                </div>
                <p>${analysis.description}</p>
                <div class="confidence-score">
                    <span>Confidence: ${analysis.confidence}%</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${analysis.confidence}%"></div>
                    </div>
                </div>
            `;

            // Show action suggestions
            actionSuggestions.innerHTML = `
                <h4>Recommended Actions</h4>
                <div class="suggestions-list">
                    ${analysis.actions.map(action => `
                        <div class="suggestion-item">
                            <div class="suggestion-icon">
                                <i class="fas fa-${action.icon}"></i>
                            </div>
                            <div class="suggestion-content">
                                <h5>${action.title}</h5>
                                <p>${action.description}</p>
                                <span class="priority ${action.priority}">${action.priority.toUpperCase()} PRIORITY</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            this.currentPhoto.analysis = analysis;
        }, 2000);
    }

    simulateAIAnalysis() {
        // Simulate different types of environmental issues
        const issueTypes = [
            {
                type: 'Litter',
                icon: 'trash',
                description: 'Multiple pieces of litter detected including plastic bottles and food containers. This affects local wildlife and water quality.',
                confidence: 92,
                actions: [
                    {
                        title: 'Report to Local Authorities',
                        description: 'Contact your city\'s waste management department to schedule cleanup.',
                        icon: 'phone',
                        priority: 'high'
                    },
                    {
                        title: 'Organize Community Cleanup',
                        description: 'Start a neighborhood cleanup event to address the issue collectively.',
                        icon: 'users',
                        priority: 'medium'
                    },
                    {
                        title: 'Install More Trash Bins',
                        description: 'Request additional waste receptacles in this area.',
                        icon: 'trash-alt',
                        priority: 'low'
                    }
                ]
            },
            {
                type: 'Air Pollution',
                icon: 'smog',
                description: 'Visible air pollution detected, likely from industrial emissions or vehicle exhaust. May affect air quality in the area.',
                confidence: 87,
                actions: [
                    {
                        title: 'Report to EPA',
                        description: 'File a report with the Environmental Protection Agency.',
                        icon: 'flag',
                        priority: 'high'
                    },
                    {
                        title: 'Monitor Air Quality',
                        description: 'Use air quality monitoring apps to track pollution levels.',
                        icon: 'chart-line',
                        priority: 'medium'
                    },
                    {
                        title: 'Promote Clean Transportation',
                        description: 'Advocate for public transit and electric vehicle adoption.',
                        icon: 'bus',
                        priority: 'low'
                    }
                ]
            },
            {
                type: 'Water Pollution',
                icon: 'tint',
                description: 'Potential water contamination detected. Discoloration or debris visible in water body.',
                confidence: 89,
                actions: [
                    {
                        title: 'Contact Water Authority',
                        description: 'Report to local water management authority immediately.',
                        icon: 'exclamation-triangle',
                        priority: 'high'
                    },
                    {
                        title: 'Test Water Quality',
                        description: 'Arrange for professional water quality testing.',
                        icon: 'flask',
                        priority: 'high'
                    },
                    {
                        title: 'Warn Community',
                        description: 'Alert nearby residents about potential water contamination.',
                        icon: 'bullhorn',
                        priority: 'medium'
                    }
                ]
            }
        ];

        // Randomly select an issue type for simulation
        return issueTypes[Math.floor(Math.random() * issueTypes.length)];
    }

    submitReport() {
        if (!this.currentPhoto || !this.currentPhoto.analysis) {
            this.showNotification('Please analyze an image first', 'error');
            return;
        }

        const report = {
            id: Date.now().toString(),
            userId: this.currentUser.username,
            photo: this.currentPhoto.dataUrl,
            analysis: this.currentPhoto.analysis,
            location: this.currentUser.location || { city: 'Houston', county: 'Harris County' },
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.reports.unshift(report);
        this.saveReports();
        this.updateStats();
        this.renderReports();

        this.showNotification('Report submitted successfully!', 'success');
        this.resetUpload();
    }

    shareToActionFeed() {
        if (!this.currentPhoto || !this.currentPhoto.analysis) {
            this.showNotification('Please analyze an image first', 'error');
            return;
        }

        // Save to action feed (this would integrate with the action feed feature)
        const actionFeedItem = {
            id: Date.now().toString(),
            type: 'report',
            userId: this.currentUser.username,
            content: `Reported ${this.currentPhoto.analysis.type.toLowerCase()} issue in ${this.currentUser.location?.city || 'Houston'}`,
            photo: this.currentPhoto.dataUrl,
            analysis: this.currentPhoto.analysis,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: []
        };

        // Save to action feed storage
        const actionFeed = JSON.parse(localStorage.getItem('ecolink_action_feed') || '[]');
        actionFeed.unshift(actionFeedItem);
        localStorage.setItem('ecolink_action_feed', JSON.stringify(actionFeed));

        this.showNotification('Shared to Action Feed!', 'success');
    }

    resetUpload() {
        this.currentPhoto = null;
        document.getElementById('analysisSection').classList.add('hidden');
        document.getElementById('fileInput').value = '';
    }

    renderReports() {
        const reportsGrid = document.getElementById('reportsGrid');
        const userReports = this.reports.filter(report => report.userId === this.currentUser.username);

        if (userReports.length === 0) {
            reportsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-camera-retro"></i>
                    <h3>No reports yet</h3>
                    <p>Start by taking a photo of an environmental issue in your community</p>
                </div>
            `;
            return;
        }

        reportsGrid.innerHTML = userReports.map(report => `
            <div class="report-card">
                <div class="report-image">
                    <img src="${report.photo}" alt="Report photo">
                </div>
                <div class="report-content">
                    <div class="report-type">${report.analysis.type}</div>
                    <h4>${report.analysis.description.substring(0, 50)}...</h4>
                    <div class="report-meta">
                        <span class="report-location">
                            <i class="fas fa-map-marker-alt"></i> 
                            ${report.location.city}
                        </span>
                        <span class="report-time">
                            <i class="fas fa-clock"></i> 
                            ${this.formatTimeAgo(report.timestamp)}
                        </span>
                    </div>
                    <div class="report-status ${report.status}">
                        <i class="fas fa-${report.status === 'resolved' ? 'check' : 'clock'}"></i>
                        <span>${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const userReports = this.reports.filter(report => report.userId === this.currentUser.username);
        const resolvedReports = userReports.filter(report => report.status === 'resolved');
        
        document.getElementById('reportsCount').textContent = userReports.length;
        document.getElementById('issuesResolved').textContent = resolvedReports.length;
        document.getElementById('communityImpact').textContent = userReports.length * 5; // Simple impact calculation
    }

    saveReports() {
        localStorage.setItem('ecolink_reports', JSON.stringify(this.reports));
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoReporting();
});

// Add CSS for photo reporting
const style = document.createElement('style');
style.textContent = `
    .photo-upload-section {
        margin-bottom: 48px;
    }

    .upload-container {
        background: var(--white);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px var(--shadow);
    }

    .upload-area {
        border: 2px dashed #ddd;
        border-radius: 12px;
        padding: 48px 24px;
        text-align: center;
        transition: var(--transition);
        cursor: pointer;
    }

    .upload-area:hover, .upload-area.drag-over {
        border-color: var(--primary-green);
        background: var(--very-light-green);
    }

    .upload-icon {
        font-size: 48px;
        color: var(--primary-green);
        margin-bottom: 16px;
    }

    .upload-content h3 {
        font-size: 24px;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 8px;
    }

    .upload-content p {
        color: var(--light-text);
        margin-bottom: 24px;
    }

    .upload-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
    }

    .analysis-section {
        margin-bottom: 48px;
    }

    .analysis-container {
        background: var(--white);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px var(--shadow);
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 32px;
    }

    .photo-preview {
        position: relative;
    }

    .photo-preview img {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 12px;
    }

    .photo-preview .btn-small {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 8px 12px;
        font-size: 12px;
    }

    .analysis-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .analysis-status {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-green);
        font-weight: 500;
    }

    .issue-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 500;
        margin-bottom: 16px;
    }

    .issue-tag.litter {
        background: #fdeaea;
        color: #e74c3c;
    }

    .issue-tag.air {
        background: #e8f4fd;
        color: #3498db;
    }

    .issue-tag.water {
        background: #e8f5e8;
        color: #27ae60;
    }

    .confidence-score {
        margin-top: 16px;
    }

    .confidence-bar {
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 8px;
    }

    .confidence-fill {
        height: 100%;
        background: var(--primary-green);
        transition: width 0.3s ease;
    }

    .suggestions-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .suggestion-item {
        display: flex;
        gap: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 12px;
    }

    .suggestion-icon {
        width: 40px;
        height: 40px;
        background: var(--primary-green);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
    }

    .suggestion-content h5 {
        font-weight: 600;
        margin-bottom: 4px;
    }

    .suggestion-content p {
        color: var(--light-text);
        font-size: 14px;
        margin-bottom: 8px;
    }

    .priority {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }

    .priority.high {
        background: #fdeaea;
        color: #e74c3c;
    }

    .priority.medium {
        background: #fff3e0;
        color: #f39c12;
    }

    .priority.low {
        background: #e8f5e8;
        color: #27ae60;
    }

    .report-actions {
        margin-top: 24px;
        display: flex;
        gap: 16px;
    }

    .reports-grid, .community-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
    }

    .report-card {
        background: var(--white);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: var(--transition);
    }

    .report-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .report-image {
        height: 200px;
        overflow: hidden;
    }

    .report-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .placeholder-image {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 48px;
    }

    .report-content {
        padding: 20px;
    }

    .report-type {
        background: var(--primary-green);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        display: inline-block;
        margin-bottom: 12px;
    }

    .report-content h4 {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--dark-text);
    }

    .report-content p {
        color: var(--light-text);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 16px;
    }

    .report-meta {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
        font-size: 12px;
        color: var(--light-text);
    }

    .report-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        padding: 6px 12px;
        border-radius: 16px;
        width: fit-content;
    }

    .report-status.pending {
        background: #fff3e0;
        color: #f39c12;
    }

    .report-status.in-progress {
        background: #e8f4fd;
        color: #3498db;
    }

    .report-status.resolved {
        background: #e8f5e8;
        color: #27ae60;
    }

    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 48px 24px;
        color: var(--light-text);
    }

    .empty-state i {
        font-size: 48px;
        margin-bottom: 16px;
        color: var(--primary-green);
    }

    @media (max-width: 768px) {
        .analysis-container {
            grid-template-columns: 1fr;
        }
        
        .upload-buttons {
            flex-direction: column;
            align-items: center;
        }
        
        .report-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

