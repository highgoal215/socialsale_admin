
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import WorldMap from './WorldMap';

// Mock data for top countries
const topCountries = [
  { country: "United States", sales: 2453, percentage: 32 },
  { country: "United Kingdom", sales: 1254, percentage: 18 },
  { country: "Germany", sales: 864, percentage: 12 },
  { country: "France", sales: 654, percentage: 9 },
  { country: "Canada", sales: 532, percentage: 7 },
  { country: "Australia", sales: 462, percentage: 6 },
  { country: "Japan", sales: 368, percentage: 5 },
  { country: "Other", sales: 824, percentage: 11 },
];

const CountryMap = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Map size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold">Geographic Distribution</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 rounded-lg overflow-hidden h-[300px]">
            <WorldMap data={topCountries} />
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Top Countries</h4>
            <div className="space-y-4">
              {topCountries.map((country) => (
                <div key={country.country}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{country.country}</span>
                    <span className="text-sm font-medium">{country.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CountryMap;
