import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import API from "../config/api";

function Leaderboard({ refresh, openProfile }) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [data, setData] = useState({ weekly: [], monthly: [], allTime: [], summary: { totalUsers: 0, totalWorkouts: 0 } });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLeaderboard(); }, [refresh]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/leaderboard`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Leaderboard error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActiveList = () => {
    if (activeTab === "weekly") return data.weekly || [];
    if (activeTab === "monthly") return data.monthly || [];
    return data.allTime || [];
  };

  const getUserName = (user) => user?.name || user?.username || user?.email?.split("@")[0] || "User";
  const getUserHandle = (user) => user?.username || user?.email?.split("@")[0] || "user";
  const getProfileImage = (user) => user?.profilePicture || "https://via.placeholder.com/80?text=U";

  const rankMeta = {
    1: { emoji: "🥇", bg: "bg-gradient-to-br from-yellow-50 to-amber-50", border: "border-yellow-300", ring: "ring-4 ring-yellow-300", badge: "bg-yellow-500", scale: "md:scale-105 z-10" },
    2: { emoji: "🥈", bg: "bg-gradient-to-br from-slate-50 to-gray-100", border: "border-slate-300", ring: "ring-2 ring-slate-300", badge: "bg-slate-400", scale: "" },
    3: { emoji: "🥉", bg: "bg-gradient-to-br from-orange-50 to-amber-50", border: "border-orange-200", ring: "ring-2 ring-orange-300", badge: "bg-orange-400", scale: "" },
  };

  const leaderboard = getActiveList();
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-5 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-red-700/30 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/70 font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4" /> MuscleMetrics Ranking
          </p>
          <h1 className="text-3xl md:text-6xl font-black mt-2">Leaderboard</h1>
          <p className="text-white/80 mt-2 text-sm md:text-base">Tap any athlete to open their public profile.</p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="flex gap-2 md:gap-3">
        {[
          { id: "weekly", label: "This Week" },
          { id: "monthly", label: "Last 30 Days" },
          { id: "allTime", label: "All Time" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 md:px-5 md:py-3 rounded-2xl font-black text-sm md:text-base transition ${
              activeTab === tab.id ? "bg-slate-900 text-white shadow" : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white border rounded-[2rem] p-8 text-center shadow">
          <p className="text-gray-500 font-black">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white border rounded-[2rem] p-8 md:p-10 text-center shadow">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h2 className="text-2xl md:text-3xl font-black">No rankings yet</h2>
          <p className="text-gray-500 mt-2 text-sm">Log workouts to start appearing here.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-end">
              {topThree.map((entry) => {
                const meta = rankMeta[entry.rank] || { emoji: `#${entry.rank}`, bg: "bg-white", border: "border-gray-200", ring: "", badge: "bg-gray-400", scale: "" };
                return (
                  <button
                    key={entry.user._id}
                    onClick={() => openProfile?.(entry.user._id)}
                    className={`relative rounded-[1.5rem] md:rounded-[2rem] border p-5 md:p-6 shadow-xl text-center transition hover:scale-[1.02] hover:shadow-2xl ${meta.bg} ${meta.border} ${meta.scale}`}
                  >
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${meta.badge} text-white text-xs font-black px-3 py-1 rounded-full shadow`}>
                      {meta.emoji} Rank {entry.rank}
                    </div>

                    <img
                      src={getProfileImage(entry.user)}
                      alt="profile"
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover mx-auto mt-4 ${meta.ring}`}
                    />

                    <h3 className="text-xl md:text-2xl font-black mt-4">{getUserName(entry.user)}</h3>
                    <p className="text-sm text-gray-500">@{getUserHandle(entry.user)}</p>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-white/80 border rounded-xl p-2.5">
                        <p className="text-xl md:text-2xl font-black">{entry.totalPoints}</p>
                        <p className="text-[10px] text-gray-500 font-bold">Points</p>
                      </div>
                      <div className="bg-white/80 border rounded-xl p-2.5">
                        <p className="text-xl md:text-2xl font-black">{entry.totalWorkouts}</p>
                        <p className="text-[10px] text-gray-500 font-bold">Workouts</p>
                      </div>
                    </div>

                    <div className="mt-3 bg-white/60 border rounded-xl p-3 text-xs text-left space-y-0.5">
                      <p>Vol: <span className="font-black">{Number(entry.totalVolume || 0).toLocaleString()}</span></p>
                      <p>Streak: <span className="font-black">{entry.user.streak || 0}d</span></p>
                      <p>Focus: <span className="font-black">{entry.favoriteMuscle || "None"}</span></p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Full list */}
          {rest.length > 0 && (
            <div className="bg-white border rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden">
              <div className="p-4 md:p-5 border-b bg-gray-50">
                <h2 className="text-xl md:text-2xl font-black">Full Ranking</h2>
              </div>
              <div className="divide-y">
                {rest.map((entry) => (
                  <button
                    key={entry.user._id}
                    onClick={() => openProfile?.(entry.user._id)}
                    className="w-full text-left p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-gray-50 transition"
                  >
                    <div className="text-lg md:text-xl font-black w-10 text-center shrink-0 text-gray-500">
                      #{entry.rank}
                    </div>

                    <img
                      src={getProfileImage(entry.user)}
                      alt="profile"
                      className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover border shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-black truncate text-sm md:text-base">{getUserName(entry.user)}</p>
                      <p className="text-xs text-gray-500 truncate">@{getUserHandle(entry.user)}</p>
                    </div>

                    <div className="hidden md:grid grid-cols-5 gap-3 text-sm flex-1 max-w-xs">
                      {[
                        { label: "Points", value: entry.totalPoints },
                        { label: "Workouts", value: entry.totalWorkouts },
                        { label: "Volume", value: Number(entry.totalVolume || 0).toLocaleString() },
                        { label: "Streak", value: `${entry.user.streak || 0}d` },
                        { label: "Focus", value: entry.favoriteMuscle || "—" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-gray-400 text-xs">{label}</p>
                          <p className="font-black text-sm">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Mobile: just show points */}
                    <div className="md:hidden text-right shrink-0">
                      <p className="font-black">{entry.totalPoints}</p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Leaderboard;
