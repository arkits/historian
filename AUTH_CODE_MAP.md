# Historian Auth - Code Navigation Map

## Backend Authentication Code Flow

### 1. Server Startup & Session Initialization
```
/apps/backend/src/main.ts
├── Import express-session (line 5)
├── Import PrismaSessionStore (line 7)
├── Initialize Prisma client (line 24)
├── Create Express app (line 26)
├── Setup middleware in order:
│   ├── JSON parser
│   ├── Compression
│   ├── Cookie parser
│   ├── EXPRESS-SESSION MIDDLEWARE (lines 36-49)
│   │   ├── Session name: 'HISTORIAN_SESSION'
│   │   ├── Secret: from env.EXPRESS_SESSION_SECRET
│   │   ├── Cookie config: { httpOnly: true, maxAge: 30 days }
│   │   └── Store: PrismaSessionStore connected to PostgreSQL
│   ├── CORS (with credentials: true)
│   └── Request logger
└── Mount routers (lines 61-64)
```

### 2. Authentication Middleware
```
/apps/backend/src/lib/controllers/auth.ts
│
├── authUserSignedIn() middleware (lines 4-10)
│   ├── Check if request.session.loggedIn === true
│   ├── If false: call next({ message: 'User not logged in', code: 400 })
│   └── If true: call next() to proceed
│
└── getUserFromSession() utility (lines 12-31)
    ├── Validate session exists and is loggedIn
    ├── Get userId from session
    ├── Call getUserById() from db.ts
    └── Return user object or null
```

### 3. Route Definitions & Guards
```
/apps/backend/src/lib/router.ts
│
├── User Endpoints:
│   ├── POST /user/signup (no auth) → userSignUp
│   ├── POST /user/login (no auth) → userLogin
│   ├── GET /user (AUTH) → authUserSignedIn → getUser
│   ├── POST /user/logout (AUTH) → authUserSignedIn → userLogout
│   └── DELETE /user (AUTH) → authUserSignedIn → deleteUser
│
├── History Endpoints (all AUTH):
│   ├── GET /history → authUserSignedIn → getHistory
│   ├── GET /history/:id → authUserSignedIn → getUserHistoryById
│   └── DELETE /history/:id → authUserSignedIn → deleteUserHistory
│
└── Dashboard (AUTH):
    └── GET /ui/dashboard → authUserSignedIn → dashboardData
```

### 4. User Login Handler
```
/apps/backend/src/lib/controllers/index.ts :: userLogin (lines 55-101)

Request: { username: string, password: string }
│
├── Step 1: Validate inputs
│   └── If missing: return next({ message: 'Username and password required', code: 400 })
│
├── Step 2: Find user by username
│   ├── prisma.user.findFirst({ where: { username } })
│   └── If not found: return next({ message: 'User not found', code: 400 })
│
├── Step 3: Verify password with Argon2
│   ├── argon2.verify(user.passwordHash, password)
│   └── If invalid: return next({ message: 'Invalid password', code: 400 })
│
├── Step 4: Create session
│   ├── request.session.userId = user.id
│   ├── request.session.loggedIn = true
│   ├── request.session.save()
│   └── Session persisted to PostgreSQL by PrismaSessionStore
│
├── Step 5: Send Set-Cookie header
│   └── Browser receives: Set-Cookie: HISTORIAN_SESSION=<sid>; HttpOnly; Path=/
│
└── Response: { id, username }
```

### 5. User Signup Handler
```
/apps/backend/src/lib/controllers/index.ts :: userSignUp (lines 16-53)

Request: { username: string, password: string }
│
├── Step 1: Validate inputs
│   └── If missing: return next({ message: 'Username and password required', code: 400 })
│
├── Step 2: Hash password
│   └── passwordHash = await argon2.hash(password)
│
├── Step 3: Create user in database
│   ├── prisma.user.create({
│   │   data: { username, passwordHash, preferences: {} }
│   └── })
│   └── If error (duplicate username, etc): return next({ ... })
│
├── Step 4: Auto-login user (same as login flow)
│   ├── request.session.userId = user.id
│   ├── request.session.loggedIn = true
│   └── request.session.save()
│
└── Response: { id, username }
```

### 6. User Logout Handler
```
/apps/backend/src/lib/controllers/index.ts :: userLogout (lines 103-116)

Request: (must have valid session)
│
├── Step 1: Clear session data
│   ├── request.session.loggedIn = false
│   └── request.session.userId = null
│
├── Step 2: Destroy session from database
│   └── request.session.destroy()
│   └── PrismaSessionStore deletes from PostgreSQL
│
└── Response: { message: 'User logged out' }
```

### 7. Protected Route Handler Example
```
/apps/backend/src/lib/controllers/index.ts :: getUser (lines 118-134)

Request flow:
│
├── Step 1: authUserSignedIn middleware validates session
│   ├── Checks request.session.loggedIn === true
│   └── If not logged in: next({ message: 'User not logged in', code: 400 })
│
├── Step 2: If middleware passes, getUser() executes
│   ├── Query: prisma.user.findFirst({ where: { id: request.session.userId } })
│   ├── If not found: return next({ message: 'User not found', code: 400 })
│   └── If found: continue
│
└── Response: { id, username }
```

### 8. Database Models
```
/apps/backend/prisma/schema.prisma

User Model (lines 29-35):
├── id: UUID (primary key)
├── username: String (unique)
├── passwordHash: String (Argon2 hash)
├── History: Relation[]
└── preferences: JSON (for extensibility)

Session Model (lines 37-42):
├── id: String (primary key)
├── sid: String (unique session ID)
├── data: String (serialized session data: { loggedIn, userId })
└── expiresAt: DateTime (auto-cleaned by PrismaSessionStore)
```

---

## Frontend Authentication Code Flow

### 1. App Initialization
```
/apps/frontend/pages/_app.tsx

Initialization order:
├── Setup QueryClient (TanStack React Query)
├── Create emotion cache (for CSS-in-JS)
├── Wrap app with CacheProvider
│   └── ThemeProvider
│       └── QueryClientProvider
│           └── HistorianContextProvider (line 48)
│               ├── Provides auth context to all pages
│               ├── Contains user state and setUser function
│               └── All child components can access via useContext(HistorianContext)
└── Render HistorianAppBar (nav bar with auth-aware UI)
```

### 2. Auth Context
```
/apps/frontend/context/historian.tsx

HistorianContext structure:
├── user: any (current logged-in user object or null)
├── setUser: (user: any) => void (update user state)
├── snackbarDetails: { open: boolean, message: string }
└── setSnackbarDetails: (details) => void

Provider wraps entire app:
└── All pages and components can call:
    const { user, setUser } = useContext(HistorianContext)
```

### 3. API Client Layer
```
/apps/frontend/src/fetch.ts

HTTP Configuration:
├── defaultHeaders: { 'Content-Type': 'application/json' }
├── ALL fetch calls include: credentials: 'include'
│   └── This ensures cookies are sent/received with requests
└── Base URLs from constants.tsx

Auth Functions:
├── userLogin(username, password)
│   └── POST /api/user/login
│
├── userRegister(username, password)
│   └── POST /api/user/signup
│
├── getUser()
│   └── GET /api/user (check if logged in)
│
└── userLogout()
    └── POST /api/user/logout

All other API functions (getHistory, getDashboardData, etc.):
└── Use credentials: 'include' for automatic cookie submission
```

### 4. Login Page Flow
```
/apps/frontend/pages/login/index.tsx

1. Component Mount:
   ├── Create state: loginError
   ├── Access context: { user, setUser }
   └── useEffect runs (lines 31-41)

2. useEffect on mount (check if already logged in):
   ├── Call getUser()
   ├── If result.id exists:
   │   ├── setUser(result)
   │   └── router.push('/dashboard') - redirect
   └── If error or no id: stay on login page

3. Form Submission (handleSubmit):
   ├── Get username and password from form
   ├── Call userLogin(username, password)
   │   └── Sends POST /api/user/login
   │   └── Automatically includes credentials
   ├── On success:
   │   ├── If response.error: show error message
   │   └── Else: router.reload() - full page reload
   └── On error: console.log error

4. Component Render:
   ├── If not logged in (user is null/falsy):
   │   ├── Show login form
   │   ├── TextField for username
   │   ├── TextField for password (type="password")
   │   └── Submit button
   └── Show LoginError component if error exists
```

### 5. Register Page Flow
```
/apps/frontend/pages/register/index.tsx

Similar to login, but:
├── Call userRegister() instead of userLogin()
├── userRegister() sends POST /api/user/signup
├── On success:
│   ├── setUser(result) - immediately set user
│   └── router.push('/dashboard') - redirect (no reload)
└── Auto-login happens on backend during signup
```

### 6. Logout Flow
```
/apps/frontend/pages/logout/index.tsx

1. useEffect on mount:
   ├── Call userLogout()
   │   └── POST /api/user/logout
   │   └── Server: request.session.destroy()
   │   └── Server: delete from PostgreSQL
   └── On success:
       ├── window.location.assign('/') - hard reload
       └── Clears all state and browser cache
```

### 7. Auth Guard Utility
```
/apps/frontend/src/isUserLoggedIn.ts

Function: isUserLoggedIn(router, setUser)

Execution:
├── Call getUser() → GET /api/user (with credentials)
├── If response.id exists:
│   ├── setUser(result)
│   └── Stay on current page (user authorized)
└── If error or no id:
    └── router.push('/login') - redirect to login
```

### 8. Protected Route Example - Dashboard
```
/apps/frontend/pages/dashboard/index.tsx

1. Component Mount:
   ├── Access context: { user, setUser }
   ├── Get router instance
   └── useEffect runs immediately (line 24)

2. useEffect - Auth Guard:
   ├── Call isUserLoggedIn(router, setUser)
   │   ├── Makes GET /api/user request
   │   ├── If unauthorized: router.push('/login')
   │   └── If authorized: setUser(data)
   └── Component continues to render

3. Query Data:
   ├── useQuery with queryKey: ['dashboardData']
   ├── Calls getDashboardData()
   │   └── GET /api/ui/dashboard (protected)
   │   └── Protected by authUserSignedIn middleware
   └── Response: { chartData, systemStats, recentHistory, logs }

4. Component Render:
   ├── If isLoading: show LoadingSpinner
   ├── If isError: show error message
   └── If success: render dashboard with data
```

### 9. Navigation Bar - Auth-Aware UI
```
/apps/frontend/src/components/AppBar.tsx

HistorianAppBar Component:
├── Access context: { user, setUser }
└── Render navigation bar

UserOptions Sub-Component:
├── If user is null/falsy:
│   └── Show: <Button href="/login">Login</Button>
└── If user exists:
    ├── Show: <Avatar username={user.username} />
    ├── Show menu with:
    │   ├── Settings (link to /settings)
    │   └── Logout (link to /logout)
    └── On click: handleOpenUserMenu() / handleCloseUserMenu()
```

### 10. Protected Pages Setup
```
Protected pages include:
├── /dashboard - uses isUserLoggedIn() guard
├── /timeline - uses isUserLoggedIn() guard
├── /agents - uses isUserLoggedIn() guard
├── /settings - uses isUserLoggedIn() guard
└── /history/[id] - uses isUserLoggedIn() guard

Each page:
├── Imports isUserLoggedIn from 'apps/frontend/src/isUserLoggedIn'
├── In useEffect, calls: isUserLoggedIn(router, setUser)
├── If not logged in: auto-redirects to /login
└── If logged in: renders page content
```

---

## Data Flow Diagram

### Login Request Flow
```
Frontend                         Backend
┌──────────────────┐            ┌──────────────────┐
│ Login.tsx        │            │ main.ts          │
│ handleSubmit()   │            │ Session setup    │
└────────┬─────────┘            └──────────────────┘
         │                                │
         │ userLogin(u, p)                │
         ├─────POST /api/user/login───────>
         │                         │
         │                    router.ts
         │                    ├─ Check no auth needed
         │                    └─ Call userLogin handler
         │                         │
         │                   controllers/index.ts
         │                   ├─ Find user by username
         │                   ├─ Verify password (Argon2)
         │                   ├─ Create session
         │                   ├─ Save to PostgreSQL
         │                   └─ Return user data
         │                         │
         │<────Set-Cookie header───┤
         │                         │
         │ response.json()          │
         │ { id, username }         │
         │                          │
      setUser(result)
         │
      router.reload()
         │
      Browser requests /dashboard
         │ (includes HISTORIAN_SESSION cookie)
         └─────────────────────────────>
```

### Protected Route Request Flow
```
Frontend                         Backend
┌──────────────────┐            ┌──────────────────┐
│ Dashboard.tsx    │            │ Session loaded   │
│ useQuery()       │            │ from PostgreSQL  │
└────────┬─────────┘            └──────────────────┘
         │                                │
         │ getDashboardData()             │
         ├──────GET /api/ui/dashboard────>
         │   (Cookie: HISTORIAN_SESSION)  │
         │                         │
         │                    router.ts
         │                    └─ Route requires auth
         │                         │
         │                   controllers/auth.ts
         │                   ├─ Check session.loggedIn
         │                   ├─ Check session.userId
         │                   └─ Call next() if valid
         │                         │
         │                   controllers/ui.ts
         │                   ├─ dashboardData handler
         │                   ├─ Query user data
         │                   ├─ Build response
         │                   └─ Return dashboard data
         │                         │
         │<────JSON response────────┤
         │   { chartData, stats }   │
         │                          │
      queryClient.setQueryData()
         │
      Component re-renders with data
```

---

## Key Functions Location Map

| Function | Location | Purpose |
|----------|----------|---------|
| `authUserSignedIn()` | `/apps/backend/src/lib/controllers/auth.ts` | Middleware that checks if user is logged in |
| `userLogin()` | `/apps/backend/src/lib/controllers/index.ts` | Handles login endpoint |
| `userSignUp()` | `/apps/backend/src/lib/controllers/index.ts` | Handles signup endpoint |
| `userLogout()` | `/apps/backend/src/lib/controllers/index.ts` | Handles logout endpoint |
| `getUser()` | `/apps/backend/src/lib/controllers/index.ts` | Returns current user info |
| `getUserById()` | `/apps/backend/src/lib/db.ts` | Database utility to fetch user by ID |
| `getUserFromSession()` | `/apps/backend/src/lib/controllers/auth.ts` | Extract user from session object |
| `userLogin()` | `/apps/frontend/src/fetch.ts` | Frontend API call for login |
| `userRegister()` | `/apps/frontend/src/fetch.ts` | Frontend API call for signup |
| `userLogout()` | `/apps/frontend/src/fetch.ts` | Frontend API call for logout |
| `getUser()` | `/apps/frontend/src/fetch.ts` | Frontend API call to get current user |
| `isUserLoggedIn()` | `/apps/frontend/src/isUserLoggedIn.ts` | Frontend route guard utility |
| `HistorianContextProvider` | `/apps/frontend/context/historian.tsx` | Auth context provider component |

---

## Debugging Tips

### Check if user is logged in (Frontend)
```typescript
// In any component:
const { user } = useContext(HistorianContext);
console.log('Current user:', user);
// If null: not logged in
// If object with id/username: logged in
```

### Check session in backend
```typescript
// In any route handler:
console.log('Session:', request.session);
// Should show: { loggedIn: true, userId: "..." }
```

### Verify cookies are being sent
```bash
# In browser console:
console.log(document.cookie);
# Should show: HISTORIAN_SESSION=...

# Or use curl:
curl -v http://localhost:3333/api/user
# Look for: Set-Cookie and Cookie headers
```

### Test protected routes directly
```bash
# Without session (should fail):
curl http://localhost:3333/api/user
# Response: { "error": "User not logged in" }

# With session cookie:
curl -b "HISTORIAN_SESSION=<session_id>" http://localhost:3333/api/user
# Response: { "id": "...", "username": "..." }
```

---

## Common Code Patterns

### Using Auth Context in Components
```typescript
import { useContext } from 'react';
import HistorianContext from 'apps/frontend/context/historian';

export function MyComponent() {
  const { user, setUser } = useContext(HistorianContext);
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.username}!</div>;
}
```

### Making Protected API Calls
```typescript
import { getDashboardData } from 'apps/frontend/src/fetch';

// Automatically includes credentials
getDashboardData()
  .then(res => res.json())
  .then(data => {
    // Data only returned if logged in
    // Otherwise, 400: "User not logged in"
  });
```

### Protecting Routes in Backend
```typescript
import { Router } from 'express';
import { authUserSignedIn, someHandler } from './handlers';

const router = Router();

// Protected route:
router.get('/protected-path', authUserSignedIn, someHandler);
// someHandler only runs if authUserSignedIn passes
```

### Creating Protected Routes in Frontend
```typescript
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import HistorianContext from 'apps/frontend/context/historian';
import { isUserLoggedIn } from 'apps/frontend/src/isUserLoggedIn';

export default function ProtectedPage() {
  const router = useRouter();
  const { user, setUser } = useContext(HistorianContext);
  
  useEffect(() => {
    isUserLoggedIn(router, setUser);
  }, []);
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return <div>Protected content for {user.username}</div>;
}
```
