import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Camera, Activity, Calendar, Award, Clock, Dumbbell, History } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { workoutService } from "../lib/workoutService";
import { supabase } from "../lib/supabase";

export default function Progress() {
  const { isDark } = useTheme();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const history = await workoutService.getWorkoutHistory(user.id);
          setWorkouts(history || []);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <TrendingUp className="w-6 h-6 text-black dark:text-white" />
          Tiến độ
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Theo dõi sự thay đổi của bạn mỗi ngày.</p>
      </motion.div>

      {/* Body Photos */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={cn("rounded-3xl p-6 shadow-sm border transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={cn("font-bold flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
            <Camera className="w-5 h-5 text-black dark:text-white" />
            Ảnh Body Hàng Tuần
          </h3>
          <button className="text-sm text-black dark:text-white font-medium hover:underline">Thêm ảnh</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={cn("relative rounded-2xl overflow-hidden border shadow-inner", isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-100 bg-zinc-50")}>
            <img src="https://picsum.photos/seed/before/300/400" alt="Before" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <span className="text-white text-xs font-bold uppercase tracking-wider">Tuần 1</span>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border-2 border-black dark:border-white shadow-lg">
            <img src="https://picsum.photos/seed/after/300/400" alt="After" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
            <div className="absolute top-2 right-2 bg-black dark:bg-white dark:text-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              Mới nhất
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <span className="text-white text-xs font-bold uppercase tracking-wider">Tuần 4</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className={cn("p-5 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", isDark ? "bg-blue-500/20" : "bg-blue-100")}>
            <Activity className={cn("w-6 h-6", isDark ? "text-blue-400" : "text-blue-500")} />
          </div>
          <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>{workouts.length}</span>
          <span className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Buổi tập</span>
        </div>
        
        <div className={cn("p-5 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", isDark ? "bg-orange-500/20" : "bg-orange-100")}>
            <Dumbbell className={cn("w-6 h-6", isDark ? "text-orange-400" : "text-orange-500")} />
          </div>
          <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>
            {workouts.reduce((acc, w) => acc + (w.volume || 0), 0).toLocaleString()}
          </span>
          <span className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Tổng Volume (kg)</span>
        </div>
      </motion.div>

      {/* Workout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn("rounded-3xl p-6 shadow-sm border transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
      >
        <h3 className={cn("font-bold flex items-center gap-2 mb-4", isDark ? "text-white" : "text-zinc-900")}>
          <History className="w-5 h-5 text-blue-500" />
          Lịch sử tập luyện
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Đang tải dữ liệu...</div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">Chưa có dữ liệu tập luyện.</div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className={cn("p-4 rounded-2xl border", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>{workout.name}</h4>
                    <div className={cn("text-xs mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                      {new Date(workout.start_time).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-500 font-bold">{formatTime(workout.duration)}</div>
                    <div className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>{workout.sets_count} sets</div>
                  </div>
                </div>
                
                {/* Show records if any */}
                {workout.workout_exercises?.map((ex: any) => {
                  const records = ex.workout_sets?.filter((s: any) => s.is_record);
                  if (records && records.length > 0) {
                    return (
                      <div key={ex.id} className="mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{ex.exercise_name}</div>
                        <div className="flex flex-wrap gap-2">
                          {records.map((record: any) => (
                            <span key={record.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 text-xs font-bold">
                              <Award className="w-3 h-3" />
                              {record.kg}kg x {record.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
