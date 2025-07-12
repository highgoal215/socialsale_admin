import { Card } from '@/components/ui/card';
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';

interface ServiceDistributionProps {
  serviceDistribution: {
    _id: string;
    count: number;
    revenue: number;
  }[];
}

const ServiceDistribution = ({ serviceDistribution = [] }: ServiceDistributionProps) => {
  // Calculate percentages based on service distribution data
  // If no data provided, use default values
  const calculateServicePercentages = () => {
    if (!serviceDistribution || serviceDistribution.length === 0) {
      return {
        followers: 45,
        likes: 30,
        views: 15,
        comments: 10
      };
    }

    // Calculate total count of all services
    const totalCount = serviceDistribution.reduce((sum, service) => sum + service.count, 0);
    
    // Get percentage for each service type
    const getPercentage = (type: string) => {
      const service = serviceDistribution.find(s => s._id === type);
      if (!service) return 0;
      return Math.round((service.count / totalCount) * 100);
    };

    return {
      followers: getPercentage('followers'),
      likes: getPercentage('likes'),
      views: getPercentage('views'),
      comments: getPercentage('comments')
    };
  };

  const percentages = calculateServicePercentages();

  return (
    <AnalyticsCard title="Service Distribution" delay={0.4}>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Followers</span>
            <span className="text-sm font-medium">{percentages.followers}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentages.followers}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Likes</span>
            <span className="text-sm font-medium">{percentages.likes}%</span>
          </div>
          <div className="w-full bg-red-100 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${percentages.likes}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Views</span>
            <span className="text-sm font-medium">{percentages.views}%</span>
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${percentages.views}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Comments</span>
            <span className="text-sm font-medium">{percentages.comments}%</span>
          </div>
          <div className="w-full bg-green-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentages.comments}%` }}></div>
          </div>
        </div>
      </div>
      
      <Card className="mt-6 p-4 bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Quick Summary</h4>
        <p className="text-sm text-muted-foreground">
          Followers services account for almost half of all orders, followed by likes at {percentages.likes}%.
        </p>
      </Card>
      
      {/* Services Growth */}
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-medium">Monthly Growth</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Followers</div>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-lg font-semibold">+12.5%</span>
              <span className="text-xs text-green-500 mb-0.5">↑</span>
            </div>
          </div>
          
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Likes</div>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-lg font-semibold">+8.3%</span>
              <span className="text-xs text-green-500 mb-0.5">↑</span>
            </div>
          </div>
          
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Views</div>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-lg font-semibold">+17.2%</span>
              <span className="text-xs text-green-500 mb-0.5">↑</span>
            </div>
          </div>
          
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Comments</div>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-lg font-semibold">+5.8%</span>
              <span className="text-xs text-green-500 mb-0.5">↑</span>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
};

export default ServiceDistribution;
