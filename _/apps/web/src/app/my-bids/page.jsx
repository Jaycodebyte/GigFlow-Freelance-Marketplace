import { useState, useEffect } from "react";
import Header from "../../components/Header";
import useUser from "@/utils/useUser";
import { DollarSign, Calendar, FileText } from "lucide-react";

export default function MyBidsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyBids = async () => {
    try {
      const response = await fetch("/api/my-bids");
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      const data = await response.json();
      setBids(data.bids || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load your bids. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchMyBids();

      // Real-time polling: check for updates every 5 seconds
      const interval = setInterval(() => {
        fetchMyBids();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user, userLoading]);

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
            You need to sign in to view your bids.
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bids</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bids.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">
              You haven't submitted any bids yet.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Browse Gigs
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <a
                      href={`/gig/${bid.gig_id}`}
                      className="text-xl font-bold text-gray-900 hover:text-blue-600"
                    >
                      {bid.gig_title}
                    </a>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {bid.gig_description}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium h-fit ${
                        bid.status === "hired"
                          ? "bg-green-100 text-green-800"
                          : bid.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {bid.status === "hired"
                        ? "Hired 🎉"
                        : bid.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium h-fit ${
                        bid.gig_status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      Gig: {bid.gig_status === "open" ? "Open" : "Assigned"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign className="w-5 h-5" />
                    <div>
                      <div className="text-sm text-gray-500">Your Bid</div>
                      <div className="font-semibold text-lg">
                        ${parseFloat(bid.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-5 h-5" />
                    <div>
                      <div className="text-sm text-gray-500">Gig Budget</div>
                      <div className="font-medium">
                        ${parseFloat(bid.gig_budget).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="text-sm text-gray-500">Submitted</div>
                      <div className="font-medium">
                        {formatDate(bid.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900">Your Proposal</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {bid.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
