const fs = require('fs');
const path = require('path');

const files = [
  'src/components/Layout.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Coach.tsx',
  'src/pages/Buddy.tsx',
  'src/pages/Nutrition.tsx',
  'src/pages/Progress.tsx',
  'src/pages/Onboarding.tsx',
  'src/pages/ActiveWorkout.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace specific emerald classes with monochrome equivalents
  
  // text-emerald-500 -> isDark ? "text-white" : "text-black"
  // bg-emerald-500 -> isDark ? "bg-white text-black" : "bg-black text-white"
  // border-emerald-500 -> isDark ? "border-white" : "border-black"
  
  // To be safe and simple, let's replace the string literals first.
  
  // 1. Layout.tsx
  if (file.includes('Layout.tsx')) {
    content = content.replace(/"text-emerald-500 font-medium"/g, 'isDark ? "text-white font-medium" : "text-black font-medium"');
  }
  
  // 2. Dashboard.tsx
  if (file.includes('Dashboard.tsx')) {
    content = content.replace(/text-emerald-500/g, 'text-zinc-900 dark:text-white');
    content = content.replace(/bg-emerald-100/g, 'bg-zinc-200 dark:bg-zinc-800');
    content = content.replace(/hover:border-emerald-200/g, 'hover:border-zinc-400 dark:hover:border-zinc-600');
    content = content.replace(/group-hover:bg-emerald-500\/20/g, 'group-hover:bg-white/20');
    content = content.replace(/group-hover:bg-emerald-50/g, 'group-hover:bg-zinc-200');
    content = content.replace(/group-hover:text-emerald-400/g, 'group-hover:text-white');
    content = content.replace(/group-hover:text-emerald-500/g, 'group-hover:text-black');
    content = content.replace(/focus:ring-emerald-500\/50/g, 'focus:ring-zinc-500/50');
    content = content.replace(/focus:border-emerald-500/g, 'focus:border-zinc-500');
    content = content.replace(/bg-emerald-500 hover:bg-emerald-600/g, 'bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-black');
  }

  // 3. Coach.tsx
  if (file.includes('Coach.tsx')) {
    content = content.replace(/bg-emerald-500\/20/g, 'bg-white/20');
    content = content.replace(/bg-emerald-100/g, 'bg-zinc-200');
    content = content.replace(/text-emerald-400/g, 'text-white');
    content = content.replace(/text-emerald-600/g, 'text-black');
    content = content.replace(/bg-emerald-600 text-white/g, 'bg-black text-white dark:bg-white dark:text-black');
    content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-zinc-800 dark:hover:bg-zinc-200');
    content = content.replace(/disabled:hover:bg-emerald-600/g, 'disabled:hover:bg-black dark:disabled:hover:bg-white');
    content = content.replace(/prose-emerald/g, 'prose-zinc');
    content = content.replace(/focus:ring-emerald-500\/50/g, 'focus:ring-zinc-500/50');
  }

  // 4. Buddy.tsx
  if (file.includes('Buddy.tsx')) {
    content = content.replace(/text-emerald-500/g, 'text-black dark:text-white');
    content = content.replace(/fill-emerald-100/g, 'fill-zinc-200 dark:fill-zinc-800');
    content = content.replace(/hover:bg-emerald-500\/20/g, 'hover:bg-white/20');
    content = content.replace(/hover:text-emerald-400/g, 'hover:text-white');
    content = content.replace(/hover:border-emerald-500\/30/g, 'hover:border-white/30');
    content = content.replace(/hover:bg-emerald-50/g, 'hover:bg-zinc-200');
    content = content.replace(/hover:text-emerald-600/g, 'hover:text-black');
    content = content.replace(/hover:border-emerald-200/g, 'hover:border-zinc-300');
  }

  // 5. Nutrition.tsx
  if (file.includes('Nutrition.tsx')) {
    content = content.replace(/text-emerald-500/g, 'text-black dark:text-white');
    content = content.replace(/bg-emerald-500\/10/g, 'bg-white/10');
    content = content.replace(/hover:bg-emerald-500\/20/g, 'hover:bg-white/20');
    content = content.replace(/text-emerald-400/g, 'text-white');
    content = content.replace(/border-emerald-500\/20/g, 'border-white/20');
    content = content.replace(/bg-emerald-50/g, 'bg-zinc-100');
    content = content.replace(/hover:bg-emerald-100/g, 'hover:bg-zinc-200');
    content = content.replace(/text-emerald-700/g, 'text-black');
    content = content.replace(/border-emerald-200/g, 'border-zinc-300');
    content = content.replace(/border-emerald-500/g, 'border-black dark:border-white');
    content = content.replace(/hover:text-emerald-600/g, 'hover:text-black');
    content = content.replace(/border-emerald-500\/30/g, 'border-white/30');
    content = content.replace(/bg-emerald-400/g, 'bg-white');
    content = content.replace(/shadow-\[0_0_15px_rgba\(52,211,153,0\.8\)\]/g, 'shadow-[0_0_15px_rgba(255,255,255,0.8)]');
    content = content.replace(/bg-emerald-500/g, 'bg-black dark:bg-white dark:text-black');
    content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-zinc-800 dark:hover:bg-zinc-200');
    content = content.replace(/shadow-emerald-500\/20/g, 'shadow-black/20 dark:shadow-white/20');
  }

  // 6. Progress.tsx
  if (file.includes('Progress.tsx')) {
    content = content.replace(/text-emerald-500/g, 'text-black dark:text-white');
    content = content.replace(/border-emerald-500/g, 'border-black dark:border-white');
    content = content.replace(/shadow-\[0_0_15px_rgba\(16,185,129,0\.2\)\]/g, 'shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]');
    content = content.replace(/bg-emerald-500\/20/g, 'bg-white/20');
    content = content.replace(/bg-emerald-100/g, 'bg-zinc-200');
    content = content.replace(/bg-emerald-500/g, 'bg-black dark:bg-white dark:text-black');
  }

  // 7. Onboarding.tsx
  if (file.includes('Onboarding.tsx')) {
    content = content.replace(/border-emerald-500/g, 'border-black dark:border-white');
    content = content.replace(/bg-emerald-500\/10/g, 'bg-white/10');
    content = content.replace(/bg-emerald-50/g, 'bg-zinc-100');
    content = content.replace(/hover:border-emerald-500\/50/g, 'hover:border-white/50');
    content = content.replace(/hover:border-emerald-200/g, 'hover:border-zinc-300');
    content = content.replace(/bg-emerald-500/g, 'bg-black dark:bg-white dark:text-black');
    content = content.replace(/text-emerald-400/g, 'text-white');
    content = content.replace(/text-emerald-700/g, 'text-black');
    content = content.replace(/text-emerald-500/g, 'text-black dark:text-white');
    content = content.replace(/focus:border-emerald-500/g, 'focus:border-black dark:focus:border-white');
    content = content.replace(/bg-emerald-600/g, 'bg-black dark:bg-white dark:text-black');
    content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-zinc-800 dark:hover:bg-zinc-200');
    content = content.replace(/disabled:hover:bg-emerald-600/g, 'disabled:hover:bg-black dark:disabled:hover:bg-white');
    content = content.replace(/shadow-\[0_4px_14px_rgba\(16,185,129,0\.3\)\]/g, 'shadow-[0_4px_14px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.3)]');
  }

  // 8. ActiveWorkout.tsx
  if (file.includes('ActiveWorkout.tsx')) {
    content = content.replace(/bg-emerald-500\/20/g, 'bg-white/20');
    content = content.replace(/bg-\[\#d4f7a1\]/g, 'bg-zinc-200');
    content = content.replace(/bg-emerald-500/g, 'bg-black dark:bg-white dark:text-black');
    content = content.replace(/to-emerald-400/g, 'to-zinc-400 dark:to-zinc-600');
    content = content.replace(/to-emerald-500/g, 'to-zinc-500 dark:to-zinc-400');
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Replacement complete.');
