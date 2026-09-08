import { useCallback, useMemo, useState, useEffect, createContext, useContext, ReactNode } from "react";
import { DesignConfig } from "./types";
import { listDesigns, saveDesign, deleteDesign, getDesign } from "./lib/storage";
import { createBlankDesign, calculateCost } from "./lib/designEngine";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Toast, { ToastMessage } from "./components/Toast";
import LandingPage from "./pages/LandingPage";
import DesignAssistant from "./pages/DesignAssistant";
import Preview3D from "./pages/Preview3D";
import MyDesigns from "./pages/MyDesigns";
import CostAnalysis from "./pages/CostAnalysis";
import Reports from "./pages/Reports";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import LoginPage, { AuthUser } from "./pages/LoginPage";
import { supabase } from "./lib/supabase";
export type Route =
  | { name: "home" }
  | { name: "dashboard" }
  | { name: "design"; designId?: string }
  | { name: "preview"; designId?: string }
  | { name: "designs" }
  | { name: "cost"; designId?: string }
  | { name: "reports"; designId?: string }
  | { name: "about" };

interface AppContextType {
  route: Route;
  navigate: (route: Route) => void;
  currentDesign: DesignConfig | null;
  setCurrentDesign: (d: DesignConfig | null) => void;
  updateCurrentDesign: (patch: Partial<DesignConfig>) => void;
  savedDesigns: DesignConfig[];
  refreshDesigns: () => Promise<void>;
saveCurrent: () => Promise<void>;
removeDesign: (id: string) => Promise<void>;
loadDesign: (id: string) => Promise<DesignConfig | undefined>;
  toast: (message: string, type?: ToastMessage["type"]) => void;
  startNewDesign: () => void;
  user: AuthUser | null;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default function App() {
  return <AppProvider />;
}

function AppProvider() {
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [currentDesign, setCurrentDesignState] = useState<DesignConfig | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<DesignConfig[]>([]);
  const [toastMsg, setToastMsg] = useState<ToastMessage | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
const [user, setUser] = useState<AuthUser | null>(null);
const [authLoading, setAuthLoading] = useState(true);
useEffect(() => {
  let mounted = true;

  const loadSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!mounted) return;

    if (session?.user) {
      setUser({
        name:
          (session.user.user_metadata?.name as string | undefined) ||
          session.user.email?.split("@")[0] ||
          "User",
        email: session.user.email || "",
      });
    } else {
      setUser(null);
    }

    setAuthLoading(false);
  };

  void loadSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setUser({
        name:
          (session.user.user_metadata?.name as string | undefined) ||
          session.user.email?.split("@")[0] ||
          "User",
        email: session.user.email || "",
      });
    } else {
      setUser(null);
    }

    setAuthLoading(false);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
  const refreshDesigns = useCallback(async () => {
  try {
    const designs = await listDesigns();
    setSavedDesigns(designs);
  } catch (error) {
    console.error("Failed to refresh designs:", error);
    setSavedDesigns([]);
  }
}, []);
  useEffect(() => {
    refreshDesigns();
  }, [refreshDesigns]);

  // Keep estimated cost in sync with config
  useEffect(() => {
    if (!currentDesign) return;
    const cost = calculateCost(currentDesign.dimensions, currentDesign.material, currentDesign.finish, currentDesign.storage);
    if (cost.total !== currentDesign.estimatedCost) {
      setCurrentDesignState({ ...currentDesign, estimatedCost: cost.total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDesign?.dimensions, currentDesign?.material, currentDesign?.finish, currentDesign?.storage]);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setCurrentDesign = useCallback((d: DesignConfig | null) => {
    setCurrentDesignState(d);
  }, []);

  const updateCurrentDesign = useCallback((patch: Partial<DesignConfig>) => {
    setCurrentDesignState((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const toast = useCallback((message: string, type: ToastMessage["type"] = "success") => {
    setToastMsg({ id: Date.now(), message, type });
  }, []);

  const saveCurrent = useCallback(async () => {
  if (!currentDesign) return;

  try {
    const saved = await saveDesign(currentDesign);
    setCurrentDesignState(saved);
    await refreshDesigns();
    toast("Design saved successfully", "success");
  } catch (error) {
    console.error("Failed to save design:", error);
    toast(
      error instanceof Error ? error.message : "Unable to save the design.",
      "error"
    );
  }
}, [currentDesign, refreshDesigns, toast]);
const removeDesign = useCallback(
  async (id: string) => {
    try {
      await deleteDesign(id);
      await refreshDesigns();
      toast("Design deleted", "info");
    } catch (error) {
      console.error("Failed to delete design:", error);
      toast(
        error instanceof Error ? error.message : "Unable to delete the design.",
        "error"
      );
    }
  },
  [refreshDesigns, toast]
);
  const loadDesign = useCallback(async (id: string) => {
  try {
    const d = await getDesign(id);

    if (d) {
      setCurrentDesignState(d);
    }

    return d;
  } catch (error) {
    console.error("Failed to load design:", error);
    toast("Unable to load the design.", "error");
    return undefined;
  }
}, [toast]);

  const startNewDesign = useCallback(() => {
    const blank = createBlankDesign();
    const cost = calculateCost(blank.dimensions, blank.material, blank.finish, blank.storage);
    blank.estimatedCost = cost.total;
    setCurrentDesignState(blank);
    navigate({ name: "design" });
  }, [navigate]);

  const logout = useCallback(async () => {
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    toast("Unable to sign out. Please try again.", "error");
    return;
  }

  setUser(null);
  setRoute({ name: "home" });
  toast("You have been signed out", "info");
}, [toast]);

  const contextValue = useMemo<AppContextType>(
    () => ({
      route,
      navigate,
      currentDesign,
      setCurrentDesign,
      updateCurrentDesign,
      savedDesigns,
      refreshDesigns,
      saveCurrent,
      removeDesign,
      loadDesign,
      toast,
      startNewDesign,
      user,
      logout,
    }),
    [route, navigate, currentDesign, setCurrentDesign, updateCurrentDesign, savedDesigns, refreshDesigns, saveCurrent, removeDesign, loadDesign, toast, startNewDesign, user, logout]
  );
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-sm text-neutral-500">
        Checking your account...
      </div>
    </div>
  );
}
  if (!user) {
    return (
      <>
        <LoginPage onAuthed={(u) => setUser(u)} />
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 min-w-0">
            <RouteRenderer />
          </main>
        </div>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </div>
    </AppContext.Provider>
  );
}

function RouteRenderer() {
  const { route } = useApp();
  switch (route.name) {
    case "home":
      return <LandingPage />;
    case "dashboard":
      return <Dashboard />;
    case "design":
      return <DesignAssistant designId={route.designId} />;
    case "preview":
      return <Preview3D designId={route.designId} />;
    case "designs":
      return <MyDesigns />;
    case "cost":
      return <CostAnalysis designId={route.designId} />;
    case "reports":
      return <Reports designId={route.designId} />;
    case "about":
      return <About />;
    default:
      return <LandingPage />;
  }
}
