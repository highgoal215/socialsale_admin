// src/services/order-service.ts

import ApiService from './api-services';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'partial' | 'canceled' | 'failed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ServiceType = 'followers' | 'subscribers' | 'likes' | 'views' | 'comments';
export type ServiceQuality = 'regular' | 'premium';

export interface Order {
  _id: string;
  userId: string;
  serviceId: string;
  supplierServiceId: string;
  supplierOrderId?: string;
  instagramUsername: string;
  postUrl?: string;
  serviceType: ServiceType;
  quality: ServiceQuality;
  quantity: number;
  price: number;
  supplierPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  startCount?: number;
  remains?: number;
  refillRequested: boolean;
  refillId?: string;
  refillStatus?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface CreateOrderInput {
  serviceId: string;
  instagramUsername: string;
  postUrl?: string;
  quantity: number;
  paymentMethod: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  data: Order[];
}

export interface OrderStatusUpdateInput {
  status: OrderStatus;
  notes?: string;
}

export interface OrderRefillResponse {
  success: boolean;
  refillId: string;
  message: string;
}

export const OrderService = {
  getAllOrders: async (filters?: { status?: OrderStatus; serviceType?: ServiceType; dateRange?: { start: string; end: string } }): Promise<Order[]> => {
    let queryParams = '';
    
    if (filters) {
      const params = [];
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.serviceType) params.push(`serviceType=${filters.serviceType}`);
      if (filters.dateRange) {
        params.push(`startDate=${filters.dateRange.start}`);
        params.push(`endDate=${filters.dateRange.end}`);
      }
      
      if (params.length > 0) {
        queryParams = `?${params.join('&')}`;
      }
    }
    
    return ApiService.get<OrdersResponse>(`/orders${queryParams}`)
      .then(response => response.data);
  },
  
  getUserOrders: async (): Promise<Order[]> => {
    return ApiService.get<OrdersResponse>('/orders/my-orders')
      .then(response => response.data);
  },
  
  getOrder: async (orderId: string): Promise<Order> => {
    return ApiService.get<OrderResponse>(`/orders/${orderId}`)
      .then(response => response.data);
  },
  
  createOrder: async (orderData: CreateOrderInput): Promise<Order> => {
    return ApiService.post<OrderResponse>('/orders', orderData)
      .then(response => response.data);
  },
  
  processOrderPayment: async (orderId: string, paymentData: any): Promise<Order> => {
    return ApiService.post<OrderResponse>(`/orders/${orderId}/process`, paymentData)
      .then(response => response.data);
  },
  
  checkOrderStatus: async (orderId: string): Promise<Order> => {
    return ApiService.get<OrderResponse>(`/orders/${orderId}/check-status`)
      .then(response => response.data);
  },
  
  updateOrderStatus: async (orderId: string, statusData: OrderStatusUpdateInput): Promise<Order> => {
    return ApiService.put<OrderResponse>(`/orders/${orderId}/status`, statusData)
      .then(response => response.data);
  },
  
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    return ApiService.post<OrderResponse>(`/orders/${orderId}/cancel`, { reason })
      .then(response => response.data);
  },
  
  requestRefill: async (orderId: string): Promise<OrderRefillResponse> => {
    return ApiService.post<OrderRefillResponse>(`/orders/${orderId}/refill`, {})
      .then(response => response);
  },
  
  checkRefillStatus: async (orderId: string): Promise<any> => {
    return ApiService.get(`/orders/${orderId}/refill-status`)
      .then(response => response);
  },
  
  bulkCheckOrderStatus: async (orderIds: string[]): Promise<any> => {
    return ApiService.post('/orders/bulk-check', { orderIds })
      .then(response => response);
  },
  
  // Instagram-related endpoints
  validateInstagramPost: async (postUrl: string): Promise<any> => {
    return ApiService.post('/instagram/validate-post', { postUrl })
      .then(response => response);
  },
  
  getInstagramProfile: async (username: string): Promise<any> => {
    return ApiService.get(`/instagram/profile/${username}`)
      .then(response => response);
  },
  
  getInstagramPosts: async (username: string): Promise<any> => {
    return ApiService.get(`/instagram/posts/${username}`)
      .then(response => response);
  }
};

export default OrderService;