# Historian App - Authentication Implementation Analysis

## Overview
The Historian app uses a **session-based basic authentication system** with password hashing. It's a fullstack app with Express.js backend and Next.js frontend, using PostgreSQL for persistence and Prisma ORM for data management.

---

## 1. Authentication Configuration & Initialization

### Backend Session Setup
**File:** `/Users/archit/Dev/historian/apps/backend/src/main.ts` (lines 36-49)

```typescript
app.use(
    sessions({
        name: 'HISTORIAN_SESSION',
        secret: process.env.EXPRESS_SESSION_SECRET,
        saveUninitialized: false,
        resave: true,
        cookie: { path: '/', httpOnly: true, secure: false, maxAge: ONE_DAY * 30 },
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined
        })
    })
);
```

**Key Configuration Details:**
- Session Store: `PrismaSessionStore` (stores sessions in PostgreSQL)
- Session Cookie Name: `HISTORIAN_SESSION`
- Cookie Settings:
  - `httpOnly: true` - Prevents XSS attacks from accessing cookies
  - `secure: false` - Not enforcing HTTPS (suitable for development)
  - `maxAge: ONE_DAY * 30` - Sessions expire after 30 days
- Session Cleanup: Runs every 2 minutes to clean expired sessions
- CORS with Credentials: Enabled to allow cookie transmission across origins

### Session Database Schema
**File:** `/Users/archit/Dev/historian/apps/backend/prisma/schema.prisma` (lines 37-42)

```prisma
model Session {
  id        String   @id
  sid       String   @unique
  data      String
  expiresAt DateTime
}
```

### Session Type Definitions
**File:** `/Users/archit/Dev/historian/apps/backend/src/types/express-session.d.ts`

```typescript
declare module 'express-session' {
    interface SessionData {
        loggedIn?: boolean;
        userId?: string;
    }
}
```

**Session Properties:**
- `loggedIn` - Boolean flag indicating authentication status
- `userId` - UUID of authenticated user

---

## 2. User Model & Password Management

### User Database Model
**File:** `/Users/archit/Dev/historian/apps/backend/prisma/schema.prisma` (lines 29-35)

```prisma
model User {
  id           String    @id @default(uuid()) @db.Uuid
  username     String    @unique @db.VarChar(255)
  passwordHash String    @db.VarChar(255)
  History      History[]
  preferences  Json?     @db.Json
}
```

**Key Features:**
- Unique username constraint
- Password stored as Argon2 hash (never plaintext)
- UUID primary key
- User preferences stored as JSON for extensibility

### Password Hashing Library
**Dependency:** `argon2` (v0.41.1) - Industry-standard password hashing algorithm

---

## 3. Login/Signup Endpoints & Handlers

### Backend API Endpoints
**File:** `/Users/archit/Dev/historian/apps/backend/src/lib/router.ts`

```typescript
router.post('/user/signup', userSignUp);           // Public - no auth required
router.post('/user/login', userLogin);             // Public - no auth required
router.post('/user/logout', authUserSignedIn, userLogout);  // Protected
router.get('/user', authUserSignedIn, getUser);    // Protected
router.delete('/user', authUserSignedIn, deleteUser);      // Protected
```

### Signup Handler
**File:** `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/index.ts` (lines 16-53)

```typescript
export async function userSignUp(request, response: Response, next: NextFunction) {
    const { username, password } = request.body;

    if (!username || !password) {
        return next({ message: 'Username and password are required', code: 400 });
    }

    const passwordHash = await argon2.hash(password);

    let user = null;
    try {
        user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                preferences: {}
            }
        });
    } catch (error) {
        // Handle duplicate username, etc.
        return next({ message: 'Failed to create User!', code: 400, description: error.message });
    }

    // Automatically log in after signup
    request.session.userId = user.id;
    request.session.loggedIn = true;
    request.session.save();

    response.json({
        id: user.id,
        username: user.username
    });
}
```

**Signup Flow:**
1. Validate username and password are provided
2. Hash password using Argon2
3. Create user record in database
4. Automatically set session to log user in
5. Return user ID and username

### Login Handler
**File:** `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/index.ts` (lines 55-101)

```typescript
export async function userLogin(request, response: Response, next: NextFunction) {
    const { username, password } = request.body;

    if (!username || !password) {
        return next({ message: 'Username and password are required', code: 400 });
    }

    let user = null;
    try {
        user = await prisma.user.findFirst({
            where: { username: username }
        });

        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        let isValid = false;
        try {
            isValid = await argon2.verify(user.passwordHash, password);
        } catch (error) {
            isValid = false;
        }

        if (!isValid) {
            return next({ message: 'Invalid password', code: 400 });
        }

        // Set session
        request.session.userId = user.id;
        request.session.loggedIn = true;
        request.session.save();

        logger.info(request.session, 'Session created');
    } catch (error) {
        return next({ message: 'Failed to Login User!', code: 400, description: error.message });
    }

    response.json({
        id: user.id,
        username: user.username
    });
}
```

**Login Flow:**
1. Validate credentials are provided
2. Find user by username
3. Verify password using Argon2
4. Set session flags on successful authentication
5. Return user info

### Logout Handler
**File:** `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/index.ts` (lines 103-116)

```typescript
export async function userLogout(request, response: Response, next: NextFunction) {
    try {
        logger.info(request.session, 'Logging out User');

        request.session.loggedIn = false;
        request.session.userId = null;
        request.session.destroy();

        response.status(200);
        response.json({ message: 'User logged out' });
    } catch (error) {
        logger.error(error, 'Failed to logout User!');
    }
}
```

---

## 4. Auth Middleware & Guards

### Authentication Middleware
**File:** `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/auth.ts`

```typescript
export function authUserSignedIn(request: Request, response: Response, next: NextFunction) {
    if (!request['session'].loggedIn) {
        return next({ message: 'User not logged in', code: 400 });
    } else {
        next();
    }
}

export function getUserFromSession(session) {
    if (!session || !session.loggedIn || !session.userId) {
        return null;
    }

    const user = getUserById(session.userId);
    return user || null;
}
```

**Protected Routes Using Middleware:**
```
GET  /api/user                    - authUserSignedIn required
GET  /api/history                 - authUserSignedIn required
GET  /api/history/:id             - authUserSignedIn required
DELETE /api/history/:id           - authUserSignedIn required
POST /api/user/logout             - authUserSignedIn required
DELETE /api/user                  - authUserSignedIn required
GET  /api/ui/dashboard            - authUserSignedIn required
```

### Error Handling for Auth Failures
**File:** `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/errorHandler.ts`

When auth middleware rejects a request, Express error handler returns:
```json
{
  "error": "User not logged in",
  "code": 400
}
```

---

## 5. Frontend Authentication Components

### Login Page
**File:** `/Users/archit/Dev/historian/apps/frontend/pages/login/index.tsx`

```typescript
const Login: NextPage = () => {
    const router = useRouter();
    const [loginError, setLoginError] = React.useState<string | null>(null);
    const { user, setUser } = React.useContext(HistorianContext);

    // Check if already logged in
    React.useEffect(() => {
        getUser()
            .then((response) => response.json())
            .then((result) => {
                if (result?.id) {
                    setUser(result);
                    router.push('/dashboard');
                }
            })
            .catch((error) => {});
    }, [setUser]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        userLogin(data.get('username'), data.get('password'))
            .then((response) => response.json())
            .then((result) => {
                if (result?.error) {
                    setLoginError(result.error);
                } else {
                    router.reload();
                }
            })
            .catch((error) => console.log('error', error));
    };

    return (
        <Container maxWidth="md">
            {/* Form with username, password inputs */}
            <TextField name="username" label="Username" />
            <TextField name="password" label="Password" type="password" />
            <Button type="submit">Sign In</Button>
            <Button href="/register">Register</Button>
            <LoginError error={loginError} />
        </Container>
    );
};
```

**Features:**
- Auto-redirect to dashboard if already logged in
- Form submission with username/password
- Error display on failed login
- Link to registration page

### Register/Signup Page
**File:** `/Users/archit/Dev/historian/apps/frontend/pages/register/index.tsx`

```typescript
const Register: NextPage = () => {
    const router = useRouter();
    const [loginError, setLoginError] = React.useState<string | null>(null);
    const { user, setUser } = React.useContext(HistorianContext);

    React.useEffect(() => {
        getUser()
            .then((response) => response.json())
            .then((result) => {
                if (result?.id) {
                    setUser(result);
                    router.push('/dashboard');
                }
            })
            .catch((error) => {});
    }, [setUser]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        userRegister(data.get('username') as string, data.get('password') as string)
            .then((response) => response.json())
            .then((result) => {
                if (result?.error) {
                    setLoginError(result.error);
                } else {
                    setUser(result);
                    router.push('/dashboard');
                }
            })
            .catch((error) => console.log('error', error));
    };

    return (
        <Container maxWidth="sm">
            {/* Registration form */}
        </Container>
    );
};
```

**Features:**
- Auto-redirect if already logged in
- Username and password inputs
- Creates account and auto-logs in user
- Error handling and display

### Logout Page
**File:** `/Users/archit/Dev/historian/apps/frontend/pages/logout/index.tsx`

```typescript
const About: NextPage = () => {
    const router = useRouter();

    React.useEffect(() => {
        userLogout()
            .then((response) => response.json())
            .then((result) => {
                window.location.assign('/');  // Full page reload to clear state
            })
            .catch((error) => console.log('error', error));
    }, []);

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Logging out!
            </Typography>
        </Container>
    );
};
```

**Features:**
- Calls logout endpoint
- Full page reload to clear session and state
- Redirects to home page

---

## 6. Auth State Management

### Frontend Context API
**File:** `/Users/archit/Dev/historian/apps/frontend/context/historian.tsx`

```typescript
interface HistorianContextInterface {
    user: any;
    setUser: (user: any) => void;
    snackbarDetails: any;
    setSnackbarDetails: (snackbarDetails: any) => void;
}

const HistorianContext = createContext({} as HistorianContextInterface);

export const HistorianContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [snackbarDetails, setSnackbarDetails] = useState({
        open: false,
        message: ''
    });

    return (
        <HistorianContext.Provider value={{ user, setUser, snackbarDetails, setSnackbarDetails }}>
            {children}
        </HistorianContext.Provider>
    );
};
```

**State Management:**
- Uses React Context API (not Redux)
- `user` object stores logged-in user info
- `setUser` function updates auth state
- Wrapped in `HistorianContextProvider` at app level

### Frontend Context Provider
**File:** `/Users/archit/Dev/historian/apps/frontend/pages/_app.tsx` (line 48)

```typescript
<HistorianContextProvider>
    <HistorianAppBar />
    <HistorianSnackbar />
    <Component {...pageProps} />
</HistorianContextProvider>
```

---

## 7. Session & Cookie Management

### Session Storage
- **Type:** Server-side sessions with database persistence
- **Store:** PostgreSQL via Prisma
- **Cookie Name:** `HISTORIAN_SESSION`
- **Cookie Duration:** 30 days
- **Cookie Security:** httpOnly (prevents JS access)

### Cookie Details
```javascript
cookie: { 
    path: '/', 
    httpOnly: true,     // XSS protection
    secure: false,      // Set to true in production for HTTPS-only
    maxAge: ONE_DAY * 30
}
```

### Frontend API Calls
**File:** `/Users/archit/Dev/historian/apps/frontend/src/fetch.ts`

All API calls include `credentials: 'include'` to automatically send cookies:

```typescript
export function userLogin(username: string, password: string) {
    return fetch(`${baseUrl}/user/login`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',  // Include cookies in request
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
}

export function getUser() {
    return fetch(`${baseUrl}/user`, {
        method: 'GET',
        redirect: 'follow',
        headers: defaultHeaders,
        credentials: 'include'  // Include cookies in request
    });
}

export function userLogout() {
    return fetch(`${baseUrl}/user/logout`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include'  // Include cookies in request
    });
}
```

---

## 8. Route Protection & Authentication Guards

### Frontend Protected Routes
**File:** `/Users/archit/Dev/historian/apps/frontend/src/isUserLoggedIn.ts`

```typescript
export function isUserLoggedIn(router, setUser) {
    return getUser()
        .then((response) => response.json())
        .then((result) => {
            if (result?.id) {
                setUser(result);
            } else {
                router.push('/login');
            }
        })
        .catch((error) => {
            router.push('/login');
        });
}
```

**Usage Example:** `/Users/archit/Dev/historian/apps/frontend/pages/dashboard/index.tsx`

```typescript
const Dashboard: NextPage = () => {
    const router = useRouter();
    const { user, setUser } = React.useContext(HistorianContext);
    
    useEffect(() => {
        isUserLoggedIn(router, setUser);  // Check auth on page load
    }, []);

    // ... rest of component
};
```

**Protected Pages:**
- `/dashboard`
- `/timeline`
- `/agents`
- `/settings`
- `/history/[id]`

### Backend Protected Routes
Middleware `authUserSignedIn` protects all data endpoints:

```typescript
router.get('/user', authUserSignedIn, getUser);
router.get('/history', authUserSignedIn, getHistory);
router.get('/ui/dashboard', authUserSignedIn, dashboardData);
// ... etc
```

---

## 9. Navigation & Conditional Rendering

### App Bar Component
**File:** `/Users/archit/Dev/historian/apps/frontend/src/components/AppBar.tsx`

```typescript
const UserOptions = ({ user }) => {
    if (!user) {
        return (
            <Button component={Link} noLinkStyle href={'/login'}>
                Login
            </Button>
        );
    }

    return (
        <Box>
            <Avatar alt={user?.username.toUpperCase()} />
            <Menu>
                <MenuItem href={'/settings'}>Settings</MenuItem>
                <MenuItem href={'/logout'}>Logout</MenuItem>
            </Menu>
        </Box>
    );
};

const HistorianAppBar = () => {
    const { user, setUser } = React.useContext(HistorianContext);
    
    return (
        <AppBar position="static">
            {/* ... navbar content ... */}
            <UserOptions user={user} />
        </AppBar>
    );
};
```

**Conditional Rendering:**
- Shows Login button when not authenticated
- Shows user avatar and menu (Settings, Logout) when authenticated

---

## 10. Error Handling

### Backend Error Handler
**File:** `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/errorHandler.ts`

```typescript
interface ErrorResponse {
    message: string;
    code: number;
    description?: string;
}

export default function errorHandler(error: ErrorResponse, request: Request, response: Response, next) {
    logger.error(error, 'ErrorHandler caught an error!');
    response.status(error.code || 500);
    response.json({
        error: error.message,
        description: error?.description
    });
}
```

### Frontend Error Handling

Login/Register pages display errors:

```typescript
const [loginError, setLoginError] = React.useState<string | null>(null);

// ... 

.then((result) => {
    if (result?.error) {
        setLoginError(result.error);  // Display to user
    } else {
        router.reload();
    }
})
```

**Common Error Messages:**
- "User not found" - Login with non-existent username
- "Invalid password" - Wrong password
- "Username and password are required" - Missing credentials
- "Failed to create User!" - Signup with duplicate username or DB error

---

## 11. Security Features

### Implemented
1. **Password Hashing:** Argon2 (industry-standard, resistant to GPU/ASIC attacks)
2. **HTTPOnly Cookies:** Prevents XSS access to session cookies
3. **Session Middleware:** Automatic session validation on protected routes
4. **Database-Backed Sessions:** Sessions persisted in PostgreSQL, not memory
5. **CORS with Credentials:** Properly configured to allow cross-origin cookie submission
6. **Error Messages:** Detailed logging for debugging, generic user messages

### Not Implemented (Consider for Production)
1. **HTTPS Enforcement:** `secure: false` in cookie config (development setting)
2. **CSRF Protection:** No CSRF tokens implemented
3. **Rate Limiting:** No login attempt limiting (vulnerable to brute force)
4. **Password Requirements:** No minimum length/complexity validation
5. **2FA/MFA:** No multi-factor authentication
6. **Password Reset:** No password recovery flow
7. **Account Lockout:** No account locking after failed attempts
8. **Email Verification:** No email confirmation for signup
9. **JWT Tokens:** Using session cookies instead of JWTs (OK for server-side sessions)
10. **Audit Logging:** Limited auth event logging

---

## 12. File Structure Summary

### Backend Auth Files
- `/Users/archit/Dev/historian/apps/backend/src/main.ts` - Session initialization
- `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/auth.ts` - Auth middleware
- `/Users/archit/Dev/historian/apps/backend/src/lib/controllers/index.ts` - Login/signup/logout handlers
- `/Users/archit/Dev/historian/apps/backend/src/lib/router.ts` - Route definitions with auth guards
- `/Users/archit/Dev/historian/apps/backend/src/lib/db.ts` - Database utilities (getUserById)
- `/Users/archit/Dev/historian/apps/backend/src/types/express-session.d.ts` - Session type definitions
- `/Users/archit/Dev/historian/apps/backend/prisma/schema.prisma` - User and Session models

### Frontend Auth Files
- `/Users/archit/Dev/historian/apps/frontend/pages/login/index.tsx` - Login page
- `/Users/archit/Dev/historian/apps/frontend/pages/register/index.tsx` - Registration page
- `/Users/archit/Dev/historian/apps/frontend/pages/logout/index.tsx` - Logout page
- `/Users/archit/Dev/historian/apps/frontend/src/fetch.ts` - API client with auth endpoints
- `/Users/archit/Dev/historian/apps/frontend/context/historian.tsx` - Auth state context
- `/Users/archit/Dev/historian/apps/frontend/src/isUserLoggedIn.ts` - Auth guard utility
- `/Users/archit/Dev/historian/apps/frontend/pages/_app.tsx` - App wrapper with context provider
- `/Users/archit/Dev/historian/apps/frontend/src/components/AppBar.tsx` - Conditional nav bar rendering

---

## 13. Key Dependencies

```json
{
  "express": "^4.21.2",
  "express-session": "^1.18.1",
  "@quixo3/prisma-session-store": "^3.1.13",
  "@prisma/client": "^6.1.0",
  "argon2": "^0.41.1",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "next": "^16.0.1",
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

---

## 14. Environment Variables Required

From `/Users/archit/Dev/historian/.env`:
- `EXPRESS_SESSION_SECRET` - Secret for signing session cookies
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Backend port (defaults to 3333)

---

## 15. Authentication Flow Diagram

```
LOGIN FLOW:
┌─────────────────┐
│  Login Page     │
│  (username)     │
│  (password)     │
└────────┬────────┘
         │ POST /user/login
         ▼
┌─────────────────────────────────┐
│  Backend: userLogin()           │
│  1. Find user by username       │
│  2. Verify password (Argon2)    │
│  3. Set session.loggedIn=true   │
│  4. Set session.userId          │
│  5. Save session to PostgreSQL  │
│  6. Return user info + cookie   │
└────────┬────────────────────────┘
         │ Set-Cookie: HISTORIAN_SESSION
         ▼
┌────────────────────┐
│  Browser Stores    │
│  Session Cookie    │
└────────┬───────────┘
         │ Auto-redirect
         ▼
┌──────────────────┐
│  Dashboard Page  │
│  (Protected)     │
└──────────────────┘


SIGNUP FLOW:
┌─────────────────┐
│ Register Page   │
│ (username)      │
│ (password)      │
└────────┬────────┘
         │ POST /user/signup
         ▼
┌───────────────────────────────────────┐
│  Backend: userSignUp()                │
│  1. Hash password with Argon2         │
│  2. Create user in PostgreSQL         │
│  3. Auto-login: Set session flags     │
│  4. Save session to PostgreSQL        │
│  5. Return user info + cookie         │
└────────┬───────────────────────────────┘
         │ Set-Cookie: HISTORIAN_SESSION
         ▼
┌────────────────────────┐
│  Dashboard Page        │
│  (Auto-redirected)     │
└────────────────────────┘


PROTECTED ROUTE FLOW:
┌──────────────────────────┐
│  Browser              │
│  GET /api/history    │
│  (with cookie)       │
└──────────┬───────────────┘
           │ Cookie: HISTORIAN_SESSION
           ▼
┌───────────────────────────────────┐
│ Backend: authUserSignedIn()       │
│ 1. Check session.loggedIn=true    │
│ 2. Check session.userId exists    │
│ 3. Call next() or reject          │
└────────┬────────────────────────┘
         │
    ┌────┴──────┐
    │            │
    ▼            ▼
  ALLOW        REJECT
  Process      Return 400:
  Request      "User not
  with Auth    logged in"
    │            │
    └────┬───────┘
         ▼
  Response to Client
```

---

## 16. Summary

The Historian app implements a **straightforward session-based authentication system**:

- **Backend:** Express.js with express-session, Argon2 password hashing, Prisma ORM
- **Session Storage:** PostgreSQL-backed sessions (via @quixo3/prisma-session-store)
- **Frontend:** Next.js with React Context API for auth state
- **Security:** HTTPOnly cookies, password hashing, session middleware
- **Flow:** Login → Create session in DB → Set secure cookie → All requests include cookie → Middleware validates session

**Suitable for:** Small to medium applications with server-side rendered content

**Improvements for Production:** HTTPS enforcement, CSRF tokens, rate limiting, input validation, 2FA, email verification, and audit logging.

