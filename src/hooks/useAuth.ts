"use client";
import { useState, useEffect } from "react";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
} from "@/app/_services/authService";
import { User } from "@/app/types/user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    // Bypass authentication - always consider user as logged in
    setUser({} as User);
    setIsLoggedIn(true);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Do nothing on logout bypass
  };

  return {
    user,
    loading,
    isLoggedIn,
    userId: null,
    logout: handleLogout,
  };
}
