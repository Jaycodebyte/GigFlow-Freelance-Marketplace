import { useState, useEffect } from "react";
import Header from "../../components/Header";
import useUser from "@/utils/useUser";
import { DollarSign, Calendar, MessageSquare, Check, X } from "lucide-react";

export default function MyGigsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [hiringBidId, setHiringBidId] = useState(null);

  const fetchMyGigs = async () => {
    try {
      const response = await fetch("/api/my-gigs");
      if (!response.ok) {
        throw new Error("Failed to fetch gigs");
      }
      const data = await response.json();
      setGigs(data.gigs || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load your gigs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchMyGigs();

      // Real-time polling: check for updates every 5 seconds
      const interval = setInterval(() => {
        fetchMyGigs();
        // Also refresh bids if modal is open
        if (selectedGigId) {
          fetchBids(selectedGigId);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user, userLoading, selectedGigId]);

  const fetchBids = async (gigId) => {
    try {
      setBidsLoading(true);
      const response = await fetch(`/api/bids/gig/${gigId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      const data = await response.json();
      setBids(data.bids || []);
      setSelectedGigId(gigId);
    } catch (err) {
      console.error(err);
      alert("Failed to load bids. Please try again.");
    } finally {
      setBidsLoading(false);
    }
  };

  const handleHire = async (bidId) => {
    if (
      !confirm(
        "Are you sure you want to hire this freelancer? This will reject all other bids.",
      )
    ) {
      return;
    }

    try {
      setHiringBidId(bidId);
      const response = await fetch(`/api/bids/${bidId}/hire`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to hire freelancer");
      }

      // Refresh data
      await fetchMyGigs();
      await fetchBids(selectedGigId);
      alert("Freelancer hired successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to hire freelancer. Please try again.");
    } finally {
      setHiringBidId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-8">
            You need to sign in to view your gigs.
          </p>
          <a
            href="/account/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Gigs</h1>
          <a
            href="/post-gig"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Post New Gig
          </a>
        </div>

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
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">
              You haven't posted any gigs yet.
            </p>
            <a
              href="/post-gig"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Post Your First Gig
            </a>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {gigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {gig.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      gig.status === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {gig.status === "open" ? "Open" : "Assigned"}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {gig.description}
                </p>

                <div className="space-y-2 mb-4">
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
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {gig.bid_count} bid{gig.bid_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => fetchBids(gig.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  View Bids
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bids Modal */}
        {selectedGigId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Bids for this Gig
                </h2>
                <button
                  onClick={() => {
                    setSelectedGigId(null);
                    setBids([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {bidsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : bids.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    No bids yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        className={`p-6 rounded-lg border-2 ${
                          bid.status === "hired"
                            ? "bg-green-50 border-green-300"
                            : bid.status === "rejected"
                              ? "bg-gray-50 border-gray-300"
                              : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {bid.freelancer_name || "Anonymous"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {bid.freelancer_email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${parseFloat(bid.price).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(bid.created_at)}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                          {bid.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              bid.status === "hired"
                                ? "bg-green-100 text-green-800"
                                : bid.status === "rejected"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {bid.status.charAt(0).toUpperCase() +
                              bid.status.slice(1)}
                          </span>

                          {bid.status === "pending" && (
                            <button
                              onClick={() => handleHire(bid.id)}
                              disabled={hiringBidId === bid.id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              {hiringBidId === bid.id ? "Hiring..." : "Hire"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
