# 📖 AttendX — Founder's Complete Project Guide
> **For: You (the founder) — to understand, own, and explain every part of this product**  
> **Audience: Someone who understands the product vision but wants to deeply understand the technical choices**

---

## Part 1: What Is This Product? (In Plain Language)

AttendX is a web app that makes taking attendance as fast as scanning a QR code. Your client (a teacher, HR manager, event organizer) already has their people listed in a Google Sheet. They connect that sheet to AttendX, generate QR codes for each person, and then whenever they need to take attendance, they open the app, point the camera at each person's QR, and the sheet is updated automatically.

**The magic:** The data never leaves their Google Sheet. We're not copying data into a separate database. We're just writing "P" (Present) or "A" (Absent) into the right cell. The client always has full ownership of their data.

---

## Part 2: Why Each Technology Was Chosen

This section exists so you can answer investor or developer questions confidently.

### React + Tailwind (Frontend)
**Why React?** It's the most widely-used frontend framework. Hiring developers is easier, more tutorials exist, and the ecosystem (recharts, framer-motion, qr-scanner, etc.) is mature.  
**Why Tailwind?** Instead of writing CSS files, you write class names directly in the component. This speeds up development significantly and keeps the app's styling consistent because you're constrained to a design system (your configured colors, spacing, fonts).  
**Why Vite?** It's a build tool that starts the development server almost instantly (< 1 second) compared to older tools like Create React App (5–10 seconds). Smaller, faster.

### FastAPI (Backend)
**Why FastAPI?** It's Python-based (so you can use the excellent Python Google Sheets library, `gspread`). It automatically generates API documentation. It's fast. It uses Python type hints, which means fewer bugs. It's the right balance between "batteries included" and "lightweight enough to understand."  
**Why not Node.js?** The Google Sheets API integration in Python (`gspread`) is significantly simpler and better documented than equivalent JavaScript libraries. Since Google Sheets is the core of this product, Python is the right choice.

### Firebase (Auth + Database)
**Why Firebase for auth?** Building authentication from scratch (hashing passwords, managing sessions, JWT rotation) is complex and a common source of security bugs. Firebase handles all of that. It also gives us Google Sign-In for free.  
**Why Firestore for the database?** We don't need a traditional SQL database because we're not storing the actual student data — that's in Google Sheets. We're only storing app metadata: user accounts, sheet configurations, session summaries. Firestore is perfect for this — it's a document database that scales automatically and requires zero server management.  
**Important:** Firestore is NOT where students are stored. It's where app settings live.

### Google Sheets as the Source of Truth
**Why?** Our clients already use Google Sheets. This means zero migration cost — they don't have to move data anywhere. When they stop using AttendX (worst case), their data is still in their Google Sheet, exactly as it was. This is a major selling point: **we are not a data silo**.

### Hugging Face Spaces (Backend Hosting)
**Why Hugging Face?** It's free for basic deployment. The backend isn't doing heavy computation — it's mostly forwarding requests to Google Sheets API and Firestore. For a startup in early stages, free hosting is valuable.  
**The tradeoff:** HF Spaces "sleeps" when no traffic comes in for a while, causing a ~30 second cold start. We mitigate this by pinging the backend when the app loads. If this becomes a real problem at scale, the backend can be moved to Railway, Render, or Google Cloud Run (all are simple migrations since FastAPI is just a Python app with a Dockerfile).

### GSAP + Framer Motion (Animations)
**Why two animation libraries?** They serve different purposes.  
- **GSAP** is a professional-grade animation library used in AAA websites (Apple, Awwwards winners). It handles coordinated animations across multiple elements — like making 10 cards stagger into view one by one when a page loads. It's frame-perfect and doesn't conflict with React re-renders because it runs outside React's update cycle.  
- **Framer Motion** is built for React. It handles individual component animations (a modal sliding up, a card lifting on hover, a toast fading out). It works with React's virtual DOM and knows about component mount/unmount cycles.  
Using Framer Motion for page-level stagger animations would cause performance issues. Using GSAP for component-level animations would cause conflicts with React. So we use each where it excels.

---

## Part 3: Every Feature Explained

### Authentication
- Users sign up and are **immediately active** — no waiting, no approval gate. This is intentional for a self-serve SaaS product. Friction at signup kills early adoption.
- Every new user automatically creates their own organisation using the name they provide at registration. They are the sole owner.
- **Google Sign-In:** The fastest onboarding path. One click, no password, immediately in the dashboard.
- **Email/Password:** Traditional. Good for users who prefer it or have organizational Google account restrictions.
- The only state that blocks access is `"disabled"` — which you (the Super Admin) set manually for abuse or lapsed billing. There is no "pending" state in v1.0.

### Multiple Organizations Per Admin
An admin can manage several organizations. For example: if you sell AttendX to a school chain, one account can manage "School A", "School B", "School C" — each with their own users and sheets. This is how you scale to enterprise clients.

### Multiple Sheets Per User
A teacher might manage "Class 10A", "Class 10B", "Class 11A" — each as a separate sheet. All of them are visible from the same dashboard.

### Sheet Card Design (Per Your Wireframe)
The dashboard shows sheets as pill-shaped cards on a dark background. Each card shows:
- A checkbox (for bulk selection/delete)
- The sheet name (large, prominent)
- "view" and "add+" as text actions
- Created and modified dates below
- A coral-colored trash icon on the right

This is based on the wireframe you drew. The "existing sheets" section header matches your wireframe text.

### QR Code System
- **QR Payload:** The QR code contains a JSON object (like `{"roll_no": "CS001", "name": "Riya"}`). The QR is essentially a unique business card for each person.
- **Primary Key:** One field in the JSON must match a column in the Google Sheet. This is how AttendX knows which row to update.
- **Validation:** If the QR doesn't have the primary key, it's rejected. If it has the primary key but is missing other fields, it's accepted with a warning. This way, even imperfect QRs still work for the core purpose (marking attendance).

### Configurable Attendance Values
By default, attendance is marked as "P" (Present) or "A" (Absent). But AttendX lets each sheet define its own set of values. A coaching center might add "Late" (L), "Excused" (E), or "On Duty" (OD). Each value has:
- A label (what the user sees on the button)
- A code (what gets written in the Google Sheet — kept short like "P", "L", "OD")
- A color (to make the UI visually clear)
- A "positive" flag — determines whether it counts toward the attendance percentage

The first positive value in the list is automatically used when a QR is scanned (the "QR Default").

### Manual Entry with Grouping
When the scanner isn't working (person forgot their QR, phone died), the user can tap "Manual Entry" to open a panel showing all students. Since lists can be long, students can be grouped by any column (like "Batch" — groups like "Morning", "Evening", "Weekend"). Each student row shows one button per attendance value. Tap a button to mark that person.

### QR Generation
AttendX can generate QR codes for all students from the sheet data. Optionally, the user's org logo can be placed in the center of the QR. The opacity of the logo is adjustable (too opaque and the QR becomes hard to scan — we warn the user above 75%).

Two sources: the linked Google Sheet (auto) or an Excel file upload (for cases where the sheet isn't connected yet).

### Analytics
For each sheet, AttendX shows:
- How many students attended each session (bar chart)
- Overall distribution of attendance values (donut chart — one segment per configured value)
- A ranked table of students by attendance percentage, with color-coded badges

The percentage is calculated correctly based on which values are marked "positive" — so if "Late" counts as present, it factors in.

---

## Part 4: Every File Explained

### Why These Files Exist

#### Frontend — Services (`src/services/`)

**`firebase.js`**  
Initializes the Firebase SDK. Creates the Firebase auth instance and Google Sign-In provider. Exports helper functions for signing in. This file is the foundation for all authentication — everything else imports from here. **Never let an AI rewrite this without your explicit review.**

**`api.js`**  
Creates a configured Axios instance (an HTTP client). Two key behaviors: (1) it automatically attaches the logged-in user's Firebase ID token to every API request as a header, so the backend can verify who's calling; (2) if the backend returns 401 (token expired), it automatically refreshes the token and retries the request once. Without this, users would get randomly logged out. **Never let an AI rewrite this without your explicit review.**

**`sheetsService.js`**  
All the HTTP calls that deal with sheets (create sheet, get students, get columns, etc.). Imports from `api.js`. This is where your frontend "speaks" to the backend about sheet operations.

**`attendanceService.js`**  
All HTTP calls for attendance (validate QR, mark attendance, start/end session, get analytics).

**`adminService.js`**  
All HTTP calls for admin operations (approve users, manage orgs, audit log).

**`qrService.js`**  
Two things: (1) calls the backend `/api/qr/*` endpoints to get data for QR generation; (2) wraps the `qr-code-styling` library to generate QR images with optional logo.

#### Frontend — State (`src/store/`)

**`authStore.js`**  
The "who is logged in" store. Every component that needs to know the current user, their role, or their status reads from this store. It's updated by `useAuth.js` when the Firebase auth state changes.

**`sheetStore.js`**  
The "what sheets does the user have" store. Also stores the currently-active sheet and its students list. Populated when the user navigates to a sheet.

**`sessionStore.js`**  
The "current attendance session" store. Which IDs have been scanned, what value each person was marked with, and the current date column. This is the data that also gets saved to `sessionStorage` (for page refresh persistence).

#### Frontend — Hooks (`src/hooks/`)

Hooks in React are reusable functions that encapsulate logic and can use React's state/effects system.

**`useAuth.js`**  
Listens to Firebase's auth state (logged in / logged out). When logged in, calls the backend to get the full user profile and status. Updates `authStore`. This is the "brain" that decides where to redirect the user based on their status.

**`useSheet.js`**  
Wraps `sheetsService.js` calls with loading states and error handling. Any component that needs to fetch or modify a sheet uses this hook.

**`useStudents.js`**  
Fetches the student list for a given sheet. Provides search filter and grouping functionality. Used by both `StudentList.jsx` and `ManualEntryPanel.jsx`.

**`useAttendance.js`**  
Manages the attendance session state. Handles: mark a student, check if already marked, update sessionStorage, trigger backend calls.

**`useQRScanner.js`**  
Controls the camera QR scanner lifecycle — start, stop, pause, resume. Debounces rapid scans. Calls the `onScan` callback only when a new scan is detected.

**`useQRGenerator.js`**  
Generates QR code images using `qr-code-styling`. Handles optional logo compositing using the browser's Canvas API. Returns canvas elements or blob URLs ready for download.

**`useAnimation.js`**  
GSAP helper. Provides the `usePageEntrance()` hook that stagger-animates page content when it loads. Used in Dashboard, StudentList, Analytics pages.

**`useBreakpoint.js`**  
Returns the current breakpoint string (`"mobile"`, `"tablet"`, `"desktop"`). Used by layout components to decide whether to render the sidebar or bottom nav.

#### Frontend — Utils (`src/utils/`)

**`qrParser.js`**  
One function: `parseQRData(rawString)`. Takes the raw string from a QR scan, tries to parse it as JSON, validates that it's an object (not array or primitive), returns a result object. The error messages it produces must match exactly what's defined in the PRD (§6.2). **Never rewrite this without cross-checking PRD §6.2.**

**`colorCode.js`**  
One function: takes an attendance percentage number and returns the appropriate Tailwind CSS class for coloring the badge (green, amber, or red). The thresholds are defined in `constants/index.js`.

**`excelParser.js`**  
Uses the `xlsx` (SheetJS) library to parse .xlsx and .csv files in the browser. Returns an array of row objects. Used in the QR generation Excel upload flow.

**`dateUtils.js`**  
Helpers for: formatting dates as `YYYY-MM-DD` (the attendance column name format), detecting whether a column header is a date column (using regex), formatting dates for display (dd/mm/yy).

**`groupBy.js`**  
Two functions: `groupStudentsBy()` groups an array of students by a given column key; `detectGroupableColumns()` analyzes the student list to find columns that actually make sense to group by (have repeated values but not all unique).

**`attendanceCalc.js`**  
Calculates attendance percentage for a student. Takes their attendance values across all sessions and the sheet's `attendance_values` config (to know which values are "positive"). Returns a percentage number.

#### Frontend — Components (`src/components/`)

**`ui/` folder** — These are "dumb" components. They don't know about the app's data. They just render UI. The `Button`, `Input`, `Modal`, `Badge`, `Toast`, etc. Every page uses these building blocks. Changing one here changes the look everywhere.

**`layout/` folder** — Page structure components. `PageShell` is the wrapper for every page — it renders either the sidebar (desktop) or bottom nav (mobile) and the main content area. `ProtectedRoute` is a guard — if you're not logged in / not the right role, you get redirected before the page even loads.

**`sheets/` folder** — Components specific to the sheet setup flow. The wizard is split into individual step components so each step can be worked on independently.

**`attendance/` folder** — The most important folder for the core feature.
- `QRScanner.jsx`: The actual camera feed component. Uses `useQRScanner.js`.
- `ScannerOverlay.jsx`: Toast messages shown over the scanner (success, error, warning).
- `ScannedCard.jsx`: One card per successfully scanned student, shown in the scrollable list below the scanner.
- `ManualEntryPanel.jsx`: The "open from bottom" panel with search + grouped student list.
- `StudentRow.jsx`: One row in the manual entry panel.
- `AttendanceValueButtons.jsx`: The row of buttons (Present, Absent, Late, etc.) shown per student in manual entry.
- `GroupHeader.jsx`: The collapsible section header when students are grouped.
- `NewStudentModal.jsx`: The form to add a new student mid-session.

**`qr/` folder** — Components for the QR generation page.

**`charts/` folder** — All analytics chart components (using recharts).

#### Frontend — Pages (`src/pages/`)

Pages are the top-level views. Each page composes multiple components together and is connected to a URL route.

| Page | Route | What It Shows |
|------|-------|--------------|
| `Landing.jsx` | `/` | Public landing page for the product |
| `Login.jsx` | `/login` | Sign-in options (Google + email/password) |
| `Register.jsx` | `/register` | New account form |
| `GoogleSetup.jsx` | `/google-setup` | First-time Google user org setup |
| `PendingApproval.jsx` | `/pending-approval` | "Waiting for approval" screen |
| `Disabled.jsx` | `/disabled` | "Account disabled" screen |
| `Dashboard.jsx` | `/dashboard` | All sheets, recent + full list |
| `SheetSetup.jsx` | `/sheets/new` | 6-step wizard page |
| `StudentList.jsx` | `/sheets/:id/students` | All students for one sheet |
| `TakeAttendance.jsx` | `/sheets/:id/attendance` | QR scanner + scanned list |
| `SheetSettings.jsx` | `/sheets/:id/settings` | Sheet config + attendance values |
| `Analytics.jsx` | `/sheets/:id/analytics` | Charts and stats |
| `QRGeneratorPage.jsx` | `/sheets/:id/qr` | QR generation |
| `admin/*` | `/admin/*` | All admin pages |

#### Backend Files

**`main.py`**  
The entry point. Creates the FastAPI app, configures CORS (which websites are allowed to call this API), and connects all the routers (sub-apps). Also has the `/ping` health-check route.

**`config.py`**  
All environment variables are typed here as a Settings class. Any other file that needs an env var imports from `config.py` — never reads `os.environ` directly. This makes it impossible to forget an env var (it would fail on startup).

**`dependencies.py`**  
The security layer. Every protected API endpoint calls `get_current_user` (from this file) as a prerequisite. It verifies the Firebase token, checks the user's status in Firestore, and rejects the request if the account is pending or disabled. This is the line of defense between the internet and your data. **Never let an AI rewrite this without your review.**

**`routers/auth.py`**  
Handles user registration and profile. When a user registers, the Firebase account already exists — this router just creates the matching Firestore document.

**`routers/sheets.py`**  
Everything related to managing sheets: creating, reading, updating, deleting. Also verifies write access before registering a sheet.

**`routers/attendance.py`**  
The most-used router. Handles QR validation, marking attendance in the Google Sheet, and session management.

**`routers/admin.py`**  
Admin-only operations: approve users, manage orgs, view audit logs.

**`routers/qr.py`**  
Handles Excel file uploads for QR generation, and provides student data formatted for QR generation.

**`services/firebase_service.py`**  
All Firestore read/write operations. The rest of the code never talks to Firestore directly — it goes through this service. This means if we ever change the database, we change only this file.

**`services/sheets_service.py`**  
All Google Sheets operations via `gspread`. Reading students, writing attendance marks, adding new rows, verifying access. The most critical service — this is where data actually flows in and out of Google Sheets.

**`services/email_service.py`**  
Sends emails via SMTP. Currently two emails: "account approved" and "account rejected". In production, should use a proper email service like SendGrid or Resend.

**`utils/qr_validator.py`**  
The Python equivalent of the frontend's `qrParser.js`. Validates a QR payload against the sheet's primary key configuration. The error messages must match PRD §6.2 exactly — these same errors are shown to the user.

**`utils/sheet_helpers.py`**  
Two small helper functions used throughout the backend: `is_date_column()` (checks if a header string is a date in YYYY-MM-DD format) and `extract_sheet_id_from_url()` (gets the Google Sheet ID from a URL).

---

## Part 5: How to Run the Project

### Running the Backend Locally

```bash
cd attendx-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up env vars
cp .env.example .env
# → Fill in .env with real values

# Run
uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs` (auto-generated by FastAPI — very useful)

### Running the Frontend Locally

```bash
cd attendx-frontend

# Install dependencies
npm install

# Set up env vars
cp .env.example .env
# → Fill in .env (VITE_API_BASE_URL should be http://localhost:8000 for local dev)

# Run
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Part 6: How to Deploy

### Backend → Hugging Face Spaces

1. Create a new Space at huggingface.co → choose **Docker** SDK
2. Clone the Space repo, copy your backend code into it, push
3. Go to Space Settings → Secrets → add all variables from `.env`
4. Space automatically builds and runs your Dockerfile
5. Your API is at: `https://your-username-your-space.hf.space`

### Frontend → Vercel

1. Push your frontend code to GitHub
2. Go to vercel.com → New Project → import your GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. Environment Variables: add all `VITE_*` variables from `.env`
5. Deploy → Vercel gives you a URL like `https://attendx.vercel.app`

**After deploying backend:** Update `VITE_API_BASE_URL` in Vercel to point to your HF Spaces URL.  
**After deploying frontend:** Update `FRONTEND_URL` in HF Spaces secrets to your Vercel URL.

---

## Part 7: How to Onboard a New Developer

Give them these files in this order:
1. **This file (USER_GUIDE.md)** — so they understand what they're building and why
2. **PRD.md** — the full product spec (what it does)
3. **SRD.md** — the full technical spec (how it's built)
4. **BUILD_GUIDE.md** — the task tracker (what's done and what's next)

Tell them:
- **Never rewrite** `firebase.js`, `api.js`, or `dependencies.py` without checking with you first
- All Firestore field names are in SRD §3 — don't invent new ones
- All API endpoint paths are in SRD §4 — don't create new ones without adding them here
- Run the anti-hallucination checklist in SRD §16 before submitting any code for review

---

## Part 8: Investor & Demo Talking Points

| Question | Answer |
|----------|--------|
| "What makes you different from Google Forms?" | "Google Forms asks every student to fill out a form manually. AttendX scans a QR in under a second. For a class of 60 students, we save 30+ minutes per session." |
| "What about Excel/other databases?" | "AttendX works on top of your existing Google Sheet. You don't move your data anywhere. We're the front-end layer, not a data replacement." |
| "What happens if someone loses their QR code?" | "The manual entry option — the teacher can search by name and mark attendance with one tap." |
| "What if the camera doesn't work?" | "Manual entry is always available. It's a designed fallback, not an afterthought." |
| "How do you handle 'Late' vs 'Absent' distinction?" | "Each organization configures their own attendance values. Late can count toward attendance percentage. Excused can be tracked separately. It's fully flexible." |
| "How do you handle data privacy?" | "The student data never touches our servers. It lives in the organization's own Google Sheet. We only write to it, we don't copy or store it." |
| "Is signup instant?" | "Yes — self-serve, no approval required. You're in the dashboard within 30 seconds of signing up." |
| "What's your business model?" | "SaaS — per seat or per org per month. The Admin role (managing multiple orgs) is a paid tier. Solo users on the free/basic tier manage their own org." |
| "How does it scale?" | "Frontend on Vercel (CDN, scales globally). Backend on Hugging Face now, easy to migrate to any Docker host as we grow. Google Sheets API is the constraint — handled with retry logic and debouncing." |

---

## Part 9: Things You Own as Founder (Non-Negotiable Decisions)

These are decisions locked in the PRD. If a developer (or AI tool) suggests changing them, you need to explicitly approve:

1. **Student data lives in Google Sheets, NOT Firestore** — this is a core product promise
2. **Users are self-approved — no gating on sign-up** — friction kills SaaS growth. Disable manually if needed.
3. **QR generation is client-side only** — logos never touch the server, protecting user branding data
4. **Read+write Google Sheets access is required** — read-only cannot work because we write attendance
5. **Attendance values are per-sheet** — not global, because different orgs have different needs
6. **The first positive attendance value is the QR scan default** — this is a design choice, not a bug
7. **"Late" can count as positive (is_positive: true)** — configurable, not hardcoded
8. **Session state uses sessionStorage** — survives refresh but not tab close. This is intentional.
9. **Color palette is deep charcoal + warm amber** — no blue, no purple, ever (D-21)
10. **End-session prompt asks about unmarked students** — default "leave empty" (safer than auto-absent) (D-23)

---

## Part 10: Known Technical Trade-offs

| Trade-off | What We Chose | Why | Future Alternative |
|-----------|--------------|-----|-------------------|
| Backend hosting | Hugging Face Spaces (free, has cold start) | Cost at early stage | Railway, Render, Google Cloud Run at scale |
| Attendance writes | Write per scan (one API call each) | Simple, reliable | Batch writes if Google Sheets rate limit becomes a problem |
| Session persistence | sessionStorage (tab-level) | Simple, no backend needed for it | Move to backend session tracking at scale |
| QR generation | Client-side only | Keeps logos off server, reduces backend load | Could offer server-side batch generation for large orgs |
| Analytics | Read all attendance data from sheet, calculate in backend | Keeps sheets as source of truth | Cache in Firestore if sheets get large (500+ students, 100+ sessions) |
| Email | SMTP (Gmail or similar) | Simple to set up | Switch to SendGrid/Resend/Postmark in production |
