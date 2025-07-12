// src/services/order-service.ts

import ApiService from './api-services';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'partial' | 'canceled' | 'failed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ServiceType = 'followers' | 'likes' | 'views' | 'comments';
export type ServiceQuality = 'regular' | 'premium';


export interface Order {
  _id: string;
  userId: string;
  serviceId: string;
  supplierServiceId?: string;
  supplierOrderId?: string;
  socialUsername: string; // Backend uses socialUsername, not instagramUsername
  postUrl?: string;
  serviceType: ServiceType;
  quality?: ServiceQuality;
  quantity: number;
  price: number;
  supplierPrice?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  startCount?: number;
  remains?: number;
  refillRequested?: boolean;
  refillId?: string;
  refillStatus?: string;
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface CreateOrderInput {
  serviceId: string;
  socialUsername: string; // Changed from instagramUsername to match backend
  postUrl?: string;
  quantity: number;
  paymentMethod: string;
}

interface PaginationResponse {
  total: number;
  page: number;
  pages: number;
}

interface OrderResponse {
  success: boolean;
  data: Order | { order: Order; transaction?: any };
}

interface OrdersResponse {
  success: boolean;
  count: number;
  pagination?: PaginationResponse;
  data: Order[];
}

export interface OrderStatusUpdateInput {
  status: OrderStatus;
  notes?: string;
}

export interface OrderRefillResponse {
  success: boolean;
  refillId?: string;
  message: string;
}

const OrderService = {
  getAllOrders: async (filters?: { status?: OrderStatus; serviceType?: ServiceType; dateRange?: { start: string; end: string } }): Promise<Order[]> => {
    let queryParams = '';
    
    if (filters) {
      const params = [];
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.serviceType) params.push(`type=${filters.serviceType}`);
      if (filters.dateRange) {
        params.push(`dateFrom=${filters.dateRange.start}`);
        params.push(`dateTo=${filters.dateRange.end}`);
      }
      
      if (params.length > 0) {
        queryParams = `?${params.join('&')}`;
      }
    }
    
    try {
      const response = await ApiService.get<OrdersResponse>(`/orders${queryParams}`);
      
      // Handle the response properly based on the API structure
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return []; // Return empty array on error rather than throwing
    }
  },
  
  getUserOrders: async (): Promise<Order[]> => {
    try {
      const response = await ApiService.get<OrdersResponse>('/orders/my-orders');
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },
  
  getOrder: async (orderId: string): Promise<Order | null> => {
    try {
      const response = await ApiService.get<OrderResponse>(`/orders/${orderId}`);
      if (response && response.success) {
        // Handle both direct order and { order, transaction } format
        if ('order' in response.data) {
          return response.data.order;
        }
        return response.data as Order;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  },
  
  createOrder: async (orderData: CreateOrderInput): Promise<Order | null> => {
    try {
      const response = await ApiService.post<OrderResponse>('/orders', orderData);
      if (response && response.success) {
        // Handle both direct order and { order, transaction } format
        if ('order' in response.data) {
          return response.data.order;
        }
        return response.data as Order;
      }
      return null;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  processOrderPayment: async (orderId: string, paymentData: any): Promise<Order | null> => {
    try {
      const response = await ApiService.post<OrderResponse>(`/orders/${orderId}/process`, paymentData);
      if (response && response.success) {
        // Handle both direct order and { order, transaction } format
        if ('order' in response.data) {
          return response.data.order;
        }
        return response.data as Order;
      }
      return null;
    } catch (error) {
      console.error(`Error processing payment for order ${orderId}:`, error);
      throw error;
    }
  },
  
  checkOrderStatus: async (orderId: string): Promise<Order | null> => {
    try {
      const response = await ApiService.get<OrderResponse>(`/orders/${orderId}/check-status`);
      if (response && response.success) {
        // Handle both direct order and { order, transaction } format
        if ('order' in response.data) {
          return response.data.order;
        }
        return response.data as Order;
      }
      return null;
    } catch (error) {
      console.error(`Error checking status for order ${orderId}:`, error);
      return null;
    }
  },
  
  updateOrderStatus: async (orderId: string, statusData: OrderStatusUpdateInput): Promise<Order | null> => {
    try {
      const response = await ApiService.put<OrderResponse>(`/orders/${orderId}/status`, statusData);
      if (response && response.success) {
        // Handle both direct order and { order, transaction } format
        if ('order' in response.data) {
          return response.data.order;
        }
        return response.data as Order;
      }
      return null;
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
      throw error;
    }
  },
  
  cancelOrder: async (orderId: string, reason?: string): Promise<Order | null> => {
    try {
      const response = await ApiService.post<OrderResponse>(`/orders/${orderId}/cancel`, { reason });
      if (response && response.success) {
        // Handle both direct order and { order, transaction } format
        if ('order' in response.data) {
          return response.data.order;
        }
        return response.data as Order;
      }
      return null;
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
      throw error;
    }
  },
  
  requestRefill: async (orderId: string): Promise<OrderRefillResponse> => {
    try {
      const response = await ApiService.post<OrderRefillResponse>(`/orders/${orderId}/refill`, {});
      if (response && response.success) {
        return response;
      }
      return { success: false, message: 'Failed to request refill' };
    } catch (error) {
      console.error(`Error requesting refill for order ${orderId}:`, error);
      return { success: false, message: 'Failed to request refill' };
    }
  },
  
  checkRefillStatus: async (orderId: string): Promise<any> => {
    try {
      const response = await ApiService.get(`/orders/${orderId}/refill-status`);
      return response;
    } catch (error) {
      console.error(`Error checking refill status for order ${orderId}:`, error);
      throw error;
    }
  },
  
  bulkCheckOrderStatus: async (orderIds: string[]): Promise<any> => {
    try {
      const response = await ApiService.post('/orders/bulk-check', { orderIds });
      return response;
    } catch (error) {
      console.error('Error bulk checking order statuses:', error);
      throw error;
    }
  },
  
  // Instagram-related endpoints
  validateInstagramPost: async (postUrl: string): Promise<any> => {
    try {
      const response = await ApiService.post('/instagram/validate-post', { postUrl });
      return response;
    } catch (error) {
      console.error(`Error validating Instagram post ${postUrl}:`, error);
      throw error;
    }
  },
  
  getInstagramProfile: async (username: string): Promise<any> => {
    try {
      const response = await ApiService.get(`/instagram/profile/${username}`);
      return response;
    } catch (error) {
      console.error(`Error fetching Instagram profile for ${username}:`, error);
      throw error;
    }
  },
  
  getInstagramPosts: async (username: string): Promise<any> => {
    try {
      const response = await ApiService.get(`/instagram/posts/${username}`);
      return response;
    } catch (error) {
      console.error(`Error fetching Instagram posts for ${username}:`, error);
      throw error;
    }
  }
};

export default OrderService;