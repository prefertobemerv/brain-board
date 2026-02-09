# BrainBoard API Documentation

## Base URL
```
https://api.brainboard.example.com/v1
```

## Authentication

All API requests (except login and signup) require authentication using JWT tokens.

### Headers Required:
```
Authorization: Bearer {access_token}
Content-Type: application/json
X-CSRF-Token: {csrf_token}
```

---

## Authentication Endpoints

### 1. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive access tokens

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "csrf_token": "generated_csrf_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "createdAt": "2025-01-15T10:30:00Z",
    "emailVerified": true
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}

// 423 Locked
{
  "success": false,
  "error": "Account locked",
  "message": "Too many failed attempts. Try again in 15 minutes"
}

// 429 Too Many Requests
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later"
}
```

---

### 2. User Registration

**Endpoint:** `POST /auth/signup`

**Description:** Create a new user account

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "securePassword123!",
  "phone": "+1234567890",
  "newsletter": true,
  "csrf_token": "generated_csrf_token"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "user": {
    "id": 124,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "createdAt": "2025-02-02T10:30:00Z",
    "emailVerified": false
  },
  "message": "Account created successfully. Verification email sent."
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "success": false,
  "error": "Validation error",
  "message": "Password must be at least 8 characters",
  "fields": {
    "password": "Password must contain uppercase, lowercase, number and special character"
  }
}

// 409 Conflict
{
  "success": false,
  "error": "Email already exists",
  "message": "An account with this email already exists"
}
```

---

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Get a new access token using refresh token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

---

### 4. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidate current session and tokens

**Headers Required:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### 5. Get User Profile

**Endpoint:** `GET /user/profile`

**Description:** Retrieve current user's profile information

**Headers Required:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "student",
    "bio": "Computer Science student passionate about learning",
    "avatar": "https://cdn.example.com/avatars/123.jpg",
    "createdAt": "2025-01-15T10:30:00Z",
    "lastLogin": "2025-02-02T08:15:00Z",
    "emailVerified": true,
    "stats": {
      "posts": 42,
      "likes": 156,
      "comments": 89,
      "following": 23,
      "followers": 45
    }
  }
}
```

---

### 6. Update User Profile

**Endpoint:** `PUT /user/profile`

**Description:** Update user profile information

**Headers Required:**
```
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Updated bio text"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "bio": "Updated bio text"
  }
}
```

---

## Post Endpoints

### 7. Get Posts Feed

**Endpoint:** `GET /posts`

**Description:** Retrieve posts for the feed

**Headers Required:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `type` (optional): Filter by type (all, discussions, questions, tips)
- `limit` (optional): Number of posts (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort order (recent, popular, commented)

**Example Request:**
```
GET /posts?type=questions&limit=10&offset=0&sort=recent
```

**Response (200 OK):**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_789",
      "author": {
        "id": 123,
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://cdn.example.com/avatars/123.jpg"
      },
      "type": "question",
      "content": "Can someone explain the difference between mitosis and meiosis?",
      "media": [],
      "likes": 15,
      "comments": 8,
      "isLiked": false,
      "createdAt": "2025-02-02T10:00:00Z",
      "updatedAt": "2025-02-02T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 8. Create Post

**Endpoint:** `POST /posts`

**Description:** Create a new post

**Headers Required:**
```
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "content": "Just finished my calculus assignment!",
  "type": "discussion",
  "media": ["upload_123", "upload_124"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "post_790",
    "author": {
      "id": 123,
      "firstName": "John",
      "lastName": "Doe"
    },
    "type": "discussion",
    "content": "Just finished my calculus assignment!",
    "media": [
      {
        "id": "upload_123",
        "url": "https://cdn.example.com/media/123.jpg",
        "type": "photo"
      }
    ],
    "likes": 0,
    "comments": 0,
    "createdAt": "2025-02-02T11:30:00Z"
  }
}
```

---

### 9. Like/Unlike Post

**Endpoint:** `POST /posts/:postId/like`

**Description:** Like or unlike a post (toggle)

**Headers Required:**
```
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "liked": true,
  "likeCount": 16,
  "message": "Post liked"
}
```

---

### 10. Get Post Comments

**Endpoint:** `GET /posts/:postId/comments`

**Description:** Retrieve comments for a specific post

**Headers Required:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit` (optional): Number of comments (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "comments": [
    {
      "id": "comment_456",
      "author": {
        "id": 124,
        "firstName": "Jane",
        "lastName": "Smith",
        "avatar": "https://cdn.example.com/avatars/124.jpg"
      },
      "content": "Great question! Here's my explanation...",
      "likes": 5,
      "isLiked": false,
      "createdAt": "2025-02-02T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 11. Add Comment

**Endpoint:** `POST /posts/:postId/comments`

**Description:** Add a comment to a post

**Headers Required:**
```
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "content": "This is my comment on the post"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Comment posted successfully",
  "comment": {
    "id": "comment_457",
    "author": {
      "id": 123,
      "firstName": "John",
      "lastName": "Doe"
    },
    "content": "This is my comment on the post",
    "likes": 0,
    "createdAt": "2025-02-02T11:45:00Z"
  }
}
```

---

## Search Endpoint

### 12. Search

**Endpoint:** `POST /search`

**Description:** Search for content across the platform

**Headers Required:**
```
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "query": "calculus",
  "type": "all",
  "csrf_token": "generated_csrf_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "type": "course",
      "id": "course_101",
      "title": "Calculus 101",
      "description": "Advanced calculus and derivatives",
      "relevance": 0.95
    },
    {
      "type": "post",
      "id": "post_789",
      "title": "Calculus study tips",
      "author": "John Doe",
      "relevance": 0.87
    }
  ],
  "totalResults": 25
}
```

---

## File Upload Endpoint

### 13. Upload File

**Endpoint:** `POST /upload`

**Description:** Upload media files (photos, videos, documents)

**Headers Required:**
```
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
Content-Type: multipart/form-data
```

**Form Data:**
```
file: (binary file data)
type: photo|video|document
csrf_token: generated_csrf_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "upload": {
    "id": "upload_125",
    "url": "https://cdn.example.com/uploads/125.jpg",
    "thumbnail": "https://cdn.example.com/uploads/125_thumb.jpg",
    "type": "photo",
    "size": 1024000,
    "filename": "image.jpg",
    "createdAt": "2025-02-02T12:00:00Z"
  }
}
```

**File Restrictions:**
- Max file size: 10MB
- Allowed photo types: image/jpeg, image/png, image/gif, image/webp
- Allowed video types: video/mp4, video/webm
- Allowed document types: application/pdf, .doc, .docx, .txt

---

## Error Responses

### Standard Error Format:
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {} // Optional additional details
}
```

### Common HTTP Status Codes:

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **423 Locked**: Account locked
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **File uploads**: 10 requests per minute per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643811600
```

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later",
  "retryAfter": 60
}
```

---

## Pagination

For endpoints that return multiple results:

**Query Parameters:**
- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

**Response includes:**
```json
{
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Security Notes

1. **Always use HTTPS** in production
2. **Tokens expire** after 1 hour (refresh before expiration)
3. **CSRF tokens** required for all state-changing operations
4. **Rate limiting** prevents abuse
5. **Input validation** performed on all requests
6. **SQL injection & XSS** protection implemented
7. **File uploads** are scanned for malware

---

## Testing the API

### Using cURL:

```bash
# Login
curl -X POST https://api.brainboard.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","csrf_token":"token"}'

# Get profile (with token)
curl -X GET https://api.brainboard.example.com/v1/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create post
curl -X POST https://api.brainboard.example.com/v1/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"My post","type":"discussion"}'
```

---

## WebSocket Support (Future)

Real-time features planned:
- Live notifications
- Chat messages
- Real-time post updates

**Connection:**
```javascript
const ws = new WebSocket('wss://api.brainboard.example.com/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_access_token'
  }));
};
```

---

## Support

For API questions or issues:
- Email: api-support@brainboard.example.com
- Documentation: https://docs.brainboard.example.com
- Status: https://status.brainboard.example.com

---

**API Version**: 1.0.0
**Last Updated**: February 2, 2026
