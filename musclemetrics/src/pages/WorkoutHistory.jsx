import { useEffect, useState } from "react";

function WorkoutHistory({ refresh }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const userId = user?.id || user?._id;

        const response = await fetch(
          `http://localhost:5000/api/workouts/user/${userId}`
        );

        const data = await response.json();

        if (Array.isArray(data)) {
          setWorkouts(data);
        } else {
          setWorkouts([]);
        }
      } catch (error) {
        console.error("Error fetching workout history:", error);
      }
    };

    fetchWorkouts();
  }, [refresh]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-blue-600 font-semibold text-sm">
          Training Logs
        </p>

        <h2 className="text-4xl font-black tracking-tight">
          Workout History
        </h2>

        <p className="text-gray-500 mt-2">
          View all your saved workouts.
        </p>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
          <h3 className="text-2xl font-black">
            No workouts logged yet
          </h3>

          <p className="text-gray-500 mt-2">
            Save a workout to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {workouts.map((workout) => (
            <div
              key={workout._id}
              className="bg-gray-50 border border-gray-200 rounded-3xl p-6"
            >
              <h3 className="text-2xl font-black">
                {workout.exercise}
              </h3>

              <p className="text-gray-500 mt-1">
                {workout.splitName || "No Split"} •{" "}
                {workout.muscleGroup}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                <div className="bg-white rounded-2xl p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Sets
                  </p>

                  <p className="text-xl font-black">
                    {workout.sets}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Volume
                  </p>

                  <p className="text-xl font-black text-purple-600">
                    {workout.volume}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Points
                  </p>

                  <p className="text-xl font-black text-blue-600">
                    {workout.points}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Duration
                  </p>

                  <p className="text-xl font-black text-green-600">
                    {workout.duration}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkoutHistory;