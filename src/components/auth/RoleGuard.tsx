"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode; // Optional: what to show if denied (e.g., a "No Access" message)
  redirectTo?: string; // Optional: auto-redirect if unauthorized
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallback,
  redirectTo,
}: RoleGuardProps) => {
  const { isLoading, isAuthenticated, hasAnyRole } = useAuth();
  const router = useRouter();

  // 1. Show nothing (or a spinner) while we determine auth state
  if (isLoading) {
    return <div className="p-4 text-center">Checking permissions...</div>;
  }

  // Track if we've already redirected to avoid multiple redirects
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && redirectTo && !redirected.current) {
      redirected.current = true;
      router.push(redirectTo);
    } else if (
      isAuthenticated &&
      !hasAnyRole(allowedRoles) &&
      redirectTo &&
      !redirected.current
    ) {
      redirected.current = true;
      router.push(redirectTo);
    }
  }, [
    isLoading,
    isAuthenticated,
    allowedRoles,
    redirectTo,
    hasAnyRole,
    router,
  ]);

  // 2. If not logged in at all
  if (!isAuthenticated) {
    return null;
  }

  // 3. If logged in but doesn't have the required role
  if (!hasAnyRole(allowedRoles)) {
    // Return a custom fallback message or nothing
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-8 border-2 border-dashed border-red-200 bg-red-50 text-red-600  text-center">
        <p className="font-bold">Access Denied</p>
        <p className="text-sm">
          You do not have permission to view this section.
        </p>
      </div>
    );
  }

  // 4. Authorized! Render the protected content
  return <>{children}</>;
};
