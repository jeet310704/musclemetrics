import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ProgressCharts({ refresh }) {
  const [workouts, setWorkouts] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const response = await fetch("http://localhost:5000/api/workouts");
        const data = await response.json();

        const userWorkouts = Array.isArray(data)
          ? data.filter((w) => w.userId?._id === user.id || w.userId === user.id)
          : [];

        setWorkouts(userWorkouts);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    };

    fetchWorkouts();
  }, [refresh]);

  const exerciseList = [...new Set(workouts.map((w) => w.exercise))];

  const filteredWorkouts = selectedExercise
    ? workouts.filter((w) => w.exercise === selectedExercise)
    : [];

  const chartData = filteredWorkouts
    .slice()
    .reverse()
    .map((w) => ({
      date: new Date(w.createdAt).toLocaleDateString(),
      weight: Number(w.weight || 0),
      volume: Number(w.volume || 0),
      points: Number(w.points || 0),
    }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-blue-600 font-semibold text-sm">Exercise Analytics</p>
        <h2 className="text-4xl font-black tracking-tight">Progress Charts</h2>
        <p className="text-gray-500 mt-2">
          Select an exercise and track weight, volume, and score progress over time.
        </p>
      </div>

      <select
        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-8 outline-none focus:ring-4 focus:ring-blue-100"
        value={selectedExercise}
        onChange={(e) => setSelectedExercise(e.target.value)}
      >
        <option value="">Select Exercise</option>
        {exerciseList.map((exercise) => (
          <option key={exercise} value={exercise}>
            {exercise}
          </option>
        ))}
      </select>

      {!selectedExercise ? (
        <p className="text-gray-500">Choose an exercise to view progress.</p>
      ) : chartData.length === 0 ? (
        <p className="text-gray-500">No data found for this exercise.</p>
      ) : (
        <div className="space-y-8">
          <div className="border border-gray-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xl font-black mb-4">Weight Progress</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-gray-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xl font-black mb-4">Volume Progress</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="#9333ea" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-gray-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xl font-black mb-4">Points Progress</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="#16a34a" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressCharts;