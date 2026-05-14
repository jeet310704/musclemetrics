import { useEffect, useState } from "react";
import API, { apiFetch } from "../config/api";

function Rewards({ refresh }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (userId) {
      fetchRewards();
    }
  }, [userId, refresh]);

  const fetchRewards = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/rewards/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load rewards.");
      }

      setData(result);
    } catch (error) {
      console.error("Rewards error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercent = (progress, target) => {
    if (!target) return 0;
    return Math.min((progress / target) * 100, 100);
  };

  if (!userId) {
    return <div>Please login first.</div>;
  }

  if (loading && !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-semibold">Loading rewards...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-semibold">No rewards data found.</p>
      </div>
    );
  }

  const { stats, badges, nextGoal } = data;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-white/80 font-semibold">Workout Rewards</p>
            <h1 className="text-4xl md:text-5xl font-black mt-1">
              {stats.streak} Day Streak 🔥
            </h1>
            <p className="text-white/90 mt-2">
              Keep logging workouts to unlock more badges.
            </p>
          </div>

          <div className="bg-white/20 rounded-3xl p-5 text-center min-w-[160px]">
            <p className="text-4xl font-black">
              {stats.unlockedBadges}/{stats.totalBadges}
            </p>
            <p className="text-white/80 text-sm font-semibold">
              Badges Unlocked
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-semibold">Total Workouts</p>
          <h2 className="text-3xl font-black mt-1">{stats.totalWorkouts}</h2>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-semibold">Total Points</p>
          <h2 className="text-3xl font-black mt-1">{stats.totalPoints}</h2>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-semibold">This Week</p>
          <h2 className="text-3xl font-black mt-1">{stats.weeklyWorkouts}</h2>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-semibold">Total Volume</p>
          <h2 className="text-3xl font-black mt-1">
            {Number(stats.totalVolume || 0).toLocaleString()}
          </h2>
        </div>
      </div>

      {nextGoal && (
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5">
          <p className="text-blue-600 font-bold">Next Goal</p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-4xl">{nextGoal.icon}</span>

            <div className="flex-1">
              <h3 className="text-xl font-black">{nextGoal.title}</h3>
              <p className="text-gray-600 text-sm">{nextGoal.description}</p>

              <div className="w-full bg-white rounded-full h-3 mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{
                    width: `${getProgressPercent(
                      nextGoal.progress,
                      nextGoal.target
                    )}%`,
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {nextGoal.progress}/{nextGoal.target}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black mb-4">Badges</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-3xl border p-5 shadow transition ${
                badge.unlocked
                  ? "bg-white border-yellow-200"
                  : "bg-gray-50 border-gray-200 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-4xl ${
                    badge.unlocked ? "" : "grayscale opacity-60"
                  }`}
                >
                  {badge.icon}
                </span>

                {badge.unlocked ? (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    Unlocked
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                    Locked
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black mt-4">{badge.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {badge.description}
              </p>

              <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                <div
                  className={`h-3 rounded-full ${
                    badge.unlocked ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${getProgressPercent(
                      badge.progress,
                      badge.target
                    )}%`,
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {badge.progress}/{badge.target}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rewards;