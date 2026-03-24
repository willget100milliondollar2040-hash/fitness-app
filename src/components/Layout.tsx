import { useState, useEffect } from "react";
import { Outlet, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, MessageCircle, Users, Utensils, TrendingUp, Moon, Sun, LogOut, User, ShoppingBag } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { Logo } from "./Logo";
import { supabase } from "../lib/supabase";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { motion, AnimatePresence } from "motion/react";

export default function Layout() {
  useKeyboardShortcuts();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isOnboarded = localStorage.getItem("onboardingComplete");
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || null);
    });
  }, []);

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("onboardingComplete");
    localStorage.removeItem("onboardingData");
    localStorage.removeItem("chatMessages");
    // Clear other workout data if necessary
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("workout_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    navigate("/");
  };

    const navItems = [
    { to: "/", icon: Dumbbell, label: "Tập luyện" },
    { to: "/buddy", icon: Users, label: "Bạn tập" },
    { to: "/nutrition", icon: Utensils, label: "Dinh dưỡng" },
    { to: "/progress", icon: TrendingUp, label: "Tiến độ" },
    { to: "/marketplace", icon: ShoppingBag, label: "Cửa hàng" },
  ];

  return (
    <div className={cn("flex h-[100dvh] w-full overflow-hidden relative transition-colors duration-300", isDark ? "bg-[#0A0A0A] text-white" : "bg-white text-zinc-900")}>
      
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:flex flex-col w-64 border-r transition-colors duration-300 z-30", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
        <div className="p-6 flex items-center gap-3">
          <Logo className={cn("w-8 h-8", isDark ? "text-white" : "text-black")} />
          <h1 className={cn("font-bold text-xl tracking-tight", isDark ? "text-white" : "text-zinc-900")}>BuddyFit VN</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? isDark ? "text-blue-400 font-medium" : "text-blue-600 font-medium"
                    : isDark ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl glow-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" strokeWidth={2.5} />
                  <span className="text-sm font-medium relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-100 dark:border-[#1F1F1F]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className={cn("px-4 py-3 border-b flex items-center justify-between sticky top-0 z-30 transition-colors duration-300", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
          <div className="flex items-center gap-2 md:hidden">
            <Logo className={cn("w-8 h-8", isDark ? "text-white" : "text-black")} />
            <h1 className={cn("font-bold text-lg tracking-tight", isDark ? "text-white" : "text-zinc-900")}>BuddyFit VN</h1>
          </div>
          <div className="hidden md:block"></div> {/* Spacer for desktop */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={toggleTheme}
              className={cn("p-2 rounded-full transition-colors", isDark ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn("w-8 h-8 rounded-full overflow-hidden border shadow-sm transition-transform active:scale-95 flex items-center justify-center font-bold text-white bg-gradient-primary", isDark ? "border-zinc-700" : "border-zinc-200")}
              >
                {userEmail ? (
                  <img src={getAvatarUrl(userEmail) || ""} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  "U"
                )}
              </button>

              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className={cn(
                    "absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border z-50 py-2 animate-in fade-in zoom-in duration-200 origin-top-right",
                    isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100"
                  )}>
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-[#1F1F1F] mb-1">
                      <p className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-400")}>Tài khoản</p>
                      <p className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-zinc-900")}>{userEmail || "Người dùng BuddyFit"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left font-medium"
                    >
                      <User className="w-4 h-4" />
                      Hồ sơ
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full md:hidden flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 scroll-smooth relative">
          <div className="max-w-5xl mx-auto w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className={cn("md:hidden absolute bottom-0 w-full px-2 py-2 pb-4 flex justify-around items-center z-20 transition-colors duration-300 border-t", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]")}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? isDark ? "text-blue-400 font-medium" : "text-blue-600 font-medium"
                    : isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl glow-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 mb-1 relative z-10")} strokeWidth={2.5} />
                  <span className="text-[10px] tracking-wide relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
