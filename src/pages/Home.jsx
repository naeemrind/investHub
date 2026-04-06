import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import PitchCard from "../components/PitchCard";
import { Search, Compass, Filter } from "lucide-react";

function Home() {
  const [pitches, setPitches] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // 1. Fetch data on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchPitches = async () => {
      setLoading(true);
      // Fetches pitches AND the attached owner's full_name
      const { data, error } = await supabase
        .from("pitches")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (!error && data) {
          setPitches(data);
        }
        setLoading(false);
      }
    };

    fetchPitches();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Debounce the search input
  // This prevents the filtering logic from running on every single keystroke.
  // It waits for 300ms of inactivity before updating the search term used for filtering.
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // 3. Memoize categories extraction
  // Only recalculate categories when the pitches array actually changes
  const categories = useMemo(() => {
    return ["All", ...new Set(pitches.map((p) => p.category).filter(Boolean))];
  }, [pitches]);

  // 4. Memoize the filtered array
  // Only recalculate when pitches, debouncedSearch, or selectedCategory change
  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    return pitches.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchLower) ||
        (p.category || "").toLowerCase().includes(searchLower);

      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [pitches, debouncedSearch, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md">
          <Compass size={24} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Explore Pitches
        </h1>
      </div>
      <p className="text-gray-500 mb-8 text-lg">
        Discover the next big investment opportunity.
      </p>

      {/* Search & Filters Section */}
      <div className="mb-10 max-w-4xl">
        <div className="relative mb-5 max-w-2xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
          />
        </div>

        {/* Sleek Category Filters */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">
              <Filter size={14} /> Filters:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200" // Soft active state (Better UX)
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
          <Search className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="text-gray-500 font-medium">
            No pitches found matching your criteria.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="mt-4 text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pitch) => (
            <PitchCard key={pitch.id} pitch={pitch} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
