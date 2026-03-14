import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, BellRing, Trophy, Activity, CheckCircle2, Search, UserPlus, Loader2 } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Buddy() {
  const { isDark } = useTheme();
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");
  const [buddies, setBuddies] = useState([
    { name: "Minh Tuan", status: "Finished workout", streak: 5, avatar: "user2" },
    { name: "Lan Anh", status: "Not started", streak: 2, avatar: "user3" },
  ]);

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
        .eq('email', searchEmail.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setSearchError("User not found with this email.");
        } else {
          setSearchError("An error occurred while searching.");
        }
      } else if (data) {
        setSearchResult(data);
      }
    } catch (err) {
      setSearchError("An error occurred while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        alert("Please login to add friends.");
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
          alert("Friend request already sent or you are already friends.");
        } else {
          alert("Failed to send friend request.");
        }
      } else {
        alert("Friend request sent successfully!");
        setSearchResult(null);
        setSearchEmail("");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  return (
    <div className={cn("p-5 space-y-8 min-h-full transition-colors duration-300", isDark ? "bg-black text-white" : "bg-zinc-50 text-zinc-900")}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={cn("text-2xl font-bold tracking-tight flex items-center gap-2", isDark ? "text-white" : "text-zinc-900")}>
          <Users className="w-6 h-6 text-black dark:text-white" />
          Buddy Mode
        </h2>
        <p className={cn("mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>Train together, progress together.</p>
      </motion.div>

      {/* Find Friends */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={cn("p-4 rounded-3xl border shadow-sm", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}
      >
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-500" /> Find Friends
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter friend's email..."
            className={cn(
              "flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors",
              isDark ? "bg-zinc-900 border-zinc-800 focus:border-blue-500 text-white" : "bg-zinc-50 border-zinc-200 focus:border-blue-500 text-zinc-900"
            )}
          />
          <button
            type="submit"
            disabled={isSearching || !searchEmail.trim()}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[80px]"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </button>
        </form>

        {searchError && (
          <p className="text-red-500 text-sm mt-3">{searchError}</p>
        )}

        {searchResult && (
          <div className={cn("mt-4 p-3 rounded-2xl flex items-center justify-between", isDark ? "bg-zinc-900" : "bg-zinc-50")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                {searchResult.full_name ? searchResult.full_name[0] : searchResult.email[0]}
              </div>
              <div>
                <p className="font-bold text-sm">{searchResult.full_name || "User"}</p>
                <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-zinc-500")}>{searchResult.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleAddFriend(searchResult.id)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Weekly Challenge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-100">Weekly Challenge</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Who can Plank longer?</h3>
          <p className="text-indigo-100 text-sm mb-6">Hold a plank as long as possible. Winner gets the "Core of Steel" badge.</p>
          
          <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover" src="https://picsum.photos/seed/user1/100/100" alt="You" referrerPolicy="no-referrer" />
              <img className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover" src="https://picsum.photos/seed/user2/100/100" alt="Buddy" referrerPolicy="no-referrer" />
            </div>
            <button className="flex-1 bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
              Join Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* Buddies List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Your Squad</h3>
        
        <div className="space-y-3">
          {buddies.map((buddy, i) => (
            <div key={i} className={cn("p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-colors", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover" src={`https://picsum.photos/seed/${buddy.avatar}/100/100`} alt={buddy.name} referrerPolicy="no-referrer" />
                  {buddy.status === "Finished workout" && (
                    <div className={cn("absolute -bottom-1 -right-1 rounded-full p-0.5", isDark ? "bg-[#1c1c1e]" : "bg-white")}>
                      <CheckCircle2 className="w-4 h-4 text-black dark:text-white fill-zinc-200 dark:fill-zinc-800" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>{buddy.name}</h4>
                  <div className="flex items-center gap-2 text-xs font-medium mt-1">
                    <span className={buddy.status === "Finished workout" ? "text-black dark:text-white" : isDark ? "text-zinc-400" : "text-zinc-500"}>
                      {buddy.status}
                    </span>
                    <span className={cn("text-zinc-300", isDark && "text-zinc-700")}>•</span>
                    <span className="text-orange-500 flex items-center gap-0.5">
                      <Activity className="w-3 h-3" /> {buddy.streak} days
                    </span>
                  </div>
                </div>
              </div>
              
              {buddy.status !== "Finished workout" && (
                <button className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-colors", isDark ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-white/20 hover:text-white hover:border-white/30" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-black hover:border-zinc-300")}>
                  <BellRing className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
