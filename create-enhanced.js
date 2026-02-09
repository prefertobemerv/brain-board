// Enhanced Signup Script with API Integration and Security Features

// Initialize API client
const api = new APIConfig();

// DOM Elements
const signupForm = document.getElementById('signupForm');
const signupButton = document.getElementById('signupButton');
const successMsg = document.getElementById('successMsg');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');
const passwordStrength = document.getElementById('passwordStrength');
const loginLink = document.getElementById('loginLink');

// Form fields
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const terms = document.getElementById('terms');
const newsletter = document.getElementById('newsletter');

// Error message elements
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const phoneError = document.getElementById('phoneError');

// Security: Track signup attempts
let signupAttempts = parseInt(sessionStorage.getItem('signupAttempts') || '0');
const MAX_SIGNUP_ATTEMPTS = 5;

// Password toggle functionality
togglePassword.addEventListener('click', function() {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁' : '🙈';
});

toggleConfirmPassword.addEventListener('click', function() {
    const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordField.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁' : '🙈';
});

// Security: Advanced password strength checker
passwordField.addEventListener('input', function() {
    const password = this.value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (password.length > 0) {
        passwordStrength.style.display = 'block';
        
        const strength = calculatePasswordStrength(password);
        strengthFill.className = 'strength-fill ' + strength.level;
        strengthText.textContent = strength.text;
        
        // Security warning for common passwords
        if (isCommonPassword(password)) {
            strengthText.textContent = 'Common password - Choose a unique one';
            strengthFill.className = 'strength-fill weak';
        }
    } else {
        passwordStrength.style.display = 'none';
    }
});

// Calculate password strength with advanced checks
function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score++;
    else feedback.push('at least 8 characters');
    
    if (password.length >= 12) score++;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('uppercase letter');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push('lowercase letter');
    
    // Number check
    if (/\d/.test(password)) score++;
    else feedback.push('number');
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('special character');
    
    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) {
        score--;
        feedback.push('avoid repeated characters');
    }
    
    // Check for common patterns
    if (/123|abc|qwe|password|admin/i.test(password)) {
        score--;
        feedback.push('avoid common patterns');
    }
    
    const levels = [
        { level: 'weak', text: 'Weak - Add ' + feedback.slice(0, 2).join(', ') },
        { level: 'fair', text: 'Fair - Add ' + (feedback[0] || 'more complexity') },
        { level: 'good', text: 'Good - Almost there!' },
        { level: 'strong', text: 'Strong - Great password!' }
    ];
    
    const levelIndex = Math.max(0, Math.min(Math.floor(score / 2), 3));
    return levels[levelIndex];
}

// Check against common passwords
function isCommonPassword(password) {
    const commonPasswords = [
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.some(common => 
        password.toLowerCase().includes(common)
    );
}

// Real-time validation with security checks
firstName.addEventListener('blur', () => validateField(firstName, firstNameError, 'First name is required'));
lastName.addEventListener('blur', () => validateField(lastName, lastNameError, 'Last name is required'));
email.addEventListener('blur', () => validateEmail());
passwordField.addEventListener('blur', () => validatePassword());
confirmPasswordField.addEventListener('blur', () => validateConfirmPassword());
phone.addEventListener('blur', () => validatePhone());

// Validation functions with security
function validateField(field, errorElement, message) {
    const value = field.value.trim();
    
    // Security: Check for XSS patterns
    if (SecurityUtils.detectXSS(value)) {
        showError(field, errorElement, 'Invalid characters detected');
        return false;
    }
    
    // Security: Check for SQL injection patterns
    if (SecurityUtils.detectSQLInjection(value)) {
        showError(field, errorElement, 'Invalid characters detected');
        return false;
    }
    
    if (value === '') {
        showError(field, errorElement, message);
        return false;
    } else if (value.length < 2) {
        showError(field, errorElement, 'Must be at least 2 characters');
        return false;
    } else if (value.length > 50) {
        showError(field, errorElement, 'Must be less than 50 characters');
        return false;
    } else {
        showSuccess(field, errorElement);
        return true;
    }
}

function validateEmail() {
    const emailValue = email.value.trim();
    
    // Security: Check for XSS patterns
    if (SecurityUtils.detectXSS(emailValue)) {
        showError(email, emailError, 'Invalid characters detected');
        return false;
    }
    
    // Security: Check for SQL injection patterns
    if (SecurityUtils.detectSQLInjection(emailValue)) {
        showError(email, emailError, 'Invalid characters detected');
        return false;
    }
    
    if (emailValue === '') {
        showError(email, emailError, 'Email is required');
        return false;
    } else if (!api.validateEmail(emailValue)) {
        showError(email, emailError, 'Please enter a valid email address');
        return false;
    } else if (isEmailTaken(emailValue)) {
        showError(email, emailError, 'This email is already registered');
        return false;
    } else {
        showSuccess(email, emailError);
        return true;
    }
}

function validatePassword() {
    const password = passwordField.value;
    
    // Security: Check for SQL injection patterns
    if (SecurityUtils.detectSQLInjection(password)) {
        showError(passwordField, passwordError, 'Invalid characters detected');
        return false;
    }
    
    // Use API validation
    const validation = api.validatePassword(password);
    
    if (!validation.isValid) {
        showError(passwordField, passwordError, validation.message);
        return false;
    } else if (isCommonPassword(password)) {
        showError(passwordField, passwordError, 'Please choose a more unique password');
        return false;
    } else {
        showSuccess(passwordField, passwordError);
        return true;
    }
}

function validateConfirmPassword() {
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;
    
    if (confirmPassword === '') {
        showError(confirmPasswordField, confirmPasswordError, 'Please confirm your password');
        return false;
    } else if (password !== confirmPassword) {
        showError(confirmPasswordField, confirmPasswordError, 'Passwords do not match');
        return false;
    } else {
        showSuccess(confirmPasswordField, confirmPasswordError);
        return true;
    }
}

function validatePhone() {
    const phoneValue = phone.value.trim();
    
    // Security: Check for XSS and SQL injection
    if (SecurityUtils.detectXSS(phoneValue) || SecurityUtils.detectSQLInjection(phoneValue)) {
        showError(phone, phoneError, 'Invalid characters detected');
        return false;
    }
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    if (phoneValue === '') {
        showSuccess(phone, phoneError); // Phone is optional
        return true;
    } else if (!phoneRegex.test(phoneValue.replace(/[\s\-\(\)]/g, ''))) {
        showError(phone, phoneError, 'Please enter a valid phone number');
        return false;
    } else {
        showSuccess(phone, phoneError);
        return true;
    }
}

function showError(field, errorElement, message) {
    field.classList.add('error');
    field.classList.remove('success');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showSuccess(field, errorElement) {
    field.classList.remove('error');
    field.classList.add('success');
    errorElement.style.display = 'none';
}

function isEmailTaken(emailToCheck) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.some(user => user.email.toLowerCase() === emailToCheck.toLowerCase());
}

// Security: Check signup attempt limit
function checkSignupAttempts() {
    if (signupAttempts >= MAX_SIGNUP_ATTEMPTS) {
        alert('Too many signup attempts. Please try again later.');
        signupButton.disabled = true;
        return false;
    }
    return true;
}

// Form submission with API integration
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Security: Check signup attempts
    if (!checkSignupAttempts()) {
        return;
    }
    
    // Validate all fields
    const isFirstNameValid = validateField(firstName, firstNameError, 'First name is required');
    const isLastNameValid = validateField(lastName, lastNameError, 'Last name is required');
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isPhoneValid = validatePhone();
    const isTermsChecked = terms.checked;
    
    if (!isTermsChecked) {
        alert('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    // Check if all validations pass
    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || 
        !isPasswordValid || !isConfirmPasswordValid || !isPhoneValid) {
        // Shake the form to indicate error
        signupForm.classList.add('shake');
        setTimeout(() => signupForm.classList.remove('shake'), 500);
        return;
    }
    
    // Show loading state
    signupButton.classList.add('loading');
    signupButton.disabled = true;
    
    // Increment signup attempts
    signupAttempts++;
    sessionStorage.setItem('signupAttempts', signupAttempts.toString());
    
    try {
        // PRODUCTION MODE: Use API
        // Uncomment this section when connecting to a real API
        /*
        const response = await api.signup({
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            password: passwordField.value,
            phone: phone.value.trim(),
            newsletter: newsletter.checked
        });
        
        // Handle successful signup
        handleSuccessfulSignup(response);
        */
        
        // DEMO MODE: Simulated signup
        // Comment out this section when using real API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create new user object
        const newUser = {
            id: Date.now(),
            firstName: api.sanitizeInput(firstName.value.trim()),
            lastName: api.sanitizeInput(lastName.value.trim()),
            email: api.sanitizeInput(email.value.trim().toLowerCase()),
            phone: api.sanitizeInput(phone.value.trim()),
            newsletter: newsletter.checked,
            createdAt: new Date().toISOString(),
            emailVerified: false
        };
        
        // Add user to database
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Generate tokens for demo mode
        const mockResponse = {
            access_token: SecurityUtils.generateSecureRandom(64),
            refresh_token: SecurityUtils.generateSecureRandom(64),
            expires_in: 3600,
            user: newUser
        };
        
        // Save tokens
        api.saveTokens(
            mockResponse.access_token,
            mockResponse.refresh_token,
            mockResponse.expires_in
        );
        
        handleSuccessfulSignup(mockResponse);
        
    } catch (error) {
        console.error('Signup error:', error);
        
        // Show error message
        alert(`Signup failed: ${error.message}`);
        
        // Security: Log error
        console.warn('Signup failed:', {
            timestamp: new Date().toISOString(),
            error: error.message,
            email: email.value.trim()
        });
        
        // Reset loading state
        signupButton.classList.remove('loading');
        signupButton.disabled = false;
    }
});

// Handle successful signup
function handleSuccessfulSignup(response) {
    // Reset signup attempts
    sessionStorage.removeItem('signupAttempts');
    
    // Store authentication state
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', response.user.email);
    localStorage.setItem('isNewUser', 'true');
    
    // Store user data securely
    const encryptedUser = api.encrypt(JSON.stringify(response.user));
    sessionStorage.setItem('userData', encryptedUser);
    
    // Security: Generate session ID
    const sessionId = SecurityUtils.generateSecureRandom(32);
    sessionStorage.setItem('sessionId', sessionId);
    sessionStorage.setItem('sessionStart', Date.now().toString());
    
    // Show success message
    successMsg.innerHTML = `✅ Welcome ${response.user.firstName}! Your account has been created successfully!`;
    successMsg.style.display = 'block';
    signupForm.style.display = 'none';
    
    // Reset loading state
    signupButton.classList.remove('loading');
    signupButton.disabled = false;
    
    // Log success
    console.log('Account created successfully');
    
    // Redirect to interface.html after showing welcome message
    setTimeout(() => {
        window.location.href = 'interface.html';
    }, 2000);
}

// Login link handler
loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'login.html';
});

// Prevent form submission on Enter key in specific fields
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'checkbox') {
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
            const inputs = Array.from(form.querySelectorAll('input[required]'));
            const currentIndex = inputs.indexOf(e.target);
            const nextInput = inputs[currentIndex + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    }
});

// Auto-format phone number
phone.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})/, '($1) ');
    }
    e.target.value = value;
});

// Security: Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    // Clear password fields
    passwordField.value = '';
    confirmPasswordField.value = '';
});

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    // Focus on first input
    firstName.focus();
    
    // Security: Check Content Security Policy
    SecurityUtils.checkCSP();
    
    // Security: Validate session
    SecurityUtils.validateSession();
    
    // Log existing users count (for debugging)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Existing users:', users.length);
    
    // Check signup attempts
    if (signupAttempts >= MAX_SIGNUP_ATTEMPTS) {
        signupButton.disabled = true;
        alert('Too many signup attempts. Please try again later.');
    }
});
