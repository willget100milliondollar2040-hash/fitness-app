import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Camera, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { supabase } from "../lib/supabase";
import { workoutService } from "../lib/workoutService";

export default function Profile() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    full_name: "",
    weight: "",
    height: "",
    goals: [] as string[],
    avatar_url: ""
  });

  const GOAL_OPTIONS = [
    "Giảm cân",
    "Tăng cơ",
    "Tăng sức bền",
    "Khỏe hơn",
    "Giữ gìn sức khỏe"
  ];

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        setUserId(user.id);
        
        const data = await workoutService.getProfile(user.id);
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            weight: data.weight?.toString() || "",
            height: data.height?.toString() || "",
            goals: data.goals || [],
            avatar_url: data.avatar_url || ""
          });
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await workoutService.updateProfile(userId, {
        full_name: profile.full_name,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        height: profile.height ? parseFloat(profile.height) : null,
        goals: profile.goals,
        avatar_url: profile.avatar_url
      });
      alert("Cập nhật hồ sơ thành công!");
    } catch (e) {
      console.error(e);
      alert("Cập nhật hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setProfile(prev => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals };
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          // Try to create the bucket
          const { error: createError } = await supabase.storage.createBucket('avatars', { public: true });
          if (!createError) {
            // Retry upload
            const { error: retryError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (retryError) throw retryError;
          } else {
            alert('Lỗi: Bucket lưu trữ "avatars" không tồn tại. Vui lòng chạy schema SQL đã cập nhật hoặc tạo thủ công trong bảng điều khiển Supabase.');
            return;
          }
        } else {
          throw uploadError;
        }
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      
      await workoutService.updateProfile(userId, {
        avatar_url: data.publicUrl
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Lỗi khi tải ảnh đại diện lên!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen pb-24 transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      {/* Header */}
      <header className={cn("px-4 py-4 flex items-center justify-between sticky top-0 z-30", isDark ? "bg-[#1c1c1e]/80 backdrop-blur-md" : "bg-white/80 backdrop-blur-md")}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-zinc-800/10 dark:hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">Chỉnh sửa hồ sơ</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="p-2 text-blue-500 font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        </button>
      </header>

      <div className="p-5 space-y-8 max-w-md mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl text-white shadow-lg border-4 overflow-hidden", isDark ? "border-zinc-800 bg-zinc-700" : "border-white bg-zinc-300")}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userEmail ? userEmail[0].toUpperCase() : "U"
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
              <Camera className="w-4 h-4" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={saving}
              />
            </label>
          </div>
          <p className={cn("text-sm font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>{userEmail}</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-400" : "text-zinc-600")}>Họ và tên</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className={cn("w-full p-4 rounded-2xl outline-none transition-all", isDark ? "bg-[#1c1c1e] focus:bg-zinc-800" : "bg-white border focus:border-blue-500")}
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-400" : "text-zinc-600")}>Cân nặng (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                className={cn("w-full p-4 rounded-2xl outline-none transition-all", isDark ? "bg-[#1c1c1e] focus:bg-zinc-800" : "bg-white border focus:border-blue-500")}
                placeholder="0.0"
              />
            </div>
            <div>
              <label className={cn("block text-sm font-bold mb-2", isDark ? "text-zinc-400" : "text-zinc-600")}>Chiều cao (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                className={cn("w-full p-4 rounded-2xl outline-none transition-all", isDark ? "bg-[#1c1c1e] focus:bg-zinc-800" : "bg-white border focus:border-blue-500")}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className={cn("block text-sm font-bold mb-3 mt-6", isDark ? "text-zinc-400" : "text-zinc-600")}>Mục tiêu thể hình</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map(goal => {
                const isSelected = profile.goals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={cn(
                      "px-4 py-3 rounded-full text-sm font-medium transition-all",
                      isSelected 
                        ? "bg-blue-500 text-white shadow-md" 
                        : isDark 
                          ? "bg-[#1c1c1e] text-zinc-400 hover:bg-zinc-800" 
                          : "bg-white border text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
