import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useDispatch } from "react-redux";
import { supabase } from "./lib/supabaseClient";
import { setUser, clearAuth, setProfile } from "./store/slices/authSlice";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePitch from "./pages/CreatePitch";
import PitchDetail from "./pages/PitchDetail";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";

function App() {
  const dispatch = useDispatch();

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) dispatch(setProfile(data));
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    }
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser(session.user));
        fetchProfile(session.user.id);
      } else {
        dispatch(clearAuth());
      }
    });

    // 2. Listen for Auth Changes (Login/Logout/Token Refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          dispatch(setUser(session.user));
          fetchProfile(session.user.id);
        } else {
          dispatch(clearAuth());
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pitch/:id" element={<PitchDetail />} />
        <Route path="/profile/:id" element={<PublicProfile />} />

        {/* AUTHENTICATED ROUTES (Any Role) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* OWNER ONLY ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route path="/create-pitch" element={<CreatePitch />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
