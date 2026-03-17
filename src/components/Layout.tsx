import { useState, useEffect } from "react";
import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import { Dumbbell, MessageCircle, Users, Utensils, TrendingUp, Moon, Sun, LogOut, User, ShoppingBag } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { Logo } from "./Logo";
import { supabase } from "../lib/supabase";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export default function Layout() {
  useKeyboardShortcuts();
  const navigate = useNavigate();
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
    <div className={cn("flex flex-col h-[100dvh] max-w-md mx-auto shadow-xl overflow-hidden relative transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      {/* Header */}
      <header className={cn("px-4 py-3 border-b flex items-center justify-between sticky top-0 z-30 transition-colors duration-300", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
        <div className="flex items-center gap-2">
          <Logo className={cn("w-8 h-8", isDark ? "text-white" : "text-black")} />
          <h1 className={cn("font-bold text-lg tracking-tight", isDark ? "text-white" : "text-zinc-900")}>BuddyFit VN</h1>
        </div>
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
              className={cn("w-8 h-8 rounded-full overflow-hidden border shadow-sm transition-transform active:scale-95 flex items-center justify-center font-bold text-white bg-blue-500", isDark ? "border-zinc-700" : "border-zinc-200")}
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
                  isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100"
                )}>
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left font-medium"
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
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className={cn("absolute bottom-0 w-full px-2 py-2 pb-4 flex justify-around items-center z-20 transition-colors duration-300 border-t", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]")}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200",
                isActive
                  ? isDark ? "text-white font-medium" : "text-black font-medium"
                  : isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
              )
            }
          >
            <item.icon className={cn("w-5 h-5 mb-1")} strokeWidth={2.5} />
            <span className="text-[10px] tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
