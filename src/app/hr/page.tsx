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
