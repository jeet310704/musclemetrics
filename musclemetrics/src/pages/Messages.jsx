import { useEffect, useRef, useState } from "react";
import API from "../config/api";


function Messages({ refresh, openProfile }) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?._id || storedUser?.id;

  const bottomRef = useRef(null);

  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    if (userId) fetchChats();
  }, [userId, refresh]);

  // Reload open conversation when socket triggers a refresh
  useEffect(() => {
    if (userId && selectedUser?._id) {
      loadConversation(selectedUser._id);
    }
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserName = (u) =>
    u?.name || u?.username || u?.email?.split("@")[0] || "User";

  const getUserHandle = (u) =>
    u?.username || u?.email?.split("@")[0] || "user";

  const getProfileImage = (u) =>
    u?.profilePicture || "https://via.placeholder.com/120?text=U";

  const getMessageUser = (chat) => {
    return chat.user || chat.otherUser || chat.receiver || chat.sender || chat;
  };

  const isMine = (message) => {
    const sender = message.sender || message.senderId || message.from;
    const senderId = typeof sender === "object" ? sender._id : sender;
    return String(senderId) === String(userId);
  };

  const getMessageText = (message) => {
    return message.text || message.message || message.content || "";
  };

  const fetchChats = async () => {
    try {
      setLoadingChats(true);

      const res = await fetch(`${API}/api/messages/chats/${userId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not load chats.");
        setChats([]);
        return;
      }

      setChats(Array.isArray(data) ? data : data.chats || []);
    } catch (error) {
      console.error("Get chats error:", error.message);
    } finally {
      setLoadingChats(false);
    }
  };

  const runSearch = async () => {
    if (!search.trim()) return;

    try {
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
        alert(data.message || "Could not search users.");
        return;
      }

      setSearchUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search users error:", error.message);
    }
  };

  const loadConversation = async (otherUserId) => {
    try {
      setLoadingMessages(true);

      const res = await fetch(
        `${API}/api/messages/conversation/${userId}/${otherUserId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Could not load conversation.");
        setMessages([]);
        return;
      }

      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch (error) {
      console.error("Get conversation error:", error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const openConversation = async (otherUser) => {
    const cleanUser = getMessageUser(otherUser);
    setSelectedUser(cleanUser);
    setSearchUsers([]);
    await loadConversation(cleanUser._id);
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser?._id) return;

    const payload = {
      receiverId: selectedUser._id,
      text: text.trim(),
    };

    try {
      setSending(true);

      const res = await fetch(`${API}/api/messages/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not send message.");
        return;
      }

      setText("");
      await loadConversation(selectedUser._id);
      await fetchChats();
    } catch (error) {
      console.error("Send message error:", error.message);
    } finally {
      setSending(false);
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

  if (!userId) return <div>Please login first.</div>;

  // On mobile: show only the chat panel when a conversation is open
  const showList = !selectedUser;
  const showConversation = !!selectedUser;

  return (
    <div className="space-y-4 md:space-y-6">
      <section className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-5 md:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <p className="text-blue-200 font-black text-sm">Gym Chat</p>
          <h1 className="text-3xl md:text-6xl font-black mt-1 md:mt-2">Messages</h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base">
            Chat with users and open profiles from conversations.
          </p>
        </div>
      </section>

      {/* Mobile: show either list or conversation, not both */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">

        {/* Left panel: chat list — hidden on mobile when a conversation is open */}
        <div
          className={`bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-xl xl:col-span-1 ${
            showConversation ? "hidden xl:block" : "block"
          }`}
        >
          <h2 className="text-xl md:text-2xl font-black mb-3 md:mb-4">Find Users</h2>

          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search users..."
              className="flex-1 p-3 rounded-2xl bg-gray-100 border outline-none text-sm md:text-base"
            />

            <button
              onClick={runSearch}
              className="px-4 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm md:text-base"
            >
              Go
            </button>
          </div>

          {searchUsers.length > 0 && (
            <div className="space-y-2 mt-3">
              {searchUsers.map((u) => (
                <div
                  key={u._id}
                  className="bg-gray-50 border rounded-2xl p-3 flex items-center gap-3"
                >
                  <button onClick={() => openProfile?.(u._id)}>
                    <img
                      src={getProfileImage(u)}
                      alt="profile"
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border"
                    />
                  </button>

                  <button
                    onClick={() => openConversation(u)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="font-black text-sm md:text-base truncate">{getUserName(u)}</p>
                    <p className="text-xs text-gray-500 truncate">@{getUserHandle(u)}</p>
                  </button>

                  <button
                    onClick={() => openProfile?.(u._id)}
                    className="px-2 py-1.5 md:px-3 md:py-2 rounded-xl bg-gray-900 text-white text-xs md:text-sm font-black shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl md:text-2xl font-black mt-6 mb-3 md:mb-4">Chats</h2>

          {loadingChats ? (
            <p className="text-gray-500 font-bold text-sm">Loading chats...</p>
          ) : chats.length === 0 ? (
            <p className="text-gray-500 font-bold text-sm">No chats yet. Search for a user to start!</p>
          ) : (
            <div className="space-y-2">
              {chats.map((chat, index) => {
                const u = getMessageUser(chat);

                return (
                  <button
                    key={u?._id || index}
                    onClick={() => openConversation(u)}
                    className={`w-full text-left border rounded-2xl p-3 flex items-center gap-3 transition-colors ${
                      selectedUser?._id === u?._id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <img
                      src={getProfileImage(u)}
                      alt="profile"
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-black truncate text-sm md:text-base">{getUserName(u)}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.lastMessage || `@${getUserHandle(u)}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel: conversation — full width on mobile when open */}
        <div
          className={`bg-white border rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-xl xl:col-span-2 flex flex-col ${
            showConversation ? "block" : "hidden xl:flex"
          }`}
          style={{ minHeight: showConversation ? "calc(100vh - 200px)" : "650px", maxHeight: showConversation ? "calc(100vh - 200px)" : "none" }}
        >
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <p className="text-6xl mb-3">💬</p>
                <h2 className="text-3xl font-black">Select a chat</h2>
                <p className="text-gray-500 mt-2">
                  Search or choose a user to start messaging.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b pb-3 mb-3 flex items-center gap-3">
                {/* Back button — only visible on mobile */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="xl:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
                  aria-label="Back to chats"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button onClick={() => openProfile?.(selectedUser._id)} className="shrink-0">
                  <img
                    src={getProfileImage(selectedUser)}
                    alt="profile"
                    className="w-10 h-10 md:w-14 md:h-14 rounded-2xl object-cover border"
                  />
                </button>

                <button
                  onClick={() => openProfile?.(selectedUser._id)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-base md:text-xl font-black truncate">
                    {getUserName(selectedUser)}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 truncate">
                    @{getUserHandle(selectedUser)}
                  </p>
                </button>

                <button
                  onClick={() => openProfile?.(selectedUser._id)}
                  className="px-3 py-2 md:px-4 md:py-2 rounded-xl bg-gray-900 text-white font-black text-sm shrink-0"
                >
                  Profile
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingMessages ? (
                  <p className="text-gray-500 font-bold text-sm">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <p className="text-5xl mb-2">👋</p>
                      <p className="font-black text-xl">No messages yet</p>
                      <p className="text-gray-500">Send the first message.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`flex ${
                        isMine(message) ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          isMine(message)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="font-semibold text-sm md:text-base">
                          {getMessageText(message)}
                        </p>
                        <p
                          className={`text-[10px] md:text-[11px] mt-1 ${
                            isMine(message) ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                <div ref={bottomRef} />
              </div>

              <div className="border-t pt-3 mt-3 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 md:p-4 rounded-2xl bg-gray-100 border outline-none text-sm md:text-base"
                />

                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-blue-600 text-white font-black disabled:opacity-60 text-sm md:text-base"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Messages;
