import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Instagram, Heart, Eye, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Order, OrderStatus, ServiceType } from '@/services/order-service';
import { OrderRow } from './OrderRow';
import { SearchFilterBar } from './SearchFilterBar';
import { TablePagination } from './TablePagination';
import { OrdersTableHeader } from './OrdersTableHeader';
import { OrderLoading } from './detail/OrderLoading';
import { useToast } from '@/hooks/use-toast';
import { UIOrder } from './types';

export interface OrdersTableProps {
  initialOrders?: UIOrder[];
}

export const OrdersTable = ({ initialOrders = [] }: OrdersTableProps) => {
  const [allOrders, setAllOrders] = useState<UIOrder[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<UIOrder[]>([]);
  const [isLoading, setIsLoading] = useState(initialOrders.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<keyof UIOrder>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const ordersPerPage = 10;
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type') as ServiceType | null;
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Service type icons
  const serviceIcons = {
    followers: <Instagram size={16} className="text-blue-500" />,
    likes: <Heart size={16} className="text-red-500" />,
    views: <Eye size={16} className="text-purple-500" />,
    comments: <MessageCircle size={16} className="text-green-500" />
  };
  
  // Status badge variants
  const statusVariants = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    processing: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    completed: 'bg-green-100 text-green-800 hover:bg-green-200',
    partial: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    canceled: 'bg-red-100 text-red-800 hover:bg-red-200',
    failed: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    // For backward compatibility with the UI
    rejected: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  // Initialize with provided orders if available
  useEffect(() => {
    if (initialOrders.length > 0) {
      setAllOrders(initialOrders);
      setIsLoading(false);
    }
  }, [initialOrders]);

  // Sort and filter orders
  useEffect(() => {
    let filtered = [...allOrders];
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(order => order.serviceType === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(term) || 
        order.socialUsername.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        // For numerical fields
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
    });
    
    // Calculate total pages
    const total = Math.ceil(filtered.length / ordersPerPage);
    setTotalPages(total > 0 ? total : 1);
    
    // Ensure current page is within bounds after filtering
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
    
    // Apply pagination
    const startIndex = (currentPage - 1) * ordersPerPage;
    const paginatedOrders = filtered.slice(startIndex, startIndex + ordersPerPage);
    
    setDisplayedOrders(paginatedOrders);
  }, [allOrders, typeFilter, statusFilter, searchTerm, currentPage, sortField, sortDirection]);

  const handleRowClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleSort = (field: keyof UIOrder) => {
    if (field === sortField) {
      // Toggle direction if same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending order
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const createNewOrder = () => {
    // Navigate to new order form page (you'll need to create this)
    navigate('/orders/new');
    toast({
      title: "New Order",
      description: "Create a new order",
    });
  };

  if (isLoading) {
    return <OrderLoading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <SearchFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          onCreateOrder={createNewOrder}
        />
        
        <div className="overflow-x-auto">
          <Table>
            <OrdersTableHeader 
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
            />
            <TableBody>
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    {typeFilter ? (
                      <div>
                        <p className="mb-2">No {typeFilter} orders found</p>
                        <p className="text-sm text-muted-foreground">Try changing your filters or create a new order</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-2">No orders found</p>
                        <p className="text-sm text-muted-foreground">Try changing your filters or create a new order</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => (
                  <OrderRow 
                    key={order._id}
                    order={order}
                    onRowClick={handleRowClick}
                    serviceIcons={serviceIcons}
                    statusVariants={statusVariants}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          totalItems={allOrders.length}
          itemsPerPage={ordersPerPage}
          isMobile={isMobile}
        />
      </Card>
    </motion.div>
  );
};