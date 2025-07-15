// src/services/service-service.ts

import ApiService from './api-services';

export type ServiceType = 'followers' | 'subscribers' | 'likes' | 'views' | 'comments';
export type ServiceQuality = 'regular' | 'premium';

export interface Service {
  _id: string;
  name: string;
  type: ServiceType;
  quality: ServiceQuality;
  supplierServiceId: string;
  description: string;
  price: number;
  supplierPrice: number;
  minQuantity: number;
  maxQuantity: number;
  popular: boolean;
  featured: boolean;
  active: boolean;
  deliverySpeed: string;
  refillAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  type: ServiceType;
  quality: ServiceQuality;
  supplierServiceId: string;
  description: string;
  price: number;
  supplierPrice: number;
  minQuantity: number;
  maxQuantity: number;
  popular?: boolean;
  featured?: boolean;
  active?: boolean;
  deliverySpeed: string;
  refillAvailable?: boolean;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  _id: string;
}

export interface ServiceResponse {
  success: boolean;
  data: Service;
}

export interface ServicesResponse {
  success: boolean;
  count: number;
  data: Service[];
}

export interface SupplierService {
  id: number;
  name: string;
  type: string;
  quality: string;
  rate: number;
  min: number;
  max: number;
}

export interface SupplierServicesResponse {
  success: boolean;
  data: SupplierService[];
}

export interface SupplierBalanceResponse {
  success: boolean;
  data: {
    balance: number;
    currency: string;
  };
}

export const ServiceService = {
  getAllServices: async (filters?: { type?: ServiceType; active?: boolean; popular?: boolean }): Promise<Service[]> => {
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
    
    return ApiService.get<ServicesResponse>(`/services${queryParams}`)
      .then(response => response.data);
  },
  
  getService: async (serviceId: string): Promise<Service> => {
    return ApiService.get<ServiceResponse>(`/services/${serviceId}`)
      .then(response => response.data);
  },
  
  createService: async (serviceData: CreateServiceInput): Promise<Service> => {
    return ApiService.post<ServiceResponse>('/services', serviceData)
      .then(response => response.data);
  },
  
  updateService: async (serviceId: string, serviceData: Partial<CreateServiceInput>): Promise<Service> => {
    return ApiService.put<ServiceResponse>(`/services/${serviceId}`, serviceData)
      .then(response => response.data);
  },
  
  deleteService: async (serviceId: string): Promise<boolean> => {
    return ApiService.delete<{success: boolean}>(`/services/${serviceId}`)
      .then(response => response.success);
  },
  
  toggleServiceStatus: async (serviceId: string): Promise<Service> => {
    return ApiService.put<ServiceResponse>(`/services/${serviceId}/toggle`, {})
      .then(response => response.data);
  },
  
  togglePopular: async (serviceId: string): Promise<Service> => {
    return ApiService.put<ServiceResponse>(`/services/${serviceId}/popular`, {})
      .then(response => response.data);
  },
  
  // Supplier-related endpoints
  getSupplierServices: async (): Promise<SupplierService[]> => {
    return ApiService.get<SupplierServicesResponse>('/services/supplier/services')
      .then(response => response.data);
  },
  
  getSupplierBalance: async (): Promise<{balance: number; currency: string}> => {
    return ApiService.get<SupplierBalanceResponse>('/services/supplier/balance')
      .then(response => response.data);
  }
};

export default ServiceService;