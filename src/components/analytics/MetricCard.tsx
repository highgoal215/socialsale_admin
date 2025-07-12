
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Heart, Eye, MessageCircle } from 'lucide-react';
import { ReactNode } from 'react';
import { FaInstagram } from 'react-icons/fa';

type MetricType = 'followers' | 'likes' | 'views' | 'comments';

interface MetricCardProps {
  title: string;
  value: number | string;
  change: number;
  type: MetricType;
  delay?: number;
}

export const MetricCard = ({ title, value, change, type, delay = 0 }: MetricCardProps) => {
  const isPositive = change >= 0;
  
  // Icon mapping based on type
  const icons: Record<MetricType, ReactNode> = {
    followers: <FaInstagram size={20} />,
    likes: <Heart size={20} />,
    views: <Eye size={20} />,
    comments: <MessageCircle size={20} />
  };
  
  // Background colors based on type
  const bgColors: Record<MetricType, string> = {
    followers: 'bg-blue-50 text-blue-600',
    likes: 'bg-red-50 text-red-600',
    views: 'bg-purple-50 text-purple-600',
    comments: 'bg-green-50 text-green-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="overflow-hidden h-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColors[type]}`}>
              {icons[type]}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold">{value}</p>
            <span className="ml-1 text-muted-foreground text-sm">total</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
