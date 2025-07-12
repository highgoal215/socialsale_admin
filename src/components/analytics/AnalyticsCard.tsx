
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface AnalyticsCardProps {
  children: ReactNode;
  title: string;
  className?: string;
  delay?: number;
}

export const AnalyticsCard = ({ children, title, className = '', delay = 0 }: AnalyticsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="w-full"
    >
      <Card className={`overflow-hidden h-full ${className}`}>
        <div className="p-5">
          <h3 className="text-md font-medium text-muted-foreground mb-2">{title}</h3>
          <div>{children}</div>
        </div>
      </Card>
    </motion.div>
  );
};
