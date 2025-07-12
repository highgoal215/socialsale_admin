import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '@/hooks/use-mobile';
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';

interface RecentOrdersProps {
  recentOrders: any[]; // Using any[] since we don't know the exact shape
}

// Default mock data to use if no orders are provided
const defaultOrders = [
  { id: 'ORD-1234', username: 'user_432', service: 'followers', quantity: 500, status: 'pending' },
  { id: 'ORD-5678', username: 'influencer99', service: 'likes', quantity: 1200, status: 'completed' },
  { id: 'ORD-9101', username: 'brand_official', service: 'views', quantity: 3000, status: 'completed' },
  { id: 'ORD-1121', username: 'creator_studio', service: 'comments', quantity: 150, status: 'rejected' },
  { id: 'ORD-3141', username: 'social_guru', service: 'followers', quantity: 750, status: 'pending' },
];

// Status badge variants
const statusVariants = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const RecentOrders = ({ recentOrders = defaultOrders }: RecentOrdersProps) => {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  
  // Use provided orders or fall back to default mock data if empty
  const displayOrders = recentOrders.length > 0 ? recentOrders : defaultOrders;
  
  return (
    <AnalyticsCard title="Recent Orders" className="lg:col-span-2" delay={0.3}>
      <div className="overflow-x-auto -mx-5 px-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead className={isMobile ? "hidden" : ""}>Username</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayOrders.map((order, idx) => (
              <TableRow 
                key={`${order.id || 'order'}-${idx}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>@{order.username}</TableCell>
                <TableCell className="capitalize">{order.service}</TableCell>
                <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${statusVariants[order.status as keyof typeof statusVariants]} capitalize whitespace-nowrap`}>
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
          View All Orders
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </AnalyticsCard>
  );
};

export default RecentOrders;
