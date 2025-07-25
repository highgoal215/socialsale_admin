import ApiService from './api-services';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface SupplierOrderRequest {
  orderId: string;
  serviceType: 'followers' | 'subscribers' | 'likes' | 'views' | 'comments';
  quantity: number;
  target: string; // Instagram handle or post URL
  customerEmail?: string;
}

export interface SupplierOrderResponse {
  success: boolean;
  reference?: string;
  estimatedCompletionTime?: string;
  message?: string;
  status?: OrderStatus;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const SupplierService = {
  // Configure API settings
  configureApiSettings: async (apiKey: string, apiEndpoint: string): Promise<boolean> => {
    try {
      // Store in localStorage for now (in production, this should be sent to backend)
      localStorage.setItem('supplier_api_key', apiKey);
      localStorage.setItem('supplier_api_endpoint', apiEndpoint);
      
      // Test the connection by making a simple API call
      const response = await ApiService.post('/supplier/test-connection', {
        apiKey,
        apiEndpoint
      }) as ApiResponse;
      
      return response && response.success;
    } catch (error) {
      console.error('Error configuring API settings:', error);
      return false;
    }
  },

  // Send order to supplier panel via backend
  sendOrderToSupplier: async (orderData: SupplierOrderRequest): Promise<SupplierOrderResponse> => {
    try {
      const response = await ApiService.post('/orders/supplier-order', orderData) as ApiResponse;
      
      if (response && response.success) {
        return {
          success: true,
          reference: response.data?.supplierOrderId || response.data?.reference,
          estimatedCompletionTime: response.data?.estimatedCompletionTime,
          status: response.data?.status || 'processing'
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Failed to send order to supplier'
        };
      }
    } catch (error) {
      console.error('Error sending order to supplier:', error);
      return {
        success: false,
        message: 'Failed to connect to supplier service'
      };
    }
  },
  
  // Check order status from supplier via backend
  checkOrderStatus: async (referenceId: string): Promise<SupplierOrderResponse> => {
    try {
      const response = await ApiService.get(`/orders/supplier-status/${referenceId}`) as ApiResponse;
      
      if (response && response.success) {
        return {
          success: true,
          reference: referenceId,
          status: response.data?.status,
          message: response.data?.message
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Failed to check order status'
        };
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      return {
        success: false,
        message: 'Failed to check order status'
      };
    }
  },
  
  // Cancel order with supplier via backend
  cancelOrder: async (referenceId: string): Promise<SupplierOrderResponse> => {
    try {
      const response = await ApiService.post(`/orders/supplier-cancel/${referenceId}`) as ApiResponse;
      
      if (response && response.success) {
        return {
          success: true,
          message: 'Order cancelled successfully'
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Failed to cancel order'
        };
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        message: 'Failed to cancel order'
      };
    }
  },
  
  // Get supplier services
  getSupplierServices: async () => {
    try {
      const response = await ApiService.get('/supplier/services');
      return response;
    } catch (error) {
      console.error('Error fetching supplier services:', error);
      throw error;
    }
  },
  
  // Get supplier balance
  getSupplierBalance: async () => {
    try {
      const response = await ApiService.get('/supplier/balance');
      return response;
    } catch (error) {
      console.error('Error fetching supplier balance:', error);
      throw error;
    }
  }
};
