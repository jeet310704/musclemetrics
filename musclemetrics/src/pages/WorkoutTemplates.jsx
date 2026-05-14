import { useEffect, useState } from "react";
import API, { apiFetch } from "../config/api";

const exerciseOptions = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
    "Dumbbell Bench Press",
    "Incline Dumbbell Press",
    "Decline Dumbbell Press",
    "Chest Fly",
    "Cable Fly",
    "Pec Deck",
    "Push Ups",
    "Weighted Push Ups",
    "Machine Chest Press",
    "Smith Machine Bench Press",
    "Landmine Press",
    "Hex Press",
    "Svend Press",
    "Dips",
    "Incline Cable Fly",
    "Low Cable Fly",
    "High Cable Fly",
  ],
  Back: [
    "Pull Ups",
    "Weighted Pull Ups",
    "Lat Pulldown",
    "Close Grip Lat Pulldown",
    "Wide Grip Lat Pulldown",
    "Barbell Row",
    "Dumbbell Row",
    "T-Bar Row",
    "Cable Row",
    "Seated Cable Row",
    "Chest Supported Row",
    "Machine Row",
    "Deadlift",
    "Rack Pull",
    "Romanian Deadlift",
    "Straight Arm Pulldown",
    "Shrugs",
    "Face Pull",
    "Reverse Fly",
    "Single Arm Cable Row",
    "Meadows Row",
    "Inverted Row",
  ],
  Legs: [
    "Squat",
    "Front Squat",
    "Hack Squat",
    "Smith Machine Squat",
    "Leg Press",
    "Bulgarian Split Squat",
    "Lunges",
    "Walking Lunges",
    "Reverse Lunges",
    "Romanian Deadlift",
    "Stiff Leg Deadlift",
    "Leg Extension",
    "Leg Curl",
    "Seated Leg Curl",
    "Standing Leg Curl",
    "Lying Leg Curl",
    "Calf Raise",
    "Seated Calf Raise",
    "Hip Thrust",
    "Glute Bridge",
    "Step Ups",
    "Goblet Squat",
    "Sumo Deadlift",
    "Adductor Machine",
    "Abductor Machine",
  ],
  Shoulders: [
    "Overhead Press",
    "Seated Dumbbell Press",
    "Arnold Press",
    "Lateral Raise",
    "Cable Lateral Raise",
    "Front Raise",
    "Rear Delt Fly",
    "Face Pull",
    "Upright Row",
    "Machine Shoulder Press",
    "Barbell Shoulder Press",
    "Dumbbell Shoulder Press",
    "Shrugs",
    "Reverse Pec Deck",
    "Single Arm Lateral Raise",
    "Cable Front Raise",
    "Landmine Shoulder Press",
  ],
  Arms: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Hammer Curl",
    "Preacher Curl",
    "Cable Curl",
    "EZ Bar Curl",
    "Incline Dumbbell Curl",
    "Concentration Curl",
    "Spider Curl",
    "Tricep Pushdown",
    "Overhead Tricep Extension",
    "Skull Crushers",
    "Close Grip Bench Press",
    "Dips",
    "Single Arm Pushdown",
    "Rope Pushdown",
    "Reverse Curl",
    "Wrist Curl",
    "Reverse Wrist Curl",
    "Bayesian Curl",
    "Machine Curl",
  ],
  Core: [
    "Plank",
    "Side Plank",
    "Crunches",
    "Cable Crunch",
    "Leg Raises",
    "Hanging Leg Raises",
    "Russian Twists",
    "Mountain Climbers",
    "Ab Wheel Rollout",
    "Toe Touches",
    "Flutter Kicks",
    "Bicycle Crunches",
    "V-Ups",
    "Sit Ups",
    "Weighted Sit Ups",
    "Dead Bug",
    "Pallof Press",
    "Wood Choppers",
  ],
  Cardio: [
    "Treadmill",
    "Incline Walk",
    "Running",
    "Cycling",
    "StairMaster",
    "Rowing",
    "Jump Rope",
    "Elliptical",
    "Swimming",
    "HIIT Sprints",
    "Battle Ropes",
    "Sled Push",
    "Box Jumps",
    "Burpees",
  ],
  FullBody: [
    "Clean and Press",
    "Snatch",
    "Thrusters",
    "Kettlebell Swing",
    "Burpees",
    "Farmer Carry",
    "Push Press",
    "Sled Push",
    "Battle Ropes",
    "Turkish Get Up",
    "Medicine Ball Slam",
  ],
};

function WorkoutTemplates({ refresh, setRefresh, setActivePage }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;
  const token = localStorage.getItem("token");

  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [exercises, setExercises] = useState([]);
  const [templateSearch, setTemplateSearch] = useState("");

  useEffect(() => {
    if (userId) fetchTemplates();
  }, [userId, refresh]);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/api/templates/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error loading templates.");
        setTemplates([]);
        return;
      }

      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch templates error:", error.message);
      setError("Backend connection error while loading templates.");
    }
  };

  const resetForm = () => {
    setName("");
    setNotes("");
    setEditingId(null);
    setError("");
    setExercises([]);
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        muscleGroup: "Chest",
        exercise: "",
        targetSets: 3,
        targetReps: 10,
        targetWeight: 0,
      },
    ]);
  };

  const updateExercise = (index, field, value) => {
    setExercises((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "muscleGroup") {
          return {
            ...item,
            muscleGroup: value,
            exercise: "",
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const removeExercise = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const saveTemplate = async () => {
    setError("");

    if (!userId || !token) {
      setError("User not found. Please login again.");
      return;
    }

    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }

    if (exercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    const hasEmptyExercise = exercises.some((item) => !item.exercise?.trim());

    if (hasEmptyExercise) {
      setError("Please choose or type an exercise name for every row.");
      return;
    }

    const payload = {
      name,
      notes,
      exercises,
    };

    try {
      const url = editingId
        ? `${API}/api/templates/${editingId}`
        : `${API}/api/templates`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error saving template.");
        return;
      }

      resetForm();
      fetchTemplates();
      setRefresh?.((prev) => prev + 1);
    } catch (error) {
      setError("Backend connection error. Make sure backend is running.");
      console.error("Save template error:", error.message);
    }
  };

  const editTemplate = (template) => {
    setEditingId(template._id);
    setName(template.name);
    setNotes(template.notes || "");
    setError("");
    setExercises(template.exercises || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const duplicateTemplate = async (template) => {
    try {
      const res = await fetch(`${API}/api/templates`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: `${template.name} Copy`,
          notes: template.notes || "",
          exercises: template.exercises || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error duplicating template.");
        return;
      }

      fetchTemplates();
      setRefresh?.((prev) => prev + 1);
    } catch (error) {
      console.error("Duplicate template error:", error.message);
      setError("Backend connection error while duplicating template.");
    }
  };

  const deleteTemplate = async (templateId) => {
    const confirmDelete = window.confirm("Delete this template?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API}/api/templates/${templateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error deleting template.");
        return;
      }

      fetchTemplates();
      setRefresh?.((prev) => prev + 1);
    } catch (error) {
      console.error("Delete template error:", error.message);
      setError("Backend connection error while deleting template.");
    }
  };

  const startTemplate = (template) => {
    localStorage.setItem("activeTemplate", JSON.stringify(template));

    if (setActivePage) {
      setActivePage("log");
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const query = templateSearch.toLowerCase();

    return (
      template.name?.toLowerCase().includes(query) ||
      template.notes?.toLowerCase().includes(query) ||
      template.exercises?.some(
        (exercise) =>
          exercise.exercise?.toLowerCase().includes(query) ||
          exercise.muscleGroup?.toLowerCase().includes(query)
      )
    );
  });

  const totalSavedExercises = templates.reduce((sum, template) => {
    return sum + Number(template.exercises?.length || 0);
  }, 0);

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-900/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <p className="text-white/80 font-black">Workout Planning</p>

            <h1 className="text-4xl md:text-6xl font-black mt-2 leading-tight">
              Saved Templates
            </h1>

            <p className="text-white/90 mt-3 max-w-xl">
              Build reusable workouts, start them instantly, and reduce logging
              friction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 border border-white/20 rounded-3xl p-5">
              <p className="text-white/80 text-sm font-bold">Templates</p>
              <p className="text-4xl font-black mt-1">{templates.length}</p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-3xl p-5">
              <p className="text-white/80 text-sm font-bold">Exercises</p>
              <p className="text-4xl font-black mt-1">
                {totalSavedExercises}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-3xl font-black">
              {editingId ? "Edit Template" : "Create Template"}
            </h2>
            <p className="text-gray-500 text-sm">
              Add exercises with target sets, reps, and weight.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 rounded-2xl bg-gray-900 text-white font-black"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-3 mb-4 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs text-gray-500 font-bold">
              Template Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Push Day, Pull Day, Leg Day..."
              className="mt-1 w-full p-4 rounded-2xl bg-gray-100 border outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-bold">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="mt-1 w-full p-4 rounded-2xl bg-gray-100 border outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-[2rem] p-8 text-center">
            <p className="text-2xl font-black">No exercises added yet</p>
            <p className="text-gray-500 mt-2">
              Click below to start building this template.
            </p>

            <button
              type="button"
              onClick={addExercise}
              className="mt-5 px-6 py-3 rounded-2xl bg-slate-900 text-white font-black"
            >
              + Add First Exercise
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((item, index) => (
              <div
                key={index}
                className="rounded-[2rem] border bg-gray-50 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-black">
                      Exercise {index + 1}
                    </p>
                    <h3 className="text-xl font-black">
                      {item.exercise || "Choose exercise"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="bg-red-100 text-red-600 rounded-xl font-black px-4 py-2"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-bold">
                      Muscle
                    </label>
                    <select
                      value={item.muscleGroup}
                      onChange={(e) =>
                        updateExercise(index, "muscleGroup", e.target.value)
                      }
                      className="mt-1 w-full p-3 rounded-xl bg-white border outline-none"
                    >
                      {Object.keys(exerciseOptions).map((group) => (
                        <option key={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold">
                      Exercise
                    </label>
                    <input
                      list={`template-exercise-list-${index}`}
                      value={item.exercise}
                      onChange={(e) =>
                        updateExercise(index, "exercise", e.target.value)
                      }
                      placeholder="Search exercise..."
                      className="mt-1 w-full p-3 rounded-xl bg-white border outline-none"
                    />

                    <datalist id={`template-exercise-list-${index}`}>
                      {(exerciseOptions[item.muscleGroup] || []).map(
                        (exercise) => (
                          <option key={exercise} value={exercise} />
                        )
                      )}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold">
                      Sets
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.targetSets}
                      onChange={(e) =>
                        updateExercise(
                          index,
                          "targetSets",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1 w-full p-3 rounded-xl bg-white border outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold">
                      Reps
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.targetReps}
                      onChange={(e) =>
                        updateExercise(
                          index,
                          "targetReps",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1 w-full p-3 rounded-xl bg-white border outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold">
                      Weight
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.targetWeight}
                      onChange={(e) =>
                        updateExercise(
                          index,
                          "targetWeight",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1 w-full p-3 rounded-xl bg-white border outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            onClick={addExercise}
            className="px-5 py-3 rounded-2xl bg-gray-100 font-black hover:bg-gray-200"
          >
            + Add Exercise
          </button>

          <button
            type="button"
            onClick={saveTemplate}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700"
          >
            {editingId ? "Update Template" : "Save Template"}
          </button>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-3xl font-black">Your Templates</h2>
            <p className="text-gray-500 text-sm">
              Start, edit, duplicate, or delete saved workouts.
            </p>
          </div>

          <input
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            placeholder="Search templates..."
            className="p-3 rounded-2xl bg-gray-100 border outline-none focus:border-blue-500"
          />
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="bg-gray-50 border rounded-[2rem] p-8 text-center">
            <h3 className="text-2xl font-black">No templates found</h3>
            <p className="text-gray-500 mt-2">
              Create your first saved workout above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredTemplates.map((template) => (
              <div
                key={template._id}
                className="bg-gray-50 border rounded-[2rem] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black">{template.name}</h3>

                    {template.notes && (
                      <p className="text-gray-500 mt-1">{template.notes}</p>
                    )}
                  </div>

                  <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full">
                    {template.exercises?.length || 0} exercises
                  </span>
                </div>

                <div className="space-y-2 mt-5">
                  {template.exercises?.map((exercise, index) => (
                    <div
                      key={exercise._id || index}
                      className="bg-white rounded-2xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 border"
                    >
                      <div>
                        <p className="font-black">{exercise.exercise}</p>
                        <p className="text-sm text-gray-500">
                          {exercise.muscleGroup}
                        </p>
                      </div>

                      <p className="text-sm font-black text-gray-700">
                        {exercise.targetSets} × {exercise.targetReps}
                        {Number(exercise.targetWeight || 0) > 0
                          ? ` @ ${exercise.targetWeight} lbs`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => startTemplate(template)}
                    className="px-4 py-3 rounded-xl bg-green-600 text-white font-black"
                  >
                    Start
                  </button>

                  <button
                    type="button"
                    onClick={() => editTemplate(template)}
                    className="px-4 py-3 rounded-xl bg-blue-600 text-white font-black"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateTemplate(template)}
                    className="px-4 py-3 rounded-xl bg-gray-900 text-white font-black"
                  >
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteTemplate(template._id)}
                    className="px-4 py-3 rounded-xl bg-red-500 text-white font-black"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WorkoutTemplates;