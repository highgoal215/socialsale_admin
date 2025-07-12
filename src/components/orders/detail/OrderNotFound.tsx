
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrderNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-warning mb-4" />
        <h3 className="text-lg font-medium mb-2">Order Not Found</h3>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/orders')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Orders
        </Button>
      </div>
    </Card>
  );
};
