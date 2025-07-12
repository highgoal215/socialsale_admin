// src/services/notification-service.ts

import ApiService from './api-services';

export interface Notification {
  _id: string;
  userId: string;
  type: 'order_update' | 'payment' | 'support' | 'promo' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  relatedId?: string;
  onModel?: 'Order' | 'Ticket' | 'Transaction';
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: Notification[];
}

export interface CreateNotificationInput {
  userId?: string;
  email?: string;
  type: Notification['type'];
  title: string;
  message: string;
  link?: string;
  relatedId?: string;
  onModel?: string;
}

export interface BroadcastNotificationInput {
  type: Notification['type'];
  title: string;
  message: string;
  link?: string;
}

const NotificationService = {
  // Get user notifications with optional filtering
  getNotifications: async (filters?: {
    read?: boolean;
    type?: Notification['type'];
    limit?: number;
  }): Promise<NotificationResponse> => {
    try {
      let queryParams = '';
      if (filters) {
        const params = [];
        if (filters.read !== undefined) params.push(`read=${filters.read}`);
        if (filters.type) params.push(`type=${filters.type}`);
        if (filters.limit) params.push(`limit=${filters.limit}`);
        
        if (params.length > 0) {
          queryParams = `?${params.join('&')}`;
        }
      }
      
      const response = await ApiService.get<NotificationResponse>(`/notifications${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        count: 0,
        unreadCount: 0,
        data: []
      };
    }
  },

  // Get a specific notification
  getNotification: async (id: string): Promise<Notification | null> => {
    try {
      const response = await ApiService.get<{ success: boolean; data: Notification }>(`/notifications/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      return null;
    }
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification | null> => {
    try {
      const response = await ApiService.put<{ success: boolean; data: Notification }>(`/notifications/${id}/read`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      return null;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const response = await ApiService.put<{ success: boolean; message: string }>('/notifications/read-all');
      return response.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Delete a notification
  deleteNotification: async (id: string): Promise<boolean> => {
    try {
      const response = await ApiService.delete<{ success: boolean }>(`/notifications/${id}`);
      return response.success;
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      return false;
    }
  },

  // Admin: Send notification to specific user
  sendNotification: async (data: CreateNotificationInput): Promise<{ notification: Notification | null; user?: any }> => {
    try {
      const response = await ApiService.post<{ success: boolean; data: Notification; user?: any }>('/notifications/admin/send', data);
      return {
        notification: response.success ? response.data : null,
        user: response.user
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { notification: null };
    }
  },

  // Admin: Broadcast notification to all users
  broadcastNotification: async (data: BroadcastNotificationInput): Promise<{ success: boolean; count: number; message: string }> => {
    try {
      const response = await ApiService.post<{ success: boolean; count: number; message: string }>('/notifications/admin/broadcast', data);
      return response;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return { success: false, count: 0, message: 'Failed to broadcast notification' };
    }
  },

  // Get unread count only
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await NotificationService.getNotifications({ read: false, limit: 1 });
      return response.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Admin: Send maintenance notification
  sendMaintenanceNotification: async (data: {
    type: 'maintenance' | 'update' | 'outage';
    message: string;
    scheduledTime?: string;
    duration?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await ApiService.post<{ success: boolean; message: string; data?: any }>('/analytics/maintenance', data);
      return response;
    } catch (error) {
      console.error('Error sending maintenance notification:', error);
      return { success: false, message: 'Failed to send maintenance notification' };
    }
  }
};

export default NotificationService; 