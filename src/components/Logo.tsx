import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("w-8 h-8", className)}
    >
      {/* Head */}
      <circle cx="50" cy="25" r="12" />
      {/* Body */}
      <path d="M 25 35 C 60 35 70 60 35 85 L 25 85 C 50 60 45 40 25 35 Z" />
      {/* Arm */}
      <path d="M 58 42 L 72 28 L 78 34 L 64 48 Z" />
    </svg>
  );
}
