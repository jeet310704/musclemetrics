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
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) { setWorkouts([]); return; }
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Dashboard workouts error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const todayKey = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayWorkouts = workouts.filter(
      (item) => new Date(item.createdAt).toISOString().split("T")[0] === todayKey
    );
    const totalVolume = workouts.reduce((sum, item) => sum + Number(item.volume || 0), 0);
    const totalPoints = workouts.reduce((sum, item) => sum + Number(item.points || 0), 0);
    const todayVolume = todayWorkouts.reduce((sum, item) => sum + Number(item.volume || 0), 0);
    const muscleMap = workouts.reduce((acc, item) => {
      const muscle = item.muscleGroup || "Other";
      acc[muscle] = (acc[muscle] || 0) + 1;
      return acc;
    }, {});
    const favoriteMuscle =
      Object.entries(muscleMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data";
    const bestLift = workouts.reduce(
      (best, item) => (Number(item.weight || 0) > Number(best.weight || 0) ? item : best),
      {}
    );
    return { totalWorkouts: workouts.length, todayWorkouts: todayWorkouts.length, totalVolume, totalPoints, todayVolume, favoriteMuscle, bestLift };
  }, [workouts, todayKey]);

  const recentWorkouts = workouts.slice(0, 6);

  const statCards = [
    { label: "Today", value: stats.todayWorkouts, sub: "workouts", icon: Zap, color: "emerald" },
    { label: "All Time", value: stats.totalWorkouts, sub: "workouts", icon: Dumbbell, color: "blue" },
    { label: "Volume", value: Number(stats.totalVolume || 0).toLocaleString(), sub: "lbs lifted", icon: TrendingUp, color: "purple" },
    { label: "Points", value: stats.totalPoints, sub: "earned", icon: Flame, color: "orange" },
  ];

  const colorMap = {
    emerald: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    blue: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
    purple: { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-100" },
    orange: { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-100" },
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-5 md:space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-slate-950 via-zinc-900 to-emerald-950 p-5 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 md:h-72 md:w-72 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-end">
          <div className="lg:col-span-2">
            <p className="text-emerald-400 font-black text-sm tracking-wide">
              {getGreeting()}, {user?.username || user?.name || "Athlete"} 👋
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mt-2 leading-tight">
              Build your next<br className="hidden md:block" /> streak.
            </h1>
            <p className="text-zinc-400 mt-3 max-w-xl text-sm md:text-base">
              Track your lifts, beat your records, and keep your training momentum going.
            </p>

            <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-6">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3">
                <p className="text-xs text-zinc-400 font-bold">Favorite</p>
                <p className="text-lg md:text-2xl font-black">{stats.favoriteMuscle}</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3">
                <p className="text-xs text-zinc-400 font-bold">Today Vol.</p>
                <p className="text-lg md:text-2xl font-black">{Number(stats.todayVolume || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3">
                <p className="text-xs text-zinc-400 font-bold">Best Lift</p>
                <p className="text-lg md:text-2xl font-black">
                  {stats.bestLift?.exercise ? `${stats.bestLift.weight} lbs` : "No PR yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 backdrop-blur-xl">
            <p className="text-zinc-400 text-xs font-black uppercase tracking-wider">Daily Goal</p>
            <h3 className="text-2xl md:text-3xl font-black mt-2">
              {recentWorkouts[0]?.muscleGroup || "Start Training"}
            </h3>
            <p className="text-zinc-400 text-sm mt-1">
              {recentWorkouts[0]?.exercise
                ? `Last: ${recentWorkouts[0].exercise}`
                : "Log your first workout today."}
            </p>
            <div className="mt-4 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, stats.todayWorkouts * 25)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {Math.min(100, stats.todayWorkouts * 25)}% of daily goal
            </p>
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : (
          statCards.map((card) => {
            const Icon = card.icon;
            const c = colorMap[card.color];
            return (
              <div
                key={card.label}
                className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-sm hover:shadow-lg transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs md:text-sm font-black">{card.label}</p>
                    <p className="text-2xl md:text-4xl font-black mt-1 truncate">{card.value}</p>
                    <p className="text-gray-400 text-xs md:text-sm font-bold mt-0.5">{card.sub}</p>
                  </div>
                  <div className={`h-10 w-10 md:h-12 md:w-12 rounded-2xl ${c.bg} text-white flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Recent workouts + Quick actions */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-6">
        <div className="xl:col-span-2 bg-white border rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black">Recent Workouts</h2>
              <p className="text-gray-500 text-sm">Your latest training activity.</p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-black flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Live
            </span>
          </div>

          {loading ? (
            <ListSkeleton rows={4} />
          ) : recentWorkouts.length === 0 ? (
            <div className="bg-gray-50 border rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 text-center">
              <Dumbbell className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 text-slate-300" />
              <h3 className="text-xl md:text-2xl font-black">No workouts yet</h3>
              <p className="text-gray-500 mt-2 text-sm">Log your first workout to start building your dashboard.</p>
              <button
                onClick={() => setActivePage?.("log")}
                className="mt-4 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition"
              >
                Log First Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 md:space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout._id}
                  className="bg-gray-50 border rounded-2xl p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-100 transition"
                >
                  <div className="min-w-0">
                    <p className="text-lg md:text-xl font-black truncate">{workout.exercise}</p>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {workout.muscleGroup} · {formatDate(workout.createdAt)}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0">
                    {[
                      { label: "Sets", value: workout.sets },
                      { label: "Wt", value: `${workout.weight}lb` },
                      { label: "Pts", value: workout.points || 0 },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white border rounded-xl p-2 text-center">
                        <p className="text-[10px] text-gray-500 font-bold">{label}</p>
                        <p className="font-black text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-xl">
            <p className="text-emerald-400 font-black text-xs uppercase tracking-wider">Quick Actions</p>
            <h2 className="text-2xl md:text-3xl font-black mt-2">Start faster</h2>
            <div className="grid gap-2.5 md:gap-3 mt-4 md:mt-5">
              {[
                { id: "log", Icon: Dumbbell, label: "Log Workout", sub: "Record sets, reps, and PRs." },
                { id: "templates", Icon: ClipboardList, label: "Use Template", sub: "Start a saved training plan." },
                { id: "ai", Icon: Bot, label: "AI Coach", sub: "Get training suggestions." },
              ].map(({ id, Icon, label, sub }) => (
                <button
                  key={id}
                  onClick={() => setActivePage?.(id)}
                  className="text-left bg-white/[0.06] border border-white/10 rounded-2xl p-3.5 md:p-4 hover:bg-white/10 transition"
                >
                  <p className="font-black text-sm md:text-base flex items-center gap-2">
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                    {label}
                  </p>
                  <p className="text-xs md:text-sm text-zinc-400 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-xl">
            <p className="text-gray-500 font-black text-xs flex items-center gap-2 uppercase tracking-wider">
              <Target className="h-4 w-4" /> Training Identity
            </p>
            <h2 className="text-2xl md:text-3xl font-black mt-2">
              {stats.favoriteMuscle === "No data" ? "New Athlete" : `${stats.favoriteMuscle} Focus`}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Based on your logged workouts, this is your strongest training pattern.
            </p>
            <div className="mt-4 h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-2/3 bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
