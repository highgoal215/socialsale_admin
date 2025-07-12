
import { Card } from '@/components/ui/card';

export const OrderLoading = () => {
  return (
    <Card className="p-6">
      <div className="h-60 flex items-center justify-center">
        <div className="animate-spin-slow w-10 h-10 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </Card>
  );
};
