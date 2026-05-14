import { useEffect, useState } from "react";
import API, { apiFetch } from "../config/api";

function Notifications({ refresh, setRefresh, openProfile }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

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
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not load notifications.");
        setNotifications([]);
        return;
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notifications error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(
        `${API}/api/users/${userId}/notifications/read-all`,
        {
          method: "PUT",
          headers: authHeaders(),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not mark notifications as read.");
        return;
      }

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );

      setRefresh?.((prev) => prev + 1);
    } catch (error) {
      console.error("Mark all read error:", error.message);
    }
  };

  const handleFollowRequest = async (notificationId, action) => {
    try {
      setActionLoadingId(notificationId);

      const res = await fetch(
        `${API}/api/users/${userId}/follow-request/${notificationId}`,
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

    return new Date(dateValue).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  if (!userId) return <div>Please login first.</div>;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-6 md:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <p className="text-blue-100 font-black">Updates</p>

          <h1 className="text-4xl md:text-6xl font-black mt-2">
            Notifications
          </h1>

          <p className="text-white/80 mt-3">
            Follow requests, profile activity, and workout alerts.
          </p>
        </div>
      </section>

      <section className="bg-white border rounded-[2rem] p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-3xl font-black">Your Alerts</h2>

            <p className="text-gray-500">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>

          <button
            onClick={markAllRead}
            className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700"
          >
            Mark All Read
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 font-bold">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="bg-gray-50 border rounded-[2rem] p-8 text-center">
            <h3 className="text-2xl font-black">No notifications yet</h3>

            <p className="text-gray-500 mt-2">
              New followers and requests will show here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item, index) => {
              const isFollowRequest =
                item.type === "follow_request" && !item.resolved;

              return (
                <div
                  key={item._id || index}
                  className={`border rounded-2xl p-4 ${
                    item.read
                      ? "bg-gray-50 border-gray-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-black text-lg">
                        {item.type === "follow_request"
                          ? "👤 Follow Request"
                          : item.type === "follow_request_accepted"
                          ? "✅ Request Accepted"
                          : item.type === "follow_request_declined"
                          ? "❌ Request Declined"
                          : "🔔 Notification"}
                      </p>

                      <p className="text-gray-700 mt-1">{item.message}</p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {item.fromUserId && (
                          <button
                            onClick={() => openProfile?.(item.fromUserId)}
                            className="px-5 py-2 rounded-xl bg-gray-900 text-white font-black hover:bg-gray-800"
                          >
                            View Profile
                          </button>
                        )}

                        {isFollowRequest && (
                          <>
                            <button
                              disabled={actionLoadingId === item._id}
                              onClick={() =>
                                handleFollowRequest(item._id, "accept")
                              }
                              className="px-5 py-2 rounded-xl bg-green-600 text-white font-black hover:bg-green-700 disabled:opacity-60"
                            >
                              Accept
                            </button>

                            <button
                              disabled={actionLoadingId === item._id}
                              onClick={() =>
                                handleFollowRequest(item._id, "decline")
                              }
                              className="px-5 py-2 rounded-xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-60"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>

                      {item.resolved && item.type === "follow_request" && (
                        <p className="text-sm text-gray-500 font-bold mt-2">
                          Request resolved.
                        </p>
                      )}
                    </div>

                    {!item.read && (
                      <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    {formatTime(item.createdAt || item.updatedAt)}
                  </p>
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