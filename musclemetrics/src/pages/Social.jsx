import { useEffect, useMemo, useState } from "react";

function Social({
  refresh,
  openProfile,
  setActivePage,
  setSelectedProfileId,
}) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const userId = storedUser?._id || storedUser?.id;

  const API = "http://localhost:5000";

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [profile, setProfile] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [followLoadingId, setFollowLoadingId] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchMyProfile();
    }
  }, [userId, refresh]);

  const fetchMyProfile = async () => {
    try {
      setLoadingProfile(true);

      const res = await fetch(`${API}/api/users/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not load profile.");
        return;
      }

      setProfile(data.user || null);
    } catch (error) {
      console.error("Fetch profile error:", error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const searchUsers = async () => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoadingSearch(true);

      const res = await fetch(
        `${API}/api/messages/search-users/${search}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not search users.");
        return;
      }

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

      const res = await fetch(`${API}/api/users/follow`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          targetUserId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not follow user.");
        return;
      }

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

    return profile.following.map((item) =>
      String(item._id || item)
    );
  }, [profile]);

  const getProfileImage = (user) =>
    user?.profilePicture || "https://via.placeholder.com/120?text=U";

  const getDisplayName = (user) =>
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const getHandle = (user) =>
    user?.username ||
    user?.email?.split("@")[0] ||
    "user";

  if (!userId) {
    return <div>Please login first.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10">
          <p className="text-blue-200 font-black">
            Community
          </p>

          <h1 className="text-4xl md:text-6xl font-black mt-2">
            Social Hub
          </h1>

          <p className="text-slate-300 mt-3 max-w-2xl">
            Discover gym partners, follow athletes, and
            explore public profiles.
          </p>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && searchUsers()
            }
            placeholder="Search by username, name, or email..."
            className="flex-1 p-4 rounded-2xl bg-gray-100 border outline-none focus:border-blue-500"
          />

          <button
            onClick={searchUsers}
            className="px-6 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {loadingSearch ? (
          <p className="text-gray-500 font-bold mt-5">
            Searching...
          </p>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
            {searchResults.map((user) => {
              const isFollowing = followingIds.includes(
                String(user._id)
              );

              return (
                <div
                  key={user._id}
                  className="bg-gray-50 border rounded-[2rem] p-5 flex flex-col md:flex-row gap-5 items-start md:items-center"
                >
                  <button
                    onClick={() => openProfile?.(user._id)}
                  >
                    <img
                      src={getProfileImage(user)}
                      alt="profile"
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                    />
                  </button>

                  <div className="flex-1">
                    <button
                      onClick={() =>
                        openProfile?.(user._id)
                      }
                      className="text-left"
                    >
                      <h3 className="text-2xl font-black">
                        {getDisplayName(user)}
                      </h3>

                      <p className="text-gray-500">
                        @{getHandle(user)}
                      </p>
                    </button>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-black">
                        🔥 {user.streak || 0} Day Streak
                      </span>

                      {user.isPrivate ? (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-black">
                          🔒 Private
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-black">
                          🌍 Public
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button
                      onClick={() =>
                        openProfile?.(user._id)
                      }
                      className="px-5 py-3 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800"
                    >
                      View Profile
                    </button>

                    <button
                      disabled={
                        followLoadingId === user._id
                      }
                      onClick={() =>
                        handleFollow(user._id)
                      }
                      className={`px-5 py-3 rounded-2xl font-black ${
                        isFollowing
                          ? "bg-red-500 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {followLoadingId === user._id
                        ? "..."
                        : isFollowing
                        ? "Unfollow"
                        : user.isPrivate
                        ? "Request"
                        : "Follow"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : search.trim() ? (
          <div className="bg-gray-50 border rounded-[2rem] p-8 text-center mt-6">
            <h3 className="text-2xl font-black">
              No users found
            </h3>

            <p className="text-gray-500 mt-2">
              Try another username or name.
            </p>
          </div>
        ) : null}
      </section>

      <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-3xl font-black">
              Your Network
            </h2>

            <p className="text-gray-500">
              People you follow and interact with.
            </p>
          </div>
        </div>

        {loadingProfile ? (
          <p className="text-gray-500 font-bold">
            Loading network...
          </p>
        ) : !profile ? (
          <div className="bg-gray-50 border rounded-[2rem] p-8 text-center">
            <h3 className="text-2xl font-black">
              Could not load profile
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {(profile.following || []).map((user) => (
              <div
                key={user._id || user}
                className="bg-gray-50 border rounded-[2rem] p-5 flex items-center gap-4"
              >
                <button
                  onClick={() =>
                    openProfile?.(user._id || user)
                  }
                >
                  <img
                    src={getProfileImage(user)}
                    alt="profile"
                    className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg"
                  />
                </button>

                <div className="flex-1">
                  <button
                    onClick={() =>
                      openProfile?.(user._id || user)
                    }
                    className="text-left"
                  >
                    <h3 className="text-xl font-black">
                      {getDisplayName(user)}
                    </h3>

                    <p className="text-gray-500">
                      @{getHandle(user)}
                    </p>
                  </button>

                  <p className="text-sm text-gray-500 mt-2">
                    🔥 {user.streak || 0} Day Streak
                  </p>
                </div>

                <button
                  onClick={() =>
                    openProfile?.(user._id || user)
                  }
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700"
                >
                  Open
                </button>
              </div>
            ))}

            {(profile.following || []).length === 0 && (
              <div className="bg-gray-50 border rounded-[2rem] p-8 text-center col-span-full">
                <h3 className="text-2xl font-black">
                  No connections yet
                </h3>

                <p className="text-gray-500 mt-2">
                  Search users above and start building your
                  fitness network.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Social;