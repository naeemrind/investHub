import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useSelector } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import {
  Tag,
  PlayCircle,
  Star,
  CheckCircle,
  UserCircle,
  ArrowLeft,
} from "lucide-react";

// Helper function to extract YouTube Video ID
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function PitchDetail() {
  const { id } = useParams();
  const { user, profile } = useSelector((state) => state.auth);
  const [pitch, setPitch] = useState(null);
  const [owner, setOwner] = useState(null);
  const [interested, setInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPitchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Pitch
        const { data: pitchData, error: pitchError } = await supabase
          .from("pitches")
          .select("*")
          .eq("id", id)
          .single();

        if (pitchError || !pitchData) {
          if (isMounted) setPitch(null);
          return;
        }

        if (isMounted) setPitch(pitchData);

        // 2. Fetch Owner (Concurrent)
        const { data: ownerData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", pitchData.owner_id)
          .single();

        if (isMounted) setOwner(ownerData);

        // 3. Fetch Interest Status (Concurrent)
        if (user) {
          const { data: interestData } = await supabase
            .from("interests")
            .select("id")
            .eq("investor_id", user.id)
            .eq("pitch_id", id)
            .single();

          if (isMounted) setInterested(!!interestData);
        }
      } catch (err) {
        console.error("Error loading pitch:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPitchData();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const toggleInterest = async () => {
    if (!user) return alert("Please login to express interest.");

    setIsToggling(true);
    try {
      if (interested) {
        const { error } = await supabase
          .from("interests")
          .delete()
          .eq("investor_id", user.id)
          .eq("pitch_id", id);

        if (error) throw error;
        setInterested(false);
      } else {
        const { error } = await supabase
          .from("interests")
          .insert({ investor_id: user.id, pitch_id: id });

        if (error) throw error;
        setInterested(true);
      }
    } catch (err) {
      alert("Something went wrong: " + err.message);
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading pitch details...
        </p>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pitch Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The pitch you are looking for may have been deleted or moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition cursor-pointer"
          >
            <ArrowLeft size={18} /> Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const youtubeId = getYouTubeId(pitch.video_url);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to All Pitches
      </Link>

      <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md font-semibold border border-indigo-100">
        <Tag size={14} />
        {pitch.category || "General"}
      </span>

      <h1 className="text-4xl font-extrabold text-gray-900 mt-4 leading-tight">
        {pitch.title}
      </h1>

      <p className="text-gray-600 mt-5 text-lg leading-relaxed whitespace-pre-wrap">
        {pitch.description}
      </p>

      <div className="mt-8 p-6 bg-linear-to-br from-indigo-50 to-white border border-indigo-100 rounded-lg shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Funding Goal
          </p>
          <p className="text-3xl font-black text-gray-900 mt-1">
            ${Number(pitch.funding_goal).toLocaleString()}
          </p>
        </div>
      </div>

      {pitch.video_url && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Pitch Deck Video
          </h2>
          {youtubeId ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg inline-block">
              <a
                href={pitch.video_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition cursor-pointer"
              >
                <PlayCircle size={20} /> Watch Video (External Link)
              </a>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center gap-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
        <UserCircle className="text-gray-400" size={48} strokeWidth={1} />
        <div>
          <p className="text-sm text-gray-500 font-medium">Posted by</p>
          <p className="font-bold text-gray-900 text-lg">
            {owner?.full_name || "Unknown Owner"}
          </p>
        </div>
      </div>

      {profile?.role === "investor" && (
        <button
          onClick={toggleInterest}
          disabled={isToggling}
          className={`mt-8 w-full sm:w-auto px-8 py-3.5 rounded-md font-bold text-base transition-all shadow-sm cursor-pointer flex justify-center items-center gap-2 ${
            interested
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-indigo-600 text-white border border-transparent hover:bg-indigo-700 hover:shadow-md"
          } ${isToggling ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isToggling ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : interested ? (
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
