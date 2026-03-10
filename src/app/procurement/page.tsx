"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";
import ProfilePage from "@/components/profile/ProfilePage";
import Submissions from "@/components/procurement/Submissions";
import ApprovedBaskets from "@/components/procurement/ApprovedBaskets";
import RejectedBaskets from "@/components/procurement/RejectedBaskets";
import Damaged from "@/components/procurement/Damaged";
import { RoleGuard } from "@/components/auth/RoleGuard";
import ChatSupport from "@/components/ChatSupport";

interface NavItem {
  name: string;
}

const defaultNavItems: NavItem[] = [
  { name: "Submissions" },
  { name: "Rejections" },
  { name: "Approved" },
  { name: "Damaged" },
  { name: "Profile" },
];

export default function DashboardPE() {
  const [activeView, setActiveView] = useState("Submissions");

  const renderContent = () => {
    switch (activeView) {
      case "Submissions":
        return <Submissions />;
      case "Rejections":
        return <RejectedBaskets />;
      case "Approved":
        return <ApprovedBaskets />;
      case "Damaged":
        return <Damaged />;
      case "Profile":
        return <ProfilePage />;
      case "PE":
        return <div className="p-4 bg-gray-100">Welcome to DH Home</div>;
      default:
        return (
          <div className="p-4 text-gray-500">
            {activeView} component is not implemented yet.
          </div>
        );
    }
  };

  return (
    <RoleGuard allowedRoles={["PE"]} redirectTo="/login">
      <div className="flex flex-col lg:flex-row min-h-screen bg-white">
        <Sidebar
          items={defaultNavItems}
          activeItem={activeView}
          onItemClick={(name) => setActiveView(name)}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* TOP HEADER: Clean and Sharp */}
          <header className="sticky top-0 lg:static z-30 bg-white/80 backdrop-blur-md border-b-2 border-gray-100 px-4 py-4 sm:px-8 sm:py-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-3xl font-black/20 text-gray-900 uppercase tracking-tighter">
                {activeView}
              </h1>
              <div className="h-1 w-12 bg-orange-500 mt-1"></div>
            </div>

            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </header>

          {/* SCROLLABLE CONTENT */}
          <div className="p-4 sm:p-8 flex-1 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </div>
        </main>
        <ChatSupport />
      </div>
    </RoleGuard>
  );
}
