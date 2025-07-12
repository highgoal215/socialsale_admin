// src/pages/Pricing.tsx

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash, Save, DollarSign, Loader2, AlertCircle, Users, Heart, Eye, MessageCircle, Instagram, Video, Youtube, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import both services - we'll use the real one if available, fallback to mock
import ServiceService, { Service, CreateServiceInput, SupplierService, ServiceType, ServiceQuality } from '@/services/service-service';
import { PricingService, PriceTier } from '@/services/pricing-service';

const Pricing = () => {
  const { toast } = useToast();
  
  // Category icons mapping (like in OrderRow)
  const categoryIcons = {
    Instagram: <Instagram size={16} className="text-pink-500" />,
    YouTube: <Youtube size={16} className="text-red-500" />,
    TikTok: <FaTiktok size={16} className="text-purple-500" />
  };
  
  // Service type icons (like in OrdersTable)
  const serviceIcons = {
    followers: <Users size={16} className="text-blue-500" />,
    likes: <Heart size={16} className="text-red-500" />,
    views: <Eye size={16} className="text-purple-500" />,
    comments: <MessageCircle size={16} className="text-green-500" />
  };
  
  const [currentFilter, setCurrentFilter] = useState<'all' | ServiceType>('all');
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<'all' | string>('all');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newService, setNewService] = useState<CreateServiceInput>({
    name: 'Instagram Followers - Regular',
    type: 'followers',
    category: 'Instagram',
    quality: 'general',
    supplierServiceId: '',
    description: 'High-quality Instagram followers with fast delivery',
    price: 2.99,
    supplierPrice: 1.99,
    minQuantity: 100,
    maxQuantity: 10000,
    quantity: 100,
    popular: false,
    featured: false,
    active: true,
    deliverySpeed: '24-48 hours',
    refillAvailable: false
  });
  
  const [services, setServices] = useState<Service[]>([]);
  const [supplierServices, setSupplierServices] = useState<SupplierService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Fetch services with fallback to mock data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First, try to fetch from real backend
        console.log('Attempting to connect to backend...');
        const servicesData = await ServiceService.getAllServices();
        setServices(servicesData);
        setIsBackendAvailable(true);
        setMockMode(false);
        
        // Try to fetch supplier services
        try {
          const supplierData = await ServiceService.getSupplierServices();
          setSupplierServices(supplierData);
        } catch (error) {
          console.warn('Could not fetch supplier services:', error);
        }
        
        console.log('✅ Backend connection successful');
        // toast({
        //   title: "Connected to Backend",
        //   description: "Using real service data from backend",
        //   variant: "default",
        // });
        
      } catch (error: any) {
        console.warn('Backend not available, falling back to mock data:', error.message);
        setIsBackendAvailable(false);
        setMockMode(true);
        
        // Fallback to mock data
        try {
          const mockData = await PricingService.getAllPriceTiers();
          // Convert mock data to Service format
          const convertedServices: Service[] = mockData.map((tier, index) => ({
            _id: tier.id,
            name: `Instagram ${tier.service.charAt(0).toUpperCase() + tier.service.slice(1)} - ${tier.quantity}`,
            type: tier.service,
            category: 'Instagram',
            quality: 'general',
            description: `High-quality Instagram ${tier.service} service`,
            price: tier.price,
            supplierPrice: tier.price * 0.6, // Mock supplier price
            minQuantity: tier.quantity,
            maxQuantity: tier.quantity * 10,
            quantity: tier.quantity,
            originalPrice: tier.originalPrice,
            popular: tier.popular || false,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          setServices(convertedServices);
          setError(null);
          
          toast({
            title: "Using Mock Data",
            description: "Backend not available, using demo data",
            variant: "default",
          });
          
        } catch (mockError) {
          console.error('Error loading mock data:', mockError);
          setError('Failed to load any data. Please check your connection.');
          toast({
            title: "Error",
            description: "Failed to load data from any source",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Filter services based on selected filter and category
  const filteredServices = services.filter(service => {
    const matchesType = currentFilter === 'all' || service.type === currentFilter;
    const serviceCategory = service.category || 'Instagram'; // Default to Instagram if no category
    const matchesCategory = currentCategoryFilter === 'all' || serviceCategory === currentCategoryFilter;
    return matchesType && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter, currentCategoryFilter]);

  // Handle page change with animation
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || isPageTransitioning) return;
    
    setIsPageTransitioning(true);
    
    // Scroll to top of table with smooth animation
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    
    // Add a small delay for the scroll animation
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsPageTransitioning(false);
    }, 300);
  };

  // Generate page numbers with ellipsis for modern pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show first 3 pages + ellipsis + last page
        pages.push(2, 3);
        if (totalPages > 4) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 3 pages
        pages.push('ellipsis');
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Show first page + ellipsis + current page + ellipsis + last page
        pages.push('ellipsis');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Get unique categories from services, with fallback for services without categories
  const uniqueCategories = Array.from(new Set(
    services.map(service => service.category || 'Instagram').filter(Boolean)
  ));
  
  // Debug: Log categories for troubleshooting
  console.log('Available categories:', uniqueCategories);
  console.log('Current category filter:', currentCategoryFilter);
  console.log('Services with categories:', services.map(s => ({ name: s.name, category: s.category })));

  // Helper to get correct supplierServiceId
  const getSupplierServiceId = (type: ServiceType, quality: ServiceQuality) => {
    const ids = {
      followers: { general: '2183', premium: '3305' },
      likes: { general: '1782', premium: '1761' },
      views: { general: '8577', premium: '340' },
      comments: { general: '1234', premium: '5678' }
    };
    return ids[type]?.[quality] || '';
  };

  // Handle service creation
  const handleAddService = async () => {
    setIsAdding(true);
    try {
      const correctSupplierServiceId = getSupplierServiceId(newService.type, newService.quality);
      const serviceToCreate = { 
        ...newService, 
        supplierServiceId: correctSupplierServiceId,
        // Use the actual quantity value from the form, fallback to minQuantity if not set
        quantity: newService.quantity || newService.minQuantity || 100
      };
      if (mockMode) {
        // Handle mock mode
        const mockTier: Omit<PriceTier, 'id'> = {
          service: serviceToCreate.type,
          quantity: serviceToCreate.quantity || serviceToCreate.minQuantity || 100,
          price: serviceToCreate.price,
          originalPrice: serviceToCreate.price * 1.2,
          popular: serviceToCreate.popular
        };
        
        const createdTier = await PricingService.addPriceTier(mockTier);
        const convertedService: Service = {
          _id: createdTier.id,
          name: serviceToCreate.name,
          type: serviceToCreate.type,
          category: serviceToCreate.category,
          quality: serviceToCreate.quality,
          description: serviceToCreate.description,
          price: serviceToCreate.price,
          supplierPrice: serviceToCreate.supplierPrice,
          minQuantity: serviceToCreate.minQuantity,
          maxQuantity: serviceToCreate.maxQuantity,
          quantity: serviceToCreate.quantity,
          popular: serviceToCreate.popular || false,
          active: serviceToCreate.active || true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setServices([...services, convertedService]);
        setIsAddDialogOpen(false);
        toast({
          title: "Service created (Mock)",
          description: `Created new ${serviceToCreate.type} service successfully`,
          variant: "default",
        });
      } else {
        // Handle real backend mode
        const validation = ServiceService.validateServiceData(serviceToCreate);
        if (!validation.isValid) {
          toast({
            title: "Validation Error",
            description: validation.errors.join(', '),
            variant: "destructive",
          });
          return;
        }

        const createdService = await ServiceService.createService(serviceToCreate);
        setServices([...services, createdService]);
        setIsAddDialogOpen(false);
        toast({
          title: "Service created",
          description: `Created new ${serviceToCreate.type} service successfully`,
          variant: "default",
        });
      }
      
      // Reset form
      setNewService({
        name: `Instagram ${capitalize(currentFilter === 'all' ? 'Followers' : currentFilter)} - Regular`,
        type: currentFilter === 'all' ? 'followers' : currentFilter,
        category: 'Instagram',
        quality: 'general',
        supplierServiceId: '',
        description: `High-quality Instagram ${currentFilter === 'all' ? 'followers' : currentFilter} with fast delivery`,
        price: 2.99,
        supplierPrice: 1.99,
        minQuantity: 100,
        maxQuantity: 10000,
        quantity: 100,
        popular: false,
        featured: false,
        active: true,
        deliverySpeed: '24-48 hours',
        refillAvailable: false
      });
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle service update
  const handleUpdateService = async () => {
    if (!editingService) return;
    
    setIsUpdating(true);
    try {
      if (mockMode) {
        // Handle mock mode
        const mockTier: PriceTier = {
          id: editingService._id,
          service: editingService.type,
          quantity: editingService.quantity || editingService.minQuantity || 100,
          price: editingService.price,
          originalPrice: editingService.originalPrice || editingService.price * 1.2,
          popular: editingService.popular
        };
        
        const updatedTier = await PricingService.updatePriceTier(mockTier);
        const convertedService: Service = {
          ...editingService,
          price: updatedTier.price,
          originalPrice: updatedTier.originalPrice,
          popular: updatedTier.popular || false
        };
        
        setServices(services.map(s => s._id === convertedService._id ? convertedService : s));
        setEditingService(null);
        
        toast({
          title: "Service updated (Mock)",
          description: "The service has been updated successfully",
          variant: "default",
        });
      } else {
        // Handle real backend mode
        const updateData = {
          name: editingService.name,
          description: editingService.description,
          price: editingService.price,
          supplierPrice: editingService.supplierPrice,
          minQuantity: editingService.minQuantity,
          maxQuantity: editingService.maxQuantity,
          quantity: editingService.quantity,
          deliverySpeed: editingService.deliverySpeed,
          refillAvailable: editingService.refillAvailable,
          popular: editingService.popular,
          featured: editingService.featured,
          active: editingService.active
        };
        
        const updatedService = await ServiceService.updateService(editingService._id, updateData);
        setServices(services.map(s => s._id === updatedService._id ? updatedService : s));
        setEditingService(null);
        
        toast({
          title: "Service updated",
          description: "The service has been updated successfully",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle service deletion
  const handleDeleteService = async (serviceId: string) => {
    setIsDeleting(serviceId);
    try {
      let success = false;
      
      if (mockMode) {
        success = await PricingService.deletePriceTier(serviceId);
      } else {
        success = await ServiceService.deleteService(serviceId);
      }
      
      if (success) {
        setServices(services.filter(s => s._id !== serviceId));
        toast({
          title: "Service deleted",
          description: "The service has been deleted successfully",
          variant: "default",
        });
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle toggling popular status
  const handleTogglePopular = async (service: Service) => {
    try {
      if (mockMode) {
        // Handle mock mode
        const mockTier: PriceTier = {
          id: service._id,
          service: service.type,
          quantity: service.quantity || service.minQuantity || 100,
          price: service.price,
          originalPrice: service.originalPrice || service.price * 1.2,
          popular: !service.popular
        };
        
        const updatedTier = await PricingService.updatePriceTier(mockTier);
        const updatedService = { ...service, popular: updatedTier.popular || false };
        
        setServices(services.map(s => s._id === updatedService._id ? updatedService : s));
        
        toast({
          title: service.popular ? "Removed popular status" : "Marked as popular",
          description: `The service has been ${service.popular ? 'removed from popular services' : 'marked as popular'}`,
          variant: "default",
        });
      } else {
        // Handle real backend mode
        const updatedService = await ServiceService.togglePopular(service._id);
        setServices(services.map(s => s._id === updatedService._id ? updatedService : s));
        
        toast({
          title: service.popular ? "Removed popular status" : "Marked as popular",
          description: `The service has been ${service.popular ? 'removed from popular services' : 'marked as popular'}`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error toggling popular status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    }
  };

  // Helper function to capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      {/* {!isLoading && (
        <Alert className={isBackendAvailable ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <AlertCircle className={`h-4 w-4 ${isBackendAvailable ? "text-green-600" : "text-yellow-600"}`} />
          <AlertDescription className={isBackendAvailable ? "text-green-800" : "text-yellow-800"}>
            {isBackendAvailable 
              ? "✅ Connected to backend - Using real service data" 
              : "⚠️ Backend not available - Using demo data (changes will not persist)"
            }
          </AlertDescription>
        </Alert>
      )} */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground">
            Manage your service pricing tiers and special offers.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground self-center mr-2">Type:</span>
          <Button 
            variant={currentFilter === 'all' ? 'default' : 'outline'} 
            onClick={() => setCurrentFilter('all')}
          >
            All Types
          </Button>
          <Button 
            variant={currentFilter === 'followers' ? 'default' : 'outline'} 
            onClick={() => setCurrentFilter('followers')}
          >
            Followers
          </Button>
          <Button 
            variant={currentFilter === 'likes' ? 'default' : 'outline'} 
            onClick={() => setCurrentFilter('likes')}
          >
            Likes
          </Button>
          <Button 
            variant={currentFilter === 'views' ? 'default' : 'outline'} 
            onClick={() => setCurrentFilter('views')}
          >
            Views
          </Button>
          <Button 
            variant={currentFilter === 'comments' ? 'default' : 'outline'} 
            onClick={() => setCurrentFilter('comments')}
          >
            Comments
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 ml-4">
          <span className="text-sm font-medium text-muted-foreground self-center mr-2">Category:</span>
          <Button 
            variant={currentCategoryFilter === 'all' ? 'default' : 'outline'} 
            onClick={() => setCurrentCategoryFilter('all')}
          >
            All Categories
          </Button>
          {uniqueCategories.map(category => (
            <Button 
              key={category}
              variant={currentCategoryFilter === category ? 'default' : 'outline'} 
              onClick={() => setCurrentCategoryFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(currentFilter !== 'all' || currentCategoryFilter !== 'all') && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-muted-foreground">Active Filters:</span>
            {currentFilter !== 'all' && (
              <Badge variant="secondary" className="capitalize">
                Type: {currentFilter}
              </Badge>
            )}
            {currentCategoryFilter !== 'all' && (
              <Badge variant="secondary">
                Category: {currentCategoryFilter}
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setCurrentFilter('all');
                setCurrentCategoryFilter('all');
              }}
              className="ml-auto text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      <Card ref={tableRef}>
        <CardHeader>
          <CardTitle>Services {filteredServices.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading services...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Min Quantity</TableHead>
                    <TableHead>Max Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier Price</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-6 text-muted-foreground">
                        No services found for this filter. Add a new service to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedServices.map((service, index) => (
                      <TableRow 
                        key={service._id}
                        className={`transition-all duration-300 ease-out ${
                          isPageTransitioning 
                            ? 'transform translate-x-4 opacity-0' 
                            : 'transform translate-x-0 opacity-100'
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <TableCell className="font-medium">{service.name || `${capitalize(service.type)} Service`}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {categoryIcons[service.category as keyof typeof categoryIcons] || categoryIcons.Instagram}
                            <span>{service.category || 'Instagram'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {serviceIcons[service.type]}
                            <span className="capitalize">{service.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{service.quality || 'general'}</TableCell>
                        <TableCell className="font-medium text-primary">{service.quantity?.toLocaleString() || service.minQuantity?.toLocaleString() || '0'}</TableCell>
                        <TableCell>{service.minQuantity?.toLocaleString() || '0'}</TableCell>
                        <TableCell>{service.maxQuantity?.toLocaleString() || '0'}</TableCell>
                        <TableCell>${service.price.toFixed(2)}</TableCell>
                        <TableCell>${service.supplierPrice?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={service.popular ? "text-yellow-500" : "text-muted-foreground"}
                            onClick={() => handleTogglePopular(service)}
                          >
                            {service.popular ? "★ Popular" : "☆ Mark as Popular"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.active ? "default" : "secondary"}>
                            {service.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setEditingService(service)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteService(service._id)}
                              disabled={isDeleting === service._id}
                            >
                              {isDeleting === service._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        {/* Modern Pagination */}
        {filteredServices.length > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="font-medium">
                {startIndex + 1}-{Math.min(endIndex, filteredServices.length)}
              </span>
              <span>of</span>
              <span className="font-semibold text-foreground">
                {filteredServices.length.toLocaleString()}
              </span>
              <span>services</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {isPageTransitioning && (
                <div className="flex items-center space-x-2 mr-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Loading...</span>
                </div>
              )}
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPageTransitioning}
                className="h-8 w-8 p-0 hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {generatePageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === 'ellipsis' ? (
                      <div className="flex items-center justify-center w-8 h-8">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        disabled={isPageTransitioning}
                        className={`h-8 w-8 p-0 transition-all duration-200 ${
                          currentPage === page 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'hover:bg-background hover:text-foreground'
                        }`}
                      >
                        {page}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Next Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPageTransitioning}
                className="h-8 w-8 p-0 hover:bg-background transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Page Info */}
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </Card>

      {/* Edit Service Sheet */}
      <Sheet open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Service</SheetTitle>
            <SheetDescription>
              Update the service details and pricing.
            </SheetDescription>
          </SheetHeader>
          
          {editingService && (
            <div className="space-y-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={editingService.name || `${capitalize(editingService.type)} Service`}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingService.description || `High-quality ${editingService.type} service`}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    description: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingService.category || 'Instagram'}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    category: e.target.value
                  })}
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingService.price}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      price: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplierPrice">Supplier Price ($)</Label>
                  <Input
                    id="supplierPrice"
                    type="number"
                    step="0.01"
                    value={editingService.supplierPrice || 0}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      supplierPrice: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={editingService.quantity || editingService.minQuantity || 0}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      quantity: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Min Quantity</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={editingService.minQuantity || editingService.quantity || 0}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      minQuantity: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxQuantity">Max Quantity</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    value={editingService.maxQuantity || editingService.quantity || 0}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      maxQuantity: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliverySpeed">Delivery Speed</Label>
                <Input
                  id="deliverySpeed"
                  value={editingService.deliverySpeed || 'Standard delivery'}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    deliverySpeed: e.target.value
                  })}
                  placeholder="e.g. 24-48 hours"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={editingService.active}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      active: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={editingService.popular}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      popular: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="popular">Popular</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="refillAvailable"
                    checked={editingService.refillAvailable || false}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      refillAvailable: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="refillAvailable">Refill Available</Label>
                </div>
              </div>
            </div>
          )}
          
          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button 
              onClick={handleUpdateService} 
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add New Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service offering for your customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Service Name</Label>
              <Input
                id="new-name"
                value={newService.name}
                onChange={(e) => setNewService({
                  ...newService,
                  name: e.target.value
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-category">Category</Label>
              <select 
                id="new-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newService.category}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setNewService(prev => ({
                    ...prev,
                    category: newCategory,
                    name: `${newCategory} ${capitalize(prev.type)} - ${capitalize(prev.quality)}`,
                    description: `High-quality ${newCategory} ${prev.type} with fast delivery`
                  }));
                }}
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-type">Service Type</Label>
                <select 
                  id="new-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newService.type}
                  onChange={(e) => {
                    const newType = e.target.value as ServiceType;
                    setNewService(prev => ({
                      ...prev,
                      type: newType,
                      name: `${prev.category} ${capitalize(newType)} - ${capitalize(prev.quality)}`,
                      description: `High-quality ${prev.category} ${newType} with fast delivery`,
                      supplierServiceId: getSupplierServiceId(newType, prev.quality)
                    }));
                  }}
                >
                  <option value="followers">Followers</option>
                  <option value="likes">Likes</option>
                  <option value="views">Views</option>
                  <option value="comments">Comments</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-quality">Quality</Label>
                <select 
                  id="new-quality"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newService.quality}
                  onChange={(e) => {
                    const newQuality = e.target.value as ServiceQuality;
                    setNewService(prev => ({
                      ...prev,
                      quality: newQuality,
                      name: `${prev.category} ${capitalize(prev.type)} - ${capitalize(newQuality)}`,
                      price: newQuality === 'premium' ? prev.price * 1.5 : prev.price / 1.5,
                      supplierServiceId: getSupplierServiceId(prev.type, newQuality)
                    }));
                  }}
                >
                  <option value="general">Regular</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            
            {/* Service Type Helper */}
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Supplier Service ID Reference:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Followers:</span>
                  <div className="font-medium text-green-600">General: 2183, Premium: 3305</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes:</span>
                  <div className="font-medium text-blue-600">General: 1782, Premium: 1761</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Views:</span>
                  <div className="font-medium text-purple-600">General: 8577, Premium: 340</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Comments:</span>
                  <div className="font-medium text-orange-600">General: 1234, Premium: 5678</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <Input
                id="new-description"
                value={newService.description}
                onChange={(e) => setNewService({
                  ...newService,
                  description: e.target.value
                })}
              />
            </div>
            
            {supplierServices.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="new-supplierServiceId">Supplier Service *</Label>
                <select 
                  id="new-supplierServiceId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newService.supplierServiceId}
                  onChange={(e) => {
                    const selectedService = supplierServices.find(s => s.service === e.target.value);
                    if (selectedService) {
                      setNewService({
                        ...newService,
                        supplierServiceId: e.target.value,
                        supplierPrice: parseFloat(selectedService.rate),
                        minQuantity: parseInt(selectedService.min),
                        maxQuantity: parseInt(selectedService.max),
                        // Preserve the quantity field if it's already set, otherwise use minQuantity
                        quantity: newService.quantity || parseInt(selectedService.min),
                        type: selectedService.serviceType,
                        quality: selectedService.serviceQuality,
                        refillAvailable: selectedService.refill,
                        cancelAvailable: selectedService.cancel,
                        name: `${selectedService.category} ${capitalize(selectedService.serviceType)} - ${capitalize(selectedService.serviceQuality)}`
                      });
                    } else {
                      setNewService({
                        ...newService,
                        supplierServiceId: e.target.value
                      });
                    }
                  }}
                >
                  <option value="">Select a supplier service</option>
                  {supplierServices.map(service => (
                    <option key={service.service} value={service.service}>
                      {service.name} - ${parseFloat(service.rate).toFixed(2)} per 1000
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Selecting a supplier service will auto-fill pricing and quantity limits
                </p>
              </div>
            )}
            
            {supplierServices.length === 0 && (
              <div className="space-y-2">
                <Label htmlFor="new-supplierServiceId">Supplier Service ID *</Label>
                <Input
                  id="new-supplierServiceId"
                  value={newService.supplierServiceId}
                  onChange={(e) => setNewService({
                    ...newService,
                    supplierServiceId: e.target.value
                  })}
                  placeholder="Enter supplier service ID (e.g., 2183 for followers)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the supplier service ID manually if supplier services are not available
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-price">Price ($)</Label>
                <Input
                  id="new-price"
                  type="number"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService({
                    ...newService,
                    price: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-supplierPrice">Supplier Price ($)</Label>
                <Input
                  id="new-supplierPrice"
                  type="number"
                  step="0.01"
                  value={newService.supplierPrice}
                  onChange={(e) => setNewService({
                    ...newService,
                    supplierPrice: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            
            {/* Profit Margin Calculator */}
            {newService.price > 0 && newService.supplierPrice > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Profit:</span>
                    <div className="font-medium text-green-600">
                      ${(newService.price - newService.supplierPrice).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Margin:</span>
                    <div className="font-medium text-blue-600">
                      {((newService.price - newService.supplierPrice) / newService.price * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Markup:</span>
                    <div className="font-medium text-purple-600">
                      {((newService.price - newService.supplierPrice) / newService.supplierPrice * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-minQuantity">Min Quantity</Label>
                <Input
                  id="new-minQuantity"
                  type="number"
                  value={newService.minQuantity}
                  onChange={(e) => setNewService({
                    ...newService,
                    minQuantity: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-maxQuantity">Max Quantity</Label>
                <Input
                  id="new-maxQuantity"
                  type="number"
                  value={newService.maxQuantity}
                  onChange={(e) => setNewService({
                    ...newService,
                    maxQuantity: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-quantity">Quantity</Label>
                <Input
                  id="new-quantity"
                  type="number"
                  value={newService.quantity || 100}
                  onChange={(e) => setNewService({
                    ...newService,
                    quantity: parseInt(e.target.value) || 100
                  })}
                  placeholder="e.g. 1000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-deliverySpeed">Delivery Speed</Label>
                <Input
                  id="new-deliverySpeed"
                  value={newService.deliverySpeed}
                  onChange={(e) => setNewService({
                    ...newService,
                    deliverySpeed: e.target.value
                  })}
                  placeholder="e.g. 24-48 hours"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-active"
                  checked={newService.active}
                  onChange={(e) => setNewService({
                    ...newService,
                    active: e.target.checked
                  })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="new-active">Active</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-popular"
                  checked={newService.popular}
                  onChange={(e) => setNewService({
                    ...newService,
                    popular: e.target.checked
                  })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="new-popular">Popular</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-refillAvailable"
                  checked={newService.refillAvailable}
                  onChange={(e) => setNewService({
                    ...newService,
                    refillAvailable: e.target.checked
                  })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="new-refillAvailable">Refill</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddService}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;