import { useSelector } from "react-redux";
import { User, Mail, Shield, Calendar, UserCircle } from "lucide-react";

function Profile() {
  const { user, profile } = useSelector((state) => state.auth);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
        <UserCircle className="text-indigo-600" size={32} />
        My Profile
      </h1>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Full Name
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {profile?.full_name || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Email Address
            </p>
            <p className="text-lg font-medium text-gray-800 mt-1">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Account Role
            </p>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-1 rounded-md capitalize mt-2 border border-indigo-200">
              {profile?.role}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Member Since
            </p>
            <p className="text-lg font-medium text-gray-800 mt-1">
              {new Date(profile?.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
