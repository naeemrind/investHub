import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import PitchCard from "../components/PitchCard";
import { Link } from "react-router";
import {
  Briefcase,
  Rocket,
  Plus,
  FolderOpen,
  DollarSign,
  Users,
  Star,
} from "lucide-react";

function Dashboard() {
  const { user, profile } = useSelector((state) => state.auth);
  const [myPitches, setMyPitches] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [pitchInterestsData, setPitchInterestsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchOwnerDashboard = async () => {
      setLoading(true);
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
      if (isMounted) setLoading(false);
    };

    const fetchInvestorDashboard = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("interests")
        .select("*, pitches(*)")
        .eq("investor_id", user?.id)
        .order("created_at", { ascending: false });

      if (isMounted) {
        setMyInterests(data || []);
        setLoading(false);
      }
    };

    if (profile?.role === "owner") fetchOwnerDashboard();
    if (profile?.role === "investor") fetchInvestorDashboard();

    return () => (isMounted = false);
  }, [profile, user]);

  const deletePitch = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this pitch?"))
      return;
    await supabase.from("pitches").delete().eq("id", id);
    setMyPitches((prev) => prev.filter((p) => p.id !== id));
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            {profile?.role === "owner" ? (
              <Rocket className="text-indigo-600" />
            ) : (
              <Briefcase className="text-indigo-600" />
            )}
            My Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Welcome back,{" "}
            <span className="font-semibold text-gray-700">
              {profile?.full_name}
            </span>
            . Logged in as{" "}
            <span className="text-indigo-600 font-semibold capitalize">
              {profile?.role}
            </span>
            .
          </p>
        </div>
        {profile?.role === "owner" && (
          <Link
            to="/create-pitch"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} /> New Pitch
          </Link>
        )}
      </div>

      {/* ----------------- OWNER VIEW ----------------- */}
      {profile?.role === "owner" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Active Pitches
                </p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {myPitches.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md">
                <FolderOpen size={24} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Capital Seeking
                </p>
                <p className="text-2xl font-extrabold text-gray-900">
                  ${totalOwnerFundingGoal.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-md">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Investor Interests
                </p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {totalOwnerInterests}
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-md">
                <Users size={24} />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            Manage My Pitches
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : myPitches.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Rocket className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900">
                No pitches yet
              </h3>
              <p className="text-gray-500 mt-1 mb-6">
                Create your first pitch to attract investors.
              </p>
              <Link
                to="/create-pitch"
                className="text-indigo-600 font-medium hover:underline cursor-pointer"
              >
                Get Started &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPitches.map((pitch) => (
                <PitchCard
                  key={pitch.id}
                  pitch={pitch}
                  interestedCount={pitchInterestsData[pitch.id] || 0}
                  onDelete={deletePitch}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ----------------- INVESTOR VIEW ----------------- */}
      {profile?.role === "investor" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Expressed Interests
                </p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {myInterests.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md">
                <Star size={24} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Investment Pipeline
                </p>
                <p className="text-2xl font-extrabold text-gray-900">
                  ${totalInvestorPipeline.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-md">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            My Saved Opportunities
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-56 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : myInterests.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Star className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900">
                No interests expressed
              </h3>
              <p className="text-gray-500 mt-1 mb-6">
                Explore the homepage to find exciting startups.
              </p>
              <Link
                to="/"
                className="text-indigo-600 font-medium hover:underline cursor-pointer"
              >
                Explore Pitches &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myInterests.map((item) => (
                <div key={item.id}>
                  {item.pitches ? (
                    <PitchCard pitch={item.pitches} />
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-400 text-center h-full flex items-center justify-center">
                      Pitch no longer available
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
