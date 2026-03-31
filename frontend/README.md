# HireHub - Frontend Architecture & Design System

## 1. Project Overview
HireHub is a professional hiring platform (similar to LinkedIn Jobs / Wellfound) connecting Employers with Job Seekers.
This repository contains the React-based frontend application that interfaces with the Django REST Framework backend.

## 2. Tech Stack
- **Core:** React 19 (Vite)
- **Routing:** React Router DOM v7
- **Styling:** TailwindCSS v4
- **HTTP Client:** Axios (To be configured)
- **State Management:** Context API / Zustand (To be configured)

## 3. Folder Structure
```text
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, icons, and fonts
│   ├── components/         # Reusable UI components (Buttons, Cards, Inputs)
│   ├── context/            # Global state management (AuthContext, JobContext)
│   ├── hooks/              # Custom React hooks (useAuth, useFetch)
│   ├── layouts/            # Page layouts (Navbar, Sidebar, Footer)
│   ├── pages/              # Route components
│   │   ├── auth/           # Login, Register
│   │   ├── employer/       # Employer Dashboard, Job Posting
│   │   ├── seeker/         # Seeker Dashboard, Profile
│   │   └── public/         # Landing page, Job listing
│   ├── services/           # API communication (Axios instance, endpoints)
│   ├── utils/              # Helper functions, formatters, validators
│   ├── App.jsx             # Main application router
│   ├── index.css           # Global design system & Tailwind configuration
│   └── main.jsx            # Application entry point
├── .env                    # Environment variables
├── package.json            # Project dependencies
└── vite.config.js          # Vite build configuration
```

## 4. Frontend Architecture
The frontend follows a **Feature-Based Architecture**. Components are split functionally. The application consumes REST APIs from the Django backend, maintaining a unidirectional UI data flow. State is distributed:
- **Local State** for UI toggles (React `useState`).
- **Global State** for user context and auth tokens.
- **Server State** natively managed or abstracted via API service layers.

## 5. Component Structure
- **Atoms:** Small UI components (e.g., `<Button />`, `<Input />`).
- **Molecules:** Composed UI components (e.g., `<JobCard />`, `<SearchFilter />`).
- **Organisms:** Large page sections (e.g., `<Navbar />`, `<ApplyModal />`).
- **Templates/Layouts:** Structural containers (e.g., `DashboardLayout`).

## 6. Routing Structure
**Public Pages:**
- `/` - Landing Page / Job Board
- `/jobs` - All Jobs list with search/filter
- `/jobs/:id` - Job details
- `/login` - Login page
- `/register` - Registration page

**Seeker Pages (Protected Route):**
- `/dashboard` - Seeker dashboard (Application tracking)
- `/profile` - Seeker profile management (Resume upload)

**Employer Pages (Protected Route):**
- `/employer/dashboard` - Employer dashboard
- `/employer/jobs/new` - Create a new job post
- `/employer/jobs/:id/edit` - Edit job
- `/employer/jobs/:id/applications` - Review job applications

## 7. State Management Strategy
- **Zustand or Context API** will be used for lightweight global state (Authentication, user data).
- The `AuthContext` will monitor the localStorage JWT tokens and expose `user` object and `login/logout` handlers.

## 8. Authentication Flow (JWT)
1. **Login:** Send credentials → Receive `access` and `refresh` tokens.
2. **Storage:** Store `access` token in memory or `localStorage`, and `refresh` safely.
3. **Usage:** API Service (Axios interceptor) automatically attaches `Authorization: Bearer <token>` to requests.
4. **Refresh:** Axios interceptor detects `401 Unauthorized` → calls `/api/auth/token/refresh/` → retries previous request.
5. **Logout:** Token is wiped and user is entirely redirected to `/login`.

## 9. API Communication Pattern
All HTTP communication will flow through a centralized `axios` instance inside `src/services/api.js`.
```javascript
// Data flow representation
React Component --> api.js (Axios) --> Django REST API --> PostgreSQL
```
Endpoints should be abstracted into logical services (e.g., `AuthService.js`, `JobService.js`).

## 10. Error Handling Strategy
- **Global Error Boundary:** Catches React render crashes.
- **Axios Interceptors:** Standardizes API error responses and handles Token expiry gracefully.
- **Form Validation:** Client-side validation using React Hook Form or standard state before API dispatch.
- **Toast Notifications:** Standardized floating alerts for operation Success/Failure.

## 11. File Upload Handling
Resume and Avatar uploads will be handled via `FormData`.
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);
api.patch('/auth/me/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
```

## 12. Environment Variables
API URLs will be managed via Vite `.env` capabilities:
`VITE_API_BASE_URL=http://localhost:8000/api`

## 13. UI Design Principles
- **Professional & Clean:** Emulating modern corporate tech logic (LinkedIn, Wellfound).
- **Responsive-First:** Fully functional on Mobile screens.
- **Accessible:** Semantic HTML, ARIA labels, keyboard navigation enabled.
- **Color Grammar:** Strictly enforced Tailwind CSS themes utilizing CSS variables defined in Design System.

## 14. Performance Optimization Strategy
- **Code Splitting:** Lazy loading route components using `React.lazy()` and `<Suspense>`.
- **Image Optimization:** Rely on modern formats and lazy loaded visual structures.
- **List Virtualization:** Large job listings should be paginated (Django Backend pagination supported).

## 15. Security Practices
- Protect against XSS by sanitizing rich text (if Job descriptions support HTML).
- Protect routing by securing ProtectedRoute components checking Auth State before rendering.
- No sensitive keys in frontend code.

## 16. Future Enhancements
- Real-time chat (Websockets via Django Channels) between recruiters and candidates.
- Advanced Analytics Dashboard for Employer accounts.
- AI-based resume parsing.
