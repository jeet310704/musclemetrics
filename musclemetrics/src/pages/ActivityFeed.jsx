import { useEffect, useState } from "react";

function ActivityFeed({ refresh, openProfile }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;
  const API = "http://localhost:5000";

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

  const getUserName = (u) =>
    u?.name || u?.username || u?.email?.split("@")[0] || "User";

  const getUserHandle = (u) =>
    u?.username || u?.email?.split("@")[0] || "user";

  const getProfileImage = (u) =>
    u?.profilePicture || "https://via.placeholder.com/80?text=U";

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

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 md:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <p className="text-blue-200 font-black">Social Fitness Feed</p>
          <h1 className="text-4xl md:text-6xl font-black mt-2">
            Friend Activity
          </h1>
          <p className="text-slate-300 mt-3">
            Tap any user to open their profile.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="bg-white border rounded-[2rem] p-8 text-center shadow">
          <p className="text-gray-500 font-black">Loading activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white border rounded-[2rem] p-8 text-center shadow-xl">
          <h2 className="text-3xl font-black">No friend activity yet</h2>
          <p className="text-gray-500 mt-2">
            Follow more users to see their workouts here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="bg-white border rounded-[2rem] p-5 shadow-xl"
            >
              <div className="flex items-start gap-4">
                <button onClick={() => openProfile?.(activity.user?._id)}>
                  <img
                    src={getProfileImage(activity.user)}
                    alt="profile"
                    className="w-16 h-16 rounded-2xl object-cover border shadow"
                  />
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        onClick={() => openProfile?.(activity.user?._id)}
                        className="text-xl font-black hover:text-blue-600"
                      >
                        {getUserName(activity.user)}
                      </button>
                      <p className="text-sm text-gray-500">
                        @{getUserHandle(activity.user)}
                      </p>
                    </div>

                    <p className="text-sm text-gray-400 font-bold">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>

                  <div className="mt-5 bg-gradient-to-br from-gray-50 to-blue-50 border rounded-3xl p-5">
                    <p className="text-lg font-black">
                      🔥 {activity.activityText || "logged a workout"}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500 font-bold">
                          Muscle
                        </p>
                        <p className="font-black">
                          {activity.stats?.muscleGroup || "-"}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500 font-bold">
                          Points
                        </p>
                        <p className="font-black">
                          {activity.stats?.points || 0}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500 font-bold">
                          Volume
                        </p>
                        <p className="font-black">
                          {Number(activity.stats?.volume || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500 font-bold">
                          Streak
                        </p>
                        <p className="font-black">
                          {activity.user?.streak || 0} days
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openProfile?.(activity.user?._id)}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-black"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;