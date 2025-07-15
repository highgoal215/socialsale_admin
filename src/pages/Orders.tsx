// src/pages/Orders.tsx

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { Loader2 } from 'lucide-react';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api-services';

// Define types based on your API response
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'partial' | 'canceled' | 'failed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ServiceType = 'followers' | 'subscribers' | 'likes' | 'views' | 'comments';

export interface Order {
  _id: string;
  userId: any;
  completedAt: string | null;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  postUrl?: string;
  price: number;
  quality: string;
  quantity: number;
  refillId: boolean | null;
  refillRequested:boolean;
  refillStatus:string|null;
  remains:number;
  serviceId:string;
  serviceType: ServiceType;
  socialUsername:string;
  status: OrderStatus;
  supplierOrderId:string|null;
  supplierPrice:number;
  supplierServiceId:string;
  // createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  data: Order[];
}

const Orders = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0
  });

  // Get service type filter from URL if present
  const typeFilter = searchParams.get('type') as ServiceType | null;

  useEffect(() => {
    // Scroll to top when the component mounts or orderId changes
    window.scrollTo(0, 0);
  }, [orderId]);

  // Fetch orders from API
  useEffect(() => {
    // Don't fetch orders if we're viewing a single order
    if (orderId) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Construct query params
        let queryParams = '';
        const params = [];

        if (typeFilter) {
          params.push(`type=${typeFilter}`);
        }

        // Add page and limit
        params.push('page=1');
        params.push('limit=20');

        if (params.length > 0) {
          queryParams = `?${params.join('&')}`;
        }

        // Make the API request
        const response = await ApiService.get<OrdersResponse>(`/orders${queryParams}`);

        if (response && response.success) {
          setOrders(response.data || []);
          setPagination(response.pagination || { total: 0, page: 1, pages: 0 });
          console.log("Orders fetched successfully:", response);
        } else {
          console.error("Invalid response format:", response);
          setError('Received invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [typeFilter, orderId, toast]);
  console.log("This is orders:>>>>>>>>>>", orders);

  // Show order details if an orderId is provided, otherwise show the orders table
  if (orderId) {
    return <OrderDetail orderId={orderId} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-muted-foreground mb-6">
          View and manage customer orders
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Orders</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            className="bg-primary text-primary-foreground rounded-md px-4 py-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
          <p className="text-muted-foreground mb-6">
            {typeFilter
              ? `There are no ${typeFilter} orders yet.`
              : 'There are no orders yet. Orders will appear here once they are placed by customers.'}
          </p>
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Total orders: {pagination.total} | Page {pagination.page} of {pagination.pages}
            </p>
          </div>
        </div>
      ) : (
        <OrdersTable initialOrders={orders} />
      )}
    </div>
  );
};

export default Orders;