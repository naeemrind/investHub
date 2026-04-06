import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "../lib/supabaseClient";
import PitchCard from "../components/PitchCard";
import {
  UserCircle,
  Calendar,
  Briefcase,
  Rocket,
  Shield,
  ArrowLeft,
  UserX,
} from "lucide-react";

function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch the user's profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError || !profileData) {
          if (isMounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (isMounted) setProfile(profileData);

        // 2. Fetch Portfolio based on role
        if (profileData.role === "owner") {
          const { data: pitchesData } = await supabase
            .from("pitches")
            .select("*, profiles(full_name)")
            .eq("owner_id", id)
            .order("created_at", { ascending: false });

          if (isMounted) setPortfolio(pitchesData || []);
        } else if (profileData.role === "investor") {
          const { data: interestsData } = await supabase
            .from("interests")
            .select("*, pitches(*, profiles(full_name))")
            .eq("investor_id", id)
            .order("created_at", { ascending: false });

          if (isMounted) {
            // Extract the actual pitches from the interests data
            // Added filter(Boolean) to remove any "ghost" pitches that were deleted
            const investorPitches =
              interestsData?.map((item) => item.pitches).filter(Boolean) || [];
            setPortfolio(investorPitches);
          }
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileData();

    return () => (isMounted = false);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12">
          <UserX className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            We couldn't find the user profile you're looking for. It may have
            been deleted or the link is incorrect.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition cursor-pointer"
          >
            <ArrowLeft size={18} /> Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = profile.role === "owner";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Profile Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <UserCircle
          className="text-gray-300 w-24 h-24 shrink-0"
          strokeWidth={1}
        />

        <div className="grow">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {profile.full_name || "Anonymous User"}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold border ${
                isOwner
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {isOwner ? <Rocket size={16} /> : <Briefcase size={16} />}
              {isOwner ? "Product Owner" : "Verified Investor"}
            </span>

            {profile.created_at && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                <Calendar size={16} />
                Joined{" "}
                {new Date(profile.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio / History Section */}
      <div className="mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
        <Shield className="text-indigo-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">
          {isOwner ? "Created Pitches" : "Investment History"}
        </h2>
      </div>

      {portfolio.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <p className="text-gray-500 font-medium">
            {isOwner
              ? "This user hasn't published any pitches yet."
              : "This investor hasn't expressed interest in any pitches yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((pitch) => (
            <PitchCard key={pitch.id} pitch={pitch} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicProfile;
