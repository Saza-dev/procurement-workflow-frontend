"use client";

import { useState } from "react";

interface NavItem {
  name: string;
}

interface SidebarProps {
  items?: NavItem[];
  onItemClick: (name: string) => void;
  activeItem: string;
}

export default function Sidebar({
  items = [],
  onItemClick,
  activeItem,
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* --- MOBILE TOP BAR (Visible only on mobile) --- */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between bg-gray-950 text-white p-4 border-b border-gray-800">
        <h2 className="text-lg font-black/20 uppercase tracking-tighter">
          Dashboard
        </h2>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-orange-500 p-2 text-white font-bold text-xs uppercase"
        >
          {isMobileMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* --- OVERLAY (Mobile only) --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR CORE --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 text-gray-300 border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 lg:static 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header (Desktop) */}
        <div className="hidden lg:block p-8 border-b border-gray-900 mb-6">
          <h2 className="text-2xl font-black/20 text-white uppercase tracking-tighter">
            Procure<span className="text-orange-500">.</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">
            Workflow System
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-full lg:h-auto overflow-y-auto">
          {items.map((item) => {
            const isActive = activeItem === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onItemClick(item.name);
                  setIsMobileMenuOpen(false); // Close menu on click for mobile
                }}
                className={`
                  w-full text-left px-8 py-5 text-xs font-black/20 uppercase tracking-widest transition-all border-l-4
                  ${
                    isActive
                      ? "bg-orange-500 text-white border-white"
                      : "border-transparent hover:bg-gray-900 hover:text-white"
                  }
                `}
              >
                {item.name}
              </button>
            );
          })}

          {/* Footer/Logout Area */}
          <div className="mt-auto lg:mt-10 p-8 border-t border-gray-900">
            <div className="bg-gray-900 p-4 border border-gray-800">
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                Logged in as
              </p>
              <p className="text-[10px] font-black/20 text-white uppercase truncate">
                {activeItem} View
              </p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
