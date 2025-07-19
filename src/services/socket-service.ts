// src/services/socket-service.ts

import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isInitialized = false;

  constructor() {
    // Don't auto-initialize to prevent unnecessary connections
  }

  private initializeSocket() {
    if (this.isInitialized) return;
    
    // const API_URL ='http://localhost:5005';
    const API_URL ='http://localhost:5005';

    
    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
    this.isInitialized = true;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      // console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      // console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      // console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
  }

  public connect() {
    try {
      if (!this.isInitialized) {
        this.initializeSocket();
      }
      
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    } catch (error) {
      console.error('Socket connection error:', error);
      // Fallback: try to reconnect after a delay
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
        }
      }, 5000);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  public joinUserRoom(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user', userId);
    }
  }

  public joinAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-admin');
    }
  }

  public onNewNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  public offNewNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('new_notification', callback);
    }
  }

  public onConnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('connect', callback);
    }
  }

  public onDisconnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('disconnect', callback);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 