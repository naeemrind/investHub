import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import PitchCard from "../components/PitchCard";
import ConfirmationModal from "../components/ConfirmationModal";
import { Link } from "react-router";
import {
  Briefcase,
  Rocket,
  Plus,
  FolderOpen,
  DollarSign,
  Star,
  Activity,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Compass,
} from "lucide-react";

// Reusable polished Stat Card Component
const StatCard = ({ title, value, colorTheme, heatLabel }) => {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const theme = themes[colorTheme] || themes.indigo;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      {/* Abstract Background Decoration */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700 ease-out ${theme.split(" ")[0]}`}
      ></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            {title}
            {heatLabel && (
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  heatLabel === "Hot"
                    ? "bg-red-100 text-red-700"
                    : heatLabel === "Warm"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {heatLabel}
              </span>
            )}
          </p>
          <h4 className="text-3xl font-black text-gray-900 tracking-tight">
            {value}
          </h4>
        </div>
        <div
          className={`p-3.5 rounded-xl ${theme} shadow-sm group-hover:rotate-6 transition-transform`}
        >
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const { user, profile } = useSelector((state) => state.auth);
  const [myPitches, setMyPitches] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [pitchInterestsData, setPitchInterestsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pitchToEdit, setPitchToEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchOwnerDashboard = async () => {
      setLoading(true);
      try {
        const { data: pitchesData } = await supabase
          .from("pitches")
          .select("*")
          .eq("owner_id", user?.id)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        const pitches = pitchesData || [];
        setMyPitches(pitches);

        if (pitches.length > 0) {
          const pitchIds = pitches.map((p) => p.id);
          const { data: interestData } = await supabase
            .from("interests")
            .select("*")
            .in("pitch_id", pitchIds);

          if (isMounted && interestData) {
            const interestCounts = {};
            interestData.forEach((interest) => {
              interestCounts[interest.pitch_id] =
                (interestCounts[interest.pitch_id] || 0) + 1;
            });
            setPitchInterestsData(interestCounts);
          }
        }
      } catch (err) {
        notify("error", "Failed to load your pitches.", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchInvestorDashboard = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("interests")
          .select("*, pitches(*)")
          .eq("investor_id", user?.id)
          .order("created_at", { ascending: false });

        if (isMounted) {
          setMyInterests(data || []);
        }
      } catch (err) {
        notify("error", "Failed to load your interested pitches.", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (profile?.role === "owner") fetchOwnerDashboard();
    if (profile?.role === "investor") fetchInvestorDashboard();

    return () => (isMounted = false);
  }, [profile, user]);

  const triggerDelete = (id) => {
    setPitchToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pitchToDelete) return;
    const { error } = await supabase
      .from("pitches")
      .delete()
      .eq("id", pitchToDelete);

    if (error) {
      notify("error", "Could not delete pitch: " + error.message);
      return;
    }

    setMyPitches((prev) => prev.filter((p) => p.id !== pitchToDelete));
    setIsDeleteModalOpen(false);
    setPitchToDelete(null);
    notify("success", "Pitch successfully removed.");
  };

  const triggerEdit = (pitch) => {
    setPitchToEdit(pitch);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setPitchToEdit({ ...pitchToEdit, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const { data, error } = await supabase
      .from("pitches")
      .update({
        title: pitchToEdit.title.trim(),
        description: pitchToEdit.description.trim(),
        funding_goal: Number(pitchToEdit.funding_goal),
        category: pitchToEdit.category.trim() || "General",
        video_url: pitchToEdit.video_url.trim(),
      })
      .eq("id", pitchToEdit.id)
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      notify("error", "Error updating pitch: " + error.message);
      return;
    }

    setMyPitches((prev) =>
      prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)),
    );
    setIsEditModalOpen(false);
    setPitchToEdit(null);
    notify("success", "Pitch updated successfully!");
  };

  const totalOwnerFundingGoal = myPitches.reduce(
    (acc, p) => acc + Number(p.funding_goal || 0),
    0,
  );
  const totalOwnerInterests = Object.values(pitchInterestsData).reduce(
    (acc, curr) => acc + curr,
    0,
  );
  const totalInvestorPipeline = myInterests.reduce(
    (acc, item) => acc + Number(item.pitches?.funding_goal || 0),
    0,
  );

  const getInterestHeat = (count) => {
    if (count === 0) return "Cold";
    if (count < 5) return "Warm";
    return "Hot";
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 relative">
      {/* Toast Notifications */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-100 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-8 duration-300 font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 opacity-50 hover:opacity-100 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Premium Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 sm:p-10 mb-10 text-white shadow-xl relative overflow-hidden">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-purple-400 opacity-[0.05] rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl font-extrabold shadow-inner">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
              </h1>
              <p className="text-indigo-200 mt-2 flex items-center gap-2 text-sm sm:text-base font-medium">
                Logged in as
                <span className="bg-white/20 px-2.5 py-0.5 rounded-md text-white font-bold uppercase tracking-widest text-[10px] shadow-sm">
                  {profile?.role || "Guest"}
                </span>
              </p>
            </div>
          </div>
          {profile?.role === "owner" && (
            <Link
              to="/create-pitch"
              className="bg-white text-indigo-900 px-6 py-3.5 rounded-xl font-extrabold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} strokeWidth={2.5} /> Create New Pitch
            </Link>
          )}
        </div>
      </div>

      {/* ----------------- OWNER VIEW ----------------- */}
      {profile?.role === "owner" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard
              title="Active Pitches"
              value={myPitches.length}
              icon={FolderOpen}
              colorTheme="indigo"
            />
            <StatCard
              title="Capital Seeking"
              value={`$${totalOwnerFundingGoal.toLocaleString()}`}
              icon={DollarSign}
              colorTheme="emerald"
            />
            <StatCard
              title="Total Interests"
              value={totalOwnerInterests}
              icon={Activity}
              colorTheme="orange"
              heatLabel={getInterestHeat(totalOwnerInterests)}
            />
          </div>

          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-900">
              Manage My Pitches
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-87.5 bg-gray-100 rounded-2xl border border-gray-200"
                ></div>
              ))}
            </div>
          ) : myPitches.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center shadow-sm">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Rocket size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Your portfolio is empty
              </h3>
              <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
                You haven't published any pitches yet. Start attracting
                investors today!
              </p>
              <Link
                to="/create-pitch"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={20} /> Create Your First Pitch
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myPitches.map((pitch) => (
                <PitchCard
                  key={pitch.id}
                  pitch={pitch}
                  interestedCount={pitchInterestsData[pitch.id] || 0}
                  onDelete={triggerDelete}
                  onEdit={triggerEdit}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ----------------- INVESTOR VIEW ----------------- */}
      {profile?.role === "investor" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <StatCard
              title="Expressed Interests"
              value={myInterests.length}
              icon={Star}
              colorTheme="purple"
            />
            <StatCard
              title="Investment Pipeline"
              value={`$${totalInvestorPipeline.toLocaleString()}`}
              icon={DollarSign}
              colorTheme="emerald"
            />
          </div>

          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-900">
              My Saved Opportunities
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-87.5 bg-gray-100 rounded-2xl border border-gray-200"
                ></div>
              ))}
            </div>
          ) : myInterests.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center shadow-sm">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Compass size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                No saved opportunities
              </h3>
              <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
                Your pipeline is currently empty. Explore the marketplace to
                find exciting startups.
              </p>
              <Link
                to="/"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Compass size={20} /> Explore Pitches
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myInterests.map((item) => (
                <div key={item.id}>
                  {item.pitches ? (
                    <PitchCard pitch={item.pitches} interestedCount={1} /> // For investors, they are at least 1 count interested.
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-300 text-gray-400 text-center h-87.5 flex flex-col items-center justify-center gap-3">
                      <Trash2 size={32} className="opacity-50" />
                      <p className="font-semibold">Pitch no longer available</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Safe Deletion Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Pitch"
        message="Are you sure you want to permanently delete this pitch? This action will remove it from all investors' feeds and cannot be undone."
      />

      {/* Premium Edit Pitch Modal */}
      {isEditModalOpen && pitchToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8 border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">
                Edit Pitch Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={submitEdit} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Pitch Title
                </label>
                <input
                  required
                  maxLength={100}
                  name="title"
                  value={pitchToEdit.title}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  maxLength={5000}
                  name="description"
                  rows={4}
                  value={pitchToEdit.description}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Funding Goal ($)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="funding_goal"
                    value={pitchToEdit.funding_goal}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Category
                  </label>
                  <input
                    name="category"
                    value={pitchToEdit.category || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={pitchToEdit.video_url || ""}
                  onChange={handleEditChange}
                  placeholder="https://youtube.com/..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    "Saving Changes..."
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
