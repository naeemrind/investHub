import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router";
import { LogIn, Mail, Lock } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = form.email.trim();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: form.password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="h-[calc(100vh-76px)] flex items-center justify-center bg-gray-50 px-4 overflow-hidden">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Log in to continue your journey.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50"
            />
          </div>
          <div>
            <div className="flex items-center justify-end mb-1">
              <span className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium transition">
                Forgot Password?
              </span>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-sm cursor-pointer"
          >
            {loading ? "Verifying..." : "Log In"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition cursor-pointer"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
