"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";
import Arrivals from "@/components/hr/Arrivals";
import History from "@/components/hr/History";

interface NavItem {
  name: string;
}

const defaultNavItems: NavItem[] = [{ name: "Arrivals" }, { name: "History" }];

export default function DashboardDH() {
  const [activeView, setActiveView] = useState("Arrivals");

  const renderContent = () => {
    switch (activeView) {
      case "Arrivals":
        return <Arrivals />;
      case "History":
        return <History />;
      default:
        return (
          <div className="p-4 text-gray-500">
            {activeView} component is not implemented yet.
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
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">
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
