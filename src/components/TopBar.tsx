import { Menu, Box, LogOut, User as UserIcon } from "lucide-react";
import { useApp } from "../App";
import { useState, useRef, useEffect } from "react";

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { navigate, user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <button
            onClick={() => navigate({ name: "home" })}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Box size={18} />
            </div>
            <span className="font-semibold text-neutral-900 hidden sm:inline">Foldable Study Desk Assistant</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 hidden md:block">Engineering Design Tool · v1.0</span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Account menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span className="text-sm font-medium text-neutral-700 hidden sm:inline">{user?.name}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-cardHover border border-neutral-200 py-2 animate-fade-in-up">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-500 truncate flex items-center gap-1 mt-0.5">
                    <UserIcon size={11} /> {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
