import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";
import ProfilePage from "@/components/profile/ProfilePage";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <LogoutButton />
        <ProfilePage />
        {/* Add admin-specific components here */}
      </main>
    </div>
  );
}
