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

      alert(`Đã tải xuống ${template.title}! Bài tập này đã được thêm vào danh sách của bạn.`);
    } catch (error) {
      console.error("Download failed", error);
      alert("Tải xuống thất bại. Vui lòng thử lại.");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300 pb-24", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <ShoppingBag className="w-6 h-6 text-blue-500" />
          Cửa hàng
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Khám phá và chia sẻ các bài tập.</p>
      </motion.div>

      <div className="relative">
        <Search className={cn("w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-zinc-500" : "text-zinc-400")} />
        <input 
          type="text"
          placeholder="Tìm kiếm bài tập, tác giả, thẻ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn("w-full pl-10 pr-4 py-3 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-2xl transition-all outline-none shadow-sm", isDark ? "bg-[#1c1c1e] text-white placeholder:text-zinc-500 focus:bg-zinc-900" : "bg-white text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-50")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("rounded-3xl overflow-hidden shadow-sm border transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
          >
            <div className="h-32 w-full relative">
              <img src={template.image} alt={template.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{template.title}</h3>
                  <p className="text-zinc-300 text-xs">bởi {template.author}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-white font-bold text-sm">
                  {template.price === 0 ? "MIỄN PHÍ" : `$${template.price}`}
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className={cn("flex items-center gap-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {template.rating}
                </div>
                <div className={cn("flex items-center gap-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Users className="w-3.5 h-3.5" />
                  {(template.downloads / 1000).toFixed(1)}k
                </div>
                <div className={cn("flex items-center gap-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Clock className="w-3.5 h-3.5" />
                  {template.duration}
                </div>
                <div className={cn("flex items-center gap-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Dumbbell className="w-3.5 h-3.5" />
                  {template.level}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span key={tag} className={cn("text-[10px] px-2 py-1 rounded-md font-medium uppercase tracking-wider", isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600")}>
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleDownload(template)}
                disabled={isDownloading === template.id}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2",
                  isDownloading === template.id ? "bg-zinc-500" : "bg-blue-500 hover:bg-blue-600"
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
