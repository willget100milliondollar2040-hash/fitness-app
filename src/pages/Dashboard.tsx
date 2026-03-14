import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Dumbbell, Activity, Flame, Plus, Trash2, X, ChevronDown, ClipboardList, Search, ArrowRight, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { supabase } from "../lib/supabase";

type Routine = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  iconName: "Flame" | "Activity" | "Dumbbell";
  color: string;
  bg: string;
};

const defaultRoutines: Routine[] = [
  { id: "push", title: "Push Day", subtitle: "Ngực, Vai, Tay sau", duration: "1h 15m", iconName: "Flame", color: "text-orange-500", bg: "bg-orange-100" },
  { id: "pull", title: "Pull Day", subtitle: "Lưng, Tay trước", duration: "1h 10m", iconName: "Activity", color: "text-blue-500", bg: "bg-blue-100" },
  { id: "legs", title: "Leg Day", subtitle: "Đùi, Mông, Bắp chân", duration: "1h 20m", iconName: "Dumbbell", color: "text-zinc-900 dark:text-white", bg: "bg-zinc-200 dark:bg-zinc-800" },
  { id: "fullbody", title: "Full Body", subtitle: "Toàn thân", duration: "1h 30m", iconName: "Activity", color: "text-purple-500", bg: "bg-purple-100" },
];

const icons = {
  Flame: Flame,
  Activity: Activity,
  Dumbbell: Dumbbell,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || null);
    });

    const saved = localStorage.getItem("routines");
    if (saved) {
      setRoutines(JSON.parse(saved));
    } else {
      setRoutines(defaultRoutines);
      localStorage.setItem("routines", JSON.stringify(defaultRoutines));
    }
  }, []);

  const saveRoutines = (newRoutines: Routine[]) => {
    setRoutines(newRoutines);
    localStorage.setItem("routines", JSON.stringify(newRoutines));
  };

  const confirmDeleteRoutine = () => {
    if (deleteConfirmId) {
      saveRoutines(routines.filter((r) => r.id !== deleteConfirmId));
      localStorage.removeItem(`workout_${deleteConfirmId}`);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className={cn("min-h-full pb-24 transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <div className="p-5 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Workout</h1>
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
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2", isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-200 border-white")}>
              <img 
                src="https://picsum.photos/seed/user123/100/100" 
                alt="User" 
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Start Empty Workout */}
        <motion.button 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onClick={() => navigate("/workout/empty")}
          className={cn(
            "w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
            isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm"
          )}
        >
          <Plus className="w-5 h-5" /> Start Empty Workout
        </motion.button>

        {/* Routines Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold mb-4">Routines</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => navigate("/routine/new")}
              className={cn(
                "py-6 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors",
                isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm"
              )}
            >
              <ClipboardList className="w-6 h-6" />
              <span className="font-medium">New Routine</span>
            </button>
            <button 
              className={cn(
                "py-6 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors",
                isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm"
              )}
            >
              <Search className="w-6 h-6" />
              <span className="font-medium">Explore Routines</span>
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
                        setDeleteConfirmId(routine.id);
                      }}
                      className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </div>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0", isDark ? "bg-zinc-800 group-hover:bg-white/20" : "bg-zinc-100 group-hover:bg-zinc-200")}>
                      <Play className={cn("w-4 h-4 ml-0.5", isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900 dark:text-white")} />
                    </div>
                  </div>
                </button>
              );
            })}
            {routines.length === 0 && (
              <div className={cn("text-center py-10", isDark ? "text-zinc-500" : "text-zinc-400")}>
                Chưa có routine nào. Hãy tạo một routine mới!
              </div>
            )}
          </div>
        </motion.div>

        {/* How to get started banner */}
        <motion.button 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full mt-8 bg-[#2c3e50] hover:bg-[#34495e] text-white p-4 rounded-xl flex items-center justify-between transition-colors"
        >
          <span className="font-medium">How to get started</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Delete Routine Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={cn("rounded-3xl p-6 w-full max-w-sm shadow-2xl", isDark ? "bg-[#1c1c1e] text-white" : "bg-white text-zinc-900")}>
            <h3 className="text-xl font-bold mb-2">Xoá Routine?</h3>
            <p className={cn("mb-6", isDark ? "text-zinc-400" : "text-zinc-500")}>Bạn có chắc chắn muốn xoá routine này? Toàn bộ dữ liệu bài tập trong routine này sẽ bị mất.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={cn("flex-1 py-3 rounded-xl font-bold transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteRoutine}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
