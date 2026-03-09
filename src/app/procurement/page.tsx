"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";
import ProfilePage from "@/components/profile/ProfilePage";
import Submissions from "@/components/procurement/Submissions";
import ApprovedBaskets from "@/components/procurement/ApprovedBaskets";
import RejectedBaskets from "@/components/procurement/RejectedBaskets";
import Damaged from "@/components/procurement/Damaged";

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
    <div className="flex min-h-screen">
      {/* 3. Pass the state setter function to the Sidebar */}
      <Sidebar
        items={defaultNavItems}
        activeItem={activeView}
        onItemClick={(name) => setActiveView(name)}
      />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{activeView}</h1>
          <LogoutButton />
        </div>

        {/* 4. Display the dynamic content here */}
        <div className="mt-4">{renderContent()}</div>
      </main>
    </div>
  );
}
