import { useEffect, useState } from "react";

function WorkoutAnalytics({ refresh }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("muscles");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:5000";

  useEffect(() => {
    if (userId) fetchAnalytics();
  }, [userId, refresh]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/analytics/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load analytics.");
      }

      setData(result);
    } catch (error) {
      console.error("Workout analytics error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = (items, key) => {
    return Math.max(...items.map((item) => Number(item[key] || 0)), 1);
  };

  if (!userId) {
    return <div>Please login first.</div>;
  }

  if (loading && !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-black">Loading analytics...</p>
      </div>
    );
  }

  if (!data || data.summary.totalWorkouts === 0) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 md:p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <p className="text-blue-200 font-black">Training Intelligence</p>
            <h1 className="text-4xl md:text-6xl font-black mt-2">
              Workout Analytics
            </h1>
            <p className="text-slate-300 mt-3">
              Log workouts to unlock muscle balance and training insights.
            </p>
          </div>
        </section>

        <div className="bg-white border rounded-[2rem] p-8 text-center shadow">
          <h2 className="text-3xl font-black">No analytics yet</h2>
          <p className="text-gray-500 mt-2">
            Analytics will appear after you log workouts.
          </p>
        </div>
      </div>
    );
  }

  const maxMuscleVolume = getMaxValue(data.muscleBreakdown, "volume");
  const maxExerciseVolume = getMaxValue(data.exerciseBreakdown, "volume");
  const maxMonthlyVolume = getMaxValue(data.monthlyTrend, "volume");

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-blue-200 font-black">Training Intelligence</p>

          <h1 className="text-4xl md:text-6xl font-black mt-2">
            Workout Analytics
          </h1>

          <p className="text-slate-300 mt-3 max-w-xl">
            Understand your muscle balance, strongest lifts, weak points, and
            long-term training trends.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Workouts</p>
          <p className="text-4xl font-black mt-1">
            {data.summary.totalWorkouts}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Total Volume</p>
          <p className="text-4xl font-black mt-1">
            {Number(data.summary.totalVolume || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Avg Volume</p>
          <p className="text-4xl font-black mt-1">
            {Number(data.summary.averageVolume || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Exercises</p>
          <p className="text-4xl font-black mt-1">
            {data.summary.trackedExercises}
          </p>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
        <h2 className="text-3xl font-black mb-4">Smart Insights</h2>

        {data.insights.length === 0 ? (
          <p className="text-gray-500 font-bold">No insights yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.insights.map((insight, index) => (
              <div
                key={`${insight.type}-${index}`}
                className="bg-gradient-to-br from-gray-50 to-blue-50 border rounded-[2rem] p-5 shadow-sm"
              >
                <p className="text-5xl">{insight.icon}</p>

                <p className="text-sm text-gray-500 font-black mt-4">
                  {insight.type}
                </p>

                <h3 className="text-2xl font-black mt-1">{insight.title}</h3>

                <p className="text-sm text-gray-600 mt-3">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        {[
          { id: "muscles", label: "Muscle Balance" },
          { id: "exercises", label: "Exercise Analysis" },
          { id: "trends", label: "Monthly Trends" },
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
      </section>

      {activeTab === "muscles" && (
        <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
          <h2 className="text-3xl font-black mb-4">Muscle Balance</h2>

          <div className="space-y-4">
            {data.muscleBreakdown.map((item) => {
              const width = Math.max(
                4,
                (Number(item.volume || 0) / maxMuscleVolume) * 100
              );

              return (
                <div
                  key={item.muscleGroup}
                  className="bg-gray-50 rounded-3xl p-4 border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-black text-xl">{item.muscleGroup}</p>
                      <p className="text-sm text-gray-500 font-bold">
                        {item.workouts} workouts • {item.points} points
                      </p>
                    </div>

                    <p className="font-black">
                      {Number(item.volume || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="w-full bg-white border rounded-full h-5 overflow-hidden">
                    <div
                      className="h-5 bg-blue-600 rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "exercises" && (
        <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
          <h2 className="text-3xl font-black mb-4">Exercise Analysis</h2>

          <div className="space-y-4">
            {data.exerciseBreakdown.slice(0, 25).map((item) => {
              const width = Math.max(
                4,
                (Number(item.volume || 0) / maxExerciseVolume) * 100
              );

              return (
                <div
                  key={item.exercise}
                  className="bg-gray-50 rounded-3xl p-4 border"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-xl">{item.exercise}</p>
                      <p className="text-sm text-gray-500 font-bold">
                        {item.muscleGroup} • {item.workouts} sessions
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Volume</p>
                        <p className="font-black">
                          {Number(item.volume || 0).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Best Weight</p>
                        <p className="font-black">{item.bestWeight}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Best Volume</p>
                        <p className="font-black">
                          {Number(item.bestVolume || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-white border rounded-full h-5 overflow-hidden">
                    <div
                      className="h-5 bg-green-600 rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "trends" && (
        <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
          <h2 className="text-3xl font-black mb-4">Monthly Volume Trend</h2>

          {data.monthlyTrend.length === 0 ? (
            <p className="text-gray-500 font-bold">No monthly data yet.</p>
          ) : (
            <div className="bg-gray-50 border rounded-3xl p-4">
              <div className="flex items-end gap-3 h-72 overflow-x-auto">
                {data.monthlyTrend.map((item) => {
                  const height = Math.max(
                    8,
                    (Number(item.volume || 0) / maxMonthlyVolume) * 240
                  );

                  return (
                    <div
                      key={item.period}
                      className="flex flex-col items-center min-w-[76px]"
                    >
                      <div
                        className="w-12 bg-purple-600 rounded-t-2xl"
                        style={{ height: `${height}px` }}
                        title={`${item.volume} volume`}
                      />

                      <p className="text-xs text-gray-500 mt-2">
                        {item.period}
                      </p>

                      <p className="text-xs font-black">
                        {item.workouts} workouts
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default WorkoutAnalytics;