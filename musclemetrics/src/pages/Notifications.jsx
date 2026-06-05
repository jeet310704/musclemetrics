import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import API from "../config/api";

function Notifications({ refresh, setRefresh, openProfile }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;
  const getToken = () => localStorage.getItem("token");
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId, refresh]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/users/${userId}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) { setNotifications([]); return; }
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notifications error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API}/api/users/${userId}/notifications/read-all`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Could not mark as read."); return; }
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setRefresh?.((prev) => prev + 1);
    } catch (error) {
      console.error("Mark all read error:", error.message);
    }
  };

  const handleFollowRequest = async (notificationId, action) => {
    try {
      setActionLoadingId(notificationId);
      const res = await fetch(`${API}/api/users/${userId}/follow-request/${notificationId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Could not update request."); return; }
      await fetchNotifications();
      setRefresh?.((prev) => prev + 1);
    } catch (error) {
      console.error("Follow request action error:", error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const typeConfig = {
    follow_request: { icon: "👤", label: "Follow Request", color: "bg-blue-100 text-blue-700" },
    follow_request_accepted: { icon: "✅", label: "Request Accepted", color: "bg-emerald-100 text-emerald-700" },
    follow_request_declined: { icon: "❌", label: "Request Declined", color: "bg-red-100 text-red-700" },
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-5 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-blue-200 font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <Bell className="h-4 w-4" /> Updates
          </p>
          <h1 className="text-3xl md:text-6xl font-black mt-2">Notifications</h1>
          <p className="text-white/70 mt-2 text-sm md:text-base">Follow requests, profile activity, and workout alerts.</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">Your Alerts</h2>
            <p className="text-gray-500 text-sm">
              {unreadCount > 0 ? (
                <span className="text-blue-600 font-bold">{unreadCount} unread</span>
              ) : (
                "All caught up!"
              )}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition text-sm"
            >
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-16" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-gray-50 border rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-xl md:text-2xl font-black">No notifications yet</h3>
            <p className="text-gray-500 mt-2 text-sm">New followers and requests will show here.</p>
          </div>
        ) : (
          <div className="space-y-2.5 md:space-y-3">
            {notifications.map((item, index) => {
              const isFollowRequest = item.type === "follow_request" && !item.resolved;
              const config = typeConfig[item.type] || { icon: "🔔", label: "Notification", color: "bg-gray-100 text-gray-700" };

              return (
                <div
                  key={item._id || index}
                  className={`border rounded-2xl p-4 transition-colors ${
                    item.read ? "bg-white border-gray-200" : "bg-blue-50/60 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon badge */}
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${config.color}`}>
                      {config.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-black text-sm md:text-base">{config.label}</p>
                          <p className="text-gray-600 text-sm mt-0.5">{item.message}</p>
                        </div>
                        {!item.read && (
                          <span className="shrink-0 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.fromUserId && (
                          <button
                            onClick={() => openProfile?.(item.fromUserId)}
                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-slate-900 text-white font-black text-xs md:text-sm hover:bg-slate-800 transition"
                          >
                            View Profile
                          </button>
                        )}

                        {isFollowRequest && (
                          <>
                            <button
                              disabled={actionLoadingId === item._id}
                              onClick={() => handleFollowRequest(item._id, "accept")}
                              className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-emerald-500 text-white font-black text-xs md:text-sm hover:bg-emerald-600 disabled:opacity-60 transition"
                            >
                              Accept
                            </button>
                            <button
                              disabled={actionLoadingId === item._id}
                              onClick={() => handleFollowRequest(item._id, "decline")}
                              className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-red-100 text-red-600 font-black text-xs md:text-sm hover:bg-red-500 hover:text-white disabled:opacity-60 transition"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {item.resolved && item.type === "follow_request" && (
                          <span className="text-xs text-gray-400 font-bold self-center">Resolved</span>
                        )}
                      </div>

                      <p className="text-[10px] md:text-xs text-gray-400 mt-2">
                        {formatTime(item.createdAt || item.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Notifications;
