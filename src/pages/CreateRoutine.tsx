import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, Dumbbell, Clock, Plus, Search, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { EXERCISE_DB, ExerciseType, SetType, getExerciseImage, ExerciseImage } from "./ActiveWorkout";

export default function CreateRoutine() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  
  // Exercise Modal State
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Rest Timer Modal State
  const [activeRestTimerExerciseId, setActiveRestTimerExerciseId] = useState<string | null>(null);
  const [selectedExerciseImage, setSelectedExerciseImage] = useState<string | null>(null);

  const filteredDB = useMemo(() => {
    if (!searchQuery.trim()) {
      return EXERCISE_DB.map(group => ({
        ...group,
        items: group.items.slice(0, 5)
      }));
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    return EXERCISE_DB.map(group => ({
      category: group.category,
      items: group.items.filter(item => {
        const name = typeof item === 'string' ? item : item.name;
        return name.toLowerCase().includes(lowerQuery);
      })
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  const addNewExercise = (name: string) => {
    const newEx: ExerciseType = {
      id: "ex_" + Date.now(),
      name,
      restTimer: "1m 00s", // Default rest timer
      sets: [
        { id: "set_" + Date.now(), type: "N", previous: "-", kg: "0", reps: "10", completed: false }
      ]
    };
    setExercises([...exercises, newEx]);
    setShowAddExercise(false);
    setSearchQuery("");
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: SetType = {
            id: "set_" + Date.now(),
            type: "N",
            previous: "-",
            kg: lastSet ? lastSet.kg : "0",
            reps: lastSet ? lastSet.reps : "0",
            completed: false,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exerciseId) {
          return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: "kg" | "reps", value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(s => (s.id === setId ? { ...s, [field]: numericValue } : s)),
          };
        }
        return ex;
      })
    );
  };

  const updateExerciseNote = (exerciseId: string, note: string) => {
    setExercises(prev =>
      prev.map(ex => (ex.id === exerciseId ? { ...ex, note } : ex))
    );
  };

  const updateRestTimer = (time: string) => {
    if (activeRestTimerExerciseId) {
      setExercises(prev =>
        prev.map(ex => (ex.id === activeRestTimerExerciseId ? { ...ex, restTimer: time } : ex))
      );
      setActiveRestTimerExerciseId(null);
    }
  };

  const handleSave = () => {
    if (!title.trim() && exercises.length === 0) return;

    const existingRoutinesStr = localStorage.getItem("routines");
    const defaultRoutines = [
      { id: "push", title: "Push Day", subtitle: "Chest, Shoulders, Triceps", duration: "1h 15m", iconName: "Flame", color: "text-orange-500", bg: "bg-orange-100" },
      { id: "pull", title: "Pull Day", subtitle: "Back, Biceps", duration: "1h 10m", iconName: "Activity", color: "text-blue-500", bg: "bg-blue-100" },
      { id: "legs", title: "Leg Day", subtitle: "Quads, Hamstrings, Calves", duration: "1h 20m", iconName: "Dumbbell", color: "text-zinc-900 dark:text-white", bg: "bg-zinc-200 dark:bg-zinc-800" },
      { id: "fullbody", title: "Full Body", subtitle: "Full Body", duration: "1h 30m", iconName: "Activity", color: "text-purple-500", bg: "bg-purple-100" },
    ];
    const existingRoutines = existingRoutinesStr ? JSON.parse(existingRoutinesStr) : defaultRoutines;

    const newRoutine = {
      id: "routine_" + Date.now(),
      title: title.trim() || "New Routine",
      subtitle: `${exercises.length} exercises`,
      duration: "1h 00m",
      iconName: "Activity",
      color: "text-blue-500",
      bg: "bg-blue-100",
      exercises: exercises, // Save the template exercises
    };

    localStorage.setItem("routines", JSON.stringify([...existingRoutines, newRoutine]));
    navigate("/");
  };

  const restTimerOptions = ["Off", "20s", "25s", "30s", "45s", "1m 00s", "1m 30s", "2m 00s", "3m 00s"];

  return (
    <div className={cn("flex flex-col h-[100dvh] max-w-md mx-auto relative transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      {/* Header */}
      <header className={cn("px-4 py-3 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300", isDark ? "bg-[#1c1c1e]" : "bg-white border-b border-zinc-100")}>
        <button onClick={() => navigate(-1)} className="text-blue-500 font-medium text-lg">
          Cancel
        </button>
        <h1 className="font-bold text-lg">Create Routine</h1>
        <button 
          onClick={handleSave}
          disabled={!title.trim() && exercises.length === 0}
          className={cn(
            "px-4 py-1.5 rounded-lg font-medium transition-colors",
            (!title.trim() && exercises.length === 0) 
              ? (isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-200 text-zinc-400")
              : "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          Save
        </button>
      </header>

      {/* Help Banner */}
      {showHelpBanner && (
        <div className="bg-[#fff3cd] text-[#856404] px-4 py-3 flex items-center justify-between text-sm font-medium">
          <span>You're creating a Routine. Tap for help...</span>
          <button onClick={() => setShowHelpBanner(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Routine title"
          className={cn(
            "w-full text-2xl font-bold bg-transparent border-b pb-2 mb-8 outline-none placeholder:font-bold",
            isDark ? "border-zinc-800 placeholder:text-zinc-700" : "border-zinc-200 placeholder:text-zinc-300"
          )}
        />

        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className={cn("w-12 h-12 mb-4", isDark ? "text-zinc-700" : "text-zinc-300")} />
            <p className={cn("text-lg mb-8", isDark ? "text-zinc-400" : "text-zinc-500")}>
              Get started by adding an exercise to your routine.
            </p>
            <button 
              onClick={() => setShowAddExercise(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" /> Add exercise
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {exercises.map((exercise) => (
              <div key={exercise.id} className={cn("rounded-3xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
                {/* Exercise Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="cursor-pointer"
                      onClick={() => setSelectedExerciseImage(getExerciseImage(exercise.name))}
                    >
                      <ExerciseImage name={exercise.name} className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700" />
                    </div>
                    <h3 className="font-bold text-blue-500 text-lg leading-tight">{exercise.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeExercise(exercise.id)} className={cn("transition-colors p-2", isDark ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-500")}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button className={cn("transition-colors p-2", isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-black")}>
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Note Input */}
                <input
                  type="text"
                  value={exercise.note || ""}
                  onChange={(e) => updateExerciseNote(exercise.id, e.target.value)}
                  placeholder="Add routine notes here"
                  className={cn(
                    "w-full text-sm bg-transparent outline-none mb-2",
                    isDark ? "text-zinc-300 placeholder:text-zinc-600" : "text-zinc-700 placeholder:text-zinc-400"
                  )}
                />

                {/* Rest Timer Button */}
                <button 
                  onClick={() => setActiveRestTimerExerciseId(exercise.id)}
                  className="flex items-center gap-1 text-sm font-medium text-blue-500 mb-4"
                >
                  <Clock className="w-4 h-4" />
                  Rest Timer: {exercise.restTimer || "Off"}
                </button>

                {/* Sets Table */}
                <div className="w-full">
                  <div className={cn("flex text-xs font-bold uppercase tracking-wider mb-2 px-2", isDark ? "text-zinc-500" : "text-zinc-400")}>
                    <div className="w-10 text-center">Set</div>
                    <div className="w-14 text-center">kg</div>
                    <div className="w-14 text-center">Reps</div>
                  </div>

                  <div className="space-y-1">
                    {exercise.sets.map((set, index) => {
                      const setNumber = set.type === "W" ? "W" : exercise.sets.filter(s => s.type === "N").indexOf(set) + 1;
                      return (
                        <div
                          key={set.id}
                          className={cn(
                            "flex items-center py-2 px-1 rounded-xl transition-colors group relative",
                            isDark ? "bg-zinc-900/50" : "bg-zinc-50"
                          )}
                        >
                          {/* Delete Set Button (shows on hover/active) */}
                          <button 
                            onClick={() => removeSet(exercise.id, set.id)}
                            className={cn("absolute -left-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-500")}
                          >
                            <X className="w-3 h-3" />
                          </button>

                          <div className={cn(
                            "w-10 text-center font-bold",
                            set.type === "W" ? "text-orange-400" : (isDark ? "text-white" : "text-zinc-900")
                          )}>
                            {setNumber}
                          </div>
                          
                          <div className="w-14 px-1">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={set.kg}
                              onChange={(e) => updateSet(exercise.id, set.id, "kg", e.target.value)}
                              className={cn(
                                "w-full text-center font-bold text-lg bg-transparent outline-none",
                                isDark ? "text-white" : "text-zinc-900"
                              )}
                            />
                          </div>
                          <div className="w-14 px-1">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) => updateSet(exercise.id, set.id, "reps", e.target.value)}
                              className={cn(
                                "w-full text-center font-bold text-lg bg-transparent outline-none",
                                isDark ? "text-white" : "text-zinc-900"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => addSet(exercise.id)}
                    className={cn("w-full mt-3 py-2.5 rounded-xl font-medium flex items-center justify-center gap-1 transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}
                  >
                    <Plus className="w-4 h-4" /> Add Set
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddExercise(true)}
              className={cn("w-full py-4 rounded-3xl border-2 border-dashed font-bold flex items-center justify-center gap-2 transition-colors", isDark ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : "border-blue-200 text-blue-500 hover:bg-blue-50")}
            >
              <Plus className="w-5 h-5" /> Add exercise
            </button>
          </div>
        )}
      </main>

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className={cn("absolute inset-0 z-50 flex flex-col", isDark ? "bg-black" : "bg-zinc-50")}>
          <header className={cn("px-4 py-4 border-b flex flex-col gap-3 shadow-sm z-10", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
            <div className="flex items-center justify-between">
              <h2 className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>Select Exercise</h2>
              <button onClick={() => { setShowAddExercise(false); setSearchQuery(""); }} className={cn("p-2 rounded-full transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className={cn("w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-zinc-500" : "text-zinc-400")} />
              <input 
                type="text"
                placeholder="Search 200+ exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full pl-10 pr-4 py-2.5 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all outline-none", isDark ? "bg-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-900" : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-white")}
              />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {filteredDB.length === 0 ? (
              <div className={cn("text-center py-10", isDark ? "text-zinc-500" : "text-zinc-500")}>
                No exercises found.
              </div>
            ) : (
              filteredDB.map((group) => (
                <div key={group.category}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className={cn("font-bold text-sm uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>{group.category}</h3>
                    {!searchQuery.trim() && (
                      <span className={cn("text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>Showing 5 items</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.items.map(item => {
                      const name = typeof item === 'string' ? item : item.name;
                      const level = typeof item === 'string' ? null : item.level;
                      const muscle = typeof item === 'string' ? null : item.muscle;
                      const equipment = typeof item === 'string' ? null : item.equipment;
                      
                      return (
                      <button
                        key={name}
                        onClick={() => addNewExercise(name)}
                        className={cn("w-full text-left p-4 rounded-2xl font-medium shadow-sm border transition-colors", isDark ? "bg-[#1c1c1e] text-zinc-200 border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/10" : "bg-white text-zinc-900 border-zinc-100 hover:border-blue-300 hover:bg-blue-50")}
                      >
                        <div className="flex items-center gap-3">
                          <ExerciseImage name={name} className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 shrink-0" />
                          <div>
                            <div className="font-bold">{name}</div>
                            {(level || muscle || equipment) && (
                              <div className="mt-1 flex flex-wrap gap-2 text-[10px] sm:text-xs">
                                {level && <span className={cn("px-2 py-0.5 rounded-md font-semibold", level === "Beginner" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : level === "Intermediate" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400")}>{level}</span>}
                                {muscle && <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{muscle}</span>}
                                {equipment && <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{equipment}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )})}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Rest Timer Bottom Sheet */}
      {activeRestTimerExerciseId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className={cn("w-full max-w-md rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300", isDark ? "bg-[#1c1c1e] text-white" : "bg-white text-zinc-900")}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Rest Timer</h3>
              <button onClick={() => setActiveRestTimerExerciseId(null)} className={cn("p-2 rounded-full transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200")}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {restTimerOptions.map((time) => {
                const currentExercise = exercises.find(ex => ex.id === activeRestTimerExerciseId);
                const isSelected = currentExercise?.restTimer === time;
                
                return (
                  <button
                    key={time}
                    onClick={() => updateRestTimer(time)}
                    className={cn(
                      "py-3 rounded-xl font-bold text-sm transition-colors",
                      isSelected 
                        ? "bg-blue-500 text-white" 
                        : (isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200")
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Image Modal */}
      {selectedExerciseImage && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedExerciseImage(null)}>
          <div className="relative max-w-sm w-full bg-transparent rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedExerciseImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedExerciseImage} 
              alt="Exercise Instruction" 
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
