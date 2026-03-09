import React from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["DH", "CEO"]} redirectTo="/login">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </div>
    </RoleGuard>
  );
}
