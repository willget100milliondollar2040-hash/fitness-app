import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { TrendingUp, Camera, Activity, Calendar, Award, Clock, Dumbbell, History, Plus, Download, Sparkles } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { workoutService } from "../lib/workoutService";
import { supabase } from "../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoogleGenAI } from "@google/genai";

export default function Progress() {
  const { isDark } = useTheme();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const [photos, setPhotos] = useState<{id: string, url: string, date: string}[]>(() => {
    const saved = localStorage.getItem("bodyPhotos");
    return saved ? JSON.parse(saved) : [];
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto = {
          id: Date.now().toString(),
          url: reader.result as string,
          date: new Date().toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
        };
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        localStorage.setItem("bodyPhotos", JSON.stringify(updatedPhotos));
      };
      reader.readAsDataURL(file);
    }
  };

  const firstPhoto = photos[0];
  const latestPhoto = photos.length > 1 ? photos[photos.length - 1] : null;

  const analyzeProgress = async () => {
    if (!firstPhoto || !latestPhoto) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const getBase64Data = (dataUrl: string) => {
        const arr = dataUrl.split(",");
        return {
          mimeType: arr[0].match(/:(.*?);/)?.[1] || "image/jpeg",
          data: arr[1]
        };
      };

      const firstImg = getBase64Data(firstPhoto.url);
      const latestImg = getBase64Data(latestPhoto.url);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: firstImg },
            { inlineData: latestImg },
            { text: "Phân tích hai bức ảnh cơ thể này (trước và sau). Cung cấp một bản tóm tắt ngắn gọn, khích lệ về sự tiến bộ rõ rệt, tập trung vào độ nét của cơ bắp, tư thế hoặc những thay đổi tổng thể về vóc dáng. Giữ dưới 3 câu và mang tính động viên cao bằng tiếng Việt." }
          ]
        }
      });

      setAnalysisResult(response.text || "Bạn đang tiến bộ rất tốt! Hãy tiếp tục cố gắng nhé.");
    } catch (error) {
      console.error("Error analyzing progress:", error);
      setAnalysisResult("Không thể phân tích tiến độ. Vui lòng thử lại sau.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const exportToCSV = () => {
    if (workouts.length === 0) return;
    
    const headers = ["Ngày", "Tên bài tập", "Thời lượng (s)", "Khối lượng (kg)", "Số hiệp"];
    const rows = workouts.map(w => [
      new Date(w.start_time).toLocaleDateString(),
      w.name,
      w.duration,
      w.volume || 0,
      w.sets_count || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "workout_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (workouts.length === 0) return;
    
    const doc = new jsPDF();
    doc.text("Lịch sử tập luyện", 14, 15);
    
    const tableData = workouts.map(w => [
      new Date(w.start_time).toLocaleDateString('vi-VN'),
      w.name,
      formatTime(w.duration),
      `${w.volume || 0} kg`,
      w.sets_count || 0
    ]);
    
    autoTable(doc, {
      head: [['Ngày', 'Bài tập', 'Thời lượng', 'Khối lượng', 'Số hiệp']],
      body: tableData,
      startY: 20,
    });
    
    doc.save("workout_history.pdf");
  };

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <TrendingUp className="w-6 h-6 text-black dark:text-white" />
          Tiến độ
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Theo dõi sự thay đổi hàng ngày của bạn.</p>
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
            Ảnh cơ thể hàng tuần
          </h3>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-black dark:text-white font-medium hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Thêm ảnh
          </button>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            className="hidden" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {firstPhoto ? (
            <div className={cn("relative rounded-2xl overflow-hidden border shadow-inner", isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-100 bg-zinc-50")}>
              <img src={firstPhoto.url} alt="Before" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="text-white text-xs font-bold uppercase tracking-wider">{firstPhoto.date}</span>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn("relative rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors h-48", isDark ? "border-zinc-700" : "border-zinc-300")}
            >
              <Camera className={cn("w-8 h-8 mb-2", isDark ? "text-zinc-600" : "text-zinc-400")} />
              <span className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>Thêm ảnh đầu tiên</span>
            </div>
          )}
          
          {latestPhoto ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-black dark:border-white shadow-lg">
              <img src={latestPhoto.url} alt="After" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-2 right-2 bg-black dark:bg-white dark:text-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                Mới nhất
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="text-white text-xs font-bold uppercase tracking-wider">{latestPhoto.date}</span>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn("relative rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors h-48", isDark ? "border-zinc-700" : "border-zinc-300")}
            >
              <Camera className={cn("w-8 h-8 mb-2", isDark ? "text-zinc-600" : "text-zinc-400")} />
              <span className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>Thêm ảnh mới nhất</span>
            </div>
          )}
        </div>

        {firstPhoto && latestPhoto && (
          <div className="mt-6">
            <button
              onClick={analyzeProgress}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              <Sparkles className={cn("w-5 h-5", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Đang phân tích..." : "AI Phân tích tiến độ"}
            </button>
            
            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("mt-4 p-4 rounded-2xl border text-sm leading-relaxed", isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-100" : "bg-blue-50 border-blue-100 text-blue-900")}
              >
                {analysisResult}
              </motion.div>
            )}
          </div>
        )}
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
          <span className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Bài tập</span>
        </div>
        
        <div className={cn("p-5 rounded-3xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", isDark ? "bg-orange-500/20" : "bg-orange-100")}>
            <Dumbbell className={cn("w-6 h-6", isDark ? "text-orange-400" : "text-orange-500")} />
          </div>
          <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>
            {workouts.reduce((acc, w) => acc + (w.volume || 0), 0).toLocaleString()}
          </span>
          <span className={cn("text-xs font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Tổng khối lượng (kg)</span>
        </div>
      </motion.div>

      {/* Workout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn("rounded-3xl p-6 shadow-sm border transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("font-bold flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
            <History className="w-5 h-5 text-blue-500" />
            Lịch sử tập luyện
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              disabled={workouts.length === 0}
              className={cn("text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700")}
            >
              CSV
            </button>
            <button 
              onClick={exportToPDF}
              disabled={workouts.length === 0}
              className={cn("text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700")}
            >
              PDF
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Đang tải dữ liệu...</div>
        ) : workouts.length === 0 ? (
          <div className={cn("text-center py-12 rounded-2xl border border-dashed", isDark ? "border-zinc-800 bg-[#1c1c1e]" : "border-zinc-200 bg-white")}>
            <History className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-zinc-700" : "text-zinc-300")} />
            <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Chưa có lịch sử tập luyện</h3>
            <p className={cn("text-sm mb-6", isDark ? "text-zinc-500" : "text-zinc-500")}>Hoàn thành bài tập đầu tiên để xem tiến độ của bạn!</p>
          </div>
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
                    <div className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>{workout.sets_count} hiệp</div>
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
