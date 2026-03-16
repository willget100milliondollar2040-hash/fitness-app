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
        "flex items-center py-2 px-1 rounded-xl transition-colors relative",
        set.completed ? (isDark ? "bg-white/20" : "bg-zinc-200") : "bg-transparent"
      )}
    >
      <div className="w-8 flex justify-center">
        <button 
          onClick={() => onRemove(exerciseId, set.id)}
          className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors", isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100")}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className={cn("w-6 text-center font-bold", set.completed ? (isDark ? "text-white" : "text-zinc-900") : (isDark ? "text-zinc-400" : "text-zinc-500"))}>
        {setNumber}
      </div>
      <div className={cn("flex-1 text-center font-medium text-sm", set.completed ? (isDark ? "text-white" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-400"))}>
        {set.previous}
      </div>
      <div className="w-14 px-1">
        <input
          type="text"
          inputMode="decimal"
          value={set.kg}
          onChange={(e) => onUpdate(exerciseId, set.id, "kg", e.target.value)}
          className={cn(
            "w-full text-center bg-transparent font-bold outline-none rounded-lg py-2 transition-colors",
            set.completed ? (isDark ? "text-white" : "text-zinc-900") : (isDark ? "text-white bg-zinc-800 focus:bg-zinc-700" : "text-zinc-900 bg-zinc-100 focus:bg-zinc-200")
          )}
        />
      </div>
      <div className="w-14 px-1">
        <input
          type="text"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => onUpdate(exerciseId, set.id, "reps", e.target.value)}
          className={cn(
            "w-full text-center bg-transparent font-bold outline-none rounded-lg py-2 transition-colors",
            set.completed ? (isDark ? "text-white" : "text-zinc-900") : (isDark ? "text-white bg-zinc-800 focus:bg-zinc-700" : "text-zinc-900 bg-zinc-100 focus:bg-zinc-200")
          )}
        />
      </div>
      <div className="w-10 flex justify-center relative">
        <button
          onClick={() => onToggleComplete(exerciseId, set.id)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90",
            set.completed
              ? "bg-green-500 text-white shadow-md shadow-green-500/20"
              : isDark ? "bg-zinc-800 text-zinc-500 hover:bg-zinc-700" : "bg-zinc-200 text-zinc-400 hover:bg-zinc-300"
          )}
        >
          <Check className="w-5 h-5" strokeWidth={3} />
        </button>
        {isNewRecord && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] font-bold px-1 rounded-sm animate-bounce">
            Kỷ lục
          </div>
        )}
      </div>
    </div>
  );
}
