import { useEffect, useState } from "react";
import API from "../config/api";

function Leaderboard({ refresh, openProfile }) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [data, setData] = useState({
    weekly: [],
    monthly: [],
    allTime: [],
    summary: { totalUsers: 0, totalWorkouts: 0 },
  });
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchLeaderboard();
  }, [refresh]);

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

  const getUserName = (user) =>
    user?.name || user?.username || user?.email?.split("@")[0] || "User";

  const getUserHandle = (user) =>
    user?.username || user?.email?.split("@")[0] || "user";

  const getProfileImage = (user) =>
    user?.profilePicture || "https://via.placeholder.com/80?text=U";

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const leaderboard = getActiveList();
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 p-6 md:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <p className="text-white/80 font-black">MuscleMetrics Ranking</p>
          <h1 className="text-4xl md:text-6xl font-black mt-2">
            Leaderboard
          </h1>
          <p className="text-white/90 mt-3 max-w-xl">
            Tap any athlete to open their public profile.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {[
          { id: "weekly", label: "This Week" },
          { id: "monthly", label: "Last 30 Days" },
          { id: "allTime", label: "All Time" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-2xl font-black transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow"
                : "bg-white border text-gray-700 hover:bg-gray-50"
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
        <div className="bg-white border rounded-[2rem] p-8 text-center shadow">
          <h2 className="text-3xl font-black">No rankings yet</h2>
          <p className="text-gray-500 mt-2">
            Log workouts to start appearing here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topThree.map((entry) => (
              <button
                key={entry.user._id}
                onClick={() => openProfile?.(entry.user._id)}
                className={`rounded-[2rem] border p-6 shadow-xl text-center transition hover:scale-[1.02] ${
                  entry.rank === 1
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 md:scale-105"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="text-6xl mb-4">{getRankBadge(entry.rank)}</div>

                <img
                  src={getProfileImage(entry.user)}
                  alt="profile"
                  className="w-24 h-24 rounded-3xl object-cover mx-auto border-4 border-white shadow-xl"
                />

                <h3 className="text-2xl font-black mt-4">
                  {getUserName(entry.user)}
                </h3>

                <p className="text-sm text-gray-500">
                  @{getUserHandle(entry.user)}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-white border rounded-2xl p-3">
                    <p className="text-2xl font-black">{entry.totalPoints}</p>
                    <p className="text-xs text-gray-500 font-bold">Points</p>
                  </div>

                  <div className="bg-white border rounded-2xl p-3">
                    <p className="text-2xl font-black">
                      {entry.totalWorkouts}
                    </p>
                    <p className="text-xs text-gray-500 font-bold">Workouts</p>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 border rounded-2xl p-4 text-sm">
                  <p>
                    Volume:{" "}
                    <span className="font-black">
                      {Number(entry.totalVolume || 0).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Streak:{" "}
                    <span className="font-black">
                      {entry.user.streak || 0} days
                    </span>
                  </p>
                  <p>
                    Favorite:{" "}
                    <span className="font-black">
                      {entry.favoriteMuscle || "None"}
                    </span>
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white border rounded-[2rem] shadow-xl overflow-hidden">
            <div className="p-5 border-b bg-gray-50">
              <h2 className="text-2xl font-black">Full Ranking</h2>
            </div>

            {rest.length === 0 ? (
              <p className="p-5 text-gray-500 font-bold">
                Only top users so far.
              </p>
            ) : (
              <div className="divide-y">
                {rest.map((entry) => (
                  <button
                    key={entry.user._id}
                    onClick={() => openProfile?.(entry.user._id)}
                    className="w-full text-left p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition"
                  >
                    <div className="text-xl font-black w-16">
                      {getRankBadge(entry.rank)}
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={getProfileImage(entry.user)}
                        alt="profile"
                        className="w-14 h-14 rounded-2xl object-cover border"
                      />

                      <div>
                        <p className="font-black">{getUserName(entry.user)}</p>
                        <p className="text-sm text-gray-500">
                          @{getUserHandle(entry.user)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm flex-1">
                      <div>
                        <p className="text-gray-500">Points</p>
                        <p className="font-black">{entry.totalPoints}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Workouts</p>
                        <p className="font-black">{entry.totalWorkouts}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Volume</p>
                        <p className="font-black">
                          {Number(entry.totalVolume || 0).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Streak</p>
                        <p className="font-black">{entry.user.streak || 0}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Favorite</p>
                        <p className="font-black">
                          {entry.favoriteMuscle || "None"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Leaderboard;