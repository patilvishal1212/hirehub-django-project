/**
 * src/hooks/useAuth.js
 * ────────────────────
 * Clean hook to consume AuthContext from any component.
 *
 * WHY a hook instead of using useContext directly?
 *   1. Protects against using outside of AuthProvider (throws clear error)
 *   2. Single import: `import { useAuth } from "../hooks/useAuth"`
 *      instead of: `import { useContext } from "react"; import { AuthContext } from "..."`
 *   3. Easy to extend later (add memoization, selectors, etc.)
 *
 * USAGE:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider.\n" +
        "Make sure your component is wrapped in <AuthProvider> in main.jsx",
    );
  }

  return context;
};