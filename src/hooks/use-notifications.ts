// src/hooks/use-notifications.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import NotificationService, { Notification, NotificationResponse } from '@/services/notification-service';
import { useToast } from '@/hooks/use-toast';
import socketService from '@/services/socket-service';

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
}

interface UseNotificationsReturn {
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
  getUnreadCount: () => Promise<number>;
}

export const useNotifications = () => {
  throw new Error('useNotifications is deprecated. Use useNotificationContext from NotificationContext instead.');
}; 