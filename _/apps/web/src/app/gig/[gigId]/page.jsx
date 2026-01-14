import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import useUser from "@/utils/useUser";
import { DollarSign, Calendar, User } from "lucide-react";

export default function GigDetailsPage({ params }) {
  const { gigId } = params;
  const { data: user, loading: userLoading } = useUser();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidMessage, setBidMessage] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  const fetchGig = async () => {
    try {
      const response = await fetch(`/api/gigs/${gigId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gig");
      }
      const data = await response.json();
      setGig(data.gig);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load gig. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGig();

    // Real-time polling: check for updates every 5 seconds
    const interval = setInterval(() => {
      fetchGig();
    }, 5000);

    return () => clearInterval(interval);
  }, [gigId]);

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setBidError(null);

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gigId: parseInt(gigId),
          message: bidMessage,
          price: parseFloat(bidPrice),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit bid");
      }

      setBidSuccess(true);
      setBidMessage("");
      setBidPrice("");
      setTimeout(() => setBidSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setBidError(err.message || "Failed to submit bid. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gig Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            {error || "This gig doesn't exist."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Browse Gigs
          </a>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === gig.owner_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Gig Details */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 mb-8">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{gig.title}</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-green-600">
              <DollarSign className="w-5 h-5" />
              <div>
                <div className="text-sm text-gray-500">Budget</div>
                <div className="font-semibold text-lg">
                  ${parseFloat(gig.budget).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <div>
                <div className="text-sm text-gray-500">Posted</div>
                <div className="font-medium">{formatDate(gig.created_at)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-5 h-5" />
              <div>
                <div className="text-sm text-gray-500">Client</div>
                <div className="font-medium">{gig.owner_name || "Unknown"}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {gig.description}
            </p>
          </div>

          {isOwner && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                This is your gig.{" "}
                <a href="/my-gigs" className="underline hover:text-blue-900">
                  View and manage bids
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Bid Form */}
        {!isOwner && user && gig.status === "open" && (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Submit Your Bid
            </h2>

            {bidSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Bid submitted successfully! The client will review your
                proposal.
              </div>
            )}

            <form onSubmit={handleSubmitBid} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Bid Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  placeholder="e.g., 450"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Client
                </label>
                <textarea
                  required
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Explain why you're the best fit for this gig..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {bidError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {bidError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Bid"}
              </button>
            </form>
          </div>
        )}

        {!user && gig.status === "open" && (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Want to bid on this gig?
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to submit your proposal
            </p>
            <a
              href="/account/signin"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
