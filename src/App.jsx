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

function App() {
  const dispatch = useDispatch();

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) dispatch(setProfile(data));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser(session.user));
        fetchProfile(session.user.id);
      } else {
        dispatch(clearAuth());
      }
    });

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
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pitch/:id" element={<PitchDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-pitch" element={<CreatePitch />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
