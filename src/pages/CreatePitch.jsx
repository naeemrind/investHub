import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  UploadCloud,
  FileText,
  Tag,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Video,
} from "lucide-react";

function CreatePitch() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [form, setForm] = useState({
    title: "",
    description: "",
    funding_goal: "",
    category: "",
    video_url: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Constants for constraints
  const LIMITS = {
    title: 100,
    description: 5000,
  };

  function handleChange(e) {
    const { name, value } = e.target;
    // Prevent typing more than the limit (extra safety)
    if (name === "title" && value.length > LIMITS.title) return;
    if (name === "description" && value.length > LIMITS.description) return;

    setForm({ ...form, [name]: value });
  }

  function nextStep() {
    if (step < totalSteps) setStep((prev) => prev + 1);
  }

  function prevStep() {
    if (step > 1) setStep((prev) => prev - 1);
  }

  // Validation logic
  const isStep1Valid =
    form.title.trim().length >= 3 && form.title.trim().length <= LIMITS.title;
  const isStep2Valid =
    form.funding_goal !== "" && Number(form.funding_goal) > 0;
  const isStep3Valid =
    form.description.trim().length >= 10 &&
    form.description.trim().length <= LIMITS.description;

  // Simple YouTube URL validator
  const isValidYouTubeUrl = (url) => {
    if (!url) return true; // Optional field
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    return regExp.test(url);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidYouTubeUrl(form.video_url)) {
      setError("Please provide a valid YouTube URL.");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase.from("pitches").insert({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || "General",
        video_url: form.video_url.trim(),
        owner_id: user.id,
        funding_goal: Number(form.funding_goal),
      });

      if (insertError) throw insertError;
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
          <UploadCloud size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Create a New Pitch
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Attract investors with a compelling presentation.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${(step / totalSteps) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
          ></div>
        </div>
        <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span className={step >= 1 ? "text-indigo-600" : ""}>Basics</span>
          <span className={step >= 2 ? "text-indigo-600" : ""}>Financials</span>
          <span className={step >= 3 ? "text-indigo-600" : ""}>The Story</span>
          <span className={step >= 4 ? "text-indigo-600" : ""}>Review</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={16} className="text-red-500" /> {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 min-h-100 flex flex-col"
      >
        <div className="grow">
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Step 1: The Basics
              </h2>
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileText size={16} /> Pitch Title{" "}
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-400 font-normal">
                    {form.title.length}/{LIMITS.title}
                  </span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="E.g., NextGen Eco-Friendly Packaging"
                  maxLength={LIMITS.title}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Tag size={16} /> Category
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Tech, Health, Finance"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 2: FINANCIALS & MEDIA */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Step 2: Financials & Media
              </h2>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <DollarSign size={16} /> Funding Goal ($){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="funding_goal"
                  type="number"
                  min="1"
                  value={form.funding_goal}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Video size={16} /> YouTube Video URL{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="video_url"
                  type="url"
                  value={form.video_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 transition ${
                    form.video_url && !isValidYouTubeUrl(form.video_url)
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                />
                {form.video_url && !isValidYouTubeUrl(form.video_url) && (
                  <p className="text-xs text-red-500 mt-1">
                    Please enter a valid YouTube URL.
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Adding a YouTube video creates a beautiful thumbnail and
                  embedded player for investors.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: THE STORY */}
          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Step 3: The Story
              </h2>
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileText size={16} /> Detailed Description{" "}
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-400 font-normal">
                    {form.description.length}/{LIMITS.description}
                  </span>
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product, the problem it solves, your target market, and why investors should care..."
                  maxLength={LIMITS.description}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Step 4: Review & Publish
              </h2>
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </span>
                  <p className="text-lg font-bold text-gray-900 wrap-break-words">
                    {form.title || "—"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </span>
                    <p className="text-gray-900 font-medium wrap-break-words">
                      {form.category || "General"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Funding Goal
                    </span>
                    <p className="text-green-600 font-bold">
                      ${Number(form.funding_goal).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Video URL
                  </span>
                  <p className="text-indigo-600 text-sm truncate">
                    {form.video_url || "No video attached"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description Snippet
                  </span>
                  <p className="text-gray-600 text-sm line-clamp-3 mt-1 bg-white p-2 border border-gray-100 rounded wrap-break-words">
                    {form.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
              step === 1 || loading
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft size={18} /> Back
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid) ||
                loading
              }
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-md font-bold hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? (
                "Publishing..."
              ) : (
                <>
                  <CheckCircle size={18} /> Publish Pitch
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreatePitch;
