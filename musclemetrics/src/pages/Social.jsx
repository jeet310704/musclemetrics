import { useEffect, useMemo, useState } from "react";
import { Users, Search } from "lucide-react";
import API from "../config/api";

function Social({ refresh, openProfile }) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?._id || storedUser?.id;
  const getToken = () => localStorage.getItem("token");
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [followLoadingId, setFollowLoadingId] = useState(null);

  useEffect(() => {
    if (userId) fetchMyProfile();
  }, [userId, refresh]);

  const fetchMyProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch(`${API}/api/users/${userId}/profile`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) return;
      setProfile(data.user || null);
    } catch (error) {
      console.error("Fetch profile error:", error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const searchUsers = async () => {
    if (!search.trim()) { setSearchResults([]); return; }
    try {
      setLoadingSearch(true);
      const res = await fetch(`${API}/api/messages/search-users/${search}/${userId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) return;
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search users error:", error.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      setFollowLoadingId(targetUserId);
      const res = await fetch(`${API}/api/users/follow`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ targetUserId }) });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Could not follow user."); return; }
      await fetchMyProfile();
      await searchUsers();
    } catch (error) {
      console.error("Follow error:", error.message);
    } finally {
      setFollowLoadingId(null);
    }
  };

  const followingIds = useMemo(() => {
    if (!profile?.following) return [];
    return profile.following.map((item) => String(item._id || item));
  }, [profile]);

  const getProfileImage = (user) => user?.profilePicture || "https://via.placeholder.com/120?text=U";
  const getDisplayName = (user) => user?.name || user?.username || user?.email?.split("@")[0] || "User";
  const getHandle = (user) => user?.username || user?.email?.split("@")[0] || "user";

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-5 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-blue-300 font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4" /> Community
          </p>
          <h1 className="text-3xl md:text-6xl font-black mt-2">Social Hub</h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Discover gym partners, follow athletes, and explore public profiles.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-xl">
        <h2 className="text-xl md:text-2xl font-black mb-3">Find Athletes</h2>
        <div className="flex gap-2 md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              placeholder="Search by username, name, or email..."
              className="w-full pl-10 pr-4 py-3 md:py-3.5 rounded-2xl bg-gray-100 border outline-none focus:border-blue-500 text-sm md:text-base"
            />
          </div>
          <button
            onClick={searchUsers}
            className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition text-sm md:text-base"
          >
            Search
          </button>
        </div>

        {loadingSearch ? (
          <p className="text-gray-500 font-bold mt-4 text-sm">Searching...</p>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-4">
            {searchResults.map((user) => {
              const isFollowing = followingIds.includes(String(user._id));
              return (
                <div key={user._id} className="bg-gray-50 border rounded-2xl p-3 md:p-4 flex items-center gap-3">
                  <button onClick={() => openProfile?.(user._id)} className="shrink-0">
                    <img src={getProfileImage(user)} alt="profile"
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-white shadow"
                    />
                  </button>

                  <button onClick={() => openProfile?.(user._id)} className="flex-1 text-left min-w-0">
                    <p className="font-black text-sm md:text-base truncate">{getDisplayName(user)}</p>
                    <p className="text-xs text-gray-500 truncate">@{getHandle(user)}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs font-black text-orange-500">🔥 {user.streak || 0}d</span>
                      <span className={`text-xs font-black ${user.isPrivate ? "text-yellow-600" : "text-emerald-600"}`}>
                        {user.isPrivate ? "🔒 Private" : "🌍 Public"}
                      </span>
                    </div>
                  </button>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => openProfile?.(user._id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition"
                    >
                      Profile
                    </button>
                    <button
                      disabled={followLoadingId === user._id}
                      onClick={() => handleFollow(user._id)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition disabled:opacity-60 ${
                        isFollowing ? "bg-red-100 text-red-600 hover:bg-red-500 hover:text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {followLoadingId === user._id ? "..." : isFollowing ? "Unfollow" : user.isPrivate ? "Request" : "Follow"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : search.trim() ? (
          <div className="bg-gray-50 border rounded-2xl p-6 text-center mt-4">
            <p className="font-black text-gray-500 text-sm">No users found. Try another name.</p>
          </div>
        ) : null}
      </section>

      {/* Network */}
      <section className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-xl">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-black">Your Network</h2>
          <p className="text-gray-500 text-sm">People you follow.</p>
        </div>

        {loadingProfile ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-16" />)}
          </div>
        ) : !profile ? (
          <p className="text-gray-500 font-bold text-sm">Could not load profile.</p>
        ) : (profile.following || []).length === 0 ? (
          <div className="bg-gray-50 border rounded-2xl p-8 text-center">
            <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <h3 className="text-xl font-black">No connections yet</h3>
            <p className="text-gray-500 mt-1 text-sm">Search users above and start building your fitness network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {(profile.following || []).map((user) => (
              <div key={user._id || user} className="bg-gray-50 border rounded-2xl p-3 md:p-4 flex items-center gap-3">
                <button onClick={() => openProfile?.(user._id || user)} className="shrink-0">
                  <img src={getProfileImage(user)} alt="profile"
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-white shadow"
                  />
                </button>

                <button onClick={() => openProfile?.(user._id || user)} className="flex-1 text-left min-w-0">
                  <p className="font-black text-sm md:text-base truncate">{getDisplayName(user)}</p>
                  <p className="text-xs text-gray-500 truncate">@{getHandle(user)}</p>
                  <p className="text-xs font-bold text-orange-500 mt-0.5">🔥 {user.streak || 0} day streak</p>
                </button>

                <button
                  onClick={() => openProfile?.(user._id || user)}
                  className="shrink-0 px-3 py-2 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Social;
