import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Dumbbell, Activity, Flame, Plus, Trash2, X, ChevronDown, ClipboardList, Search, ArrowRight, Moon, Sun, LogOut, Trophy, Medal, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { supabase } from "../lib/supabase";
import { workoutService } from "../lib/workoutService";

type Routine = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  iconName: "Flame" | "Activity" | "Dumbbell";
  color: string;
  bg: string;
  exercises?: any[];
};

const defaultRoutines: Routine[] = [
  { id: "push", title: "Ngày Đẩy (Push)", subtitle: "Ngực, Vai, Tay sau", duration: "1h 15m", iconName: "Flame", color: "text-orange-500", bg: "bg-orange-100" },
  { id: "pull", title: "Ngày Kéo (Pull)", subtitle: "Lưng, Tay trước", duration: "1h 10m", iconName: "Activity", color: "text-blue-500", bg: "bg-blue-100" },
  { id: "legs", title: "Ngày Chân (Legs)", subtitle: "Đùi trước, Đùi sau, Bắp chân", duration: "1h 20m", iconName: "Dumbbell", color: "text-zinc-900 dark:text-white", bg: "bg-zinc-200 dark:bg-zinc-800" },
  { id: "fullbody", title: "Toàn thân (Full Body)", subtitle: "Toàn bộ cơ thể", duration: "1h 30m", iconName: "Activity", color: "text-purple-500", bg: "bg-purple-100" },
];

const icons = {
  Flame: Flame,
  Activity: Activity,
  Dumbbell: Dumbbell,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || null);
        setUserId(user.id);
        fetchRoutines(user.id);
        fetchStats(user.id);
      }
    });
  }, []);

  const fetchStats = async (uid: string) => {
    try {
      const history = await workoutService.getWorkoutHistory(uid);
      if (history && history.length > 0) {
        setTotalWorkouts(history.length);
        
        // Calculate simple streak
        const dates = history.map(w => new Date(w.start_time).toDateString());
        const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        let currentStreak = 0;
        let checkDate = new Date();
        
        // Check if worked out today
        if (uniqueDates[0] === checkDate.toDateString()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          
          for (let i = 1; i < uniqueDates.length; i++) {
            if (uniqueDates[i] === checkDate.toDateString()) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        } else {
          // Check if worked out yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          if (uniqueDates[0] === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            
            for (let i = 1; i < uniqueDates.length; i++) {
              if (uniqueDates[i] === checkDate.toDateString()) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }
          }
        }
        setStreak(currentStreak);
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  const fetchRoutines = async (uid: string) => {
    try {
      const data = await workoutService.getRoutines(uid);
      if (data && data.length > 0) {
        setRoutines(data.map(r => ({
          id: r.id,
          title: r.title,
          subtitle: r.subtitle || "",
          duration: r.duration || "",
          iconName: r.icon_name as any,
          color: r.color || "",
          bg: r.bg || "",
          exercises: r.exercises
        })));
      } else {
        // Migration from localStorage if available
        const saved = localStorage.getItem("routines");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Save them to Supabase and get real IDs
            const savedRoutines = await Promise.all(parsed.map((r: any) => 
              workoutService.saveRoutine({
                user_id: uid,
                title: r.title,
                subtitle: r.subtitle,
                duration: r.duration,
                icon_name: r.iconName,
                color: r.color,
                bg: r.bg,
                exercises: r.exercises || []
              })
            ));
            
            setRoutines(savedRoutines.map(r => ({
              id: r.id,
              title: r.title,
              subtitle: r.subtitle || "",
              duration: r.duration || "",
              iconName: r.icon_name as any,
              color: r.color || "",
              bg: r.bg || "",
              exercises: r.exercises
            })));
            
            // Clear local storage after successful migration
            localStorage.removeItem("routines");
          } catch (err) {
            console.error("Migration failed", err);
          }
        } else {
          // Save defaults to Supabase and update state with real IDs
          const savedRoutines = await Promise.all(defaultRoutines.map(r => 
            workoutService.saveRoutine({
              user_id: uid,
              title: r.title,
              subtitle: r.subtitle,
              duration: r.duration,
              icon_name: r.iconName,
              color: r.color,
              bg: r.bg,
              exercises: []
            })
          ));
          
          setRoutines(savedRoutines.map(r => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle || "",
            duration: r.duration || "",
            iconName: r.icon_name as any,
            color: r.color || "",
            bg: r.bg || "",
            exercises: r.exercises
          })));
        }
      }
    } catch (e) {
      console.error("Failed to fetch routines", e);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!userId) return;
    
    // Optimistic update - disappear immediately
    const previousRoutines = [...routines];
    setRoutines(routines.filter((r) => r.id !== id));
    localStorage.removeItem(`workout_${id}`);

    try {
      await workoutService.deleteRoutine(id);
    } catch (e) {
      console.error("Failed to delete routine", e);
      // Rollback if failed
      setRoutines(previousRoutines);
      alert("Không thể xóa lịch tập. Vui lòng thử lại.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={cn("min-h-full pb-24 transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="p-5 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Luyện tập</h1>
              <ChevronDown className={cn("w-6 h-6", isDark ? "text-zinc-500" : "text-zinc-400")} />
            </div>
            {userEmail && (
              <p className={cn("text-xs font-medium mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
                {userEmail}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md">PRO</span>
            <button
              onClick={handleLogout}
              className={cn("p-2 rounded-full transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-200 hover:bg-zinc-300 text-zinc-600")}
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2 bg-blue-500", isDark ? "border-zinc-700" : "border-white")}>
              {userEmail ? userEmail[0].toUpperCase() : "U"}
            </div>
          </div>
        </motion.div>

        {/* Gamification Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className={cn("rounded-3xl p-5 shadow-sm border transition-colors flex flex-col items-center justify-center text-center", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-3">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-zinc-900")}>{streak}</h3>
            <p className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Ngày liên tiếp</p>
          </div>
          
          <div className={cn("rounded-3xl p-5 shadow-sm border transition-colors flex flex-col items-center justify-center text-center", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-zinc-900")}>{totalWorkouts}</h3>
            <p className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Buổi tập</p>
          </div>
        </motion.div>

        {/* Start Empty Workout */}
        <motion.button 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          onClick={() => navigate("/workout/empty")}
          className={cn(
            "w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
            isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm"
          )}
        >
          <Plus className="w-5 h-5" /> Bắt đầu bài tập trống
        </motion.button>

        {/* Routines Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold mb-4">Lịch tập</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => navigate("/routine/new")}
              className={cn(
                "py-6 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors",
                isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm"
              )}
            >
              <ClipboardList className="w-6 h-6" />
              <span className="font-medium">Tạo lịch tập</span>
            </button>
            <button 
              onClick={() => navigate("/marketplace")}
              className={cn(
                "py-6 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors",
                isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm"
              )}
            >
              <Search className="w-6 h-6" />
              <span className="font-medium">Khám phá</span>
            </button>
          </div>

          {/* Existing Routines List */}
          <div className="space-y-3">
            {routines.map((routine) => {
              const IconComponent = icons[routine.iconName] || Activity;
              return (
                <button
                  key={routine.id}
                  onClick={() => navigate(`/workout/${routine.id}`)}
                  className={cn(
                    "w-full rounded-2xl p-4 transition-all text-left flex items-center gap-4 group relative overflow-hidden",
                    isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e]" : "bg-white border border-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm"
                  )}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${routine.bg} shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${routine.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={cn("text-base font-bold truncate", isDark ? "text-white" : "text-zinc-900")}>{routine.title}</h3>
                    <p className={cn("text-sm mt-0.5 truncate", isDark ? "text-zinc-400" : "text-zinc-500")}>{routine.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoutine(routine.id);
                      }}
                      className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center transition-opacity hover:bg-red-500/20"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0", isDark ? "bg-zinc-800 group-hover:bg-white/20" : "bg-zinc-100 group-hover:bg-zinc-200")}>
                      <Play className={cn("w-5 h-5 ml-0.5", isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900 dark:text-white")} />
                    </div>
                  </div>
                </button>
              );
            })}
            {routines.length === 0 && (
              <div className={cn("text-center py-10", isDark ? "text-zinc-500" : "text-zinc-400")}>
                Chưa có lịch tập nào. Hãy tạo lịch tập mới!
              </div>
            )}
          </div>
        </motion.div>

        {/* How to get started banner */}
        <motion.button 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full mt-8 bg-[#2c3e50] hover:bg-[#34495e] text-white p-4 rounded-xl flex items-center justify-between transition-colors"
        >
          <span className="font-medium">Hướng dẫn bắt đầu</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Delete Routine Confirm Modal removed for "biến mất luôn" optimization */}
    </div>
  );
}
