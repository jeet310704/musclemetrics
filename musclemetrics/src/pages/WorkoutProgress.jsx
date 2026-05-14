import { useEffect, useState } from "react";
import API, { apiFetch } from "../config/api";


function WorkoutProgress({ refresh }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;

  const [data, setData] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (userId) fetchProgress();
  }, [userId, refresh]);

  const fetchProgress = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/progress/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load progress.");
      }

      setData(result);

      if (result.exercises?.length > 0 && !selectedExercise) {
        setSelectedExercise(result.exercises[0].exercise);
      }
    } catch (error) {
      console.error("Workout progress error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedExerciseData = () => {
    if (!data?.exercises?.length) return null;

    return data.exercises.find((item) => item.exercise === selectedExercise);
  };

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const selected = getSelectedExerciseData();

  if (!userId) {
    return <div>Please login first.</div>;
  }

  if (loading && !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-bold">Loading progress...</p>
      </div>
    );
  }

  if (!data || data.summary.totalWorkouts === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
          <p className="text-white/80 font-semibold">Workout Progress</p>
          <h1 className="text-4xl md:text-5xl font-black mt-1">
            Progress Tracker 📈
          </h1>
          <p className="text-white/90 mt-2">
            Log workouts to start seeing strength and volume trends.
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-8 text-center shadow">
          <h2 className="text-2xl font-black">No workout data yet</h2>
          <p className="text-gray-500 mt-2">
            Start logging workouts to unlock progress charts.
          </p>
        </div>
      </div>
    );
  }

  const maxVolume = Math.max(
    ...(selected?.sessions || []).map((session) => Number(session.volume || 0)),
    1
  );

  const maxWeight = Math.max(
    ...(selected?.sessions || []).map((session) => Number(session.weight || 0)),
    1
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-white/80 font-semibold">Workout Progress</p>

        <h1 className="text-4xl md:text-5xl font-black mt-1">
          Progress Tracker 📈
        </h1>

        <p className="text-white/90 mt-2">
          Track strength, volume, and exercise-by-exercise growth.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Workouts</p>
          <p className="text-3xl font-black mt-1">
            {data.summary.totalWorkouts}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Total Volume</p>
          <p className="text-3xl font-black mt-1">
            {Number(data.summary.totalVolume || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Points</p>
          <p className="text-3xl font-black mt-1">
            {data.summary.totalPoints}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Best Weight</p>
          <p className="text-3xl font-black mt-1">
            {data.summary.bestOverallWeight}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Exercises</p>
          <p className="text-3xl font-black mt-1">
            {data.summary.trackedExercises}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-black">Exercise Progress</h2>
            <p className="text-gray-500 text-sm">
              Pick an exercise to see its strength and volume trend.
            </p>
          </div>

          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="p-3 rounded-xl bg-gray-100 outline-none font-bold"
          >
            {data.exercises.map((item) => (
              <option key={item.exercise} value={item.exercise}>
                {item.exercise}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-500 text-sm font-bold">Sessions</p>
                <p className="text-2xl font-black">{selected.totalSessions}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-500 text-sm font-bold">Best Weight</p>
                <p className="text-2xl font-black">{selected.bestWeight}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-500 text-sm font-bold">Best Volume</p>
                <p className="text-2xl font-black">
                  {Number(selected.bestVolume || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-500 text-sm font-bold">
                  Weight Change
                </p>
                <p
                  className={`text-2xl font-black ${
                    selected.weightChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selected.weightChange >= 0 ? "+" : ""}
                  {selected.weightChange}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black">Volume Trend</h3>
                  <p className="text-sm text-gray-500">Higher is better</p>
                </div>

                <div className="bg-gray-50 rounded-3xl p-4 border">
                  <div className="flex items-end gap-2 h-52 overflow-x-auto">
                    {selected.sessions.map((session, index) => {
                      const height = Math.max(
                        8,
                        (Number(session.volume || 0) / maxVolume) * 180
                      );

                      return (
                        <div
                          key={session.workoutId || index}
                          className="flex flex-col items-center min-w-[44px]"
                        >
                          <div
                            className="w-8 bg-blue-600 rounded-t-xl"
                            style={{ height: `${height}px` }}
                            title={`${session.volume} volume`}
                          />
                          <p className="text-[10px] text-gray-500 mt-2 rotate-[-25deg] whitespace-nowrap">
                            {formatDate(session.date)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black">Weight Trend</h3>
                  <p className="text-sm text-gray-500">Top weight per workout</p>
                </div>

                <div className="bg-gray-50 rounded-3xl p-4 border">
                  <div className="flex items-end gap-2 h-52 overflow-x-auto">
                    {selected.sessions.map((session, index) => {
                      const height = Math.max(
                        8,
                        (Number(session.weight || 0) / maxWeight) * 180
                      );

                      return (
                        <div
                          key={session.workoutId || index}
                          className="flex flex-col items-center min-w-[44px]"
                        >
                          <div
                            className="w-8 bg-green-600 rounded-t-xl"
                            style={{ height: `${height}px` }}
                            title={`${session.weight} weight`}
                          />
                          <p className="text-[10px] text-gray-500 mt-2 rotate-[-25deg] whitespace-nowrap">
                            {formatDate(session.date)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-xl">
        <h2 className="text-2xl font-black mb-4">Recent Performance</h2>

        <div className="space-y-3">
          {data.recentWorkouts.map((workout) => (
            <div
              key={workout._id}
              className="bg-gray-50 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <p className="font-black">{workout.exercise}</p>
                <p className="text-sm text-gray-500">
                  {workout.muscleGroup} • {formatDate(workout.createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
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

                <div>
                  <p className="text-gray-500">Points</p>
                  <p className="font-black">{workout.points}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkoutProgress;