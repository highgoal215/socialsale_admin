// src/services/service-service.ts

import ApiService from './api-services';

export type ServiceType = 'followers' | 'likes' | 'views' | 'comments';
export type ServiceQuality = 'general' | 'premium';

export interface Service {
  _id: string;
  name?: string;
  type: ServiceType;
  category?: string;
  quality?: ServiceQuality;
  supplierServiceId?: string;
  description?: string;
  price: number;
  supplierPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  quantity?: number;
  originalPrice?: number;
  popular: boolean;
  featured?: boolean;
  active: boolean;
  deliverySpeed?: string;
  refillAvailable?: boolean;
  cancelAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  type: ServiceType;
  category: string;
  quality: ServiceQuality;
  supplierServiceId: string;
  description: string;
  price: number;
  supplierPrice: number;
  minQuantity: number;
  maxQuantity: number;
  quantity?: number;
  popular?: boolean;
  featured?: boolean;
  active?: boolean;
  deliverySpeed: string;
  refillAvailable?: boolean;
  cancelAvailable?: boolean;
}

export interface SupplierService {
  service: string;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
  category: string;
  serviceType: ServiceType;
  serviceQuality: ServiceQuality;
}

interface ServiceResponse {
  success: boolean;
  data: Service;
}

interface ServicesResponse {
  success: boolean;
  count: number;
  data: Service[];
}

interface SupplierServicesResponse {
  success: boolean;
  count: number;
  data: SupplierService[];
}

// Service functions with comprehensive error handling
const ServiceService = {
  getAllServices: async (filters?: { type?: ServiceType; active?: boolean; popular?: boolean }): Promise<Service[]> => {
    try {
      let queryParams = '';
      
      if (filters) {
        const params = [];
        if (filters.type) params.push(`type=${filters.type}`);
        if (filters.active !== undefined) params.push(`active=${filters.active}`);
        if (filters.popular !== undefined) params.push(`popular=${filters.popular}`);
        
        if (params.length > 0) {
          queryParams = `?${params.join('&')}`;
        }
      }
      
      const response = await ApiService.get<ServicesResponse>(`/services${queryParams}`);
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Error fetching services:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch services');
    }
  },
  
  getSupplierServices: async (): Promise<SupplierService[]> => {
    try {
      const response = await ApiService.get<SupplierServicesResponse>('/services/supplier/services');
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Error fetching supplier services:', error);
      // Return empty array instead of throwing error for supplier services
      return [];
    }
  },
  
  createService: async (serviceData: CreateServiceInput): Promise<Service> => {
    try {
      // Validate required fields
      if (!serviceData.name || !serviceData.type || !serviceData.category || !serviceData.quality || !serviceData.supplierServiceId) {
        throw new Error('Missing required fields: name, type, category, quality, and supplierServiceId are required');
      }

      const response = await ApiService.post<ServiceResponse>('/services', serviceData);
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create service');
    } catch (error: any) {
      console.error('Error creating service:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to create service');
    }
  },
  
  updateService: async (serviceId: string, serviceData: Partial<CreateServiceInput>): Promise<Service> => {
    try {
      const response = await ApiService.put<ServiceResponse>(`/services/${serviceId}`, serviceData);
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update service');
    } catch (error: any) {
      console.error('Error updating service:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to update service');
    }
  },
  
  deleteService: async (serviceId: string): Promise<boolean> => {
    try {
      const response = await ApiService.delete<{success: boolean}>(`/services/${serviceId}`);
      return response && response.success;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete service');
    }
  },

  toggleServiceStatus: async (serviceId: string): Promise<Service> => {
    try {
      const response = await ApiService.put<ServiceResponse>(`/services/${serviceId}/toggle`, {});
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to toggle service status');
    } catch (error: any) {
      console.error('Error toggling service status:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to toggle service status');
    }
  },

  togglePopular: async (serviceId: string): Promise<Service> => {
    try {
      const response = await ApiService.put<ServiceResponse>(`/services/${serviceId}/popular`, {});
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to toggle popular status');
    } catch (error: any) {
      console.error('Error toggling popular status:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to toggle popular status');
    }
  },

  getSupplierBalance: async (): Promise<any> => {
    try {
      const response = await ApiService.get('/services/supplier/balance');
      return response;
    } catch (error: any) {
      console.error('Error fetching supplier balance:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch supplier balance');
    }
  },

  // Helper function to get supplier service ID for a given type and quality
  getSupplierServiceId: (type: ServiceType, quality: ServiceQuality): string => {
    const serviceIds = {
      followers: { general: '2183', premium: '3305' },
      likes: { general: '1782', premium: '1761' },
      views: { general: '8577', premium: '340' },
      comments: { general: '1234', premium: '5678' }
    };
    return serviceIds[type]?.[quality] || '';
  },

  // Helper function to validate service data
  validateServiceData: (data: CreateServiceInput): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Service name is required');
    if (!data.type) errors.push('Service type is required');
    if (!data.category) errors.push('Category is required');
    if (!data.quality) errors.push('Service quality is required');
    if (!data.supplierServiceId?.trim()) errors.push('Supplier service ID is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (data.price <= 0) errors.push('Price must be greater than 0');
    if (data.supplierPrice < 0) errors.push('Supplier price cannot be negative');
    if (data.minQuantity <= 0) errors.push('Minimum quantity must be greater than 0');
    if (data.maxQuantity <= 0) errors.push('Maximum quantity must be greater than 0');
    if (data.minQuantity > data.maxQuantity) errors.push('Minimum quantity cannot be greater than maximum quantity');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default ServiceService;