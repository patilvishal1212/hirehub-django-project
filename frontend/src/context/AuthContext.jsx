import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { clearAccessToken } from "../services/api";
import {
  loginUser,
  logoutUser,
  fetchMe,
  registerUser,
  refreshSession,
} from "../services/AuthService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Session Restoration ───
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Attempt to get a fresh access token using the HttpOnly refresh cookie
        await refreshSession();
        
        if (!isMounted) return;

        // If refresh succeeded, fetch the full user profile
        const userData = await fetchMe();
        
        if (isMounted) {
          setUser(userData);
        }
      } catch (err) {
        // Refresh failed (no cookie or expired) — stay logged out
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Session Expiry Listener ───
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      clearAccessToken();
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: userData } = await loginUser(credentials);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      clearAccessToken();
    }
  }, []);

  const register = useCallback(async (data) => {
    return await registerUser(data);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role,
    isEmployer: user?.role === "EMPLOYER",
    isSeeker: user?.role === "SEEKER",
    login,
    logout,
    register,
    setUser,
  }), [user, isLoading, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};