import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Clock, MoreVertical, Plus, Check, Trash2, X, Search, Trophy, RotateCcw, Home, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { workoutService } from "../lib/workoutService";
import { supabase } from "../lib/supabase";
import { WorkoutTimer } from "../components/workout/WorkoutTimer";
import { ExerciseList } from "../components/workout/ExerciseList";
import { WorkoutSummary } from "../components/workout/WorkoutSummary";

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
  level?: "Người mới" | "Trung cấp" | "Nâng cao";
  muscle?: string;
  equipment?: string;
  progression?: string;
};

export type ExerciseCategory = {
  category: string;
  items: (string | ExerciseDef)[];
};

export const EXERCISE_IMAGES: Record<string, string> = {
  "Hít đất": "https://storage.googleapis.com/aistudio-user-content/0b217a6d-20d0-4740-9a29-06385d01323a/29e2467d-92a2-4a00-9833-28c035310b10.jpg",
  "Hít xà": "https://storage.googleapis.com/aistudio-user-content/0b217a6d-20d0-4740-9a29-06385d01323a/c6166416-0929-4592-8818-80f488663806.jpg",
};

export const getExerciseImage = (name: string) => {
  const normalized = name.toLowerCase().trim();
  if (EXERCISE_IMAGES[name]) return EXERCISE_IMAGES[name];
  
  for (const [key, value] of Object.entries(EXERCISE_IMAGES)) {
    const keyLower = key.toLowerCase().trim();
    if (keyLower === normalized) return value;
    if (keyLower.replace(/-/g, ' ') === normalized.replace(/-/g, ' ')) return value;
  }

  return "";
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
      
      {!error && src && (
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
    category: "Đẩy Thân Trên (Có tạ)",
    items: [
      { name: "Xà kép có tạ", level: "Trung cấp", muscle: "Ngực, Tay sau, Vai", equipment: "Đai đeo tạ / Áo tạ" },
      { name: "Hít đất có tạ", level: "Trung cấp", muscle: "Ngực, Tay sau, Vai", equipment: "Áo tạ / Tạ miếng" },
      { name: "Xà kép vòng treo có tạ", level: "Nâng cao", muscle: "Ngực, Tay sau, Vai", equipment: "Đai đeo tạ / Áo tạ, Vòng treo" },
      { name: "Hít đất trồng chuối có tạ", level: "Nâng cao", muscle: "Vai, Tay sau", equipment: "Áo tạ" },
      { name: "Hít đất Pseudo Planche có tạ", level: "Nâng cao", muscle: "Ngực, Vai", equipment: "Áo tạ" },
      { name: "Hít đất với vòng treo", level: "Trung cấp", muscle: "Ngực, Tay sau, Vai", equipment: "Vòng treo" },
    ]
  },
  {
    category: "Kéo Thân Trên (Có tạ)",
    items: [
      { name: "Hít xà có tạ", level: "Trung cấp", muscle: "Xô, Tay trước", equipment: "Đai đeo tạ / Áo tạ" },
      { name: "Hít xà ngửa tay có tạ", level: "Trung cấp", muscle: "Xô, Tay trước", equipment: "Đai đeo tạ / Áo tạ" },
      { name: "Muscle Up có tạ", level: "Nâng cao", muscle: "Xô, Ngực, Tay sau", equipment: "Đai đeo tạ / Áo tạ" },
      { name: "Hít xà Archer có tạ", level: "Nâng cao", muscle: "Xô, Tay trước", equipment: "Áo tạ" },
      { name: "Kéo Front Lever có tạ", level: "Nâng cao", muscle: "Xô, Cơ trọng tâm", equipment: "Áo tạ / Tạ chân" },
    ]
  },
  {
    category: "Cơ trọng tâm (Có tạ)",
    items: [
      { name: "Nâng chân treo có tạ", level: "Trung cấp", muscle: "Cơ bụng, Cơ gập hông", equipment: "Tạ chân / Tạ đơn" },
      { name: "Chạm xà có tạ", level: "Nâng cao", muscle: "Cơ bụng, Xô", equipment: "Tạ chân" },
      { name: "L-Sit có tạ", level: "Trung cấp", muscle: "Cơ bụng, Cơ gập hông", equipment: "Tạ chân" },
      { name: "Dragon Flag có tạ", level: "Nâng cao", muscle: "Cơ bụng", equipment: "Tạ chân" },
    ]
  },
  {
    category: "Chân (Có tạ)",
    items: [
      { name: "Squat một chân có tạ", level: "Nâng cao", muscle: "Đùi trước, Mông", equipment: "Áo tạ / Tạ đơn" },
      { name: "Squat kiểu Bulgari có tạ", level: "Trung cấp", muscle: "Đùi trước, Mông", equipment: "Tạ đơn" },
      { name: "Squat nhảy có tạ", level: "Trung cấp", muscle: "Đùi trước, Bắp chân", equipment: "Áo tạ / Tạ đơn" },
      { name: "Bước lên bục có tạ", level: "Người mới", muscle: "Đùi trước, Mông", equipment: "Tạ đơn" },
    ]
  },
  {
    category: "Toàn thân / Kỹ năng (Có tạ)",
    items: [
      { name: "Giữ Front Lever có tạ", level: "Nâng cao", muscle: "Xô, Cơ trọng tâm", equipment: "Tạ chân / Áo tạ" },
      { name: "Planche Lean có tạ", level: "Trung cấp", muscle: "Vai, Cơ trọng tâm", equipment: "Áo tạ" },
    ]
  },
  {
    category: "Ngực",
    items: [
      { name: "Hít đất", level: "Người mới", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất kim cương", level: "Trung cấp", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất tay rộng", level: "Người mới", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất dốc xuống", level: "Người mới", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất dốc lên", level: "Người mới", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Archer", level: "Nâng cao", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất một tay", level: "Nâng cao", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Spiderman", level: "Người mới", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Hindu", level: "Người mới", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Dive Bomber", level: "Trung cấp", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất vỗ tay", level: "Trung cấp", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Sphinx", level: "Trung cấp", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Pseudo Planche", level: "Nâng cao", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy ngực ngang với thanh đòn", level: "Trung cấp", muscle: "Ngực", equipment: "Thanh đòn" },
      { name: "Đẩy ngực dốc lên với thanh đòn", level: "Trung cấp", muscle: "Ngực", equipment: "Thanh đòn" },
      { name: "Đẩy ngực dốc xuống với thanh đòn", level: "Trung cấp", muscle: "Ngực", equipment: "Thanh đòn" },
      { name: "Đẩy ngực ngang với tạ đơn", level: "Trung cấp", muscle: "Ngực", equipment: "Tạ đơn" },
      { name: "Đẩy ngực dốc lên với tạ đơn", level: "Trung cấp", muscle: "Ngực", equipment: "Tạ đơn" },
      { name: "Đẩy ngực dốc xuống với tạ đơn", level: "Trung cấp", muscle: "Ngực", equipment: "Tạ đơn" },
      { name: "Ép ngực với tạ đơn", level: "Trung cấp", muscle: "Ngực", equipment: "Tạ đơn" },
      { name: "Ép ngực dốc lên với tạ đơn", level: "Trung cấp", muscle: "Ngực", equipment: "Tạ đơn" },
      { name: "Kéo cáp ép ngực", level: "Trung cấp", muscle: "Ngực", equipment: "Máy kéo cáp" },
      { name: "Kéo cáp ép ngực thấp", level: "Trung cấp", muscle: "Ngực", equipment: "Máy kéo cáp" },
      { name: "Kéo cáp ép ngực cao", level: "Trung cấp", muscle: "Ngực", equipment: "Máy kéo cáp" },
      { name: "Ép ngực với máy Pec Deck", level: "Trung cấp", muscle: "Ngực", equipment: "Máy tập" },
      { name: "Đẩy ngực với máy", level: "Trung cấp", muscle: "Ngực", equipment: "Máy tập" },
      { name: "Svend Press", level: "Trung cấp", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Floor Press", level: "Trung cấp", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Guillotine Press", level: "Nâng cao", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
      { name: "Hex Press", level: "Trung cấp", muscle: "Ngực", equipment: "Trọng lượng cơ thể" },
    ]
  },
  {
    category: "Lưng",
    items: [
      { name: "Hít xà", level: "Trung cấp", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà ngửa tay", level: "Trung cấp", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà tay rộng", level: "Trung cấp", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà tay hẹp", level: "Trung cấp", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà Commando", level: "Trung cấp", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà Archer", level: "Nâng cao", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà Typewriter", level: "Nâng cao", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà một tay", level: "Nâng cao", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Hít xà Australian", level: "Trung cấp", muscle: "Lưng", equipment: "Xà đơn" },
      { name: "Deadlift", level: "Trung cấp", muscle: "Lưng", equipment: "Thanh đòn" },
      { name: "Romanian Deadlift", level: "Trung cấp", muscle: "Lưng", equipment: "Thanh đòn" },
      { name: "Sumo Deadlift", level: "Trung cấp", muscle: "Lưng", equipment: "Thanh đòn" },
      { name: "Chèo tạ thanh đòn", level: "Trung cấp", muscle: "Lưng", equipment: "Thanh đòn" },
      { name: "Pendlay Row", level: "Trung cấp", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Chèo tạ đơn", level: "Trung cấp", muscle: "Lưng", equipment: "Tạ đơn" },
      { name: "Chèo tạ đơn một tay", level: "Nâng cao", muscle: "Lưng", equipment: "Tạ đơn" },
      { name: "T-Bar Row", level: "Trung cấp", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Chèo cáp ngồi", level: "Trung cấp", muscle: "Lưng", equipment: "Máy kéo cáp" },
      { name: "Kéo xô với máy", level: "Người mới", muscle: "Lưng", equipment: "Máy tập" },
      { name: "Kéo xô tay hẹp", level: "Người mới", muscle: "Lưng", equipment: "Máy tập" },
      { name: "Kéo xô ngược tay", level: "Người mới", muscle: "Lưng", equipment: "Máy tập" },
      { name: "Kéo xô thẳng tay", level: "Người mới", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Face Pull", level: "Người mới", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Good Morning", level: "Người mới", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Hyperextension", level: "Người mới", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Superman", level: "Người mới", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Renegade Row", level: "Trung cấp", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Inverted Row", level: "Trung cấp", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Meadows Row", level: "Trung cấp", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
      { name: "Rack Pull", level: "Người mới", muscle: "Lưng", equipment: "Trọng lượng cơ thể" },
    ]
  },
  {
    category: "Vai",
    items: [
      { name: "Hít đất Pike", level: "Người mới", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Pike cao chân", level: "Người mới", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất trồng chuối", level: "Nâng cao", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất trồng chuối dựa tường", level: "Nâng cao", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy tạ qua đầu", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy thanh đòn ngồi", level: "Trung cấp", muscle: "Vai", equipment: "Thanh đòn" },
      { name: "Đẩy tạ đơn ngồi", level: "Trung cấp", muscle: "Vai", equipment: "Tạ đơn" },
      { name: "Arnold Press", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Push Press", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Dang tạ đơn", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Dang cáp ngang", level: "Trung cấp", muscle: "Vai", equipment: "Máy kéo cáp" },
      { name: "Dang tạ với máy", level: "Trung cấp", muscle: "Vai", equipment: "Máy tập" },
      { name: "Nâng tạ trước", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Nâng tạ đơn trước", level: "Trung cấp", muscle: "Vai", equipment: "Tạ đơn" },
      { name: "Nâng cáp trước", level: "Trung cấp", muscle: "Vai", equipment: "Máy kéo cáp" },
      { name: "Nâng thanh đòn trước", level: "Trung cấp", muscle: "Vai", equipment: "Thanh đòn" },
      { name: "Ép ngực ngược", level: "Người mới", muscle: "Vai", equipment: "Máy tập" },
      { name: "Dang tạ đơn cúi người", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Ép cáp ngược", level: "Trung cấp", muscle: "Vai", equipment: "Máy kéo cáp" },
      { name: "Kéo tạ thẳng đứng", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Kéo tạ đơn thẳng đứng", level: "Trung cấp", muscle: "Vai", equipment: "Tạ đơn" },
      { name: "Kéo cáp thẳng đứng", level: "Trung cấp", muscle: "Vai", equipment: "Máy kéo cáp" },
      { name: "Nhún cầu vai", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Nhún cầu vai với tạ đơn", level: "Trung cấp", muscle: "Vai", equipment: "Tạ đơn" },
      { name: "Nhún cầu vai với thanh đòn", level: "Trung cấp", muscle: "Vai", equipment: "Thanh đòn" },
      { name: "Landmine Press", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Z Press", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Bradford Press", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Cuban Press", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
      { name: "Y-Raise", level: "Trung cấp", muscle: "Vai", equipment: "Trọng lượng cơ thể" },
    ]
  },
  {
    category: "Tay trước",
    items: [
      { name: "Cuốn thanh đòn", level: "Trung cấp", muscle: "Tay trước", equipment: "Thanh đòn" },
      { name: "Cuốn tạ đơn", level: "Trung cấp", muscle: "Tay trước", equipment: "Tạ đơn" },
      { name: "Cuốn tạ búa", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Cuốn tạ búa chéo người", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Cuốn tạ trên ghế dốc", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Cuốn tạ với máy Preacher", level: "Trung cấp", muscle: "Tay trước", equipment: "Máy tập" },
      { name: "Cuốn thanh EZ", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Cuốn tạ ngược tay", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Zottman Curl", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Cuốn tạ tập trung", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Cuốn cáp", level: "Trung cấp", muscle: "Tay trước", equipment: "Máy kéo cáp" },
      { name: "Cuốn cáp cao", level: "Trung cấp", muscle: "Tay trước", equipment: "Máy kéo cáp" },
      { name: "Spider Curl", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Cuốn tạ đơn ghế dốc lên", level: "Trung cấp", muscle: "Tay trước", equipment: "Tạ đơn" },
      { name: "Drag Curl", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Waiters Curl", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Bayesian Curl", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Pelican Curl", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
      { name: "Hít xà ngửa tay (Bicep Focus)", level: "Trung cấp", muscle: "Tay trước", equipment: "Xà đơn" },
      { name: "Cuốn tay trước trọng lượng cơ thể", level: "Trung cấp", muscle: "Tay trước", equipment: "Trọng lượng cơ thể" },
    ]
  },
  {
    category: "Tay sau",
    items: [
      { name: "Xà kép", level: "Trung cấp", muscle: "Tay sau", equipment: "Xà kép" },
      { name: "Xà kép thanh thẳng", level: "Trung cấp", muscle: "Tay sau", equipment: "Xà kép" },
      { name: "Xà kép với ghế", level: "Người mới", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Xà kép với vòng treo", level: "Trung cấp", muscle: "Tay sau", equipment: "Vòng treo" },
      { name: "Kéo cáp tay sau", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Kéo cáp với dây thừng", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Kéo cáp với thanh V", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Kéo cáp với thanh thẳng", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Skull Crusher", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Skull Crusher với tạ đơn", level: "Trung cấp", muscle: "Tay sau", equipment: "Tạ đơn" },
      { name: "Skull Crusher với thanh EZ", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy tay sau qua đầu", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy tay sau qua đầu với tạ đơn", level: "Trung cấp", muscle: "Tay sau", equipment: "Tạ đơn" },
      { name: "Đẩy tay sau qua đầu với cáp", level: "Trung cấp", muscle: "Tay sau", equipment: "Máy kéo cáp" },
      { name: "Đá tay sau", level: "Người mới", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Đá tay sau với cáp", level: "Trung cấp", muscle: "Tay sau", equipment: "Máy kéo cáp" },
      { name: "Đẩy ngực tay hẹp", level: "Trung cấp", muscle: "Tay sau", equipment: "Thanh đòn" },
      { name: "JM Press", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Tate Press", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy tay sau với trọng lượng cơ thể", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Tiger Bend", level: "Nâng cao", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
      { name: "Hít đất Sphinx", level: "Trung cấp", muscle: "Tay sau", equipment: "Trọng lượng cơ thể" },
    ]
  },
  {
    category: "Chân",
    items: [
      { name: "Squat trọng lượng cơ thể", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Squat nhảy", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Squat một chân", level: "Nâng cao", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Shrimp Squat", level: "Nâng cao", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Cossack Squat", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Bulgarian Split Squat", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Lunges", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Walking Lunges", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Jump Lunges", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Reverse Lunges", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Side Lunges", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Squat với thanh đòn", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Front Squat", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Overhead Squat", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Zercher Squat", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Box Squat", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Hack Squat", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Đạp đùi với máy", level: "Trung cấp", muscle: "Chân", equipment: "Máy tập" },
      { name: "Đá đùi trước với máy", level: "Trung cấp", muscle: "Chân", equipment: "Máy tập" },
      { name: "Móc đùi sau với máy", level: "Trung cấp", muscle: "Chân", equipment: "Máy tập" },
      { name: "Cuốn chân ngồi", level: "Trung cấp", muscle: "Chân", equipment: "Máy tập" },
      { name: "Cuốn chân nằm", level: "Trung cấp", muscle: "Chân", equipment: "Máy tập" },
      { name: "Cuốn chân Nordic", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Glute Bridge", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Barbell Glute Bridge", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Hip Thrust", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Barbell Hip Thrust", level: "Trung cấp", muscle: "Chân", equipment: "Thanh đòn" },
      { name: "Single Leg Hip Thrust", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Nhún bắp chân", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Nhún bắp chân ngồi", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Donkey Calf Raise", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Tibialis Raise", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Bước lên bục", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Squat kiểu Sissy", level: "Trung cấp", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
      { name: "Ngồi dựa tường", level: "Người mới", muscle: "Chân", equipment: "Trọng lượng cơ thể" },
    ]
  },
  {
    category: "Cơ trọng tâm",
    items: [
      { name: "Plank", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Side Plank", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Hollow Body Hold", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Arch Body Hold", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "L-Sit", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "V-Sit", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Manna", level: "Nâng cao", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Hanging Leg Raise", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Xà đơn" },
      { name: "Hanging Knee Raise", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Xà đơn" },
      { name: "Toes to Bar", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Xà đơn" },
      { name: "Dragon Flag", level: "Nâng cao", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Con lăn bụng", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Con lăn bụng" },
      { name: "Gập bụng", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Bicycle Crunch", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Russian Twist", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Sit-up", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "V-up", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Flutter Kicks", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Scissor Kicks", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Mountain Climber", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Cable Crunch", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Máy kéo cáp" },
      { name: "Machine Crunch", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Máy tập" },
      { name: "Chặt gỗ", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy Pallof", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Dead Bug", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Bird Dog", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Captain's Chair Leg Raise", level: "Trung cấp", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Decline Crunch", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Reverse Crunch", level: "Người mới", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
      { name: "Tuck Planche Hold", level: "Nâng cao", muscle: "Cơ trọng tâm", equipment: "Trọng lượng cơ thể" },
    ]
  },
  {
    category: "Kỹ năng & Toàn thân",
    items: [
      { name: "Muscle-up", level: "Nâng cao", muscle: "Toàn thân", equipment: "Xà đơn" },
      { name: "Bar Muscle-up", level: "Nâng cao", muscle: "Toàn thân", equipment: "Xà đơn" },
      { name: "Ring Muscle-up", level: "Nâng cao", muscle: "Toàn thân", equipment: "Vòng treo" },
      { name: "Front Lever", level: "Nâng cao", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Back Lever", level: "Nâng cao", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Planche", level: "Nâng cao", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Straddle Planche", level: "Nâng cao", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Full Planche", level: "Nâng cao", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Cờ người", level: "Nâng cao", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Handstand", level: "Người mới", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "One Arm Handstand", level: "Nâng cao", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Burpee", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Half Burpee", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Navy Seal Burpee", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Jumping Jack", level: "Người mới", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "High Knees", level: "Người mới", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Butt Kicks", level: "Người mới", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Bear Crawl", level: "Người mới", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Crab Walk", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Inchworm", level: "Người mới", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Skaters", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Box Jump", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Vung tạ ấm", level: "Trung cấp", muscle: "Toàn thân", equipment: "Tạ ấm" },
      { name: "Đứng dậy kiểu Thổ Nhĩ Kỳ", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Giật tạ", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Cử đẩy", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Cử tạ mạnh", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Cử tạ treo", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Đẩy tạ tổng hợp", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
      { name: "Đi bộ xách tạ", level: "Trung cấp", muscle: "Toàn thân", equipment: "Trọng lượng cơ thể" },
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
  const restTimerOptions = ["Tắt", "20s", "25s", "30s", "45s", "1m 00s", "1m 30s", "2m 00s", "3m 00s"];

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
    if (!timerStr || timerStr === "Tắt") return 0;
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
          name: "Hít đất",
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
          name: id ? `Bài tập ${id}` : 'Bài tập tùy chỉnh',
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
          Ghi lại bài tập
        </button>
        <div className="flex items-center gap-3">
          <WorkoutTimer elapsedTime={workoutDuration} />
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
            Hoàn thành
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
            <div className={cn("text-xs font-medium mb-1", isDark ? "text-zinc-500" : "text-zinc-400")}>Hiệp</div>
            <div className={cn("font-medium text-lg leading-none", isDark ? "text-white" : "text-zinc-900")}>{stats.setsCount}</div>
          </div>
        </div>

        {/* Exercises */}
        <div className="p-4 space-y-6">
          <ExerciseList
            exercises={exercises}
            newRecords={newRecords}
            onRemoveExercise={(id) => setDeleteExerciseId(id)}
            onUpdateNote={updateExerciseNote}
            onSetActiveRestTimer={setActiveRestTimerExerciseId}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onUpdateSet={updateSet}
            onToggleComplete={toggleSet}
            onImageClick={(name) => setSelectedExerciseImage(getExerciseImage(name))}
          />

          <button
            onClick={() => setShowAddExercise(true)}
            className={cn("w-full py-4 rounded-3xl border-2 border-dashed font-bold flex items-center justify-center gap-2 transition-colors", isDark ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : "border-blue-200 text-blue-500 hover:bg-blue-50")}
          >
            <Plus className="w-5 h-5" /> Thêm bài tập
          </button>

          <button
            onClick={() => setShowSummary(true)}
            className="w-full py-4 mt-4 rounded-3xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Check className="w-6 h-6" /> Hoàn thành bài tập
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
                placeholder="Tìm kiếm hơn 200 bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full pl-10 pr-4 py-2.5 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all outline-none", isDark ? "bg-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-900" : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-white")}
              />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {filteredDB.length === 0 ? (
              <div className={cn("text-center py-10", isDark ? "text-zinc-500" : "text-zinc-500")}>
                Không tìm thấy bài tập nào.
              </div>
            ) : (
              filteredDB.map((group) => (
                <div key={group.category}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className={cn("font-bold text-sm uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>{group.category}</h3>
                    {!searchQuery.trim() && (
                      <span className={cn("text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>Hiển thị 5 mục</span>
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
                                {level && <span className={cn("px-2 py-0.5 rounded-md font-semibold", level === "Người mới" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : level === "Trung cấp" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400")}>{level}</span>}
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
            <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Xóa bài tập?</h3>
            <p className={cn("mb-6", isDark ? "text-zinc-400" : "text-zinc-500")}>Bạn có chắc chắn muốn xóa bài tập này khỏi lịch tập không?</p>
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
                Xóa
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
              <h3 className="text-xl font-bold">Thời gian nghỉ</h3>
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
        <WorkoutSummary 
          elapsedTime={workoutDuration}
          exercises={exercises}
          isSaving={isSaving}
          onFinish={handleFinishAndGoHome}
          onRestart={handleRestartRoutine}
        />
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
