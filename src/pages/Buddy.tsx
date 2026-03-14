import { motion } from "motion/react";
import { Users, BellRing, Trophy, Activity, CheckCircle2 } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";

export default function Buddy() {
  const buddies = [
    { name: "Minh Tuấn", status: "Đã tập xong", streak: 5, avatar: "user2" },
    { name: "Lan Anh", status: "Chưa tập", streak: 2, avatar: "user3" },
  ];
  const { isDark } = useTheme();

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <Users className="w-6 h-6 text-black dark:text-white" />
          Buddy Mode
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Cùng nhau tập luyện, cùng nhau tiến bộ.</p>
      </motion.div>

      {/* Weekly Challenge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-100">Thử thách tuần này</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Ai Plank lâu hơn?</h3>
          <p className="text-indigo-100 text-sm mb-6">Giữ plank lâu nhất có thể. Người thắng nhận huy hiệu "Lõi Thép".</p>
          
          <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover" src="https://picsum.photos/seed/user1/100/100" alt="You" referrerPolicy="no-referrer" />
              <img className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover" src="https://picsum.photos/seed/user2/100/100" alt="Buddy" referrerPolicy="no-referrer" />
            </div>
            <button className="flex-1 bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
              Tham gia ngay
            </button>
          </div>
        </div>
      </motion.div>

      {/* Buddies List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Nhóm của bạn</h3>
        
        <div className="space-y-3">
          {buddies.map((buddy, i) => (
            <div key={i} className={cn("p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover" src={`https://picsum.photos/seed/${buddy.avatar}/100/100`} alt={buddy.name} referrerPolicy="no-referrer" />
                  {buddy.status === "Đã tập xong" && (
                    <div className={cn("absolute -bottom-1 -right-1 rounded-full p-0.5", isDark ? "bg-[#1c1c1e]" : "bg-white")}>
                      <CheckCircle2 className="w-4 h-4 text-black dark:text-white fill-zinc-200 dark:fill-zinc-800" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>{buddy.name}</h4>
                  <div className="flex items-center gap-2 text-xs font-medium mt-1">
                    <span className={buddy.status === "Đã tập xong" ? "text-black dark:text-white" : isDark ? "text-zinc-400" : "text-zinc-500"}>
                      {buddy.status}
                    </span>
                    <span className={cn("text-zinc-300", isDark && "text-zinc-700")}>•</span>
                    <span className="text-orange-500 flex items-center gap-0.5">
                      <Activity className="w-3 h-3" /> {buddy.streak} ngày
                    </span>
                  </div>
                </div>
              </div>
              
              {buddy.status !== "Đã tập xong" && (
                <button className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-colors", isDark ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-white/20 hover:text-white hover:border-white/30" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-black hover:border-zinc-300")}>
                  <BellRing className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
