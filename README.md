# BrainBoard - Secure Social Learning Platform

## 🔒 Enhanced Security & API Integration

This enhanced version of BrainBoard includes comprehensive cybersecurity features and API integration capabilities.

---

## 📋 Table of Contents

1. [Security Features](#security-features)
2. [API Integration](#api-integration)
3. [File Structure](#file-structure)
4. [Setup Instructions](#setup-instructions)
5. [Configuration](#configuration)
6. [Security Best Practices](#security-best-practices)
7. [API Endpoints](#api-endpoints)
8. [Development Mode vs Production Mode](#development-mode-vs-production-mode)

---

## 🛡️ Security Features

### 1. **Authentication & Authorization**
- **JWT Token Management**: Secure token storage with encryption
- **Automatic Token Refresh**: Tokens refresh before expiration
- **Session Management**: Secure session handling with timeout
- **Account Lockout**: Protection against brute force attacks (5 failed attempts = 15 min lockout)

### 2. **Input Validation & Sanitization**
- **XSS Prevention**: All user inputs are sanitized to prevent Cross-Site Scripting
- **SQL Injection Prevention**: Pattern detection and input validation
- **Content Security Policy (CSP)**: Implemented via meta tags
- **Input Length Limits**: Maximum character limits on all fields

### 3. **Data Encryption**
- **Client-Side Encryption**: Sensitive data encrypted before storage
- **Secure Token Storage**: Tokens stored encrypted in localStorage
- **Password Strength Validation**: Enforces strong password requirements
- **Common Password Detection**: Prevents use of common passwords

### 4. **Rate Limiting**
- **API Rate Limiting**: 100 requests per minute per client
- **Signup Attempt Limiting**: Maximum 5 signup attempts per session
- **Request Throttling**: Prevents abuse and DDoS attempts

### 5. **Session Security**
- **Auto-Logout on Inactivity**: 30 minutes of inactivity triggers logout
- **Session Validation**: Regular checks for session integrity
- **Session Expiry**: 24-hour maximum session duration
- **CSRF Protection**: CSRF tokens for all state-changing operations

### 6. **Security Headers**
Implemented via meta tags:
```html
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy
```

### 7. **File Upload Security**
- **File Type Validation**: Only allowed file types accepted
- **File Size Limits**: 10MB maximum file size
- **Malicious File Detection**: Basic pattern matching
- **Secure File Naming**: File names sanitized

### 8. **Additional Security Features**
- **Clickjacking Prevention**: Frame-busting code
- **Password Field Protection**: Copy/cut disabled on password fields
- **Secure Random Generation**: Crypto API for random strings
- **Authentication Logging**: Failed login attempts tracked
- **Suspicious Activity Detection**: Monitors for unusual patterns

---

## 🔌 API Integration

### API Configuration (`api-config.js`)

The `APIConfig` class provides a complete API client with security features:

```javascript
const api = new APIConfig();
```

### Key Features:

1. **Automatic Token Management**
   - Stores and retrieves tokens securely
   - Automatically refreshes expired tokens
   - Handles token expiration gracefully

2. **Request Security**
   - Adds authentication headers automatically
   - Includes CSRF tokens
   - Rate limiting built-in
   - Input sanitization

3. **Error Handling**
   - Comprehensive error catching
   - Automatic retry logic
   - User-friendly error messages

---

## 📁 File Structure

```
brainboard/
├── api-config.js              # API client & security utilities
├── login-enhanced.html        # Secure login page
├── create-enhanced.html       # Secure signup page
├── interface-enhanced.html    # Secure main interface
├── script-enhanced.js         # Enhanced login logic
├── create-enhanced.js         # Enhanced signup logic
├── interface-enhanced.js      # Enhanced interface logic
├── styles.css                 # Login styles
├── create.css                 # Signup styles
├── interface.css              # Interface styles
├── privacy.html               # Terms of Service
├── policy.html                # Privacy Policy
└── README.md                  # This file
```

---

## 🚀 Setup Instructions

### For Development (Demo Mode):

1. **Extract all files to a web server directory**
   ```bash
   # Copy files to web root
   cp *.html *.css *.js /var/www/html/brainboard/
   ```

2. **Open in browser**
   ```
   http://localhost/brainboard/login-enhanced.html
   ```

3. **Use demo credentials**
   - Email: `demo@example.com`
   - Password: `password123`

### For Production:

1. **Configure API endpoint** in `api-config.js`:
   ```javascript
   this.baseURL = 'https://your-api-domain.com/v1';
   ```

2. **Enable API mode** in each script file:
   - Uncomment "PRODUCTION MODE" sections
   - Comment out "DEMO MODE" sections

3. **Set up server-side security headers**:
   ```nginx
   # Nginx example
   add_header Content-Security-Policy "default-src 'self'...";
   add_header X-Frame-Options "DENY";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   ```

---

## ⚙️ Configuration

### API Base URL
Change in `api-config.js`:
```javascript
this.baseURL = 'https://api.brainboard.example.com/v1';
```

### Session Timeout
Change in `interface-enhanced.js`:
```javascript
// 30 minutes of inactivity
inactivityTimer = setTimeout(() => {
  logout();
}, 30 * 60 * 1000);
```

### Rate Limits
Change in `api-config.js`:
```javascript
this.requestWindow = 60000;        // 1 minute
this.maxRequestsPerWindow = 100;   // 100 requests
```

### File Upload Limits
Change in `interface-enhanced.js`:
```javascript
const maxSize = 10 * 1024 * 1024;  // 10MB
```

---

## 🔐 Security Best Practices

### For Developers:

1. **Never store sensitive data in localStorage without encryption**
2. **Always validate and sanitize user inputs**
3. **Use HTTPS in production**
4. **Implement server-side validation as well**
5. **Keep security libraries updated**
6. **Regular security audits**
7. **Implement proper CORS policies**
8. **Use secure cookies for session management**

### For Deployment:

1. **Enable HTTPS/SSL**
2. **Configure proper security headers**
3. **Set up Web Application Firewall (WAF)**
4. **Implement rate limiting at server level**
5. **Regular penetration testing**
6. **Monitor for suspicious activity**
7. **Keep backups encrypted**
8. **Implement proper logging**

---

## 📡 API Endpoints

### Authentication Endpoints

#### POST `/auth/login`
```javascript
await api.login(email, password);

// Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "csrf_token": "..."
}

// Response:
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST `/auth/signup`
```javascript
await api.signup(userData);

// Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "securePass123!",
  "phone": "+1234567890",
  "newsletter": true,
  "csrf_token": "..."
}
```

#### POST `/auth/refresh`
```javascript
await api.refreshAccessToken();

// Automatically called when token expires
```

#### POST `/auth/logout`
```javascript
await api.logout();
```

### User Endpoints

#### GET `/user/profile`
```javascript
const profile = await api.getProfile();

// Response:
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### PUT `/user/profile`
```javascript
await api.updateProfile({
  firstName: "John",
  lastName: "Smith",
  phone: "+1234567890"
});
```

### Post Endpoints

#### GET `/posts`
```javascript
const posts = await api.getPosts({
  type: 'all',
  limit: 20,
  offset: 0
});
```

#### POST `/posts`
```javascript
await api.createPost({
  content: "My post content",
  type: "discussion",
  media: []
});
```

#### POST `/posts/:id/like`
```javascript
await api.likePost(postId);
```

#### POST `/posts/:id/comments`
```javascript
await api.commentOnPost(postId, "My comment");
```

### Search Endpoint

#### POST `/search`
```javascript
const results = await api.search(query);
```

### File Upload Endpoint

#### POST `/upload`
```javascript
const result = await api.uploadFile(file, 'photo');

// Response:
{
  "id": "upload_123",
  "url": "https://cdn.example.com/uploads/file.jpg",
  "type": "photo",
  "size": 1024000
}
```

---

## 🔄 Development Mode vs Production Mode

### Development Mode (Current Configuration)

- Uses localStorage for user data
- Simulated API responses
- Demo credentials work
- No real server required
- Perfect for testing and development

**Features:**
- ✅ All security features active
- ✅ Client-side validation
- ✅ Input sanitization
- ✅ Session management
- ✅ Rate limiting
- ❌ No server-side validation
- ❌ No database persistence

### Production Mode

To enable production mode:

1. **In `script-enhanced.js`** (Login):
```javascript
// Comment out DEMO MODE section:
/* DEMO MODE code here */

// Uncomment PRODUCTION MODE section:
const response = await api.login(email, password);
handleSuccessfulLogin(response, email);
```

2. **In `create-enhanced.js`** (Signup):
```javascript
// Comment out DEMO MODE section
// Uncomment PRODUCTION MODE section
const response = await api.signup({...});
handleSuccessfulSignup(response);
```

3. **In `interface-enhanced.js`** (Interface):
```javascript
// Comment out DEMO MODE sections
// Uncomment PRODUCTION MODE sections for:
// - File uploads
// - Post creation
// - Comments
// - Search
```

4. **Configure API endpoint** in `api-config.js`

---

## 🧪 Testing

### Test Demo Login:
1. Navigate to `login-enhanced.html`
2. Use: `demo@example.com` / `password123`
3. Verify security features:
   - Account lockout after 5 failed attempts
   - Session timeout after inactivity
   - Input validation

### Test Signup:
1. Navigate to `create-enhanced.html`
2. Create a new account
3. Verify:
   - Password strength meter
   - Input validation
   - Email uniqueness check

### Test Security Features:
1. Try SQL injection: `' OR '1'='1`
2. Try XSS: `<script>alert('XSS')</script>`
3. All should be blocked with error messages

---

## 🔧 Troubleshooting

### "Session expired" message
- Normal after 24 hours or 30 minutes inactivity
- Re-login required

### "Rate limit exceeded"
- Wait 1 minute
- Reduces to prevent abuse

### "Account locked"
- Wait 15 minutes after 5 failed login attempts
- Security feature to prevent brute force

### Files not uploading
- Check file size (max 10MB)
- Verify file type is allowed
- Check browser console for errors

---

## 📞 Support

For issues or questions:
- Check browser console for detailed error messages
- Verify all files are in same directory
- Ensure JavaScript is enabled
- Use modern browser (Chrome, Firefox, Safari, Edge)

---

## 📝 License

This is a demo/educational project. Modify as needed for your use case.

---

## 🎯 Next Steps

1. **Implement backend API** with proper authentication
2. **Set up database** for persistent storage
3. **Configure real email** verification
4. **Add OAuth** integration (Google, GitHub, etc.)
5. **Implement 2FA** (Two-Factor Authentication)
6. **Add password reset** functionality
7. **Set up monitoring** and logging
8. **Perform security audit** before production deployment

---

## ⚠️ Important Notes

- **Demo Mode**: Current setup uses localStorage, suitable for testing only
- **Production**: Requires proper backend API and database
- **Security**: Client-side security is first line of defense, always implement server-side validation
- **Passwords**: In production, never send plain passwords to client
- **Tokens**: Store tokens securely, use httpOnly cookies when possible
- **HTTPS**: Always use HTTPS in production

---

## 🚀 Ready to Deploy?

Before deploying to production:

- [ ] Set up proper backend API
- [ ] Configure database
- [ ] Enable HTTPS/SSL
- [ ] Set environment variables
- [ ] Configure CORS properly
- [ ] Enable server-side rate limiting
- [ ] Set up logging and monitoring
- [ ] Perform security audit
- [ ] Test all endpoints
- [ ] Set up backups
- [ ] Configure CDN for static assets
- [ ] Enable DDoS protection

---

**Version**: 2.0.0 (Enhanced Security Edition)
**Last Updated**: February 2, 2026
**Author**: BrainBoard Development Team
