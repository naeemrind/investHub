import { Link } from "react-router";
import { useSelector } from "react-redux";
import {
  Tag,
  ArrowRight,
  Trash2,
  Users,
  User,
  Pencil,
  PlayCircle,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";

// Helper function to extract YouTube Video ID
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function PitchCard({ pitch, interestedCount, onDelete, onEdit }) {
  const { user } = useSelector((state) => state.auth);
  const youtubeId = getYouTubeId(pitch.video_url);
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` // upgraded to higher quality thumbnail
    : null;

  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300">
      {/* Image / Thumbnail Section */}
      <div className="relative h-52 bg-gray-50 overflow-hidden shrink-0">
        {thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt={pitch.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <PlayCircle
                  className="text-white w-10 h-10 shadow-sm"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-in-out">
            <ImageIcon
              className="text-indigo-200 w-12 h-12 mb-2"
              strokeWidth={1}
            />
            <span className="text-indigo-400 font-semibold tracking-widest uppercase text-xs">
              No Video
            </span>
          </div>
        )}

        {/* Absolute Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-lg shadow-sm">
            <Tag size={12} className="text-indigo-600" />
            {pitch.category || "General"}
          </span>
        </div>

        {/* Logged In User View: Interests / Views Pill */}
        {user && interestedCount !== undefined && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="flex items-center gap-1.5 text-xs font-bold bg-white/95 backdrop-blur-md text-indigo-700 px-3 py-1.5 rounded-lg shadow-sm border border-indigo-50/50">
              <TrendingUp size={14} className="text-indigo-500" />
              {interestedCount}{" "}
              {interestedCount === 1 ? "Interest" : "Interests"}
            </span>
          </div>
        )}

        {/* Action Buttons (Edit / Delete) */}
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(pitch);
              }}
              className="bg-white/95 backdrop-blur-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg shadow-sm transition cursor-pointer"
              title="Edit Pitch"
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(pitch.id);
              }}
              className="bg-white/95 backdrop-blur-md text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg shadow-sm transition cursor-pointer"
              title="Delete Pitch"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col grow bg-white relative">
        <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
          {pitch.title}
        </h3>

        {/* Owner Name Details */}
        {pitch.profiles && (
          <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500">
            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
              <User size={12} />
            </div>
            <span>By {pitch.profiles.full_name}</span>
          </div>
        )}

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6 grow">
          {pitch.description}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 mb-5"></div>

        {/* Footer: Price and CTA */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Goal
            </span>
            <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              ${Number(pitch.funding_goal).toLocaleString()}
            </span>
          </div>
          <Link
            to={`/pitch/${pitch.id}`}
            className="flex items-center gap-1.5 text-sm font-bold bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
          >
            Details <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PitchCard;
