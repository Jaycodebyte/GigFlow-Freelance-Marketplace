import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Menu, X, Briefcase } from "lucide-react";

export default function Header() {
  const { data: user, loading } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">GigFlow</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Browse Gigs
            </a>
            {user && (
              <>
                <a
                  href="/post-gig"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Post a Gig
                </a>
                <a
                  href="/my-gigs"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  My Gigs
                </a>
                <a
                  href="/my-bids"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  My Bids
                </a>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">Hi, {user.name}</span>
                <a
                  href="/account/logout"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Sign Out
                </a>
              </div>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <a
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Gigs
              </a>
              {user && (
                <>
                  <a
                    href="/post-gig"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Post a Gig
                  </a>
                  <a
                    href="/my-gigs"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Gigs
                  </a>
                  <a
                    href="/my-bids"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bids
                  </a>
                </>
              )}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <p className="text-gray-700 mb-4">Hi, {user.name}</p>
                    <a
                      href="/account/logout"
                      className="block text-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Out
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="/account/signin"
                      className="block text-center px-4 py-2 mb-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </a>
                    <a
                      href="/account/signup"
                      className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
