import { useState } from 'react';
import type { FormEvent } from 'react';
import { bidService } from '../services/bidService';
import type { Gig } from '../services/gigService';

interface BidFormProps {
  gig: Gig;
  onBidSubmitted: () => void;
  onCancel: () => void;
}

export default function BidForm({ gig, onBidSubmitted, onCancel }: BidFormProps) {
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number');
      return;
    }

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setLoading(true);

    try {
      await bidService.submitBid({
        gigId: gig._id,
        message: message.trim(),
        price: priceNum,
      });
      
      // Reset form
      setMessage('');
      setPrice('');
      onBidSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Submit Bid</h2>
        <p className="text-gray-500 mb-6">Gig: {gig.title}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-1.5">
              Your Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition resize-none bg-gray-50"
              placeholder="Tell the client why you're the right fit for this project..."
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-600 mb-1.5">
              Your Price (USD) *
            </label>
            <div className="flex items-center gap-2">
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition bg-gray-50"
                placeholder="4500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Budget: ${gig.budget.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Bid'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
