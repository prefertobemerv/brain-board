// Enhanced Login Script with API Integration and Security Features

// Initialize API client
const api = new APIConfig();

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const togglePassword = document.getElementById('togglePassword');
const successMsg = document.getElementById('successMsg');

// Security: Check session integrity
if (!SecurityUtils.validateSession()) {
    showError('general', 'Session expired. Please log in again.');
}

// Security: Track failed login attempts
let failedAttempts = parseInt(localStorage.getItem('failedLoginAttempts') || '0');
let lockoutUntil = parseInt(localStorage.getItem('lockoutUntil') || '0');

// Check if account is locked
function checkAccountLockout() {
    if (Date.now() < lockoutUntil) {
        const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 60000);
        showError('general', `Account temporarily locked. Try again in ${remainingTime} minutes.`);
        loginButton.disabled = true;
        return true;
    }
    return false;
}

// Toggle password visibility
togglePassword.addEventListener('click', function () {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    this.textContent = type === 'password' ? '👁' : '🙈';
});

// Validation functions
function validateEmail(email) {
    // Check for basic SQL injection patterns
    if (SecurityUtils.detectSQLInjection(email)) {
        return { valid: false, message: 'Invalid characters detected' };
    }
    
    // Validate email format
    if (!api.validateEmail(email)) {
        return { valid: false, message: 'Invalid email format' };
    }
    
    return { valid: true };
}

function validatePassword(password) {
    // Check minimum length
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    
    // Check for SQL injection patterns
    if (SecurityUtils.detectSQLInjection(password)) {
        return { valid: false, message: 'Invalid characters detected' };
    }
    
    return { valid: true };
}

function showError(field, message) {
    if (field === 'general') {
        // Show general error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
        return;
    }
    
    const input = document.getElementById(field);
    const error = document.getElementById(field + 'Error');

    if (input && error) {
        input.classList.add('error');
        error.textContent = message;
        error.classList.add('show');
    }
}

function clearError(field) {
    const input = document.getElementById(field);
    const error = document.getElementById(field + 'Error');

    if (input && error) {
        input.classList.remove('error');
        error.classList.remove('show');
    }
}

// Clear errors on input
emailInput.addEventListener('input', () => clearError('email'));
passwordInput.addEventListener('input', () => clearError('password'));

// Security: Log authentication attempts
function logAuthAttempt(success, email) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        success: success,
        email: email,
        ip: 'client-side', // In production, get from server
        userAgent: navigator.userAgent
    };
    
    // Store in session storage (in production, send to server)
    const logs = JSON.parse(sessionStorage.getItem('authLogs') || '[]');
    logs.push(logEntry);
    sessionStorage.setItem('authLogs', JSON.stringify(logs.slice(-10))); // Keep last 10
}

// Handle failed login attempt
function handleFailedLogin(email) {
    failedAttempts++;
    localStorage.setItem('failedLoginAttempts', failedAttempts.toString());
    
    logAuthAttempt(false, email);
    
    // Lock account after 5 failed attempts
    if (failedAttempts >= 5) {
        lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
        localStorage.setItem('lockoutUntil', lockoutUntil.toString());
        showError('general', 'Too many failed attempts. Account locked for 15 minutes.');
        loginButton.disabled = true;
        
        // Security alert
        console.warn('Account lockout triggered:', {
            attempts: failedAttempts,
            lockoutUntil: new Date(lockoutUntil).toISOString()
        });
    } else {
        const remaining = 5 - failedAttempts;
        showError('password', `Invalid credentials. ${remaining} attempts remaining.`);
    }
}

// Handle successful login
function handleSuccessfulLogin(response, email) {
    // Reset failed attempts
    failedAttempts = 0;
    localStorage.removeItem('failedLoginAttempts');
    localStorage.removeItem('lockoutUntil');
    
    logAuthAttempt(true, email);
    
    // Store authentication state
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('lastLoginTime', Date.now().toString());
    
    // Store user data securely
    if (response.user) {
        const encryptedUser = api.encrypt(JSON.stringify(response.user));
        sessionStorage.setItem('userData', encryptedUser);
    }
    
    // Show success message
    successMsg.style.display = 'block';
    form.style.opacity = '0.5';
    
    // Security: Generate session ID
    const sessionId = SecurityUtils.generateSecureRandom(32);
    sessionStorage.setItem('sessionId', sessionId);
    sessionStorage.setItem('sessionStart', Date.now().toString());
    
    // Redirect after delay
    setTimeout(() => {
        window.location.href = 'interface.html';
    }, 1500);
}

// Form submission with API integration
form.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Check account lockout
    if (checkAccountLockout()) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        showError('email', emailValidation.message);
        isValid = false;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showError('password', passwordValidation.message);
        isValid = false;
    }

    if (!isValid) return;

    // Show loading
    loginButton.classList.add('loading');
    loginButton.disabled = true;

    try {
        // PRODUCTION MODE: Use API
        // Uncomment this section when connecting to a real API
        /*
        const response = await api.login(email, password);
        handleSuccessfulLogin(response, email);
        */
        
        // DEMO MODE: Simulated login
        // Comment out this section when using real API
        const response = await api.login(email, password);
        handleSuccessfulLogin(response, email);

        
        // Seed a default admin account once (demo only)
        if (!localStorage.getItem('usersSeeded')) {
            const seeded = [{ firstName: 'Admin', lastName: 'User', email: 'admin@example.com', password: 'Admin@1234', role: 'admin' }];
            const existing = JSON.parse(localStorage.getItem('users') || '[]');
            localStorage.setItem('users', JSON.stringify([...existing, ...seeded]));
            localStorage.setItem('usersSeeded', 'true');
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());

        if (user && user.password === password) {
            // Simulate API response
            const mockResponse = {
                access_token: SecurityUtils.generateSecureRandom(64),
                refresh_token: SecurityUtils.generateSecureRandom(64),
                expires_in: 3600,
                user: {
                    id: 1,
                    email: email,
                    firstName: (user?.firstName || 'User'),
                    lastName: (user?.lastName || ''),
                    role: 'student'
                }
            };
            
            // Save tokens in demo mode
            api.saveTokens(
                mockResponse.access_token,
                mockResponse.refresh_token,
                mockResponse.expires_in
            );
            
            handleSuccessfulLogin(mockResponse, email);
        } else {
            // Check if user exists in local storage (from signup)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (user) {
                // In demo mode, accept any password for registered users
                const mockResponse = {
                    access_token: SecurityUtils.generateSecureRandom(64),
                    refresh_token: SecurityUtils.generateSecureRandom(64),
                    expires_in: 3600,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: 'student'
                    }
                };
                
                api.saveTokens(
                    mockResponse.access_token,
                    mockResponse.refresh_token,
                    mockResponse.expires_in
                );
                
                handleSuccessfulLogin(mockResponse, email);
            } else {
                throw new Error('Invalid credentials');
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        handleFailedLogin(email);
        
        // Security: Log error details
        console.warn('Authentication failed:', {
            timestamp: new Date().toISOString(),
            error: error.message,
            email: email
        });
    } finally {
        loginButton.classList.remove('loading');
        loginButton.disabled = false;
    }
});

// Security: Prevent clipboard access to password field
passwordInput.addEventListener('copy', (e) => e.preventDefault());
passwordInput.addEventListener('cut', (e) => e.preventDefault());

// Security: Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    // Clear password field
    passwordInput.value = '';
    
    // Clear any temporary session data
    sessionStorage.removeItem('tempAuthData');
});

// Security: Check for suspicious activity
function checkSuspiciousActivity() {
    const authLogs = JSON.parse(sessionStorage.getItem('authLogs') || '[]');
    const recentFails = authLogs.filter(log => 
        !log.success && 
        Date.now() - new Date(log.timestamp).getTime() < 300000 // Last 5 minutes
    );
    
    if (recentFails.length >= 3) {
        console.warn('Suspicious activity detected: Multiple failed login attempts');
        // In production, notify security team
    }
}

// Initialize security checks
document.addEventListener('DOMContentLoaded', function() {
    // Check account lockout on page load
    checkAccountLockout();
    
    // Check for suspicious activity
    checkSuspiciousActivity();
    
    // Clear old session data
    const sessionStart = sessionStorage.getItem('sessionStart');
    if (sessionStart && Date.now() - parseInt(sessionStart) > 24 * 60 * 60 * 1000) {
        sessionStorage.clear();
    }
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Auto-logout on prolonged inactivity (15 minutes)
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (localStorage.getItem('isAuthenticated') === 'true') {
            localStorage.setItem('isAuthenticated', 'false');
            api.clearTokens();
            sessionStorage.clear();
            window.location.href = '/login.html?timeout=1';
        }
    }, 15 * 60 * 1000); // 15 minutes
}

// Reset timer on user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

// Initialize inactivity timer
resetInactivityTimer();
