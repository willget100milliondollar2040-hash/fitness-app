import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { isDark } = useTheme();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Kiểm tra email của bạn để xác nhận đăng ký!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Đã xảy ra lỗi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6 transition-colors duration-300",
      isDark ? "bg-black text-white" : "bg-white text-zinc-900"
    )}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-8",
          isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100"
        )}
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black mb-4">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isSignUp ? "Tạo tài khoản" : "Chào mừng trở lại"}
          </h1>
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>
            {isSignUp ? "Bắt đầu hành trình thể hình của bạn ngay hôm nay" : "Đăng nhập để tiếp tục theo dõi tiến độ"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all",
                  isDark ? "bg-[#141414] border-[#1F1F1F] text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 ring-black/5 transition-all",
                  isDark ? "bg-[#141414] border-[#1F1F1F] text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                )}
              />
            </div>
          </div>

          {message && (
            <div className={cn(
              "p-3 rounded-xl text-sm font-medium text-center",
              message.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isSignUp ? "Đăng ký" : "Đăng nhập"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={cn(
              "text-sm font-medium hover:underline",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}
          >
            {isSignUp ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký ngay"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
