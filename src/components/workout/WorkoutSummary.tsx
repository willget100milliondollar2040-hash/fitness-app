import { motion } from "motion/react";
import {
  Trophy,
  Clock,
  Activity,
  Dumbbell,
  ArrowRight,
  Home,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";
import { ExerciseType } from "../../pages/ActiveWorkout";

interface WorkoutSummaryProps {
  elapsedTime: number;
  exercises: ExerciseType[];
  isSaving: boolean;
  newRecords: Record<string, boolean>;
  onFinish: () => void;
  onRestart: () => void;
  onSaveAsRoutine?: () => void;
}

export function WorkoutSummary({
  elapsedTime,
  exercises,
  isSaving,
  newRecords,
  onFinish,
  onRestart,
  onSaveAsRoutine,
}: WorkoutSummaryProps) {
  const { isDark } = useTheme();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalVolume = exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((setAcc, set) => {
        if (set.completed) {
          return setAcc + (parseFloat(set.kg) || 0) * (parseInt(set.reps) || 0);
        }
        return setAcc;
      }, 0)
    );
  }, 0);

  const totalSets = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const prExercises = exercises.filter((ex) =>
    ex.sets.some((s) => newRecords[s.id]),
  );

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex flex-col items-center justify-center p-6",
        isDark
          ? "bg-black/80 backdrop-blur-sm"
          : "bg-white/80 backdrop-blur-sm",
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-sm rounded-3xl p-8 shadow-2xl border text-center relative overflow-hidden",
          isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100",
        )}
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-green-400 to-zinc-400 dark:to-zinc-600 opacity-20" />

        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10 text-4xl">
          🎉
        </div>

        <h2
          className={cn(
            "text-2xl font-bold mb-2 relative z-10",
            isDark ? "text-white" : "text-zinc-900",
          )}
        >
          Tuyệt vời!
        </h2>
        <p
          className={cn(
            "mb-8 relative z-10",
            isDark ? "text-zinc-400" : "text-zinc-500",
          )}
        >
          Bạn đã hoàn thành buổi tập hôm nay.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
          <div
            className={cn(
              "rounded-2xl p-3 flex flex-col items-center justify-center",
              isDark ? "bg-green-500/10" : "bg-green-50",
            )}
          >
            <div className="text-green-500 font-bold text-lg mb-1">
              {formatTime(elapsedTime)}
            </div>
            <div
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isDark ? "text-green-400" : "text-green-600",
              )}
            >
              Thời gian
            </div>
          </div>
          <div
            className={cn(
              "rounded-2xl p-3 flex flex-col items-center justify-center",
              isDark ? "bg-emerald-500/10" : "bg-emerald-50",
            )}
          >
            <div className="text-emerald-500 font-bold text-lg mb-1">
              {totalVolume}
              <span className="text-xs font-normal ml-0.5">kg</span>
            </div>
            <div
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isDark ? "text-emerald-400" : "text-emerald-600",
              )}
            >
              Khối lượng
            </div>
          </div>
          <div
            className={cn(
              "rounded-2xl p-3 flex flex-col items-center justify-center",
              isDark ? "bg-emerald-500/10" : "bg-emerald-50",
            )}
          >
            <div className="text-emerald-500 font-bold text-lg mb-1">
              {totalSets}
            </div>
            <div
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isDark ? "text-emerald-400" : "text-emerald-600",
              )}
            >
              Hiệp
            </div>
          </div>
        </div>

        {prExercises.length > 0 && (
          <div className="mb-8 text-left relative z-10">
            <h3
              className={cn(
                "text-xs font-bold uppercase tracking-wider mb-3",
                isDark ? "text-zinc-500" : "text-zinc-400",
              )}
            >
              Kỷ lục mới
            </h3>
            <div className="space-y-2">
              {prExercises.map((ex) => (
                <div
                  key={ex.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    isDark ? "bg-zinc-800/50" : "bg-zinc-50",
                  )}
                >
                  <span
                    className={cn(
                      "font-medium text-sm truncate pr-2",
                      isDark ? "text-zinc-300" : "text-zinc-700",
                    )}
                  >
                    {ex.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400 px-2 py-1 rounded-md shrink-0">
                    <Trophy className="w-3 h-3" /> PR
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 relative z-10">
          <button
            onClick={onFinish}
            disabled={isSaving}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 disabled:opacity-50"
          >
            <Home className="w-5 h-5" />{" "}
            {isSaving ? "Đang lưu..." : "Về màn hình chính"}
          </button>
          {onSaveAsRoutine && (
            <button
              onClick={onSaveAsRoutine}
              className={cn(
                "w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                isDark
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900",
              )}
            >
              <Activity className="w-5 h-5" /> Lưu thành lịch tập
            </button>
          )}
          <button
            onClick={onRestart}
            className={cn(
              "w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2",
              isDark
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600",
            )}
          >
            <RotateCcw className="w-5 h-5" /> Tập lại từ đầu
          </button>
        </div>
      </motion.div>
    </div>
  );
}
