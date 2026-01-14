import { useState, useEffect } from 'react';
import { gigService } from '../services/gigService';
import type { Gig } from '../services/gigService';
import type { User } from '../services/authService';
import BidForm from './BidForm';
import BidList from './BidList';

interface GigListProps {
  onGigCreated?: () => void;
  currentUser: User | null;
}

export default function GigList({ onGigCreated, currentUser }: GigListProps) {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGigForBid, setSelectedGigForBid] = useState<Gig | null>(null);
  const [selectedGigForBids, setSelectedGigForBids] = useState<string | null>(null);

  const fetchGigs = async (search?: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await gigService.getGigs(search);
      setGigs(response.gigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  useEffect(() => {
    if (onGigCreated) {
      fetchGigs(searchTerm || undefined);
    }
  }, [onGigCreated, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGigs(searchTerm || undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gigs by title..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition bg-gray-50"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchGigs();
              }}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading gigs...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No gigs found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">{gig.title}</h3>
                <span className="ml-2 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {gig.status}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{gig.description}</p>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Budget:</span>
                  <span className="text-base font-semibold text-gray-800">{formatCurrency(gig.budget)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Posted by:</span>
                  <span className="text-xs font-medium text-gray-600">{gig.ownerId.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Created:</span>
                  <span className="text-xs text-gray-500">{formatDate(gig.createdAt)}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 mt-3 border-t border-gray-100">
                  {currentUser && gig.ownerId._id === currentUser.id ? (
                    // Owner can view bids
                    <button
                      onClick={() => setSelectedGigForBids(gig._id)}
                      className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition duration-200 text-sm"
                    >
                      View Bids
                    </button>
                  ) : currentUser && gig.status === 'open' ? (
                    // Non-owners can bid on open gigs
                    <button
                      onClick={() => setSelectedGigForBid(gig)}
                      className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition duration-200 text-sm"
                    >
                      Submit Bid
                    </button>
                  ) : gig.status !== 'open' ? (
                    <div className="w-full px-4 py-2 bg-gray-50 text-gray-500 font-medium rounded-lg text-center text-sm">
                      {gig.status === 'assigned' ? 'Assigned' : 'Closed'}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Form Modal */}
      {selectedGigForBid && (
        <BidForm
          gig={selectedGigForBid}
          onBidSubmitted={() => {
            setSelectedGigForBid(null);
            fetchGigs(searchTerm || undefined);
          }}
          onCancel={() => setSelectedGigForBid(null)}
        />
      )}

      {/* Bid List Modal */}
      {selectedGigForBids && (
        <BidList
          gigId={selectedGigForBids}
          onClose={() => setSelectedGigForBids(null)}
          onHireSuccess={() => {
            fetchGigs(searchTerm || undefined);
          }}
        />
      )}
    </div>
  );
}
