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
      default:
        return (
          <div className="p-10 border-4 border-dashed border-gray-200 text-gray-400 font-black uppercase text-center">
            {activeView} component not found
          </div>
        );
    }
  };

  return (
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
    </div>
  );
}
