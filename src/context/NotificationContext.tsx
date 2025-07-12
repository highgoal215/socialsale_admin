// src/context/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import NotificationService, { Notification, NotificationResponse } from '@/services/notification-service';
import ApiService from '@/services/api-services';
import socketService from '@/services/socket-service';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (data: any) => Promise<void>;
  broadcastNotification: (data: any) => Promise<void>;
  sendMaintenanceNotification: (data: any) => Promise<void>;
  getNotificationAnalytics: (params?: any) => Promise<any>;
  getNotificationEngagement: (params?: any) => Promise<any>;
  getNotificationPerformance: (params?: any) => Promise<any>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem('admin_token');
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response: NotificationResponse = await NotificationService.getNotifications({ limit: 50 });
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      setError('Error fetching notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Real-time updates - only connect if authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    console.log('🔌 Connecting to Socket.IO for real-time notifications...');
    socketService.connect();
    socketService.joinAdminRoom();

    // Join user room for real-time notifications
    try {
      const userStr = localStorage.getItem('admin_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user._id) {
          console.log(`👤 Joining user room: user_${user._id}`);
          socketService.joinUserRoom(user._id);
        }
      }
    } catch (e) {
      console.error('Failed to join user room:', e);
    }

    const handleNewNotification = (data: { notification: Notification; unreadCount: number }) => {
      console.log('🔔 Received real-time notification:', data);
      
      // Immediately add the new notification to the top of the list
      setNotifications(prev => {
        // Check if notification already exists to prevent duplicates
        const exists = prev.some(n => n._id === data.notification._id);
        if (exists) {
          console.log('⚠️ Notification already exists, skipping duplicate');
          return prev;
        }
        return [data.notification, ...prev];
      });
      
      // Update unread count
      setUnreadCount(data.unreadCount);
      
      // Show toast notification immediately
      toast({
        title: data.notification.title,
        description: data.notification.message,
        duration: 5000,
      });
      
      console.log('✅ Notification displayed immediately');
    };
    
    // Listen for socket connection status
    const handleConnect = () => {
      console.log('✅ Socket.IO connected successfully');
    };
    
    const handleDisconnect = () => {
      console.log('❌ Socket.IO disconnected');
    };
    
    socketService.onNewNotification(handleNewNotification);
    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);
    
    return () => {
      console.log('🔌 Cleaning up Socket.IO listeners...');
      socketService.offNewNotification(handleNewNotification);
    };
  }, [isAuthenticated, toast]);

  // Only fetch notifications if authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchNotifications();
    }
  }, [fetchNotifications, isAuthenticated]);

  // Notification actions
  const refresh = fetchNotifications;

  const markAsRead = async (id: string) => {
    if (!isAuthenticated()) return;
    
    try {
      const updatedNotification = await NotificationService.markAsRead(id);
      if (updatedNotification) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to mark notification as read.', variant: 'destructive' });
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const success = await NotificationService.markAllAsRead();
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to mark all notifications as read.', variant: 'destructive' });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!isAuthenticated()) return;
    
    try {
      const success = await NotificationService.deleteNotification(id);
      if (success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n._id === id);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete notification.', variant: 'destructive' });
    }
  };

  const sendNotification = async (data: any) => {
    if (!isAuthenticated()) return;
    
    try {
      const response = await NotificationService.sendNotification(data);
      if (response.notification) {
        const userInfo = response.user ? ` to ${response.user.email}` : '';
        toast({ 
          title: 'Success', 
          description: `Notification sent successfully${userInfo}.`, 
          variant: 'default' 
        });
        // Refresh notifications to show the new notification
        await fetchNotifications();
      } else {
        toast({ 
          title: 'Error', 
          description: 'Failed to send notification.', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error('Send notification error:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to send notification. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  const broadcastNotification = async (data: any) => {
    if (!isAuthenticated()) return;
    
    try {
      const response = await NotificationService.broadcastNotification(data);
      if (response.success) {
        toast({ 
          title: 'Success', 
          description: `Notification broadcasted to ${response.count} users successfully.`, 
          variant: 'default' 
        });
        // Refresh notifications to show the new broadcast
        await fetchNotifications();
      } else {
        toast({ 
          title: 'Error', 
          description: response.message || 'Failed to broadcast notification.', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error('Broadcast notification error:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to broadcast notification. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  const sendMaintenanceNotification = async (data: any) => {
    if (!isAuthenticated()) return;
    
    try {
      const response = await NotificationService.sendMaintenanceNotification(data);
      if (response.success) {
        toast({ 
          title: 'Success', 
          description: response.message, 
          variant: 'default' 
        });
        // Refresh notifications to show the new notification
        await fetchNotifications();
      } else {
        toast({ 
          title: 'Error', 
          description: response.message, 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error('Send maintenance notification error:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to send maintenance notification. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  const getNotificationAnalytics = async (params?: any) => {
    if (!isAuthenticated()) throw new Error('Not authenticated');
    
    try {
      const response = await ApiService.get<any>('/notification-analytics/overview', { params });
      return response;
    } catch (error) {
      console.error('Error fetching notification analytics:', error);
      throw error;
    }
  };

  const getNotificationEngagement = async (params?: any) => {
    if (!isAuthenticated()) throw new Error('Not authenticated');
    
    try {
      const response = await ApiService.get<any>('/notification-analytics/engagement', { params });
      return response;
    } catch (error) {
      console.error('Error fetching notification engagement:', error);
      throw error;
    }
  };

  const getNotificationPerformance = async (params?: any) => {
    if (!isAuthenticated()) throw new Error('Not authenticated');
    
    try {
      const response = await ApiService.get<any>('/notification-analytics/performance', { params });
      return response;
    } catch (error) {
      console.error('Error fetching notification performance:', error);
      throw error;
    }
  };

  const value: NotificationContextProps = {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    broadcastNotification,
    sendMaintenanceNotification,
    getNotificationAnalytics,
    getNotificationEngagement,
    getNotificationPerformance,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}; 