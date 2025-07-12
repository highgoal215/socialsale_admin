
import { Order } from './types';
import { ServiceType, OrderStatus } from './types';

// Generate mock data
export const generateOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  const serviceTypes: ServiceType[] = ['followers', 'likes', 'views', 'comments'];
  const statuses: OrderStatus[] = ['pending', 'completed', 'rejected'];
  
  for (let i = 0; i < count; i++) {
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const quantity = Math.floor(Math.random() * 1000) + 100;
    const price = (quantity * (Math.random() * 0.05 + 0.01)).toFixed(2);
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    orders.push({
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      username: `user_${Math.floor(Math.random() * 1000)}`,
      serviceType,
      quantity,
      price: parseFloat(price),
      status,
      date: date.toISOString().split('T')[0],
    });
  }
  
  return orders;
};
