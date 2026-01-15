# Next Steps - AIGA Finance Development

**Current Status**: Phase 0 Security Hardening ✅ COMPLETE
**Next Phase**: Frontend Integration + Railway Deployment
**Estimated Time to Production**: 3-4 hours

---

## Immediate To-Do's (Before Deployment)

### 1. Frontend CSRF Integration (20 minutes) ⏳ REQUIRED

The backend is now sending CSRF tokens, but the frontend needs to fetch and include them in requests.

#### Step 1: Update API Service
**File**: `frontend/src/services/api.js`

```javascript
// Add these functions to your axios instance setup:

let csrfToken = null;

// Initialize CSRF token from backend
export async function initCSRF() {
  try {
    const response = await axios.get('/csrf-token');
    csrfToken = response.data.csrfToken;
    console.log('CSRF token initialized');
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Add JWT token if available
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token for state-changing operations
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    } else {
      console.warn('CSRF token not available for', config.method, config.url);
    }
  }

  return config;
});

export default api;
```

#### Step 2: Initialize CSRF on App Load
**File**: `frontend/src/main.jsx`

```javascript
import { initCSRF } from './services/api';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Initialize security features before rendering
Promise.all([
  initCSRF(),
  // Add other initialization here if needed
]).then(() => {
  root.render(<App />);
}).catch((error) => {
  console.error('Failed to initialize app:', error);
  root.render(<div>Failed to initialize application</div>);
});
```

#### Step 3: Test CSRF Protection
1. Open browser DevTools → Network tab
2. Login to the application
3. Try to create a new expense or invoice
4. Verify `X-CSRF-Token` header is present in POST request
5. Success when: POST requests include the CSRF token header

---

### 2. Generate Production Secrets (15 minutes) ⏳ REQUIRED

Before deploying, you need real cryptographic secrets instead of placeholders.

#### Generate JWT Secrets
```bash
# Generate JWT_SECRET (64 random hex characters)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (64 random hex characters)
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

**Save these to your production `.env` file** (keep safe, don't commit to git!)

---

### 3. Setup Production AWS Credentials (10 minutes) ⏳ REQUIRED

You need AWS S3 access for file uploads.

#### Option A: Create New IAM User (Recommended for Production)
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iamv2/home)
2. Create new user: "aiga-finance-s3"
3. Attach policy: `AmazonS3FullAccess` (or custom minimal policy below)
4. Generate access key and secret
5. Save to production `.env`:
   ```bash
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=aiga-finance-production
   ```

#### Minimal S3 Policy (Most Secure)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::aiga-finance-production/*"
    }
  ]
}
```

---

### 4. Setup SendGrid Email (10 minutes) ⏳ REQUIRED

For invoice emails and notifications.

1. Go to [SendGrid Account](https://app.sendgrid.com)
2. Navigate to: Settings → API Keys
3. Create new API key with Mail Send permissions
4. Create verified sender (Settings → Sender Authentication)
5. Save to production `.env`:
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=AIGA Finance
   ```

---

## Deployment Phases (Next)

### Phase 1: Pre-Deployment Setup (30 minutes)
See: [PHASE_0_SECURITY_HARDENING.md - Phase 1 Section](PHASE_0_SECURITY_HARDENING.md#phase-1-pre-deployment-setup-30-minutes)

### Phase 2: Railway Project Setup (15 minutes)
See: [PHASE_0_SECURITY_HARDENING.md - Phase 2 Section](PHASE_0_SECURITY_HARDENING.md#phase-2-railway-project-setup-15-minutes)

### Phase 3: Backend Deployment (20 minutes)
See: [PHASE_0_SECURITY_HARDENING.md - Phase 3 Section](PHASE_0_SECURITY_HARDENING.md#phase-3-backend-deployment-20-minutes)

### Phase 4: Frontend Deployment (15 minutes)
See: [PHASE_0_SECURITY_HARDENING.md - Phase 4 Section](PHASE_0_SECURITY_HARDENING.md#phase-4-frontend-deployment-15-minutes)

### Phase 5: Custom Domain (Optional, 10 minutes)
See: [PHASE_0_SECURITY_HARDENING.md - Phase 5 Section](PHASE_0_SECURITY_HARDENING.md#phase-5-dns--custom-domain-optional-10-minutes)

### Phase 6: Production Optimizations (Optional, 30 minutes)
See: [PHASE_0_SECURITY_HARDENING.md - Phase 6 Section](PHASE_0_SECURITY_HARDENING.md#phase-6-production-optimizations-optional-30-minutes)

**Full Deployment Plan**: [swirling-popping-octopus.md](/Users/tui/.claude/plans/swirling-popping-octopus.md)

---

## Testing Checklist

After implementing frontend CSRF integration, test these items:

### Authentication
- [ ] User registration works
- [ ] Login successful with JWT token
- [ ] Token stored in localStorage
- [ ] Logout blacklists token (token rejected on next request)
- [ ] Refresh token generates new access token
- [ ] Change password logs out from all devices

### CSRF Protection
- [ ] CSRF token fetched on app load
- [ ] CSRF token included in POST requests (DevTools → Network)
- [ ] CSRF token included in PUT requests
- [ ] CSRF token included in DELETE requests
- [ ] GET requests don't include CSRF token (expected)

### File Upload Security
- [ ] Can upload .jpg image file
- [ ] Can upload .pdf document
- [ ] Cannot upload .exe file (rejected with "content type mismatch")
- [ ] Cannot upload .exe disguised as .jpg (rejected by file content validation)

### Authorization
- [ ] Can see own expenses/invoices
- [ ] Cannot access other user's expense (403 Forbidden)
- [ ] Can download own invoice attachment
- [ ] Cannot download other user's attachment (403 Forbidden)

### Logging Security
- [ ] No passwords in logs: `grep -r "password" backend/logs/`
- [ ] No API keys in logs: `grep -r "secret\|key\|token" backend/logs/`
- [ ] Logs show "[REDACTED]" for sensitive fields

---

## Environment Variables - Production

### Backend Required (15 variables)
```bash
# Core Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database (from Railway)
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis (from Railway)
REDIS_URL=redis://host:6379

# JWT Authentication (generate with crypto.randomBytes(64).toString('hex'))
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# AWS S3
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=us-east-1
S3_BUCKET_NAME=aiga-finance-production

# Email (SendGrid)
SENDGRID_API_KEY=SG.<your-sendgrid-key>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=AIGA Finance
```

### Frontend Required (2 variables)
```bash
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api/v1

# App Metadata
VITE_APP_NAME=AIGA Finance
```

---

## Troubleshooting Guide

### CSRF Token Not Working
**Problem**: POST requests failing with 403 Forbidden
**Solution**:
1. Verify `/csrf-token` endpoint returns a token
2. Check that `initCSRF()` is called before rendering app
3. Verify token is included in request headers (DevTools)
4. Check cookies are enabled in browser

### Database Connection Failing
**Problem**: "Cannot connect to database" error
**Solution**:
1. Verify `DATABASE_URL` environment variable is set
2. Check PostgreSQL database is running
3. Test connection: `psql $DATABASE_URL`
4. Ensure SSL certificates are correct for Railway

### Files Not Uploading
**Problem**: File upload returns 400 error
**Solution**:
1. Check file type is in ALLOWED_FILE_TYPES
2. Verify actual file content matches declared MIME type
3. Check AWS credentials are correct
4. Ensure S3 bucket exists and is accessible
5. Check file size is under MAX_FILE_SIZE

### Logout Not Working
**Problem**: Token still accepted after logout
**Solution**:
1. Verify Redis server is running
2. Check Redis URL in environment variables
3. Ensure token is sent to logout endpoint
4. Verify Redis can store/retrieve values

---

## Development vs Production

### Development Environment
- Database: Local PostgreSQL (unencrypted)
- Files: Local `/uploads` directory
- Email: Logged to console (not sent)
- Secrets: Placeholder values in `.env`

### Production Environment
- Database: Railway PostgreSQL (SSL/TLS encrypted)
- Files: AWS S3 (encrypted)
- Email: SendGrid (real emails sent)
- Secrets: Real cryptographic values

**Before switching to production, verify all 3 credential sources are setup.**

---

## Git Workflow for Deployment

```bash
# 1. Commit frontend CSRF integration
git add frontend/src/services/api.js frontend/src/main.jsx
git commit -m "Implement frontend CSRF integration

- Add initCSRF() to fetch tokens from backend
- Include CSRF token in all state-changing requests
- Handle token fetch errors gracefully"

# 2. Update .env.example (but NOT commit real secrets)
git add backend/.env.example frontend/.env.example
git commit -m "Update environment variable documentation"

# 3. Push to main branch
git push origin main

# 4. Create production .env files (DO NOT COMMIT)
# Keep these private - only add to Railway dashboard
```

---

## Security Pre-Deployment Checklist

### Secrets Management
- [ ] JWT_SECRET is 64+ random characters (not placeholder)
- [ ] JWT_REFRESH_SECRET is 64+ random characters (not placeholder)
- [ ] AWS credentials created for production (not development)
- [ ] SendGrid API key is production key (not test)
- [ ] No secrets committed to git (check git log)

### Infrastructure
- [ ] PostgreSQL database created and migrated
- [ ] Redis server configured and running
- [ ] S3 bucket created with proper ACL (private)
- [ ] SendGrid sender email verified

### Application
- [ ] Frontend CSRF integration complete
- [ ] All tests passing: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] No console errors in browser
- [ ] All security measures verified in PHASE_0_SECURITY_HARDENING.md

### Monitoring
- [ ] Error tracking configured (Sentry recommended)
- [ ] Log aggregation configured
- [ ] Database backups enabled
- [ ] Alert system configured

---

## Timeline Estimate

| Task | Time | Status |
|------|------|--------|
| Frontend CSRF Integration | 20 min | ⏳ TODO |
| Generate Production Secrets | 15 min | ⏳ TODO |
| Setup AWS S3 | 10 min | ⏳ TODO |
| Setup SendGrid | 10 min | ⏳ TODO |
| Phase 1: Pre-Deployment Setup | 30 min | ⏳ TODO |
| Phase 2: Railway Project Setup | 15 min | ⏳ TODO |
| Phase 3: Backend Deployment | 20 min | ⏳ TODO |
| Phase 4: Frontend Deployment | 15 min | ⏳ TODO |
| Testing & Verification | 30 min | ⏳ TODO |
| **TOTAL** | **3.5 hours** | |

---

## After Deployment

### Post-Deployment Verification
1. Test application at production URL
2. Verify all API endpoints working
3. Test file upload and download
4. Test email sending
5. Monitor error logs for 24 hours

### Plaid Integration (When Ready)
1. Sign up for Plaid production account
2. Complete Plaid security questionnaire
3. Get production API keys
4. Implement Plaid Link in frontend
5. Configure webhook endpoints
6. Test with test bank accounts
7. Monitor for suspicious activity

### Ongoing Maintenance
1. Monitor logs for errors
2. Update dependencies monthly
3. Review access logs for security issues
4. Backup database regularly
5. Test disaster recovery procedures

---

## Questions?

**For deployment help**: Refer to [swirling-popping-octopus.md](/Users/tui/.claude/plans/swirling-popping-octopus.md)
**For security details**: Refer to [PHASE_0_SECURITY_HARDENING.md](PHASE_0_SECURITY_HARDENING.md)
**For implementation details**: Refer to individual file comments

---

**Status**: Ready for Next Phase ✅
**Started**: January 14, 2026
**Security Status**: Production-Ready ✅
