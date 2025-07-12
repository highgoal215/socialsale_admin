// src/pages/Dashboard.tsx

import { useState, useEffect } from 'react';
import RevenueMetrics from '@/components/analytics/RevenueMetrics';
import MetricsRow from '@/components/analytics/MetricsRow';
import SalesConversion from '@/components/analytics/SalesConversion';
import { PerformanceGraph } from '@/components/analytics/PerformanceGraph';
import RecentOrders from '@/components/analytics/RecentOrders';
import ServiceDistribution from '@/components/analytics/ServiceDistribution';
import CountryMap from '@/components/analytics/CountryMap';
import AnalyticsService, { DashboardStats, SalesData } from '@/api/analytics-service';
import { Loader2 } from 'lucide-react';
import { TestNotificationButton } from '@/components/TestNotificationButton';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch dashboard stats
        const stats = await AnalyticsService.getDashboardStats(period);
        setDashboardStats(stats);

        // Fetch sales data with daily interval
        const sales = await AnalyticsService.getSalesData(period, 'daily');
        setSalesData(sales);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Dashboard</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Period selection and test notification */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Time period:</span>
          <div className="flex gap-1">
            {(['today', 'week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1 text-sm rounded-full ${
                  p === period
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Test notification button */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Test notifications:</span>
          <TestNotificationButton />
        </div>
      </div>

      {/* Revenue Overview */}
      {dashboardStats && (
        <RevenueMetrics 
          totalRevenue={dashboardStats.revenue.total}
          periodRevenue={dashboardStats.revenue.period}
          orderCount={dashboardStats.orders.total}
          newOrderCount={dashboardStats.orders.new}
          period={period}
        />
      )}
      
      {/* Metrics Row */}
      {dashboardStats && (
        <MetricsRow 
          totalUsers={dashboardStats.users.total}
          newUsers={dashboardStats.users.new}
          ordersDistribution={dashboardStats.orders.statusDistribution}
        />
      )}
      
      {/* Sales Conversion Metrics */}
      {dashboardStats && (
        <SalesConversion
          conversionRate={32.8} // This seems to be hardcoded in the original
          serviceDistribution={dashboardStats.serviceDistribution}
        />
      )}
      
      {/* Performance Graph */}
      {salesData && (
        <PerformanceGraph 
          salesData={salesData.salesData}
          period={period}
        />
      )}
      
      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {dashboardStats && (
          <RecentOrders recentOrders={dashboardStats.recentOrders} />
        )}
        
        {dashboardStats && (
          <ServiceDistribution 
            serviceDistribution={dashboardStats.serviceDistribution} 
          />
        )}
      </div>
      
      {/* Geographic Distribution */}
      <CountryMap />
    </div>
  );
};

export default Dashboard;