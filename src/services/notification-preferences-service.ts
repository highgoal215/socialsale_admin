import ApiService from './api-services';

export interface NotificationPreferences {
  _id: string;
  userId: string;
  // Notification type preferences
  orderUpdates: boolean;
  payments: boolean;
  support: boolean;
  promotions: boolean;
  system: boolean;
  // Delivery method preferences
  inApp: boolean;
  email: boolean;
  push: boolean;
  // Frequency preferences
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  // Quiet hours
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  // Email preferences
  emailPreferences: {
    orderUpdates: boolean;
    payments: boolean;
    support: boolean;
    promotions: boolean;
    system: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesInput {
  orderUpdates?: boolean;
  payments?: boolean;
  support?: boolean;
  promotions?: boolean;
  system?: boolean;
  inApp?: boolean;
  email?: boolean;
  push?: boolean;
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  emailPreferences?: {
    orderUpdates: boolean;
    payments: boolean;
    support: boolean;
    promotions: boolean;
    system: boolean;
  };
}

const NotificationPreferencesService = {
  // Get user notification preferences
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await ApiService.get<{ success: boolean; data: NotificationPreferences }>('/notification-preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  },

  // Update user notification preferences
  updateNotificationPreferences: async (data: UpdateNotificationPreferencesInput): Promise<NotificationPreferences> => {
    try {
      const response = await ApiService.put<{ success: boolean; data: NotificationPreferences; message: string }>('/notification-preferences', data);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  // Reset user notification preferences to defaults
  resetNotificationPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await ApiService.delete<{ success: boolean; data: NotificationPreferences; message: string }>('/notification-preferences');
      return response.data;
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
      throw error;
    }
  },

  // Get notification preferences for a specific user (admin only)
  getUserNotificationPreferences: async (userId: string): Promise<NotificationPreferences> => {
    try {
      const response = await ApiService.get<{ success: boolean; data: NotificationPreferences }>(`/notification-preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user notification preferences:', error);
      throw error;
    }
  }
};

export default NotificationPreferencesService; 