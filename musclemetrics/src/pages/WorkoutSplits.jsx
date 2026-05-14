import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const exerciseLibrary = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
    "Dumbbell Press",
    "Incline Dumbbell Press",
    "Chest Fly",
    "Cable Fly",
    "Pec Deck",
    "Push Ups",
    "Dips",
    "Machine Chest Press",
    "Smith Machine Bench Press",
  ],

  Back: [
    "Pull Ups",
    "Chin Ups",
    "Lat Pulldown",
    "Close Grip Pulldown",
    "Barbell Row",
    "Dumbbell Row",
    "Seated Row",
    "T-Bar Row",
    "Deadlift",
    "Rack Pull",
    "Face Pull",
    "Straight Arm Pulldown",
  ],

  Legs: [
    "Squats",
    "Front Squats",
    "Leg Press",
    "Lunges",
    "Walking Lunges",
    "Romanian Deadlift",
    "Leg Curl",
    "Leg Extension",
    "Calf Raises",
    "Hip Thrust",
    "Bulgarian Split Squat",
    "Hack Squat",
  ],

  Shoulders: [
    "Shoulder Press",
    "Dumbbell Shoulder Press",
    "Arnold Press",
    "Lateral Raises",
    "Front Raises",
    "Rear Delt Fly",
    "Face Pull",
    "Shrugs",
    "Upright Row",
    "Machine Shoulder Press",
    "Cable Lateral Raise",
    "Reverse Pec Deck",
  ],

  Arms: [
    "Bicep Curl",
    "Hammer Curl",
    "Preacher Curl",
    "Cable Curl",
    "Concentration Curl",
    "Tricep Pushdown",
    "Skull Crushers",
    "Overhead Tricep Extension",
    "Close Grip Bench Press",
    "Dips",
    "EZ Bar Curl",
    "Rope Pushdown",
  ],

  Core: [
    "Plank",
    "Crunches",
    "Leg Raises",
    "Hanging Leg Raises",
    "Russian Twists",
    "Cable Crunch",
    "Sit Ups",
    "Mountain Climbers",
    "Ab Wheel Rollout",
    "Bicycle Crunches",
    "Side Plank",
    "Reverse Crunch",
  ],
};

function WorkoutSplits({ refresh, setRefresh, setActivePage }) {
  const [splits, setSplits] = useState([]);
  const [splitName, setSplitName] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [splitExercises, setSplitExercises] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const userId = user?._id || user?.id;

  const API = "http://localhost:5000";

  useEffect(() => {
    fetchSplits();
  }, [refresh]);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchSplits = async () => {
    try {
      if (!userId) return;

      const response = await fetch(`${API}/api/splits/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Could not fetch splits.");
        return;
      }

      setSplits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch splits.");
    }
  };

  const handlePositiveNumber = (value, setter) => {
    if (value === "") return setter("");

    if (Number(value) < 1) {
      return setter("1");
    }

    setter(value);
  };

  const addExerciseToSplit = () => {
    if (
      !selectedMuscleGroup ||
      !selectedExercise ||
      !targetSets ||
      !targetReps
    ) {
      toast.error("Choose exercise, sets, and reps first.");
      return;
    }

    setSplitExercises([
      ...splitExercises,
      {
        muscleGroup: selectedMuscleGroup,
        exercise: selectedExercise,
        targetSets: Number(targetSets),
        targetReps: Number(targetReps),
      },
    ]);

    setSelectedMuscleGroup("");
    setSelectedExercise("");
    setTargetSets("");
    setTargetReps("");

    toast.success("Exercise added to split.");
  };

  const removeExerciseFromSplit = (indexToRemove) => {
    setSplitExercises(
      splitExercises.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCreateSplit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not found.");
      return;
    }

    if (!splitName.trim()) {
      toast.error("Enter split name.");
      return;
    }

    if (splitExercises.length === 0) {
      toast.error("Add at least one exercise.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/splits`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: splitName,
          exercises: splitExercises,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Split not created.");
        return;
      }

      toast.success("Workout split saved!");

      setSplitName("");
      setSplitExercises([]);

      if (setRefresh) {
        setRefresh((prev) => prev + 1);
      }

      fetchSplits();
    } catch (error) {
      console.error(error);
      toast.error("Could not create split.");
    }
  };

  const deleteSplit = async (splitId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this split?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/api/splits/${splitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Could not delete split.");
        return;
      }

      toast.success("Split deleted.");
      fetchSplits();

      if (setRefresh) {
        setRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Delete failed.");
    }
  };

  const startSplit = (split) => {
    localStorage.setItem("activeSplit", JSON.stringify(split));
    localStorage.setItem("activeSplitStartedAt", String(Date.now()));
    localStorage.setItem("activeSplitInputs", JSON.stringify({}));

    toast.success(`${split.name} started!`);

    if (setActivePage) {
      setActivePage("log");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-blue-600 font-semibold text-sm">
          Training Plan
        </p>

        <h2 className="text-4xl font-black tracking-tight">
          Workout Splits
        </h2>

        <p className="text-gray-500 mt-2">
          Create reusable workout splits with target sets and reps.
        </p>
      </div>

      <form
        onSubmit={handleCreateSplit}
        className="bg-gray-50 border border-gray-200 rounded-3xl p-6 mb-8"
      >
        <h3 className="text-2xl font-black mb-4">
          Create New Split
        </h3>

        <input
          className="w-full bg-white border border-gray-200 p-4 rounded-2xl mb-6 outline-none focus:ring-4 focus:ring-blue-100"
          placeholder="Split Name: Push Day, Pull Day, Leg Day"
          value={splitName}
          onChange={(e) => setSplitName(e.target.value)}
          required
        />

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Choose Muscle Group
          </label>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(exerciseLibrary).map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => {
                  setSelectedMuscleGroup(group);
                  setSelectedExercise("");
                }}
                className={`p-4 rounded-2xl font-bold border transition ${
                  selectedMuscleGroup === group
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {selectedMuscleGroup && (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Choose Exercise
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exerciseLibrary[selectedMuscleGroup].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedExercise(item)}
                  className={`p-4 rounded-2xl font-bold border text-left transition ${
                    selectedExercise === item
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <input
            className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100"
            type="number"
            min="1"
            placeholder="Target Sets"
            value={targetSets}
            onChange={(e) =>
              handlePositiveNumber(e.target.value, setTargetSets)
            }
          />

          <input
            className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100"
            type="number"
            min="1"
            placeholder="Target Reps"
            value={targetReps}
            onChange={(e) =>
              handlePositiveNumber(e.target.value, setTargetReps)
            }
          />

          <button
            type="button"
            onClick={addExerciseToSplit}
            className="bg-slate-900 text-white py-4 rounded-2xl font-black"
          >
            Add Exercise
          </button>
        </div>

        {splitExercises.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xl font-black mb-3">
              Exercises in this Split
            </h4>

            <div className="space-y-3">
              {splitExercises.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-black">{item.exercise}</p>

                    <p className="text-sm text-gray-500">
                      {item.muscleGroup} • {item.targetSets} sets ×{" "}
                      {item.targetReps} reps
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExerciseFromSplit(index)}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl">
          Save Split For Later
        </button>
      </form>

      <h3 className="text-2xl font-black mb-4">Saved Splits</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {splits.map((split) => (
          <div
            key={split._id}
            className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm"
          >
            <h4 className="text-2xl font-black">{split.name}</h4>

            <div className="mt-4 space-y-3">
              {split.exercises?.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                >
                  <p className="font-black">{item.exercise}</p>

                  <p className="text-sm text-gray-500">
                    {item.muscleGroup} • {item.targetSets} sets ×{" "}
                    {item.targetReps} reps
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                type="button"
                onClick={() => startSplit(split)}
                className="bg-slate-900 text-white py-3 rounded-2xl font-black"
              >
                Start Split
              </button>

              <button
                type="button"
                onClick={() => deleteSplit(split._id)}
                className="bg-red-100 text-red-600 py-3 rounded-2xl font-black"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {splits.length === 0 && (
          <p className="text-gray-500">
            No splits yet. Create your first split.
          </p>
        )}
      </div>
    </div>
  );
}

export default WorkoutSplits;