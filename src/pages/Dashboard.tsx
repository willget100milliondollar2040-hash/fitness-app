import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Play,
  Dumbbell,
  Activity,
  Flame,
  Plus,
  Trash2,
  Search,
  ArrowRight,
  Trophy,
  Sparkles,
  ClipboardList,
} from "lucide-react";
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
  {
    id: "push",
    title: "Ngày Đẩy (Push)",
    subtitle: "Ngực, Vai, Tay sau",
    duration: "1h 15m",
    iconName: "Flame",
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    id: "pull",
    title: "Ngày Kéo (Pull)",
    subtitle: "Lưng, Tay trước",
    duration: "1h 10m",
    iconName: "Activity",
    color: "text-green-500",
    bg: "bg-green-100",
  },
  {
    id: "legs",
    title: "Ngày Chân (Legs)",
    subtitle: "Đùi trước, Đùi sau, Bắp chân",
    duration: "1h 20m",
    iconName: "Dumbbell",
    color: "text-zinc-900 dark:text-white",
    bg: "bg-zinc-200 dark:bg-zinc-800",
  },
  {
    id: "fullbody",
    title: "Toàn thân (Full Body)",
    subtitle: "Toàn bộ cơ thể",
    duration: "1h 30m",
    iconName: "Activity",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
];

const icons = {
  Flame: Flame,
  Activity: Activity,
  Dumbbell: Dumbbell,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({ count: 0, volume: 0, calories: 0 });
  const [routineSearchQuery, setRoutineSearchQuery] = useState("");
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const filteredRoutines = routines.filter(r => 
    r.title.toLowerCase().includes(routineSearchQuery.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(routineSearchQuery.toLowerCase())
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null);
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

        // Weekly stats
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeekWorkouts = history.filter(w => new Date(w.start_time) >= startOfWeek);
        const weeklyVolume = thisWeekWorkouts.reduce((acc, w) => acc + (w.volume || 0), 0);
        const weeklyCalories = thisWeekWorkouts.length * 300; // Simple estimation: 300 kcal per workout

        setWeeklyStats({
          count: thisWeekWorkouts.length,
          volume: weeklyVolume,
          calories: weeklyCalories
        });

        // Calculate simple streak
        const dates = history.map((w) => new Date(w.start_time).toDateString());
        const uniqueDates = [...new Set(dates)].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime(),
        );

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
    setIsLoadingRoutines(true);
    try {
      const data = await workoutService.getRoutines(uid);
      if (data && data.length > 0) {
        setRoutines(
          data.map((r) => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle || "",
            duration: r.duration || "",
            iconName: r.icon_name as any,
            color: r.color || "",
            bg: r.bg || "",
            exercises: r.exercises,
          })),
        );
      } else {
        // Save defaults to Supabase and update state with real IDs
        const savedRoutines = await Promise.all(
          defaultRoutines.map((r) =>
            workoutService.saveRoutine({
              user_id: uid,
              title: r.title,
              subtitle: r.subtitle,
              duration: r.duration,
              icon_name: r.iconName,
              color: r.color,
              bg: r.bg,
              exercises: [],
            }),
          ),
        );

        setRoutines(
          savedRoutines.map((r) => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle || "",
            duration: r.duration || "",
            iconName: r.icon_name as any,
            color: r.color || "",
            bg: r.bg || "",
            exercises: r.exercises,
          })),
        );
      }
    } catch (e) {
      console.error("Failed to fetch routines", e);
    } finally {
      setIsLoadingRoutines(false);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    setRoutineToDelete(id);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const confirmDeleteRoutine = async () => {
    if (!userId || !routineToDelete) return;

    const id = routineToDelete;
    
    // Optimistic update - disappear immediately
    const previousRoutines = [...routines];
    setRoutines(routines.filter((r) => r.id !== id));
    localStorage.removeItem(`workout_${id}`);
    setShowDeleteModal(false);

    try {
      await workoutService.deleteRoutine(id);
      setRoutineToDelete(null);
    } catch (e) {
      console.error("Failed to delete routine", e);
      // Rollback if failed
      setRoutines(previousRoutines);
      setDeleteError("Không thể xóa lịch tập. Vui lòng thử lại.");
      setShowDeleteModal(true);
    }
  };

  return (
    <div
      className={cn(
        "min-h-full pb-24 transition-colors duration-300",
        isDark ? "bg-[#0A0A0A] text-white" : "bg-white text-zinc-900",
      )}
    >
      <div className="p-5 space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-3xl text-white relative overflow-hidden",
            isDark ? "bg-[#141414] border border-[#1F1F1F]" : "bg-white border border-zinc-100"
          )}
        >
          {/* Animated Gradient Mesh Background */}
          <div className="absolute inset-0 opacity-20 dark:opacity-40">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <h1 className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>
              {userName ? `Chào ${userName},` : "Chào bạn,"}
            </h1>
            <p className={cn("mb-6 italic text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>
              "{["Không có gì là không thể với một người luôn biết cố gắng.", "Mồ hôi của hôm nay là nụ cười của ngày mai.", "Đừng dừng lại khi mệt mỏi, hãy dừng lại khi đã xong.", "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.", "Mỗi bước đi nhỏ đều dẫn đến một hành trình lớn."][new Date().getDay() % 5]}"
            </p>
            <button
              onClick={() => navigate("/workout/empty")}
              className="bg-gradient-primary text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg glow-primary"
            >
              <Play className="w-5 h-5 fill-current" />
              Bắt đầu tập ngay
            </button>
          </div>
          <Dumbbell className={cn("absolute -right-4 -bottom-4 w-32 h-32 rotate-12", isDark ? "text-white/5" : "text-black/5")} />
        </motion.div>

        {/* Today's Plan (Horizontal Scroll) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className={cn("font-bold text-lg px-1", isDark ? "text-white" : "text-zinc-900")}>Kế hoạch hôm nay</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
            {/* Example Plan Cards */}
            <div className={cn("min-w-[280px] snap-center p-5 rounded-2xl border flex flex-col gap-3", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Sắp tới</span>
                <span className={cn("text-xs font-medium", isDark ? "text-zinc-500" : "text-zinc-400")}>17:00</span>
              </div>
              <div>
                <h3 className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>Ngày Đẩy (Push)</h3>
                <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>Ngực, Vai, Tay sau</p>
              </div>
              <button className="mt-auto w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Bắt đầu
              </button>
            </div>
            <div className={cn("min-w-[280px] snap-center p-5 rounded-2xl border flex flex-col gap-3", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Dinh dưỡng</span>
                <span className={cn("text-xs font-medium", isDark ? "text-zinc-500" : "text-zinc-400")}>19:30</span>
              </div>
              <div>
                <h3 className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>Bữa tối phục hồi</h3>
                <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>Ức gà, khoai lang, rau xanh</p>
              </div>
              <button className="mt-auto w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Xem chi tiết
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors h-full flex flex-col justify-center relative overflow-hidden",
              isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100"
            )}
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className={cn("font-bold flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
                <Activity className="w-5 h-5 text-green-500" />
                Tóm tắt tuần này
              </h3>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full", isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500")}>
                Tháng {new Date().getMonth() + 1}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-auto relative z-10">
              <div className="text-center">
                <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>{weeklyStats.count}</p>
                <p className={cn("text-[10px] font-bold uppercase tracking-tighter mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Buổi tập</p>
              </div>
              <div className="text-center border-x border-zinc-800/10 dark:border-[#1F1F1F]">
                <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>{weeklyStats.volume.toLocaleString()}</p>
                <p className={cn("text-[10px] font-bold uppercase tracking-tighter mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Volume (kg)</p>
              </div>
              <div className="text-center">
                <p className={cn("text-2xl font-bold text-green-500")}>{weeklyStats.calories}</p>
                <p className={cn("text-[10px] font-bold uppercase tracking-tighter mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Calories</p>
              </div>
            </div>
            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
          </motion.div>

          {/* Gamification Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 h-full"
          >
          <div
            className={cn(
              "rounded-2xl p-5 shadow-sm border transition-colors flex flex-col items-center justify-center text-center relative overflow-hidden",
              isDark
                ? "bg-[#141414] border-[#1F1F1F]"
                : "bg-white border-zinc-100",
            )}
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-3 relative z-10">
              <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
            <h3
              className={cn(
                "text-4xl font-bold text-orange-500 relative z-10",
              )}
            >
              {streak}
            </h3>
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wider mt-1 relative z-10",
                isDark ? "text-zinc-500" : "text-zinc-400",
              )}
            >
              Ngày liên tiếp
            </p>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          <div
            className={cn(
              "rounded-2xl p-5 shadow-sm border transition-colors flex flex-col items-center justify-center text-center relative overflow-hidden",
              isDark
                ? "bg-[#141414] border-[#1F1F1F]"
                : "bg-white border-zinc-100",
            )}
          >
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-3 relative z-10">
              <Trophy className="w-6 h-6 text-green-500" />
            </div>
            <h3
              className={cn(
                "text-4xl font-bold text-green-500 relative z-10",
              )}
            >
              {totalWorkouts}
            </h3>
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wider mt-1 relative z-10",
                isDark ? "text-zinc-500" : "text-zinc-400",
              )}
            >
              Buổi tập
            </p>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </motion.div>
        </div>

        {/* Active Routine Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Lịch tập của bạn</h2>
            <button 
              onClick={() => navigate("/routine/new")}
              className="text-sm font-bold text-green-500 hover:text-green-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Tạo mới
            </button>
          </div>

          {/* Existing Routines List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.length > 0 && (
              <div className="relative md:col-span-2 mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lịch tập..."
                  value={routineSearchQuery}
                  onChange={(e) => setRoutineSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all text-sm",
                    isDark ? "bg-[#141414] border-[#1F1F1F] text-white placeholder:text-zinc-500" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                  )}
                />
              </div>
            )}

            {isLoadingRoutines ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn("h-[88px] rounded-2xl animate-pulse", isDark ? "bg-[#141414]" : "bg-zinc-200")} />
                ))}
              </>
            ) : routines.length === 0 ? (
              <div className="text-center py-12 md:col-span-2">
                <Dumbbell className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Chưa có lịch tập nào</h3>
                <p className={cn("mb-6", isDark ? "text-zinc-500" : "text-zinc-500")}>Tạo lịch tập đầu tiên để bắt đầu tập luyện!</p>
                <button 
                  onClick={() => navigate("/routine/new")} 
                  className="bg-gradient-primary text-white font-bold px-6 py-3 rounded-xl transition-colors glow-primary"
                >
                  Tạo Lịch Tập Ngay
                </button>
              </div>
            ) : filteredRoutines.length === 0 ? (
              <div className={cn("text-center py-8 rounded-2xl border md:col-span-2", isDark ? "border-[#1F1F1F] bg-[#141414]" : "border-zinc-200 bg-white")}>
                <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-zinc-500")}>Không tìm thấy lịch tập nào phù hợp.</p>
              </div>
            ) : (
              filteredRoutines.map((routine) => {
                const IconComponent = icons[routine.iconName] || Activity;
                // Extract color name from text-color-500
                const colorMatch = routine.color.match(/text-([a-z]+)-/);
                const colorName = colorMatch ? colorMatch[1] : 'blue';
                const borderColorClass = `bg-${colorName}-500`;

                return (
                  <button
                    key={routine.id}
                    onClick={() => navigate(`/workout/${routine.id}`)}
                    className={cn(
                      "w-full rounded-2xl p-4 transition-all active:scale-[0.98] text-left flex items-center gap-4 group relative overflow-hidden",
                      isDark
                        ? "bg-[#141414] hover:bg-[#1F1F1F] border border-[#1F1F1F]"
                        : "bg-white border border-zinc-200 hover:border-zinc-400 shadow-sm",
                    )}
                  >
                    {/* Color-coded left border */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", borderColorClass)} />

                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${routine.bg} shrink-0 ml-1`}
                    >
                      <IconComponent className={`w-6 h-6 ${routine.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "text-base font-bold truncate",
                          isDark ? "text-white" : "text-zinc-900",
                        )}
                      >
                        {routine.title}
                      </h3>
                      <p
                        className={cn(
                          "text-sm mt-0.5 truncate",
                          isDark ? "text-zinc-400" : "text-zinc-500",
                        )}
                      >
                        {routine.subtitle}
                      </p>
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
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                          isDark
                            ? "bg-zinc-800 group-hover:bg-white/20"
                            : "bg-zinc-100 group-hover:bg-zinc-200",
                        )}
                      >
                        <Play
                          className={cn(
                            "w-5 h-5 ml-0.5",
                            isDark
                              ? "text-zinc-400 group-hover:text-white"
                              : "text-zinc-400 group-hover:text-zinc-900 dark:text-white",
                          )}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Routine creation/discovery buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate("/routine/new")}
            className={cn(
              "py-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95",
              isDark
                ? "bg-[#141414] hover:bg-[#1F1F1F] text-white border border-[#1F1F1F]"
                : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm",
            )}
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-1", isDark ? "bg-zinc-800" : "bg-zinc-100")}>
              <ClipboardList className="w-6 h-6 text-green-500" />
            </div>
            <span className="font-bold">Tạo lịch tập</span>
          </button>
          <button
            onClick={() => navigate("/marketplace")}
            className={cn(
              "py-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95",
              isDark
                ? "bg-[#141414] hover:bg-[#1F1F1F] text-white border border-[#1F1F1F]"
                : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-sm",
            )}
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-1", isDark ? "bg-[#1F1F1F]" : "bg-zinc-100")}>
              <Search className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="font-bold">Khám phá</span>
          </button>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-full max-w-sm rounded-3xl p-6 shadow-xl",
              isDark ? "bg-[#141414] border border-[#1F1F1F] text-white" : "bg-white text-zinc-900"
            )}
          >
            <h3 className="text-xl font-bold mb-2">Xóa lịch tập?</h3>
            <p className={cn("mb-6", isDark ? "text-zinc-400" : "text-zinc-500")}>
              {deleteError || "Bạn có chắc chắn muốn xóa lịch tập này không? Hành động này không thể hoàn tác."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRoutineToDelete(null);
                  setDeleteError(null);
                }}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold transition-colors",
                  isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                )}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteRoutine}
                className="flex-1 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
