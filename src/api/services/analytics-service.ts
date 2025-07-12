// src/services/analytics-service.ts

import ApiService from './api-services';

export interface DashboardStats {
  users: {
    total: number;
    new: number;
  };
  orders: {
    total: number;
    new: number;
    statusDistribution: Array<{ _id: string; count: number }>;
  };
  revenue: {
    total: number;
    period: number;
  };
  serviceDistribution: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  recentOrders: Array<any>;
  recentUsers: Array<any>;
}

export interface SalesData {
  salesData: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  serviceDistribution: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}

export interface UserGrowthData {
  userGrowth: Array<{
    _id: string;
    count: number;
  }>;
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
  status: {
    active: number;
    blocked: number;
    deleted: number;
  };
}

export interface ServiceStatsData {
  popularServices: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  qualityDistribution: Array<{
    _id: {
      type: string;
      quality: string;
    };
    count: number;
    revenue: number;
  }>;
  avgOrderValue: Array<{
    _id: string;
    avg: number;
    total: number;
    count: number;
  }>;
  serviceStatus: {
    active: number;
    inactive: number;
  };
}

export interface PaymentStatsData {
  paymentMethods: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  transactionStatus: Array<{
    _id: string;
    count: number;
    amount: number;
  }>;
  monthlyTransactions: Array<{
    _id: string;
    count: number;
    amount: number;
  }>;
}

export interface MonthlyReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  orders: {
    total: number;
    completed: number;
    completion_rate: number;
  };
  revenue: number;
  serviceDistribution: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  newUsers: number;
  dailyBreakdown: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}

export const AnalyticsService = {
  getDashboardStats: (period?: string): Promise<DashboardStats> => {
    return ApiService.get<{ success: boolean; data: DashboardStats }>(`/analytics/dashboard${period ? `?period=${period}` : ''}`)
      .then(response => response.data);
  },

  getSalesData: (period?: string, interval?: string): Promise<SalesData> => {
    let query = '';
    if (period) query += `period=${period}`;
    if (interval) query += `${query ? '&' : ''}interval=${interval}`;
    
    return ApiService.get<{ success: boolean; data: SalesData }>(`/analytics/sales${query ? `?${query}` : ''}`)
      .then(response => response.data);
  },

  getUserGrowth: (period?: string, interval?: string): Promise<UserGrowthData> => {
    let query = '';
    if (period) query += `period=${period}`;
    if (interval) query += `${query ? '&' : ''}interval=${interval}`;
    
    return ApiService.get<{ success: boolean; data: UserGrowthData }>(`/analytics/users${query ? `?${query}` : ''}`)
      .then(response => response.data);
  },

  getServiceStats: (): Promise<ServiceStatsData> => {
    return ApiService.get<{ success: boolean; data: ServiceStatsData }>('/analytics/services')
      .then(response => response.data);
  },

  getPaymentStats: (): Promise<PaymentStatsData> => {
    return ApiService.get<{ success: boolean; data: PaymentStatsData }>('/analytics/payments')
      .then(response => response.data);
  },

  getMonthlyReport: (year?: number, month?: number): Promise<MonthlyReportData> => {
    let query = '';
    if (year) query += `year=${year}`;
    if (month) query += `${query ? '&' : ''}month=${month}`;
    
    return ApiService.get<{ success: boolean; data: MonthlyReportData }>(`/analytics/monthly-report${query ? `?${query}` : ''}`)
      .then(response => response.data);
  }
};

export default AnalyticsService;