import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  UploadCloud,
  FileText,
  Tag,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";

function CreatePitch() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    funding_goal: "",
    category: "",
    video_url: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: insertError } = await supabase.from("pitches").insert({
      ...form,
      owner_id: user.id,
      funding_goal: Number(form.funding_goal),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md">
          <UploadCloud size={24} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Create a New Pitch
        </h1>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-100 font-medium">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200"
      >
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
            <FileText size={16} /> Pitch Title{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
            <FileText size={16} /> Description{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={4}
            required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
            <DollarSign size={16} /> Funding Goal ($){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            name="funding_goal"
            type="number"
            required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
            <Tag size={16} /> Category
          </label>
          <input
            name="category"
            onChange={handleChange}
            placeholder="e.g. Tech, Health, Finance"
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
            <LinkIcon size={16} /> Video URL{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            name="video_url"
            type="url"
            onChange={handleChange}
            placeholder="https://youtube.com/..."
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition disabled:opacity-50 cursor-pointer mt-4 shadow-sm"
        >
          {loading ? "Submitting..." : "Publish Pitch"}
        </button>
      </form>
    </div>
  );
}

export default CreatePitch;
