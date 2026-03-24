import { useState } from "react";
import { Check, Copy, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

export function SetupInstructions() {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const sqlScript = `
-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  weight numeric,
  height numeric,
  age integer,
  goals text[],
  level text,
  frequency text,
  timeframe text,
  diet text,
  updated_at timestamp with time zone
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create friendships table
create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

-- Set up RLS for friendships
alter table public.friendships enable row level security;

drop policy if exists "Users can view their own friendships." on friendships;
create policy "Users can view their own friendships." on friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Users can insert friendships." on friendships;
create policy "Users can insert friendships." on friendships
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own friendships." on friendships;
create policy "Users can update their own friendships." on friendships
  for update using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Users can delete their own friendships." on friendships;
create policy "Users can delete their own friendships." on friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Ensure all columns exist (in case you created the table earlier)
alter table public.profiles 
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists weight numeric,
  add column if not exists height numeric,
  add column if not exists age integer,
  add column if not exists goals text[],
  add column if not exists level text,
  add column if not exists frequency text,
  add column if not exists timeframe text,
  add column if not exists diet text,
  add column if not exists updated_at timestamp with time zone;

-- Create a trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert existing users into profiles (if you already created accounts)
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("mt-6 p-5 rounded-2xl border shadow-sm", isDark ? "bg-[#141414] border-red-500/30" : "bg-red-50 border-red-200")}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className={cn("font-bold text-lg", isDark ? "text-red-400" : "text-red-700")}>Thiết lập Database</h3>
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-red-600/80")}>Bạn cần chạy mã SQL sau trong Supabase SQL Editor để tạo bảng.</p>
        </div>
      </div>

      <div className="relative">
        <div className={cn("absolute top-3 right-3 flex gap-2")}>
          <button
            onClick={copyToClipboard}
            className={cn(
              "p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold",
              isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-white text-zinc-600 hover:bg-zinc-100 shadow-sm border"
            )}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Đã chép" : "Sao chép"}
          </button>
        </div>
        <pre className={cn(
          "p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed",
          isDark ? "bg-[#0A0A0A] text-zinc-300 border border-[#1F1F1F]" : "bg-white text-zinc-800 border border-zinc-200 shadow-inner"
        )}>
          <code>{sqlScript}</code>
        </pre>
      </div>

      <div className={cn("mt-4 text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
        <p className="font-bold mb-1">Hướng dẫn:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Mở dự án Supabase của bạn.</li>
          <li>Vào mục <strong>SQL Editor</strong> ở menu bên trái.</li>
          <li>Tạo một <strong>New query</strong>.</li>
          <li>Dán đoạn mã trên vào và nhấn <strong>Run</strong>.</li>
        </ol>
      </div>
    </div>
  );
}
