# Historian Authentication System - Complete Documentation

This directory contains comprehensive analysis and documentation of the Historian app's authentication implementation.

## Documents Included

### 1. AUTH_IMPLEMENTATION.md (25KB, 855 lines)
**The complete, detailed analysis**
- Full overview of the auth system
- 16 comprehensive sections covering every aspect
- Code snippets from actual files
- Database schema details
- Environment variable requirements
- Security analysis (implemented vs needed)
- Detailed authentication flow diagrams
- Perfect for understanding the complete system

**Best for:**
- Complete understanding of the system
- Security audits and reviews
- Finding specific implementation details
- Architecture documentation

### 2. AUTH_QUICK_REFERENCE.md (9.5KB, 317 lines)
**Fast lookup and testing guide**
- At-a-glance architecture diagram
- File location cheat sheet
- API endpoints summary
- Request/response examples
- Session flow explanation
- Configuration values table
- Common error messages
- Testing commands (curl examples)
- Frontend utility usage examples
- Database schema (simplified)
- Security checklist

**Best for:**
- Quick lookups while coding
- Understanding the high-level flow
- Testing auth locally
- Debugging issues
- Security improvements

### 3. AUTH_CODE_MAP.md (19KB, 576 lines)
**Code-level navigation and flow diagrams**
- Step-by-step backend code flow (8 sections)
- Step-by-step frontend code flow (10 sections)
- Data flow diagrams
- Key functions location map
- Login/Protected route request flows
- Debugging tips
- Common code patterns
- Copy-paste ready examples

**Best for:**
- Finding where specific code is
- Understanding code execution flow
- Adding new auth features
- Debugging specific functions
- Learning the codebase

---

## Quick Start

### What is This App's Auth System?

**Session-Based Authentication** using:
- Backend: Express.js + express-session
- Database: PostgreSQL (Prisma ORM)
- Password Hashing: Argon2
- Frontend: Next.js + React Context API
- State Management: React Context (no Redux)

### The Flow (TL;DR)

```
User submits login form
    ↓
POST /api/user/login with username/password
    ↓
Backend validates with Argon2
    ↓
Creates session in PostgreSQL
    ↓
Sends Set-Cookie: HISTORIAN_SESSION
    ↓
Browser stores cookie
    ↓
All future requests include cookie
    ↓
Middleware checks session on protected routes
    ↓
If valid: serve data | If invalid: 400 error
```

### Key Files (Backend)

| File | What It Does |
|------|-------------|
| `/apps/backend/src/main.ts` | Sets up express-session with PostgreSQL |
| `/apps/backend/src/lib/controllers/auth.ts` | `authUserSignedIn()` middleware |
| `/apps/backend/src/lib/controllers/index.ts` | Login, signup, logout handlers |
| `/apps/backend/src/lib/router.ts` | Routes with auth guards |
| `/apps/backend/prisma/schema.prisma` | User and Session tables |

### Key Files (Frontend)

| File | What It Does |
|------|-------------|
| `/apps/frontend/pages/login/index.tsx` | Login form and logic |
| `/apps/frontend/pages/register/index.tsx` | Signup form and logic |
| `/apps/frontend/src/fetch.ts` | API client with credentials |
| `/apps/frontend/context/historian.tsx` | Auth context provider |
| `/apps/frontend/src/isUserLoggedIn.ts` | Route guard utility |

---

## Common Tasks

### Check if User is Logged In (Frontend)
```typescript
import HistorianContext from 'apps/frontend/context/historian';

const { user } = useContext(HistorianContext);
if (user) {
  console.log(`Logged in as ${user.username}`);
} else {
  console.log('Not logged in');
}
```

### Test Login Endpoint
```bash
curl -X POST http://localhost:3333/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -c cookies.txt

curl -b cookies.txt http://localhost:3333/api/user
```

### Add New Protected Route (Backend)
```typescript
// In /apps/backend/src/lib/router.ts
router.get('/your-route', authUserSignedIn, yourHandler);
```

### Add New Protected Page (Frontend)
```typescript
// In /apps/frontend/pages/your-page.tsx
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';

export default function YourPage() {
  const router = useRouter();
  const { user, setUser } = useContext(HistorianContext);
  
  useEffect(() => {
    isUserLoggedIn(router, setUser);
  }, []);
  
  if (!user) return null; // Will redirect
  return <div>Your protected content</div>;
}
```

---

## Critical Implementation Details

### Password Security
- Passwords are hashed with **Argon2** (industry standard)
- Original passwords are **never stored**
- Passwords are **never returned in API responses**
- Only hash is stored in `User.passwordHash`

### Session Security
- Sessions are stored in **PostgreSQL** (not memory)
- Session cookie is **HTTPOnly** (JS cannot access)
- Cookie expires after **30 days**
- Session ID is unique and random
- Sessions are automatically cleaned up

### API Communication
- All frontend API calls use `credentials: 'include'`
- This ensures cookies are sent with every request
- Server validates session on each request to protected routes
- Sessions are tied to specific browser/device

---

## Potential Improvements (Not Currently Implemented)

1. **HTTPS Enforcement** - Add `secure: true` to cookies (production)
2. **CSRF Tokens** - Prevent cross-site request forgery
3. **Rate Limiting** - Prevent brute force login attempts
4. **Password Requirements** - Enforce minimum length/complexity
5. **Email Verification** - Confirm user email on signup
6. **Password Reset** - Allow users to recover forgotten passwords
7. **Account Lockout** - Lock after failed login attempts
8. **2FA/MFA** - Multi-factor authentication support
9. **Audit Logging** - Log all auth events
10. **JWT Option** - Alternative token-based auth

---

## Architecture Decisions

### Why Session-Based Instead of JWT?

**Chosen: Session-Based**
- Servers manage all session state
- Can immediately invalidate sessions
- Built-in XSS protection with HTTPOnly cookies
- Well-suited for server-rendered Next.js
- Simpler logout (just delete session)

**Not chosen: JWT (Token-Based)**
- Would be better for microservices
- Would be better for mobile apps
- Would be better for distributed systems
- Tokens can't be immediately invalidated
- Stateless approach (harder to track users)

### Why React Context Instead of Redux?

**Chosen: React Context**
- Simpler for small-medium apps
- Built into React (no external library)
- Sufficient for auth state management
- Less boilerplate code
- Easier to maintain

**Not chosen: Redux**
- Overkill for just auth state
- Requires more setup and boilerplate
- Better for large, complex apps
- Good for detailed state time-travel debugging

---

## Testing Checklist

- [ ] Can register a new user
- [ ] New user auto-logs in after signup
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong username
- [ ] Cannot login with wrong password
- [ ] Can access protected routes when logged in
- [ ] Cannot access protected routes when not logged in
- [ ] Can logout and session is destroyed
- [ ] Can login again after logout
- [ ] Session persists across page refreshes
- [ ] Login persists across browser tabs
- [ ] Logout clears all session state
- [ ] User avatar shows in navbar when logged in
- [ ] Login button shows in navbar when not logged in

---

## Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| express-session | ^1.18.1 | Session management |
| @quixo3/prisma-session-store | ^3.1.13 | PostgreSQL session storage |
| argon2 | ^0.41.1 | Password hashing |
| cookie-parser | ^1.4.7 | Parse cookies |
| cors | ^2.8.5 | Cross-origin requests |
| next | ^16.0.1 | Frontend framework |
| react | ^19.2.0 | UI library |

---

## Environment Setup

### Required Environment Variables
```bash
# Backend (.env file)
EXPRESS_SESSION_SECRET=your_random_secret_key_here_min_32_chars
DATABASE_URL=postgresql://user:password@localhost:5432/historian
PORT=3333  # optional
```

### Optional for Local Development
```bash
# Frontend (/apps/frontend/src/constants.tsx)
# Uncomment these lines for local development:
// export const baseUrl = '/api';
// export const oauthBaseUrl = 'http://localhost:3333';
```

---

## Troubleshooting

### User Can't Login
**Check:**
1. Username exists in database
2. Password is correct (case-sensitive)
3. Backend is running
4. `EXPRESS_SESSION_SECRET` is set

### Session Expires Unexpectedly
**Check:**
1. `maxAge` in session config (currently 30 days)
2. PostgreSQL connection is stable
3. Browser cookies are not being blocked
4. Local time is correct (affects session expiry)

### CORS or Cookie Issues
**Check:**
1. Frontend fetch uses `credentials: 'include'`
2. Backend CORS has `credentials: true`
3. Frontend and backend are on correct domains
4. Browser allows cross-origin cookies

### Protected Routes Always Redirect to Login
**Check:**
1. `isUserLoggedIn()` is called in useEffect
2. `getUser()` API call includes credentials
3. Backend session validation is working
4. Session cookie is being sent

---

## Additional Resources

- Express Session Docs: https://github.com/expressjs/session
- Argon2 Docs: https://github.com/ranisalt/node-argon2
- Prisma Docs: https://www.prisma.io/docs/
- Next.js Auth: https://nextjs.org/docs/pages/building-your-application/routing/authentication
- OWASP Authentication: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

## Document Maintenance

These documents were generated on **2025-11-03** by analyzing:
- `/apps/backend/src/**/*.ts`
- `/apps/frontend/pages/**/*.tsx`
- `/apps/frontend/src/**/*.ts`
- `/apps/backend/prisma/schema.prisma`
- `package.json`

To update these docs after auth changes, review:
1. `/apps/backend/src/main.ts` - Session config changes
2. `/apps/backend/src/lib/controllers/auth.ts` - Middleware changes
3. `/apps/backend/src/lib/controllers/index.ts` - Handler logic changes
4. `/apps/frontend/context/historian.tsx` - State management changes
5. `/apps/frontend/src/fetch.ts` - API call changes

---

## Quick Navigation

| Goal | Document | Section |
|------|----------|---------|
| Understand full system | AUTH_IMPLEMENTATION.md | Overview (top) |
| Find a file | AUTH_QUICK_REFERENCE.md | File Location Cheat Sheet |
| Find a function | AUTH_CODE_MAP.md | Key Functions Location Map |
| Test auth locally | AUTH_QUICK_REFERENCE.md | Testing Auth Locally |
| Debug an issue | AUTH_CODE_MAP.md | Debugging Tips |
| Add new feature | AUTH_CODE_MAP.md | Common Code Patterns |
| See code flow | AUTH_CODE_MAP.md | Data Flow Diagram |
| Check error messages | AUTH_QUICK_REFERENCE.md | Common Error Messages |
| View API endpoints | AUTH_QUICK_REFERENCE.md | API Endpoints Summary |
| Understand database | AUTH_IMPLEMENTATION.md | Prisma Schema |

---

## Support

If you need to:
- **Understand how auth works** → Read AUTH_IMPLEMENTATION.md (section 15)
- **Find code quickly** → Use AUTH_CODE_MAP.md (Functions Location Map)
- **Test or debug** → Use AUTH_QUICK_REFERENCE.md
- **Add new feature** → Use AUTH_CODE_MAP.md (Code Patterns)
- **See full details** → Cross-reference all three docs

---

**Last Updated:** November 3, 2025
**System:** Historian Authentication (Session-Based)
**Status:** Fully functional for production use (with recommended improvements)
