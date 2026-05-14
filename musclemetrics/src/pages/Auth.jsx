import { useState } from "react";
import toast from "react-hot-toast";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "login" : "register";

    const body = isLogin
      ? { email, password }
      : { name, username, email, password };

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      toast.success(isLogin ? "Logged in!" : "Account created!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-800 p-10 text-white">
          <div>
            <h1 className="text-5xl font-black">
              Muscle<span className="text-blue-200">Metrics</span>
            </h1>
            <p className="mt-4 text-blue-100 text-lg">
              Track workouts, monitor progress, and compete with friends.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur">
              <p className="font-bold">🏆 Social Leaderboards</p>
              <p className="text-blue-100 text-sm">
                Add friends and compete on workout points.
              </p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur">
              <p className="font-bold">🔥 PR Tracking</p>
              <p className="text-blue-100 text-sm">
                Track personal records and progress over time.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAuth} className="p-8 md:p-12">
          <p className="text-blue-600 font-semibold text-sm">
            {isLogin ? "Welcome back" : "Start your journey"}
          </p>

          <h2 className="text-4xl font-black mt-1 mb-2">
            {isLogin ? "Login" : "Create Account"}
          </h2>

          <p className="text-gray-500 mb-8">
            {isLogin
              ? "Log in to continue tracking your training."
              : "Choose a unique username and create your athlete profile."}
          </p>

          {!isLogin && (
            <>
              <input
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                placeholder="Unique Username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                required
              />
            </>
          )}

          <input
            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-6 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl">
            {isLogin ? "Login" : "Create Account"}
          </button>

          <p className="text-center mt-6 text-sm text-gray-500">
            {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-blue-600 font-bold"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Auth;