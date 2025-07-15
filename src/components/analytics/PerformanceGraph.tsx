import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { useBreakpoint } from '@/hooks/use-mobile';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

interface PerformanceGraphProps {
  salesData: {
    _id: string;
    count: number;
    revenue: number;
  }[];
  period: Period;
}

// Empty data generator - will be populated from backend
const generateData = (days = 7) => {
  return [];
};

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const timeRanges: TimeRange[] = [
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: '3 Months', value: '3m', days: 90 },
  { label: 'All Time', value: 'all', days: 365 }
];

export const PerformanceGraph = ({ salesData, period }: PerformanceGraphProps) => {
  const [data, setData] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMetrics, setSelectedMetrics] = useState({
    followers: true,
    likes: true,
    views: true,
    comments: true
  });
  
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  
  // Colors for each metric
  const colors = {
    followers: '#3b82f6',  // Blue
    likes: '#ef4444',      // Red
    views: '#8b5cf6',      // Purple
    comments: '#10b981',   // Green
  };

  useEffect(() => {
    // Simulate API call to fetch data
    setIsLoading(true);
    
    const range = timeRanges.find(r => r.value === selectedRange) || timeRanges[0];
    
    // Use the passed salesData to generate visualization data if possible
    // For now still using mock data for demonstration
    setTimeout(() => {
      setData(generateData(range.days));
      setIsLoading(false);
    }, 1000);
  }, [selectedRange, salesData]);

  // Update selected range when period changes
  useEffect(() => {
    switch(period) {
      case 'today':
        setSelectedRange('7d');
        break;
      case 'week':
        setSelectedRange('7d');
        break;
      case 'month':
        setSelectedRange('30d');
        break;
      case 'year':
        setSelectedRange('3m');
        break;
      case 'all':
        setSelectedRange('all');
        break;
    }
  }, [period]);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
  };

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const getAverages = () => {
    if (!data.length) return { followers: 0, subscribers: 0, likes: 0, views: 0, comments: 0 };
    
    const sum = data.reduce((acc, item) => {
      return {
        followers: acc.followers + item.followers,
        likes: acc.likes + item.likes,
        views: acc.views + item.views,
        comments: acc.comments + item.comments
      };
    }, { followers: 0, subscribers: 0, likes: 0, views: 0, comments: 0 });
    
    return {
      followers: Math.round(sum.followers / data.length),
      likes: Math.round(sum.likes / data.length),
      views: Math.round(sum.views / data.length),
      comments: Math.round(sum.comments / data.length)
    };
  };

  const averages = getAverages();

  // Rest of the component remains the same
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-medium">Performance Overview</h3>
            <div className="flex flex-wrap w-full md:w-auto space-x-1 bg-secondary rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md transition-colors text-black ${
                    selectedRange === range.value
                      ? 'bg-white shadow-sm text-black'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => handleRangeChange(range.value)}
                >
                  {isMobile ? range.label.substring(0, 2) : range.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Metric toggles for mobile */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(selectedMetrics).map(([metric, isSelected]) => (
              <button
                key={metric}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  isSelected 
                    ? `bg-${colors[metric as keyof typeof colors].substring(1)} text-white border-transparent` 
                    : 'bg-transparent border-muted text-muted-foreground'
                }`}
                style={{
                  backgroundColor: isSelected ? colors[metric as keyof typeof colors] : 'transparent',
                  color: isSelected ? 'white' : undefined
                }}
                onClick={() => toggleMetric(metric as keyof typeof selectedMetrics)}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="h-[350px] w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin-slow w-10 h-10 rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: isMobile ? 10 : 12, fill: '#888' }}
                    tickLine={false}
                    axisLine={{ stroke: '#f0f0f0' }}
                    interval={isMobile ? 'preserveStartEnd' : 0}
                  />
                  <YAxis 
                    tick={{ fontSize: isMobile ? 10 : 12, fill: '#888' }}
                    tickLine={false}
                    axisLine={{ stroke: '#f0f0f0' }}
                    width={isMobile ? 30 : 40}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      padding: '10px'
                    }}
                    labelStyle={{ marginBottom: '5px', fontWeight: 600 }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                    onClick={(e) => toggleMetric(e.dataKey as keyof typeof selectedMetrics)}
                  />
                  
                  {selectedMetrics.followers && (
                    <>
                      <ReferenceLine 
                        y={averages.followers} 
                        stroke={colors.followers} 
                        strokeDasharray="3 3" 
                        strokeWidth={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="followers"
                        stroke={colors.followers}
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        dot={{ stroke: colors.followers, strokeWidth: 2, fill: 'white', r: isMobile ? 3 : 4 }}
                        name="Followers"
                      />
                    </>
                  )}
                  
                  {selectedMetrics.likes && (
                    <>
                      <ReferenceLine 
                        y={averages.likes} 
                        stroke={colors.likes} 
                        strokeDasharray="3 3" 
                        strokeWidth={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="likes"
                        stroke={colors.likes}
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        dot={{ stroke: colors.likes, strokeWidth: 2, fill: 'white', r: isMobile ? 3 : 4 }}
                        name="Likes"
                      />
                    </>
                  )}
                  
                  {selectedMetrics.views && (
                    <>
                      <ReferenceLine 
                        y={averages.views} 
                        stroke={colors.views} 
                        strokeDasharray="3 3" 
                        strokeWidth={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke={colors.views}
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        dot={{ stroke: colors.views, strokeWidth: 2, fill: 'white', r: isMobile ? 3 : 4 }}
                        name="Views"
                      />
                    </>
                  )}
                  
                  {selectedMetrics.comments && (
                    <>
                      <ReferenceLine 
                        y={averages.comments} 
                        stroke={colors.comments} 
                        strokeDasharray="3 3" 
                        strokeWidth={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="comments"
                        stroke={colors.comments}
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        dot={{ stroke: colors.comments, strokeWidth: 2, fill: 'white', r: isMobile ? 3 : 4 }}
                        name="Comments"
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {selectedMetrics.followers && (
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">Avg Followers</p>
                <p className="text-lg font-semibold" style={{ color: colors.followers }}>
                  {averages.followers.toLocaleString()}
                </p>
              </div>
            )}
            
            {selectedMetrics.likes && (
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">Avg Likes</p>
                <p className="text-lg font-semibold" style={{ color: colors.likes }}>
                  {averages.likes.toLocaleString()}
                </p>
              </div>
            )}
            
            {selectedMetrics.views && (
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">Avg Views</p>
                <p className="text-lg font-semibold" style={{ color: colors.views }}>
                  {averages.views.toLocaleString()}
                </p>
              </div>
            )}
            
            {selectedMetrics.comments && (
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">Avg Comments</p>
                <p className="text-lg font-semibold" style={{ color: colors.comments }}>
                  {averages.comments.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
