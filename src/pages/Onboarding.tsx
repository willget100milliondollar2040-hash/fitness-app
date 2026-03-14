import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";

const steps = [
  { id: "mainGoal", title: "What is your main goal?" },
  { id: "level", title: "Current level" },
  { id: "frequency", title: "Workout frequency" },
  { id: "calisthenicsGoals", title: "Calisthenics goals" },
  { id: "profile", title: "Body profile" },
  { id: "timeframe", title: "Body goal timeframe" },
  { id: "diet", title: "Current diet" },
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      localStorage.setItem("onboardingData", JSON.stringify(answers));
      localStorage.setItem("onboardingComplete", "true");
      navigate("/coach");
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
          "Build muscle 💪",
          "Lose fat 🔥",
          "Increase calisthenics strength",
          "Stay fit / general fitness"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>(this is the most important question)</p>
            {mainGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => setAnswers({ ...answers, mainGoal: goal })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.mainGoal === goal
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-zinc-800 bg-[#1c1c1e] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        );
      case 1:
        const levels = [
          "Beginner (can't do a pull up)",
          "Intermediate (5–10 pull ups)",
          "Advanced (10+ pull ups / skills)"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>to avoid exercises that are too hard</p>
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setAnswers({ ...answers, level })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.level === level
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-zinc-800 bg-[#1c1c1e] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {level}
              </button>
            ))}
          </div>
        );
      case 2:
        const frequencies = [
          "2–3 times",
          "3–4 times",
          "5–6 times"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>How many times per week and how many minutes per session?</p>
            {frequencies.map((freq) => (
              <button
                key={freq}
                onClick={() => setAnswers({ ...answers, frequency: freq })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.frequency === freq
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-zinc-800 bg-[#1c1c1e] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {freq}
              </button>
            ))}
          </div>
        );
      case 3:
        const caliGoals = [
          "Pull up",
          "Muscle up",
          "Front lever",
          "Handstand",
          "Get stronger",
          "Planche"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>(select multiple)</p>
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
                      : (isDark ? "border-zinc-800 bg-[#1c1c1e] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
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
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>to calculate TDEE and calories</p>
            <div className="space-y-4">
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-300" : "text-zinc-700")}>Height (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={answers.height}
                  onChange={(e) => setAnswers({ ...answers, height: e.target.value })}
                  className={cn("w-full p-4 rounded-2xl border-2 focus:border-black dark:border-white focus:ring-0 outline-none transition-all text-lg", isDark ? "bg-[#1c1c1e] border-zinc-800 text-white placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900")}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-300" : "text-zinc-700")}>Weight (kg)</label>
                <input
                  type="number"
                  placeholder="65"
                  value={answers.weight}
                  onChange={(e) => setAnswers({ ...answers, weight: e.target.value })}
                  className={cn("w-full p-4 rounded-2xl border-2 focus:border-black dark:border-white focus:ring-0 outline-none transition-all text-lg", isDark ? "bg-[#1c1c1e] border-zinc-800 text-white placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900")}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-300" : "text-zinc-700")}>Age</label>
                <input
                  type="number"
                  placeholder="25"
                  value={answers.age}
                  onChange={(e) => setAnswers({ ...answers, age: e.target.value })}
                  className={cn("w-full p-4 rounded-2xl border-2 focus:border-black dark:border-white focus:ring-0 outline-none transition-all text-lg", isDark ? "bg-[#1c1c1e] border-zinc-800 text-white placeholder:text-zinc-600" : "bg-white border-zinc-200 text-zinc-900")}
                />
              </div>
            </div>
          </div>
        );
      case 5:
        const timeframes = [
          "1–3 months",
          "3–6 months",
          "1 year"
        ];
        return (
          <div className="space-y-3">
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>→ helps the app set progress targets</p>
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setAnswers({ ...answers, timeframe })}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all font-medium",
                  answers.timeframe === timeframe
                    ? (isDark ? "border-black dark:border-white bg-white/10 text-white" : "border-black dark:border-white bg-zinc-100 text-black")
                    : (isDark ? "border-zinc-800 bg-[#1c1c1e] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
                )}
              >
                {timeframe}
              </button>
            ))}
          </div>
        );
      case 6:
        const diets = [
          "Normal diet",
          "Losing weight",
          "Bulking / gaining weight",
          "Vegetarian / Vegan"
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
                    : (isDark ? "border-zinc-800 bg-[#1c1c1e] text-zinc-300 hover:border-black dark:border-white/50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
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
    <div className={cn("flex flex-col h-[100dvh] max-w-md mx-auto shadow-xl overflow-hidden relative transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      {/* Header & Progress */}
      <div className={cn("pt-12 px-6 pb-4 border-b transition-colors duration-300", isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-100")}>
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
      <div className={cn("absolute bottom-0 w-full border-t p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] transition-colors duration-300", isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-100")}>
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="w-full bg-black dark:bg-white dark:text-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-black dark:bg-white dark:text-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.3)] disabled:shadow-none"
        >
          {currentStep === steps.length - 1 ? "Finish & Get Plan" : "Continue"}
          {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
