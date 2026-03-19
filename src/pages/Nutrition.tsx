import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Camera, Search, Plus, Utensils, Flame, Upload, X, Check, Edit2, ScanLine, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";

export default function Nutrition() {
  const [targetCalories, setTargetCalories] = useState(2000);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString());
  const [nutritionHistory, setNutritionHistory] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem("nutritionHistory");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    // Migration from old format
    const oldSaved = localStorage.getItem("nutritionData");
    if (oldSaved) {
      try {
        const { date, savedMeals } = JSON.parse(oldSaved);
        if (date && savedMeals) {
          return { [date]: savedMeals };
        }
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = localStorage.getItem("waterIntake");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toDateString()) {
          return parsed.amount;
        }
      } catch (e) {}
    }
    return 0;
  });

  const targetWater = 2500; // 2.5L

  useEffect(() => {
    localStorage.setItem("waterIntake", JSON.stringify({
      date: new Date().toDateString(),
      amount: waterIntake
    }));
  }, [waterIntake]);

  const addWater = (amount: number) => {
    setWaterIntake(prev => prev + amount);
  };

  const [searchQuery, setSearchQuery] = useState("");

  const meals = nutritionHistory[selectedDate] || [];
  const filteredMeals = meals.filter(meal => 
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateMeals = (newMeals: any[]) => {
    const newHistory = { ...nutritionHistory, [selectedDate]: newMeals };
    setNutritionHistory(newHistory);
    localStorage.setItem("nutritionHistory", JSON.stringify(newHistory));
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toDateString());
  };

  const isToday = selectedDate === new Date().toDateString();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (date.toDateString() === new Date().toDateString()) return "Hôm nay";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingMeal, setPendingMeal] = useState<any>(null);
  const [manualMeal, setManualMeal] = useState({
    name: "",
    cal: "",
    protein: "",
    carbs: "",
    fat: "",
    time: "Ăn vặt"
  });
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const data = localStorage.getItem("onboardingData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const weight = parseFloat(parsed.weight) || 65;
        const height = parseFloat(parsed.height) || 170;
        const localAge = localStorage.getItem('user_age');
        const age = localAge ? parseInt(localAge) : (parseInt(parsed.age) || 25);
        const gender = parsed.gender || "Male";
        const mainGoal = parsed.mainGoal || "";
        const diet = parsed.diet || "";
        const frequency = parsed.frequency || "";

        // Mifflin-St Jeor Equation
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === "Male") {
          bmr += 5;
        } else if (gender === "Female") {
          bmr -= 161;
        } else {
          // Average for "Other"
          bmr -= 78;
        }

        // Activity Multiplier based on frequency
        let activityMultiplier = 1.55; // default moderately active
        if (frequency.includes("2–3")) {
          activityMultiplier = 1.375; // Lightly active
        } else if (frequency.includes("3–4")) {
          activityMultiplier = 1.55; // Moderately active
        } else if (frequency.includes("5–6")) {
          activityMultiplier = 1.725; // Very active
        }

        // TDEE
        let tdee = bmr * activityMultiplier;

        // Adjust based on goal and diet
        let calorieAdjustment = 0;
        
        if (diet.includes("giảm cân")) {
          calorieAdjustment = -500;
        } else if (diet.includes("tăng cân") || diet.includes("xả cơ")) {
          calorieAdjustment = 500; // Standard surplus for weight gain
        } else {
          // Fallback to mainGoal if diet is normal
          if (mainGoal.includes("Giảm mỡ")) {
            calorieAdjustment = -500;
          } else if (mainGoal.includes("Tăng cơ")) {
            calorieAdjustment = 300; // Lean bulk surplus
          }
        }

        setTargetCalories(Math.round(tdee + calorieAdjustment));
      } catch (e) {
        console.error("Error parsing onboarding data", e);
      }
    }
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // Compress image before sending to AI to significantly reduce latency
      const compressedBase64 = await compressImage(file);
      setPreviewImage(compressedBase64);
      
      const base64String = compressedBase64.split(",")[1];
      const mimeType = "image/jpeg";

      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64String,
              },
            },
            {
              text: "Phân tích hình ảnh này. Đầu tiên xác định xem đây có phải là đồ ăn/thức uống hay không. Nếu ĐÚNG là đồ ăn: Hãy ước tính khẩu phần thực tế có trong ảnh (ví dụ: 1 bát cơm, 200g thịt gà). Sau đó ước tính tổng lượng calo, protein (g), carbs (g) và chất béo (g) cho TOÀN BỘ khẩu phần đó. Cung cấp tên món ăn ngắn gọn, tự nhiên bằng tiếng Việt. Đánh giá độ tự tin của ước tính. Nếu KHÔNG PHẢI đồ ăn: Đặt isFood = false và các chỉ số = 0.",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isFood: { type: Type.BOOLEAN, description: "Hình ảnh này có phải là đồ ăn/thức uống không?" },
              name: { type: Type.STRING, description: "Tên món ăn (Tiếng Việt). Nếu không phải đồ ăn, trả về 'Không phải đồ ăn'" },
              cal: { type: Type.NUMBER, description: "Calo ước tính cho toàn bộ khẩu phần trong ảnh. Nếu không phải đồ ăn, trả về 0." },
              protein: { type: Type.NUMBER, description: "Protein (g). Nếu không phải đồ ăn, trả về 0." },
              carbs: { type: Type.NUMBER, description: "Carbs (g). Nếu không phải đồ ăn, trả về 0." },
              fat: { type: Type.NUMBER, description: "Chất béo (g). Nếu không phải đồ ăn, trả về 0." },
              confidence: { type: Type.STRING, description: "Độ tự tin của ước tính (Cao, Trung bình, Thấp)" },
              portion: { type: Type.STRING, description: "Ước tính khẩu phần (ví dụ: 1 bát, 200g, 1 đĩa vừa)" }
            },
            required: ["isFood", "name", "cal", "protein", "carbs", "fat", "confidence", "portion"],
          },
        },
      });

      if (response.text) {
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
        }
        
        const result = JSON.parse(jsonStr);
        
        if (!result.isFood) {
          alert("Hình ảnh không có vẻ là đồ ăn. Vui lòng thử lại với ảnh khác.");
          setIsLoading(false);
          setPreviewImage(null);
          return;
        }

        setPendingMeal({
          time: "Ăn vặt",
          name: result.name,
          cal: result.cal,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          portion: result.portion,
          confidence: result.confidence,
          img: compressedBase64,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Đã xảy ra lỗi khi phân tích hình ảnh. Vui lòng thử lại.");
      setIsLoading(false);
      setPreviewImage(null);
    }
  };

  const handleConfirmMeal = () => {
    if (pendingMeal) {
      updateMeals([pendingMeal, ...meals]);
      setPendingMeal(null);
      setPreviewImage(null);
    }
  };

  const handleCancelMeal = () => {
    setPendingMeal(null);
    setPreviewImage(null);
  };

  const handleConfirmManualMeal = () => {
    if (!manualMeal.name || !manualMeal.cal) {
      alert("Vui lòng nhập tên món ăn và lượng calo.");
      return;
    }

    const newMeal = {
      time: manualMeal.time,
      name: manualMeal.name,
      cal: Number(manualMeal.cal),
      protein: Number(manualMeal.protein) || 0,
      carbs: Number(manualMeal.carbs) || 0,
      fat: Number(manualMeal.fat) || 0,
      img: ""
    };

    updateMeals([newMeal, ...meals]);
    setIsManualModalOpen(false);
    setManualMeal({
      name: "",
      cal: "",
      protein: "",
      carbs: "",
      fat: "",
      time: "Ăn vặt"
    });
  };

  const consumedCalories = meals.reduce((acc, meal) => acc + (meal.cal || 0), 0);
  const consumedProtein = meals.reduce((acc, meal) => acc + (meal.protein || 0), 0);
  const consumedCarbs = meals.reduce((acc, meal) => acc + (meal.carbs || 0), 0);
  const consumedFat = meals.reduce((acc, meal) => acc + (meal.fat || 0), 0);

  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const progressPercentage = Math.min(100, (consumedCalories / targetCalories) * 100);
  const strokeDashoffset = 283 - (283 * progressPercentage) / 100;

  // Simple macro targets based on calories (e.g., 30% P, 40% C, 30% F)
  const targetProtein = Math.round((targetCalories * 0.3) / 4);
  const targetCarbs = Math.round((targetCalories * 0.4) / 4);
  const targetFat = Math.round((targetCalories * 0.3) / 9);

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
            <Utensils className="w-6 h-6 text-black dark:text-white" />
            Dinh dưỡng
          </h2>
          <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Theo dõi bữa ăn dễ dàng bằng ảnh hoặc nhập thủ công.</p>
        </div>
        <div className={cn("flex items-center gap-2 p-1 rounded-xl shadow-sm border", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <button onClick={() => changeDate(-1)} className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100")}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold w-24 text-center">{formatDate(selectedDate)}</span>
          <button onClick={() => changeDate(1)} disabled={isToday} className={cn("p-2 rounded-lg transition-colors disabled:opacity-30", isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100")}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calories & Macros Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={cn("rounded-3xl p-6 shadow-sm border flex flex-col items-center transition-colors h-full", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
        >
          <div className="flex items-center justify-between w-full mb-6 flex-1">
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke={isDark ? "#2c2c2e" : "#f4f4f5"} strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="283" strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>{consumedCalories}</span>
                <span className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>/ {targetCalories} kcal</span>
              </div>
            </div>

            <div className="flex-1 ml-8 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>Protein</span>
                  <span className={isDark ? "text-white" : "text-zinc-900"}>{consumedProtein}/{targetProtein}g</span>
                </div>
                <div className={cn("h-1.5 rounded-full overflow-hidden", isDark ? "bg-zinc-800" : "bg-zinc-100")}>
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (consumedProtein / targetProtein) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>Carbs</span>
                  <span className={isDark ? "text-white" : "text-zinc-900"}>{consumedCarbs}/{targetCarbs}g</span>
                </div>
                <div className={cn("h-1.5 rounded-full overflow-hidden", isDark ? "bg-zinc-800" : "bg-zinc-100")}>
                  <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (consumedCarbs / targetCarbs) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>Fat</span>
                  <span className={isDark ? "text-white" : "text-zinc-900"}>{consumedFat}/{targetFat}g</span>
                </div>
                <div className={cn("h-1.5 rounded-full overflow-hidden", isDark ? "bg-zinc-800" : "bg-zinc-100")}>
                  <div className="h-full bg-yellow-500" style={{ width: `${Math.min(100, (consumedFat / targetFat) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full text-sm font-medium pt-4 border-t border-zinc-800/50 mt-auto">
            <div className={isDark ? "text-zinc-400" : "text-zinc-500"}>Đã nạp: <span className="text-black dark:text-white font-bold">{consumedCalories}</span></div>
            <div className={isDark ? "text-zinc-400" : "text-zinc-500"}>Còn lại: <span className="text-orange-500 font-bold">{remainingCalories}</span></div>
          </div>
        </motion.div>

        <div className="space-y-6 flex flex-col">
          {/* Water Tracker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className={cn("rounded-3xl p-6 shadow-sm border transition-colors flex-1", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <h3 className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>Lượng nước uống</h3>
              </div>
              <span className={cn("text-sm font-bold", isDark ? "text-blue-400" : "text-blue-600")}>{waterIntake} / {targetWater} ml</span>
            </div>

            <div className="relative h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (waterIntake / targetWater) * 100)}%` }}
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[250, 500, 750].map(amount => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  className={cn(
                    "py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                    isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                  )}
                >
                  +{amount}ml
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            <button 
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
              className={cn("font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border shadow-sm disabled:opacity-50", isDark ? "bg-white/10 hover:bg-white/20 text-white border-white/20" : "bg-zinc-100 hover:bg-zinc-200 text-black border-zinc-300")}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
              <span className="text-[10px] uppercase tracking-wider">Chụp ảnh</span>
            </button>
            <button 
              onClick={() => galleryInputRef.current?.click()}
              disabled={isLoading}
              className={cn("font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border shadow-sm disabled:opacity-50", isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-zinc-300 border-zinc-800" : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200")}
            >
              <Upload className="w-6 h-6" />
              <span className="text-[10px] uppercase tracking-wider">Tải lên</span>
            </button>
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className={cn("font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border shadow-sm", isDark ? "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-zinc-300 border-zinc-800" : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200")}
            >
              <Edit2 className="w-6 h-6" />
              <span className="text-[10px] uppercase tracking-wider">Thủ công</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={cameraInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={galleryInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </motion.div>
        </div>
      </div>

      {/* Today's Meals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-end">
          <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Bữa ăn hôm nay</h3>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", isDark ? "bg-zinc-800 text-zinc-400 hover:bg-white/20 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-black")}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {meals.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all text-sm",
                isDark ? "bg-[#1c1c1e] border-zinc-800 text-white placeholder:text-zinc-500" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
              )}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.length === 0 ? (
            <div className={cn("text-center py-12 rounded-2xl border border-dashed md:col-span-2", isDark ? "border-zinc-800 bg-[#1c1c1e]" : "border-zinc-200 bg-white")}>
              <Utensils className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-zinc-700" : "text-zinc-300")} />
              <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Chưa có bữa ăn nào</h3>
              <p className={cn("text-sm mb-6", isDark ? "text-zinc-500" : "text-zinc-500")}>Ghi lại bữa ăn đầu tiên của bạn hôm nay!</p>
              <button 
                onClick={() => setIsManualModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Thêm Bữa Ăn
              </button>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className={cn("text-center py-8 rounded-2xl border md:col-span-2", isDark ? "border-zinc-800 bg-[#1c1c1e]" : "border-zinc-200 bg-white")}>
              <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-zinc-500")}>Không tìm thấy món ăn nào phù hợp.</p>
            </div>
          ) : (
            filteredMeals.map((meal, i) => (
              <div key={i} className={cn("p-3 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-inner flex items-center justify-center">
                  {meal.img ? (
                    <img className="w-full h-full object-cover" src={meal.img} alt={meal.name} referrerPolicy="no-referrer" />
                  ) : (
                    <Utensils className={cn("w-6 h-6", isDark ? "text-zinc-600" : "text-zinc-400")} />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">{meal.time}</span>
                  <h4 className={cn("font-bold text-lg leading-tight", isDark ? "text-white" : "text-zinc-900")}>{meal.name}</h4>
                  {meal.portion && (
                    <p className={cn("text-xs mt-0.5", isDark ? "text-zinc-500" : "text-zinc-500")}>Khẩu phần: {meal.portion}</p>
                  )}
                  <div className={cn("flex items-center gap-3 text-sm mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                    <span className={cn("flex items-center gap-1 font-medium", isDark ? "text-zinc-300" : "text-zinc-700")}><Flame className="w-4 h-4 text-orange-400" /> {meal.cal} kcal</span>
                    <span className="text-xs">P: {meal.protein}g</span>
                    <span className="text-xs">C: {meal.carbs}g</span>
                    <span className="text-xs">F: {meal.fat}g</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {isLoading && previewImage && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src={previewImage} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 border-4 border-black dark:border-white/30 rounded-3xl" />
            <motion.div 
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3">
                <ScanLine className="w-6 h-6 text-white animate-pulse" />
                <span className="text-white font-medium">AI đang phân tích...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn("rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl", isDark ? "bg-[#1c1c1e]" : "bg-white")}
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-zinc-900")}>Thêm bữa ăn</h3>
                <button onClick={() => setIsManualModalOpen(false)} className="text-zinc-500 hover:text-zinc-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tên món ăn</label>
                  <input 
                    type="text"
                    placeholder="VD: Cơm gà"
                    value={manualMeal.name}
                    onChange={(e) => setManualMeal({...manualMeal, name: e.target.value})}
                    className={cn("w-full p-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all", isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Calo (kcal)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={manualMeal.cal}
                      onChange={(e) => setManualMeal({...manualMeal, cal: e.target.value})}
                      className={cn("w-full p-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all", isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bữa ăn</label>
                    <select 
                      value={manualMeal.time}
                      onChange={(e) => setManualMeal({...manualMeal, time: e.target.value})}
                      className={cn("w-full p-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all appearance-none", isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                    >
                      <option>Bữa sáng</option>
                      <option>Bữa trưa</option>
                      <option>Bữa tối</option>
                      <option>Ăn vặt</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Protein (g)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={manualMeal.protein}
                      onChange={(e) => setManualMeal({...manualMeal, protein: e.target.value})}
                      className={cn("w-full p-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all", isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Carbs (g)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={manualMeal.carbs}
                      onChange={(e) => setManualMeal({...manualMeal, carbs: e.target.value})}
                      className={cn("w-full p-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all", isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fat (g)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={manualMeal.fat}
                      onChange={(e) => setManualMeal({...manualMeal, fat: e.target.value})}
                      className={cn("w-full p-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all", isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsManualModalOpen(false)}
                  className={cn("flex-1 py-3.5 rounded-xl font-bold transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleConfirmManualMeal}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-md shadow-black/20 dark:shadow-white/20"
                >
                  <Check className="w-5 h-5" /> Lưu
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {pendingMeal && !isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn("rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl", isDark ? "bg-[#1c1c1e]" : "bg-white")}
          >
            <div className="relative h-48">
              <img src={pendingMeal.img} alt="Food" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button 
                onClick={handleCancelMeal}
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <input 
                  type="text"
                  value={pendingMeal.name}
                  onChange={(e) => setPendingMeal({...pendingMeal, name: e.target.value})}
                  className="bg-transparent text-white font-bold text-2xl w-full outline-none border-b border-white/30 focus:border-white transition-colors pb-1"
                />
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-white/90">
                  {pendingMeal.portion && (
                    <span className="bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                      Khẩu phần: {pendingMeal.portion}
                    </span>
                  )}
                  {pendingMeal.confidence && (
                    <span className="bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                      Độ chính xác: {pendingMeal.confidence}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-5">
              <div className={cn("flex items-center justify-between p-4 rounded-2xl border", isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100")}>
                <div className={cn("flex items-center gap-2 font-bold", isDark ? "text-orange-400" : "text-orange-600")}>
                  <Flame className="w-5 h-5" />
                  <span>Calo</span>
                </div>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={pendingMeal.cal}
                    onChange={(e) => setPendingMeal({...pendingMeal, cal: Number(e.target.value)})}
                    className={cn("w-16 text-right bg-transparent font-bold text-xl outline-none", isDark ? "text-orange-400" : "text-orange-600")}
                  />
                  <span className={cn("font-medium", isDark ? "text-orange-500/70" : "text-orange-400")}>kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={cn("p-3 rounded-2xl border text-center", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                  <div className={cn("text-xs font-medium mb-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Chất đạm</div>
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={pendingMeal.protein}
                      onChange={(e) => setPendingMeal({...pendingMeal, protein: Number(e.target.value)})}
                      className={cn("w-10 text-center bg-transparent font-bold outline-none", isDark ? "text-white" : "text-zinc-900")}
                    />
                    <span className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>g</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-2xl border text-center", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                  <div className={cn("text-xs font-medium mb-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Tinh bột</div>
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={pendingMeal.carbs}
                      onChange={(e) => setPendingMeal({...pendingMeal, carbs: Number(e.target.value)})}
                      className={cn("w-10 text-center bg-transparent font-bold outline-none", isDark ? "text-white" : "text-zinc-900")}
                    />
                    <span className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>g</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-2xl border text-center", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                  <div className={cn("text-xs font-medium mb-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Chất béo</div>
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={pendingMeal.fat}
                      onChange={(e) => setPendingMeal({...pendingMeal, fat: Number(e.target.value)})}
                      className={cn("w-10 text-center bg-transparent font-bold outline-none", isDark ? "text-white" : "text-zinc-900")}
                    />
                    <span className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>g</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleCancelMeal}
                  className={cn("flex-1 py-3.5 rounded-xl font-bold transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleConfirmMeal}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-md shadow-black/20 dark:shadow-white/20"
                >
                  <Check className="w-5 h-5" /> Xác nhận
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
