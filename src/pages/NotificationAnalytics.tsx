import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bell, Eye, Clock, TrendingUp, Users, BarChart3, PieChart, Activity } from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '@/services/api-services';

interface NotificationAnalytics {
  totalNotifications: number;
  notificationsByType: Array<{
    _id: string;
    count: number;
  }>;
  readStatus: Array<{
    _id: boolean;
    count: number;
  }>;
  notificationsByDay: Array<{
    _id: string;
    count: number;
    readCount: number;
  }>;
  topUsers: Array<{
    userId: string;
    username: string;
    email: string;
    notificationCount: number;
    readCount: number;
    readRate: number;
  }>;
}

interface EngagementMetrics {
  totalNotifications: number;
  readNotifications: number;
  engagementRate: number;
  engagementByType: Array<{
    type: string;
    total: number;
    read: number;
    engagementRate: number;
  }>;
  timeToRead: Array<{
    _id: string;
    avgTimeToRead: number;
    minTimeToRead: number;
    maxTimeToRead: number;
  }>;
}

interface PerformanceMetrics {
  period: string;
  metrics: {
    totalSent: number;
    totalRead: number;
    avgTimeToRead: number;
  };
  performanceByType: Array<{
    type: string;
    sent: number;
    read: number;
    readRate: number;
    avgTimeToRead: number;
  }>;
  dailyTrends: Array<{
    date: string;
    sent: number;
    read: number;
    readRate: number;
  }>;
}

export default function NotificationAnalytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load overview analytics
      const overviewResponse = await ApiService.get<{ success: boolean; data: NotificationAnalytics }>('/notification-analytics/overview');
      setAnalytics(overviewResponse.data);
      
      // Load engagement metrics
      const engagementResponse = await ApiService.get<{ success: boolean; data: EngagementMetrics }>(`/notification-analytics/engagement?days=${period === '7d' ? '7' : period === '90d' ? '90' : '30'}`);
      setEngagement(engagementResponse.data);
      
      // Load performance metrics
      const performanceResponse = await ApiService.get<{ success: boolean; data: PerformanceMetrics }>(`/notification-analytics/performance?period=${period}`);
      setPerformance(performanceResponse.data);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load notification analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    if (!milliseconds) return 'N/A';
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order_update': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-orange-100 text-orange-800';
      case 'promo': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading notification analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Analytics</h1>
          <p className="text-muted-foreground">
            Monitor notification performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <Activity size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Eye size={16} />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalNotifications || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.readStatus ? 
                    Math.round((analytics.readStatus.find(s => s._id === true)?.count || 0) / analytics.totalNotifications * 100) : 0}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.topUsers?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Time to Read</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagement?.timeToRead?.[0]?.avgTimeToRead ? 
                    formatTime(engagement.timeToRead[0].avgTimeToRead) : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications by Type</CardTitle>
              <CardDescription>
                Distribution of notifications across different types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics?.notificationsByType.map((type) => (
                  <div key={type._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(type._id)}>
                        {type._id.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{type.count}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((type.count / analytics.totalNotifications) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Notifications</CardTitle>
              <CardDescription>
                Users with the highest notification activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topUsers?.slice(0, 10).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{user.notificationCount} notifications</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(user.readRate)}% read rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Engagement Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagement?.totalNotifications || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Read</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagement?.readNotifications || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(engagement?.engagementRate || 0)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Notification Type</CardTitle>
              <CardDescription>
                Read rates for different notification types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagement?.engagementByType.map((type) => (
                  <div key={type.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(type.type)}>
                        {type.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{type.read} / {type.total}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(type.engagementRate)}% engagement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance?.metrics.totalSent || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Read</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance?.metrics.totalRead || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Time to Read</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance?.metrics.avgTimeToRead ? 
                    formatTime(performance.metrics.avgTimeToRead) : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Notification Type</CardTitle>
              <CardDescription>
                Detailed performance metrics for each notification type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance?.performanceByType.map((type) => (
                  <div key={type.type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getTypeColor(type.type)}>
                        {type.type.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(type.readRate)}% read rate
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Sent</div>
                        <div className="text-muted-foreground">{type.sent}</div>
                      </div>
                      <div>
                        <div className="font-medium">Read</div>
                        <div className="text-muted-foreground">{type.read}</div>
                      </div>
                      <div>
                        <div className="font-medium">Avg Time</div>
                        <div className="text-muted-foreground">
                          {formatTime(type.avgTimeToRead)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 