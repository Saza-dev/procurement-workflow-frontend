"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/types/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api"; // Import your central API client

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to check session first
  const router = useRouter();

  // 1. Run this ONCE when the app loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        // This call automatically sends the cookie thanks to withCredentials: true
        const { data } = await api.auth.me();

        if (data?.data?.user) {
          setUser(data.data.user);
        }
      } catch (err) {
        // If 401 or error, user is simply not logged in
        setUser(null);
      } finally {
        setIsLoading(false); // Session check is finished
      }
    };

    checkSession();
  }, []);

  const login = async (userData: User) => {
    // Note: The actual cookie setting happens in the LoginPage API call
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Optional: keep for non-sensitive UI speed
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout(); // Tell backend to clear the cookie
      setUser(null);
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {/* Prevent the app from flickering or redirecting 
         until we know if the user has a valid session 
      */}
      {!isLoading ? (
        children
      ) : (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
          <div className="animate-spin h-12 w-12 border-t-2 rounded-full border-orange-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
