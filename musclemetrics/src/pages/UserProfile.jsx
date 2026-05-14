import { useEffect, useMemo, useRef, useState } from "react";
import API from "../config/api";
function UserProfile({
  profileUserId,
  refresh,
  currentUser,
  openProfile,
}) {
  const storedUser =
    currentUser ||
    JSON.parse(localStorage.getItem("user") || "null");

  const myUserId = storedUser?._id || storedUser?.id;


  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  useEffect(() => {
    if (profileUserId) {
      fetchProfile();
    }
  }, [profileUserId, refresh]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API}/api/users/${profileUserId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not load profile.");
        return;
      }

      setProfileData(data);
    } catch (error) {
      console.error("Fetch profile error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const profile = profileData?.user;

  const isOwnProfile =
    String(profile?._id || "") === String(myUserId);

  const isFollowing = useMemo(() => {
    if (!profile?.followers) return false;

    return profile.followers.some(
      (item) =>
        String(item._id || item) === String(myUserId)
    );
  }, [profile, myUserId]);

  const getProfileImage = (user) =>
    user?.profilePicture ||
    "https://via.placeholder.com/300?text=User";

  const getDisplayName = (user) =>
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const getHandle = (user) =>
    user?.username ||
    user?.email?.split("@")[0] ||
    "user";

  const handleFollow = async () => {
    try {
      setFollowLoading(true);

      const res = await fetch(`${API}/api/users/follow`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          targetUserId: profileUserId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not follow user.");
        return;
      }

      await fetchProfile();
    } catch (error) {
      console.error("Follow error:", error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const togglePrivacy = async () => {
    try {
      setPrivacyLoading(true);

      const res = await fetch(
        `${API}/api/users/toggle-private`,
        {
          method: "PUT",
          headers: authHeaders(),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not update privacy.");
        return;
      }

      await fetchProfile();
    } catch (error) {
      console.error("Privacy toggle error:", error.message);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const uploadProfilePicture = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        setUploading(true);

        const res = await fetch(
          `${API}/api/users/profile-picture`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({
              profilePicture: reader.result,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Could not upload image.");
          return;
        }

        const updatedUser = data.user;

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        await fetchProfile();
      } catch (error) {
        console.error(
          "Profile picture upload error:",
          error.message
        );
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const removeProfilePicture = async () => {
    const confirmDelete = window.confirm(
      "Remove profile picture?"
    );

    if (!confirmDelete) return;

    try {
      setUploading(true);

      const res = await fetch(
        `${API}/api/users/profile-picture`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            profilePicture: "",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not remove image.");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      await fetchProfile();
    } catch (error) {
      console.error(
        "Remove profile picture error:",
        error.message
      );
    } finally {
      setUploading(false);
    }
  };

  if (!profileUserId) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black">
          No profile selected
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black">
          Loading profile...
        </h2>
      </div>
    );
  }

  if (!profileData || !profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black">
          Profile not found
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 md:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-start xl:items-center">
          <div className="relative">
            <img
              src={getProfileImage(profile)}
              alt="profile"
              className="w-40 h-40 rounded-[2rem] object-cover border-4 border-white shadow-2xl"
            />

            {isOwnProfile && (
              <button
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-2 rounded-2xl font-black shadow-xl"
              >
                {uploading ? "..." : "Edit"}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={uploadProfilePicture}
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl md:text-6xl font-black">
                {getDisplayName(profile)}
              </h1>

              {profile.isPrivate ? (
                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-black">
                  🔒 Private
                </span>
              ) : (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-black">
                  🌍 Public
                </span>
              )}
            </div>

            <p className="text-blue-100 text-lg mt-2">
              @{getHandle(profile)}
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-sm text-blue-100 font-black">
                  Followers
                </p>

                <p className="text-3xl font-black">
                  {profile.followers?.length || 0}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-sm text-blue-100 font-black">
                  Following
                </p>

                <p className="text-3xl font-black">
                  {profile.following?.length || 0}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-sm text-blue-100 font-black">
                  Streak
                </p>

                <p className="text-3xl font-black">
                  🔥 {profile.streak || 0}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {!isOwnProfile && (
                <button
                  disabled={followLoading}
                  onClick={handleFollow}
                  className={`px-6 py-4 rounded-2xl font-black ${
                    isFollowing
                      ? "bg-red-500 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {followLoading
                    ? "..."
                    : isFollowing
                    ? "Unfollow"
                    : profile.isPrivate
                    ? "Request Follow"
                    : "Follow"}
                </button>
              )}

              {isOwnProfile && (
                <>
                  <button
                    disabled={privacyLoading}
                    onClick={togglePrivacy}
                    className="px-6 py-4 rounded-2xl bg-white text-slate-900 font-black"
                  >
                    {privacyLoading
                      ? "..."
                      : profile.isPrivate
                      ? "Make Public"
                      : "Make Private"}
                  </button>

                  <button
                    disabled={uploading}
                    onClick={removeProfilePicture}
                    className="px-6 py-4 rounded-2xl bg-red-500 text-white font-black"
                  >
                    Remove Picture
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-3xl font-black">
              Workout Activity
            </h2>

            <p className="text-gray-500">
              Recent logged workouts.
            </p>
          </div>
        </div>

        {!profileData.canViewWorkouts ? (
          <div className="bg-gray-50 border rounded-[2rem] p-10 text-center">
            <h3 className="text-3xl font-black">
              🔒 Private Profile
            </h3>

            <p className="text-gray-500 mt-2">
              Follow this user to view their workouts.
            </p>
          </div>
        ) : profileData.workouts?.length === 0 ? (
          <div className="bg-gray-50 border rounded-[2rem] p-10 text-center">
            <h3 className="text-3xl font-black">
              No workouts yet
            </h3>

            <p className="text-gray-500 mt-2">
              Workout history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profileData.workouts.map((workout) => (
              <div
                key={workout._id}
                className="bg-gray-50 border rounded-[2rem] p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black">
                      {workout.exercise}
                    </h3>

                    <p className="text-gray-500">
                      {workout.muscleGroup}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-black">
                      {workout.sets} Sets
                    </span>

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-black">
                      {workout.reps} Reps
                    </span>

                    <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-black">
                      {workout.weight} lbs
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mt-4">
                  {new Date(
                    workout.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default UserProfile;