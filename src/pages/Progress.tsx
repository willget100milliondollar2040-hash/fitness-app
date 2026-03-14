import { motion } from "motion/react";
import { TrendingUp, Camera, Activity, Calendar, Award } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";

export default function Progress() {
  const { isDark } = useTheme();

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
          <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>16</span>
          <span className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Buổi tập</span>
        </div>
        
        <div className={cn("p-5 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", isDark ? "bg-orange-500/20" : "bg-orange-100")}>
            <Calendar className={cn("w-6 h-6", isDark ? "text-orange-400" : "text-orange-500")} />
          </div>
          <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>4</span>
          <span className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Tuần liên tiếp</span>
        </div>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn("rounded-3xl p-6 shadow-sm border transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
      >
        <h3 className={cn("font-bold flex items-center gap-2 mb-4", isDark ? "text-white" : "text-zinc-900")}>
          <Award className="w-5 h-5 text-yellow-500" />
          Thành tích gần đây
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl", isDark ? "bg-yellow-500/20" : "bg-yellow-100")}>
              🔥
            </div>
            <div>
              <h4 className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>Chuỗi 10 ngày</h4>
              <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>Tập luyện không nghỉ 10 ngày liên tiếp.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl", isDark ? "bg-white/20" : "bg-zinc-200")}>
              💪
            </div>
            <div>
              <h4 className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>Kỷ lục Plank</h4>
              <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>Giữ plank 2 phút 30 giây.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
