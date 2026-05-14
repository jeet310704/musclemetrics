import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LogWorkout from "./pages/LogWorkout";
import WorkoutHistory from "./pages/WorkoutHistory";
import WorkoutSplits from "./pages/WorkoutSplits";
import WorkoutTemplates from "./pages/WorkoutTemplates";
import WorkoutProgress from "./pages/WorkoutProgress";
import StreakSystem from "./pages/StreakSystem";
import GymSocial from "./pages/GymSocial";
import WorkoutAnalytics from "./pages/WorkoutAnalytics";
import PRTracker from "./pages/PRTracker";
import ProgressCharts from "./pages/ProgressCharts";
import Social from "./pages/Social";
import Leaderboard from "./pages/Leaderboard";
import ActivityFeed from "./pages/ActivityFeed";
import UserProfile from "./pages/UserProfile";
import Notifications from "./pages/Notifications";
import AIRecommendations from "./pages/AIRecommendations";
import Messages from "./pages/Messages";
import Rewards from "./pages/Rewards";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [refresh, setRefresh] = useState(0);
  const [profileUserId, setProfileUserId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [popupNotification, setPopupNotification] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);

  const API = "http://localhost:5000";
  const SOCKET_URL = "http://localhost:5000";

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    fetchNotificationCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [userId, refresh, activePage]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.emit("joinUserRoom", userId);

    socket.on("newNotification", async () => {
      await fetchNotificationCount();
      await fetchLatestPopupNotification();
      setRefresh((prev) => prev + 1);
    });

    socket.on("notificationsRead", () => {
      fetchNotificationCount();
      setRefresh((prev) => prev + 1);
    });

    socket.on("workoutLogged", () => {
      setRefresh((prev) => prev + 1);
    });

    socket.on("workoutDeleted", () => {
      setRefresh((prev) => prev + 1);
    });

    socket.on("leaderboardUpdated", () => {
      setRefresh((prev) => prev + 1);
    });

    socket.on("feedUpdated", () => {
      setRefresh((prev) => prev + 1);
    });

    socket.on("analyticsUpdated", () => {
      setRefresh((prev) => prev + 1);
    });

    socket.on("socialUpdated", () => {
      setRefresh((prev) => prev + 1);
    });

    socket.on("profileUpdated", () => {
      setRefresh((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch(`${API}/api/users/${userId}/notifications`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        setNotificationCount(0);
        return;
      }

      const unread = data.filter((item) => !item.read).length;
      setNotificationCount(unread);
    } catch (error) {
      console.error("Notification badge error:", error.message);
    }
  };

  const fetchLatestPopupNotification = async () => {
    try {
      const res = await fetch(`${API}/api/users/${userId}/notifications`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) return;

      const latestUnread = data.find((item) => !item.read);

      if (latestUnread) {
        setPopupNotification(latestUnread);
      }
    } catch (error) {
      console.error("Popup notification error:", error.message);
    }
  };

  const handlePopupFollowRequest = async (notificationId, action) => {
    try {
      setPopupLoading(true);

      const res = await fetch(
        `${API}/api/users/${userId}/follow-request/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not update request.");
        return;
      }

      setPopupNotification(null);
      await fetchNotificationCount();
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Popup follow request error:", error.message);
    } finally {
      setPopupLoading(false);
    }
  };

  const markPopupRead = async () => {
    try {
      await fetch(`${API}/api/users/${userId}/notifications/read-all`, {
        method: "PUT",
      });

      setPopupNotification(null);
      fetchNotificationCount();
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Popup mark read error:", error.message);
      setPopupNotification(null);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const openPage = (pageId) => {
    setActivePage(pageId);
    setMenuOpen(false);

    if (pageId === "notifications") {
      setNotificationCount(0);
    }
  };

  const openProfile = (id) => {
    if (!id) return;
    setProfileUserId(id);
    setActivePage("userProfile");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeSplit");
    localStorage.removeItem("activeSplitInputs");
    localStorage.removeItem("activeSplitElapsedSeconds");
    localStorage.removeItem("activeSplitTimerRunning");
    localStorage.removeItem("activeExerciseIndex");
    localStorage.removeItem("activeSetIndex");
    localStorage.removeItem("completedSets");
    localStorage.removeItem("activeTemplate");
    localStorage.removeItem("requestedFollowIds");

    setUser(null);
  };

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  const mainItems = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "log", label: "Log", icon: "🏋️" },
    { id: "feed", label: "Feed", icon: "📰" },
    { id: "leaderboard", label: "Rank", icon: "🏆" },
  ];

  const menuItems = [
    { id: "splits", label: "Workout Splits", icon: "🧩" },
    { id: "templates", label: "Workout Templates", icon: "🧾" },
    { id: "history", label: "Workout History", icon: "📋" },
    { id: "workoutProgress", label: "Workout Progress", icon: "📈" },
    { id: "streakSystem", label: "Streak System", icon: "🔥" },
    { id: "gymSocial", label: "Gym Social", icon: "🤝" },
    { id: "workoutAnalytics", label: "Workout Analytics", icon: "🧠" },
    { id: "prs", label: "Personal Records", icon: "🔥" },
    { id: "progress", label: "Progress Charts", icon: "📊" },
    { id: "social", label: "Friends / Social", icon: "👥" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "rewards", label: "Rewards / Streaks", icon: "🎖️" },
    { id: "notifications", label: "Alerts", icon: "🔔" },
    { id: "ai", label: "AI Recommendations", icon: "🤖" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  const renderPage = () => {
    if (activePage === "dashboard") {
      return <Dashboard refresh={refresh} />;
    }

    if (activePage === "log") {
      return (
        <LogWorkout onWorkoutAdded={() => setRefresh((prev) => prev + 1)} />
      );
    }

    if (activePage === "splits") {
      return (
        <WorkoutSplits
          refresh={refresh}
          setRefresh={setRefresh}
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === "templates") {
      return (
        <WorkoutTemplates
          refresh={refresh}
          setRefresh={setRefresh}
          setActivePage={setActivePage}
        />
      );
    }

    if (activePage === "history") {
      return <WorkoutHistory refresh={refresh} />;
    }

    if (activePage === "workoutProgress") {
      return <WorkoutProgress refresh={refresh} />;
    }

    if (activePage === "streakSystem") {
      return <StreakSystem refresh={refresh} />;
    }

    if (activePage === "gymSocial") {
      return <GymSocial refresh={refresh} openProfile={openProfile} />;
    }

    if (activePage === "workoutAnalytics") {
      return <WorkoutAnalytics refresh={refresh} />;
    }

    if (activePage === "prs") {
      return <PRTracker refresh={refresh} />;
    }

    if (activePage === "progress") {
      return <ProgressCharts refresh={refresh} />;
    }

    if (activePage === "social") {
      return (
        <Social
          refresh={refresh}
          setRefresh={setRefresh}
          openProfile={openProfile}
        />
      );
    }

    if (activePage === "feed") {
      return <ActivityFeed refresh={refresh} openProfile={openProfile} />;
    }

    if (activePage === "messages") {
      return <Messages refresh={refresh} openProfile={openProfile} />;
    }

    if (activePage === "rewards") {
      return <Rewards refresh={refresh} />;
    }

    if (activePage === "notifications") {
      return (
        <Notifications
          refresh={refresh}
          setRefresh={setRefresh}
          openProfile={openProfile}
        />
      );
    }

    if (activePage === "leaderboard") {
      return <Leaderboard refresh={refresh} openProfile={openProfile} />;
    }

    if (activePage === "profile") {
      return (
        <UserProfile
          profileUserId={userId}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      );
    }

    if (activePage === "userProfile") {
      return (
        <UserProfile
          profileUserId={profileUserId}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      );
    }

    if (activePage === "ai") {
      return <AIRecommendations refresh={refresh} />;
    }

    return <Dashboard refresh={refresh} />;
  };

  const activeLabel =
    [...mainItems, ...menuItems].find((item) => item.id === activePage)
      ?.label || "Dashboard";

  const isPopupFollowRequest =
    popupNotification?.type === "follow_request" && !popupNotification?.resolved;

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-slate-100 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-28 md:px-8 md:pt-8">
        <header
          className={`backdrop-blur-2xl border rounded-3xl p-4 md:p-5 mb-5 shadow-2xl ${
            theme === "dark"
              ? "bg-white/10 border-white/10"
              : "bg-white/90 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1
                className={`text-2xl md:text-4xl font-black tracking-tight ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                Muscle<span className="text-blue-400">Metrics</span>
              </h1>

              <p
                className={`text-sm md:text-base mt-1 ${
                  theme === "dark" ? "text-slate-300" : "text-gray-500"
                }`}
              >
                {activeLabel}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`px-4 py-3 rounded-2xl font-black shadow ${
                  theme === "dark"
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <button
                onClick={() => setMenuOpen(true)}
                className="relative px-4 py-3 rounded-2xl font-black shadow bg-blue-600 text-white hover:bg-blue-700"
              >
                ☰

                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center border-2 border-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="bg-white text-slate-900 rounded-3xl shadow-2xl p-4 md:p-8">
          {renderPage()}
        </main>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="grid grid-cols-4 gap-2 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl">
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => openPage(item.id)}
              className={`py-3 rounded-2xl text-xs font-black transition ${
                activePage === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <div className="text-lg">{item.icon}</div>
              <div>{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl gap-2">
        {mainItems.map((item) => (
          <button
            key={item.id}
            onClick={() => openPage(item.id)}
            className={`px-5 py-3 rounded-2xl font-black transition ${
              activePage === item.id
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {popupNotification && (
        <div className="fixed top-5 right-5 z-[10000] w-[92%] max-w-md bg-white text-slate-900 border border-gray-200 rounded-[2rem] shadow-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-blue-600 font-black">
                {isPopupFollowRequest ? "Follow Request" : "New Notification"}
              </p>

              <h3 className="text-2xl font-black mt-1">
                {isPopupFollowRequest ? "👤 New Request" : "🔔 Alert"}
              </h3>
            </div>

            <button
              onClick={() => setPopupNotification(null)}
              className="bg-gray-100 text-gray-700 rounded-xl px-3 py-2 font-black"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-600 font-semibold mt-3">
            {popupNotification.message}
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            {popupNotification.fromUserId && (
              <button
                onClick={() => {
                  openProfile(popupNotification.fromUserId);
                  setPopupNotification(null);
                }}
                className="px-5 py-3 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800"
              >
                View Profile
              </button>
            )}

            {isPopupFollowRequest ? (
              <>
                <button
                  disabled={popupLoading}
                  onClick={() =>
                    handlePopupFollowRequest(popupNotification._id, "accept")
                  }
                  className="px-5 py-3 rounded-2xl bg-green-600 text-white font-black hover:bg-green-700 disabled:opacity-60"
                >
                  Accept
                </button>

                <button
                  disabled={popupLoading}
                  onClick={() =>
                    handlePopupFollowRequest(popupNotification._id, "decline")
                  }
                  className="px-5 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-60"
                >
                  Decline
                </button>
              </>
            ) : (
              <button
                onClick={markPopupRead}
                className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700"
              >
                Mark Read
              </button>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setMenuOpen(false)}
          />

          <div className="fixed right-4 top-4 bottom-4 w-[92%] max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-5 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm text-blue-600 font-black">
                  MuscleMetrics
                </p>

                <h3 className="text-3xl font-black text-slate-900">Menu</h3>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="bg-gray-100 px-4 py-2 rounded-xl font-black text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openPage(item.id)}
                  className={`text-left p-4 rounded-2xl font-black border transition flex items-center justify-between ${
                    activePage === item.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span>
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </span>

                  <span className="flex items-center gap-2">
                    {item.id === "notifications" && notificationCount > 0 && (
                      <span className="min-w-[24px] h-[24px] px-2 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}

                    {activePage === item.id && <span>✓</span>}
                  </span>
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="text-left p-4 rounded-2xl font-black border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 mt-3"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;