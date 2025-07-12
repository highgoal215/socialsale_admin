import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, DollarSign } from 'lucide-react';

type OrderStatus = 'pending' | 'completed' | 'rejected' | 'processing';

interface OrderSummaryProps {
  createdAt: string;
  status: OrderStatus;
  price: number;
}

export const OrderSummary = ({ createdAt, status, price }: OrderSummaryProps) => {
  return (
    <Card className="h-fit">
      <div className="p-6 space-y-6">
        <h3 className="font-medium">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            <span className="text-sm">Ordered on {new Date(createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span className="text-sm">
              {status === 'pending' ? 'Awaiting approval' : 
               status === 'completed' ? 'Completed' : 
               status === 'processing' ? 'In progress' :
               'Rejected'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign size={16} />
            <span className="text-sm">Payment completed</span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Fee</span>
            <span>$0.00</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between py-2 font-medium">
            <span>Total</span>
            <span>${price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
