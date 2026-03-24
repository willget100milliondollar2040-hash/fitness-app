import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";
import { SetType } from "../../pages/ActiveWorkout";

interface SetTrackerProps {
  exerciseId: string;
  set: SetType;
  index: number;
  totalNormalSets: number;
  isNewRecord: boolean;
  onUpdate: (exerciseId: string, setId: string, field: "kg" | "reps", value: string) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onRemove: (exerciseId: string, setId: string) => void;
}

export function SetTracker({
  exerciseId,
  set,
  index,
  totalNormalSets,
  isNewRecord,
  onUpdate,
  onToggleComplete,
  onRemove
}: SetTrackerProps) {
  const { isDark } = useTheme();
  const setNumber = set.type === "W" ? "W" : index + 1;

  return (
    <div
      className={cn(
        "flex items-center py-2 px-2 rounded-xl transition-colors relative group",
        set.completed ? (isDark ? "bg-white/10" : "bg-zinc-100") : "bg-transparent hover:bg-zinc-50 dark:hover:bg-white/5"
      )}
    >
      <div className="w-8 flex justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onRemove(exerciseId, set.id)}
          className={cn("w-7 h-7 rounded-full flex items-center justify-center transition-colors", isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100")}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-8 flex justify-center">
        <div className={cn("h-7 min-w-[1.75rem] px-1 rounded-md flex items-center justify-center font-bold text-xs", set.completed ? (isDark ? "bg-white/20 text-white" : "bg-zinc-300 text-zinc-900") : (isDark ? "bg-[#1F1F1F] text-zinc-400" : "bg-zinc-200 text-zinc-500"))}>
          {setNumber}
        </div>
      </div>
      <div className={cn("flex-1 text-center font-medium text-sm px-2 truncate", set.completed ? (isDark ? "text-white" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-400"))}>
        {set.previous}
      </div>
      <div className="w-20 px-1">
        <input
          type="text"
          inputMode="decimal"
          value={set.kg}
          onChange={(e) => onUpdate(exerciseId, set.id, "kg", e.target.value)}
          className={cn(
            "w-full text-center font-bold outline-none rounded-lg py-2 transition-colors border border-transparent focus:border-blue-500",
            set.completed ? (isDark ? "bg-transparent text-white" : "bg-transparent text-zinc-900") : (isDark ? "text-white bg-[#1F1F1F]/80 focus:bg-[#1F1F1F]" : "text-zinc-900 bg-zinc-100 focus:bg-white focus:shadow-sm")
          )}
        />
      </div>
      <div className="w-20 px-1">
        <input
          type="text"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => onUpdate(exerciseId, set.id, "reps", e.target.value)}
          className={cn(
            "w-full text-center font-bold outline-none rounded-lg py-2 transition-colors border border-transparent focus:border-blue-500",
            set.completed ? (isDark ? "bg-transparent text-white" : "bg-transparent text-zinc-900") : (isDark ? "text-white bg-[#1F1F1F]/80 focus:bg-[#1F1F1F]" : "text-zinc-900 bg-zinc-100 focus:bg-white focus:shadow-sm")
          )}
        />
      </div>
      <div className="w-12 flex justify-center relative">
        <button
          onClick={() => onToggleComplete(exerciseId, set.id)}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90",
            set.completed
              ? "bg-green-500 text-white shadow-md shadow-green-500/20"
              : isDark ? "bg-[#1F1F1F] text-zinc-500 hover:bg-[#2A2A2A] hover:text-white" : "bg-zinc-200 text-zinc-400 hover:bg-zinc-300 hover:text-zinc-600"
          )}
        >
          <Check className="w-5 h-5" strokeWidth={3} />
        </button>
        {isNewRecord && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm animate-bounce shadow-sm">
            Kỷ lục
          </div>
        )}
      </div>
    </div>
  );
}
