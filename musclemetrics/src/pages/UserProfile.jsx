import { useEffect, useMemo, useRef, useState } from "react";
import { User, Lock, Globe, Camera, Trash2 } from "lucide-react";
import API from "../config/api";

function UserProfile({ profileUserId, refresh, currentUser, openProfile }) {
  const storedUser = currentUser || JSON.parse(localStorage.getItem("user") || "null");
  const myUserId = storedUser?._id || storedUser?.id;
  const getToken = () => localStorage.getItem("token");
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  useEffect(() => {
    if (profileUserId) fetchProfile();
  }, [profileUserId, refresh]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/users/${profileUserId}/profile`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) return;
      setProfileData(data);
    } catch (error) {
      console.error("Fetch profile error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const profile = profileData?.user;
  const isOwnProfile = String(profile?._id || "") === String(myUserId);

  const isFollowing = useMemo(() => {
    if (!profile?.followers) return false;
    return profile.followers.some((item) => String(item._id || item) === String(myUserId));
  }, [profile, myUserId]);

  const getProfileImage = (user) => user?.profilePicture || "https://via.placeholder.com/300?text=User";
  const getDisplayName = (user) => user?.name || user?.username || user?.email?.split("@")[0] || "User";
  const getHandle = (user) => user?.username || user?.email?.split("@")[0] || "user";

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      const res = await fetch(`${API}/api/users/follow`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ targetUserId: profileUserId }) });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Could not follow user."); return; }
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
      const res = await fetch(`${API}/api/users/toggle-private`, { method: "PUT", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Could not update privacy."); return; }
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
        const res = await fetch(`${API}/api/users/profile-picture`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ profilePicture: reader.result }) });
        const data = await res.json();
        if (!res.ok) { alert(data.message || "Could not upload image."); return; }
        localStorage.setItem("user", JSON.stringify(data.user));
        await fetchProfile();
      } catch (error) {
        console.error("Profile picture upload error:", error.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = async () => {
    if (!window.confirm("Remove profile picture?")) return;
    try {
      setUploading(true);
      const res = await fetch(`${API}/api/users/profile-picture`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ profilePicture: "" }) });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Could not remove image."); return; }
      localStorage.setItem("user", JSON.stringify(data.user));
      await fetchProfile();
    } catch (error) {
      console.error("Remove profile picture error:", error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  if (!profileUserId) return (
    <div className="text-center py-20">
      <User className="h-16 w-16 mx-auto mb-4 text-slate-300" />
      <h2 className="text-3xl font-black">No profile selected</h2>
    </div>
  );

  if (loading) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
      <p className="text-gray-500 font-bold">Loading profile...</p>
    </div>
  );

  if (!profileData || !profile) return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-black">Profile not found</h2>
    </div>
  );

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-5 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row gap-5 md:gap-8 items-start sm:items-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={getProfileImage(profile)}
              alt="profile"
              className="w-24 h-24 md:w-36 md:h-36 rounded-[1.5rem] md:rounded-[2rem] object-cover border-4 border-white/20 shadow-2xl"
            />
            {isOwnProfile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl shadow-lg transition"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={uploadProfilePicture} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <h1 className="text-2xl md:text-5xl font-black leading-tight">{getDisplayName(profile)}</h1>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${profile.isPrivate ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>
                {profile.isPrivate ? <><Lock className="h-3 w-3" /> Private</> : <><Globe className="h-3 w-3" /> Public</>}
              </span>
            </div>

            <p className="text-blue-300 mt-1 text-sm md:text-base">@{getHandle(profile)}</p>

            {/* Stats chips */}
            <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
              {[
                { label: "Followers", value: profile.followers?.length || 0 },
                { label: "Following", value: profile.following?.length || 0 },
                { label: "Streak", value: `🔥 ${profile.streak || 0}d` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5">
                  <p className="text-xs text-blue-200 font-black">{label}</p>
                  <p className="text-lg md:text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-5">
              {!isOwnProfile && (
                <button
                  disabled={followLoading}
                  onClick={handleFollow}
                  className={`px-5 py-2.5 md:px-6 md:py-3 rounded-2xl font-black text-sm md:text-base transition disabled:opacity-60 ${
                    isFollowing ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-slate-900 hover:bg-gray-100"
                  }`}
                >
                  {followLoading ? "..." : isFollowing ? "Unfollow" : profile.isPrivate ? "Request Follow" : "Follow"}
                </button>
              )}

              {isOwnProfile && (
                <>
                  <button
                    disabled={privacyLoading}
                    onClick={togglePrivacy}
                    className="px-5 py-2.5 md:px-6 md:py-3 rounded-2xl bg-white text-slate-900 font-black text-sm md:text-base hover:bg-gray-100 transition disabled:opacity-60"
                  >
                    {privacyLoading ? "..." : profile.isPrivate ? "Make Public" : "Make Private"}
                  </button>
                  <button
                    disabled={uploading}
                    onClick={removeProfilePicture}
                    className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-2xl bg-red-500 text-white font-black text-sm md:text-base hover:bg-red-600 transition disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {uploading ? "..." : "Remove Photo"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Workout Activity */}
      <section className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-black">Workout Activity</h2>
          <p className="text-gray-500 text-sm">Recent logged workouts.</p>
        </div>

        {!profileData.canViewWorkouts ? (
          <div className="bg-gray-50 border rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 text-center">
            <Lock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-xl md:text-3xl font-black">Private Profile</h3>
            <p className="text-gray-500 mt-2 text-sm">Follow this user to view their workouts.</p>
          </div>
        ) : profileData.workouts?.length === 0 ? (
          <div className="bg-gray-50 border rounded-2xl p-8 text-center">
            <h3 className="text-xl md:text-2xl font-black">No workouts yet</h3>
            <p className="text-gray-500 mt-2 text-sm">Workout history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profileData.workouts.map((workout) => (
              <div key={workout._id} className="bg-gray-50 border rounded-2xl p-4 hover:bg-gray-100 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-black truncate">{workout.exercise}</h3>
                    <p className="text-gray-500 text-xs md:text-sm">{workout.muscleGroup} · {formatDate(workout.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {[
                      { label: `${workout.sets} sets`, color: "bg-blue-100 text-blue-700" },
                      { label: `${workout.reps} reps`, color: "bg-emerald-100 text-emerald-700" },
                      { label: `${workout.weight} lbs`, color: "bg-purple-100 text-purple-700" },
                    ].map(({ label, color }) => (
                      <span key={label} className={`px-3 py-1 rounded-full text-xs font-black ${color}`}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default UserProfile;
