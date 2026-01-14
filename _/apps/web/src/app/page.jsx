import { useState, useEffect } from "react";
import Header from "../components/Header";
import { Search, DollarSign, Calendar } from "lucide-react";

export default function HomePage() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async (searchQuery = "") => {
    try {
      setLoading(true);
      setError(null);
      const url = searchQuery
        ? `/api/gigs?search=${encodeURIComponent(searchQuery)}`
        : "/api/gigs";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch gigs");
      }
      const data = await response.json();
      setGigs(data.gigs || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load gigs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGigs(search);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Find Your Next Gig
          </h1>
          <p className="text-xl text-center text-blue-100 mb-8">
            Browse open gigs and submit your bids
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Gigs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {search
                ? "No gigs found matching your search."
                : "No open gigs available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <a
                key={gig.id}
                href={`/gig/${gig.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {gig.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {gig.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold">
                      ${parseFloat(gig.budget).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {formatDate(gig.created_at)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    by {gig.owner_name || "Unknown"}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
