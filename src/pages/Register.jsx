import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router";
import {
  Briefcase,
  Rocket,
  User,
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "investor",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // 1. Client-side Validation
    const cleanEmail = form.email.trim();
    const cleanName = form.full_name.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 2. Auth Sign Up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      if (data?.user?.id) {
        // 3. Profile Creation
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: cleanName,
          role: form.role,
        });

        if (profileError) {
          // This is the "Zombie User" edge case.
          // In a production app, use a PostgreSQL trigger to automate this.
          console.error("Profile creation failed:", profileError.message);
          throw new Error(
            "Account created, but we couldn't set up your profile. Please try logging in or contact support.",
          );
        }
      } else {
        throw new Error("Registration failed. Please try again.");
      }

      // Success!
      navigate("/dashboard");
    } catch (err) {
      // Handle "User already registered" specifically
      if (err.message.toLowerCase().includes("already registered")) {
        setError("This email is already in use. Try logging in instead.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-76px)] flex items-center justify-center bg-gray-50 px-4 overflow-hidden">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Join InvestHub
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Select your path to get started.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 flex items-start gap-2 border border-red-100 font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "investor" })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-semibold text-sm transition-all border-2 cursor-pointer ${
                form.role === "investor"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Briefcase size={16} /> Investor
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "owner" })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-semibold text-sm transition-all border-2 cursor-pointer ${
                form.role === "owner"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Rocket size={16} /> Product Owner
            </button>
          </div>

          {/* Input Fields */}
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              name="full_name"
              type="text"
              required
              placeholder="Full Name"
              onChange={handleChange}
              value={form.full_name}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50"
            />
          </div>
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
              value={form.email}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50"
            />
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
              placeholder="Password (min 6 chars)"
              onChange={handleChange}
              value={form.password}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer shadow-sm flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center italic">
          Note: You may be asked to confirm your email address to activate your
          account.
        </p>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition cursor-pointer"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
