import { useEffect, useState } from "react";
import API from "../config/api";

function GymSocial({ refresh, openProfile }) {
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const userId = storedUser?._id || storedUser?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (userId) fetchGymSocial();
  }, [userId, refresh]);

  const fetchGymSocial = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/social-gym/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load gym social.");
      }

      setData(result);
    } catch (error) {
      console.error("Gym social error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (user) => {
    return user?.name || user?.username || user?.email?.split("@")[0] || "User";
  };

  const getUserHandle = (user) => {
    return user?.username || user?.email?.split("@")[0] || "user";
  };

  const getProfileImage = (user) => {
    return user?.profilePicture || "https://via.placeholder.com/80?text=U";
  };

  const formatTimeAgo = (dateValue) => {
    if (!dateValue) return "";

    const seconds = Math.floor((new Date() - new Date(dateValue)) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!userId) {
    return <div>Please login first.</div>;
  }

  if (loading && !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-bold">Loading gym social...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 font-bold">No social data found.</p>
      </div>
    );
  }

  const { summary, friendStats, activityCards } = data;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-fuchsia-600 via-purple-700 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-white/80 font-semibold">Gym Community</p>

        <h1 className="text-4xl md:text-5xl font-black mt-1">
          Gym Social 🤝
        </h1>

        <p className="text-white/90 mt-2">
          See who trained today, who is consistent, and who is climbing.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Following</p>
          <p className="text-3xl font-black mt-1">{summary.followingCount}</p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Followers</p>
          <p className="text-3xl font-black mt-1">{summary.followersCount}</p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Friends</p>
          <p className="text-3xl font-black mt-1">{summary.friendsCount}</p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Trained Today</p>
          <p className="text-3xl font-black mt-1">
            {summary.trainedTodayCount}
          </p>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow">
          <p className="text-gray-500 text-sm font-bold">Weekly Workouts</p>
          <p className="text-3xl font-black mt-1">
            {summary.weeklySocialWorkouts}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-xl">
        <h2 className="text-2xl font-black mb-4">Friend Weekly Rankings</h2>

        {friendStats.length === 0 ? (
          <div className="bg-gray-50 border rounded-2xl p-6 text-center">
            <h3 className="text-xl font-black">No friends/following yet</h3>
            <p className="text-gray-500 mt-2">
              Follow users to see their gym activity here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friendStats.map((entry, index) => (
              <div
                key={entry.user._id}
                className="bg-gray-50 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="text-2xl font-black w-12">#{index + 1}</div>

                <button
                  onClick={() => openProfile?.(entry.user._id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <img
                    src={getProfileImage(entry.user)}
                    alt="profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />

                  <div>
                    <p className="font-black">{getUserName(entry.user)}</p>
                    <p className="text-sm text-gray-500">
                      @{getUserHandle(entry.user)}
                    </p>
                  </div>
                </button>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm flex-1">
                  <div>
                    <p className="text-gray-500">Today</p>
                    <p className="font-black">
                      {entry.trainedToday ? "✅" : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Workouts</p>
                    <p className="font-black">{entry.weeklyWorkouts}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Points</p>
                    <p className="font-black">{entry.weeklyPoints}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="font-black">
                      {Number(entry.weeklyVolume || 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Favorite</p>
                    <p className="font-black">{entry.favoriteMuscle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-xl">
        <h2 className="text-2xl font-black mb-4">Recent Gym Activity</h2>

        {activityCards.length === 0 ? (
          <div className="bg-gray-50 border rounded-2xl p-6 text-center">
            <h3 className="text-xl font-black">No activity yet</h3>
            <p className="text-gray-500 mt-2">
              Friend workouts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityCards.map((activity) => (
              <div
                key={activity._id}
                className="bg-gray-50 border rounded-3xl p-5"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => openProfile?.(activity.user?._id)}
                    className="shrink-0"
                  >
                    <img
                      src={getProfileImage(activity.user)}
                      alt="profile"
                      className="w-14 h-14 rounded-full object-cover border"
                    />
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <button
                          onClick={() => openProfile?.(activity.user?._id)}
                          className="font-black text-lg hover:text-blue-600"
                        >
                          {getUserName(activity.user)}
                        </button>

                        <p className="text-sm text-gray-500">
                          @{getUserHandle(activity.user)}
                        </p>
                      </div>

                      <p className="text-sm text-gray-400">
                        {formatTimeAgo(activity.createdAt)}
                      </p>
                    </div>

                    <p className="mt-3 text-lg font-bold">
                      {activity.headline}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500">Exercise</p>
                        <p className="font-black">
                          {activity.workout.exercise}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500">Muscle</p>
                        <p className="font-black">
                          {activity.workout.muscleGroup}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="font-black">
                          {activity.workout.weight}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="font-black">
                          {Number(
                            activity.workout.volume || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border">
                        <p className="text-xs text-gray-500">Points</p>
                        <p className="font-black">
                          {activity.workout.points}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GymSocial;