import { useEffect, useState } from "react";

function StreakSystem({ refresh }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:5000";

  useEffect(() => {
    if (userId) fetchStreaks();
  }, [userId, refresh]);

  const fetchStreaks = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/streaks/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load streaks.");
      }

      setData(result);
    } catch (error) {
      console.error("Streak system error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercent = (progress, target) => {
    if (!target) return 0;
    return Math.min((Number(progress || 0) / Number(target || 1)) * 100, 100);
  };

  const formatDateShort = (dateValue) => {
    const date = new Date(dateValue);

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  if (!userId) {
    return <div>Please login first.</div>;
  }

  if (loading && !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-bold">Loading streaks...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-bold">No streak data found.</p>
      </div>
    );
  }

  const { stats, badges, calendar } = data;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-white/80 font-semibold">Consistency System</p>

        <h1 className="text-4xl md:text-5xl font-black mt-1">
          {stats.currentStreak} Day Streak 🔥
        </h1>

        <p className="text-white/90 mt-2">
          Build consistency, hit weekly goals, and level up.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Level</p>
          <p className="text-4xl font-black mt-1">{stats.level}</p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Weekly Goal</p>
          <p className="text-4xl font-black mt-1">
            {stats.weeklyProgress}/{stats.weeklyGoal}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Badges</p>
          <p className="text-4xl font-black mt-1">
            {stats.unlockedBadges}/{stats.totalBadges}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Total Workouts</p>
          <p className="text-4xl font-black mt-1">{stats.totalWorkouts}</p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-2xl font-black">XP Progress</h2>
            <p className="text-gray-500 text-sm">
              Earn XP from workout points.
            </p>
          </div>

          <p className="font-black">
            {stats.xpIntoLevel}/{stats.xpForNextLevel} XP
          </p>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
          <div
            className="h-5 bg-blue-600 rounded-full"
            style={{
              width: `${getProgressPercent(
                stats.xpIntoLevel,
                stats.xpForNextLevel
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-xl">
        <h2 className="text-2xl font-black mb-4">Last 30 Days</h2>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {calendar.map((day) => (
            <div
              key={day.date}
              className={`rounded-2xl p-3 text-center border ${
                day.completed
                  ? "bg-green-100 border-green-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="text-xs font-bold text-gray-500">
                {formatDateShort(day.date)}
              </p>

              <p className="text-2xl mt-1">{day.completed ? "✅" : "—"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-xl">
        <h2 className="text-2xl font-black mb-4">Badges</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-3xl border p-5 shadow-sm ${
                badge.unlocked
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between">
                <p
                  className={`text-4xl ${
                    badge.unlocked ? "" : "grayscale opacity-50"
                  }`}
                >
                  {badge.icon}
                </p>

                <span
                  className={`text-xs font-black px-3 py-1 rounded-full ${
                    badge.unlocked
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>

              <h3 className="text-lg font-black mt-4">{badge.title}</h3>

              <p className="text-sm text-gray-500 mt-1">
                {badge.description}
              </p>

              <div className="w-full bg-white rounded-full h-3 mt-4 overflow-hidden border">
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
                {Number(badge.progress || 0).toLocaleString()}/
                {Number(badge.target || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StreakSystem;