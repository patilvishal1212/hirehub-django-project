# HireHub - Frontend Audit & Gap Analysis Report

## 1. Frontend Audit Report

An in-depth code review of the current `frontend` repository reveals the following structural, architectural, and UI issues that need immediate correction.

### 🔴 Critical Issues
1. **Bad Component Structure:** 
   Auth pages (`Register.jsx`, `Login.jsx`) are monolithic. Input fields and buttons are not abstracted into reusable components (e.g., `<InputField />`, `<PrimaryButton />`). This leads to massive repetition of Tailwind classes across forms.
2. **Missing Pages & Suboptimal Routing:** 
   The application only has `/login` and `/` (which maps to `<Register />`). The core application pages (Dashboards, Job Listings) do not exist yet. The root path (`/`) must point to a Landing Page or Job Board, not Registration.
3. **Improper State Management:** 
   JWT Tokens returned on login (`data.token`) are merely `console.log`ged. There is no global `AuthContext` or `Zustand` store tracking the logged-in user, and the token is not saved to `localStorage`.
4. **Missing Authentication Guards:** 
   All routes are effectively public. There are no `<ProtectedRoute>` wrappers established to isolate Employer/Seeker dashboards from unauthenticated sessions.
5. **Missing Loading & Error States:** 
   Forms use blocking native browser `alert()` popups for errors and successes. There are no loading spinners on the submit buttons, meaning users can double-click and submit multiple parallel API requests.
6. **API Logic Anti-Pattern:** 
   API calls manually use `fetch("http://localhost:8000/...")` directly inside React components. No centralized `axios` instance exists, making token refresh logic and interceptors impossible to implement globally.


## 2. Backend vs Frontend Gap Analysis

Comparing the implemented frontend code to the Django backend REST structure, here is the current alignment status:

### ✅ Currently Supported Endpoints:
- `POST /api/auth/register/` (Integrated in `Register.jsx`)
- `POST /api/auth/login/` (Integrated in `Login.jsx`)

### ❌ Missing Endpoints & Required UI:
- **AUTH:**
  - `POST /api/auth/token/refresh/` (Requires Axios Interceptor logic)
  - `GET  /api/auth/me/` (Requires AuthProvider initialization logic)
  - `PATCH /api/auth/me/` (Requires a **Seeker Profile Editor Component** / form)

- **COMPANY:**
  - `POST /api/company/` (Requires an **Employer onboarding/Company Setup Page**)
  - `GET  /api/company/:id/` (Requires a **Company Profile View Page**)
  - `PATCH /api/company/:id/` (Requires a **Company Settings Form**)

- **JOBS:**
  - `GET    /api/jobs/` (Requires a **Public Job Listings Board** with search/filter UI)
  - `POST   /api/jobs/` (Requires a **Create Job Form** for Employers)
  - `GET    /api/jobs/:id/` (Requires a **Job Detail Page**)
  - `PATCH  /api/jobs/:id/` (Requires an **Edit Job Form**)
  - `DELETE /api/jobs/:id/` (Requires state mutation logic on Employer Dashboard)
  - `GET    /api/jobs/mine/` (Requires the **Employer Dashboard Job List Grid**)

- **APPLICATIONS:**
  - `POST   /api/jobs/:id/apply/` (Requires a **Job Application Modal** with resume upload)
  - `GET    /api/applications/mine/` (Requires the **Seeker Dashboard Applications Table**)
  - `GET    /api/jobs/:id/applications/` (Requires the **Employer Applicant Review UI**)
  - `PATCH  /api/applications/:id/` (Requires Accept/Reject buttons on the Applicant Review UI)


## 3. Frontend Task Roadmap

This is the recommended implementation plan for the frontend engineering team, split by phased deliveries.

### Phase 1 — Core Setup 
- **Description:** Abstract UI atoms and setup architectural foundations.
- **Required Components:** `Button`, `Input`, `Navbar`, `Footer`, `api.js` (Axios wrapper).
- **Priority Level:** 🔴 High

### Phase 2 — Authentication
- **Description:** Implement JWT handling, Auth Context, and Protected Routes.
- **Related API:** `auth/login/`, `auth/token/refresh/`, `auth/me/`
- **Required Components:** `AuthProvider`, `ProtectedRoute`, `LoginForm` (Refactor), `RegisterForm` (Refactor).
- **Priority Level:** 🔴 High

### Phase 3 — Job Browsing
- **Description:** Public landing page and job search.
- **Related API:** `GET /jobs/`, `GET /jobs/:id/`
- **Required Components:** `JobCard`, `JobDetailsPage`, `SearchBar`, `FilterSidebar`.
- **Priority Level:** 🟠 Medium

### Phase 4 — Job Application
- **Description:** Allow seekers to apply with resume handling.
- **Related API:** `POST /jobs/:id/apply/`
- **Required Components:** `ApplyModal`, `FileInput`.
- **Priority Level:** 🟠 Medium

### Phase 5 — Employer Dashboard
- **Description:** Allow companies to create jobs and review applicants.
- **Related API:** `POST/PATCH/DELETE /jobs/`, `GET /jobs/:id/applications/`, `PATCH /applications/:id/`
- **Required Components:** `EmployerSidebar`, `CreateJobForm`, `ApplicantListTable`, `ApplicantReviewCard`.
- **Priority Level:** 🟢 Normal

### Phase 6 — Seeker Dashboard
- **Description:** Application tracking and profile management.
- **Related API:** `GET /applications/mine/`, `PATCH /auth/me/`
- **Required Components:** `SeekerSidebar`, `ApplicationStatusTimeline`, `ProfileForm`.
- **Priority Level:** 🟢 Normal

### Phase 7 — File Upload System
- **Description:** Handle `multipart/form-data` for resume documents and avatars securely.
- **Related API:** Supported under `/auth/me/` and `/jobs/:id/apply/`
- **Required Components:** Custom `DropzoneLoader` component.
- **Priority Level:** 🟢 Normal

### Phase 8 — Polishing UI
- **Description:** Replace native alerts, add micro-animations, loading skeletons, and dark mode toggles.
- **Required Components:** `ToastProvider`, `SkeletonLoader`.
- **Priority Level:** 🔵 Low
