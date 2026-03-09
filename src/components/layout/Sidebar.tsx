"use client";

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
  return (
    <aside className="sticky top-0 h-screen w-64 bg-gray-950 text-gray-300 p-4 border-r border-gray-700 overflow-y-auto">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          Dashboard
        </h2>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          // Compare against the passed activeItem prop instead of the URL
          const isActive = activeItem === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onItemClick(item.name)}
              className={`w-full text-left block px-4 py-2.5  transition-colors ${
                isActive
                  ? "bg-orange-500 text-white font-medium"
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
