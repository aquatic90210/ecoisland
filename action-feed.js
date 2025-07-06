// Action Feed Feature
class ActionFeed {
    constructor() {
        this.currentUser = null;
        this.feedItems = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadFeedItems();
        this.setupEventListeners();
        this.renderFeed();
    }

    loadUserData() {
        const userData = localStorage.getItem('ecolink_user');
        if (!userData) {
            window.location.href = '../index.html';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    loadFeedItems() {
        // Load existing feed items
        const savedFeed = localStorage.getItem('ecolink_action_feed');
        this.feedItems = savedFeed ? JSON.parse(savedFeed) : [];

        // Add sample feed items if empty
        if (this.feedItems.length === 0) {
            this.feedItems = this.generateSampleFeedItems();
            this.saveFeedItems();
        }
    }

    generateSampleFeedItems() {
        return [
            {
                id: '1',
                type: 'action',
                userId: 'eco_warrior',
                username: 'EcoWarrior',
                content: 'Just organized a beach cleanup at Galveston! Collected over 50 pounds of trash with 20 volunteers. Every small action counts! 🌊♻️ #BeachCleanup #Houston',
                photo: null,
                location: 'Galveston, TX',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                likes: 24,
                comments: [
                    { userId: 'green_thumb', username: 'GreenThumb', content: 'Amazing work! How can I join the next one?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
                ],
                tags: ['BeachCleanup', 'Houston']
            },
            {
                id: '2',
                type: 'report',
                userId: 'nature_lover',
                username: 'NatureLover',
                content: 'Spotted illegal dumping near Memorial Park. Already reported to city authorities. Let\'s keep our green spaces clean! 🌳',
                photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM0OThkYiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVwb3J0IFBob3RvPC90ZXh0Pjwvc3ZnPg==',
                location: 'Memorial Park, Houston',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                likes: 18,
                comments: [],
                tags: ['IllegalDumping', 'MemorialPark']
            },
            {
                id: '3',
                type: 'tip',
                userId: 'solar_sam',
                username: 'SolarSam',
                content: 'Pro tip: Switch to LED bulbs and save up to 75% on lighting energy! Just replaced all bulbs in my house and already seeing lower electricity bills. 💡⚡',
                photo: null,
                location: 'Houston, TX',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                likes: 31,
                comments: [
                    { userId: 'energy_saver', username: 'EnergySaver', content: 'Great tip! Which brand do you recommend?', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
                    { userId: 'solar_sam', username: 'SolarSam', content: 'I use Philips LED bulbs. Great quality and long-lasting!', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
                ],
                tags: ['EnergyEfficiency', 'LEDBulbs']
            },
            {
                id: '4',
                type: 'action',
                userId: 'bike_commuter',
                username: 'BikeCommuter',
                content: 'Week 3 of biking to work instead of driving! Saved 45 miles of car emissions and feeling healthier than ever. Who else is joining the bike commute challenge? 🚴‍♀️',
                photo: null,
                location: 'Downtown Houston',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                likes: 27,
                comments: [
                    { userId: 'green_commuter', username: 'GreenCommuter', content: 'I\'m in! Starting next week 💪', timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() }
                ],
                tags: ['BikeCommute', 'GreenTransport']
            }
        ];
    }

    setupEventListeners() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e);
            });
        });

        // Post composer
        document.getElementById('publishBtn').addEventListener('click', () => {
            this.publishPost();
        });

        document.getElementById('addPhotoBtn').addEventListener('click', () => {
            document.getElementById('photoInput').click();
        });

        document.getElementById('photoInput').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Infinite scroll
        const feedScroll = document.getElementById('feedScroll');
        feedScroll.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Auto-resize textarea
        const textarea = document.getElementById('postContent');
        textarea.addEventListener('input', () => {
            this.autoResizeTextarea(textarea);
        });
    }

    handleFilterChange(e) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.closest('.filter-btn').classList.add('active');
        
        this.currentFilter = e.target.closest('.filter-btn').dataset.filter;
        this.renderFeed();
    }

    publishPost() {
        const content = document.getElementById('postContent').value.trim();
        if (!content) {
            this.showNotification('Please enter some content', 'error');
            return;
        }

        const newPost = {
            id: Date.now().toString(),
            type: 'action',
            userId: this.currentUser.username,
            username: this.currentUser.username,
            content: content,
            photo: null, // Would be set if photo was uploaded
            location: this.currentUser.location ? `${this.currentUser.location.city}, ${this.currentUser.location.county}` : 'Houston, TX',
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: [],
            tags: this.extractTags(content)
        };

        this.feedItems.unshift(newPost);
        this.saveFeedItems();
        this.renderFeed();

        // Clear composer
        document.getElementById('postContent').value = '';
        this.autoResizeTextarea(document.getElementById('postContent'));

        this.showNotification('Post shared successfully!', 'success');
    }

    extractTags(content) {
        const tagRegex = /#(\w+)/g;
        const tags = [];
        let match;
        while ((match = tagRegex.exec(content)) !== null) {
            tags.push(match[1]);
        }
        return tags;
    }

    handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // In a real app, you'd upload the photo and get a URL
                this.showNotification('Photo added! (Feature coming soon)', 'info');
            };
            reader.readAsDataURL(file);
        }
    }

    renderFeed() {
        const feedScroll = document.getElementById('feedScroll');
        const filteredItems = this.getFilteredItems();

        feedScroll.innerHTML = filteredItems.map(item => this.renderFeedItem(item)).join('');

        // Add event listeners to feed items
        this.attachFeedItemListeners();
    }

    getFilteredItems() {
        switch (this.currentFilter) {
            case 'local':
                return this.feedItems.filter(item => 
                    item.location && item.location.includes('Houston')
                );
            case 'reports':
                return this.feedItems.filter(item => item.type === 'report');
            case 'actions':
                return this.feedItems.filter(item => item.type === 'action' || item.type === 'tip');
            default:
                return this.feedItems;
        }
    }

    renderFeedItem(item) {
        const timeAgo = this.formatTimeAgo(item.timestamp);
        const isLiked = false; // Would check if current user liked this post
        
        return `
            <div class="feed-item" data-id="${item.id}">
                <div class="feed-header">
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <div class="username">${item.username}</div>
                            <div class="post-meta">
                                <span class="location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${item.location}
                                </span>
                                <span class="timestamp">${timeAgo}</span>
                            </div>
                        </div>
                    </div>
                    <div class="post-type ${item.type}">
                        <i class="fas fa-${this.getTypeIcon(item.type)}"></i>
                        <span>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                    </div>
                </div>
                
                <div class="feed-content">
                    <p>${this.formatContent(item.content)}</p>
                    ${item.photo ? `<div class="feed-photo"><img src="${item.photo}" alt="Post photo"></div>` : ''}
                    ${item.tags.length > 0 ? `
                        <div class="feed-tags">
                            ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="feed-actions">
                    <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-action="like">
                        <i class="fas fa-heart"></i>
                        <span>${item.likes}</span>
                    </button>
                    <button class="action-btn comment-btn" data-action="comment">
                        <i class="fas fa-comment"></i>
                        <span>${item.comments.length}</span>
                    </button>
                    <button class="action-btn share-btn" data-action="share">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                </div>
                
                ${item.comments.length > 0 ? `
                    <div class="feed-comments">
                        ${item.comments.slice(0, 2).map(comment => `
                            <div class="comment">
                                <strong>${comment.username}</strong>
                                <span>${comment.content}</span>
                            </div>
                        `).join('')}
                        ${item.comments.length > 2 ? `
                            <button class="view-more-comments">View all ${item.comments.length} comments</button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            action: 'hands-helping',
            report: 'camera',
            tip: 'lightbulb'
        };
        return icons[type] || 'leaf';
    }

    formatContent(content) {
        // Convert hashtags to clickable links
        return content.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
    }

    attachFeedItemListeners() {
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFeedAction(e);
            });
        });
    }

    handleFeedAction(e) {
        const action = e.target.closest('.action-btn').dataset.action;
        const feedItem = e.target.closest('.feed-item');
        const itemId = feedItem.dataset.id;

        switch (action) {
            case 'like':
                this.toggleLike(itemId, e.target.closest('.action-btn'));
                break;
            case 'comment':
                this.showCommentDialog(itemId);
                break;
            case 'share':
                this.sharePost(itemId);
                break;
        }
    }

    toggleLike(itemId, button) {
        const item = this.feedItems.find(item => item.id === itemId);
        if (item) {
            const isLiked = button.classList.contains('liked');
            if (isLiked) {
                item.likes = Math.max(0, item.likes - 1);
                button.classList.remove('liked');
            } else {
                item.likes += 1;
                button.classList.add('liked');
            }
            
            button.querySelector('span').textContent = item.likes;
            this.saveFeedItems();
        }
    }

    showCommentDialog(itemId) {
        const comment = prompt('Add a comment:');
        if (comment && comment.trim()) {
            const item = this.feedItems.find(item => item.id === itemId);
            if (item) {
                item.comments.push({
                    userId: this.currentUser.username,
                    username: this.currentUser.username,
                    content: comment.trim(),
                    timestamp: new Date().toISOString()
                });
                this.saveFeedItems();
                this.renderFeed();
            }
        }
    }

    sharePost(itemId) {
        // Simulate sharing functionality
        this.showNotification('Post shared! (Feature coming soon)', 'info');
    }

    handleScroll() {
        const feedScroll = document.getElementById('feedScroll');
        const scrollTop = feedScroll.scrollTop;
        const scrollHeight = feedScroll.scrollHeight;
        const clientHeight = feedScroll.clientHeight;

        // Load more content when near bottom
        if (scrollTop + clientHeight >= scrollHeight - 100 && !this.isLoading) {
            this.loadMoreContent();
        }
    }

    loadMoreContent() {
        this.isLoading = true;
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.remove('hidden');

        // Simulate loading delay
        setTimeout(() => {
            // In a real app, you'd fetch more content from an API
            this.isLoading = false;
            loadingIndicator.classList.add('hidden');
        }, 1000);
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    saveFeedItems() {
        localStorage.setItem('ecolink_action_feed', JSON.stringify(this.feedItems));
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
    new ActionFeed();
});

// Add CSS for action feed
const style = document.createElement('style');
style.textContent = `
    .action-feed-main {
        background: #f8f9fa;
        min-height: 100vh;
        padding-top: 80px;
    }

    .feed-filters {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .filter-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: var(--white);
        border: 2px solid #e0e0e0;
        border-radius: 25px;
        color: var(--dark-text);
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition);
    }

    .filter-btn:hover {
        border-color: var(--primary-green);
        background: var(--very-light-green);
    }

    .filter-btn.active {
        background: var(--primary-green);
        border-color: var(--primary-green);
        color: var(--white);
    }

    .create-post {
        margin: 32px 0;
    }

    .post-composer {
        background: var(--white);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px var(--shadow);
    }

    .composer-header {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
    }

    .user-avatar {
        width: 48px;
        height: 48px;
        background: var(--primary-green);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--white);
        font-size: 20px;
        flex-shrink: 0;
    }

    .composer-input {
        flex: 1;
    }

    .composer-input textarea {
        width: 100%;
        min-height: 60px;
        max-height: 120px;
        border: none;
        outline: none;
        resize: none;
        font-family: inherit;
        font-size: 16px;
        line-height: 1.5;
        color: var(--dark-text);
        background: transparent;
    }

    .composer-input textarea::placeholder {
        color: var(--light-text);
    }

    .composer-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
    }

    .post-options {
        display: flex;
        gap: 16px;
    }

    .option-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: transparent;
        border: none;
        color: var(--primary-green);
        font-weight: 500;
        cursor: pointer;
        border-radius: 8px;
        transition: var(--transition);
    }

    .option-btn:hover {
        background: var(--very-light-green);
    }

    .feed-container {
        margin-bottom: 48px;
    }

    .feed-scroll {
        max-height: 80vh;
        overflow-y: auto;
        padding-right: 8px;
    }

    .feed-scroll::-webkit-scrollbar {
        width: 6px;
    }

    .feed-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    .feed-scroll::-webkit-scrollbar-thumb {
        background: var(--primary-green);
        border-radius: 3px;
    }

    .feed-item {
        background: var(--white);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 4px 20px var(--shadow);
        transition: var(--transition);
    }

    .feed-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }

    .feed-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }

    .user-info {
        display: flex;
        gap: 12px;
    }

    .user-info .user-avatar {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }

    .username {
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 4px;
    }

    .post-meta {
        display: flex;
        gap: 12px;
        font-size: 14px;
        color: var(--light-text);
    }

    .post-type {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
    }

    .post-type.action {
        background: #e8f5e8;
        color: #27ae60;
    }

    .post-type.report {
        background: #fdeaea;
        color: #e74c3c;
    }

    .post-type.tip {
        background: #fff3e0;
        color: #f39c12;
    }

    .feed-content p {
        line-height: 1.6;
        color: var(--dark-text);
        margin-bottom: 16px;
    }

    .hashtag {
        color: var(--primary-green);
        font-weight: 500;
    }

    .feed-photo {
        margin: 16px 0;
        border-radius: 12px;
        overflow: hidden;
    }

    .feed-photo img {
        width: 100%;
        height: auto;
        display: block;
    }

    .feed-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 16px 0;
    }

    .tag {
        background: var(--very-light-green);
        color: var(--primary-green);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
    }

    .feed-actions {
        display: flex;
        gap: 24px;
        padding: 16px 0;
        border-top: 1px solid #e0e0e0;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: none;
        color: var(--light-text);
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition);
        padding: 8px;
        border-radius: 8px;
    }

    .action-btn:hover {
        color: var(--primary-green);
        background: var(--very-light-green);
    }

    .action-btn.liked {
        color: #e74c3c;
    }

    .feed-comments {
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
    }

    .comment {
        margin-bottom: 8px;
        font-size: 14px;
        line-height: 1.5;
    }

    .comment strong {
        color: var(--dark-text);
        margin-right: 8px;
    }

    .view-more-comments {
        background: transparent;
        border: none;
        color: var(--primary-green);
        font-weight: 500;
        cursor: pointer;
        font-size: 14px;
        padding: 4px 0;
    }

    .loading-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 24px;
        color: var(--primary-green);
        font-weight: 500;
    }

    @media (max-width: 768px) {
        .feed-filters {
            justify-content: center;
        }
        
        .composer-actions {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
        }
        
        .post-options {
            justify-content: center;
        }
        
        .feed-actions {
            justify-content: space-around;
        }
    }
`;
document.head.appendChild(style);

