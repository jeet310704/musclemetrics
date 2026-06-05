import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../config/api";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";
    const body = isLogin ? { email, password } : { name, username, email, password };

    try {
      setLoading(true);
      const response = await apiFetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Authentication failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success(isLogin ? "Welcome back!" : "Account created!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-[130px]" />
        <div className="absolute right-[-8rem] bottom-0 h-[30rem] w-[30rem] rounded-full bg-blue-500/15 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-950 via-zinc-900 to-emerald-950 p-10 text-white">
          <div>
            <p className="text-emerald-400 text-sm font-black tracking-widest uppercase">Welcome to</p>
            <h1 className="text-5xl font-black mt-2 leading-tight">
              Muscle<span className="text-emerald-400">Metrics</span>
            </h1>
            <p className="mt-4 text-zinc-400 text-base leading-relaxed">
              Track workouts, monitor progress, and compete with your gym community.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/[0.06] border border-white/10 p-5 rounded-2xl backdrop-blur">
              <p className="font-black text-emerald-400">🏆 Social Leaderboards</p>
              <p className="text-zinc-400 text-sm mt-1">Follow friends and compete on weekly workout points.</p>
            </div>

            <div className="bg-white/[0.06] border border-white/10 p-5 rounded-2xl backdrop-blur">
              <p className="font-black text-emerald-400">🔥 Streak Tracking</p>
              <p className="text-zinc-400 text-sm mt-1">Build streaks, earn rewards, and break your PRs.</p>
            </div>

            <div className="bg-white/[0.06] border border-white/10 p-5 rounded-2xl backdrop-blur">
              <p className="font-black text-emerald-400">🤖 AI Coach</p>
              <p className="text-zinc-400 text-sm mt-1">Personalized workout recommendations powered by AI.</p>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <form onSubmit={handleAuth} className="bg-white p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile logo */}
          <p className="md:hidden text-2xl font-black mb-6">
            Muscle<span className="text-emerald-500">Metrics</span>
          </p>

          <p className="text-emerald-600 font-black text-sm tracking-wide uppercase">
            {isLogin ? "Welcome back" : "Start your journey"}
          </p>

          <h2 className="text-4xl font-black mt-1 mb-2 tracking-tight">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          <p className="text-gray-400 mb-8 text-sm">
            {isLogin
              ? "Log in to continue tracking your training."
              : "Choose a unique username and build your athlete profile."}
          </p>

          {!isLogin && (
            <>
              <input
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition"
                placeholder="Username (unique)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                required
              />
            </>
          )}

          <input
            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-6 outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-black shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-emerald-600 font-black hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Sign In"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Auth;
