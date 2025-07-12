import { ReactNode } from 'react';
import { Order as ApiOrder, OrderStatus, ServiceType,PaymentStatus } from '@/services/order-service';

// UI-friendly order representation that matches the component expectations
export interface UIOrder {
   _id: string;
    userId: any;
    completedAt: string | null;
    orderNumber: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    postUrl?: string;
    price: number;
    quality: string;
    quantity: number;
    refillId: boolean | null;
    refillRequested:boolean;
    refillStatus:string|null;
    remains:number;
    serviceId:string;
    serviceType: ServiceType;
    socialUsername:string;
    status: OrderStatus;
    supplierOrderId:string|null;
    supplierPrice:number;
    supplierServiceId:string;
    category?: string; // Add category field
    // createdAt: string;
    updatedAt: string;
}

// Props for the OrderRow component
export interface OrderRowProps {
  order: UIOrder;
  onRowClick: (orderId: string) => void;
  serviceIcons: Record<ServiceType, ReactNode>;
  statusVariants: Record<OrderStatus | 'rejected', string>;
}

// Convert API order to UI order
// export const apiToUiOrder = (order: ApiOrder): UIOrder => {
//   return {
//     orderNumber: order._id,
//     socialUsername: order.user?.username || order.socialUsername || order.instagramUsername || 'Unknown',
//     serviceType: order.serviceType,
//     quantity: order.quantity,
//     price: order.price,
//     status: order.status,
//     updatedAt: new Date(order.createdAt).toLocaleDateString()
//   };
// };
