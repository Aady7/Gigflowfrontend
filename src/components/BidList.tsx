import { useState, useEffect } from 'react';
import { bidService } from '../services/bidService';
import type { Bid, BidsForGigResponse } from '../services/bidService';

interface BidListProps {
  gigId: string;
  onClose: () => void;
  onHireSuccess?: () => void;
}

export default function BidList({ gigId, onClose, onHireSuccess }: BidListProps) {
  const [data, setData] = useState<BidsForGigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiringBidId, setHiringBidId] = useState<string | null>(null);

  useEffect(() => {
    fetchBids();
  }, [gigId]);

  const fetchBids = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await bidService.getBidsForGig(gigId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async (bidId: string) => {
    if (!confirm('Are you sure you want to hire this freelancer? This will automatically reject all other bids.')) {
      return;
    }

    setHiringBidId(bidId);
    setError('');

    try {
      await bidService.hireFreelancer(bidId);
      if (onHireSuccess) {
        onHireSuccess();
      }
      // Refresh bids to show updated status
      await fetchBids();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to hire freelancer');
    } finally {
      setHiringBidId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'hired':
        return 'bg-gray-100 text-gray-700';
      case 'rejected':
        return 'bg-gray-100 text-gray-500';
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Bids for Gig</h2>
            {data && (
              <p className="text-gray-500 mt-1 text-sm">{data.gig.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading bids...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        ) : !data || data.bids.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bids yet for this gig.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Total Bids:</span> {data.count}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Gig Budget:</span> {formatCurrency(data.gig.budget)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> {data.gig.status}
              </p>
            </div>

            {data.bids.map((bid) => (
              <div
                key={bid._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {bid.freelancerId.name}
                    </h3>
                    <p className="text-sm text-gray-500">{bid.freelancerId.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(bid.status)}`}>
                      {bid.status}
                    </span>
                    <span className="text-xl font-semibold text-gray-800">
                      {formatCurrency(bid.price)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 whitespace-pre-wrap text-sm">{bid.message}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Submitted: {formatDate(bid.createdAt)}
                  </p>
                  {bid.status === 'pending' && data.gig.status === 'open' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      disabled={hiringBidId === bid._id}
                      className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {hiringBidId === bid._id ? 'Hiring...' : 'Hire Freelancer'}
                    </button>
                  )}
                  {bid.status === 'hired' && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg text-sm">
                      ✓ Hired
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
