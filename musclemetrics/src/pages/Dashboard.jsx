import { useEffect, useState } from "react";

function Dashboard({ refresh }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;
  const API = "http://localhost:5000";

  const [workouts, setWorkouts] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId, refresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [workoutRes, streakRes, progressRes] = await Promise.all([
        fetch(`${API}/api/workouts/user/${userId}`),
        fetch(`${API}/api/streaks/${userId}`),
        fetch(`${API}/api/progress/${userId}`),
      ]);

      const workoutData = await workoutRes.json();
      const streakResult = await streakRes.json();
      const progressResult = await progressRes.json();

      setWorkouts(Array.isArray(workoutData) ? workoutData : []);
      setStreakData(streakRes.ok ? streakResult : null);
      setProgressData(progressRes.ok ? progressResult : null);
    } catch (error) {
      console.error("Dashboard error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalWorkouts = workouts.length;

  const totalVolume = workouts.reduce((sum, workout) => {
    return sum + Number(workout.volume || 0);
  }, 0);

  const totalPoints = workouts.reduce((sum, workout) => {
    return sum + Number(workout.points || 0);
  }, 0);

  const bestWeight = workouts.reduce((best, workout) => {
    return Math.max(best, Number(workout.weight || 0));
  }, 0);

  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const muscleCounts = workouts.reduce((acc, workout) => {
    const muscle = workout.muscleGroup || "Other";
    acc[muscle] = (acc[muscle] || 0) + 1;
    return acc;
  }, {});

  const topMuscles = Object.entries(muscleCounts)
    .map(([muscleGroup, count]) => ({ muscleGroup, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const weeklyWorkouts = streakData?.stats?.weeklyProgress || 0;
  const weeklyGoal = streakData?.stats?.weeklyGoal || 4;
  const currentStreak = streakData?.stats?.currentStreak || 0;
  const level = streakData?.stats?.level || 1;
  const xpIntoLevel = streakData?.stats?.xpIntoLevel || 0;
  const xpForNextLevel = streakData?.stats?.xpForNextLevel || 500;

  const xpPercent = Math.min((xpIntoLevel / xpForNextLevel) * 100, 100);
  const weeklyPercent = Math.min((weeklyWorkouts / weeklyGoal) * 100, 100);

  const volumeTrend = progressData?.volumeTrend || [];
  const maxTrendVolume = Math.max(
    ...volumeTrend.map((item) => Number(item.volume || 0)),
    1
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    return new Date(dateValue).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  if (!userId) {
    return <div>Please login first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <p className="text-blue-200 font-bold">Welcome back</p>

            <h1 className="text-4xl md:text-6xl font-black mt-2 leading-tight">
              Ready to train?
            </h1>

            <p className="text-slate-300 mt-3 max-w-xl">
              Track your workouts, beat your PRs, and keep your streak alive.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                <p className="text-sm text-blue-200 font-bold">Level</p>
                <p className="text-2xl font-black">{level}</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                <p className="text-sm text-blue-200 font-bold">Streak</p>
                <p className="text-2xl font-black">{currentStreak} days</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                <p className="text-sm text-blue-200 font-bold">This Week</p>
                <p className="text-2xl font-black">
                  {weeklyWorkouts}/{weeklyGoal}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-[2rem] p-5 backdrop-blur-xl">
            <p className="text-blue-200 font-bold">Weekly Goal</p>

            <div className="mt-5">
              <div className="relative h-40 w-40 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#3b82f6 ${weeklyPercent}%, rgba(255,255,255,0.15) 0)`,
                  }}
                />

                <div className="relative h-28 w-28 rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <p className="text-4xl font-black">{weeklyWorkouts}</p>
                  <p className="text-xs text-slate-300">of {weeklyGoal}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-slate-300 text-sm mt-4">
              {weeklyWorkouts >= weeklyGoal
                ? "Weekly goal complete 🔥"
                : `${weeklyGoal - weeklyWorkouts} workouts left this week`}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 text-blue-700 font-bold">
          Loading dashboard...
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border bg-white p-5 shadow hover:shadow-xl transition">
          <p className="text-gray-500 text-sm font-bold">Total Workouts</p>
          <p className="text-4xl font-black mt-2">{totalWorkouts}</p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow hover:shadow-xl transition">
          <p className="text-gray-500 text-sm font-bold">Total Volume</p>
          <p className="text-4xl font-black mt-2">
            {Number(totalVolume || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow hover:shadow-xl transition">
          <p className="text-gray-500 text-sm font-bold">Total Points</p>
          <p className="text-4xl font-black mt-2">{totalPoints}</p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow hover:shadow-xl transition">
          <p className="text-gray-500 text-sm font-bold">Best Weight</p>
          <p className="text-4xl font-black mt-2">{bestWeight}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border rounded-[2rem] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black">Volume Trend</h2>
              <p className="text-gray-500 text-sm">
                Your recent training volume over time.
              </p>
            </div>
          </div>

          {volumeTrend.length === 0 ? (
            <div className="h-64 bg-gray-50 border rounded-3xl flex items-center justify-center text-gray-500 font-bold">
              Log workouts to see your chart.
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-3xl p-4">
              <div className="flex items-end gap-3 h-64 overflow-x-auto">
                {volumeTrend.slice(-14).map((item) => {
                  const height = Math.max(
                    8,
                    (Number(item.volume || 0) / maxTrendVolume) * 220
                  );

                  return (
                    <div
                      key={item.date}
                      className="flex flex-col items-center min-w-[54px]"
                    >
                      <div
                        className="w-9 rounded-t-2xl bg-blue-600"
                        style={{ height: `${height}px` }}
                      />

                      <p className="text-[11px] text-gray-500 mt-2">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-[2rem] p-5 shadow-xl">
          <h2 className="text-2xl font-black">XP Progress</h2>

          <p className="text-gray-500 text-sm mt-1">
            Earn XP by logging workouts.
          </p>

          <div className="mt-6 bg-gray-50 border rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <p className="font-black">Level {level}</p>
              <p className="text-sm text-gray-500 font-bold">
                {xpIntoLevel}/{xpForNextLevel}
              </p>
            </div>

            <div className="w-full h-5 bg-white border rounded-full overflow-hidden mt-4">
              <div
                className="h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-5 bg-orange-50 border border-orange-100 rounded-3xl p-5">
            <p className="text-orange-600 font-black">🔥 Current Streak</p>
            <p className="text-5xl font-black mt-2">{currentStreak}</p>
            <p className="text-gray-500 font-bold">days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border rounded-[2rem] p-5 shadow-xl">
          <h2 className="text-2xl font-black mb-4">Top Muscle Groups</h2>

          {topMuscles.length === 0 ? (
            <div className="bg-gray-50 border rounded-3xl p-6 text-center text-gray-500 font-bold">
              Muscle breakdown appears after logging workouts.
            </div>
          ) : (
            <div className="space-y-3">
              {topMuscles.map((item) => {
                const maxCount = Math.max(
                  ...topMuscles.map((muscle) => muscle.count),
                  1
                );

                const width = Math.max(8, (item.count / maxCount) * 100);

                return (
                  <div
                    key={item.muscleGroup}
                    className="bg-gray-50 border rounded-2xl p-4"
                  >
                    <div className="flex justify-between mb-2">
                      <p className="font-black">{item.muscleGroup}</p>
                      <p className="font-bold text-gray-500">
                        {item.count} workouts
                      </p>
                    </div>

                    <div className="w-full h-3 bg-white border rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-green-600 rounded-full"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-[2rem] p-5 shadow-xl">
          <h2 className="text-2xl font-black mb-4">Recent Workouts</h2>

          {recentWorkouts.length === 0 ? (
            <div className="bg-gray-50 border rounded-3xl p-6 text-center">
              <h3 className="text-xl font-black">No workouts yet</h3>
              <p className="text-gray-500 mt-2">
                Start logging workouts to fill your dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout._id}
                  className="bg-gray-50 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-black text-lg">{workout.exercise}</p>
                    <p className="text-sm text-gray-500">
                      {workout.muscleGroup} • {formatDate(workout.createdAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Sets</p>
                      <p className="font-black">{workout.sets}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Weight</p>
                      <p className="font-black">{workout.weight}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Volume</p>
                      <p className="font-black">
                        {Number(workout.volume || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;