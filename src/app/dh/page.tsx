"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";
import ProfilePage from "@/components/profile/ProfilePage";
import CreateBucket from "@/components/dh/CreateRequest";
import AddItems from "@/components/dh/AddItems";
import TrackRequests from "@/components/dh/TrackRequest";
import Arrivals from "@/components/dh/Arrivals";
import DamageReport from "@/components/dh/DamageReport";

interface NavItem {
  name: string;
}

const defaultNavItems: NavItem[] = [
  { name: "Create Request" },
  { name: "Add Items" },
  { name: "Confirm Arrivals" },
  { name: "Show Requests" },
  { name: "Report" },
  { name: "Profile" },
];

export default function DashboardDH() {
  const [activeView, setActiveView] = useState("Create Request");

  const renderContent = () => {
    switch (activeView) {
      case "Profile":
        return <ProfilePage />;
      case "Create Request":
        return <CreateBucket />;
      case "Confirm Arrivals":
        return <Arrivals />;
      case "Report":
        return <DamageReport />;
      case "Add Items":
        return <AddItems />;
      case "Show Requests":
        return <TrackRequests />;
      case "DH":
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
