import { useState } from "react";
import {
  Plus,
  Trash2,
  Clock,
  Check,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";
import { ExerciseType, ExerciseImage } from "../../pages/ActiveWorkout";
import { SetTracker } from "./SetTracker";

interface ExerciseListProps {
  exercises: ExerciseType[];
  newRecords: Record<string, boolean>;
  exerciseRecords: Record<string, { maxKg: number; reps: number } | null>;
  onRemoveExercise: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onSetActiveRestTimer: (id: string) => void;
  onAddSet: (id: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: "kg" | "reps",
    value: string,
  ) => void;
  onToggleComplete: (exerciseId: string, setId: string) => void;
  onImageClick: (name: string) => void;
}

export function ExerciseList({
  exercises,
  newRecords,
  exerciseRecords,
  onRemoveExercise,
  onUpdateNote,
  onSetActiveRestTimer,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleComplete,
  onImageClick,
}: ExerciseListProps) {
  const { isDark } = useTheme();
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const toggleRecord = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {exercises.map((exercise) => {
        const record = exerciseRecords[exercise.name];
        const isExpanded = expandedRecordId === exercise.id;
        const totalSets = exercise.sets.length;
        const completedSets = exercise.sets.filter((s) => s.completed).length;
        const percent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
        const isAllCompleted = totalSets > 0 && completedSets === totalSets;

        return (
          <div
            key={exercise.id}
            className={cn(
              "rounded-3xl p-4 shadow-sm border transition-all duration-300",
              isDark
                ? "bg-[#1c1c1e] border-zinc-800"
                : "bg-white border-zinc-100",
              isAllCompleted && "border-green-500 ring-1 ring-green-500",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="cursor-pointer transition-transform active:scale-95"
                onClick={() => onImageClick(exercise.name)}
              >
                <ExerciseImage
                  name={exercise.name}
                  className="w-14 h-14 rounded-2xl"
                />
              </div>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => toggleRecord(exercise.id)}
              >
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "font-bold text-lg truncate",
                      isDark ? "text-white" : "text-zinc-900",
                    )}
                  >
                    {exercise.name}
                  </h3>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-zinc-500">
                    {completedSets}/{totalSets} sets
                  </span>
                  {isAllCompleted && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                      <Check className="w-3 h-3" /> Hoàn thành
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "h-1.5 rounded-full mt-2 overflow-hidden",
                    isDark ? "bg-zinc-800" : "bg-zinc-200",
                  )}
                >
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                  />
                </div>
                {isExpanded && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-yellow-500 bg-yellow-500/10 w-fit px-2 py-1 rounded-md">
                    <Trophy className="w-3 h-3" />
                    {record
                      ? `Kỷ lục: ${record.maxKg}kg x ${record.reps} lần`
                      : "Chưa có kỷ lục"}
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemoveExercise(exercise.id)}
                className={cn(
                  "transition-all p-2 active:scale-[0.98]",
                  isDark
                    ? "text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-full"
                    : "text-zinc-400 hover:text-red-500 hover:bg-zinc-100 rounded-full",
                )}
              >
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
                isDark
                  ? "text-zinc-300 placeholder:text-zinc-600"
                  : "text-zinc-700 placeholder:text-zinc-400",
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
              <div
                className={cn(
                  "flex text-xs font-bold uppercase tracking-wider mb-2 px-2",
                  isDark ? "text-zinc-500" : "text-zinc-400",
                )}
              >
                <div className="w-14 text-center">SET</div>
                <div className="flex-1 text-center">PREVIOUS</div>
                <div className="w-16 text-center">+KG</div>
                <div className="w-16 text-center">REPS</div>
                <div className="w-10 text-center">
                  <Check className="w-4 h-4 mx-auto" />
                </div>
              </div>

              <div className="space-y-1">
                {exercise.sets.map((set, index) => {
                  const normalSets = exercise.sets.filter(
                    (s) => s.type === "N",
                  );
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
                  "w-full mt-2 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all active:scale-95 text-sm",
                  isDark
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700",
                )}
              >
                <Plus className="w-4 h-4" /> Thêm hiệp
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
