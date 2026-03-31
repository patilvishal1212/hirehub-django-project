import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";


// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import SeekerDahsboard from "./pages/dashboard/SeekerDahsboard";
import Profile from "./pages/subpages/Profile";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";
import CreateJob from "./pages/subpages/CreateJob";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtecyedRoute";
import CreateCompany from "./pages/subpages/CreateCompany";

// Placeholder pages
const Home = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <p className="text-slate-400">Home — Phase 2</p>
  </div>
);

const App = () => {
  return (
    <Routes>
      {/* ── Public ────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Seeker only ───────────────────────────── */}
      <Route element={<ProtectedRoute requiredRole="SEEKER" />}>
        <Route path="/dashboard" element={<SeekerDahsboard />} />
        <Route path="/applications" element={<div className="p-8"><DashboardLayout><h1 className="text-2xl font-bold">My Applications</h1><p className="mt-4 text-slate-400 italic">Application list coming soon...</p></DashboardLayout></div>} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ── Employer only ─────────────────────────── */}
      <Route element={<ProtectedRoute requiredRole="EMPLOYER" />}>
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/company/new" element={<CreateCompany />} />
        <Route path="/employer/jobs/new" element={<CreateJob />} />
      </Route>

      {/* ── Fallback ──────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;