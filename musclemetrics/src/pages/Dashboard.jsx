import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Dumbbell,
  Flame,
  Zap,
  TrendingUp,
  Target,
  Bot,
  ClipboardList,
} from "lucide-react";
import { CardSkeleton, ListSkeleton } from "../components/Skeleton";
import API from "../config/api";

function Dashboard({ refresh, setActivePage }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;
  

  const getToken = () => localStorage.getItem("token");

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchWorkouts();
  }, [userId, refresh]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/workouts/me`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not load workouts.");
        setWorkouts([]);
        return;
      }

      setWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Dashboard workouts error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const todayKey = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayWorkouts = workouts.filter((item) => {
      return new Date(item.createdAt).toISOString().split("T")[0] === todayKey;
    });

    const totalVolume = workouts.reduce(
      (sum, item) => sum + Number(item.volume || 0),
      0
    );

    const totalPoints = workouts.reduce(
      (sum, item) => sum + Number(item.points || 0),
      0
    );

    const todayVolume = todayWorkouts.reduce(
      (sum, item) => sum + Number(item.volume || 0),
      0
    );

    const muscleMap = workouts.reduce((acc, item) => {
      const muscle = item.muscleGroup || "Other";
      acc[muscle] = (acc[muscle] || 0) + 1;
      return acc;
    }, {});

    const favoriteMuscle =
      Object.entries(muscleMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "No data";

    const bestLift = workouts.reduce((best, item) => {
      const weight = Number(item.weight || 0);
      return weight > Number(best.weight || 0) ? item : best;
    }, {});

    return {
      totalWorkouts: workouts.length,
      todayWorkouts: todayWorkouts.length,
      totalVolume,
      totalPoints,
      todayVolume,
      favoriteMuscle,
      bestLift,
    };
  }, [workouts, todayKey]);

  const recentWorkouts = workouts.slice(0, 6);

  const statCards = [
    {
      label: "Today",
      value: stats.todayWorkouts,
      sub: "workouts logged",
      icon: Zap,
    },
    {
      label: "Total Workouts",
      value: stats.totalWorkouts,
      sub: "all time",
      icon: Dumbbell,
    },
    {
      label: "Total Volume",
      value: Number(stats.totalVolume || 0).toLocaleString(),
      sub: "lbs moved",
      icon: TrendingUp,
    },
    {
      label: "Points",
      value: stats.totalPoints,
      sub: "earned",
      icon: Flame,
    },
  ];

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-zinc-900 to-emerald-950 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
          <div className="lg:col-span-2">
            <p className="text-emerald-300 font-black tracking-wide">
              {getGreeting()}, {user?.username || user?.name || "Athlete"}
            </p>

            <h1 className="text-4xl md:text-6xl font-black mt-2 leading-tight">
              Build your next streak.
            </h1>

            <p className="text-zinc-300 mt-4 max-w-xl">
              Track your lifts, beat your records, and keep your training
              momentum going.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                <p className="text-sm text-zinc-300 font-bold">Favorite</p>
                <p className="text-2xl font-black">{stats.favoriteMuscle}</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                <p className="text-sm text-zinc-300 font-bold">Today Volume</p>
                <p className="text-2xl font-black">
                  {Number(stats.todayVolume || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                <p className="text-sm text-zinc-300 font-bold">Best Lift</p>
                <p className="text-2xl font-black">
                  {stats.bestLift?.exercise
                    ? `${stats.bestLift.weight} lbs`
                    : "No PR yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-[2rem] p-5 backdrop-blur-xl">
            <p className="text-zinc-400 text-sm font-black">Now Training</p>

            <h3 className="text-3xl font-black mt-2">
              {recentWorkouts[0]?.muscleGroup || "Start Workout"}
            </h3>

            <p className="text-zinc-400 mt-2">
              {recentWorkouts[0]?.exercise
                ? `Last: ${recentWorkouts[0].exercise}`
                : "Log your first workout today."}
            </p>

            <div className="mt-5 h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{
                  width: `${Math.min(100, stats.todayWorkouts * 25)}%`,
                }}
              />
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              Daily goal progress: {Math.min(100, stats.todayWorkouts * 25)}%
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="group bg-gradient-to-br from-white to-gray-50 border rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-gray-500 text-sm font-black">
                      {card.label}
                    </p>

                    <p className="text-3xl md:text-4xl font-black mt-1">
                      {card.value}
                    </p>

                    <p className="text-gray-400 text-sm font-bold mt-1">
                      {card.sub}
                    </p>
                  </div>

                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border rounded-[2rem] p-5 md:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-3xl font-black">Recent Workouts</h2>
              <p className="text-gray-500">Your latest training activity.</p>
            </div>

            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live
            </span>
          </div>

          {loading ? (
            <ListSkeleton rows={4} />
          ) : recentWorkouts.length === 0 ? (
            <div className="bg-gray-50 border rounded-[2rem] p-10 text-center">
              <Dumbbell className="h-14 w-14 mx-auto mb-3 text-slate-900" />

              <h3 className="text-2xl font-black">No workouts yet</h3>

              <p className="text-gray-500 mt-2">
                Log your first workout to start building your dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout._id}
                  className="bg-gray-50 border rounded-[2rem] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="text-xl font-black">{workout.exercise}</p>

                    <p className="text-gray-500 text-sm">
                      {workout.muscleGroup} • {formatDate(workout.createdAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                    <div className="bg-white border rounded-2xl p-3 text-center">
                      <p className="text-xs text-gray-500 font-bold">Sets</p>
                      <p className="font-black">{workout.sets}</p>
                    </div>

                    <div className="bg-white border rounded-2xl p-3 text-center">
                      <p className="text-xs text-gray-500 font-bold">Weight</p>
                      <p className="font-black">{workout.weight}</p>
                    </div>

                    <div className="bg-white border rounded-2xl p-3 text-center">
                      <p className="text-xs text-gray-500 font-bold">Pts</p>
                      <p className="font-black">{workout.points || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-[2rem] p-6 shadow-xl">
            <p className="text-emerald-300 font-black">Quick Actions</p>

            <h2 className="text-3xl font-black mt-2">Start faster</h2>

            <div className="grid gap-3 mt-5">
              <button
                onClick={() => setActivePage?.("log")}
                className="text-left bg-white/10 border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition"
              >
                <p className="font-black flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Log Workout
                </p>

                <p className="text-sm text-zinc-400">
                  Record sets, reps, and PRs.
                </p>
              </button>

              <button
                onClick={() => setActivePage?.("templates")}
                className="text-left bg-white/10 border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition"
              >
                <p className="font-black flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Use Template
                </p>

                <p className="text-sm text-zinc-400">
                  Start a saved training plan.
                </p>
              </button>

              <button
                onClick={() => setActivePage?.("ai")}
                className="text-left bg-white/10 border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition"
              >
                <p className="font-black flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Coach
                </p>

                <p className="text-sm text-zinc-400">
                  Get training suggestions.
                </p>
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-[2rem] p-6 shadow-xl">
            <p className="text-gray-500 font-black flex items-center gap-2">
              <Target className="h-5 w-5" />
              Training Identity
            </p>

            <h2 className="text-3xl font-black mt-2">
              {stats.favoriteMuscle === "No data"
                ? "New Athlete"
                : `${stats.favoriteMuscle} Focus`}
            </h2>

            <p className="text-gray-500 mt-3">
              Based on your logged workouts, this is your current strongest
              training pattern.
            </p>

            <div className="mt-5 h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-2/3 bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;