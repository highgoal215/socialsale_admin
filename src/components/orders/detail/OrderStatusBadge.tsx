import { Badge } from '@/components/ui/badge';

type OrderStatus = 'pending' | 'completed' | 'rejected' | 'processing';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const statusVariants = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <Badge 
      variant="outline"
      className={`${statusVariants[status]} capitalize px-3 py-1.5`}
    >
      {status}
    </Badge>
  );
};
