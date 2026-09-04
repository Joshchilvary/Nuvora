import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser as apiLogout,
} from "../services/api/auth.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "nuvora-auth-user";

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function normalizeUser(data) {
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    phoneNumber: data.phone_number,
    profilePicture: data.profile_picture,
    bio: data.bio,
    isVerified: data.is_verified,
    isStaff: data.is_staff || false,
    dateJoined: data.date_joined,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUser());
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const isAuthenticated = !!user;

  const refreshUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      const normalized = normalizeUser(data);
      setUser(normalized);
      saveUser(normalized);
      return normalized;
    } catch {
      setUser(null);
      saveUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const user = await refreshUser();
        if (!cancelled && !user) {
          setUser(null);
          saveUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHydrated(true);
        }
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      const normalized = normalizeUser(response.user);
      setUser(normalized);
      saveUser(normalized);
      return normalized;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
    } finally {
      setUser(null);
      saveUser(null);
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      saveUser(next);
      return next;
    });
  }, []);

  const value = {
    user,
    loading,
    hydrated,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
