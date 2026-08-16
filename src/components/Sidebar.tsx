import { useApp, Route } from "../App";
import { Home, Ruler, Box, FolderOpen, Calculator, FileText, Info, Plus, X } from "lucide-react";

const NAV_ITEMS: { label: string; icon: typeof Home; route: Route }[] = [
  { label: "Home", icon: Home, route: { name: "home" } },
  { label: "Dashboard", icon: Home, route: { name: "dashboard" } },
  { label: "Design Assistant", icon: Ruler, route: { name: "design" } },
  { label: "3D Preview", icon: Box, route: { name: "preview" } },
  { label: "My Designs", icon: FolderOpen, route: { name: "designs" } },
  { label: "Cost Analysis", icon: Calculator, route: { name: "cost" } },
  { label: "Reports", icon: FileText, route: { name: "reports" } },
  { label: "About", icon: Info, route: { name: "about" } },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { route, navigate, startNewDesign } = useApp();

  const isActive = (itemRoute: Route) => itemRoute.name === route.name;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-neutral-900/40 z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Box size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-neutral-900 text-sm">Foldable Desk</div>
              <div className="text-xs text-neutral-500">Assistant</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-neutral-500 hover:text-neutral-900" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.route);
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.route)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-neutral-200">
          <button
            onClick={startNewDesign}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create New Design
          </button>
        </div>
      </aside>
    </>
  );
}
