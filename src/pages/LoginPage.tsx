import { useState, useEffect } from "react";
import { Box, Mail, Lock, ArrowRight, User, Eye, EyeOff } from "lucide-react";

const AUTH_KEY = "fsda.auth.v1";

export interface AuthUser {
  name: string;
  email: string;
}

function readAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeAuth(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function getAuthUser(): AuthUser | null {
  return readAuth();
}

export function logout() {
  writeAuth(null);
}

export default function LoginPage({ onAuthed }: { onAuthed: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError("");
  }, [mode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    // Simulate auth; persist locally so the session survives reloads.
    setTimeout(() => {
      const user: AuthUser = {
        name: mode === "signup" ? name.trim() : email.split("@")[0],
        email: email.trim(),
      };
      writeAuth(user);
      setLoading(false);
      onAuthed(user);
    }, 600);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <Box size={24} />
            </div>
            <div>
              <div className="font-semibold text-lg leading-tight">Foldable Study Desk</div>
              <div className="text-sm text-primary-100">Assistant</div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight">
            Design Your Perfect<br />Study Space
          </h1>
          <p className="mt-4 text-primary-100 max-w-md leading-relaxed">
            Smart, compact &amp; personalized. Customize dimensions, materials and storage, preview
            your desk in interactive 3D and estimate the cost instantly.
          </p>
          <ul className="mt-8 space-y-3 text-primary-50">
            {[
              "Interactive 3D fold / unfold preview",
              "Smart recommendations based on your room",
              "Cost estimation in Indian Rupees (₹)",
              "Professional, printable design reports",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 text-xs text-primary-200">
          Engineering Design Tool · v1.0
        </div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
              <Box size={22} />
            </div>
            <div className="font-semibold text-neutral-900">Foldable Study Desk Assistant</div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-8">
            <h2 className="text-2xl font-bold text-neutral-900">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {mode === "login"
                ? "Sign in to continue designing your desk."
                : "Sign up to start designing your foldable desk."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-sm font-medium text-neutral-800">Full Name</label>
                  <div className="mt-1.5 relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-neutral-800">Email</label>
                <div className="mt-1.5 relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Password</label>
                <div className="mt-1.5 relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-error-600 bg-error-500/10 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-neutral-600 text-center mt-5">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="text-xs text-neutral-400 text-center mt-4">
            Demo authentication — your session is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
