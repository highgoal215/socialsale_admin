// src/components/orders/OrderDetail.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Send, 
  Clock, 
  User, 
  Mail, 
  CreditCard, 
  Instagram, 
  Link, 
  FileText, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  Heart,
  MessageCircle,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Share2
} from 'lucide-react';
import { FaTiktok } from "react-icons/fa";

// Import service
import OrderService, { Order as ApiOrder } from '@/services/order-service';
import { SupplierService, SupplierOrderRequest } from '@/services/supplier-service';

// Types for this component
export interface DetailedOrder {
  id: string;
  username: string;
  serviceType: 'followers' | 'likes' | 'views' | 'comments';
  quantity: number;
  price: number;
  status: 'pending' | 'completed' | 'rejected' | 'processing';
  date: string;
  instagramHandle: string;
  postUrl?: string;
  notes?: string;
  customerEmail?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  startCount?: number;
  remains?: number;
  refillRequested?: boolean;
  refillStatus?: string;
  supplierOrderId?: string;
  supplierPrice?: number;
  quality?: 'regular' | 'premium';
}

interface OrderDetailProps {
  orderId: string;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId }) => {
  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [originalOrder, setOriginalOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingToSupplier, setIsSendingToSupplier] = useState(false);
  const [supplierResponse, setSupplierResponse] = useState<{success: boolean; message?: string}>();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Service type icons
  const serviceIcons = {
    followers: <Users size={20} className="text-blue-500" />,
    likes: <Heart size={20} className="text-red-500" />,
    views: <Eye size={20} className="text-purple-500" />,
    comments: <MessageCircle size={20} className="text-green-500" />
  };

  // Helper function to get service icon with fallback
  const getServiceIcon = (serviceType: string) => {
    return serviceIcons[serviceType as keyof typeof serviceIcons] || <AlertCircle size={20} className="text-gray-500" />;
  };

  // Status configurations
  const statusConfig = {
    pending: { 
      label: 'Pending', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Clock size={16} className="text-yellow-600" />
    },
    processing: { 
      label: 'Processing', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <RefreshCw size={16} className="text-blue-600 animate-spin" />
    },
    completed: { 
      label: 'Completed', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle size={16} className="text-green-600" />
    },
    rejected: { 
      label: 'Rejected', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle size={16} className="text-red-600" />
    },
    // Add fallback for unknown statuses
    unknown: {
      label: 'Unknown',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <AlertCircle size={16} className="text-gray-600" />
    }
  };

  // Helper function to get status config with fallback
  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
  };

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await OrderService.getOrder(orderId);
        
        if (!data) {
          setError('Order not found');
          return;
        }
        
        setOriginalOrder(data);
        
        // Validate required fields and provide fallbacks
        if (!data._id) {
          setError('Invalid order data: Missing order ID');
          return;
        }
        
        // Transform API order to component format with proper fallbacks
        const detailedOrder: DetailedOrder = {
          id: data._id,
          username: data.user?.username || 'Unknown User',
          serviceType: data.serviceType || 'followers',
          quantity: data.quantity || 0,
          price: data.price || 0,
          // Map backend status to frontend status
          status: (() => {
            switch (data.status) {
              case 'canceled':
                return 'rejected';
              case 'pending':
              case 'processing':
              case 'completed':
                return data.status;
              default:
                return 'pending';
            }
          })(),
          date: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          instagramHandle: data.socialUsername || 'Unknown',
          postUrl: data.postUrl || undefined,
          notes: data.orderNotes || '',
          customerEmail: data.user?.email || 'No email available',
          paymentMethod: data.paymentMethod || 'Unknown',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
          completedAt: data.completedAt || undefined,
          startCount: data.startCount || undefined,
          remains: data.remains || undefined,
          refillRequested: data.refillRequested || false,
          refillStatus: data.refillStatus || undefined,
          supplierOrderId: data.supplierOrderId || undefined,
          supplierPrice: data.supplierPrice || undefined,
          quality: data.quality || 'regular'
        };
        
        setOrder(detailedOrder);
      } catch (error: any) {
        console.error('Error fetching order:', error);
        
        // Provide more specific error messages
        if (error.response?.status === 404) {
          setError('Order not found. It may have been deleted or you may not have permission to view it.');
        } else if (error.response?.status === 403) {
          setError('You do not have permission to view this order.');
        } else if (error.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (error.message?.includes('Network Error')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to fetch order details. Please try again later.');
        }
        
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, toast]);

  const handleApprove = async () => {
    if (!order || !originalOrder) return;
    
    setIsProcessing(true);
    
    try {
      await OrderService.updateOrderStatus(order.id, { status: 'completed' });
      setOrder({ ...order, status: 'completed' });
      
      toast({
        title: "Order Approved",
        description: `Order ${order.id} has been successfully approved.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        title: "Error",
        description: "Failed to approve order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!order || !originalOrder) return;
    
    setIsProcessing(true);
    
    try {
      await OrderService.updateOrderStatus(order.id, { status: 'canceled' });
      setOrder({ ...order, status: 'rejected' });
      
      toast({
        title: "Order Rejected",
        description: `Order ${order.id} has been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToSupplier = async () => {
    if (!order || !originalOrder) return;
    
    setIsSendingToSupplier(true);
    
    try {
      const supplierOrderData: SupplierOrderRequest = {
        orderId: order.id,
        serviceType: order.serviceType,
        quantity: order.quantity,
        target: order.serviceType === 'followers' ? order.instagramHandle : order.postUrl || order.instagramHandle,
        customerEmail: order.customerEmail
      };
      
      const result = await SupplierService.sendOrderToSupplier(supplierOrderData);
      
      setSupplierResponse({
        success: result.success,
        message: result.success 
          ? `Order sent to supplier successfully. Reference: ${result.reference}` 
          : result.message || 'Failed to send order to supplier'
      });
      
      if (result.success) {
        await OrderService.updateOrderStatus(order.id, { status: 'processing' });
        setOrder({ ...order, status: 'processing' });
        
        toast({
          title: "Success",
          description: "Order sent to supplier successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send order to supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending order to supplier:', error);
      setSupplierResponse({
        success: false,
        message: 'An error occurred while sending the order to the supplier'
      });
      toast({
        title: "Error",
        description: "Error sending order to supplier",
        variant: "destructive",
      });
    } finally {
      setIsSendingToSupplier(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
      variant: "default",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    if (!order?.startCount || !order?.quantity) return 0;
    const delivered = order.quantity - (order.remains || 0);
    return Math.min((delivered / order.quantity) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Order</h3>
              <p className="text-muted-foreground mb-6">{error || 'Order not found'}</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button variant="outline" onClick={() => navigate('/orders')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Additional safety check for required fields
  if (!order.id || !order.serviceType || !order.instagramHandle) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive mb-2">Invalid Order Data</h3>
              <p className="text-muted-foreground mb-6">This order appears to be corrupted or missing required information.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button variant="outline" onClick={() => navigate('/orders')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/orders')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.id}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={`${getStatusConfig(order.status).color} border`}
          >
            <span className="flex items-center gap-1">
              {getStatusConfig(order.status).icon}
              {getStatusConfig(order.status).label}
            </span>
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getServiceIcon(order.serviceType)}
                Order Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getServiceIcon(order.serviceType)}
                      <span className="capitalize font-medium">{order.serviceType}</span>
                      {order.quality && (
                        <Badge variant="secondary" className="text-xs">
                          {order.quality}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {order.quantity.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Price</label>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      ${order.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Target Account</label>
                    <p className="flex items-center gap-2 mt-1">
                      <Instagram size={16} className="text-pink-500" />
                      <span className="font-medium">@{order.instagramHandle}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.instagramHandle)}
                      >
                        <Copy size={14} />
                      </Button>
                    </p>
                  </div>
                  
                  {order.postUrl && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Post URL</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Link size={16} className="text-blue-500" />
                        <a 
                          href={order.postUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate flex-1"
                        >
                          {order.postUrl}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(order.postUrl!)}
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(order.postUrl, '_blank')}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <p className="flex items-center gap-2 mt-1">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span>{formatDate(order.createdAt)}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar for Processing Orders */}
              {order.status === 'processing' && order.startCount && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Progress</span>
                    <span className="font-medium">
                      {order.quantity - (order.remains || 0)} / {order.quantity} delivered
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Started: {order.startCount?.toLocaleString()}</span>
                    <span>Remaining: {(order.remains || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                    <p className="flex items-center gap-2 mt-1">
                      <User size={16} className="text-muted-foreground" />
                      <span className="font-medium">{order.username}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="flex items-center gap-2 mt-1">
                      <Mail size={16} className="text-muted-foreground" />
                      <span>{order.customerEmail}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.customerEmail!)}
                      >
                        <Copy size={14} />
                      </Button>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <p className="flex items-center gap-2 mt-1">
                      <CreditCard size={16} className="text-muted-foreground" />
                      <span className="capitalize">{order.paymentMethod}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle size={14} className="mr-1" />
                      Paid
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} className="text-orange-500" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supplier Response */}
          {supplierResponse && (
            <Card className={supplierResponse.success ? "border-green-200" : "border-red-200"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send size={20} className={supplierResponse.success ? "text-green-500" : "text-red-500"} />
                  Supplier Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  supplierResponse.success 
                    ? "bg-green-50 border border-green-200" 
                    : "bg-red-50 border border-red-200"
                }`}>
                  <p className={`text-sm ${
                    supplierResponse.success ? "text-green-800" : "text-red-800"
                  }`}>
                    {supplierResponse.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Summary */}
        <div className="space-y-6">
          {/* Order Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === 'pending' && (
                <>
                  <Button 
                    className="w-full" 
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approve Order
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSendToSupplier}
                    disabled={isSendingToSupplier}
                  >
                    {isSendingToSupplier ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send to Supplier
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reject Order
                  </Button>
                </>
              )}
              
              {order.status === 'processing' && (
                <div className="text-center py-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Order is being processed</p>
                </div>
              )}
              
              {order.status === 'completed' && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Order completed successfully</p>
                </div>
              )}
              
              {order.status === 'rejected' && (
                <div className="text-center py-4">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Order was rejected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} className="text-green-500" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Value</span>
                <span className="font-semibold">${order.price.toFixed(2)}</span>
              </div>
              
              {order.supplierPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier Cost</span>
                  <span className="font-semibold">${order.supplierPrice.toFixed(2)}</span>
                </div>
              )}
              
              {order.supplierPrice && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit</span>
                    <span className="font-semibold text-green-600">
                      ${(order.price - order.supplierPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin</span>
                    <span className="font-semibold text-green-600">
                      {((order.price - order.supplierPrice) / order.price * 100).toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Order Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Order Updated</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}
                
                {order.completedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Order Completed</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.supplierOrderId && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Supplier Order ID</label>
                  <p className="text-sm font-mono">{order.supplierOrderId}</p>
                </div>
              )}
              
              {order.refillRequested && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Refill Status</label>
                  <Badge variant="outline" className="text-xs">
                    {order.refillStatus || 'Requested'}
                  </Badge>
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-muted-foreground">Order ID</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono">{order.id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(order.id)}
                  >
                    <Copy size={12} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};