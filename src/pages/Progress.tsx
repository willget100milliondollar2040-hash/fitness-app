import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { TrendingUp, Camera, Activity, Calendar, Award, Clock, Dumbbell, History, Plus, Download, Sparkles, BarChart2, Flame, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { workoutService } from "../lib/workoutService";
import { supabase } from "../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PhotoComparison = ({ before, after, beforeDate, afterDate }: { before: string, after: string, beforeDate: string, afterDate: string }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
      const observer = new ResizeObserver(entries => {
        if (entries[0]) {
          setWidth(entries[0].contentRect.width);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-64 rounded-2xl overflow-hidden select-none group border border-[#1F1F1F]">
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={after} 
          alt="After" 
          className="absolute inset-0 h-full object-cover max-w-none" 
          style={{ width: `${width}px` }} 
          referrerPolicy="no-referrer" 
        />
      </div>
      
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <ChevronLeft className="w-4 h-4 text-black -mr-1" />
            <ChevronRight className="w-4 h-4 text-black -ml-1" />
          </div>
        </div>
      </div>
      
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderPosition} 
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />
      
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10 z-10 pointer-events-none">
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Trước</div>
        <div className="text-xs font-medium">{beforeDate}</div>
      </div>
      
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10 z-10 pointer-events-none text-right">
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Sau</div>
        <div className="text-xs font-medium">{afterDate}</div>
      </div>
    </div>
  );
};

const CustomBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} />
      <rect x={x} y={y} width={width} height={height} fill="url(#barHighlight)" rx={6} />
    </g>
  );
};

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

  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        let { error: uploadError } = await supabase.storage.from('body_photos').upload(filePath, file);
        
        if (uploadError) {
          // Try to create the bucket if it doesn't exist
          await supabase.storage.createBucket('body_photos', { public: true });
          const retry = await supabase.storage.from('body_photos').upload(filePath, file);
          if (retry.error) throw retry.error;
        }

        const { data } = supabase.storage.from('body_photos').getPublicUrl(filePath);
        
        const newPhoto = {
          id: Date.now().toString(),
          url: data.publicUrl,
          date: new Date().toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
        };
        
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        localStorage.setItem("bodyPhotos", JSON.stringify(updatedPhotos));
      } catch (error) {
        console.error("Error uploading photo:", error);
        alert("Không thể tải ảnh lên. Vui lòng thử lại.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const firstPhoto = photos[0];
  const latestPhoto = photos.length > 1 ? photos[photos.length - 1] : null;

  const analyzeProgress = async () => {
    if (!firstPhoto || !latestPhoto) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      
      const getBase64Data = async (url: string) => {
        if (url.startsWith('data:')) {
          const arr = url.split(",");
          return {
            mimeType: arr[0].match(/:(.*?);/)?.[1] || "image/jpeg",
            data: arr[1]
          };
        } else {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise<any>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              const arr = result.split(",");
              resolve({
                mimeType: arr[0].match(/:(.*?);/)?.[1] || "image/jpeg",
                data: arr[1]
              });
            };
            reader.readAsDataURL(blob);
          });
        }
      };

      const firstImg = await getBase64Data(firstPhoto.url);
      const latestImg = await getBase64Data(latestPhoto.url);

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

  const chartData = [...workouts].reverse().map(w => ({
    date: new Date(w.start_time).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    volume: w.volume,
    duration: Math.floor(w.duration / 60)
  }));

  const personalRecords = workouts.reduce((acc: any, w) => {
    w.workout_exercises?.forEach((ex: any) => {
      ex.workout_sets?.forEach((s: any) => {
        if (s.completed && s.kg > 0) {
          if (!acc[ex.exercise_name] || s.kg > acc[ex.exercise_name].kg) {
            acc[ex.exercise_name] = { kg: s.kg, reps: s.reps, date: new Date(w.start_time).toLocaleDateString('vi-VN') };
          }
        }
      });
    });
    return acc;
  }, {});

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
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300", isDark ? "bg-black text-white" : "bg-white text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <TrendingUp className="w-6 h-6 text-black dark:text-white" />
          Tiến độ
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Theo dõi sự thay đổi hàng ngày của bạn.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Photos */}
        <div className="space-y-6">
          {/* Body Photos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={cn("rounded-2xl p-6 shadow-sm border transition-colors h-full", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}
          >
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn("font-bold flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
            <Camera className="w-5 h-5 text-blue-500" />
            Ảnh cơ thể hàng tuần
          </h3>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-sm text-blue-500 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            {isUploading ? "Đang tải..." : <><Plus className="w-4 h-4" /> Thêm ảnh</>}
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
        
        {firstPhoto && latestPhoto && firstPhoto.id !== latestPhoto.id ? (
          <PhotoComparison 
            before={firstPhoto.url} 
            after={latestPhoto.url} 
            beforeDate={firstPhoto.date} 
            afterDate={latestPhoto.date} 
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {firstPhoto ? (
              <div className={cn("relative rounded-2xl overflow-hidden border shadow-inner", isDark ? "border-[#1F1F1F] bg-[#141414]" : "border-zinc-100 bg-zinc-50")}>
                <img src={firstPhoto.url} alt="Before" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">{firstPhoto.date}</span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn("relative rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-[#1F1F1F]/50 transition-colors h-48", isDark ? "border-zinc-700" : "border-zinc-300")}
              >
                <Camera className={cn("w-8 h-8 mb-2", isDark ? "text-zinc-600" : "text-zinc-400")} />
                <span className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>Thêm ảnh đầu tiên</span>
              </div>
            )}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn("relative rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-[#1F1F1F]/50 transition-colors h-48", isDark ? "border-zinc-700" : "border-zinc-300")}
            >
              <Camera className={cn("w-8 h-8 mb-2", isDark ? "text-zinc-600" : "text-zinc-400")} />
              <span className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>Thêm ảnh mới nhất</span>
            </div>
          </div>
        )}

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
        </div>

        {/* Right Column: Stats & PRs */}
        <div className="space-y-6">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className={cn("p-5 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center transition-colors col-span-2 sm:col-span-1", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
              <div className="relative flex flex-col items-center justify-center mb-2">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    className={isDark ? "text-[#1F1F1F]" : "text-zinc-100"}
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={(2 * Math.PI * 36) - (85 / 100) * (2 * Math.PI * 36)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="48"
                    cy="48"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={cn("text-2xl font-black", isDark ? "text-white" : "text-zinc-900")}>85%</span>
                </div>
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>Độ kiên trì</span>
            </div>

            <div className="grid grid-rows-2 gap-4 col-span-2 sm:col-span-1">
              <div className={cn("p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isDark ? "bg-blue-500/20" : "bg-blue-100")}>
                  <Activity className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-500")} />
                </div>
                <div>
                  <div className={cn("text-xl font-bold", isDark ? "text-white" : "text-zinc-900")}>{workouts.length}</div>
                  <div className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>Bài tập</div>
                </div>
              </div>
              
              <div className={cn("p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isDark ? "bg-orange-500/20" : "bg-orange-100")}>
                  <Dumbbell className={cn("w-5 h-5", isDark ? "text-orange-400" : "text-orange-500")} />
                </div>
                <div>
                  <div className={cn("text-xl font-bold truncate", isDark ? "text-white" : "text-zinc-900")}>
                    {workouts.reduce((acc, w) => acc + (w.volume || 0), 0).toLocaleString()}
                  </div>
                  <div className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>Tổng Volume</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personal Records */}
          {Object.keys(personalRecords).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={cn("rounded-2xl p-6 shadow-sm border transition-colors", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}
            >
          <h3 className={cn("font-bold flex items-center gap-2 mb-4", isDark ? "text-white" : "text-zinc-900")}>
            <Award className="w-5 h-5 text-yellow-500" />
            Kỷ lục cá nhân (PR)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(personalRecords).map(([name, record]: [string, any]) => (
              <div key={name} className={cn("p-4 rounded-xl border flex justify-between items-center transition-colors", isDark ? "bg-[#1A1A1A] border-[#1F1F1F]" : "bg-zinc-50 border-zinc-100")}>
                <div>
                  <div className={cn("text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}>{name}</div>
                  <div className={cn("text-[10px] font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>{record.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-yellow-500">{record.kg}<span className="text-xs ml-0.5">kg</span></div>
                  <div className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-400")}>{record.reps} reps</div>
                </div>
              </div>
            ))}
          </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      {workouts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn("rounded-2xl p-6 shadow-sm border transition-colors", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn("font-bold flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
              <BarChart2 className="w-5 h-5 text-blue-500" />
              Biểu đồ tăng trưởng (Volume)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="barHighlight" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                    <stop offset="20%" stopColor="#ffffff" stopOpacity={0} />
                    <stop offset="80%" stopColor="#000000" stopOpacity={0} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1F1F1F" : "#e4e4e7"} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? "#a1a1aa" : "#71717a" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? "#a1a1aa" : "#71717a" }} />
                <Tooltip 
                  cursor={{ fill: isDark ? '#1F1F1F' : '#f4f4f5', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#141414' : '#ffffff',
                    borderColor: isDark ? '#1F1F1F' : '#e4e4e7',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: isDark ? '#e4e4e7' : '#18181b', fontWeight: 'bold' }}
                />
                <Bar dataKey="volume" name="Volume (kg)" fill="url(#barGradient)" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Workout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn("rounded-2xl p-6 shadow-sm border transition-colors", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}
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
          <div className={cn("text-center py-12 rounded-2xl border border-dashed", isDark ? "border-[#1F1F1F] bg-[#141414]" : "border-zinc-200 bg-white")}>
            <History className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-zinc-700" : "text-zinc-300")} />
            <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Chưa có lịch sử tập luyện</h3>
            <p className={cn("text-sm mb-6", isDark ? "text-zinc-500" : "text-zinc-500")}>Hoàn thành bài tập đầu tiên để xem tiến độ của bạn!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className={cn("p-4 rounded-2xl border transition-colors", isDark ? "bg-[#1A1A1A] border-[#1F1F1F] hover:bg-[#222222]" : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100")}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>{workout.name}</h4>
                    <div className={cn("text-[10px] font-medium uppercase tracking-wider mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
                      {new Date(workout.start_time).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-500 font-bold">{formatTime(workout.duration)}</div>
                    <div className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-400")}>{workout.sets_count} hiệp</div>
                  </div>
                </div>
                
                {/* Show records if any */}
                {workout.workout_exercises?.map((ex: any) => {
                  const records = ex.workout_sets?.filter((s: any) => s.is_record);
                  if (records && records.length > 0) {
                    return (
                      <div key={ex.id} className="mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-[#1F1F1F]">
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
