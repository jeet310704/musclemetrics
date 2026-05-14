import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Dumbbell,
  Newspaper,
  Trophy,
  Bell,
  User,
  LogOut,
  ClipboardList,
  History,
  TrendingUp,
  Flame,
  Users,
  Brain,
  BarChart3,
  MessageCircle,
  Award,
  Bot,
  X,
  MoreHorizontal,
} from "lucide-react";
import API, { apiFetch } from "./config/api";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LogWorkout from "./pages/LogWorkout";
import WorkoutHistory from "./pages/WorkoutHistory";
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

const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23111827'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='44' fill='white'%3EU%3C/text%3E%3C/svg%3E";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [refresh, setRefresh] = useState(0);
  const [profileUserId, setProfileUserId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [popupNotification, setPopupNotification] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const userId = user?._id || user?.id;
  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    if (!userId) return;

    fetchNotificationCount();

    const interval = setInterval(fetchNotificationCount, 10000);
    return () => clearInterval(interval);
  }, [userId, refresh, activePage]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(API, {
      transports: ["polling", "websocket"],
    });

    socket.emit("joinUserRoom", userId);

    socket.on("newNotification", async () => {
      await fetchNotificationCount();
      await fetchLatestPopupNotification();
      setRefresh((prev) => prev + 1);
    });

    [
      "notificationsRead",
      "workoutLogged",
      "workoutDeleted",
      "leaderboardUpdated",
      "feedUpdated",
      "analyticsUpdated",
      "socialUpdated",
      "profileUpdated",
      "newMessage",
    ].forEach((eventName) => {
      socket.on(eventName, () => {
        fetchNotificationCount();
        setRefresh((prev) => prev + 1);
      });
    });

    return () => socket.disconnect();
  }, [userId]);

  const fetchNotificationCount = async () => {
    try {
      const res = await apiFetch(`/api/users/${userId}/notifications`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        setNotificationCount(0);
        return;
      }

      setNotificationCount(data.filter((item) => !item.read).length);
    } catch (error) {
      console.error("Notification badge error:", error.message);
    }
  };

  const fetchLatestPopupNotification = async () => {
    try {
      const res = await apiFetch(`/api/users/${userId}/notifications`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) return;

      const latestUnread = data.find((item) => !item.read);
      if (latestUnread) setPopupNotification(latestUnread);
    } catch (error) {
      console.error("Popup notification error:", error.message);
    }
  };

  const handlePopupFollowRequest = async (notificationId, action) => {
    try {
      setPopupLoading(true);

      const res = await apiFetch(
        `/api/users/${userId}/follow-request/${notificationId}`,
        {
          method: "PUT",
          headers: authHeaders(),
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
      await apiFetch(`/api/users/${userId}/notifications/read-all`, {
        method: "PUT",
        headers: authHeaders(),
      });

      setPopupNotification(null);
      fetchNotificationCount();
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Popup mark read error:", error.message);
      setPopupNotification(null);
    }
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

  if (!user) return <Auth setUser={setUser} />;

  const mainItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "log", label: "Log", icon: Dumbbell },
    { id: "feed", label: "Feed", icon: Newspaper },
    { id: "leaderboard", label: "Rank", icon: Trophy },
  ];

  const menuItems = [
    { id: "templates", label: "Templates", icon: ClipboardList },
    { id: "history", label: "History", icon: History },
    { id: "workoutProgress", label: "Workout Progress", icon: TrendingUp },
    { id: "streakSystem", label: "Streak System", icon: Flame },
    { id: "gymSocial", label: "Gym Social", icon: Users },
    { id: "workoutAnalytics", label: "Analytics", icon: Brain },
    { id: "prs", label: "Personal Records", icon: Flame },
    { id: "progress", label: "Progress Charts", icon: BarChart3 },
    { id: "social", label: "Friends", icon: Users },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "rewards", label: "Rewards", icon: Award },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "ai", label: "AI Coach", icon: Bot },
    { id: "profile", label: "Profile", icon: User },
  ];

  const allItems = [...mainItems, ...menuItems];

  const renderPage = () => {
    if (activePage === "dashboard") {
      return <Dashboard refresh={refresh} setActivePage={setActivePage} />;
    }

    if (activePage === "log") {
      return (
        <LogWorkout onWorkoutAdded={() => setRefresh((prev) => prev + 1)} />
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

    if (activePage === "history") return <WorkoutHistory refresh={refresh} />;
    if (activePage === "workoutProgress")
      return <WorkoutProgress refresh={refresh} />;
    if (activePage === "streakSystem")
      return <StreakSystem refresh={refresh} />;
    if (activePage === "gymSocial")
      return <GymSocial refresh={refresh} openProfile={openProfile} />;
    if (activePage === "workoutAnalytics")
      return <WorkoutAnalytics refresh={refresh} />;
    if (activePage === "prs") return <PRTracker refresh={refresh} />;
    if (activePage === "progress") return <ProgressCharts refresh={refresh} />;
    if (activePage === "social")
      return <Social refresh={refresh} openProfile={openProfile} />;
    if (activePage === "feed")
      return <ActivityFeed refresh={refresh} openProfile={openProfile} />;
    if (activePage === "messages")
      return <Messages refresh={refresh} openProfile={openProfile} />;
    if (activePage === "rewards") return <Rewards refresh={refresh} />;

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
          currentUser={user}
          openProfile={openProfile}
        />
      );
    }

    if (activePage === "userProfile") {
      return (
        <UserProfile
          profileUserId={profileUserId}
          refresh={refresh}
          currentUser={user}
          openProfile={openProfile}
        />
      );
    }

    if (activePage === "ai") return <AIRecommendations refresh={refresh} />;

    return <Dashboard refresh={refresh} setActivePage={setActivePage} />;
  };

  const activeItem =
    allItems.find((item) => item.id === activePage) || {
      label: "Dashboard",
      icon: Home,
    };

  const ActiveIcon = activeItem.icon;

  const isPopupFollowRequest =
    popupNotification?.type === "follow_request" &&
    !popupNotification?.resolved;

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-[130px]" />
        <div className="absolute right-[-8rem] top-24 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-[140px]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setMenuOpen(true)}
        className="fixed top-3 right-3 md:top-5 md:right-5 z-50 h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-emerald-400 hover:text-black transition font-black flex items-center justify-center"
      >
        <MoreHorizontal className="h-6 w-6 md:h-7 md:w-7" />
        {notificationCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center border-2 border-black">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </motion.button>

      <main className="relative z-10 min-h-screen px-2 sm:px-4 md:px-6 py-3 md:py-5 pb-32">
        <section className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-4 md:mb-5 rounded-3xl md:rounded-[2rem] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-4 md:p-7 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-5 pr-12 md:pr-0">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] text-emerald-400 font-black flex items-center gap-2">
                  <ActiveIcon className="h-4 w-4" />
                  {activeItem.label}
                </p>

                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mt-2 tracking-tight">
                  Muscle<span className="text-emerald-400">Metrics</span>
                </h1>

                <p className="text-zinc-400 mt-2 max-w-xl text-sm md:text-base">
                  Track workouts, compete with friends, and build your fitness
                  profile.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProfile(userId)}
                className="flex items-center gap-3 rounded-2xl bg-black/30 border border-white/10 px-3 md:px-4 py-3 hover:bg-white/10 transition w-fit"
              >
                <img
                  src={user?.profilePicture || fallbackAvatar}
                  alt="profile"
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-cover"
                />

                <div className="text-left">
                  <p className="text-xs md:text-sm text-zinc-400 font-bold">
                    Profile
                  </p>
                  <p className="font-black text-sm md:text-base">
                    {user?.username || user?.name || "Athlete"}
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          <div className="rounded-3xl md:rounded-[2rem] bg-[#111111]/90 border border-white/10 shadow-2xl p-1.5 md:p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="rounded-3xl md:rounded-[1.5rem] bg-white text-slate-900 min-h-[72vh] p-3 sm:p-4 md:p-6 overflow-x-hidden"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed bottom-3 left-2 right-2 sm:left-4 sm:right-4 z-50"
      >
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1.5 sm:gap-2 bg-black/85 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2rem] p-1.5 sm:p-2 shadow-2xl">
          {mainItems.map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                key={item.id}
                onClick={() => openPage(item.id)}
                className={`py-2.5 sm:py-3 rounded-2xl text-[11px] sm:text-xs font-black transition ${
                  activePage === item.id
                    ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/20"
                    : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <div>{item.label}</div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {popupNotification && (
          <motion.div
            initial={{ opacity: 0, x: -35, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -35, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed top-3 left-3 right-3 md:top-5 md:left-5 md:right-auto z-[10000] md:w-[92%] md:max-w-md bg-[#181818] text-white border border-white/10 rounded-[2rem] shadow-2xl p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-emerald-400 font-black">
                  {isPopupFollowRequest ? "Follow Request" : "New Notification"}
                </p>

                <h3 className="text-xl md:text-2xl font-black mt-1">
                  {isPopupFollowRequest ? "New Request" : "Alert"}
                </h3>
              </div>

              <button
                onClick={() => setPopupNotification(null)}
                className="bg-white/10 text-white rounded-xl px-3 py-2 font-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-zinc-300 font-semibold mt-3 text-sm md:text-base">
              {popupNotification.message}
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              {popupNotification.fromUserId && (
                <button
                  onClick={() => {
                    openProfile(popupNotification.fromUserId);
                    setPopupNotification(null);
                  }}
                  className="px-4 md:px-5 py-3 rounded-2xl bg-white text-black font-black hover:bg-zinc-200"
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
                    className="px-4 md:px-5 py-3 rounded-2xl bg-emerald-400 text-black font-black hover:bg-emerald-300 disabled:opacity-60"
                  >
                    Accept
                  </button>

                  <button
                    disabled={popupLoading}
                    onClick={() =>
                      handlePopupFollowRequest(popupNotification._id, "decline")
                    }
                    className="px-4 md:px-5 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-60"
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  onClick={markPopupRead}
                  className="px-4 md:px-5 py-3 rounded-2xl bg-emerald-400 text-black font-black hover:bg-emerald-300"
                >
                  Mark Read
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9998]"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed right-2 top-2 bottom-2 md:right-4 md:top-4 md:bottom-4 w-[94%] max-w-md bg-[#121212] text-white rounded-[2rem] shadow-2xl border border-white/10 p-4 md:p-5 z-[9999] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-emerald-400 font-black">
                    MuscleMetrics
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black">Menu</h3>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="bg-white/10 px-4 py-2 rounded-xl font-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                {allItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={item.id}
                      onClick={() => openPage(item.id)}
                      className={`text-left p-3.5 md:p-4 rounded-2xl font-black border transition flex items-center justify-between ${
                        activePage === item.id
                          ? "bg-emerald-400 text-black border-emerald-400"
                          : "bg-white/5 text-zinc-200 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm md:text-base">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </span>

                      {item.id === "notifications" &&
                        notificationCount > 0 && (
                          <span className="min-w-[24px] h-[24px] px-2 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
                            {notificationCount > 99
                              ? "99+"
                              : notificationCount}
                          </span>
                        )}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="text-left p-3.5 md:p-4 rounded-2xl font-black border bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500 hover:text-white mt-3"
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;