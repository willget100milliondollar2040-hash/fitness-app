import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingBag, Search, Star, Download, Users, Dumbbell, Clock, Loader2 } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { workoutService } from "../lib/workoutService";
import { supabase } from "../lib/supabase";

const MOCK_TEMPLATES = [
  {
    id: "t1",
    title: "Push Pull Legs (PPL)",
    author: "Jeff Nippard",
    price: 0,
    downloads: 12400,
    rating: 4.9,
    duration: "60-90 phút",
    level: "Trung bình",
    tags: ["Tăng cơ", "Sức mạnh"],
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80"
  },
  {
    id: "t2",
    title: "Arnold's Golden Six",
    author: "Arnold Schwarzenegger",
    price: 0,
    downloads: 8500,
    rating: 4.8,
    duration: "45-60 phút",
    level: "Người mới",
    tags: ["Toàn thân", "Cổ điển"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80"
  },
  {
    id: "t3",
    title: "Powerbuilding 101",
    author: "EliteFTS",
    price: 4.99,
    downloads: 3200,
    rating: 4.7,
    duration: "90 phút",
    level: "Nâng cao",
    tags: ["Cử tạ", "Tăng cơ"],
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80"
  },
  {
    id: "t4",
    title: "Calisthenics Fundamentals",
    author: "Chris Heria",
    price: 0,
    downloads: 15600,
    rating: 4.9,
    duration: "45 phút",
    level: "Mọi cấp độ",
    tags: ["Trọng lượng cơ thể", "Cơ bụng"],
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&q=80",
    exercises: [
      { name: "Hít đất", sets: 3, reps: 15, weight: 0 },
      { name: "Pull up", sets: 3, reps: 8, weight: 0 },
      { name: "Plank", sets: 3, reps: 60, weight: 0 }
    ]
  },
  {
    id: "t5",
    title: "Lộ Trình Calisthenics Nền Tảng (Beginner Foundation)",
    author: "BuddyFit VN",
    price: 0,
    downloads: 1200,
    rating: 5.0,
    duration: "60-90 phút/buổi",
    level: "Người mới",
    tags: ["Trọng lượng cơ thể", "Sức mạnh cơ bản", "Calisthenics"],
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80",
    routines: [
      {
        title: "Buổi 1: PUSH (Đẩy)",
        subtitle: "Ngực, Vai, Tay sau",
        duration: "60-90 phút",
        icon_name: "Flame",
        color: "text-orange-500",
        bg: "bg-orange-100",
        exercises: [
          { name: "Incline Push-ups (Chống đẩy trên bục cao)", sets: 3, reps: 12, weight: 0 },
          { name: "Knee Push-ups (Chống đẩy quỳ gối)", sets: 3, reps: 12, weight: 0 },
          { name: "Pike Push-ups (Chống đẩy gập góc chữ V)", sets: 3, reps: 8, weight: 0 },
          { name: "Bench Dips (Nhún tay sau trên ghế)", sets: 3, reps: 15, weight: 0 },
          { name: "Plank to Push-up", sets: 3, reps: 8, weight: 0 }
        ]
      },
      {
        title: "Buổi 2: PULL (Kéo)",
        subtitle: "Lưng, Xô, Tay trước, Lực bám",
        duration: "60-90 phút",
        icon_name: "Activity",
        color: "text-blue-500",
        bg: "bg-blue-100",
        exercises: [
          { name: "Australian Pull-ups / Bodyweight Rows", sets: 4, reps: 12, weight: 0 },
          { name: "Negative Pull-ups (Hạ người từ từ 3-5s)", sets: 3, reps: 5, weight: 0 },
          { name: "Superman (Nằm sấp nâng tay chân)", sets: 3, reps: 15, weight: 0 },
          { name: "Dead Hang (Treo người tự do)", sets: 3, reps: 30, weight: 0 },
          { name: "Bicep Bodyweight Curls", sets: 3, reps: 10, weight: 0 }
        ]
      },
      {
        title: "Buổi 3: LEGS & CORE (Chân & Bụng)",
        subtitle: "Chân, Mông, Bụng",
        duration: "60-90 phút",
        icon_name: "Dumbbell",
        color: "text-purple-500",
        bg: "bg-purple-100",
        exercises: [
          { name: "Bodyweight Squats (Ngồi xổm cơ bản)", sets: 4, reps: 20, weight: 0 },
          { name: "Alternating Lunges (Chùng chân luân phiên)", sets: 3, reps: 12, weight: 0 },
          { name: "Glute Bridges (Nằm nâng hông)", sets: 3, reps: 15, weight: 0 },
          { name: "Calf Raises (Kiễng gót chân)", sets: 3, reps: 20, weight: 0 },
          { name: "Plank (Đoán ván)", sets: 3, reps: 60, weight: 0 },
          { name: "Lying Leg Raises (Nằm ngửa nâng hai chân)", sets: 3, reps: 15, weight: 0 }
        ]
      }
    ]
  },
  {
    id: "t6",
    title: "Lộ Trình Calisthenics Trung Cấp (Intermediate Hypertrophy)",
    author: "BuddyFit VN",
    price: 0,
    downloads: 850,
    rating: 4.9,
    duration: "60-90 phút/buổi",
    level: "Trung cấp",
    tags: ["Trọng lượng cơ thể", "Tăng cơ", "Calisthenics"],
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80",
    routines: [
      {
        title: "Buổi 1: PUSH (Đẩy)",
        subtitle: "Ngực, Vai, Tay sau",
        duration: "60-90 phút",
        icon_name: "Flame",
        color: "text-orange-500",
        bg: "bg-orange-100",
        exercises: [
          { name: "Parallel Bar Dips (Chống đẩy trên xà kép)", sets: 4, reps: 12, weight: 0 },
          { name: "Decline Push-ups (Chống đẩy dốc xuống)", sets: 3, reps: 15, weight: 0 },
          { name: "Elevated Pike Push-ups (Pike Push-ups chân trên bục)", sets: 3, reps: 12, weight: 0 },
          { name: "Diamond Push-ups (Chống đẩy kim cương)", sets: 3, reps: 12, weight: 0 },
          { name: "Bodyweight Triceps Extensions (Duỗi tay sau)", sets: 3, reps: 12, weight: 0 }
        ]
      },
      {
        title: "Buổi 2: PULL (Kéo)",
        subtitle: "Lưng, Xô, Tay trước, Lực bám",
        duration: "60-90 phút",
        icon_name: "Activity",
        color: "text-blue-500",
        bg: "bg-blue-100",
        exercises: [
          { name: "Standard Pull-ups (Kéo xà đơn cơ bản)", sets: 4, reps: 10, weight: 0 },
          { name: "Chin-ups (Kéo xà đơn hẹp tay)", sets: 3, reps: 10, weight: 0 },
          { name: "Elevated Australian Pull-ups (Kéo xà nghiêng chân trên bục)", sets: 3, reps: 12, weight: 0 },
          { name: "Scapula Pull-ups (Nhấc bả vai)", sets: 3, reps: 15, weight: 0 },
          { name: "Hanging Knee Raises (Treo xà nhấc gối)", sets: 3, reps: 15, weight: 0 }
        ]
      },
      {
        title: "Buổi 3: LEGS & CORE (Chân & Bụng)",
        subtitle: "Đùi, Mông, Bụng",
        duration: "60-90 phút",
        icon_name: "Dumbbell",
        color: "text-purple-500",
        bg: "bg-purple-100",
        exercises: [
          { name: "Bulgarian Split Squats", sets: 4, reps: 12, weight: 0 },
          { name: "Jump Squats (Squat bật nhảy)", sets: 3, reps: 15, weight: 0 },
          { name: "Single-leg Glute Bridges (Nâng hông 1 chân)", sets: 3, reps: 12, weight: 0 },
          { name: "Hollow Body Hold (Giữ tư thế con thuyền)", sets: 3, reps: 60, weight: 0 },
          { name: "L-Sit Tucks", sets: 3, reps: 20, weight: 0 },
          { name: "Single-leg Calf Raises (Kiễng gót 1 chân)", sets: 3, reps: 15, weight: 0 }
        ]
      }
    ]
  }
];

export default function Marketplace() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDownload = async (template: any) => {
    if (template.price > 0) {
      alert("Tính năng thanh toán đang được phát triển. Vui lòng thử các bài tập miễn phí.");
      return;
    }

    setIsDownloading(template.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Vui lòng đăng nhập để tải bài tập.");
        return;
      }

      if (template.routines && template.routines.length > 0) {
        await Promise.all(template.routines.map((routine: any) => 
          workoutService.saveRoutine({
            user_id: user.id,
            title: routine.title,
            subtitle: routine.subtitle || `bởi ${template.author}`,
            duration: routine.duration || template.duration,
            icon_name: routine.icon_name || "Dumbbell",
            color: routine.color || "text-blue-500",
            bg: routine.bg || "bg-blue-100",
            exercises: routine.exercises || []
          })
        ));
      } else {
        await workoutService.saveRoutine({
          user_id: user.id,
          title: template.title,
          subtitle: `bởi ${template.author}`,
          duration: template.duration,
          icon_name: "Dumbbell",
          color: "text-blue-500",
          bg: "bg-blue-100",
          exercises: template.exercises || []
        });
      }

      alert(`Đã tải xuống ${template.title}! Bài tập này đã được thêm vào danh sách của bạn.`);
    } catch (error) {
      console.error("Download failed", error);
      alert("Tải xuống thất bại. Vui lòng thử lại.");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300 pb-24", isDark ? "bg-black text-white" : "bg-white text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <ShoppingBag className="w-6 h-6 text-blue-500" />
          Cửa hàng
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Khám phá và chia sẻ các bài tập.</p>
      </motion.div>

      <div className="relative">
        <Search className={cn("w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-zinc-500" : "text-zinc-400")} />
        <input 
          type="text"
          placeholder="Tìm kiếm bài tập, tác giả, thẻ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn("w-full pl-12 pr-4 py-4 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl transition-all outline-none shadow-sm", isDark ? "bg-[#141414] border-[#1F1F1F] text-white placeholder:text-zinc-500 focus:bg-[#1A1A1A]" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-50")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("rounded-2xl overflow-hidden shadow-sm border transition-colors group", isDark ? "bg-[#141414] border-[#1F1F1F] hover:border-zinc-700" : "bg-white border-zinc-100 hover:border-zinc-300")}
          >
            <div className="h-40 w-full relative overflow-hidden">
              <img src={template.image} alt={template.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent dark:from-[#141414] dark:via-black/60 dark:to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{template.title}</h3>
                  <p className="text-zinc-300 text-xs mt-1">bởi {template.author}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-white font-bold text-sm border border-white/10 shadow-sm">
                  {template.price === 0 ? "MIỄN PHÍ" : `$${template.price}`}
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className={cn("flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {template.rating}
                </div>
                <div className={cn("flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Users className="w-4 h-4" />
                  {(template.downloads / 1000).toFixed(1)}k
                </div>
                <div className={cn("flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Clock className="w-4 h-4" />
                  {template.duration}
                </div>
                <div className={cn("flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Dumbbell className="w-4 h-4" />
                  {template.level}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span key={tag} className={cn("text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider", isDark ? "bg-zinc-800/50 text-zinc-300 border border-zinc-700/50" : "bg-zinc-100 text-zinc-600 border border-zinc-200")}>
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleDownload(template)}
                disabled={isDownloading === template.id}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm",
                  isDownloading === template.id 
                    ? "bg-zinc-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-500/25 hover:shadow-lg"
                )}
              >
                {isDownloading === template.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {template.price === 0 ? "Thêm vào bài tập" : "Mua"}
              </button>
            </div>
          </motion.div>
        ))}
        
        {filteredTemplates.length === 0 && (
          <div className={cn("text-center py-10", isDark ? "text-zinc-500" : "text-zinc-400")}>
            Không tìm thấy bài tập nào phù hợp với "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
