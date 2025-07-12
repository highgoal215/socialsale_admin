
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderHeaderProps {
  title: string;
}

export const OrderHeader = ({ title }: OrderHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft size={16} />
      </Button>
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
  );
};
