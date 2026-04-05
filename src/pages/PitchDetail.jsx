import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import { Tag, PlayCircle, Star, CheckCircle, UserCircle } from "lucide-react";

function PitchDetail() {
  const { id } = useParams();
  const { user, profile } = useSelector((state) => state.auth);
  const [pitch, setPitch] = useState(null);
  const [owner, setOwner] = useState(null);
  const [interested, setInterested] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPitch = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("pitches")
        .select("*")
        .eq("id", id)
        .single();

      if (isMounted && data) {
        setPitch(data);
        const { data: ownerData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.owner_id)
          .single();
        if (isMounted) setOwner(ownerData);
      }

      if (user && data && isMounted) {
        const { data: interestData } = await supabase
          .from("interests")
          .select("id")
          .eq("investor_id", user.id)
          .eq("pitch_id", id)
          .single();
        setInterested(!!interestData);
      }

      if (isMounted) setLoading(false);
    };

    fetchPitch();

    return () => (isMounted = false);
  }, [id, user]);

  const toggleInterest = async () => {
    if (!user) return alert("Please login to express interest.");

    if (interested) {
      await supabase
        .from("interests")
        .delete()
        .eq("investor_id", user.id)
        .eq("pitch_id", id);
      setInterested(false);
    } else {
      await supabase
        .from("interests")
        .insert({ investor_id: user.id, pitch_id: id });
      setInterested(true);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500 font-medium">
        Loading details...
      </p>
    );
  if (!pitch)
    return (
      <p className="text-center mt-20 text-gray-500 font-medium">
        Pitch not found.
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md font-semibold border border-indigo-100">
        <Tag size={14} />
        {pitch.category || "General"}
      </span>
      <h1 className="text-4xl font-extrabold text-gray-900 mt-4 leading-tight">
        {pitch.title}
      </h1>
      <p className="text-gray-600 mt-5 text-lg leading-relaxed">
        {pitch.description}
      </p>

      <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-lg shadow-sm">
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          Funding Goal
        </p>
        <p className="text-3xl font-black text-gray-900 mt-1">
          ${Number(pitch.funding_goal).toLocaleString()}
        </p>
      </div>

      {pitch.video_url && (
        <div className="mt-6">
          <a
            href={pitch.video_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition cursor-pointer"
          >
            <PlayCircle size={20} /> Watch Pitch Video
          </a>
        </div>
      )}

      {owner && (
        <div className="mt-8 flex items-center gap-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
          <UserCircle className="text-gray-400" size={48} strokeWidth={1} />
          <div>
            <p className="text-sm text-gray-500 font-medium">Posted by</p>
            <p className="font-bold text-gray-900 text-lg">{owner.full_name}</p>
          </div>
        </div>
      )}

      {profile?.role === "investor" && (
        <button
          onClick={toggleInterest}
          className={`mt-8 w-full sm:w-auto px-8 py-3.5 rounded-md font-bold text-base transition-all shadow-sm cursor-pointer flex justify-center items-center gap-2 ${
            interested
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-indigo-600 text-white border border-transparent hover:bg-indigo-700 hover:shadow-md"
          }`}
        >
          {interested ? (
            <>
              <CheckCircle size={20} /> Interest Expressed (Click to Remove)
            </>
          ) : (
            <>
              <Star size={20} /> Express Interest in this Pitch
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default PitchDetail;
