import ApiService from './api-services';

export interface Review {
  _id: string;
  username: string;
  email: string;
  serviceUsed: string;
  rating: number;
  reviewTitle: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  total: number;
  status: {
    pending: number;
    approved: number;
    rejected: number;
  };
  avgRating: number;
  ratingDistribution: Array<{ _id: number; count: number }>;
  topServices: Array<{ _id: string; count: number; avgRating: number }>;
}

export interface ReviewsResponse {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: Review[];
}

export interface ReviewResponse {
  success: boolean;
  data: Review;
}

export interface ReviewStatsResponse {
  success: boolean;
  data: ReviewStats;
}

const ReviewService = {
  // Get all reviews with optional filtering
  getAllReviews: async (filters?: {
    status?: 'pending' | 'approved' | 'rejected';
    rating?: number;
    serviceUsed?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReviewsResponse> => {
    try {
      let queryParams = '';
      const params = [];
      
      if (filters) {
        if (filters.status) params.push(`status=${filters.status}`);
        if (filters.rating) params.push(`rating=${filters.rating}`);
        if (filters.serviceUsed) params.push(`serviceUsed=${encodeURIComponent(filters.serviceUsed)}`);
        if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
      }
      
      if (params.length > 0) {
        queryParams = `?${params.join('&')}`;
      }
      
      const response = await ApiService.get<ReviewsResponse>(`/leavereview${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        success: false,
        count: 0,
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        data: []
      };
    }
  },

  // Get a single review
  getReview: async (reviewId: string): Promise<Review | null> => {
    try {
      const response = await ApiService.get<ReviewResponse>(`/leavereview/${reviewId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error fetching review ${reviewId}:`, error);
      return null;
    }
  },

  // Update review status
  updateReviewStatus: async (reviewId: string, status: 'pending' | 'approved' | 'rejected'): Promise<Review | null> => {
    try {
      const response = await ApiService.put<ReviewResponse>(`/leavereview/${reviewId}/status`, { status });
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error updating review status ${reviewId}:`, error);
      return null;
    }
  },

  // Verify/unverify review
  verifyReview: async (reviewId: string, isVerified: boolean): Promise<Review | null> => {
    try {
      const response = await ApiService.put<ReviewResponse>(`/leavereview/${reviewId}/verify`, { isVerified });
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error verifying review ${reviewId}:`, error);
      return null;
    }
  },

  // Delete review
  deleteReview: async (reviewId: string): Promise<boolean> => {
    try {
      const response = await ApiService.delete<{ success: boolean }>(`/leavereview/${reviewId}`);
      return response.success;
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      return false;
    }
  },

  // Get review statistics
  getReviewStats: async (): Promise<ReviewStats | null> => {
    try {
      const response = await ApiService.get<ReviewStatsResponse>('/leavereview/stats');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return null;
    }
  },

  // Get public reviews (for reference)
  getPublicReviews: async (filters?: {
    serviceUsed?: string;
    rating?: number;
    sort?: 'rating' | 'helpful';
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
  }): Promise<ReviewsResponse> => {
    try {
      let queryParams = '';
      const params = [];
      
      if (filters) {
        if (filters.serviceUsed) params.push(`serviceUsed=${encodeURIComponent(filters.serviceUsed)}`);
        if (filters.rating) params.push(`rating=${filters.rating}`);
        if (filters.sort) params.push(`sort=${filters.sort}`);
        if (filters.status) params.push(`status=${filters.status}`);
        if (filters.page) params.push(`page=${filters.page}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
      }
      
      if (params.length > 0) {
        queryParams = `?${params.join('&')}`;
      }
      
      const response = await ApiService.get<ReviewsResponse>(`/leavereview/public${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error fetching public reviews:', error);
      return {
        success: false,
        count: 0,
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        data: []
      };
    }
  }
};

export default ReviewService; 