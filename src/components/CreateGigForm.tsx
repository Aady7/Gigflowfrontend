import { useState, FormEvent } from 'react';
import { gigService } from '../services/gigService';

interface CreateGigFormProps {
  onGigCreated: () => void;
  onCancel?: () => void;
}

export default function CreateGigForm({ onGigCreated, onCancel }: CreateGigFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError('Budget must be a positive number');
      return;
    }

    setLoading(true);

    try {
      await gigService.createGig({
        title,
        description,
        budget: budgetNum,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setBudget('');
      onGigCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gig. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create New Gig</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1.5">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition bg-gray-50"
              placeholder="e.g., Web Developer Needed"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1.5">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition resize-none bg-gray-50"
              placeholder="Describe the gig requirements, skills needed, timeline, etc."
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-600 mb-1.5">
              Budget (USD) *
            </label>
            <input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition bg-gray-50"
              placeholder="5000"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Gig'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
