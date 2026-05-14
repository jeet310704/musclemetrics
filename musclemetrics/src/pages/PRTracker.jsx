import { useEffect, useState } from "react";
import API from "../config/api";

function PRTracker({ refresh }) {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const response = await fetch(`${API}/api/workouts`);
        const data = await response.json();

        const userWorkouts = Array.isArray(data)
          ? data.filter((w) => w.userId?._id === user.id || w.userId === user.id)
          : [];

        setWorkouts(userWorkouts);
      } catch (error) {
        console.error("Error fetching PR data:", error);
      }
    };

    fetchWorkouts();
  }, [refresh]);

  const groupedPRs = {};

  workouts.forEach((workout) => {
    const exercise = workout.exercise;

    if (!groupedPRs[exercise]) {
      groupedPRs[exercise] = {
        exercise,
        bestWeight: workout.weight || 0,
        bestVolume: workout.volume || 0,
        bestPoints: workout.points || 0,
        bestWeightWorkout: workout,
        bestVolumeWorkout: workout,
        bestPointsWorkout: workout,
      };
    }

    if (Number(workout.weight || 0) > groupedPRs[exercise].bestWeight) {
      groupedPRs[exercise].bestWeight = workout.weight;
      groupedPRs[exercise].bestWeightWorkout = workout;
    }

    if (Number(workout.volume || 0) > groupedPRs[exercise].bestVolume) {
      groupedPRs[exercise].bestVolume = workout.volume;
      groupedPRs[exercise].bestVolumeWorkout = workout;
    }

    if (Number(workout.points || 0) > groupedPRs[exercise].bestPoints) {
      groupedPRs[exercise].bestPoints = workout.points;
      groupedPRs[exercise].bestPointsWorkout = workout;
    }
  });

  const prList = Object.values(groupedPRs).sort(
    (a, b) => b.bestPoints - a.bestPoints
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-blue-600 font-semibold text-sm">Progress Records</p>
        <h2 className="text-4xl font-black tracking-tight">Personal Records</h2>
        <p className="text-gray-500 mt-2">
          Track your strongest lifts, best volume, and highest workout scores.
        </p>
      </div>

      {prList.length === 0 ? (
        <p className="text-gray-500">
          No PRs yet. Log workouts to start tracking records.
        </p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {prList.map((pr) => (
            <div
              key={pr.exercise}
              className="bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-sm"
            >
              <h3 className="text-2xl font-black mb-1">{pr.exercise}</h3>

              <p className="text-sm text-gray-500 mb-5">
                {pr.bestWeightWorkout?.muscleGroup || "Unknown Muscle Group"}
              </p>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-2xl p-4">
                  <p className="text-sm font-bold">Heaviest Lift</p>
                  <p className="text-2xl font-black mt-1">
                    {pr.bestWeight} lbs
                  </p>
                </div>

                <div className="bg-purple-100 text-purple-700 rounded-2xl p-4">
                  <p className="text-sm font-bold">Best Volume</p>
                  <p className="text-2xl font-black mt-1">
                    {pr.bestVolume}
                  </p>
                </div>

                <div className="bg-green-100 text-green-700 rounded-2xl p-4">
                  <p className="text-sm font-bold">Best Score</p>
                  <p className="text-2xl font-black mt-1">
                    {pr.bestPoints} pts
                  </p>
                </div>
              </div>

              <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-4">
                <p className="font-black mb-2">Latest PR Details</p>

                <p className="text-sm text-gray-600">
                  Best score workout: {pr.bestPointsWorkout?.sets} sets •{" "}
                  {pr.bestPointsWorkout?.reps} reps •{" "}
                  {pr.bestPointsWorkout?.weight} lbs
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Date:{" "}
                  {pr.bestPointsWorkout?.createdAt
                    ? new Date(pr.bestPointsWorkout.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PRTracker;