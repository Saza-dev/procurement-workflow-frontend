import { useContext } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";
import { Role } from "@/types/auth";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    user: context.user,
    isLoading: context.isLoading,
    isAuthenticated: !!context.user,
    login: context.login,
    logout: context.logout,
    // Helper to check if user has a specific role
    isRole: (role: Role) => context.user?.role === role,
    // Helper to check if user is in a list of allowed roles
    hasAnyRole: (roles: Role[]) =>
      context.user ? roles.includes(context.user.role) : false,
  };
};
