import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";

interface WorkoutTimerProps {
  elapsedTime: number;
}

export function WorkoutTimer({ elapsedTime }: WorkoutTimerProps) {
  const { isDark } = useTheme();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex items-center gap-2 font-mono text-sm font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>
      <Clock className="w-4 h-4" />
      {formatTime(elapsedTime)}
    </div>
  );
}
