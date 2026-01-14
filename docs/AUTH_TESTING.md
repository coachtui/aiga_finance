# Authentication System Testing Guide

## Overview

The complete authentication system is now built and ready to test! This includes user registration, login, token refresh, protected routes, and session management.

## Prerequisites

Before testing, ensure you have:

1. **PostgreSQL Running:**
   ```bash
   # Check if PostgreSQL is running
   psql -l
   ```

2. **Database Migrated:**
   ```bash
   cd backend
   npm run migrate
   ```

3. **Servers Running:**
   - Backend: `cd backend && npm run dev` (port 3000)
   - Frontend: `cd frontend && npm run dev` (port 5173)

## Testing the Authentication Flow

### 1. User Registration

**Frontend Test:**
1. Open http://localhost:5173
2. You'll be redirected to http://localhost:5173/login
3. Click "create a new account"
4. Fill in the registration form:
   - Email: test@example.com
   - Password: TestPass123 (must have uppercase, lowercase, and number)
   - First Name: John
   - Last Name: Doe
5. Click "Create account"
6. You should be redirected to the Dashboard

**Backend API Test (Optional):**
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "TestPass123",
    "firstName": "API",
    "lastName": "Test"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "api-test@example.com",
      "first_name": "API",
      "last_name": "Test",
      "role": "user",
      ...
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-token",
    "expiresIn": "15m"
  },
  "message": "User registered successfully"
}
```

### 2. User Login

**Frontend Test:**
1. Logout from the dashboard
2. Go to http://localhost:5173/login
3. Enter credentials:
   - Email: test@example.com
   - Password: TestPass123
4. Click "Sign in"
5. You should be redirected to the Dashboard

**Backend API Test:**
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 3. Access Protected Route

**Frontend Test:**
1. While logged in, navigate around the dashboard
2. Logout
3. Try to access http://localhost:5173/dashboard directly
4. You should be redirected to /login

**Backend API Test:**
```bash
# Without token (should fail)
curl http://localhost:3000/v1/auth/me

# With token (should succeed)
curl http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      ...
    }
  }
}
```

### 4. Token Refresh

The frontend automatically refreshes tokens when they expire (after 15 minutes).

**Manual Test:**
```bash
curl -X POST http://localhost:3000/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout

**Frontend Test:**
1. Click "Logout" button in the dashboard header
2. You should be redirected to /login
3. Local storage should be cleared (check DevTools → Application → Local Storage)

**Backend API Test:**
```bash
curl -X POST http://localhost:3000/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Validation Testing

### Password Requirements

Try registering with weak passwords to test validation:

1. **Too Short:**
   - Password: "Test1" (less than 8 characters)
   - Expected: Error "Password must be at least 8 characters long"

2. **No Uppercase:**
   - Password: "testpass123"
   - Expected: Error "Password must contain uppercase, lowercase, and number"

3. **No Lowercase:**
   - Password: "TESTPASS123"
   - Expected: Error message

4. **No Number:**
   - Password: "TestPassword"
   - Expected: Error message

### Email Validation

1. **Invalid Email:**
   - Email: "notanemail"
   - Expected: Validation error

2. **Duplicate Email:**
   - Try registering with same email twice
   - Expected: "Email already registered"

## Rate Limiting Testing

The auth endpoints are rate-limited to 5 attempts per 15 minutes.

**Test:**
1. Try logging in with wrong password 6 times rapidly
2. On the 6th attempt, you should get:
   ```json
   {
     "error": "Too many authentication attempts, please try again later"
   }
   ```

## Security Features Verification

### 1. Password Hashing

Passwords are stored hashed with bcrypt (cost factor 12):

```bash
# Connect to database
psql aiga_finance_dev

# Check user passwords are hashed
SELECT email, password_hash FROM users;
```

You should see something like:
```
email              | password_hash
-------------------+----------------------------------------------
test@example.com   | $2a$12$XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
```

### 2. JWT Tokens

Tokens contain user info but are signed and verified:

```bash
# Decode JWT (won't verify signature but shows payload)
node -e "
const token = 'YOUR_ACCESS_TOKEN';
const payload = Buffer.from(token.split('.')[1], 'base64').toString();
console.log(JSON.parse(payload));
"
```

Expected payload:
```json
{
  "userId": "uuid",
  "email": "test@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 3. Session Tracking

Sessions are stored with IP address and user agent:

```sql
-- Connect to database
psql aiga_finance_dev

-- Check sessions
SELECT user_id, ip_address, user_agent, created_at, expires_at FROM sessions;
```

## Common Issues & Solutions

### "Cannot connect to database"

**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql@15

# Or with Docker
cd infrastructure/docker
docker compose up -d
```

### "Module not found" errors

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "CORS errors" in browser console

**Solution:**
Check `backend/.env`:
```
CORS_ORIGIN=http://localhost:5173
```

### "Invalid token" errors

**Solution:**
- Logout and login again
- Check JWT_SECRET is set in `backend/.env`
- Clear browser local storage

## Database Inspection

Useful queries for debugging:

```sql
-- Connect to database
psql aiga_finance_dev

-- Count users
SELECT COUNT(*) FROM users;

-- View all users
SELECT id, email, first_name, last_name, is_active, created_at FROM users;

-- View active sessions
SELECT s.*, u.email
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE expires_at > NOW();

-- View audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

## Next Steps After Testing

Once authentication is working:

1. ✅ Users can register and login
2. ✅ Protected routes work
3. ✅ Tokens auto-refresh
4. ✅ Validation works

**Ready to build:**
- Expense tracking endpoints
- Category management
- File uploads (receipts)
- Analytics dashboard
- Bank integration

## API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/v1/auth/register` | No | Register new user |
| POST | `/v1/auth/login` | No | Login user |
| POST | `/v1/auth/refresh` | No | Refresh access token |
| POST | `/v1/auth/logout` | No | Logout user |
| GET | `/v1/auth/me` | Yes | Get current user |
| POST | `/v1/auth/logout-all` | Yes | Logout from all devices |
| POST | `/v1/auth/change-password` | Yes | Change password |
| GET | `/health` | No | Health check |

## Success Criteria

Authentication system is working if:
- ✅ User can register with valid credentials
- ✅ User can login with correct credentials
- ✅ Invalid credentials are rejected
- ✅ Weak passwords are rejected
- ✅ Protected routes redirect to login when not authenticated
- ✅ Dashboard shows user info when logged in
- ✅ Logout clears session and redirects to login
- ✅ Rate limiting prevents brute force attacks
- ✅ Tokens are properly stored and used for API calls

Happy testing! 🚀
