import { useEffect, useMemo, useState } from "react";
import { Trophy, Dumbbell, TrendingUp } from "lucide-react";
import API, { apiFetch } from "../config/api";
import { ListSkeleton } from "../components/Skeleton";

function PRTracker({ refresh }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchWorkouts();
  }, [userId, refresh]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await apiFetch("/api/workouts/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not load PRs.");
        setWorkouts([]);
        return;
      }

      setWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("PR fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const records = useMemo(() => {
    const map = {};

    workouts.forEach((workout) => {
      const name = workout.exercise || "Unknown Exercise";
      const weight = Number(workout.weight || 0);
      const volume = Number(workout.volume || 0);

      if (!map[name]) {
        map[name] = {
          exercise: name,
          muscleGroup: workout.muscleGroup || "Other",
          bestWeight: weight,
          bestVolume: volume,
          date: workout.createdAt,
        };
      } else {
        if (weight > map[name].bestWeight) map[name].bestWeight = weight;
        if (volume > map[name].bestVolume) map[name].bestVolume = volume;
      }
    });

    return Object.values(map).sort((a, b) => b.bestWeight - a.bestWeight);
  }, [workouts]);

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 p-6 md:p-8 text-white shadow-2xl">
        <p className="text-white/80 font-black">Strength Records</p>
        <h1 className="text-4xl md:text-6xl font-black mt-2">
          Personal Records
        </h1>
        <p className="text-white/90 mt-3">
          Your strongest lifts and highest workout volume by exercise.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-[2rem] p-5 shadow">
          <Trophy className="h-8 w-8 text-yellow-600 mb-3" />
          <p className="text-gray-500 font-bold">Tracked PRs</p>
          <p className="text-4xl font-black">{records.length}</p>
        </div>

        <div className="bg-white border rounded-[2rem] p-5 shadow">
          <Dumbbell className="h-8 w-8 text-slate-900 mb-3" />
          <p className="text-gray-500 font-bold">Best Lift</p>
          <p className="text-4xl font-black">
            {records[0]?.bestWeight || 0} lbs
          </p>
        </div>

        <div className="bg-white border rounded-[2rem] p-5 shadow">
          <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
          <p className="text-gray-500 font-bold">Workout Logs</p>
          <p className="text-4xl font-black">{workouts.length}</p>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
        <h2 className="text-3xl font-black mb-5">PR Board</h2>

        {loading ? (
          <ListSkeleton rows={5} />
        ) : records.length === 0 ? (
          <div className="bg-gray-50 border rounded-[2rem] p-10 text-center">
            <Trophy className="h-14 w-14 mx-auto text-gray-400 mb-3" />
            <h3 className="text-2xl font-black">No PRs yet</h3>
            <p className="text-gray-500 mt-2">
              Log workouts to start building your record board.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <div
                key={record.exercise}
                className="bg-gray-50 border rounded-[2rem] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-gray-500 font-black">
                    #{index + 1} • {record.muscleGroup}
                  </p>
                  <h3 className="text-2xl font-black">{record.exercise}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                  <div className="bg-white border rounded-2xl p-3 text-center">
                    <p className="text-xs text-gray-500 font-bold">
                      Best Weight
                    </p>
                    <p className="font-black">{record.bestWeight} lbs</p>
                  </div>

                  <div className="bg-white border rounded-2xl p-3 text-center">
                    <p className="text-xs text-gray-500 font-bold">
                      Best Volume
                    </p>
                    <p className="font-black">
                      {Number(record.bestVolume || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PRTracker;