import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import API from "../config/api";

function ActivityFeed({ refresh, openProfile }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchActivities();
  }, [userId, refresh]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/activity/${userId}`);
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Activity feed error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (u) => u?.name || u?.username || u?.email?.split("@")[0] || "User";
  const getUserHandle = (u) => u?.username || u?.email?.split("@")[0] || "user";
  const getProfileImage = (u) => u?.profilePicture || "https://via.placeholder.com/80?text=U";

  const formatTimeAgo = (dateValue) => {
    if (!dateValue) return "";
    const seconds = Math.floor((new Date() - new Date(dateValue)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const muscleColors = {
    Chest: "bg-red-100 text-red-700",
    Back: "bg-blue-100 text-blue-700",
    Legs: "bg-emerald-100 text-emerald-700",
    Shoulders: "bg-purple-100 text-purple-700",
    Arms: "bg-orange-100 text-orange-700",
    Core: "bg-yellow-100 text-yellow-700",
    Cardio: "bg-pink-100 text-pink-700",
    FullBody: "bg-indigo-100 text-indigo-700",
  };

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-5 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="relative z-10">
          <p className="text-blue-300 font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <Newspaper className="h-4 w-4" /> Social Fitness Feed
          </p>
          <h1 className="text-3xl md:text-6xl font-black mt-2">Friend Activity</h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">Tap any user to open their profile.</p>
        </div>
      </section>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-[2rem] h-40" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 text-center shadow-xl">
          <p className="text-5xl mb-3">🏋️</p>
          <h2 className="text-2xl md:text-3xl font-black">No friend activity yet</h2>
          <p className="text-gray-500 mt-2 text-sm">Follow more users to see their workouts here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
          {activities.map((activity) => {
            const muscleGroup = activity.stats?.muscleGroup;
            const badgeClass = muscleColors[muscleGroup] || "bg-gray-100 text-gray-700";

            return (
              <div key={activity._id} className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-xl hover:shadow-2xl transition">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => openProfile?.(activity.user?._id)} className="shrink-0">
                    <img
                      src={getProfileImage(activity.user)}
                      alt="profile"
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-gray-100 shadow"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => openProfile?.(activity.user?._id)}
                      className="text-left hover:text-blue-600 transition"
                    >
                      <p className="font-black text-base md:text-lg leading-tight truncate">{getUserName(activity.user)}</p>
                      <p className="text-xs text-gray-500 truncate">@{getUserHandle(activity.user)}</p>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {muscleGroup && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black hidden sm:inline-flex ${badgeClass}`}>
                        {muscleGroup}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-bold whitespace-nowrap">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Activity content */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 border rounded-2xl p-4">
                  <p className="font-black text-sm md:text-base">
                    🔥 {activity.activityText || "logged a workout"}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {[
                      { label: "Muscle", value: activity.stats?.muscleGroup || "—" },
                      { label: "Points", value: activity.stats?.points || 0 },
                      { label: "Volume", value: Number(activity.stats?.volume || 0).toLocaleString() },
                      { label: "Streak", value: `${activity.user?.streak || 0}d` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-xl p-2.5 border text-center">
                        <p className="text-[10px] text-gray-500 font-bold">{label}</p>
                        <p className="font-black text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openProfile?.(activity.user?._id)}
                  className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs md:text-sm hover:bg-slate-800 transition"
                >
                  View Profile
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
