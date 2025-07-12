import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for daily sales
const dailySalesData = [
  { date: 'Mon', sales: 2400, conversions: 24 },
  { date: 'Tue', sales: 1398, conversions: 13 },
  { date: 'Wed', sales: 9800, conversions: 98 },
  { date: 'Thu', sales: 3908, conversions: 39 },
  { date: 'Fri', sales: 4800, conversions: 48 },
  { date: 'Sat', sales: 3800, conversions: 38 },
  { date: 'Sun', sales: 4300, conversions: 43 },
];

interface SalesConversionProps {
  conversionRate: number;
  serviceDistribution: {
    _id: string;
    count: number;
    revenue: number;
  }[];
}

const SalesConversion = ({ conversionRate, serviceDistribution }: SalesConversionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Daily Sales & Conversions</h3>
            <p className="text-sm text-muted-foreground">Tracking your daily performance</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <span>Sales ($)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Conversions</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailySalesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorSales)" 
                yAxisId="left"
              />
              <Area 
                type="monotone" 
                dataKey="conversions" 
                stroke="#4ade80" 
                fillOpacity={1} 
                fill="url(#colorConversion)" 
                yAxisId="right"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};

export default SalesConversion;
