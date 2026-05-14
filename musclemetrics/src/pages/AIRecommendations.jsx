import { useEffect, useState } from "react";
import API from "../config/api";

function AIRecommendations({ refresh }) {
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
    if (userId) fetchCoach();
  }, [userId, refresh]);

  const fetchCoach = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/ai-coach/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load AI coach.");
      }

      setData(result);
    } catch (error) {
      console.error("AI coach error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityStyle = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  if (!userId) return <div>Please login first.</div>;

  if (loading && !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-black">Loading AI coach...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border rounded-[2rem] p-8 text-center shadow">
        <h2 className="text-2xl font-black">AI coach not ready</h2>
        <p className="text-gray-500 mt-2">Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-purple-950 to-blue-900 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-purple-200 font-black">Phase 4</p>

          <h1 className="text-4xl md:text-6xl font-black mt-2">
            AI Coach
          </h1>

          <p className="text-slate-300 mt-3 max-w-xl">
            Get progressive overload tips, plateau alerts, recovery guidance,
            and your next workout focus.
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
          <p className="text-gray-500 text-sm font-bold">Streak</p>
          <p className="text-4xl font-black mt-1">
            {data.summary.streak}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Strongest</p>
          <p className="text-3xl font-black mt-1">
            {data.summary.strongestMuscle || "None"}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Needs Work</p>
          <p className="text-3xl font-black mt-1">
            {data.summary.leastTrainedMuscle || "None"}
          </p>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 md:p-6 shadow-xl">
        <h2 className="text-3xl font-black mb-4">Next Recommended Workout</h2>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border rounded-[2rem] p-5">
          <p className="text-sm text-blue-600 font-black">Recommended Focus</p>

          <h3 className="text-3xl font-black mt-1">
            {data.nextWorkout.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
            {data.nextWorkout.exercises.map((exercise) => (
              <div
                key={exercise}
                className="bg-white border rounded-2xl p-4 font-black"
              >
                🏋️ {exercise}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 md:p-6 shadow-xl">
        <h2 className="text-3xl font-black mb-4">Coach Recommendations</h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data.recommendations.map((item, index) => (
            <div
              key={`${item.type}-${index}`}
              className="bg-gray-50 border rounded-[2rem] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500 font-black">
                    {item.type}
                  </p>

                  <h3 className="text-2xl font-black mt-1">{item.title}</h3>
                </div>

                <span
                  className={`text-xs font-black px-3 py-1 rounded-full border ${
                    priorityStyle[item.priority] || priorityStyle.medium
                  }`}
                >
                  {item.priority}
                </span>
              </div>

              <p className="text-gray-600 mt-4 font-medium">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AIRecommendations;