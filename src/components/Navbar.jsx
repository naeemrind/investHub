import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import {
  Rocket,
  Compass,
  LayoutDashboard,
  Plus,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

function Navbar() {
  const { user, profile } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link
        to="/"
        className="flex items-center gap-2 text-xl font-bold text-indigo-600 cursor-pointer"
      >
        <Rocket size={24} />
        InvestHub
      </Link>
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition cursor-pointer"
        >
          <Compass size={18} />
          Pitches
        </Link>
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition cursor-pointer"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            {profile?.role === "owner" && (
              <Link
                to="/create-pitch"
                className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm cursor-pointer"
              >
                <Plus size={18} />
                New Pitch
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition cursor-pointer"
            >
              <User size={18} />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition cursor-pointer"
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition cursor-pointer"
            >
              <LogIn size={18} />
              Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm cursor-pointer"
            >
              <UserPlus size={18} />
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
