// src/services/user-service.ts

import ApiService from './api-services';

export type UserRole = 'user' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'blocked' | 'deleted';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  status: string;
  blockstate: number; // 0: active, 1: blocked, 2: deleted
  balance: number;
  totalSpent: number;
  instagramUsername?: string;
  preferredPaymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  blocked: number;
  deleted: number;
  newUsers: {
    today: number;
    week: number;
    month: number;
  };
  roleDistribution: {
    user: number;
    admin: number;
    moderator: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  data: User[];
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  instagramUsername?: string;
  preferredPaymentMethod?: string;
  password?: string;
}

export interface UpdateBalanceInput {
  amount: number;
  type: 'add' | 'subtract';
  note?: string;
}

export const UserService = {
  getAllUsers: async (filters?: { status?: UserStatus; role?: UserRole; search?: string }): Promise<User[]> => {
    let queryParams = '';
    
    if (filters) {
      const params = [];
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.role) params.push(`role=${filters.role}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      
      if (params.length > 0) {
        queryParams = `?${params.join('&')}`;
      }
    }
    
    return ApiService.get<UsersResponse>(`/users${queryParams}`)
      .then(response => response.data);
  },
  
  getUserStats: async (): Promise<UserStats> => {
    return ApiService.get<{success: boolean; data: UserStats}>('/users/stats')
      .then(response => response.data);
  },
  
  getUserProfile: async (): Promise<User> => {
    return ApiService.get<UserResponse>('/users/profile')
      .then(response => response.data);
  },
  
  updateUserProfile: async (userData: UpdateUserInput): Promise<User> => {
    return ApiService.put<UserResponse>('/users/profile', userData)
      .then(response => response.data);
  },
  
  getUser: async (userId: string): Promise<User> => {
    return ApiService.get<UserResponse>(`/users/${userId}`)
      .then(response => response.data);
  },
  
  createUser: async (userData: UpdateUserInput & { password: string }): Promise<User> => {
    return ApiService.post<UserResponse>('/users', userData)
      .then(response => response.data);
  },
  
  updateUser: async (userId: string, userData: UpdateUserInput): Promise<User> => {
    return ApiService.put<UserResponse>(`/users/${userId}`, userData)
      .then(response => response.data);
  },
  
  deleteUser: async (userId: string): Promise<boolean> => {
    return ApiService.delete<{success: boolean}>(`/users/${userId}`)
      .then(response => response.success);
  },
  
  updateUserStatus: async (userId: string, status: UserStatus): Promise<User> => {
    return ApiService.put<UserResponse>(`/users/${userId}/status`, { status })
      .then(response => response.data);
  },
  
  updateUserBalance: async (userId: string, balanceData: UpdateBalanceInput): Promise<User> => {
    return ApiService.put<UserResponse>(`/users/${userId}/balance`, balanceData)
      .then(response => response.data);
  }
};

export default UserService;