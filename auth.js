// Authentication and Onboarding Logic
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.onboardingStep = 1;
        this.maxSteps = 2;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingUser();
    }

    setupEventListeners() {
        // Tab switching
        document.getElementById('loginTab').addEventListener('click', () => this.switchTab('login'));
        document.getElementById('signupTab').addEventListener('click', () => this.switchTab('signup'));

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

        // Onboarding navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('finishBtn').addEventListener('click', () => this.finishOnboarding());

        // Purpose option selection
        const purposeOptions = document.querySelectorAll('.purpose-option input[type="checkbox"]');
        purposeOptions.forEach(option => {
            option.addEventListener('change', () => this.updateNextButton());
        });
    }

    checkExistingUser() {
        const userData = localStorage.getItem('ecolink_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.redirectToDashboard();
        }
    }

    switchTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (tab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        // Check if user exists in localStorage
        const existingUsers = JSON.parse(localStorage.getItem('ecolink_users') || '{}');
        
        if (existingUsers[username] && existingUsers[username].password === password) {
            this.currentUser = existingUsers[username];
            localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));
            this.showLoadingAndRedirect();
        } else {
            this.showError('Invalid username or password');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const validId = document.getElementById('validId').value;

        // Validation
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        // Check if username already exists
        const existingUsers = JSON.parse(localStorage.getItem('ecolink_users') || '{}');
        if (existingUsers[username]) {
            this.showError('Username already exists');
            return;
        }

        // Create new user
        this.currentUser = {
            username,
            password,
            validId,
            createdAt: new Date().toISOString(),
            purposes: [],
            location: {},
            carbonFootprint: {
                daily: [],
                weekly: [],
                total: 0
            },
            impactScore: 0,
            reportsSubmitted: 0
        };

        // Save to localStorage
        existingUsers[username] = this.currentUser;
        localStorage.setItem('ecolink_users', JSON.stringify(existingUsers));
        localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));

        this.showOnboarding();
    }

    showOnboarding() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('onboardingScreen').classList.remove('hidden');
    }

    nextStep() {
        if (this.onboardingStep === 1) {
            // Validate purpose selection
            const selectedPurposes = document.querySelectorAll('.purpose-option input[type="checkbox"]:checked');
            if (selectedPurposes.length === 0) {
                this.showError('Please select at least one purpose');
                return;
            }

            // Save purposes
            this.currentUser.purposes = Array.from(selectedPurposes).map(input => input.value);
            this.updateUserData();

            // Move to next step
            document.getElementById('step1').classList.add('hidden');
            document.getElementById('step2').classList.remove('hidden');
            document.getElementById('prevBtn').style.display = 'block';
            document.getElementById('nextBtn').classList.add('hidden');
            document.getElementById('finishBtn').classList.remove('hidden');
            this.onboardingStep = 2;
        }
    }

    prevStep() {
        if (this.onboardingStep === 2) {
            document.getElementById('step2').classList.add('hidden');
            document.getElementById('step1').classList.remove('hidden');
            document.getElementById('prevBtn').style.display = 'none';
            document.getElementById('nextBtn').classList.remove('hidden');
            document.getElementById('finishBtn').classList.add('hidden');
            this.onboardingStep = 1;
        }
    }

    updateNextButton() {
        const selectedPurposes = document.querySelectorAll('.purpose-option input[type="checkbox"]:checked');
        const nextBtn = document.getElementById('nextBtn');
        
        if (selectedPurposes.length > 0) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        }
    }

    finishOnboarding() {
        // Validate location inputs
        const country = document.getElementById('userCountry').value;
        const city = document.getElementById('userCity').value;
        const county = document.getElementById('userCounty').value;

        if (!country || !city || !county) {
            this.showError('Please fill in all location fields');
            return;
        }

        // Save location data
        this.currentUser.location = { country, city, county };
        this.updateUserData();

        this.showLoadingAndRedirect();
    }

    updateUserData() {
        const existingUsers = JSON.parse(localStorage.getItem('ecolink_users') || '{}');
        existingUsers[this.currentUser.username] = this.currentUser;
        localStorage.setItem('ecolink_users', JSON.stringify(existingUsers));
        localStorage.setItem('ecolink_user', JSON.stringify(this.currentUser));
    }

    showLoadingAndRedirect() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('onboardingScreen').classList.add('hidden');
        document.getElementById('loadingScreen').classList.remove('hidden');

        // Simulate loading progress
        const progressBar = document.getElementById('progressBar');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 500);
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }

    redirectToDashboard() {
        window.location.href = 'pages/dashboard.html';
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(255, 71, 87, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(errorDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 3000);
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Add CSS for error notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
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
document.head.appendChild(style);

