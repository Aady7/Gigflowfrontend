const API_BASE_URL = 'http://localhost:5000';

export interface GigOwner {
  _id: string;
  name: string;
  email: string;
}

export interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  ownerId: GigOwner;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGigRequest {
  title: string;
  description: string;
  budget: number;
}

export interface GigsResponse {
  success: boolean;
  count: number;
  gigs: Gig[];
}

export interface CreateGigResponse {
  success: boolean;
  message: string;
  gig: Gig;
}

export const gigService = {
  async getGigs(search?: string): Promise<GigsResponse> {
    const url = new URL(`${API_BASE_URL}/api/gigs`);
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch gigs');
    }

    return result;
  },

  async createGig(data: CreateGigRequest): Promise<CreateGigResponse> {
    const response = await fetch(`${API_BASE_URL}/api/gigs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for HttpOnly cookies
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create gig');
    }

    return result;
  },
};
