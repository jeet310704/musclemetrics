import { useEffect, useState } from "react";
import { History, Dumbbell } from "lucide-react";
import API from "../config/api";

function WorkoutHistory({ refresh }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const userId = user?.id || user?._id;
        const response = await fetch(`${API}/api/workouts/user/${userId}`);
        const data = await response.json();
        setWorkouts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching workout history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [refresh]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  const muscleColors = {
    Chest: "bg-red-100 text-red-700",
    Back: "bg-blue-100 text-blue-700",
    Legs: "bg-emerald-100 text-emerald-700",
    Shoulders: "bg-purple-100 text-purple-700",
    Arms: "bg-orange-100 text-orange-700",
    Core: "bg-yellow-100 text-yellow-700",
    Cardio: "bg-pink-100 text-pink-700",
    FullBody: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-800 p-5 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10">
          <p className="text-zinc-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <History className="h-4 w-4" /> Training Logs
          </p>
          <h1 className="text-3xl md:text-6xl font-black mt-2">Workout History</h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">Every session you've ever logged, all in one place.</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">All Sessions</h2>
            <p className="text-gray-500 text-sm">{workouts.length} workout{workouts.length !== 1 ? "s" : ""} logged</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-24" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-gray-50 border rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 text-center">
            <Dumbbell className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 text-slate-300" />
            <h3 className="text-xl md:text-2xl font-black">No workouts logged yet</h3>
            <p className="text-gray-500 mt-2 text-sm">Save a workout to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className="bg-gray-50 border rounded-2xl p-4 md:p-5 hover:bg-gray-100 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-2xl font-black truncate">{workout.exercise}</h3>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                      {workout.splitName || "No Split"} · {formatDate(workout.createdAt)}
                    </p>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-black ${muscleColors[workout.muscleGroup] || "bg-gray-100 text-gray-700"}`}>
                    {workout.muscleGroup}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {[
                    { label: "Sets", value: workout.sets, color: "text-slate-900" },
                    { label: "Volume", value: Number(workout.volume || 0).toLocaleString(), color: "text-purple-600" },
                    { label: "Points", value: workout.points, color: "text-blue-600" },
                    { label: "Weight", value: `${workout.weight || 0} lbs`, color: "text-emerald-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl p-2.5 md:p-3 border text-center">
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold">{label}</p>
                      <p className={`text-base md:text-xl font-black ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WorkoutHistory;
