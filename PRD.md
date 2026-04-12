# 📋 Product Requirements Document — PRD
## AttendX · QR-Based People & Attendance Management System

**Version:** 2.0.0  
**Date:** 2026-03-28  
**Status:** Active — In Development  
**Author:** Founder  

---

## 1. Product Overview

### 1.1 What Is AttendX?

AttendX is a **mobile-first, responsive web application** that allows organizations to manage their members and track attendance using QR codes. The attendance data lives in a Google Sheet that the organization already owns — AttendX reads from it and writes back to it. The app is not a replacement for Google Sheets; it is the front-end layer that makes attendance management fast, visual, and error-free.

### 1.2 Problem Statement

- Manual attendance using registers is slow (one person calls out 60 names) and prone to proxy fraud.
- Existing digital tools (Google Forms, spreadsheet macros) require technical setup and provide no analytics.
- Generic attendance apps are not flexible — they don't respect organizations that already have their data structured in Google Sheets.
- There is no QR-based solution that allows orgs to define their own attendance statuses (e.g., Present / Absent / Late / On Duty).

### 1.3 Solution

AttendX provides:
1. QR scan → instant attendance mark in your existing Google Sheet.
2. Manual attendance with grouping, search, and one-tap marking.
3. Custom attendance status values (not locked to Present/Absent).
4. Full analytics — per student, per session, per sheet.
5. QR generation from your sheet data (with org logo branding).
6. Works on any device: mobile primary, tablet and desktop supported.

### 1.4 Startup Vision

AttendX is designed to be a SaaS product. Users sign up, get approved by an admin (who can manage multiple organizations), and pay per organization or per seat. The Google Sheet integration means zero migration cost for new clients — they don't need to move their data anywhere.

---

## 2. Target Users & Roles

| Role | Who They Are | What They Do |
|------|-------------|--------------|
| **Super Admin** | The platform owner (you, the founder) | Manages all admins, all orgs, platform settings, and billing. Full visibility. |
| **Super Admin** | The platform owner (you, the founder) | Full visibility over everything. Manages all orgs and all users. Can elevate users to Admin role. |
| **Admin** | A power user or enterprise reseller elevated by the Super Admin | Manages multiple organisations on behalf of others (e.g. a school chain). Sees across orgs assigned to them. This role is granted manually — not self-selected. |
| **User / Client** | A teacher, HR manager, event organizer | **Self-registers and is instantly active.** Creates their own org, manages their own sheets, takes attendance, generates QRs, views analytics. No approval wait. |

> **Key model (D-22):** Every new user is **auto-approved** on registration. They are immediately active and become the de-facto owner of their own organisation. The `Admin` role is a platform-level elevation granted by the Super Admin — not the default approval gate. There is **no pending state** for normal user registration in v1.0.

> **One User = One Org (they own).** One User can have unlimited Sheets within that Org. One Admin can manage multiple Orgs across different clients.

---

## 3. Tech Stack

| Layer | Technology | Purpose | Hosting |
|-------|-----------|---------|---------|
| Frontend | React 18 + Tailwind CSS (Vite) | UI, routing, state | Vercel |
| Animation | GSAP + Framer Motion | Page transitions, micro-interactions | (bundled) |
| Backend | Python FastAPI | API, business logic, Google Sheets bridge | Hugging Face Spaces |
| Auth | Firebase Auth (Email + Google OAuth) | Login, identity | Firebase |
| Database | Firebase Firestore | App metadata, sessions, config | Firebase |
| Sheet integration | Google Sheets API v4 via `gspread` | Read/write attendance | Google Cloud |
| QR Scanning | `qr-scanner` npm package | Camera-based QR reading | (bundled) |
| QR Generation | `qr-code-styling` npm package | QR images with logo embed | (bundled) |
| Excel Parsing | `xlsx` (SheetJS) npm package | Parse .xlsx/.csv for QR bulk gen | (bundled) |
| Bulk Download | `jszip` + `file-saver` | Zip QR images for download | (bundled) |
| Charts | `recharts` | Analytics visualizations | (bundled) |

---

## 4. Design Principles

### 4.1 Mobile-First, Responsive-Always

| Breakpoint | Layout |
|-----------|--------|
| Mobile `< 768px` | Single column, bottom navigation bar, full-width cards |
| Tablet `768px–1023px` | Two-column dashboard, bottom nav still used |
| Desktop `≥ 1024px` | Left sidebar replaces bottom nav, wider content with max-width container |

> Every component is built mobile-first. Desktop is an enhancement, not the starting point.

### 4.2 Animation Layer

- **GSAP** handles: page entrance animations, staggered list reveals, analytics counter animations, scroll-triggered effects.
- **Framer Motion** handles: individual component animations (modals, cards, toast notifications, button states, QR scanner overlay, sheet card hover).
- Both libraries coexist without conflict. GSAP runs at the page/route level; Framer Motion runs at the component level.
- Animations must not block interaction. All animations use `will-change: transform` and are hardware-accelerated.
- On mobile, reduce motion if the user has `prefers-reduced-motion: reduce` set.

### 4.3 Color & Visual Identity

**Locked palette: Deep Charcoal + Warm Amber (D-21)**

| Token | Role | Hex |
|-------|------|-----|
| `--color-bg` | Page background | `#1A1A1A` |
| `--color-surface` | Card / panel background | `#242424` |
| `--color-border` | Borders, dividers | `#333333` |
| `--color-text-primary` | Main text | `#F5F0E8` |
| `--color-text-secondary` | Muted / label text | `#8A8480` |
| `--color-accent` | Primary accent (amber) | `#F59E0B` |
| `--color-accent-hover` | Accent hover state | `#FBBF24` |
| `--color-accent-dim` | Amber on dark surface | `#92400E` |
| `--color-danger` | Delete / coral (trash icon) | `#F87060` |
| `--color-success` | ≥75% attendance badge | `#4ADE80` |
| `--color-warning` | 50–74% attendance badge | `#F59E0B` |
| `--color-error` | <50% attendance badge | `#F87171` |

These are defined as both CSS custom properties in `index.css` and as Tailwind tokens in `tailwind.config.js`. Every color used in the app must come from this table — no one-off hex values anywhere in component code.

**No blue. No purple. No gradients except amber-to-transparent on hero sections.**

### 4.4 Non-Negotiable UX Rules

- Sheet is always the source of truth. App never stores student data in Firestore — only metadata and session summaries.
- Every error message is specific and actionable. No generic "Something went wrong."
- Write-access to Google Sheet is verified before any sheet is registered. No silent failures.
- Camera permission denial shows a helpful overlay with exact fix steps, not a crash.

---

## 5. Core Concepts & Terminology

| Term | Definition |
|------|-----------|
| **Org** | An organization (e.g., "ABC Coaching"). One Admin manages one or more Orgs. |
| **Sheet** | A Google Sheet linked by the user. One User manages one or more Sheets (e.g., one per class/batch). |
| **Primary Key (PK)** | The column the user designates as the unique identifier per row (e.g., "Roll No", "Emp ID"). Set at Sheet Setup. |
| **QR Payload** | A JSON string encoded in a QR code. Must contain the PK field. Other fields optional. |
| **Attendance Column** | A date-named column (format: `YYYY-MM-DD`) in the sheet, auto-created per session. Stores attendance status values. |
| **Session** | One attendance-taking event. Tied to a date column. Summarized in a Firestore document when ended. |
| **Attendance Value** | A configurable mark that can be written into an attendance column (e.g., `P`, `A`, `L` for Late). Defined per-sheet. |
| **Positive Value** | An attendance value that counts toward the student's attendance percentage (e.g., Present, Late). |
| **Negative Value** | An attendance value that does not count toward percentage (e.g., Absent, No-Show). |
| **QR Default Value** | The attendance value automatically applied when a QR is scanned. Always the first positive value in the sheet's attendance values list. |
| **Grouping Column** | Any non-attendance column the user selects to group the manual entry list (e.g., "Batch", "Department"). |

---

## 6. QR Code Specification

### 6.1 QR Payload Format

The QR code encodes a JSON object where keys are arbitrary field names and values are strings:

```json
{
  "roll_no": "CS2024001",
  "name": "Riya Sharma",
  "batch": "Morning",
  "email": "riya@example.com"
}
```

- One key must correspond to the PK column. The user specifies this mapping during sheet setup (e.g., `"roll_no"` → `Roll No` column).
- All other keys are optional metadata fields.
- The total payload should stay under 300 characters to keep the QR scannable at small sizes.

### 6.2 QR Validation Rules — Exhaustive

| # | Scenario | Detection Method | Action |
|---|----------|-----------------|--------|
| 1 | Raw string is not valid JSON | `JSON.parse()` throws | ❌ Show: `"Invalid QR — Unrecognized format"`. Scanner stays active. |
| 2 | Parsed object is an Array or primitive, not an Object | `typeof !== 'object'` or `Array.isArray` | ❌ Show: `"Invalid QR — Unrecognized format"` |
| 3 | PK key is entirely absent from the payload | `pk_key not in payload` | ❌ Show: `"Invalid QR — Primary key not found"`. Scanner stays active. |
| 4 | PK key is present but value is empty string or null | `!payload[pk_key]` | ❌ Show: `"Invalid QR — Primary key is empty"` |
| 5 | PK value not found in the sheet's PK column | Sheet lookup fails | ❌ Show: `"ID '[value]' not found in sheet"` |
| 6 | PK found but other mapped fields are missing | Field not in payload | ⚠️ Show: `"[FieldName] not present in QR"` — still mark attendance |
| 7 | Person already marked in this session | Session scanned list | ⚠️ Show: `"[Name] already marked for today"` — no duplicate write |
| 8 | Valid scan | All above pass | ✅ Write QR Default Value to sheet. Append card to scanned list. |

> After any ❌ error, the scanner immediately resumes scanning. After any ⚠️ warning, the card is still appended (attendance still marked) with the warning shown on the card. Errors and warnings are shown as temporary toast overlays on the scanner view — they do NOT use a separate modal or block the camera.

---

## 7. Attendance Values System

### 7.1 What Are Attendance Values?

Each sheet has its own list of attendance values — the marks that can be written into an attendance column. This is configurable per sheet. The default list is:

```
1. Present  (value: "P", color: green,  is_positive: true)   ← QR Default (first positive)
2. Absent   (value: "A", color: red,    is_positive: false)
```

A user can add custom values like:

```
3. Late     (value: "L", color: amber,  is_positive: true)   ← counts toward % 
4. Excused  (value: "E", color: blue,   is_positive: false)  ← does not count
5. On Duty  (value: "OD", color: slate, is_positive: true)   ← counts toward %
```

### 7.2 Rules for Attendance Values

- **Minimum:** 2 values at all times — at least 1 positive, at least 1 negative.
- **Maximum:** 8 values (to keep the button row manageable on mobile).
- **QR Default:** Always the first value in the list where `is_positive: true`. Reordering the list changes the QR default.
- **Percentage Calculation:** `(sessions where student has a positive value) ÷ (total sessions) × 100`
- **Value string:** Maximum 3 characters (e.g., `P`, `OD`, `EXC`). Kept short for column readability in Google Sheets.
- **Label:** Maximum 15 characters (displayed on buttons in the attendance UI).
- **Color:** Selected from a fixed set of 8 safe colors (green, red, amber, blue, slate, coral, violet, teal).
- **Cannot edit or delete a value that has already been written to the Google Sheet** — the user must create a new value instead. Existing written values are left as-is in the sheet.

### 7.3 Where Are Values Configured?

In the **Sheet Settings** page (accessible from Student List via a gear icon). Changes save to Firestore and take effect immediately in all attendance sessions for that sheet.

---

## 8. User Flows — Complete & Unambiguous

### 8.1 Authentication Flow

```
App Load → Check Firebase Auth state
  │
  ├─ User is authenticated
  │    └─ Call GET /api/auth/me → get { status, role }
  │         ├─ status: "active", role: "user"        → /dashboard
  │         ├─ status: "active", role: "admin"       → /admin
  │         ├─ status: "active", role: "superadmin"  → /admin (full access)
  │         └─ status: "disabled"  → /disabled
  │              ⚠️ There is NO "pending" state for self-registered users (D-22).
  │
  └─ User is NOT authenticated → /login
       │
       ├─ [Sign in with Google]
       │    ├─ Firebase GoogleAuthProvider popup
       │    ├─ On success: check if Firestore doc exists for this uid
       │    │    ├─ Doc exists → status check (see above)
       │    │    └─ Doc does NOT exist (first-time Google user):
       │    │         └─ Redirect to /google-setup
       │    │              └─ Form: "Your Name" + "Organization Name"
       │    │                   └─ Submit → POST /api/auth/google-setup
       │    │                        └─ Creates Firestore user doc
       │    │                             status: "active" → /dashboard immediately
       │    └─ On failure: show Firebase error (specific, not generic)
       │
       ├─ [Email + Password Login]
       │    ├─ Firebase signInWithEmailAndPassword
       │    ├─ On success → GET /api/auth/me → status check (see above)
       │    └─ On failure:
       │         ├─ auth/wrong-password        → "Incorrect password"
       │         ├─ auth/user-not-found        → "No account with this email"
       │         └─ auth/too-many-requests     → "Too many attempts. Try again later."
       │
       └─ [Create Account] → /register
            └─ Form: Full Name | Organization Name | Email | Password | Confirm Password
                 └─ Validation before submit:
                      ├─ All fields required
                      ├─ Password ≥ 8 characters, 1 number, 1 uppercase
                      └─ Passwords match
                 └─ On submit: Firebase createUserWithEmailAndPassword
                      ├─ On success: POST /api/auth/register
                      │    ├─ Creates Firestore user doc → status: "active", role: "user"
                      │    ├─ Creates Firestore org doc using org_name → user is the owner
                      │    └─ Redirect directly to /dashboard (no waiting, no approval)
                      └─ On failure: show specific Firebase error
```

> **D-22 locked:** All self-registered users are immediately active. There is no approval wait. The `Disabled` screen exists only for accounts manually disabled by the Super Admin (e.g., abuse, subscription lapse).

### 8.2 Disabled Account Screen

- Shows: "Your account has been disabled. Please contact support."
- [Sign Out] button only. No other actions.
- This screen only appears if a Super Admin has set `status: "disabled"` manually.

### 8.3 Dashboard

```
Dashboard — Layout by Breakpoint:
  Mobile:  single column, bottom nav bar with 4 tabs
  Desktop: left sidebar (fixed) + content area (scrollable)

Content:
  ├─ [Section: Recent Sheets] — header text "existing sheets" (per wireframe)
  │    └─ Last 5 sheets accessed (sorted by last_accessed DESC)
  │         Each card (per wireframe design):
  │         ┌────────────────────────────────────────────────────────┐
  │         │ [ ]  Sheet Name              view   add+      [🗑️]     │
  │         │      created: dd/mm/yy    modified: dd/mm/yy           │
  │         └────────────────────────────────────────────────────────┘
  │         Interaction:
  │         ├─ Checkbox: for bulk-delete (select multiple → [Delete Selected])
  │         ├─ "view" link → /sheets/{id}/students
  │         ├─ "add+" link → /sheets/{id}/attendance
  │         └─ 🗑️ button → Confirm dialog: "Remove this sheet from AttendX?
  │                          (This will NOT delete the Google Sheet itself.)"
  │                          [Cancel] [Remove]
  │
  ├─ [Section: All Sheets] — appears below Recent Sheets
  │    └─ Full list of all user's sheets (same card design)
  │         └─ [Search bar] above the list — filters sheet names live
  │
  └─ [FAB or top-right button] + New Sheet → /sheets/new
```

### 8.4 Sheet Setup Wizard

This is a multi-step form. User cannot skip steps. Steps are shown as a numbered progress bar at the top.

```
Step 1 — Connect your sheet
  ├─ Option A: [Connect Google Account] → OAuth2 flow
  │    After connect: shows Google Drive file picker → pick a sheet
  │    OR: [Create blank sheet] → creates a new Google Sheet in Drive
  └─ Option B: [Paste sheet link] (no OAuth needed)
       └─ Field: Google Sheet URL
            → [Verify Access] button
            → Backend checks if the URL is a valid Google Sheet with Editor access
            → ✅ "Sheet connected successfully" → proceed to Step 2
            → ❌ If Viewer-only: "This sheet is view-only. Open the sheet →
                  File → Share → Share with others → Change to 'Editor' → Copy link again."
            → ❌ If not a Google Sheet URL: "This doesn't look like a Google Sheet URL.
                  URL must start with https://docs.google.com/spreadsheets/"

Step 2 — Name your sheet
  └─ Field: Sheet Name (what you'll see inside AttendX — not the Google Sheet's name)
       └─ Default: auto-filled from the Google Sheet's actual title
       → [Next]

Step 3 — Set the Primary Key column
  └─ Dropdown: select which column in the sheet is the unique identifier
       └─ Columns auto-detected from the sheet's first row (header row)
       └─ Example: if headers are [Roll No, Name, Batch, Email], user picks "Roll No"
       └─ ⚠️ Warning shown: "This column must contain unique values for every row.
            Duplicates in this column will cause attendance to mark the wrong person."
       → [Next]

Step 4 — Map QR fields
  └─ For each header column (except PK, which is already set):
       └─ [Key name in QR] input field (pre-filled with a snake_case version of the header)
            Example: "Roll No" → "roll_no", "Name" → "name"
       └─ User can edit the key name. The value in the QR must match this key exactly.
  └─ [Skip column] option for columns the user doesn't want in the QR
  → [Next]

Step 5 — Configure attendance values
  └─ Shows default values: Present (P) + Absent (A)
  └─ [+ Add Value] button → inline form:
       ├─ Label (max 15 chars, e.g., "Late")
       ├─ Value/Code (max 3 chars, e.g., "L")
       ├─ Color (pick from 8 swatches)
       └─ Count as Present? [Yes / No] (is_positive)
  └─ Drag handles to reorder
  └─ Trash icon to delete (disabled if it would leave < 1 positive or < 1 negative)
  → [Next]

Step 6 — Confirm & Save
  └─ Summary card showing all settings
  └─ [Go Back] to any step
  └─ [Finish Setup] → saves to Firestore → redirects to /sheets/{id}/students
```

### 8.5 Student List Page

```
/sheets/:sheet_id/students

Header:
  ├─ Sheet name (large)
  ├─ Student count badge (e.g., "42 students")
  ├─ ⚙️ Sheet Settings → /sheets/:id/settings
  └─ Action buttons:
       ├─ [Generate QRs] → /sheets/:id/qr
       └─ [Upload Excel → QRs] → /sheets/:id/qr?mode=excel

Search bar — filters by any field (name, PK, batch, etc.) live as user types

Student cards (scrollable list, full width):
  ┌──────────────────────────────────────────────────────────────────┐
  │  CS001   Riya Sharma         Morning   riya@x.com               │
  │  Attendance: 87%  🟢                          [Download QR]     │
  └──────────────────────────────────────────────────────────────────┘

  Badge thresholds (configurable in constants):
  ├─ 🟢 Green  = attendance% ≥ 75
  ├─ 🟡 Amber  = attendance% 50–74
  └─ 🔴 Red    = attendance% < 50

  [Download QR] on each card → instantly downloads that student's QR as PNG
```

### 8.6 Take Attendance Page

```
/sheets/:sheet_id/attendance

Layout (mobile, fixed — does NOT scroll as a whole page):
┌──────────────────────────────────────┐
│ TOP BAR (fixed, full width)          │
│ [+ New Student]  📅 Date  [✏️ Manual]│
├──────────────────────────────────────┤
│ QR SCANNER (40% of viewport height)  │
│ [live camera feed]                   │
│ [toast overlays for scan results]    │
├──────────────────────────────────────┤
│ SCANNED LIST (remaining 60%)         │
│ scrollable independently             │
│ newest entry at top                  │
└──────────────────────────────────────┘

TOP BAR details:
  ├─ [+ New Student]: opens New Student modal
  ├─ 📅 Date Selector:
  │    ├─ Defaults to today's date (YYYY-MM-DD format)
  │    ├─ Can be changed to any date (past or future)
  │    └─ This date becomes the column name written to the sheet
  └─ [✏️ Manual]: opens Manual Entry panel (see §8.7)

QR SCANNER behavior:
  ├─ Uses rear camera (environment-facing) by default
  ├─ `maxScansPerSecond: 5` — prevents duplicate rapid scans
  ├─ After valid scan: 500ms debounce before next scan accepted from same ID
  │    (prevents physical QR card from registering twice if held still)
  ├─ Scan result handling (see §6.2 for all cases):
  │    ├─ ✅ Valid: animate card into scanned list, green flash on scanner border
  │    ├─ ⚠️ Warning: amber toast for 3s (scanner does not pause)
  │    └─ ❌ Error: red toast for 3s (scanner does not pause)
  └─ Camera permission denied state:
       └─ Overlay on scanner area: "Camera access is required to scan QR codes.
          On iOS: Settings → Safari → Camera → Allow.
          On Android: tap the camera icon in the browser address bar → Allow."
          [Use Manual Entry instead] button

SCANNED LIST card format (full width, text-only):
  ┌──────────────────────────────────────────────────────┐
  │ CS001  Riya Sharma  Morning  riya@x.com   10:42:31   │
  │ [P] Present                                          │
  └──────────────────────────────────────────────────────┘
  ├─ Shows: PK value, then all non-attendance sheet columns, then scan time
  ├─ Shows: the attendance value that was written (using that value's label + color)
  └─ Cards are Framer Motion animated (slide in from bottom)

SESSION BEHAVIOR:
  ├─ Session starts the moment the user opens the Take Attendance page with a date selected
  ├─ If a column for that date already exists in the sheet, the session resumes it
  │    (existing P/A values are respected; user can overwrite by rescanning)
  ├─ Session state (which IDs are scanned) is stored in sessionStorage
  │    so a page refresh doesn't reset the scanned list (scanner stays live)
  │
  └─ END SESSION — triggered when user tries to navigate away (back button, tab switch,
       bottom nav tap, browser close). React Router's navigation blocker intercepts this.
       A bottom sheet prompt appears:
       ┌──────────────────────────────────────────────────────┐
       │  End attendance session?                             │
       │                                                      │
       │  32 marked · 8 unmarked                              │
       │                                                      │
       │  For the 8 unmarked students:                        │
       │  ○ Mark all as [Absent] (first negative value)       │
       │  ○ Leave all empty (blank cell)                      │
       │                                                      │
       │  [Stay on page]        [End Session]                 │
       └──────────────────────────────────────────────────────┘
       Rules:
       ├─ [Stay on page] cancels navigation — session continues
       ├─ [End Session]:
       │    1. Writes the selected default to all unmarked students in the sheet
       │       (batch write — one gspread call, not one per student)
       │    2. Calls POST /api/attendance/session/end with final counts
       │    3. Clears sessionStorage for this session
       │    4. Navigates to the originally-intended destination
       ├─ "32 marked · 8 unmarked" counts are derived from:
       │    total_students (from session start) minus scanned_ids.length
       ├─ Default selection: "Leave all empty" (safer default — no data written without intent)
       ├─ The prompt is NOT shown if ALL students were marked (0 unmarked)
       │    → in that case, navigate away silently and auto-end the session
       └─ Browser hard-close (tab killed): session end prompt cannot fire.
            In this case: marked students remain marked in sheet (already written).
            Unmarked students stay as whatever was in the sheet before (empty or prior value).
            Firestore session doc is NOT written. This is acceptable — data in sheet is safe.
```

### 8.7 Manual Entry Panel

The manual entry panel slides up from the bottom (bottom sheet on mobile, right sidebar on desktop) without navigating away from the Take Attendance page. The QR scanner pauses while this panel is open and resumes when it closes.

```
Manual Entry Panel:
  ├─ [Search bar] — live filter by any field (name, ID, batch, etc.)
  ├─ [Group by:] dropdown
  │    ├─ Options: "None" + all non-attendance columns that have repeated values
  │    │           (e.g., "Batch", "Department")
  │    ├─ When a column is selected: students are grouped under collapsible headers
  │    │    └─ Each group header shows: column value + count (e.g., "Morning (18)")
  │    │    └─ Groups default to expanded
  │    │    └─ Tap group header to collapse/expand
  │    └─ Grouping preference: saved per-sheet in localStorage, persists across sessions
  │
  └─ Student rows (one per person in sheet, filtered by search):
       ┌───────────────────────────────────────────────────────────┐
       │ CS001   Riya Sharma                                       │
       │ [Present]  [Absent]  [Late]  [Excused]                   │
       └───────────────────────────────────────────────────────────┘
       ├─ Shows: PK value + Name (always)
       ├─ Status buttons: one button per configured attendance value (in defined order)
       ├─ Currently-marked value is highlighted (filled/bold), others are outline
       ├─ Tapping a value that's already marked for this session → CHANGES it
       │    (overwrites the value in the sheet and updates the button highlight)
       ├─ If student not yet marked: all buttons are outline/neutral
       └─ Already-marked students show their current value highlighted
            (pulled from the session's scanned list or from the sheet if resumed)
```

### 8.8 New Student Modal (During Session)

```
New Student Modal:
  ├─ Form with one labeled input per non-attendance column (in sheet column order)
  ├─ PK field is validated: cannot be empty, cannot already exist in the sheet
  ├─ [Save & Mark Attendance] button
  │    └─ On click, shows two inline prompts (before any write):
  │         Prompt A: "Mark for today's session as:"
  │                   [dropdown with all attendance values for this sheet]
  │                   (defaults to the QR Default — first positive value)
  │         Prompt B: "For all previous sessions, show as:"
  │                   [Mark all as Absent] [Leave all empty]
  │    └─ [Confirm] → writes new row to sheet, applies attendance values
  │    └─ [Cancel] → returns to form without saving
  └─ On success: student card animates into scanned list, modal closes
```

### 8.9 Sheet Settings Page

```
/sheets/:sheet_id/settings

Sections:
  ├─ Sheet Info
  │    ├─ Sheet display name (editable)
  │    ├─ Primary Key column (shows current, cannot change — would invalidate all sessions)
  │    ├─ QR field mappings (editable)
  │    └─ Google Sheet URL (shows current, [Change Sheet] re-runs verification)
  │
  ├─ Attendance Values
  │    └─ Drag-and-drop list of all configured values
  │         Each row: [drag handle] [color swatch] [Label] [Code] [Positive?] [🗑️]
  │         ├─ [+ Add Value] → inline form (same as Sheet Setup Step 5)
  │         ├─ Drag to reorder (first positive = QR default)
  │         ├─ Delete: disabled if < 2 values remain, or if value has been written to sheet
  │         │    (if delete is disabled: tooltip explains why)
  │         └─ [Save Changes] → updates Firestore
  │
  └─ Danger Zone
       ├─ [Remove Sheet from AttendX] — does NOT delete the Google Sheet
       └─ (future: [Transfer Ownership])
```

### 8.10 QR Generation Page

```
/sheets/:sheet_id/qr

Data source (tab selector):
  ├─ [From Sheet] — auto-loads all students from the linked Google Sheet
  └─ [From Excel Upload] — shows upload area for .xlsx or .csv
       └─ On upload:
            ├─ Parse file client-side (SheetJS)
            ├─ Show detected column names
            └─ Column Mapping step:
                 ├─ For each detected Excel column: map to QR field name (or skip)
                 ├─ PK field mapping is required (highlighted)
                 └─ [Preview first 3 QRs] → live preview updates
                 → [Generate All]

QR Customization panel (right side on desktop, bottom sheet on mobile):
  ├─ [Toggle] Add org logo
  │    └─ ON: shows file upload (PNG/SVG, max 2MB) + opacity slider
  │         ├─ Opacity: 10% → 100% (slider), default 60%
  │         └─ Warning banner at >75%: "High opacity may reduce scan reliability.
  │              Always test-scan before printing."
  └─ Live preview: one sample QR updates in real time as options change

QR Grid:
  └─ All generated QRs shown in a grid (2 columns on mobile, 3 on tablet, 4 on desktop)
       Each QR card:
       ├─ QR image (generated by qr-code-styling, canvas)
       ├─ Person name below
       ├─ PK value below name
       └─ [Download] button → downloads as PNG (filename: {PK_value}_qr.png)

Download All:
  └─ [Download All as ZIP] → JSZip → filename: {sheet_name}_qrcodes_{YYYY-MM-DD}.zip
```

### 8.11 Analytics Page

```
/sheets/:sheet_id/analytics

Sheet selector dropdown at top (if user has multiple sheets)

Sections:
  ├─ Summary Cards (row of 4):
  │    ├─ Total Students
  │    ├─ Total Sessions
  │    ├─ Average Attendance %
  │    └─ Students Below 75% (count, in red)
  │
  ├─ Bar Chart: Sessions over time
  │    ├─ X axis: session dates
  │    ├─ Y axis: count of students
  │    └─ Stacked bars: one segment per attendance value (color-coded)
  │         e.g., green segment (Present), amber segment (Late), red segment (Absent)
  │
  ├─ Donut Chart: Overall distribution
  │    └─ Segments: each attendance value (using value's configured color)
  │         Total marks = sum across all sessions
  │
  └─ Student Table (sortable):
       ├─ Columns: PK | Name | [other non-attendance cols] | Attendance % | Badge
       ├─ Default sort: Attendance % ascending (lowest first = most at risk)
       ├─ Click any column header to sort
       └─ Export as CSV button (downloads the table)
```

### 8.12 Admin Flow

```
/admin — Admin Dashboard

Layout: left sidebar (always, even mobile — admin is expected to be on desktop)

Pages:
  ├─ /admin → Overview
  │    ├─ Stats cards: Total Orgs | Total Users | Total Sessions | Pending Approvals
  │    └─ Recent Activity feed (last 10 events: approvals, sessions, new sheets)
  │
  ├─ /admin/orgs → My Organizations
  │    ├─ List of all orgs this admin manages
  │    │    Each org card: Name | User Count | Sheet Count | Sessions this month
  │    ├─ [+ New Org] → form: Org Name + Description
  │    └─ [View Org] → /admin/orgs/:org_id
  │         ├─ Users tab: all users in this org, filterable, with status badges
  │         │    └─ Actions: [Disable] [Delete] [Move to Org]
  │         ├─ Sheets tab: all sheets registered by users in this org
  │         └─ Stats tab: org-level session history
  │
  ├─ /admin/pending → Pending Approvals
  │    ├─ Table: Name | Email | Org Requested | Registered Date
  │    ├─ [Approve] → activates account, sends email to user
  │    └─ [Reject] → optional reason field, sends email to user, removes doc
  │
  ├─ /admin/users → All Users
  │    ├─ Table with filter (by org, by status)
  │    └─ Actions per user: [View] [Disable] [Delete] [Move Org]
  │
  └─ /admin/audit → Audit Log
       ├─ All attendance sessions (who, sheet, org, date, present/absent count)
       ├─ Filters: Org | User | Date Range
       └─ Export as CSV
```

---

## 9. Google Sheets Integration — Detailed

### 9.1 Connection Methods

| Method | How | Access Level | Failure Handling |
|--------|-----|-------------|-----------------|
| **OAuth2** (recommended) | User clicks "Connect Google Account" → consent screen → app gets scoped access | Read + Write | Token refresh handled automatically. If refresh fails: prompt user to reconnect. |
| **Service Account** | Admin pre-provisions; user shares their sheet with the service account email as Editor | Read + Write | If sharing not done: "Please share the sheet with [service@email.com] as Editor and try again." |
| **Manual Link** (fallback) | User pastes "Anyone with the link — Editor" URL | Read + Write | If Viewer only: "Sheet is view-only. Please change sharing to Editor access." Exact steps shown. |

### 9.2 Google Sheet Structure

```
Row 1 (Headers):  Roll No | Name  | Batch | Email  | 2026-03-20 | 2026-03-25 | 2026-03-26
Row 2:            CS001   | Riya  | AM    | r@x.   | P          | A          | L
Row 3:            CS002   | Dev   | PM    | d@x.   | A          | P          | P
```

- Header row is always row 1. App never writes to any other row for headers.
- Non-attendance columns are all columns to the LEFT of the first date-format column.
- Attendance columns are any column header matching format `YYYY-MM-DD`.
- The app detects attendance columns by regex: `/^\d{4}-\d{2}-\d{2}$/`
- New attendance column is added to the right of the last existing attendance column.

### 9.3 Write-Access Verification

Before any sheet is saved:
1. Backend attempts a no-op write: reads cell A1, then writes the same value back.
2. If `PERMISSION_DENIED` error from Google API → sheet is Viewer-only → show specific error.
3. If `RESOURCE_EXHAUSTED` (rate limit) → retry after 2s, maximum 3 attempts.
4. If any other error → show the exact error message from Google API.

---

## 10. Notifications

| Trigger | Channel | Message Content |
|---------|---------|----------------|
| Account created (pending) | In-app screen | "Request submitted. Awaiting admin approval." |
| Account approved | Email to user | "Your AttendX account is approved. [Login →]" |
| Account rejected | Email to user | "Your account request was not approved. Reason: [reason or 'No reason given']." |
| Session saved | In-app toast | "Attendance saved — 32 present, 8 absent" (uses counts from Firestore session doc) |
| Student < 75% | Dashboard student card | Red badge with %. Badge is always visible, not dismissable. |
| Pending approval reminder | Email to admin (future) | Daily digest of pending approvals if count > 0. |

---

## 11. Post v1.0 Roadmap (Accepted Ideas — Future Versions)

| Feature | Target Version | Notes |
|---------|---------------|-------|
| Cross-sheet org-wide analytics | v1.1 | Aggregate across all sheets in one org |
| SMS / WhatsApp notifications | v1.1 | Twilio or MSG91 |
| PWA / Offline mode | v1.2 | Service worker + IndexedDB queue for offline attendance |
| Student self-check-in (QR display mode) | v1.2 | Org shows a QR on screen; students scan it with their own phone |
| Multi-admin per org | v1.3 | Currently one admin manages org |
| Timetable / schedule management | v2.0 | Recurring sessions, period/subject-level tracking |
| Biometric attendance | v3.0 | Separate product phase entirely |

---

## 12. Decisions Log (All Locked)

| # | Decision | Outcome |
|---|----------|---------|
| D-01 | AI coding tool | Antigravity (Cursor/Windsurf-style) — see SRD §17 |
| D-02 | Multiple sheets per user | Yes |
| D-03 | Multiple orgs per admin | Yes |
| D-04 | New student mid-session — previous attendance | User prompted: two separate choices |
| D-05 | Sheet access level required | Read + Write always. Specific error if insufficient. |
| D-06 | QR generation | Optional feature. In-app. |
| D-07 | Analytics scope | Per-sheet for v1.0 |
| D-08 | Auth methods | Email/Password + Google Sign-In (Firebase) |
| D-09 | Excel upload | Yes — .xlsx and .csv. Column mapping UI. |
| D-10 | Org logo on QR | Yes — optional. Opacity-controlled. Client-side only. |
| D-11 | Responsive design | Mobile-first. Full desktop support via sidebar layout. |
| D-12 | Animation libraries | GSAP (page/route level) + Framer Motion (component level) |
| D-13 | Attendance values | Configurable per-sheet. Default: P/A. Min 2 (1 positive + 1 negative). |
| D-14 | Manual entry grouping | By any non-attendance column. Saved per-sheet in localStorage. |
| D-15 | QR default value | Always first positive attendance value in the sheet's list. |
| D-16 | Session persistence | sessionStorage — survives page refresh within the same tab. |
| D-17 | "Late" counts as present? | YES — any value with `is_positive: true` counts toward attendance %. |
| D-18 | Grouping saved across sessions? | YES — localStorage per sheet. |
| D-19 | Dark mode toggle? | No toggle in v1.0. Committed to one dark/earthy theme. |
| D-20 | "Mark All Present" in manual entry? | No bulk-mark in v1.0. Must tap each student individually. |
| D-21 | Color palette | ✅ Deep charcoal + warm amber. Full token table in PRD §4.3 and SRD `tailwind.config.js` spec. |
| D-22 | Who approves new users? | ✅ Self-approval. Every new user is instantly active. No pending state. "Admin" role is a platform elevation granted by Super Admin only, not the default approval gate. |
| D-23 | Unmarked students on session end | ✅ Prompt on navigate-away. Options: "Mark all as [Absent]" or "Leave all empty". Default: "Leave all empty". Silent auto-end if 0 unmarked. |
