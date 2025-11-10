# Historian Auth - Quick Reference Guide

## Authentication Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    HISTORIAN AUTH SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  FRONTEND (Next.js + React)          BACKEND (Express.js)   │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  Pages:                              Routes:                 │
│  • /login                            POST /user/login        │
│  • /register                         POST /user/signup       │
│  • /logout                           POST /user/logout       │
│  • /dashboard (protected)            GET  /user              │
│  • /timeline (protected)             DELETE /user            │
│  • /agents (protected)                                       │
│                                      Middleware:             │
│  State Management:                   • authUserSignedIn()    │
│  • HistorianContext (React)                                  │
│  • user object                       Password Hashing:       │
│  • setUser function                  • Argon2                │
│                                                               │
│  Auth Checks:                        Session Store:          │
│  • isUserLoggedIn()                  • PostgreSQL            │
│  • getUser() API call                • PrismaSessionStore    │
│  • credentials: 'include'            • 30-day expiry         │
│                                      • HTTPOnly cookie       │
└─────────────────────────────────────────────────────────────┘
```

## File Location Cheat Sheet

### Backend Core Files
| File | Purpose |
|------|---------|
| `/apps/backend/src/main.ts` | Session initialization & middleware setup |
| `/apps/backend/src/lib/controllers/auth.ts` | `authUserSignedIn()` middleware |
| `/apps/backend/src/lib/controllers/index.ts` | Login/signup/logout handlers |
| `/apps/backend/src/lib/router.ts` | Route definitions with auth guards |
| `/apps/backend/src/lib/db.ts` | `getUserById()` utility |
| `/apps/backend/prisma/schema.prisma` | User and Session models |
| `/apps/backend/src/types/express-session.d.ts` | Session interface definitions |

### Frontend Core Files
| File | Purpose |
|------|---------|
| `/apps/frontend/pages/login/index.tsx` | Login form & logic |
| `/apps/frontend/pages/register/index.tsx` | Signup form & logic |
| `/apps/frontend/pages/logout/index.tsx` | Logout trigger |
| `/apps/frontend/src/fetch.ts` | API client (userLogin, userRegister, getUser, userLogout) |
| `/apps/frontend/context/historian.tsx` | Auth context provider |
| `/apps/frontend/src/isUserLoggedIn.ts` | Auth guard utility |
| `/apps/frontend/pages/_app.tsx` | App wrapper with provider |
| `/apps/frontend/src/components/AppBar.tsx` | Nav bar with conditional auth UI |

## API Endpoints Summary

### Public Endpoints (No Auth Required)
```
POST /api/user/login       - Login with username/password
POST /api/user/signup      - Create account with username/password
```

### Protected Endpoints (Auth Required)
```
GET  /api/user             - Get current user info
POST /api/user/logout      - Logout and destroy session
DELETE /api/user           - Delete account and data

GET  /api/history          - Get user's history
GET  /api/history/:id      - Get specific history item
DELETE /api/history/:id    - Delete history item

GET  /api/ui/dashboard     - Get dashboard data
```

## Request/Response Examples

### Login
```bash
POST /api/user/login
Content-Type: application/json
Credentials: include

Request Body:
{
  "username": "john_doe",
  "password": "password123"
}

Success Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe"
}

Error Response (400):
{
  "error": "Invalid password"
}
```

### Protected Request
```bash
GET /api/user
Credentials: include
Cookie: HISTORIAN_SESSION=...

Success Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe"
}

Unauthorized Response (400):
{
  "error": "User not logged in"
}
```

## Session Flow

```
1. User Logs In
   ↓
2. Server validates credentials with Argon2
   ↓
3. Server creates session: { loggedIn: true, userId: "..." }
   ↓
4. Session saved to PostgreSQL
   ↓
5. Set-Cookie header: HISTORIAN_SESSION=<session_id>
   ↓
6. Browser stores cookie (httpOnly, secure)
   ↓
7. Browser auto-includes cookie on subsequent requests
   ↓
8. Middleware checks session.loggedIn before serving protected routes
   ↓
9. On logout: session.destroy() removes session from database
```

## Key Configuration Values

| Setting | Value | File |
|---------|-------|------|
| Session Name | `HISTORIAN_SESSION` | `/apps/backend/src/main.ts` |
| Session Duration | 30 days | `/apps/backend/src/main.ts` |
| Session Store | PostgreSQL | `/apps/backend/src/main.ts` |
| Cookie Type | HTTPOnly | `/apps/backend/src/main.ts` |
| Secure Cookie | false (dev) / true (prod) | `/apps/backend/src/main.ts` |
| Password Algorithm | Argon2 | `package.json` dependency |
| CORS Credentials | Enabled | `/apps/backend/src/main.ts` |

## Environment Variables Needed

```bash
# Backend
EXPRESS_SESSION_SECRET=your_secret_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/historian
PORT=3333  # optional, defaults to 3333

# Frontend
# Uses production URLs by default:
# baseUrl = 'https://historian-api.archit.xyz/api'
# For local dev, uncomment in /apps/frontend/src/constants.tsx
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "User not found" | Login with non-existent username | Register first or check username |
| "Invalid password" | Wrong password for account | Check password and retype carefully |
| "Username and password are required" | Missing credentials | Provide both username and password |
| "Failed to create User!" | Duplicate username or DB error | Use unique username or check DB connection |
| "User not logged in" | Accessing protected route without session | Login first |

## Testing Auth Locally

```bash
# 1. Start backend
cd apps/backend
npm start

# 2. Start frontend
cd apps/frontend
npm run dev

# 3. Test signup
curl -X POST http://localhost:3333/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  -c cookies.txt

# 4. Test protected route (with cookies)
curl http://localhost:3333/api/user \
  -b cookies.txt

# 5. Test logout
curl -X POST http://localhost:3333/api/user/logout \
  -b cookies.txt
```

## Frontend Auth Hooks/Utilities

### Check if User Logged In
```typescript
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';

useEffect(() => {
  isUserLoggedIn(router, setUser);
}, []);
```

### Get Current User
```typescript
import { getUser } from 'apps/frontend/src/fetch';

getUser()
  .then(res => res.json())
  .then(userData => setUser(userData))
  .catch(err => router.push('/login'));
```

### Login User
```typescript
import { userLogin } from 'apps/frontend/src/fetch';

userLogin(username, password)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      setError(data.error);
    } else {
      router.push('/dashboard');
    }
  });
```

### Logout User
```typescript
import { userLogout } from 'apps/frontend/src/fetch';

userLogout()
  .then(res => res.json())
  .then(() => {
    window.location.assign('/');
  });
```

### Access Auth Context
```typescript
import HistorianContext from 'apps/frontend/context/historian';

const { user, setUser } = useContext(HistorianContext);

if (!user) {
  return <LoginPrompt />;
}
```

## Database Schema (Key Fields)

### User Table
```sql
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  preferences JSON,
  createdAt TIMESTAMP DEFAULT now()
);
```

### Session Table
```sql
CREATE TABLE "Session" (
  id VARCHAR PRIMARY KEY,
  sid VARCHAR UNIQUE NOT NULL,
  data TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL
);
```

## Security Checklist

- [x] Password hashing with Argon2
- [x] HTTPOnly session cookies
- [x] Session validation on protected routes
- [x] CORS with credentials enabled
- [x] Database-backed session storage
- [ ] HTTPS enforcement (`secure: true`)
- [ ] CSRF token protection
- [ ] Login rate limiting
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Email verification
- [ ] Password reset flow
- [ ] 2FA/MFA support
- [ ] Audit logging

## Architecture Decision: Session-Based vs JWT

This app uses **Session-Based Authentication** because:
- Server-side rendered Next.js (not pure SPA)
- Simpler session management with cookies
- Built-in session invalidation (just delete from DB)
- Better CSRF protection potential

Alternative: JWT would be better for:
- Microservices / distributed systems
- Mobile app backends
- Stateless API servers
