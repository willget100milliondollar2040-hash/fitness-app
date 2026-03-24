import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { supabase } from "@/lib/supabase";

const steps = [
  { id: "mainGoal", title: "Mục tiêu chính của bạn là gì?" },
  { id: "level", title: "Trình độ hiện tại" },
  { id: "frequency", title: "Tần suất tập luyện" },
  { id: "calisthenicsGoals", title: "Mục tiêu Calisthenics" },
  { id: "profile", title: "Hồ sơ cơ thể" },
  { id: "timeframe", title: "Thời gian đạt mục tiêu" },
  { id: "diet", title: "Chế độ ăn hiện tại" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    mainGoal: "",
    level: "",
    frequency: "",
    calisthenicsGoals: [] as string[],
    height: "",
    weight: "",
    age: "",
    timeframe: "",
    diet: "",
  });
  const { isDark } = useTheme();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const goals = [answers.mainGoal, ...answers.calisthenicsGoals].filter(Boolean);
          
          const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            weight: parseFloat(answers.weight) || null,
            height: parseFloat(answers.height) || null,
            age: parseInt(answers.age) || null,
            goals: goals,
            level: answers.level,
            frequency: answers.frequency,
            timeframe: answers.timeframe,
            diet: answers.diet
          });

          if (error) {
            console.error("Supabase upsert error:", error);
            alert("Lỗi lưu hồ sơ: " + error.message + "\n\nVui lòng chạy mã SQL để cập nhật database.");
            return; // Stop here if there's an error
          }
        }
      } catch (e: any) {
        console.error("Failed to save profile", e);
        alert("Lỗi hệ thống: " + e.message);
        return;
      }
      
      // Complete onboarding only if successful
      localStorage.setItem("onboardingData", JSON.stringify(answers));
      localStorage.setItem("onboardingComplete", "true");
      window.dispatchEvent(new Event("onboardingUpdated"));
      navigate("/");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return !!answers.mainGoal;
      case 1: return !!answers.level;
      case 2: return !!answers.frequency;
      case 3: return answers.calisthenicsGoals.length > 0;
      case 4: return !!answers.height && !!answers.weight && !!answers.age;
      case 5: return !!answers.timeframe;
      case 6: return !!answers.diet;
      default: return false;
    }
  };

  const toggleCalisthenicsGoal = (goal: string) => {
    setAnswers(prev => {
      const current = prev.calisthenicsGoals;
      if (current.includes(goal)) {
        return { ...prev, calisthenicsGoals: current.filter(g => g !== goal) };
      } else {
        return { ...prev, calisthenicsGoals: [...current, goal] };
      }
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        const mainGoals = [
          "Tăng cơ 💪",
          "Giảm mỡ 🔥",
          "Tăng sức mạnh calisthenics",
          "Giữ dáng / thể lực chung"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>(đây là câu hỏi quan trọng nhất)</p>
            {mainGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => setAnswers({ ...answers, mainGoal: goal })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.mainGoal === goal
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-[#1F1F1F] bg-[#141414] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        );
      case 1:
        const levels = [
          "Người mới (chưa kéo xà được)",
          "Trung bình (5–10 cái kéo xà)",
          "Nâng cao (10+ cái kéo xà / kỹ năng)"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>để tránh các bài tập quá khó</p>
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setAnswers({ ...answers, level })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.level === level
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-[#1F1F1F] bg-[#141414] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {level}
              </button>
            ))}
          </div>
        );
      case 2:
        const frequencies = [
          "2–3 lần",
          "3–4 lần",
          "5–6 lần"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>Bao nhiêu lần mỗi tuần và bao nhiêu phút mỗi buổi?</p>
            {frequencies.map((freq) => (
              <button
                key={freq}
                onClick={() => setAnswers({ ...answers, frequency: freq })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.frequency === freq
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-[#1F1F1F] bg-[#141414] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {freq}
              </button>
            ))}
          </div>
        );
      case 3:
        const caliGoals = [
          "Kéo xà (Pull up)",
          "Lên xà (Muscle up)",
          "Front lever",
          "Trồng chuối (Handstand)",
          "Khỏe hơn",
          "Planche"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>(chọn nhiều mục)</p>
            {caliGoals.map((goal) => {
              const isSelected = answers.calisthenicsGoals.includes(goal);
              return (
                <button
                  key={goal}
                  onClick={() => toggleCalisthenicsGoal(goal)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium flex items-center justify-between",
                    isSelected
                      ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                      : (isDark ? "border-[#1F1F1F] bg-[#141414] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                  )}
                >
                  <span>{goal}</span>
                  {isSelected && <Check className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>để tính TDEE và calo</p>
            <div className="space-y-4">
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-300" : "text-zinc-700")}>Chiều cao (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={answers.height}
                  onChange={(e) => setAnswers({ ...answers, height: e.target.value })}
                  className={cn("w-full p-4 rounded-2xl border-2 focus:border-black dark:border-white focus:ring-0 outline-none transition-all text-lg", isDark ? "bg-[#141414] border-[#1F1F1F] text-white placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900")}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-300" : "text-zinc-700")}>Cân nặng (kg)</label>
                <input
                  type="number"
                  placeholder="65"
                  value={answers.weight}
                  onChange={(e) => setAnswers({ ...answers, weight: e.target.value })}
                  className={cn("w-full p-4 rounded-2xl border-2 focus:border-black dark:border-white focus:ring-0 outline-none transition-all text-lg", isDark ? "bg-[#141414] border-[#1F1F1F] text-white placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900")}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-300" : "text-zinc-700")}>Tuổi</label>
                <input
                  type="number"
                  placeholder="25"
                  value={answers.age}
                  onChange={(e) => setAnswers({ ...answers, age: e.target.value })}
                  className={cn("w-full p-4 rounded-2xl border-2 focus:border-black dark:border-white focus:ring-0 outline-none transition-all text-lg", isDark ? "bg-[#141414] border-[#1F1F1F] text-white placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900")}
                />
              </div>
            </div>
          </div>
        );
      case 5:
        const timeframes = [
          "1–3 tháng",
          "3–6 tháng",
          "1 năm"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>→ giúp ứng dụng đặt mục tiêu tiến độ</p>
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setAnswers({ ...answers, timeframe })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.timeframe === timeframe
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-[#1F1F1F] bg-[#141414] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {timeframe}
              </button>
            ))}
          </div>
        );
      case 6:
        const diets = [
          "Chế độ ăn bình thường",
          "Đang giảm cân",
          "Đang tăng cân / xả cơ",
          "Ăn chay / Thuần chay"
        ];
        return (
          <div className="space-y-3">
            {diets.map((diet) => (
              <button
                key={diet}
                onClick={() => setAnswers({ ...answers, diet })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.diet === diet
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-[#1F1F1F] bg-[#141414] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {diet}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col h-[100dvh] w-full max-w-md mx-auto overflow-hidden relative transition-colors duration-300", isDark ? "bg-black text-white" : "bg-white text-zinc-900")}>
      {/* Header & Progress */}
      <div className={cn("pt-12 px-6 pb-4 border-b transition-colors duration-300", isDark ? "bg-black border-[#1F1F1F]" : "bg-white border-zinc-100")}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className={cn("p-2 -ml-2 rounded-full transition-colors", currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100", isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-600")}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className={cn("text-sm font-bold", isDark ? "text-zinc-500" : "text-zinc-400")}>
            {currentStep + 1} / {steps.length}
          </span>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
        
        <div className={cn("w-full h-2 rounded-full overflow-hidden", isDark ? "bg-zinc-800" : "bg-zinc-100")}>
          <motion.div
            className={cn("h-full rounded-full", isDark ? "bg-white" : "bg-black")}
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <h2 className={cn("text-2xl font-bold mb-6", isDark ? "text-white" : "text-zinc-900")}>{steps[currentStep].title}</h2>
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className={cn("absolute bottom-0 w-full border-t p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] transition-colors duration-300", isDark ? "bg-black border-[#1F1F1F]" : "bg-white border-zinc-100")}>
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="w-full bg-black dark:bg-white dark:text-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-black dark:bg-white dark:text-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.3)] disabled:shadow-none"
        >
          {currentStep === steps.length - 1 ? "Hoàn thành & Nhận kế hoạch" : "Tiếp tục"}
          {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
