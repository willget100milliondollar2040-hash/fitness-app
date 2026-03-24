import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, BellRing, Trophy, Activity, CheckCircle2, Search, UserPlus, Loader2, Flame, Clock } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { SetupInstructions } from "@/components/SetupInstructions";

export default function Buddy() {
  const { isDark } = useTheme();
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");
  const [buddies, setBuddies] = useState<any[]>([]);
  const [isLoadingBuddies, setIsLoadingBuddies] = useState(true);
  const [challengeState, setChallengeState] = useState<"idle" | "inviting" | "pending" | "started">("idle");
  const [invitedFriend, setInvitedFriend] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [incomingInvite, setIncomingInvite] = useState<any>(null);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);

        // Fetch accepted friendships where user is either user_id or friend_id
        const { data: friendships, error } = await supabase
          .from('friendships')
          .select('*')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (error) {
          console.error("Error fetching buddies:", error);
          if (error.code === '42P01' || error.code === '42703' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            setSetupRequired(true);
          }
          return;
        }

        if (!friendships || friendships.length === 0) {
          setBuddies([]);
          return;
        }

        const buddyIds = friendships.map(f => f.user_id === user.id ? f.friend_id : f.user_id);

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .in('id', buddyIds);

        if (profilesError) {
          console.error("Error fetching buddy profiles:", profilesError);
          if (profilesError.code === '42P01' || profilesError.code === '42703' || profilesError.message?.includes('relation') || profilesError.message?.includes('does not exist')) {
            setSetupRequired(true);
          }
          return;
        }

        const formattedBuddies = profiles?.map(profile => {
          return {
            id: profile.id,
            name: profile.full_name || profile.email.split('@')[0],
            email: profile.email,
            avatar: profile.avatar_url,
            points: Math.floor(Math.random() * 500) + 100, // Mock points for now
            status: Math.random() > 0.5 ? "Đã hoàn thành bài tập" : "Đang nghỉ ngơi",
            streak: Math.floor(Math.random() * 10) + 1,
            lastActive: `${Math.floor(Math.random() * 5) + 1} giờ trước`
          };
        }) || [];

        setBuddies(formattedBuddies);
      } catch (error) {
        console.error("Error in fetchBuddies:", error);
      } finally {
        setIsLoadingBuddies(false);
      }
    };

    fetchBuddies();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel(`user:${currentUser.id}`)
      .on('broadcast', { event: 'challenge_invite' }, (payload) => {
        setIncomingInvite(payload.payload);
      })
      .on('broadcast', { event: 'challenge_accept' }, (payload) => {
        setChallengeState("started");
      })
      .on('broadcast', { event: 'challenge_decline' }, (payload) => {
        setChallengeState("idle");
        setInvitedFriend(null);
        alert("Bạn bè đã từ chối lời mời.");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('email', searchEmail.trim().toLowerCase())
        .single();

      if (error) {
        console.error("Supabase search error:", error);
        if (error.code === 'PGRST116') {
          setSearchError("Không tìm thấy người dùng với email này.");
        } else if (
          error.code === '42P01' || 
          error.code === '42703' ||
          error.message?.includes('relation') || 
          error.message?.includes('does not exist')
        ) {
          setSearchError("Bạn cần thiết lập Database trong Supabase. Vui lòng xem hướng dẫn bên dưới.");
          setSetupRequired(true);
        } else {
          setSearchError(`Lỗi: ${error.message || "Đã xảy ra lỗi khi tìm kiếm."}`);
        }
      } else if (data) {
        setSearchResult(data);
      }
    } catch (err: any) {
      console.error("Search exception:", err);
      setSearchError(`Lỗi hệ thống: ${err.message || "Đã xảy ra lỗi khi tìm kiếm."}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        alert("Vui lòng đăng nhập để thêm bạn bè.");
        return;
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: userData.user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          alert("Lời mời kết bạn đã được gửi hoặc các bạn đã là bạn bè.");
        } else if (error.code === '42P01' || error.message?.includes('relation')) {
          setSetupRequired(true);
          alert("Bạn cần thiết lập Database. Vui lòng xem hướng dẫn ở trên.");
        } else {
          alert("Không thể gửi lời mời kết bạn.");
        }
      } else {
        alert("Đã gửi lời mời kết bạn thành công!");
        setSearchResult(null);
        setSearchEmail("");
      }
    } catch (err) {
      alert("Đã xảy ra lỗi.");
    }
  };

  const handleInvite = async (buddy: any) => {
    setInvitedFriend(buddy);
    setChallengeState("pending");

    if (!currentUser) return;

    const channel = supabase.channel(`user:${buddy.id}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'challenge_invite',
          payload: {
            from: currentUser.id,
            name: currentUser.user_metadata?.full_name || currentUser.email,
            avatar: currentUser.user_metadata?.avatar_url
          }
        });
        supabase.removeChannel(channel);
      }
    });
  };

  const handleDeclineInvite = async () => {
    if (!incomingInvite || !currentUser) return;

    const channel = supabase.channel(`user:${incomingInvite.from}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'challenge_decline',
          payload: {
            from: currentUser.id
          }
        });
        supabase.removeChannel(channel);
        setIncomingInvite(null);
      }
    });
  };

  const handleAcceptInvite = async () => {
    if (!incomingInvite || !currentUser) return;

    const channel = supabase.channel(`user:${incomingInvite.from}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'challenge_accept',
          payload: {
            from: currentUser.id
          }
        });
        supabase.removeChannel(channel);
        setIncomingInvite(null);
        setChallengeState("started");
      }
    });
  };

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300", isDark ? "bg-[#0A0A0A] text-white" : "bg-white text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <Users className="w-6 h-6 text-black dark:text-white" />
          Chế độ bạn bè
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Cùng tập luyện, cùng tiến bộ.</p>
      </motion.div>

      {setupRequired && <SetupInstructions />}

      {/* Find Friends */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={cn("p-4 rounded-2xl border shadow-sm", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}
      >
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-green-500" /> Tìm bạn bè
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Nhập email của bạn bè..."
            className={cn(
              "flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors",
              isDark ? "bg-[#0A0A0A] border-[#1F1F1F] focus:border-green-500 text-white" : "bg-zinc-50 border-zinc-200 focus:border-green-500 text-zinc-900"
            )}
          />
          <button
            type="submit"
            disabled={isSearching || !searchEmail.trim()}
            className="px-4 py-2.5 bg-gradient-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center min-w-[80px] shadow-md glow-primary"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tìm kiếm"}
          </button>
        </form>

        {searchError && (
          <div className="mt-3">
            <p className="text-red-500 text-sm font-medium">{searchError}</p>
          </div>
        )}

        {searchResult && (
          <div className={cn("mt-4 p-3 rounded-2xl flex items-center justify-between border", isDark ? "bg-[#0A0A0A] border-[#1F1F1F]" : "bg-zinc-50 border-zinc-100")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold uppercase overflow-hidden">
                {searchResult.avatar_url ? (
                  <img src={searchResult.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  searchResult.full_name ? searchResult.full_name[0] : searchResult.email[0]
                )}
              </div>
              <div>
                <p className="font-bold text-sm">{searchResult.full_name || "Người dùng"}</p>
                <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-zinc-500")}>{searchResult.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleAddFriend(searchResult.id)}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Weekly Challenge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden glow-primary"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-bold uppercase tracking-wider text-green-100">Thử thách tuần</span>
            </div>
            <div className="text-xs font-bold bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
              Còn 2 ngày
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Ai Plank lâu hơn?</h3>
          <p className="text-green-100 text-sm mb-4">Giữ tư thế plank càng lâu càng tốt. Người chiến thắng nhận huy hiệu "Cơ bụng thép".</p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-medium mb-1 text-green-100">
              <span>Tiến độ</span>
              <span>70%</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {challengeState === "idle" ? (
              <button 
                onClick={() => setChallengeState("inviting")}
                className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 transition-colors shadow-sm"
              >
                Mời bạn bè tham gia
              </button>
            ) : challengeState === "inviting" ? (
              <div className="flex-1 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <p className="text-sm font-medium mb-3">Chọn bạn bè để mời:</p>
                {buddies.length === 0 ? (
                  <p className="text-xs text-green-200">Bạn cần thêm bạn bè trước để mời họ tham gia thử thách.</p>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {buddies.map((buddy, i) => (
                      <button 
                        key={i}
                        onClick={() => handleInvite(buddy)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-bold flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs overflow-hidden">
                          {buddy.avatar ? <img src={buddy.avatar} alt="avatar" className="w-full h-full object-cover" /> : buddy.name[0]}
                        </div>
                        {buddy.name}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setChallengeState("idle")}
                  className="mt-3 text-xs font-bold text-green-200 hover:text-white transition-colors"
                >
                  Hủy
                </button>
              </div>
            ) : challengeState === "started" ? (
              <div className="flex-1 bg-white/20 text-white font-bold py-3 px-4 rounded-xl border border-white/30 flex items-center justify-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span>Thử thách đã bắt đầu!</span>
              </div>
            ) : (
              <div className="flex-1 bg-white/20 text-white font-bold py-3 px-4 rounded-xl border border-white/30 flex items-center justify-between">
                <span>Đang chờ {invitedFriend?.name} chấp nhận...</span>
                <Loader2 className="w-4 h-4 animate-spin opacity-70" />
              </div>
            )}
          </div>

          {/* Incoming Invite Modal */}
          {incomingInvite && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
              <div className="bg-white text-zinc-900 p-6 rounded-2xl w-[90%] max-w-sm text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl uppercase overflow-hidden mx-auto mb-4">
                  {incomingInvite.avatar ? <img src={incomingInvite.avatar} alt="avatar" className="w-full h-full object-cover" /> : incomingInvite.name[0]}
                </div>
                <h4 className="font-bold text-lg mb-1">{incomingInvite.name}</h4>
                <p className="text-sm text-zinc-500 mb-6">Đã mời bạn tham gia thử thách Plank!</p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleDeclineInvite}
                    className="flex-1 py-3 rounded-xl font-bold bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
                  >
                    Từ chối
                  </button>
                  <button 
                    onClick={handleAcceptInvite}
                    className="flex-1 py-3 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md glow-success"
                  >
                    Chấp nhận
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <h3 className={cn("text-lg font-bold flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <Activity className="w-5 h-5 text-green-500" /> Hoạt động gần đây
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
          {buddies.filter(b => b.status === "Đã hoàn thành bài tập").map((buddy, i) => (
            <div key={i} className={cn("min-w-[240px] snap-center p-4 rounded-2xl border flex items-center gap-3", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold uppercase overflow-hidden">
                  {buddy.avatar ? <img src={buddy.avatar} alt="avatar" className="w-full h-full object-cover" /> : buddy.name[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-0.5 border-2 border-[#141414]">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold truncate">{buddy.name}</p>
                <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-zinc-500")}>Vừa hoàn thành Ngày Đẩy</p>
              </div>
            </div>
          ))}
          {buddies.filter(b => b.status === "Đã hoàn thành bài tập").length === 0 && (
            <div className={cn("w-full p-4 rounded-2xl border text-center", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
              <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-zinc-400")}>Chưa có hoạt động nào gần đây.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Buddies List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Đội của bạn</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingBuddies ? (
            <div className="flex justify-center py-8 md:col-span-2">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : buddies.length === 0 ? (
            <div className={cn("text-center py-12 rounded-2xl border border-dashed md:col-span-2", isDark ? "border-[#1F1F1F] bg-[#141414]" : "border-zinc-200 bg-white")}>
              <Users className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-zinc-700" : "text-zinc-300")} />
              <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Chưa có buddy nào</h3>
              <p className={cn("text-sm mb-6", isDark ? "text-zinc-500" : "text-zinc-500")}>Mời bạn bè cùng tập để có thêm động lực!</p>
              <button 
                onClick={() => (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus()}
                className="bg-gradient-primary text-white font-bold px-6 py-3 rounded-xl transition-colors glow-primary"
              >
                Tìm Bạn Bè Ngay
              </button>
            </div>
          ) : (
            buddies.map((buddy, i) => (
              <div key={i} className={cn("p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-colors", isDark ? "bg-[#141414] border-[#1F1F1F]" : "bg-white border-zinc-100")}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg uppercase overflow-hidden border-2 border-transparent">
                      {buddy.avatar ? <img src={buddy.avatar} alt="avatar" className="w-full h-full object-cover" /> : buddy.name[0]}
                    </div>
                  </div>
                  <div>
                    <h4 className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>{buddy.name}</h4>
                    <div className="flex items-center gap-3 text-xs font-medium mt-1">
                      <span className="text-orange-500 flex items-center gap-1 bg-orange-500/10 px-1.5 py-0.5 rounded-md">
                        <Flame className="w-3 h-3" /> {buddy.streak}
                      </span>
                      <span className={cn("flex items-center gap-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                        <Clock className="w-3 h-3" /> {buddy.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-colors", isDark ? "bg-[#0A0A0A] border-[#1F1F1F] text-zinc-400 hover:bg-white/10 hover:text-white" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-black")}>
                  <BellRing className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
