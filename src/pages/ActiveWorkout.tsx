import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Clock, MoreVertical, Plus, Check, Trash2, X, Search, Trophy, RotateCcw, Home, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { workoutService } from "../lib/workoutService";
import { supabase } from "../lib/supabase";

export type SetType = {
  id: string;
  type: "W" | "N";
  previous: string;
  kg: string;
  reps: string;
  completed: boolean;
};

export type ExerciseType = {
  id: string;
  name: string;
  note?: string;
  restTimer?: string;
  sets: SetType[];
};

export type ExerciseDef = {
  name: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  muscle?: string;
  equipment?: string;
  progression?: string;
};

export type ExerciseCategory = {
  category: string;
  items: (string | ExerciseDef)[];
};

export const EXERCISE_IMAGES: Record<string, string> = {
};

export const getExerciseImage = (name: string) => {
  const normalized = name.toLowerCase().trim();
  if (EXERCISE_IMAGES[name]) return EXERCISE_IMAGES[name];
  
  for (const [key, value] of Object.entries(EXERCISE_IMAGES)) {
    const keyLower = key.toLowerCase().trim();
    if (keyLower === normalized) return value;
    if (keyLower.replace(/-/g, ' ') === normalized.replace(/-/g, ' ')) return value;
  }

  return `https://picsum.photos/seed/${encodeURIComponent(name)}/100/100`;
};

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", 
  "bg-rose-500", "bg-indigo-500", "bg-amber-500", "bg-cyan-500"
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export function ExerciseImage({ name, className }: { name: string, className?: string }) {
  const [error, setError] = useState(false);
  const { isDark } = useTheme();
  const src = getExerciseImage(name);
  const bgColor = getAvatarColor(name);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={cn(
      "relative flex items-center justify-center overflow-hidden shrink-0 shadow-inner", 
      bgColor,
      className
    )}>
      {/* Fallback Initial */}
      <span className="text-white font-bold text-lg select-none">
        {initial}
      </span>
      
      {/* Icon Overlay (Subtle) */}
      <Dumbbell className="w-1/2 h-1/2 absolute opacity-10 text-white" />
      
      {!error && (
        <img 
          src={src} 
          alt={name} 
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300" 
        />
      )}
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-white/10 pointer-events-none z-20" />
    </div>
  );
}

export const EXERCISE_DB: ExerciseCategory[] = [
  {
    category: "Upper Body Push (Weighted)",
    items: [
      { name: "Weighted Dips", level: "Intermediate", muscle: "Chest, Triceps, Shoulders", equipment: "Dip belt / Vest" },
      { name: "Weighted Push Ups", level: "Intermediate", muscle: "Chest, Triceps, Shoulders", equipment: "Vest / Weight plate" },
      { name: "Weighted Ring Dips", level: "Advanced", muscle: "Chest, Triceps, Shoulders", equipment: "Dip belt / Vest, Rings" },
      { name: "Weighted Handstand Push Ups", level: "Advanced", muscle: "Shoulders, Triceps", equipment: "Vest" },
      { name: "Weighted Pseudo Planche Push Ups", level: "Advanced", muscle: "Chest, Shoulders", equipment: "Vest" },
      { name: "Ring Push Ups", level: "Intermediate", muscle: "Chest, Triceps, Shoulders", equipment: "Rings" },
    ]
  },
  {
    category: "Upper Body Pull (Weighted)",
    items: [
      { name: "Weighted Pull Ups", level: "Intermediate", muscle: "Lats, Biceps", equipment: "Dip belt / Vest" },
      { name: "Weighted Chin Ups", level: "Intermediate", muscle: "Lats, Biceps", equipment: "Dip belt / Vest" },
      { name: "Weighted Muscle Ups", level: "Advanced", muscle: "Lats, Chest, Triceps", equipment: "Dip belt / Vest" },
      { name: "Weighted Archer Pull Ups", level: "Advanced", muscle: "Lats, Biceps", equipment: "Vest" },
      { name: "Weighted Front Lever Pulls", level: "Advanced", muscle: "Lats, Core", equipment: "Vest / Ankle weights" },
    ]
  },
  {
    category: "Core (Weighted)",
    items: [
      { name: "Weighted Hanging Leg Raises", level: "Intermediate", muscle: "Core, Hip Flexors", equipment: "Ankle weights / Dumbbell" },
      { name: "Weighted Toes To Bar", level: "Advanced", muscle: "Core, Lats", equipment: "Ankle weights" },
      { name: "Weighted L-Sit", level: "Intermediate", muscle: "Core, Hip Flexors", equipment: "Ankle weights" },
      { name: "Weighted Dragon Flag", level: "Advanced", muscle: "Core", equipment: "Ankle weights" },
    ]
  },
  {
    category: "Legs (Weighted)",
    items: [
      { name: "Weighted Pistol Squat", level: "Advanced", muscle: "Quads, Glutes", equipment: "Vest / Dumbbell" },
      { name: "Weighted Bulgarian Split Squat", level: "Intermediate", muscle: "Quads, Glutes", equipment: "Dumbbells" },
      { name: "Weighted Jump Squat", level: "Intermediate", muscle: "Quads, Calves", equipment: "Vest / Dumbbells" },
      { name: "Weighted Step Ups", level: "Beginner", muscle: "Quads, Glutes", equipment: "Dumbbells" },
    ]
  },
  {
    category: "Full Body / Skill Strength (Weighted)",
    items: [
      { name: "Weighted Front Lever Hold", level: "Advanced", muscle: "Lats, Core", equipment: "Ankle weights / Vest" },
      { name: "Weighted Planche Lean", level: "Intermediate", muscle: "Shoulders, Core", equipment: "Vest" },
    ]
  },
  {
    category: "Ngực (Chest)",
    items: [
      { name: "Push-up", level: "Beginner", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Diamond Push-up", level: "Intermediate", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Wide Push-up", level: "Beginner", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Decline Push-up", level: "Beginner", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Incline Push-up", level: "Beginner", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Archer Push-up", level: "Advanced", muscle: "Chest", equipment: "Bodyweight" },
      { name: "One Arm Push-up", level: "Advanced", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Spiderman Push-up", level: "Beginner", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Hindu Push-up", level: "Beginner", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Dive Bomber Push-up", level: "Intermediate", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Clap Push-up", level: "Intermediate", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Sphinx Push-up", level: "Intermediate", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Pseudo Planche Push-up", level: "Advanced", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Bench Press", level: "Intermediate", muscle: "Chest", equipment: "Barbell" },
      { name: "Incline Bench Press", level: "Intermediate", muscle: "Chest", equipment: "Barbell" },
      { name: "Decline Bench Press", level: "Intermediate", muscle: "Chest", equipment: "Barbell" },
      { name: "Dumbbell Bench Press", level: "Intermediate", muscle: "Chest", equipment: "Barbell" },
      { name: "Incline Dumbbell Press", level: "Intermediate", muscle: "Chest", equipment: "Dumbbells" },
      { name: "Decline Dumbbell Press", level: "Intermediate", muscle: "Chest", equipment: "Dumbbells" },
      { name: "Dumbbell Fly", level: "Intermediate", muscle: "Chest", equipment: "Dumbbells" },
      { name: "Incline Dumbbell Fly", level: "Intermediate", muscle: "Chest", equipment: "Dumbbells" },
      { name: "Cable Crossover", level: "Intermediate", muscle: "Chest", equipment: "Cable Machine" },
      { name: "Low Cable Crossover", level: "Intermediate", muscle: "Chest", equipment: "Cable Machine" },
      { name: "High Cable Crossover", level: "Intermediate", muscle: "Chest", equipment: "Cable Machine" },
      { name: "Pec Deck Fly", level: "Intermediate", muscle: "Chest", equipment: "Machine" },
      { name: "Machine Chest Press", level: "Intermediate", muscle: "Chest", equipment: "Machine" },
      { name: "Svend Press", level: "Intermediate", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Floor Press", level: "Intermediate", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Guillotine Press", level: "Advanced", muscle: "Chest", equipment: "Bodyweight" },
      { name: "Hex Press", level: "Intermediate", muscle: "Chest", equipment: "Bodyweight" },
    ]
  },
  {
    category: "Lưng (Back)",
    items: [
      { name: "Pull-up", level: "Intermediate", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Chin-up", level: "Intermediate", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Wide Grip Pull-up", level: "Intermediate", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Close Grip Pull-up", level: "Intermediate", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Commando Pull-up", level: "Intermediate", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Archer Pull-up", level: "Advanced", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Typewriter Pull-up", level: "Advanced", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "One Arm Pull-up", level: "Advanced", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Australian Pull-up", level: "Intermediate", muscle: "Back", equipment: "Pull-up Bar" },
      { name: "Deadlift", level: "Intermediate", muscle: "Back", equipment: "Barbell" },
      { name: "Romanian Deadlift", level: "Intermediate", muscle: "Back", equipment: "Barbell" },
      { name: "Sumo Deadlift", level: "Intermediate", muscle: "Back", equipment: "Barbell" },
      { name: "Barbell Row", level: "Intermediate", muscle: "Back", equipment: "Barbell" },
      { name: "Pendlay Row", level: "Intermediate", muscle: "Back", equipment: "Bodyweight" },
      { name: "Dumbbell Row", level: "Intermediate", muscle: "Back", equipment: "Dumbbells" },
      { name: "One Arm Dumbbell Row", level: "Advanced", muscle: "Back", equipment: "Dumbbells" },
      { name: "T-Bar Row", level: "Intermediate", muscle: "Back", equipment: "Bodyweight" },
      { name: "Seated Cable Row", level: "Intermediate", muscle: "Back", equipment: "Cable Machine" },
      { name: "Lat Pulldown", level: "Beginner", muscle: "Back", equipment: "Machine" },
      { name: "Close Grip Lat Pulldown", level: "Beginner", muscle: "Back", equipment: "Machine" },
      { name: "Reverse Grip Lat Pulldown", level: "Beginner", muscle: "Back", equipment: "Machine" },
      { name: "Straight Arm Pulldown", level: "Beginner", muscle: "Back", equipment: "Bodyweight" },
      { name: "Face Pull", level: "Beginner", muscle: "Back", equipment: "Bodyweight" },
      { name: "Good Morning", level: "Beginner", muscle: "Back", equipment: "Bodyweight" },
      { name: "Hyperextension", level: "Beginner", muscle: "Back", equipment: "Bodyweight" },
      { name: "Superman", level: "Beginner", muscle: "Back", equipment: "Bodyweight" },
      { name: "Renegade Row", level: "Intermediate", muscle: "Back", equipment: "Bodyweight" },
      { name: "Inverted Row", level: "Intermediate", muscle: "Back", equipment: "Bodyweight" },
      { name: "Meadows Row", level: "Intermediate", muscle: "Back", equipment: "Bodyweight" },
      { name: "Rack Pull", level: "Beginner", muscle: "Back", equipment: "Bodyweight" },
    ]
  },
  {
    category: "Vai (Shoulders)",
    items: [
      { name: "Pike Push-up", level: "Beginner", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Elevated Pike Push-up", level: "Beginner", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Handstand Push-up (HSPU)", level: "Advanced", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Wall Handstand Push-up", level: "Advanced", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Overhead Press", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Seated Barbell Press", level: "Intermediate", muscle: "Shoulders", equipment: "Barbell" },
      { name: "Dumbbell Shoulder Press", level: "Intermediate", muscle: "Shoulders", equipment: "Dumbbells" },
      { name: "Arnold Press", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Push Press", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Lateral Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Cable Lateral Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Cable Machine" },
      { name: "Machine Lateral Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Machine" },
      { name: "Front Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Dumbbell Front Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Dumbbells" },
      { name: "Cable Front Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Cable Machine" },
      { name: "Barbell Front Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Barbell" },
      { name: "Reverse Pec Deck", level: "Beginner", muscle: "Shoulders", equipment: "Machine" },
      { name: "Bent Over Lateral Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Cable Reverse Fly", level: "Intermediate", muscle: "Shoulders", equipment: "Cable Machine" },
      { name: "Upright Row", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Dumbbell Upright Row", level: "Intermediate", muscle: "Shoulders", equipment: "Dumbbells" },
      { name: "Cable Upright Row", level: "Intermediate", muscle: "Shoulders", equipment: "Cable Machine" },
      { name: "Shrugs", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Dumbbell Shrugs", level: "Intermediate", muscle: "Shoulders", equipment: "Dumbbells" },
      { name: "Barbell Shrugs", level: "Intermediate", muscle: "Shoulders", equipment: "Barbell" },
      { name: "Landmine Press", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Z Press", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Bradford Press", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Cuban Press", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
      { name: "Y-Raise", level: "Intermediate", muscle: "Shoulders", equipment: "Bodyweight" },
    ]
  },
  {
    category: "Tay trước (Biceps)",
    items: [
      { name: "Barbell Curl", level: "Intermediate", muscle: "Biceps", equipment: "Barbell" },
      { name: "Dumbbell Curl", level: "Intermediate", muscle: "Biceps", equipment: "Dumbbells" },
      { name: "Hammer Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Crossbody Hammer Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Preacher Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Machine Preacher Curl", level: "Intermediate", muscle: "Biceps", equipment: "Machine" },
      { name: "EZ Bar Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Reverse Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Zottman Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Concentration Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Cable Curl", level: "Intermediate", muscle: "Biceps", equipment: "Cable Machine" },
      { name: "High Cable Curl", level: "Intermediate", muscle: "Biceps", equipment: "Cable Machine" },
      { name: "Spider Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Incline Dumbbell Curl", level: "Intermediate", muscle: "Biceps", equipment: "Dumbbells" },
      { name: "Drag Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Waiters Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Bayesian Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Pelican Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
      { name: "Chin-up (Bicep Focus)", level: "Intermediate", muscle: "Biceps", equipment: "Pull-up Bar" },
      { name: "Bodyweight Bicep Curl", level: "Intermediate", muscle: "Biceps", equipment: "Bodyweight" },
    ]
  },
  {
    category: "Tay sau (Triceps)",
    items: [
      { name: "Dips", level: "Intermediate", muscle: "Triceps", equipment: "Dip Bar" },
      { name: "Straight Bar Dips", level: "Intermediate", muscle: "Triceps", equipment: "Dip Bar" },
      { name: "Bench Dip", level: "Beginner", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Ring Dip", level: "Intermediate", muscle: "Triceps", equipment: "Rings" },
      { name: "Tricep Pushdown", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Rope Tricep Pushdown", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "V-Bar Pushdown", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Straight Bar Pushdown", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Skull Crusher", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Dumbbell Skull Crusher", level: "Intermediate", muscle: "Triceps", equipment: "Dumbbells" },
      { name: "EZ Bar Skull Crusher", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Overhead Tricep Extension", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Dumbbell Overhead Extension", level: "Intermediate", muscle: "Triceps", equipment: "Dumbbells" },
      { name: "Cable Overhead Extension", level: "Intermediate", muscle: "Triceps", equipment: "Cable Machine" },
      { name: "Tricep Kickback", level: "Beginner", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Cable Kickback", level: "Intermediate", muscle: "Triceps", equipment: "Cable Machine" },
      { name: "Close Grip Bench Press", level: "Intermediate", muscle: "Triceps", equipment: "Barbell" },
      { name: "JM Press", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Tate Press", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Bodyweight Tricep Extension", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Tiger Bend Push-up", level: "Advanced", muscle: "Triceps", equipment: "Bodyweight" },
      { name: "Sphinx Push-up", level: "Intermediate", muscle: "Triceps", equipment: "Bodyweight" },
    ]
  },
  {
    category: "Chân (Legs)",
    items: [
      { name: "Bodyweight Squat", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Jump Squat", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Pistol Squat", level: "Advanced", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Shrimp Squat", level: "Advanced", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Cossack Squat", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Bulgarian Split Squat", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Lunges", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Walking Lunges", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Jump Lunges", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Reverse Lunges", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Side Lunges", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Barbell Squat", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Front Squat", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Overhead Squat", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Zercher Squat", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Box Squat", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Hack Squat", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Leg Press", level: "Intermediate", muscle: "Legs", equipment: "Machine" },
      { name: "Leg Extension", level: "Intermediate", muscle: "Legs", equipment: "Machine" },
      { name: "Leg Curl", level: "Intermediate", muscle: "Legs", equipment: "Machine" },
      { name: "Seated Leg Curl", level: "Intermediate", muscle: "Legs", equipment: "Machine" },
      { name: "Lying Leg Curl", level: "Intermediate", muscle: "Legs", equipment: "Machine" },
      { name: "Nordic Hamstring Curl", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Glute Bridge", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Barbell Glute Bridge", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Hip Thrust", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Barbell Hip Thrust", level: "Intermediate", muscle: "Legs", equipment: "Barbell" },
      { name: "Single Leg Hip Thrust", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Calf Raise", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Seated Calf Raise", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Donkey Calf Raise", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Tibialis Raise", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Step-ups", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Sissy Squat", level: "Intermediate", muscle: "Legs", equipment: "Bodyweight" },
      { name: "Wall Sit", level: "Beginner", muscle: "Legs", equipment: "Bodyweight" },
    ]
  },
  {
    category: "Bụng/Lõi (Core)",
    items: [
      { name: "Plank", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Side Plank", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Hollow Body Hold", level: "Intermediate", muscle: "Core", equipment: "Bodyweight" },
      { name: "Arch Body Hold", level: "Intermediate", muscle: "Core", equipment: "Bodyweight" },
      { name: "L-Sit", level: "Intermediate", muscle: "Core", equipment: "Bodyweight" },
      { name: "V-Sit", level: "Intermediate", muscle: "Core", equipment: "Bodyweight" },
      { name: "Manna", level: "Advanced", muscle: "Core", equipment: "Bodyweight" },
      { name: "Hanging Leg Raise", level: "Intermediate", muscle: "Core", equipment: "Pull-up Bar" },
      { name: "Hanging Knee Raise", level: "Intermediate", muscle: "Core", equipment: "Pull-up Bar" },
      { name: "Toes to Bar", level: "Intermediate", muscle: "Core", equipment: "Pull-up Bar" },
      { name: "Dragon Flag", level: "Advanced", muscle: "Core", equipment: "Bodyweight" },
      { name: "Ab Wheel Rollout", level: "Intermediate", muscle: "Core", equipment: "Ab Wheel" },
      { name: "Crunch", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Bicycle Crunch", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Russian Twist", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Sit-up", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "V-up", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Flutter Kicks", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Scissor Kicks", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Mountain Climber", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Cable Crunch", level: "Intermediate", muscle: "Core", equipment: "Cable Machine" },
      { name: "Machine Crunch", level: "Intermediate", muscle: "Core", equipment: "Machine" },
      { name: "Woodchopper", level: "Intermediate", muscle: "Core", equipment: "Bodyweight" },
      { name: "Pallof Press", level: "Intermediate", muscle: "Core", equipment: "Bodyweight" },
      { name: "Dead Bug", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Bird Dog", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Captain's Chair Leg Raise", level: "Intermediate", muscle: "Core", equipment: "Bodyweight" },
      { name: "Decline Crunch", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Reverse Crunch", level: "Beginner", muscle: "Core", equipment: "Bodyweight" },
      { name: "Tuck Planche Hold", level: "Advanced", muscle: "Core", equipment: "Bodyweight" },
    ]
  },
  {
    category: "Kỹ năng (Skills) & Toàn thân",
    items: [
      { name: "Muscle-up", level: "Advanced", muscle: "Full Body", equipment: "Pull-up Bar" },
      { name: "Bar Muscle-up", level: "Advanced", muscle: "Full Body", equipment: "Pull-up Bar" },
      { name: "Ring Muscle-up", level: "Advanced", muscle: "Full Body", equipment: "Rings" },
      { name: "Front Lever", level: "Advanced", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Back Lever", level: "Advanced", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Planche", level: "Advanced", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Straddle Planche", level: "Advanced", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Full Planche", level: "Advanced", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Human Flag", level: "Advanced", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Handstand", level: "Beginner", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "One Arm Handstand", level: "Advanced", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Burpee", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Half Burpee", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Navy Seal Burpee", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Jumping Jack", level: "Beginner", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "High Knees", level: "Beginner", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Butt Kicks", level: "Beginner", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Bear Crawl", level: "Beginner", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Crab Walk", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Inchworm", level: "Beginner", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Skaters", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Box Jump", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Kettlebell Swing", level: "Intermediate", muscle: "Full Body", equipment: "Kettlebell" },
      { name: "Turkish Get-Up", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Snatch", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Clean and Jerk", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Power Clean", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Hang Clean", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Thruster", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
      { name: "Farmer's Walk", level: "Intermediate", muscle: "Full Body", equipment: "Bodyweight" },
    ]
  },
];

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const storageKey = `workout_${id}`;

  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [deleteExerciseId, setDeleteExerciseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [activeRestTimerExerciseId, setActiveRestTimerExerciseId] = useState<string | null>(null);
  const [selectedExerciseImage, setSelectedExerciseImage] = useState<string | null>(null);
  const restTimerOptions = ["Off", "20s", "25s", "30s", "45s", "1m 00s", "1m 30s", "2m 00s", "3m 00s"];

  // Timers
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(Date.now());
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [defaultRestTime, setDefaultRestTime] = useState<number>(90);
  const { isDark } = useTheme();
  const [newRecords, setNewRecords] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkoutDuration(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restTimer <= 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const parseRestTimer = (timerStr: string | undefined, defaultTime: number) => {
    if (!timerStr || timerStr === "Off") return 0;
    if (timerStr.includes("m") && timerStr.includes("s")) {
      const [mStr, sStr] = timerStr.split("m ");
      return parseInt(mStr) * 60 + parseInt(sStr);
    }
    if (timerStr.includes("m")) return parseInt(timerStr) * 60;
    if (timerStr.includes("s")) return parseInt(timerStr);
    return defaultTime;
  };

  const startRestTimer = (exerciseRestTimer?: string) => {
    const timeInSeconds = parseRestTimer(exerciseRestTimer, defaultRestTime);
    if (timeInSeconds > 0) {
      setRestTimer(timeInSeconds);
      setIsResting(true);
    }
  };

  const stopRestTimer = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  const filteredDB = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show only 5 items per category when not searching
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

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setExercises(JSON.parse(saved));
    } else {
      // Try to load from routine template
      const routinesStr = localStorage.getItem("routines");
      if (routinesStr && id) {
        const routines = JSON.parse(routinesStr);
        const routine = routines.find((r: any) => r.id === id);
        if (routine && routine.exercises && routine.exercises.length > 0) {
          // Deep clone to avoid mutating the template
          const templateExercises = JSON.parse(JSON.stringify(routine.exercises));
          setExercises(templateExercises);
          return;
        }
      }

      // Default initial state if empty
      const defaultState: ExerciseType[] = [
        {
          id: "ex_" + Date.now(),
          name: "Push-ups",
          sets: [
            { id: "s1", type: "N", previous: "-", kg: "0", reps: "10", completed: false }
          ]
        }
      ];
      setExercises(defaultState);
    }
  }, [storageKey, id]);

  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(exercises));
    }
  }, [exercises, storageKey]);

  const stats = useMemo(() => {
    let volume = 0;
    let setsCount = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          setsCount++;
          const kg = parseFloat(set.kg) || 0;
          const reps = parseInt(set.reps) || 0;
          // For bodyweight exercises, we might just count reps or add bodyweight.
          // Here we just use kg * reps. If kg is 0, volume is 0.
          volume += kg * reps;
        }
      });
    });
    return { volume, setsCount };
  }, [exercises]);

  const toggleSet = async (exerciseId: string, setId: string) => {
    // Optimistically update UI
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id === setId) {
                const willComplete = !s.completed;
                if (willComplete) {
                  startRestTimer(ex.restTimer);
                }
                return { ...s, completed: willComplete };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );

    // Check for new record in background
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    
    if (exercise && set && !set.completed) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isRecord = await workoutService.checkIsNewRecord(
          user.id,
          exercise.name,
          parseFloat(set.kg) || 0,
          parseInt(set.reps) || 0
        );
        if (isRecord) {
          setNewRecords(prev => ({ ...prev, [setId]: true }));
        } else {
          setNewRecords(prev => {
            const next = { ...prev };
            delete next[setId];
            return next;
          });
        }
      }
    } else if (set && set.completed) {
      // If unchecking, remove record status
      setNewRecords(prev => {
        const next = { ...prev };
        delete next[setId];
        return next;
      });
    }
  };

  const updateSet = (exerciseId: string, setId: string, field: "kg" | "reps", value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9.]/g, '');
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: numericValue } : s)),
          };
        }
        return ex;
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
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
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
        }
        return ex;
      })
    );
  };

  const removeExercise = (exerciseId: string) => {
    setDeleteExerciseId(exerciseId);
  };

  const confirmRemoveExercise = () => {
    if (deleteExerciseId) {
      setExercises((prev) => prev.filter((ex) => ex.id !== deleteExerciseId));
      setDeleteExerciseId(null);
    }
  };

  const addNewExercise = (name: string) => {
    const newEx: ExerciseType = {
      id: "ex_" + Date.now(),
      name,
      sets: [
        { id: "set_" + Date.now(), type: "N", previous: "-", kg: "0", reps: "10", completed: false }
      ]
    };
    setExercises([...exercises, newEx]);
    setShowAddExercise(false);
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

  const handleRestartRoutine = () => {
    const resetExercises = exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({ ...s, completed: false }))
    }));
    setExercises(resetExercises);
    setWorkoutStartTime(Date.now());
    setWorkoutDuration(0);
    setShowSummary(false);
  };

  const handleFinishAndGoHome = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Prepare data for Supabase
        const workoutData = {
          user_id: user.id,
          name: id ? `Workout ${id}` : 'Custom Workout',
          start_time: new Date(workoutStartTime).toISOString(),
          end_time: new Date().toISOString(),
          duration: workoutDuration,
          volume: stats.volume,
          sets_count: stats.setsCount,
        };

        const exercisesData = exercises.map((ex, index) => ({
          user_id: user.id,
          exercise_name: ex.name,
          note: ex.note || '',
          order: index,
        }));

        const setsData = exercises.map(ex => 
          ex.sets.map((set, index) => ({
            user_id: user.id,
            exercise_name: ex.name,
            set_number: index + 1,
            type: set.type,
            kg: parseFloat(set.kg) || 0,
            reps: parseInt(set.reps) || 0,
            completed: set.completed,
            is_record: !!newRecords[set.id],
          }))
        );

        await workoutService.saveWorkout(workoutData, exercisesData, setsData);
      }
    } catch (error) {
      console.error("Failed to save workout to Supabase:", error);
      // Fallback to local storage or show error? For now, proceed to clear and go home
    } finally {
      setIsSaving(false);
      const resetExercises = exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({ ...s, completed: false }))
      }));
      localStorage.setItem(storageKey, JSON.stringify(resetExercises));
      navigate("/");
    }
  };

  return (
    <div className={cn("flex flex-col h-[100dvh] max-w-md mx-auto shadow-xl overflow-hidden relative transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      {/* Header */}
      <header className={cn("px-4 py-3 border-b flex items-center justify-between sticky top-0 z-20 transition-colors duration-300", isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-100")}>
        <button onClick={() => navigate(-1)} className={cn("flex items-center gap-2 font-medium", isDark ? "text-white" : "text-zinc-900")}>
          <ChevronDown className="w-5 h-5" />
          Log Workout
        </button>
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-1 px-2 py-1.5 rounded-lg border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200")}>
            <Clock className={cn("w-4 h-4", isDark ? "text-zinc-400" : "text-zinc-500")} />
            <select
              value={defaultRestTime}
              onChange={(e) => setDefaultRestTime(Number(e.target.value))}
              className={cn("bg-transparent text-sm font-medium outline-none cursor-pointer", isDark ? "text-zinc-300" : "text-zinc-700")}
            >
              <option value={30}>30s</option>
              <option value={60}>60s</option>
              <option value={90}>90s</option>
              <option value={120}>2m</option>
              <option value={150}>2.5m</option>
              <option value={180}>3m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          <button 
            onClick={() => setShowSummary(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            Finish
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Summary */}
        <div className={cn("px-6 py-4 flex justify-between items-center border-b transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
          <div>
            <div className={cn("text-xs font-medium mb-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Thời gian</div>
            <div className="text-blue-500 font-medium font-mono text-lg leading-none">{formatTime(workoutDuration)}</div>
          </div>
          <div>
            <div className={cn("text-xs font-medium mb-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Khối lượng</div>
            <div className={cn("font-medium text-lg leading-none", isDark ? "text-white" : "text-zinc-900")}>{stats.volume} <span className={cn("text-sm", isDark ? "text-zinc-500" : "text-zinc-500")}>kg</span></div>
          </div>
          <div>
            <div className={cn("text-xs font-medium mb-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Số Set</div>
            <div className={cn("font-medium text-lg leading-none", isDark ? "text-white" : "text-zinc-900")}>{stats.setsCount}</div>
          </div>
        </div>

        {/* Exercises */}
        <div className="p-4 space-y-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className={cn("rounded-3xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="cursor-pointer"
                    onClick={() => setSelectedExerciseImage(getExerciseImage(exercise.name))}
                  >
                    <ExerciseImage name={exercise.name} className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700" />
                  </div>
                  <h3 className="font-bold text-blue-500 text-lg leading-tight">{exercise.name}</h3>
                </div>
                <button onClick={() => removeExercise(exercise.id)} className={cn("transition-colors p-2", isDark ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-500")}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Note */}
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
                  <div className="flex-1 text-center">Prev</div>
                  <div className="w-14 text-center">kg</div>
                  <div className="w-14 text-center">Reps</div>
                  <div className="w-10 text-center"><Check className="w-4 h-4 mx-auto" /></div>
                </div>

                <div className="space-y-1">
                  {exercise.sets.map((set, index) => {
                    const setNumber = set.type === "W" ? "W" : exercise.sets.filter(s => s.type === "N").indexOf(set) + 1;
                    return (
                      <div
                        key={set.id}
                        className={cn(
                          "flex items-center py-2 px-1 rounded-xl transition-colors group relative",
                          set.completed ? (isDark ? "bg-white/20" : "bg-zinc-200") : "bg-transparent"
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
                        <div className={cn("flex-1 text-center text-sm font-medium truncate px-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
                          {set.previous}
                        </div>
                        <div className="w-14 px-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={set.kg}
                            onChange={(e) => updateSet(exercise.id, set.id, "kg", e.target.value)}
                            className={cn(
                              "w-full text-center font-bold text-lg bg-transparent outline-none",
                              set.completed ? (isDark ? "text-white" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-400")
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
                              set.completed ? (isDark ? "text-white" : "text-zinc-900") : (isDark ? "text-zinc-500" : "text-zinc-400")
                            )}
                          />
                        </div>
                        <div className="w-10 flex justify-center relative">
                          {newRecords[set.id] && (
                            <div className="absolute -top-3 -right-2 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1 py-0.5 rounded-sm whitespace-nowrap z-10 animate-in zoom-in">
                              NEW RECORD
                            </div>
                          )}
                          <button
                            onClick={() => toggleSet(exercise.id, set.id)}
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                              set.completed
                                ? "bg-black dark:bg-white dark:text-black text-white"
                                : (isDark ? "bg-zinc-700 text-zinc-400 hover:bg-zinc-600" : "bg-zinc-200 text-white hover:bg-zinc-300")
                            )}
                          >
                            <Check className="w-4 h-4" strokeWidth={3} />
                          </button>
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
            <Plus className="w-5 h-5" /> Thêm bài tập
          </button>
        </div>
      </main>

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className={cn("absolute inset-0 z-50 flex flex-col", isDark ? "bg-black" : "bg-zinc-50")}>
          <header className={cn("px-4 py-4 border-b flex flex-col gap-3 shadow-sm z-10", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
            <div className="flex items-center justify-between">
              <h2 className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>Chọn bài tập</h2>
              <button onClick={() => { setShowAddExercise(false); setSearchQuery(""); }} className={cn("p-2 rounded-full transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className={cn("w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-zinc-500" : "text-zinc-400")} />
              <input 
                type="text"
                placeholder="Tìm kiếm trong 200+ bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full pl-10 pr-4 py-2.5 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all outline-none", isDark ? "bg-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-900" : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-white")}
              />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {filteredDB.length === 0 ? (
              <div className={cn("text-center py-10", isDark ? "text-zinc-500" : "text-zinc-500")}>
                Không tìm thấy bài tập nào phù hợp.
              </div>
            ) : (
              filteredDB.map((group) => (
                <div key={group.category}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className={cn("font-bold text-sm uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>{group.category}</h3>
                    {!searchQuery.trim() && (
                      <span className={cn("text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>Hiển thị 5 bài</span>
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
                        onClick={() => { addNewExercise(name); setSearchQuery(""); setShowAddExercise(false); }}
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

      {/* Delete Exercise Confirm Modal */}
      {deleteExerciseId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={cn("rounded-3xl p-6 w-full max-w-sm shadow-2xl mx-4", isDark ? "bg-[#1c1c1e]" : "bg-white")}>
            <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Xoá bài tập?</h3>
            <p className={cn("mb-6", isDark ? "text-zinc-400" : "text-zinc-500")}>Bạn có chắc chắn muốn xoá bài tập này khỏi routine không?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteExerciseId(null)}
                className={cn("flex-1 py-3 rounded-xl font-bold transition-colors", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}
              >
                Hủy
              </button>
              <button
                onClick={confirmRemoveExercise}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Floating Bar */}
      {isResting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-blue-600 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 animate-pulse" />
            <div>
              <div className="text-xs text-blue-200 font-medium uppercase tracking-wider">Thời gian nghỉ</div>
              <div className="text-2xl font-bold font-mono leading-none">{formatTime(restTimer)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRestTimer(prev => prev + 30)} className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm font-bold transition-colors">+30s</button>
            <button onClick={stopRestTimer} className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm font-bold transition-colors">Bỏ qua</button>
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

      {/* Summary Modal */}
      {showSummary && (
        <div className={cn("absolute inset-0 z-50 flex flex-col items-center justify-center p-6", isDark ? "bg-black/80 backdrop-blur-sm" : "bg-zinc-50/80 backdrop-blur-sm")}>
          <div className={cn("w-full max-w-sm rounded-3xl p-8 shadow-2xl border text-center relative overflow-hidden", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-400 to-zinc-400 dark:to-zinc-600 opacity-20" />
            
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-zinc-500 dark:to-zinc-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h2 className={cn("text-2xl font-bold mb-2 relative z-10", isDark ? "text-white" : "text-zinc-900")}>Tuyệt vời!</h2>
            <p className={cn("mb-8 relative z-10", isDark ? "text-zinc-400" : "text-zinc-500")}>Bạn đã hoàn thành buổi tập hôm nay.</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
              <div className={cn("rounded-2xl p-3", isDark ? "bg-zinc-800/50" : "bg-zinc-50")}>
                <div className={cn("text-xs font-medium mb-1 uppercase", isDark ? "text-zinc-500" : "text-zinc-400")}>Thời gian</div>
                <div className="text-blue-500 font-bold text-lg">{formatTime(workoutDuration)}</div>
              </div>
              <div className={cn("rounded-2xl p-3", isDark ? "bg-zinc-800/50" : "bg-zinc-50")}>
                <div className={cn("text-xs font-medium mb-1 uppercase", isDark ? "text-zinc-500" : "text-zinc-400")}>Volume</div>
                <div className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>{stats.volume}<span className={cn("text-xs font-normal ml-1", isDark ? "text-zinc-500" : "text-zinc-500")}>kg</span></div>
              </div>
              <div className={cn("rounded-2xl p-3", isDark ? "bg-zinc-800/50" : "bg-zinc-50")}>
                <div className={cn("text-xs font-medium mb-1 uppercase", isDark ? "text-zinc-500" : "text-zinc-400")}>Số Set</div>
                <div className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>{stats.setsCount}</div>
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <button
                onClick={handleFinishAndGoHome}
                disabled={isSaving}
                className="w-full py-4 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <Home className="w-5 h-5" /> {isSaving ? "Đang lưu..." : "Hoàn tất & Về nhà"}
              </button>
              <button
                onClick={handleRestartRoutine}
                className={cn("w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2", isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600")}
              >
                <RotateCcw className="w-5 h-5" /> Tập lại từ đầu
              </button>
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
