# 🛠️ Software Requirements Document — SRD
## AttendX · QR-Based People & Attendance Management System

**Version:** 2.0.0  
**Date:** 2026-03-28  
**Status:** Active — In Development  

> This document is the **source of truth** for all technical decisions.  
> Any AI coding tool (Antigravity or otherwise) must be given the relevant section of this document before writing any code for that module.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser / App)                           │
│          React 18 + Tailwind CSS (Vite)  ──  Hosted on Vercel            │
│                                                                          │
│  ┌────────────────┐ ┌─────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │  Auth / Route  │ │ QR Scanner  │ │ Sheet Viewer │ │ QR Generator  │  │
│  │  Firebase SDK  │ │ qr-scanner  │ │  + Analytics │ │ qr-code-styl. │  │
│  └───────┬────────┘ └──────┬──────┘ └──────┬───────┘ └──────┬────────┘  │
│          │                 │               │                │            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │   Animation Layer: GSAP (routes/pages) + Framer Motion (components)│  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │  HTTPS (Axios + Firebase ID token)
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                                │
│              Python 3.11  ──  Hosted on Hugging Face Spaces (Docker)     │
│                                                                          │
│  /api/auth  /api/sheets  /api/attendance  /api/admin  /api/qr            │
│                                                                          │
│  dependencies.py → verifies Firebase ID token on every protected request │
└───────────────────┬───────────────────────┬──────────────────────────────┘
                    │                       │
          ┌─────────▼──────────┐   ┌────────▼──────────────────────────┐
          │  Firebase          │   │  Google Sheets API v4              │
          │  - Firestore DB    │   │  via gspread + google-auth-oauthlib│
          │  - Firebase Auth   │   │  OAuth2 | Service Account | Link   │
          └────────────────────┘   └────────────────────────────────────┘
```

---

## 2. Folder Structure

### 2.1 Frontend

```
attendx-frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json           # PWA manifest (Phase 6)
│   └── icons/                  # App icons (192, 512)
│
├── src/
│   ├── assets/
│   │   ├── fonts/              # Custom font files (not Inter/Roboto)
│   │   └── images/             # Static images, logo placeholder
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                 # Primitive, reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx       # Attendance % color badge (green/amber/red)
│   │   │   ├── Card.jsx        # Base card wrapper
│   │   │   ├── Modal.jsx       # Full-screen modal with Framer Motion animation
│   │   │   ├── BottomSheet.jsx # Slides up from bottom (mobile panels)
│   │   │   ├── Input.jsx       # Styled input with label + error state
│   │   │   ├── Select.jsx      # Styled dropdown
│   │   │   ├── Slider.jsx      # Range slider (QR logo opacity)
│   │   │   ├── Toast.jsx       # Notification toast (Framer Motion)
│   │   │   ├── Tooltip.jsx     # Hover tooltip
│   │   │   ├── ColorSwatch.jsx # Color picker (8 swatches for attendance values)
│   │   │   ├── DragList.jsx    # Drag-to-reorder list (attendance values config)
│   │   │   └── ConfirmDialog.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── PageShell.jsx   # Root wrapper: sidebar (desktop) or bottom nav (mobile)
│   │   │   ├── BottomNav.jsx   # Mobile 4-tab bottom navigation
│   │   │   ├── Sidebar.jsx     # Desktop left sidebar (≥1024px)
│   │   │   ├── TopBar.jsx      # Page-level top bar (back button, title, actions)
│   │   │   └── ProtectedRoute.jsx  # Wraps routes — checks auth + status + role
│   │   │
│   │   ├── sheets/
│   │   │   ├── SheetCard.jsx        # Pill card (per wireframe)
│   │   │   ├── SheetSetupWizard.jsx # Multi-step setup (6 steps)
│   │   │   ├── StepConnectSheet.jsx # Step 1: OAuth or paste link
│   │   │   ├── StepNameSheet.jsx    # Step 2: name the sheet
│   │   │   ├── StepSetPK.jsx        # Step 3: primary key column
│   │   │   ├── StepMapQR.jsx        # Step 4: QR key mapping
│   │   │   ├── StepAttendanceValues.jsx  # Step 5: configure values
│   │   │   └── StepConfirm.jsx      # Step 6: review + save
│   │   │
│   │   ├── attendance/
│   │   │   ├── QRScanner.jsx        # Camera feed + qr-scanner integration
│   │   │   ├── ScannerOverlay.jsx   # Toast overlay on scanner (errors/success)
│   │   │   ├── ScannedCard.jsx      # Individual scanned student card
│   │   │   ├── ManualEntryPanel.jsx # Bottom sheet: grouped list + search
│   │   │   ├── StudentRow.jsx       # Row in manual entry (ID, name, value buttons)
│   │   │   ├── GroupHeader.jsx      # Collapsible group header in manual entry
│   │   │   ├── AttendanceValueButtons.jsx  # Renders value buttons per sheet config
│   │   │   └── NewStudentModal.jsx  # Add student mid-session
│   │   │
│   │   ├── students/
│   │   │   ├── StudentCard.jsx      # Card in student list (name, %, QR download)
│   │   │   └── StudentSearch.jsx    # Search input + filter logic
│   │   │
│   │   ├── qr/
│   │   │   ├── QRCard.jsx           # Single QR preview card
│   │   │   ├── QRGrid.jsx           # Grid of all QRs
│   │   │   ├── LogoUpload.jsx       # Logo file input + opacity slider
│   │   │   ├── ExcelUpload.jsx      # .xlsx/.csv drag-drop upload
│   │   │   └── ColumnMapper.jsx     # Map Excel cols to QR fields
│   │   │
│   │   ├── charts/
│   │   │   ├── SessionBarChart.jsx  # recharts: sessions over time (stacked bars)
│   │   │   ├── DistributionDonut.jsx # recharts: value distribution donut
│   │   │   ├── StudentTable.jsx     # Sortable attendance % table
│   │   │   └── SummaryCards.jsx     # 4 stat cards at top of analytics
│   │   │
│   │   └── admin/
│   │       ├── OrgCard.jsx
│   │       ├── UserRow.jsx
│   │       ├── PendingCard.jsx
│   │       └── AuditRow.jsx
│   │
│   ├── pages/
│   │   ├── Landing.jsx          # Public landing page
│   │   ├── Login.jsx            # Email + Google sign-in
│   │   ├── Register.jsx         # Email registration form
│   │   ├── GoogleSetup.jsx      # One-time: org name for Google users
│   │   ├── PendingApproval.jsx  # Shown while status = pending
│   │   ├── Disabled.jsx         # Shown when status = disabled
│   │   ├── Dashboard.jsx        # Recent sheets + all sheets
│   │   ├── SheetSetup.jsx       # New sheet wizard page wrapper
│   │   ├── StudentList.jsx      # All students for a sheet
│   │   ├── TakeAttendance.jsx   # QR scanner page
│   │   ├── SheetSettings.jsx    # Sheet config + attendance values
│   │   ├── Analytics.jsx        # Charts and table for a sheet
│   │   ├── QRGeneratorPage.jsx  # QR generation page
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── OrgList.jsx
│   │       ├── OrgDetail.jsx
│   │       ├── PendingUsers.jsx
│   │       ├── AllUsers.jsx
│   │       └── AuditLog.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # Firebase auth state + Firestore status polling
│   │   ├── useSheet.js             # Sheet CRUD (calls sheetsService)
│   │   ├── useStudents.js          # Fetch + filter + group students
│   │   ├── useAttendance.js        # Session state, mark, validate
│   │   ├── useQRScanner.js         # qr-scanner lifecycle (start/stop/pause/resume)
│   │   ├── useQRGenerator.js       # qr-code-styling + logo compositing
│   │   ├── useAnimation.js         # GSAP page entrance helpers
│   │   └── useBreakpoint.js        # Returns current breakpoint (mobile/tablet/desktop)
│   │
│   ├── services/
│   │   ├── api.js                  # Axios instance: baseURL, token interceptor, 401 handler
│   │   ├── firebase.js             # Firebase app init, auth, Google provider
│   │   ├── sheetsService.js        # All /api/sheets/* calls
│   │   ├── attendanceService.js    # All /api/attendance/* calls
│   │   ├── adminService.js         # All /api/admin/* calls
│   │   └── qrService.js            # All /api/qr/* calls + client-side QR gen wrapper
│   │
│   ├── store/                      # Zustand global state
│   │   ├── authStore.js            # { user, role, org_id, status }
│   │   ├── sheetStore.js           # { sheets, activeSheet, students, sessions }
│   │   └── sessionStore.js         # { scannedIds, sessionDate, markedValues }
│   │
│   ├── utils/
│   │   ├── qrParser.js             # JSON.parse + validate payload (§6.2 rules)
│   │   ├── colorCode.js            # attendance % → Tailwind color class
│   │   ├── excelParser.js          # SheetJS: .xlsx/.csv → JS array of objects
│   │   ├── dateUtils.js            # ISO date helpers, column name detection
│   │   ├── groupBy.js              # Group array of objects by any key
│   │   └── attendanceCalc.js       # Calculate % per student across sessions
│   │
│   ├── constants/
│   │   └── index.js
│   │       # VITE_API_BASE_URL    → from env
│   │       # DEFAULT_ATTENDANCE_VALUES (P/A default list)
│   │       # BADGE_THRESHOLDS: { green: 75, amber: 50 }
│   │       # MAX_ATTENDANCE_VALUES: 8
│   │       # MIN_ATTENDANCE_VALUES: 2
│   │       # QR_LOGO_OPACITY_WARN: 75
│   │       # SCAN_DEBOUNCE_MS: 500
│   │       # STATUS_POLL_INTERVAL_MS: 30000
│   │       # COLOR_OPTIONS: 8 color names + hex values
│   │
│   ├── App.jsx                     # Route tree + ProtectedRoute wrappers
│   ├── main.jsx                    # React DOM render + GSAP register
│   └── index.css                   # Tailwind base + CSS custom properties
│
├── .env                            # Local env vars (gitignored)
├── .env.example                    # Template for env vars
├── tailwind.config.js              # Custom colors, fonts, breakpoints
├── vite.config.js
└── package.json
```

### 2.2 Backend

```
attendx-backend/
├── app/
│   ├── main.py                 # FastAPI init, CORS, router mounts, keep-alive /ping
│   ├── config.py               # pydantic-settings: all env vars as typed Settings class
│   ├── dependencies.py         # Firebase token verify + role/status guard functions
│   │
│   ├── routers/
│   │   ├── auth.py             # POST /api/auth/register, /google-setup, GET /me, PUT /me
│   │   ├── sheets.py           # Full sheet CRUD + student CRUD + column ops
│   │   ├── attendance.py       # Validate QR, mark, session start/end, summary, analytics
│   │   ├── admin.py            # Org CRUD, user approval, audit log
│   │   └── qr.py              # Excel parse endpoint, QR payload data endpoint
│   │
│   ├── services/
│   │   ├── firebase_service.py # Firestore CRUD: users, sheets, orgs, sessions
│   │   ├── sheets_service.py   # gspread: all Google Sheet read/write operations
│   │   ├── email_service.py    # SMTP email: approval, rejection, welcome
│   │   └── excel_service.py    # openpyxl: parse uploaded Excel file to row list
│   │
│   ├── schemas/                # Pydantic v2 models (request bodies + responses)
│   │   ├── user.py
│   │   ├── org.py
│   │   ├── sheet.py            # Includes AttendanceValueSchema
│   │   ├── attendance.py
│   │   └── qr.py
│   │
│   └── utils/
│       ├── qr_validator.py     # validate_qr_payload() — matches PRD §6.2 exactly
│       └── sheet_helpers.py    # is_date_column(), extract_sheet_id_from_url()
│
├── requirements.txt
├── .env
├── .env.example
└── Dockerfile
```

---

## 3. Firestore Schema (Exact Field Names — Do Not Deviate)

### 3.1 Collection: `users`
```json
{
  "uid": "string (Firebase UID — document ID)",
  "email": "string",
  "name": "string",
  "org_name": "string",
  "org_id": "string (reference to orgs collection — auto-created on registration)",
  "role": "string — enum: user | admin | superadmin",
  "status": "string — enum: active | disabled",
  "auth_provider": "string — enum: email | google",
  "created_at": "Firestore Timestamp",
  "disabled_at": "Firestore Timestamp | null",
  "disabled_by": "string (superadmin uid) | null"
}
```
> `role` values: `"user"` | `"admin"` | `"superadmin"`  
> `status` values: `"active"` | `"disabled"` — **NO `"pending"` (D-22 locked).**  
> All self-registered users are created with `status: "active"` immediately.  
> `"disabled"` is only ever set by the Super Admin via the admin panel.

### 3.2 Collection: `orgs`
```json
{
  "org_id": "string (auto-generated document ID)",
  "name": "string",
  "description": "string",
  "owner_uid": "string (Firebase UID of the user who registered — also the org owner)",
  "created_at": "Firestore Timestamp",
  "sheet_count": "number (incremented/decremented by backend on sheet add/remove)"
}
```
> Every org is auto-created at user registration using the user's `org_name`.  
> `owner_uid` is the user who created it.  
> If an Admin-role user is later assigned to manage this org, a separate `admin_assignments` collection handles that relationship (not in v1.0 scope — Admin role is platform-level only in v1.0).

### 3.3 Collection: `sheets`
```json
{
  "sheet_id": "string (auto-generated document ID)",
  "owner_uid": "string",
  "org_id": "string",
  "display_name": "string (name shown in AttendX — may differ from Google Sheet title)",
  "google_sheet_id": "string (the ID portion of the Google Sheet URL)",
  "sheet_url": "string (full URL)",
  "access_method": "string — enum: oauth | service_account | manual_link",
  "primary_key_column": "string (exact header name in the sheet, e.g. 'Roll No')",
  "qr_key_mapping": {
    "roll_no": "Roll No",
    "name": "Name",
    "batch": "Batch"
  },
  "attendance_values": [
    {
      "label": "Present",
      "value": "P",
      "color": "green",
      "is_positive": true
    },
    {
      "label": "Absent",
      "value": "A",
      "color": "red",
      "is_positive": false
    }
  ],
  "created_at": "Firestore Timestamp",
  "last_accessed": "Firestore Timestamp"
}
```

> **`attendance_values` rules:**  
> - Always an array. Minimum 2 items.  
> - At least 1 item with `is_positive: true`.  
> - At least 1 item with `is_positive: false`.  
> - Maximum 8 items.  
> - `value` field: max 3 characters, alphanumeric only, uppercase.  
> - `label` field: max 15 characters.  
> - `color` field: one of `["green","red","amber","blue","slate","coral","violet","teal"]`.  
> - QR default value = first item where `is_positive === true`.

### 3.4 Collection: `attendance_sessions`
```json
{
  "session_id": "string (auto-generated document ID)",
  "sheet_id": "string",
  "org_id": "string",
  "owner_uid": "string",
  "date": "string (YYYY-MM-DD — same as the column name written to sheet)",
  "column_name": "string (YYYY-MM-DD)",
  "total_students": "number",
  "value_counts": {
    "P": 30,
    "A": 8,
    "L": 2
  },
  "scanned_ids": ["CS001", "CS002"],
  "manually_marked_ids": ["CS015"],
  "unmarked_default": "absent | empty",
  "created_at": "Firestore Timestamp",
  "ended_at": "Firestore Timestamp | null"
}
```

> `value_counts`: a map of each attendance value to how many students received it in this session.  
> `unmarked_default`: the choice the user made at end-session prompt — `"absent"` means unmarked students were written the first `is_positive: false` value; `"empty"` means their cells were left blank.

---

## 4. API Endpoints — Complete Contract

All protected endpoints require: `Authorization: Bearer {firebase_id_token}` header.

### 4.1 Auth (`/api/auth`)

| Method | Path | Body | Response | Auth |
|--------|------|------|----------|------|
| POST | `/api/auth/register` | `{ name, org_name, email }` | `{ uid, status }` | No |
| POST | `/api/auth/google-setup` | `{ name, org_name }` | `{ uid, status }` | Yes (Google token) |
| GET | `/api/auth/me` | — | Full user object (see §3.1) | Yes |
| PUT | `/api/auth/me` | `{ name?, org_name? }` | Updated user object | Yes |

> `/api/auth/register` is called AFTER Firebase creates the account. It creates the Firestore doc. The Firebase UID is extracted from the verified token (so no `uid` in the request body — it comes from the token).

### 4.2 Admin (`/api/admin`)

| Method | Path | Body | Response | Auth |
|--------|------|------|----------|------|
| GET | `/api/admin/orgs` | — | Array of org objects | Admin |
| POST | `/api/admin/orgs` | `{ name, description }` | New org object | Admin |
| GET | `/api/admin/orgs/{org_id}` | — | Org + users + sheets + stats | Admin |
| PUT | `/api/admin/orgs/{org_id}` | `{ name?, description? }` | Updated org | Admin |
| DELETE | `/api/admin/orgs/{org_id}` | — | `{ deleted: true }` | Admin |
| GET | `/api/admin/pending` | — | Array of pending user objects | Admin |
| POST | `/api/admin/approve/{uid}` | — | `{ uid, status: "active" }` | Admin |
| POST | `/api/admin/reject/{uid}` | `{ reason? }` | `{ uid, rejected: true }` | Admin |
| GET | `/api/admin/users` | `?org_id=&status=` | Array of user objects | Admin |
| PUT | `/api/admin/users/{uid}/disable` | — | `{ uid, status: "disabled" }` | Admin |
| DELETE | `/api/admin/users/{uid}` | — | `{ deleted: true }` | Admin |
| PUT | `/api/admin/users/{uid}/move-org` | `{ org_id }` | Updated user | Admin |
| GET | `/api/admin/stats` | — | `{ orgs, users, sheets, sessions }` | Admin |
| GET | `/api/admin/audit` | `?org_id=&from=&to=` | Array of session summaries | Admin |

### 4.3 Sheets (`/api/sheets`)

| Method | Path | Body | Response | Auth |
|--------|------|------|----------|------|
| GET | `/api/sheets` | — | All sheets for user (sorted by last_accessed DESC) | Yes |
| GET | `/api/sheets/recent` | — | Last 5 sheets (same sort) | Yes |
| POST | `/api/sheets` | Sheet setup payload (see below) | New sheet object | Yes |
| GET | `/api/sheets/{sheet_id}` | — | Sheet object | Yes |
| PUT | `/api/sheets/{sheet_id}` | Partial sheet config | Updated sheet | Yes |
| DELETE | `/api/sheets/{sheet_id}` | — | `{ deleted: true }` | Yes |
| GET | `/api/sheets/{sheet_id}/students` | — | Array of student objects (no attendance cols) | Yes |
| POST | `/api/sheets/{sheet_id}/students` | Student row + session config | `{ added: true }` | Yes |
| GET | `/api/sheets/{sheet_id}/columns` | — | `{ all_headers, non_attendance, attendance_dates }` | Yes |
| POST | `/api/sheets/{sheet_id}/verify-access` | `{ sheet_url }` | `{ writable: bool, error?: string }` | Yes |
| PUT | `/api/sheets/{sheet_id}/attendance-values` | `{ attendance_values: [...] }` | Updated values array | Yes |
| POST | `/api/sheets/connect-google` | `{ code }` (OAuth code from frontend) | `{ connected: true }` | Yes |

**Sheet setup payload (POST /api/sheets):**
```json
{
  "display_name": "Morning Batch 2026",
  "sheet_url": "https://docs.google.com/spreadsheets/d/...",
  "access_method": "manual_link",
  "primary_key_column": "Roll No",
  "qr_key_mapping": { "roll_no": "Roll No", "name": "Name" },
  "attendance_values": [
    { "label": "Present", "value": "P", "color": "green", "is_positive": true },
    { "label": "Absent",  "value": "A", "color": "red",   "is_positive": false }
  ]
}
```

### 4.4 Attendance (`/api/attendance`)

| Method | Path | Body | Response | Auth |
|--------|------|------|----------|------|
| POST | `/api/attendance/validate-qr` | `{ sheet_id, payload }` | Validation result (see §5.1) | Yes |
| POST | `/api/attendance/mark` | Mark request (see below) | `{ marked: true, row_index }` | Yes |
| POST | `/api/attendance/session/start` | `{ sheet_id, date }` | Session doc or existing session | Yes |
| POST | `/api/attendance/session/end` | End-session payload (see below) | Updated session doc | Yes |
| GET | `/api/attendance/{sheet_id}/summary` | — | Array: `{ pk_value, name, percentage, session_count, value_counts }` per student | Yes |
| GET | `/api/attendance/{sheet_id}/sessions` | — | Array of session docs for this sheet | Yes |
| GET | `/api/attendance/{sheet_id}/analytics` | — | Chart-ready data (see §5.3) | Yes |

**Mark request body:**
```json
{
  "sheet_id": "firestore_sheet_id",
  "pk_value": "CS001",
  "date_column": "2026-03-28",
  "attendance_value": "P"
}
```

**End-session payload (`POST /api/attendance/session/end`):**
```json
{
  "session_id": "firestore_session_doc_id",
  "sheet_id": "firestore_sheet_id",
  "date_column": "2026-03-28",
  "scanned_ids": ["CS001", "CS002"],
  "manually_marked_ids": ["CS015"],
  "value_counts": { "P": 30, "A": 8, "L": 2 },
  "unmarked_default": "empty",
  "absent_value": "A"
}
```

> **`unmarked_default` logic (executed by backend):**  
> - `"empty"`: do nothing — unmarked cells remain blank (no write).  
> - `"absent"`: get all PK values from the sheet → subtract `scanned_ids` → for each remaining ID, call `mark_attendance(pk_value, date_column, absent_value)` in a single batch write (`ws.batch_update()`), not one-by-one.  
> - `absent_value`: the `value` field of the first `is_positive: false` item in the sheet's `attendance_values` config (sent by frontend, confirmed from Firestore before writing).  
> - After writes complete: update Firestore session doc with `ended_at`, `value_counts`, `unmarked_default`.

### 4.5 QR (`/api/qr`)

| Method | Path | Body | Response | Auth |
|--------|------|------|----------|------|
| POST | `/api/qr/parse-excel` | multipart: `.xlsx` or `.csv` file | `{ headers: [], rows: [{...}] }` | Yes |
| GET | `/api/qr/{sheet_id}/data` | — | `{ students: [{pk, name, ...}], qr_key_mapping }` | Yes |

> QR image generation (including logo compositing) is entirely client-side. Backend only supplies data.

### 4.6 Health (`/ping`)

| Method | Path | Response | Auth |
|--------|------|----------|------|
| GET | `/ping` | `{ status: "ok", timestamp }` | No |

> The frontend pings this endpoint on app load to warm the Hugging Face Space.

---

## 5. Core Logic Implementations

### 5.1 QR Validation (`app/utils/qr_validator.py`)

This function MUST produce error messages that match PRD §6.2 exactly.

```python
from typing import Optional

def validate_qr_payload(
    payload: dict,
    pk_column_key: str,         # QR key name for PK (e.g., "roll_no")
    sheet_column_keys: list[str] # All QR key names mapped (non-PK)
) -> dict:
    """
    Returns:
    {
        "valid": bool,
        "pk_value": Optional[str],
        "missing_fields": list[str],   # populated even if valid=True
        "error": Optional[str]         # only set if valid=False
    }
    """
    result = {
        "valid": False,
        "pk_value": None,
        "missing_fields": [],
        "error": None
    }

    if pk_column_key not in payload:
        result["error"] = "Invalid QR — Primary key not found"
        return result

    pk_value = str(payload[pk_column_key]).strip()
    if not pk_value:
        result["error"] = "Invalid QR — Primary key is empty"
        return result

    result["pk_value"] = pk_value
    result["valid"] = True

    for key in sheet_column_keys:
        if key not in payload:
            result["missing_fields"].append(key)

    return result
```

### 5.2 QR Frontend Parser (`src/utils/qrParser.js`)

```javascript
/**
 * Parses the raw string from a QR scan.
 * Returns { valid: bool, data?: object, error?: string }
 * Error messages must match PRD §6.2 exactly.
 */
export function parseQRData(rawString) {
  let parsed;
  try {
    parsed = JSON.parse(rawString);
  } catch {
    return { valid: false, error: 'Invalid QR — Unrecognized format' };
  }

  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    return { valid: false, error: 'Invalid QR — Unrecognized format' };
  }

  return { valid: true, data: parsed };
}
```

### 5.3 Analytics Data Shape (from GET `/api/attendance/{sheet_id}/analytics`)

```json
{
  "sessions": [
    {
      "date": "2026-03-20",
      "value_counts": { "P": 30, "A": 8, "L": 2 },
      "total": 40
    }
  ],
  "overall_value_totals": { "P": 150, "A": 40, "L": 10 },
  "student_summary": [
    {
      "pk_value": "CS001",
      "name": "Riya Sharma",
      "percentage": 87.5,
      "positive_count": 7,
      "total_sessions": 8
    }
  ],
  "attendance_values": [
    { "label": "Present", "value": "P", "color": "green", "is_positive": true },
    { "label": "Absent", "value": "A", "color": "red", "is_positive": false }
  ]
}
```

> The frontend uses `attendance_values` from this response to correctly color-code chart segments.

### 5.4 Grouping Logic (`src/utils/groupBy.js`)

```javascript
/**
 * Groups an array of student objects by a specified key.
 * Returns: { "Morning": [...students], "Evening": [...students] }
 * Ungrouped students (key missing or empty) go under "Other".
 */
export function groupStudentsBy(students, key) {
  if (!key) return { 'All Students': students };
  return students.reduce((groups, student) => {
    const groupName = student[key] || 'Other';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(student);
    return groups;
  }, {});
}

/**
 * Detects which columns have repeated values (i.e., are groupable).
 * A column is groupable if: it has at least 2 distinct values, and
 * at least 2 students share one value.
 */
export function detectGroupableColumns(students, allColumns) {
  return allColumns.filter(col => {
    const values = students.map(s => s[col]).filter(Boolean);
    const unique = new Set(values);
    return unique.size >= 2 && unique.size < students.length;
  });
}
```

### 5.5 Attendance Percentage Calculation (`src/utils/attendanceCalc.js`)

```javascript
/**
 * Calculates attendance percentage for one student.
 * Positive sessions = sessions where the student's value has is_positive: true.
 */
export function calcAttendancePercent(studentValues, attendanceValueConfig) {
  const positiveValues = new Set(
    attendanceValueConfig
      .filter(v => v.is_positive)
      .map(v => v.value)
  );

  let positive = 0;
  let total = 0;

  for (const val of Object.values(studentValues)) {
    if (val !== '' && val !== null && val !== undefined) {
      total++;
      if (positiveValues.has(val)) positive++;
    }
  }

  return total === 0 ? 0 : Math.round((positive / total) * 100);
}
```

### 5.6 QR Scanner Hook (`src/hooks/useQRScanner.js`)

```javascript
import QrScanner from 'qr-scanner';
import { useRef, useEffect, useCallback } from 'react';
import { SCAN_DEBOUNCE_MS } from '../constants';

export function useQRScanner({ videoRef, onScan, active = true }) {
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({});  // { [pk_value]: timestamp }

  const handleResult = useCallback((rawData) => {
    // Debounce: ignore same value within SCAN_DEBOUNCE_MS window
    const now = Date.now();
    if (lastScannedRef.current[rawData] &&
        now - lastScannedRef.current[rawData] < SCAN_DEBOUNCE_MS) {
      return;
    }
    lastScannedRef.current[rawData] = now;
    onScan(rawData);
  }, [onScan]);

  useEffect(() => {
    if (!videoRef.current) return;
    const scanner = new QrScanner(
      videoRef.current,
      (result) => handleResult(result.data),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
        maxScansPerSecond: 5,
      }
    );
    scannerRef.current = scanner;

    if (active) scanner.start();

    return () => scanner.destroy();
  }, [videoRef, handleResult, active]);

  const pause = useCallback(() => scannerRef.current?.stop(), []);
  const resume = useCallback(() => scannerRef.current?.start(), []);

  return { pause, resume };
}
```

### 5.7 Session State (sessionStorage)

The current attendance session is stored in `sessionStorage` (survives page refresh, cleared when tab closes):

```javascript
// Key: "session_{sheet_id}_{date}"
// Value:
{
  "sheet_id": "abc123",
  "date": "2026-03-28",
  "scanned_ids": ["CS001", "CS002"],
  "marked_values": {
    "CS001": "P",
    "CS002": "L"
  }
}
```

> `scanned_ids` is used to detect duplicates before hitting the backend.  
> `marked_values` is used to show the highlighted state in the manual entry panel.

### 5.8 Google Sheets Service (`app/services/sheets_service.py`)

```python
import re
import gspread
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
]

DATE_COL_REGEX = re.compile(r'^\d{4}-\d{2}-\d{2}$')

def is_date_column(header: str) -> bool:
    return bool(DATE_COL_REGEX.match(header))

def extract_sheet_id_from_url(url: str) -> str:
    """Extracts the Google Sheet ID from a full URL."""
    match = re.search(r'/spreadsheets/d/([a-zA-Z0-9_-]+)', url)
    if not match:
        raise ValueError("Not a valid Google Sheet URL")
    return match.group(1)

class SheetsService:

    def build_client(self, oauth_tokens: dict) -> gspread.Client:
        creds = Credentials(
            token=oauth_tokens["access_token"],
            refresh_token=oauth_tokens["refresh_token"],
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=SCOPES
        )
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Caller must save refreshed tokens back to Firestore
        return gspread.authorize(creds)

    def verify_write_access(self, sheet_id: str, client: gspread.Client) -> bool:
        """Returns True if sheet has Editor access. Raises on network errors."""
        try:
            ws = client.open_by_key(sheet_id).sheet1
            cell_val = ws.cell(1, 1).value
            ws.update_cell(1, 1, cell_val)  # no-op write
            return True
        except gspread.exceptions.APIError as e:
            if "PERMISSION_DENIED" in str(e):
                return False
            raise  # other errors propagate up

    def get_students(self, sheet_id: str, client: gspread.Client) -> list[dict]:
        """Returns all rows with only non-attendance columns."""
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        non_att_headers = [h for h in headers if not is_date_column(h)]
        all_records = ws.get_all_records()
        return [{k: row.get(k, '') for k in non_att_headers} for row in all_records]

    def get_columns(self, sheet_id: str, client: gspread.Client) -> dict:
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        return {
            "all_headers": headers,
            "non_attendance": [h for h in headers if not is_date_column(h)],
            "attendance_dates": [h for h in headers if is_date_column(h)]
        }

    def mark_attendance(
        self,
        sheet_id: str,
        client: gspread.Client,
        pk_col: str,
        pk_value: str,
        date_col: str,
        att_value: str
    ) -> int:
        """Marks attendance. Returns the row index that was updated."""
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)

        # Create date column if it doesn't exist yet
        if date_col not in headers:
            ws.update_cell(1, len(headers) + 1, date_col)
            headers.append(date_col)

        date_col_idx = headers.index(date_col) + 1
        pk_col_idx = headers.index(pk_col) + 1

        pk_col_values = ws.col_values(pk_col_idx)
        try:
            row_idx = pk_col_values.index(str(pk_value)) + 1
        except ValueError:
            raise ValueError(f"ID '{pk_value}' not found in sheet")

        ws.update_cell(row_idx, date_col_idx, att_value)
        return row_idx

    def add_student_row(
        self,
        sheet_id: str,
        client: gspread.Client,
        row_data: dict,
        session_config: dict
    ):
        """
        session_config fields:
          current_date_col: str  — today's attendance column name
          mark_today_as: str     — attendance value to write for today ("P", "A", etc.) or None
          previous_default: str  — "absent_value" | "empty"
          absent_value: str      — the value to write for previous sessions if previous_default="absent_value"
        """
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        date_cols = [h for h in headers if is_date_column(h)]

        new_row = []
        for h in headers:
            if h in row_data:
                new_row.append(str(row_data[h]))
            elif h == session_config["current_date_col"]:
                new_row.append(session_config.get("mark_today_as") or "")
            elif h in date_cols:
                if session_config["previous_default"] == "absent_value":
                    new_row.append(session_config["absent_value"])
                else:
                    new_row.append("")
            else:
                new_row.append("")

        ws.append_row(new_row, value_input_option="RAW")
```

---

## 6. Authentication & Authorization

### 6.1 Firebase Auth Providers
- **Email/Password** — `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`
- **Google** — `GoogleAuthProvider` + `signInWithPopup`

### 6.2 Frontend Auth Service (`src/services/firebase.js`)

```javascript
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export { signInWithEmailAndPassword, createUserWithEmailAndPassword,
         onAuthStateChanged, signOut };
```

### 6.3 Axios Token Interceptor (`src/services/api.js`)

```javascript
import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(/* forceRefresh = */ false);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: force token refresh and retry once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retried) {
      error.config._retried = true;
      const token = await auth.currentUser?.getIdToken(true); // force refresh
      if (token) {
        error.config.headers.Authorization = `Bearer ${token}`;
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6.4 Backend Auth Middleware (`app/dependencies.py`)

```python
from fastapi import Header, HTTPException, Depends
from firebase_admin import auth as firebase_auth
from app.services.firebase_service import get_user_doc

async def get_current_user(authorization: str = Header(...)):
    """
    Verifies Firebase ID token. Returns user dict from Firestore.
    Raises 401 if token invalid. Raises 403 if account not active.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        decoded = firebase_auth.verify_id_token(token)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(401, "Token expired")
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(401, "Invalid token")

    user_doc = get_user_doc(decoded["uid"])
    if not user_doc:
        raise HTTPException(404, "User record not found")

    # Only "disabled" blocks access. There is no "pending" (D-22).
    if user_doc["status"] == "disabled":
        raise HTTPException(403, detail={"code": "account_disabled"})

    return {**user_doc, "uid": decoded["uid"]}

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("admin", "superadmin"):
        raise HTTPException(403, "Admin access required")
    return current_user

async def require_superadmin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "superadmin":
        raise HTTPException(403, "Superadmin access required")
    return current_user
```

### 6.5 RBAC Summary

| Role | Can Access |
|------|-----------|
| `user` | Own sheets, own students, own attendance sessions, own analytics, own QR generation |
| `admin` | All user permissions + all orgs they manage + their users + approve/reject + audit log |
| `superadmin` | Everything — all orgs, all users, all sessions, admin management |

---

## 7. Animation Implementation

### 7.1 GSAP — Page-Level Animations

GSAP is registered in `main.jsx` and used for entrance animations when a route loads.

```javascript
// src/hooks/useAnimation.js
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePageEntrance() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Stagger fade-in for direct children
      gsap.fromTo(
        '[data-animate]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return containerRef;
}
```

Usage: Wrap each page's root element in `containerRef`. Add `data-animate` to elements to stagger.

**GSAP use cases by page:**
- Dashboard: stagger sheet cards on load
- Analytics: counter animation on summary cards (count up from 0)
- Student List: stagger student cards
- QR grid: stagger QR cards on generation complete

### 7.2 Framer Motion — Component Animations

```javascript
// Standard card hover variant (used on SheetCard, StudentCard)
const cardVariants = {
  rest: { scale: 1, transition: { duration: 0.15 } },
  hover: { scale: 1.01, transition: { duration: 0.15 } },
  tap: { scale: 0.98 }
};

// Scanned card slide-in (used in TakeAttendance scanned list)
const scanCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

// Modal: slide up from bottom (mobile), fade from center (desktop)
const modalVariants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.2 } }
};

// Toast notification
const toastVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9 }
};
```

**Framer Motion use cases:**
- `SheetCard`: hover lift + tap press
- `ScannedCard`: slide-in from bottom on new scan
- `ManualEntryPanel` / `BottomSheet`: slide up from bottom
- `Modal`: enter/exit animation
- `Toast`: enter from top, auto-dismiss
- `GroupHeader`: expand/collapse (height animation)
- `AttendanceValueButtons`: active-state color transition

### 7.3 Reduced Motion

Wrap all animation configs with:
```javascript
import { useReducedMotion } from 'framer-motion';

const shouldReduce = useReducedMotion();
const animProps = shouldReduce ? {} : { variants: cardVariants, whileHover: 'hover', whileTap: 'tap' };
```

---

## 8. Responsive Layout System

### 8.0 Color Tokens — `tailwind.config.js` (D-21 Locked)

All colors come from this table. No one-off hex values in components.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg:              '#1A1A1A',   // page background
        surface:         '#242424',   // card / panel background
        'surface-raised':'#2E2E2E',   // elevated surfaces (dropdowns, tooltips)
        border:          '#333333',   // all borders and dividers
        'text-primary':  '#F5F0E8',   // main body text (warm off-white)
        'text-secondary':'#8A8480',   // muted labels and metadata
        accent:          '#F59E0B',   // amber-500 — primary actions, links, highlights
        'accent-hover':  '#FBBF24',   // amber-400 — hover state for accent elements
        'accent-dim':    '#92400E',   // amber-800 — subtle amber tint backgrounds
        danger:          '#F87060',   // coral — delete icons, destructive actions
        'danger-hover':  '#EF4444',   // red — danger hover state
        'badge-green':   '#4ADE80',   // attendance ≥75%
        'badge-amber':   '#F59E0B',   // attendance 50–74% (same as accent)
        'badge-red':     '#F87171',   // attendance <50%
      },
      fontFamily: {
        // Replace these with your chosen fonts — NOT Inter, NOT Roboto
        display: ['"Your Display Font"', 'serif'],  // bold headings, sheet names
        body:    ['"Your Body Font"', 'sans-serif'], // all body text
      },
    },
  },
};
```

```css
/* src/index.css — CSS custom properties mirror */
:root {
  --color-bg:             #1A1A1A;
  --color-surface:        #242424;
  --color-surface-raised: #2E2E2E;
  --color-border:         #333333;
  --color-text-primary:   #F5F0E8;
  --color-text-secondary: #8A8480;
  --color-accent:         #F59E0B;
  --color-accent-hover:   #FBBF24;
  --color-accent-dim:     #92400E;
  --color-danger:         #F87060;
  --color-badge-green:    #4ADE80;
  --color-badge-amber:    #F59E0B;
  --color-badge-red:      #F87171;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-body);
}
```

> **Rule:** Every component uses Tailwind classes from the token set above (`bg-surface`, `text-accent`, `border-border`, etc.). If a color is needed that isn't in the table, it must be added here first — not hardcoded inline.

### 8.1 Breakpoints (defined in `tailwind.config.js`)

```javascript
screens: {
  'sm': '480px',   // large phones
  'md': '768px',   // tablets
  'lg': '1024px',  // desktop (sidebar activates here)
  'xl': '1280px',  // wide desktop
}
```

### 8.2 Navigation

| Breakpoint | Navigation |
|-----------|-----------|
| `< lg` | Bottom navigation bar (4 tabs: Dashboard, Analytics, QR, Admin) |
| `≥ lg` | Left sidebar (fixed, 240px wide) with same links |

### 8.3 Layout Grid

| Breakpoint | Dashboard | Student List | QR Grid | Admin |
|-----------|-----------|-------------|---------|-------|
| Mobile | 1 col | 1 col | 2 col | 1 col |
| Tablet | 1 col | 1 col | 3 col | 2 col |
| Desktop | 1 col + sidebar | 1 col | 4 col | 2 col + sidebar |

### 8.4 TakeAttendance Page — Responsive

| Breakpoint | Layout |
|-----------|--------|
| Mobile | Scanner top (40%), scanned list below (60%), full width |
| Tablet | Scanner top (35%), scanned list below, wider cards |
| Desktop | Scanner left (40% of content area), scanned list right (60%), both fill height |

---

## 9. Environment Variables

### 9.1 Frontend (`.env`)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=https://your-space.hf.space
VITE_GOOGLE_CLIENT_ID=
```

### 9.2 Backend (`.env`)
```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-space.hf.space/api/sheets/oauth-callback
EMAIL_SENDER=attendx-noreply@yourdomain.com
EMAIL_PASSWORD=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=https://your-app.vercel.app
```

---

## 10. Dependencies (Locked Versions)

### 10.1 Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "firebase": "^10.12.0",
    "axios": "^1.7.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "gsap": "^3.12.0",
    "qr-scanner": "^1.4.2",
    "qr-code-styling": "^1.6.0",
    "xlsx": "^0.18.5",
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5",
    "recharts": "^2.12.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 10.2 Backend (`requirements.txt`)
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
gspread==6.1.2
google-auth==2.29.0
google-auth-oauthlib==1.2.0
firebase-admin==6.5.0
pydantic-settings==2.2.0
httpx==0.27.0
python-multipart==0.0.9
openpyxl==3.1.2
slowapi==0.1.9
```

---

## 11. Deployment

### 11.1 Frontend → Vercel
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- All `VITE_*` env vars set in Vercel project settings
- No `vercel.json` needed unless custom rewrites required

### 11.2 Backend → Hugging Face Spaces

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
```

- Space type: **Docker** (not Gradio or Streamlit)
- All env vars added as **Space Secrets** in HF settings
- HF Spaces free tier sleeps after inactivity — frontend pings `/ping` on app load

### 11.3 CORS (FastAPI `main.py`)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## 12. Error Handling Standards

| HTTP Code | Scenario | Detail Field |
|-----------|----------|-------------|
| 400 | Invalid request body / bad QR payload | Specific message from §5.1 |
| 401 | Missing, expired, or invalid Firebase token | `"Token expired"` or `"Invalid token"` |
| 403 | Account disabled | `{ "code": "account_disabled" }` |
| 403 | Insufficient role | `"Admin access required"` |
| 404 | Sheet / user / student not found | `"[Resource] not found"` |
| 409 | Student already scanned this session | `"[Name] already marked for today"` |
| 422 | Pydantic validation error | Auto-generated by FastAPI |
| 429 | Rate limit exceeded (slowapi) | `"Too many requests. Try again in [N] seconds."` |
| 500 | Google Sheets API error (non-permission) | `"Sheet sync failed. Please try again."` |
| 503 | Google OAuth token refresh failed | `"Session expired. Please reconnect your Google account."` |

**Frontend error handling rules:**
- All API errors show a toast with the `detail` message from the response.
- 401 errors trigger automatic token refresh and one retry (see §6.3).
- 403 `account_pending` redirects to `/pending-approval`.
- 503 from sheet operations shows a persistent banner: "Google connection expired. [Reconnect →]"

---

## 13. Known Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| HF Spaces cold start (~30s) | High | `/ping` on app load; "Connecting to server…" spinner with message |
| Google Sheets API rate limit | Medium | 500ms scan debounce; batch writes for bulk operations |
| Google OAuth token expiry (1hr) | Medium | Store refresh_token in Firestore; auto-refresh on Sheets API 401 |
| Camera permission denied | Medium | Specific step-by-step instructions per browser/OS; manual entry always available |
| QR not JSON format | Medium | Frontend catches and shows toast; scanner stays live |
| Session lost on page refresh | Low | sessionStorage for session state; survives refresh within same tab |
| Large sheet (1000+ rows) | Low | gspread `get_all_records()` is one API call; warn user if > 500 rows |
| QR logo reduces scannability | Low | Warning at >75% opacity; test instruction in UI |
| Duplicate PK values in sheet | Low | Detect and warn during Sheet Setup Step 3; first match is always used |

---

## 14. Firestore Security Rules (Starter)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write only their own doc
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // Only backend (service account) writes user docs
    }

    // Sheets: owner can read/write
    match /sheets/{sheetId} {
      allow read, write: if request.auth != null &&
        resource.data.owner_uid == request.auth.uid;
    }

    // Sessions: owner can read/write
    match /attendance_sessions/{sessionId} {
      allow read, write: if request.auth != null &&
        resource.data.owner_uid == request.auth.uid;
    }

    // Orgs: only admin (checked via backend — block direct client access)
    match /orgs/{orgId} {
      allow read, write: if false;
    }
  }
}
```

> All org operations go through the backend (which uses the Firebase Admin SDK and bypasses security rules). Client-side writes to `orgs` are blocked.

---

## 15. Development Phases (Strict Order — Test Each Phase Before Advancing)

### Phase 1 — Foundation & Auth (Est: 3–4 days)
- [ ] Firebase project: enable Email/Password + Google providers in console
- [ ] Firestore database: create in test mode, apply security rules
- [ ] FastAPI project init: `main.py`, `config.py`, CORS, `/ping` route
- [ ] `dependencies.py`: `get_current_user`, `require_admin`
- [ ] `POST /api/auth/register` and `POST /api/auth/google-setup`
- [ ] `GET /api/admin/pending`, `POST /api/admin/approve/{uid}`, `POST /api/admin/reject/{uid}`
- [ ] React project: Vite + Tailwind + React Router + Zustand + Framer Motion + GSAP
- [ ] `tailwind.config.js`: custom colors, fonts, breakpoints
- [ ] `src/services/firebase.js`, `src/services/api.js` (with interceptors)
- [ ] `src/store/authStore.js`
- [ ] `Login.jsx`, `Register.jsx`, `GoogleSetup.jsx`, `PendingApproval.jsx`, `Disabled.jsx`
- [ ] `ProtectedRoute.jsx` (status + role check)
- [ ] `PageShell.jsx`, `BottomNav.jsx`, `Sidebar.jsx`
- [ ] **Test:** full auth cycle — register → pending → approve → login → dashboard
- [ ] **Test:** Google Sign-In new user → org setup → pending → approve → login

### Phase 2 — Orgs & Sheet Management (Est: 3–4 days)
- [ ] `POST /api/admin/orgs`, `GET /api/admin/orgs`, `GET /api/admin/orgs/{id}`
- [ ] `POST /api/sheets` (with `verify_write_access` check)
- [ ] `GET /api/sheets`, `GET /api/sheets/recent`, `GET /api/sheets/{id}`
- [ ] `GET /api/sheets/{id}/columns`, `GET /api/sheets/{id}/students`
- [ ] `PUT /api/sheets/{id}`, `DELETE /api/sheets/{id}`
- [ ] `PUT /api/sheets/{id}/attendance-values`
- [ ] `SheetSetupWizard.jsx` (all 6 steps)
- [ ] `Dashboard.jsx` with `SheetCard.jsx` (per wireframe, Framer Motion hover)
- [ ] `StudentList.jsx` with `StudentCard.jsx` and search
- [ ] `SheetSettings.jsx` with `DragList.jsx` for attendance values
- [ ] **Test:** full sheet setup wizard → sheet appears in dashboard → students load

### Phase 3 — QR & Attendance Core (Est: 4–5 days)
- [ ] `POST /api/attendance/validate-qr`
- [ ] `POST /api/attendance/mark`
- [ ] `POST /api/attendance/session/start` and `/end`
- [ ] `src/utils/qrParser.js` (test all 8 cases from PRD §6.2)
- [ ] `src/hooks/useQRScanner.js`
- [ ] `QRScanner.jsx` + `ScannerOverlay.jsx`
- [ ] `TakeAttendance.jsx` layout (scanner + scanned list, responsive)
- [ ] `ScannedCard.jsx` with Framer Motion slide-in
- [ ] Session persistence in `sessionStorage`
- [ ] `ManualEntryPanel.jsx` with search + group-by
- [ ] `StudentRow.jsx` with `AttendanceValueButtons.jsx`
- [ ] `src/utils/groupBy.js` and `detectGroupableColumns()`
- [ ] `NewStudentModal.jsx` (both prompts)
- [ ] **Test:** QR scan all 8 validation cases → correct messages appear
- [ ] **Test:** manual entry with grouping, search, button highlight state

### Phase 4 — QR Generation (Est: 2–3 days)
- [ ] `GET /api/qr/{sheet_id}/data`
- [ ] `POST /api/qr/parse-excel`
- [ ] `src/utils/excelParser.js` (SheetJS)
- [ ] `QRGeneratorPage.jsx`, `QRCard.jsx`, `QRGrid.jsx`
- [ ] `ExcelUpload.jsx`, `ColumnMapper.jsx`
- [ ] `LogoUpload.jsx` with opacity slider + >75% warning
- [ ] `src/hooks/useQRGenerator.js` (qr-code-styling + canvas logo compositing)
- [ ] Individual download button per QR card
- [ ] Bulk ZIP download (JSZip + file-saver)
- [ ] **Test:** generate QRs from sheet → logos embed → download single + bulk ZIP

### Phase 5 — Analytics & Admin (Est: 3–4 days)
- [ ] `src/utils/attendanceCalc.js`
- [ ] `GET /api/attendance/{id}/summary`
- [ ] `GET /api/attendance/{id}/analytics`
- [ ] `Analytics.jsx` with all chart components (recharts)
- [ ] `SummaryCards.jsx` with GSAP counter animation
- [ ] Attendance % on `StudentCard.jsx` with color badges
- [ ] Admin: `AdminDashboard.jsx`, `OrgList.jsx`, `OrgDetail.jsx`
- [ ] `PendingUsers.jsx`, `AllUsers.jsx`, `AuditLog.jsx`
- [ ] Email service: approval, rejection emails via SMTP
- [ ] **Test:** analytics data matches what's in the sheet

### Phase 6 — Production Hardening (Est: 2–3 days)
- [ ] `/ping` frontend warm-up on app load (with "Warming up…" message if slow)
- [ ] `slowapi` rate limiting on FastAPI endpoints
- [ ] Google Sheets API exponential backoff (3 retries, 2s / 4s / 8s)
- [ ] Google OAuth token refresh: detect expiry, refresh via `google-auth`, save to Firestore
- [ ] Camera permission denied UX (per browser/OS instructions)
- [ ] Axios 401 retry interceptor (already in §6.3)
- [ ] Firestore security rules: finalize and test
- [ ] `prefers-reduced-motion` check on all Framer Motion components
- [ ] `manifest.json` + icons (PWA baseline)
- [ ] End-to-end test: Playwright scripts for auth flow + attendance flow
- [ ] **Test:** full flow on actual mobile device (iOS Safari + Android Chrome)

---

## 16. Anti-Hallucination Checklist

Run this before accepting any AI-generated code:

- [ ] All Firestore field names match §3 exactly (case-sensitive)
- [ ] All API paths match §4 exactly (including query params)
- [ ] QR error messages match PRD §6.2 verbatim
- [ ] `attendance_values` array always has `label`, `value`, `color`, `is_positive` fields
- [ ] `is_positive` (not `isPositive`, not `positive`, not `is_present`)
- [ ] QR generation uses `qr-code-styling` (NOT `qrcode` npm package)
- [ ] Excel parsing uses `xlsx` SheetJS (NOT `papaparse`, NOT `csv-parse`)
- [ ] Google Sheets writes use `gspread` only (NOT google-spreadsheet npm, NOT googleapis npm)
- [ ] No `localStorage` for Firebase auth tokens (Firebase SDK manages persistence)
- [ ] Session state uses `sessionStorage` with key `session_{sheet_id}_{date}`
- [ ] GSAP is used at page/route level only — NOT for individual component animations
- [ ] Framer Motion is used for components only — NOT for page transitions
- [ ] Every protected backend endpoint uses `Depends(get_current_user)`
- [ ] `firebase.js` is never modified by AI without explicit instruction
- [ ] `dependencies.py` is never modified by AI without explicit instruction

---

## 17. Antigravity (AI Coding Tool) Conventions

### 17.1 Golden Rule
Never ask Antigravity to implement any module without pasting the relevant SRD section into context. The SRD is the source of truth — not what the AI infers from context clues.

### 17.2 Always-Open Context Files

| File | Why |
|------|-----|
| `SRD.md` (this file) | All schemas, contracts, logic |
| `PRD.md` | All user flows + QR validation rules (§6.2) |
| The file currently being built | AI sees real code |
| The service file the current module calls | Prevents invented function signatures |

### 17.3 Prompt Template

```
I am building AttendX — a QR-based attendance management SaaS.
Stack: React 18 + Tailwind + GSAP + Framer Motion (Vite) → Vercel
       FastAPI (Python 3.11) → Hugging Face Spaces
       Firebase Auth + Firestore | Google Sheets API via gspread

SRD reference for this module:
[PASTE RELEVANT SRD SECTION]

Task: Build [specific component or endpoint].

Hard rules — do not violate these:
- All Firestore fields exactly as in SRD §3
- All API paths exactly as in SRD §4
- QR error messages exactly as in PRD §6.2
- Mobile-first. Width 375px. No blue/purple UI.
- GSAP: page-level only. Framer Motion: component-level only.
- QR generation: qr-code-styling (NOT qrcode)
- Sheet writes: gspread (NOT any npm google library)
- No localStorage for auth tokens
- attendance_values items always have: label, value, color, is_positive
```

### 17.4 Session Handoff Template

Paste this at the START of every new Antigravity session:

```
Continuing AttendX development (QR-based attendance SaaS).

BUILD STATUS (from SRD §15):
✅ Complete: [list phase numbers + task descriptions]
⏳ In Progress: [current task]
❌ Not started: [remaining phases]

CURRENT TASK: [Phase X, Task Y — description]
ACTIVE FILES: [list files being worked on]
SRD SECTION: [paste relevant section]

LOCKED DECISIONS (do not change):
- Firestore schemas: SRD §3
- API contracts: SRD §4
- QR validation: PRD §6.2
- attendance_values: SRD §3.3
- Animation: GSAP pages, Framer Motion components
- QR lib: qr-code-styling
- Sheet lib: gspread

Do not re-implement what is already marked ✅.
Do not invent new fields or endpoints.
```

### 17.5 Protected Files (Never Modify Without Explicit Permission)

- `src/services/firebase.js`
- `src/services/api.js` (interceptors)
- `app/dependencies.py`
- `src/utils/qrParser.js`
- `tailwind.config.js`
- `src/constants/index.js`
