const API_BASE_URL = 'http://localhost:5000';

export interface Freelancer {
  _id: string;
  name: string;
  email: string;
}

export interface Bid {
  _id: string;
  gigId: {
    _id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
  };
  freelancerId: Freelancer;
  message: string;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitBidRequest {
  gigId: string;
  message: string;
  price: number;
}

export interface SubmitBidResponse {
  success: boolean;
  message: string;
  bid: Bid;
}

export interface BidsForGigResponse {
  success: boolean;
  count: number;
  gig: {
    _id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
  };
  bids: Bid[];
}

export interface HireFreelancerResponse {
  success: boolean;
  message: string;
  bid: Bid;
}

export const bidService = {
  async submitBid(data: SubmitBidRequest): Promise<SubmitBidResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for HttpOnly cookies
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit bid');
    }

    return result;
  },

  async getBidsForGig(gigId: string): Promise<BidsForGigResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bids/${gigId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for HttpOnly cookies
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch bids');
    }

    return result;
  },

  async hireFreelancer(bidId: string): Promise<HireFreelancerResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bids/${bidId}/hire`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for HttpOnly cookies
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to hire freelancer');
    }

    return result;
  },
};
