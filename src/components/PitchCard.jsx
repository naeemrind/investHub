import { Link } from "react-router";
import { Tag, ArrowRight, Trash2, Users, User } from "lucide-react";

function PitchCard({ pitch, interestedCount, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition flex flex-col h-full relative">
      {/* Header Row: Category & Badges */}
      <div className="flex items-start justify-between mb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
          <Tag size={12} />
          {pitch.category || "General"}
        </span>

        <div className="flex gap-2">
          {interestedCount !== undefined && (
            <span className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
              <Users size={12} />
              {interestedCount}
            </span>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(pitch.id)}
              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition cursor-pointer"
              title="Delete Pitch"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 leading-tight">
        {pitch.title}
      </h3>

      {/* Owner Name Badge */}
      {pitch.profiles && (
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-gray-500">
          <User size={14} className="text-gray-400" />
          By {pitch.profiles.full_name}
        </div>
      )}

      <p className="text-gray-500 text-sm mt-3 line-clamp-2 flex-grow">
        {pitch.description}
      </p>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <span className="text-indigo-600 font-extrabold text-lg tracking-tight">
          ${Number(pitch.funding_goal).toLocaleString()}
        </span>
        <Link
          to={`/pitch/${pitch.id}`}
          className="flex items-center gap-1.5 text-sm font-medium bg-indigo-600 text-white px-3.5 py-2 rounded-md hover:bg-indigo-700 transition cursor-pointer"
        >
          View Pitch <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default PitchCard;
