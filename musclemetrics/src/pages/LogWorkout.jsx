import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../config/api";

const cardMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: "easeOut" },
};

const listMotion = (index = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, delay: index * 0.03 },
});

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

function LogWorkout({ onWorkoutAdded }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;
  const timerRef = useRef(null);

  const [activeTemplateName, setActiveTemplateName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [previousWorkouts, setPreviousWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [exerciseSearch, setExerciseSearch] = useState("");
  const [restSeconds, setRestSeconds] = useState(90);
  const [restRunning, setRestRunning] = useState(false);
  const [restPreset, setRestPreset] = useState(90);
  const [prResults, setPrResults] = useState([]);

  const allExercises = useMemo(() => {
    return Object.entries(exerciseOptions).flatMap(([muscleGroup, list]) =>
      list.map((exercise) => ({
        muscleGroup,
        exercise,
      }))
    );
  }, []);

  const filteredExercises = useMemo(() => {
    if (!exerciseSearch.trim()) return [];

    const query = exerciseSearch.toLowerCase();

    return allExercises
      .filter(
        (item) =>
          item.exercise.toLowerCase().includes(query) ||
          item.muscleGroup.toLowerCase().includes(query)
      )
      .slice(0, 12);
  }, [exerciseSearch, allExercises]);

  const createEmptyExercise = () => ({
    muscleGroup: "Chest",
    exercise: "Bench Press",
    sets: [
      {
        setNumber: 1,
        reps: 10,
        weight: 0,
        completed: false,
      },
    ],
  });

  useEffect(() => {
    loadActiveTemplate();
  }, []);

  useEffect(() => {
    if (userId) fetchPreviousWorkouts();
  }, [userId]);

  useEffect(() => {
    if (!restRunning) return;

    timerRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setRestRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [restRunning]);

  useEffect(() => {
    setPrResults(detectPRs());
  }, [exercises, previousWorkouts]);

  const loadActiveTemplate = () => {
    const savedTemplate = localStorage.getItem("activeTemplate");

    if (!savedTemplate) {
      setExercises([createEmptyExercise()]);
      return;
    }

    try {
      const template = JSON.parse(savedTemplate);
      setActiveTemplateName(template.name || "Saved Template");

      const loadedExercises = (template.exercises || []).map((item) => {
        const targetSets = Number(item.targetSets || item.sets || 3);
        const targetReps = Number(item.targetReps || item.reps || 10);
        const targetWeight = Number(item.targetWeight || item.weight || 0);

        return {
          muscleGroup: item.muscleGroup || "Chest",
          exercise:
            item.exercise ||
            exerciseOptions[item.muscleGroup]?.[0] ||
            "Bench Press",
          sets: Array.from({ length: targetSets }, (_, index) => ({
            setNumber: index + 1,
            reps: targetReps,
            weight: targetWeight,
            completed: false,
          })),
        };
      });

      setExercises(
        loadedExercises.length > 0 ? loadedExercises : [createEmptyExercise()]
      );
    } catch (error) {
      console.error("Template load error:", error.message);
      setExercises([createEmptyExercise()]);
    }
  };

  const fetchPreviousWorkouts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/workouts/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPreviousWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Previous workouts error:", error.message);
    }
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, createEmptyExercise()]);
  };

  const addExerciseFromSearch = (selected) => {
    setExercises((prev) => [
      ...prev,
      {
        muscleGroup: selected.muscleGroup,
        exercise: selected.exercise,
        sets: [
          {
            setNumber: 1,
            reps: 10,
            weight: 0,
            completed: false,
          },
        ],
      },
    ]);

    setExerciseSearch("");
  };

  const removeExercise = (exerciseIndex) => {
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
  };

  const updateExercise = (exerciseIndex, field, value) => {
    setExercises((prev) =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item;

        if (field === "muscleGroup") {
          return {
            ...item,
            muscleGroup: value,
            exercise: exerciseOptions[value]?.[0] || "",
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const addSet = (exerciseIndex) => {
    setExercises((prev) =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item;

        const currentSets = Array.isArray(item.sets) ? item.sets : [];
        const lastSet = currentSets[currentSets.length - 1] || {
          reps: 10,
          weight: 0,
        };

        return {
          ...item,
          sets: [
            ...currentSets,
            {
              setNumber: currentSets.length + 1,
              reps: lastSet.reps,
              weight: lastSet.weight,
              completed: false,
            },
          ],
        };
      })
    );
  };

  const removeSet = (exerciseIndex, setIndex) => {
    setExercises((prev) =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item;

        const currentSets = Array.isArray(item.sets) ? item.sets : [];

        const updatedSets = currentSets
          .filter((_, sIndex) => sIndex !== setIndex)
          .map((set, index) => ({
            ...set,
            setNumber: index + 1,
          }));

        return {
          ...item,
          sets:
            updatedSets.length > 0
              ? updatedSets
              : [{ setNumber: 1, reps: 10, weight: 0, completed: false }],
        };
      })
    );
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setExercises((prev) =>
      prev.map((item, i) => {
        if (i !== exerciseIndex) return item;

        const currentSets = Array.isArray(item.sets) ? item.sets : [];

        return {
          ...item,
          sets: currentSets.map((set, sIndex) => {
            if (sIndex !== setIndex) return set;

            return {
              ...set,
              [field]:
                field === "completed"
                  ? Boolean(value)
                  : Math.max(0, Number(value || 0)),
            };
          }),
        };
      })
    );
  };

  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const currentSet = exercises[exerciseIndex]?.sets?.[setIndex];

    updateSet(exerciseIndex, setIndex, "completed", !currentSet?.completed);

    if (!currentSet?.completed) {
      startRestTimer(restPreset);
    }
  };

  const clearTemplate = () => {
    localStorage.removeItem("activeTemplate");
    setActiveTemplateName("");
    setExercises([createEmptyExercise()]);
  };

  const getExerciseVolume = (item) => {
    if (!Array.isArray(item.sets)) {
      return (
        Number(item.sets || 0) *
        Number(item.reps || 0) *
        Number(item.weight || 0)
      );
    }

    return item.sets.reduce((sum, set) => {
      return sum + Number(set.reps || 0) * Number(set.weight || 0);
    }, 0);
  };

  const totalVolume = exercises.reduce((sum, item) => {
    return sum + getExerciseVolume(item);
  }, 0);

  const totalSets = exercises.reduce((sum, item) => {
    if (Array.isArray(item.sets)) return sum + item.sets.length;
    return sum + Number(item.sets || 0);
  }, 0);

  const completedSets = exercises.reduce((sum, item) => {
    if (!Array.isArray(item.sets)) return sum;
    return sum + item.sets.filter((set) => set.completed).length;
  }, 0);

  const getBestPreviousStats = (exerciseName) => {
    const matching = previousWorkouts.filter(
      (workout) =>
        workout.exercise?.toLowerCase() === exerciseName?.toLowerCase()
    );

    if (matching.length === 0) {
      return {
        bestWeight: 0,
        bestVolume: 0,
      };
    }

    return {
      bestWeight: Math.max(...matching.map((w) => Number(w.weight || 0))),
      bestVolume: Math.max(...matching.map((w) => Number(w.volume || 0))),
    };
  };

  const detectPRs = () => {
    const prs = [];

    exercises.forEach((item) => {
      if (!item.exercise) return;

      const currentBestWeight = Math.max(
        ...(item.sets || []).map((set) => Number(set.weight || 0))
      );

      const currentVolume = getExerciseVolume(item);
      const previous = getBestPreviousStats(item.exercise);

      if (currentBestWeight > 0 && currentBestWeight > previous.bestWeight) {
        prs.push({
          type: "Weight PR",
          exercise: item.exercise,
          oldValue: previous.bestWeight,
          newValue: currentBestWeight,
          unit: "lbs",
        });
      }

      if (currentVolume > 0 && currentVolume > previous.bestVolume) {
        prs.push({
          type: "Volume PR",
          exercise: item.exercise,
          oldValue: previous.bestVolume,
          newValue: currentVolume,
          unit: "volume",
        });
      }
    });

    return prs;
  };

  const startRestTimer = (seconds = restPreset) => {
    clearInterval(timerRef.current);
    setRestSeconds(seconds);
    setRestRunning(true);
  };

  const pauseRestTimer = () => {
    clearInterval(timerRef.current);
    setRestRunning(false);
  };

  const resetRestTimer = (seconds = restPreset) => {
    clearInterval(timerRef.current);
    setRestSeconds(seconds);
    setRestRunning(false);
  };

  const formatRestTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const saveWorkout = async () => {
    if (!userId) {
      alert("Please login again.");
      return;
    }

    const validExercises = exercises.filter(
      (item) => item.exercise?.trim() && item.muscleGroup?.trim()
    );

    if (validExercises.length === 0) {
      alert("Add at least one exercise.");
      return;
    }

    try {
      setLoading(true);

      for (const item of validExercises) {
        const currentSets = Array.isArray(item.sets) ? item.sets : [];

        const totalReps = currentSets.reduce((sum, set) => {
          return sum + Number(set.reps || 0);
        }, 0);

        const maxWeight =
          currentSets.length > 0
            ? Math.max(...currentSets.map((set) => Number(set.weight || 0)))
            : 0;

        const payload = {
          splitId: null,
          splitName: activeTemplateName || "No Split",
          exercise: item.exercise,
          muscleGroup: item.muscleGroup,
          sets: currentSets.length || 1,
          reps: totalReps || 1,
          weight: maxWeight,
          setDetails: currentSets.map((set, index) => ({
            setNumber: index + 1,
            reps: Number(set.reps || 0),
            weight: Number(set.weight || 0),
          })),
          duration: 1,
        };

        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/api/workouts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Error saving workout.");
          return;
        }
      }

      localStorage.removeItem("activeTemplate");
      setActiveTemplateName("");
      setExercises([createEmptyExercise()]);
      await fetchPreviousWorkouts();

      if (prResults.length > 0) {
        alert(`Workout saved! New PRs detected: ${prResults.length}`);
      } else {
        alert("Workout logged successfully!");
      }

      onWorkoutAdded?.();
    } catch (error) {
      console.error("Save workout error:", error.message);
      alert("Backend connection error.");
    } finally {
      setLoading(false);
    }
  };

    if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-6 pb-24">
      <motion.section
        {...cardMotion}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 md:p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-6 items-center">
          <div className="xl:col-span-2">
            <p className="text-blue-200 font-black">Active Workout</p>

            <h1 className="text-4xl md:text-6xl font-black mt-2 leading-tight">
              Log your session
            </h1>

            <p className="text-slate-300 mt-3 max-w-xl">
              Search exercises, complete each set, track rest, and detect PRs as
              you train.
            </p>

            <AnimatePresence>
              {activeTemplateName && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-5 inline-flex flex-col md:flex-row md:items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-4"
                >
                  <div>
                    <p className="text-sm text-blue-200 font-bold">
                      Active Template
                    </p>
                    <p className="text-2xl font-black">
                      {activeTemplateName}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={clearTemplate}
                    className="bg-white text-red-600 px-4 py-2 rounded-xl font-black hover:bg-red-50"
                  >
                    Clear
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            whileHover={{ scale: 1.015 }}
            className="bg-white/10 border border-white/10 rounded-[2rem] p-5 backdrop-blur-xl"
          >
            <p className="text-blue-200 font-bold">Rest Timer</p>

            <motion.p
              key={restSeconds}
              initial={{ scale: 0.96, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black text-center my-5"
            >
              {formatRestTime(restSeconds)}
            </motion.p>

            <p
              className={`text-center font-black ${
                restRunning ? "text-green-300" : "text-slate-300"
              }`}
            >
              {restRunning ? "Resting..." : "Paused"}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-5">
              {[60, 90, 120].map((seconds) => (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  key={seconds}
                  onClick={() => {
                    setRestPreset(seconds);
                    resetRestTimer(seconds);
                  }}
                  className={`p-3 rounded-xl font-black ${
                    restPreset === seconds
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {seconds}s
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startRestTimer(restSeconds || restPreset)}
                className="bg-green-500 text-white py-3 rounded-xl font-black"
              >
                Start
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseRestTimer}
                className="bg-white/10 text-white py-3 rounded-xl font-black"
              >
                Pause
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => resetRestTimer(restPreset)}
                className="bg-red-500/90 text-white py-3 rounded-xl font-black"
              >
                Reset
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Exercises", exercises.length],
          ["Sets Done", `${completedSets}/${totalSets}`],
          ["Volume", totalVolume.toLocaleString()],
          ["Live PRs", prResults.length],
        ].map(([label, value], index) => (
          <motion.div
            key={label}
            {...listMotion(index)}
            whileHover={{ scale: 1.03, y: -4 }}
            className="rounded-3xl border bg-white p-5 shadow"
          >
            <p className="text-gray-500 text-sm font-bold">{label}</p>
            <p className="text-4xl font-black mt-1">{value}</p>
          </motion.div>
        ))}
      </section>

      <motion.section
        {...cardMotion}
        className="bg-white border rounded-[2rem] p-5 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-3xl font-black">Workout Builder</h2>
            <p className="text-gray-500 text-sm">
              Add exercises quickly or use the dropdowns inside each card.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={addExercise}
            className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800"
          >
            + Add Exercise
          </motion.button>
        </div>

        <div className="relative mb-6">
          <label className="text-xs text-gray-500 font-bold">
            Fast Exercise Search
          </label>

          <input
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            placeholder="Search bench, squat, curl, treadmill..."
            className="mt-1 w-full p-4 rounded-2xl bg-gray-100 border outline-none focus:border-blue-500"
          />

          <AnimatePresence>
            {filteredExercises.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute left-0 right-0 top-[76px] bg-white border rounded-2xl shadow-2xl z-20 overflow-hidden"
              >
                {filteredExercises.map((item, index) => (
                  <motion.button
                    {...listMotion(index)}
                    key={`${item.muscleGroup}-${item.exercise}`}
                    onClick={() => addExerciseFromSearch(item)}
                    className="w-full text-left p-3 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span className="font-bold">{item.exercise}</span>
                    <span className="text-sm text-gray-500">
                      {item.muscleGroup}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-5">
          <AnimatePresence>
            {exercises.map((item, exerciseIndex) => (
              <motion.div
                key={`${item.exercise}-${exerciseIndex}`}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.98 }}
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.22 }}
                className="rounded-[2rem] border bg-gray-50 p-4 md:p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-sm text-gray-500 font-black">
                      Exercise {exerciseIndex + 1}
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      {item.exercise || "New Exercise"}
                    </h3>

                    <p className="text-sm text-gray-500">{item.muscleGroup}</p>
                  </div>

                  {exercises.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => removeExercise(exerciseIndex)}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-black hover:bg-red-200"
                    >
                      Remove
                    </motion.button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="text-xs text-gray-500 font-bold">
                      Muscle Group
                    </label>

                    <select
                      value={item.muscleGroup}
                      onChange={(e) =>
                        updateExercise(
                          exerciseIndex,
                          "muscleGroup",
                          e.target.value
                        )
                      }
                      className="mt-1 w-full p-3 rounded-xl bg-white border outline-none focus:border-blue-500"
                    >
                      {Object.keys(exerciseOptions).map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold">
                      Exercise Name
                    </label>

                    <select
                      value={item.exercise}
                      onChange={(e) =>
                        updateExercise(
                          exerciseIndex,
                          "exercise",
                          e.target.value
                        )
                      }
                      className="mt-1 w-full p-3 rounded-xl bg-white border outline-none focus:border-blue-500"
                    >
                      {(exerciseOptions[item.muscleGroup] || []).map(
                        (exercise) => (
                          <option key={exercise} value={exercise}>
                            {exercise}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="bg-white border rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-5 gap-2 bg-gray-100 p-3 text-xs font-black text-gray-500">
                    <p>Done</p>
                    <p>Set</p>
                    <p>Reps</p>
                    <p>Weight</p>
                    <p>Action</p>
                  </div>

                  <AnimatePresence>
                    {(Array.isArray(item.sets) ? item.sets : []).map(
                      (set, setIndex) => (
                        <motion.div
                          key={setIndex}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={`grid grid-cols-5 gap-2 p-3 border-t items-center ${
                            set.completed ? "bg-green-50" : "bg-white"
                          }`}
                        >
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() =>
                              toggleSetComplete(exerciseIndex, setIndex)
                            }
                            className={`w-9 h-9 rounded-xl font-black ${
                              set.completed
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {set.completed ? "✓" : ""}
                          </motion.button>

                          <p className="font-black">Set {setIndex + 1}</p>

                          <input
                            type="number"
                            min="0"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(
                                exerciseIndex,
                                setIndex,
                                "reps",
                                e.target.value
                              )
                            }
                            className="p-2 rounded-xl bg-gray-100 outline-none"
                          />

                          <input
                            type="number"
                            min="0"
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(
                                exerciseIndex,
                                setIndex,
                                "weight",
                                e.target.value
                              )
                            }
                            className="p-2 rounded-xl bg-gray-100 outline-none"
                          />

                          <button
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            className="bg-red-100 text-red-600 rounded-xl px-3 py-2 font-bold"
                          >
                            Remove
                          </button>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => addSet(exerciseIndex)}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-black hover:bg-blue-200"
                  >
                    + Add Set
                  </motion.button>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-white border rounded-2xl px-4 py-2"
                  >
                    <p className="text-xs text-gray-500 font-bold">
                      Exercise Volume
                    </p>
                    <p className="text-xl font-black">
                      {getExerciseVolume(item).toLocaleString()}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      <AnimatePresence>
        {prResults.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="bg-yellow-50 border border-yellow-200 rounded-[2rem] p-5 shadow"
          >
            <h2 className="text-2xl font-black text-yellow-700">
              Live PRs Detected 🏆
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {prResults.map((pr, index) => (
                <motion.div
                  key={`${pr.exercise}-${pr.type}-${index}`}
                  {...listMotion(index)}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white border rounded-2xl p-4"
                >
                  <p className="font-black">{pr.type}</p>
                  <p className="text-gray-700">{pr.exercise}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Old: {Number(pr.oldValue || 0).toLocaleString()} {pr.unit}
                  </p>
                  <p className="font-black">
                    New: {Number(pr.newValue || 0).toLocaleString()} {pr.unit}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-24 left-4 right-4 z-40 md:static md:z-auto"
      >
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          onClick={saveWorkout}
          disabled={loading}
          className="w-full px-8 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-60 shadow-2xl"
        >
          {loading ? "Saving..." : "Finish & Save Workout"}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default LogWorkout;