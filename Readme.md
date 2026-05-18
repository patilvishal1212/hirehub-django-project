# HireHub 🚀

Welcome to **HireHub**, a professional hiring platform designed to seamlessly connect **Employers** and **Job Seekers**. 

HireHub provides a robust architecture separated into a decoupled React frontend and a Django REST Framework backend, providing high performance, scalability, and security out of the box.

---

## 🏗️ Project Architecture

The project follows a modern **Client-Server Architecture**:
- **Frontend**: A Single Page Application (SPA) built with React 19 and Vite.
- **Backend**: A robust REST API powered by Django and Django REST Framework (DRF).
- **Database**: PostgreSQL for relational data storage.
- **Authentication**: JWT (JSON Web Tokens) with a secure implementation utilizing HttpOnly cookies for refresh tokens.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: TailwindCSS v4
- **Routing**: React Router DOM v7
- **State Management**: Context API & Custom Hooks (`useAuth`)
- **HTTP/API Client**: Axios (with centralized interceptors in `services/api.js`)
- **Notifications**: React Toastify

### Backend
- **Framework**: Django & Django REST Framework
- **Database**: PostgreSQL (configured via `psycopg2`)
- **Authentication**: `rest_framework_simplejwt`
- **Environment Management**: `python-decouple`

---

## 📁 Global Folder Structure

The root of the repository is split logically between the frontend UI and the backend API server.

```text
DjangoProject/
├── backend/            # Django REST API 
├── frontend/           # React SPA
└── README.md           # Global documentation
```

---

## ⚙️ Backend Structure (`/backend`)

The backend is structured as a modular Django project consisting of independent apps that manage distinct business domains.

```text
backend/
├── hirehub/                   # Main Django configuration folder
│   ├── settings.py            # Global settings (Database, CORS, JWT config)
│   ├── urls.py                # Root API URL routing
│   └── wsgi.py / asgi.py      # Server entry points
├── accounts/                  # App handling Users and Authentication
│   ├── models.py              # Custom User model (Employer/Seeker roles)
│   ├── views.py               # Auth endpoints (Login, Register, Token Refresh)
│   └── serializers.py
├── jobs/                      # App handling Job Listings and Applications
│   ├── models.py              # Models for Jobs, Applications
│   ├── views.py               # Job-related API endpoints
│   └── serializers.py
├── media/                     # User-uploaded files (resumes, avatars)
├── venv/                      # Python virtual environment
├── manage.py                  # Django CLI management utility
└── requirments.txt            # Python dependencies
```

### Key Backend Features:
- **Custom User Model**: Differentiates between 'Employer' and 'Seeker' personas.
- **Secure Authentication**: Access Tokens are managed in frontend memory, while Refresh Tokens are strictly kept in HttpOnly, SameSite cookies to protect against XSS token theft.
- **Database Setup**: Managed via `.env` variables reading into PostgreSQL defaults.

---

## 🎨 Frontend Structure (`/frontend`)

The frontend follows a Feature-Based component architecture. Separation of concerns is actively maintained, primarily delegating network requests to the `/services` folder.

```text
frontend/
├── public/                    # Static public assets (Favicon, etc.)
├── src/
│   ├── assets/                # Images, global icons, fonts
│   ├── components/            # Reusable generalized components (Buttons, Cards, Inputs)
│   ├── context/               # Global feature Contexts (e.g., AuthProvider)
│   ├── hooks/                 # Custom React hooks (e.g., useAuth.js)
│   ├── pages/                 # Full Page components (Matched to Routes)
│   │   ├── auth/              # Login, Registration pages
│   │   ├── employer/          # Employer Dashboard, Job posting
│   │   ├── seeker/            # Seeker Dashboard, Profile building
│   │   └── public/            # Landing page, public Job Boards
│   ├── services/              # Centralized API logic and external services
│   │   ├── api.js             # Shared Axios instance with Bearer interceptors
│   │   ├── AuthService.js     # Auth-specific API calls 
│   │   └── JobService.js      # Job-specific API calls
│   ├── App.jsx                # Main Application component & Route definitions
│   ├── main.jsx               # React entry point handling DOM injection
│   └── index.css              # Global styles & Tailwind configuration
├── .env                       # Frontend environment variables (VITE_API_BASE_URL)
├── package.json               # Node.js dependencies and scripts
├── vite.config.js             # Vite compiler & build configuration
└── eslint.config.js           # Linter rules
```

### Key Frontend Features:
- **Service Layer Abstraction**: Components do not call endpoints directly; they rely on cleanly formatted functions in `JobService.js` and `AuthService.js`.
- **Protected Routing**: Role-based access control prevents Seekers from accessing Employer pages and vice versa.
- **Modern UI Styling**: Developed with TailwindCSS v4 focusing on a clean, professional aesthetic.

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirments.txt

# Create .env inside backend/hirehub/ and add DB variables and SECRET_KEY
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env and set VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```

Visit `http://localhost:5173` to interact with the frontend, and `http://localhost:8000/api` for the backend.