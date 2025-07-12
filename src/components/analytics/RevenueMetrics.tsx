import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, ShoppingBag } from 'lucide-react';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

interface RevenueMetricsProps {
  totalRevenue: number;
  periodRevenue: number;
  orderCount: number;
  newOrderCount: number;
  period: Period;
}

const RevenueMetrics = ({ 
  totalRevenue, 
  periodRevenue, 
  orderCount, 
  newOrderCount, 
  period 
}: RevenueMetricsProps) => {
  // Calculate percentage change (for demo purposes)
  const percentageChange = {
    revenue: 8.2,
    sales: 12.5,
    avgOrder: 4.3,
    conversion: 6.7
  };

  // Calculate average order value
  const avgOrderValue = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : "0.00";
  
  // Format period name for display
  const periodName = period === 'today' ? "Today" : 
                    period === 'week' ? "This Week" : 
                    period === 'month' ? "This Month" : "This Year";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
            <DollarSign size={20} />
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 flex items-center">
            <TrendingUp size={14} />
            <span className="ml-1">+{percentageChange.revenue}%</span>
          </span>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
        <div className="mt-1 flex items-baseline">
          <p className="text-2xl font-semibold">${totalRevenue.toLocaleString()}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          From {orderCount.toLocaleString()} orders
        </p>
      </Card>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <ShoppingBag size={20} />
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 flex items-center">
            <TrendingUp size={14} />
            <span className="ml-1">+{percentageChange.sales}%</span>
          </span>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground">{periodName}'s Sales</h3>
        <div className="mt-1 flex items-baseline">
          <p className="text-2xl font-semibold">${periodRevenue.toLocaleString()}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          From {newOrderCount} orders {period === 'today' ? 'today' : `this ${period}`}
        </p>
      </Card>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
            <CreditCard size={20} />
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 flex items-center">
            <TrendingUp size={14} />
            <span className="ml-1">+{percentageChange.avgOrder}%</span>
          </span>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground">Avg. Order Value</h3>
        <div className="mt-1 flex items-baseline">
          <p className="text-2xl font-semibold">${avgOrderValue}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Increased from previous {period}
        </p>
      </Card>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
            <TrendingUp size={20} />
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 flex items-center">
            <TrendingUp size={14} />
            <span className="ml-1">+{percentageChange.conversion}%</span>
          </span>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
        <div className="mt-1 flex items-baseline">
          <p className="text-2xl font-semibold">32.8%</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          From visitors to customers
        </p>
      </Card>
    </motion.div>
  );
};

export default RevenueMetrics;
