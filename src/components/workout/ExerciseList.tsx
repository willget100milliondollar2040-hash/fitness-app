import { Plus, Trash2, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";
import { ExerciseType, ExerciseImage } from "../../pages/ActiveWorkout";
import { SetTracker } from "./SetTracker";

interface ExerciseListProps {
  exercises: ExerciseType[];
  newRecords: Record<string, boolean>;
  onRemoveExercise: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onSetActiveRestTimer: (id: string) => void;
  onAddSet: (id: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: "kg" | "reps", value: string) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onImageClick: (name: string) => void;
}

export function ExerciseList({
  exercises,
  newRecords,
  onRemoveExercise,
  onUpdateNote,
  onSetActiveRestTimer,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleComplete,
  onImageClick
}: ExerciseListProps) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {exercises.map((exercise) => (
        <div 
          key={exercise.id} 
          className={cn(
            "rounded-3xl p-4 shadow-sm border transition-colors",
            isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="cursor-pointer"
              onClick={() => onImageClick(exercise.name)}
            >
              <ExerciseImage name={exercise.name} className="w-14 h-14 rounded-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn("font-bold text-lg truncate", isDark ? "text-white" : "text-zinc-900")}>
                {exercise.name}
              </h3>
            </div>
            <button onClick={() => onRemoveExercise(exercise.id)} className={cn("transition-colors p-2", isDark ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-500")}>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Note */}
          <input
            type="text"
            value={exercise.note || ""}
            onChange={(e) => onUpdateNote(exercise.id, e.target.value)}
            placeholder="Thêm ghi chú bài tập ở đây"
            className={cn(
              "w-full text-sm bg-transparent outline-none mb-2",
              isDark ? "text-zinc-300 placeholder:text-zinc-600" : "text-zinc-700 placeholder:text-zinc-400"
            )}
          />

          {/* Rest Timer Button */}
          <button 
            onClick={() => onSetActiveRestTimer(exercise.id)}
            className="flex items-center gap-1 text-sm font-medium text-blue-500 mb-4"
          >
            <Clock className="w-4 h-4" />
            Thời gian nghỉ: {exercise.restTimer || "Tắt"}
          </button>

          {/* Sets Table */}
          <div className="w-full">
            <div className={cn("flex text-xs font-bold uppercase tracking-wider mb-2 px-2", isDark ? "text-zinc-500" : "text-zinc-400")}>
              <div className="w-14 text-center">Hiệp</div>
              <div className="flex-1 text-center">Trước</div>
              <div className="w-14 text-center">kg</div>
              <div className="w-14 text-center">Lần</div>
              <div className="w-10 text-center"><Check className="w-4 h-4 mx-auto" /></div>
            </div>

            <div className="space-y-1">
              {exercise.sets.map((set, index) => {
                const normalSets = exercise.sets.filter(s => s.type === "N");
                const normalIndex = normalSets.indexOf(set);
                return (
                  <SetTracker
                    key={set.id}
                    exerciseId={exercise.id}
                    set={set}
                    index={normalIndex}
                    totalNormalSets={normalSets.length}
                    isNewRecord={!!newRecords[set.id]}
                    onUpdate={onUpdateSet}
                    onToggleComplete={onToggleComplete}
                    onRemove={onRemoveSet}
                  />
                );
              })}
            </div>

            <button
              onClick={() => onAddSet(exercise.id)}
              className={cn(
                "w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors",
                isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
              )}
            >
              <Plus className="w-5 h-5" /> Thêm hiệp
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
