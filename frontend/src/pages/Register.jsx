/**
 * src/pages/Register.jsx
 * ───────────────────────
 * Registration form. User must pick a role: SEEKER or EMPLOYER.
 * This role determines their entire experience in the app.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const ROLES = [
  {
    value: "SEEKER",
    label: "Job Seeker",
    description: "Browse jobs and submit applications",
    icon: "🔍",
  },
  {
    value: "EMPLOYER",
    label: "Employer",
    description: "Post jobs and hire candidates",
    icon: "🏢",
  },
];

// ─── InputField defined OUTSIDE Register ─────────────────────────────────────
// CRITICAL: Never define a component inside another component's render body.
// If defined inside, every parent re-render (e.g. on every keystroke) creates
// a new function reference → React treats it as a different component type →
// unmounts the old input and mounts a new one → input loses focus every letter.
// Defined outside, the reference is stable across renders.
const InputField = ({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  formData,
  errors,
  handleChange,
  isSubmitting,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={isSubmitting}
      className={`w-full bg-slate-800 border text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
        errors[name]
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-slate-700 focus:border-amber-400 focus:ring-amber-400"
      }`}
    />
    {errors[name] && (
      <p className="mt-1.5 text-red-400 text-xs">
        {errors[name]}
      </p>
    )}
  </div>
);

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    role: "",
    password: "",
    password_confirm: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role)
      setErrors((prev) => ({ ...prev, role: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email)
      newErrors.email = "Email is required.";
    if (!formData.username)
      newErrors.username = "Username is required.";
    if (!formData.role)
      newErrors.role = "Please select a role.";
    if (!formData.password)
      newErrors.password = "Password is required.";
    if (formData.password.length < 8)
      newErrors.password =
        "Password must be at least 8 characters.";
    if (formData.password !== formData.password_confirm)
      newErrors.password_confirm =
        "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(formData);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val)
            ? val[0]
            : val;
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors below.");
      } else {
        toast.error(
          "Registration failed. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared props passed down to every InputField
  const fieldProps = {
    formData,
    errors,
    handleChange,
    isSubmitting,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center font-black text-slate-950 text-lg group-hover:bg-amber-300 transition-colors">
              H
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Hire
              <span className="text-amber-400">Hub</span>
            </span>
          </Link>
          <p className="mt-3 text-slate-400 text-sm">
            Create your account
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() =>
                      handleRoleSelect(role.value)
                    }
                    disabled={isSubmitting}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-150 disabled:opacity-50 ${
                      formData.role === role.value
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }`}>
                    <span className="text-2xl block mb-2">
                      {role.icon}
                    </span>
                    <span
                      className={`font-semibold text-sm block ${formData.role === role.value ? "text-amber-400" : "text-white"}`}>
                      {role.label}
                    </span>
                    <span className="text-slate-400 text-xs mt-1 block leading-tight">
                      {role.description}
                    </span>
                    {formData.role === role.value && (
                      <div className="absolute top-3 right-3 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-slate-950 text-xs font-black">
                          ✓
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1.5 text-red-400 text-xs">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                name="first_name"
                label="First Name"
                placeholder="Alice"
                autoComplete="given-name"
                {...fieldProps}
              />
              <InputField
                name="last_name"
                label="Last Name"
                placeholder="Smith"
                autoComplete="family-name"
                {...fieldProps}
              />
            </div>

            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...fieldProps}
            />
            <InputField
              name="username"
              label="Username"
              placeholder="alice_smith"
              autoComplete="username"
              {...fieldProps}
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className={`w-full bg-slate-800 border text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:border-amber-400 focus:ring-amber-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-xs">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-red-400 text-xs">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
                disabled={isSubmitting}
                className={`w-full bg-slate-800 border text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
                  errors.password_confirm
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-700 focus:border-amber-400 focus:ring-amber-400"
                }`}
              />
              {errors.password_confirm && (
                <p className="mt-1.5 text-red-400 text-xs">
                  {errors.password_confirm}
                </p>
              )}
            </div>

            {/* Non-field errors */}
            {errors.non_field_errors && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">
                  {errors.non_field_errors}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.role}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl py-3 text-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <p className="text-center text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-400 font-medium hover:text-amber-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2025 HireHub. Built for learning.
        </p>
      </div>
    </div>
  );
};

export default Register;