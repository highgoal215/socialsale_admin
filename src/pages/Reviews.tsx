
import { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Search, 
  Star, 
  Calendar, 
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  MapPin,
  Loader2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "@/hooks/use-toast";
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import { ReviewDeleteDialog } from '@/components/reviews/ReviewDeleteDialog';
import ReviewService, { Review as BackendReview } from '@/services/review-service';

// Transform backend review to UI format
const transformReview = (backendReview: BackendReview) => ({
  id: backendReview._id,
  customerName: backendReview.username,
  avatarUrl: undefined, // Backend doesn't have avatar
  serviceType: backendReview.serviceUsed.toLowerCase() as 'followers' | 'subscribers' | 'likes' | 'views' | 'comments',
  rating: backendReview.rating,
  review: backendReview.content,
  date: backendReview.createdAt,
  featured: backendReview.isVerified,
  verified: backendReview.isVerified,
  location: undefined, // Backend doesn't have location
  status: backendReview.status,
  reviewTitle: backendReview.reviewTitle,
  email: backendReview.email,
  helpfulVotes: backendReview.helpfulVotes
});

const Reviews = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<BackendReview | null>(null);

  // Fetch reviews from backend
  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      const response = await ReviewService.getAllReviews(filters);
      
      if (response.success) {
        setReviews(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews when component mounts or filters change
  useEffect(() => {
    fetchReviews();
  }, [searchQuery, statusFilter, pagination.page]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleStatusFilter = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleUpdateStatus = async (reviewId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const updatedReview = await ReviewService.updateReviewStatus(reviewId, status);
      if (updatedReview) {
        setReviews(reviews.map(review => 
          review._id === reviewId ? updatedReview : review
        ));
        toast({
          title: "Status Updated",
          description: `Review status has been updated to ${status}.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update review status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast({
        title: "Error",
        description: "Failed to update review status.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerification = async (reviewId: string, currentVerified: boolean) => {
    try {
      const updatedReview = await ReviewService.verifyReview(reviewId, !currentVerified);
      if (updatedReview) {
        setReviews(reviews.map(review => 
          review._id === reviewId ? updatedReview : review
        ));
        toast({
          title: updatedReview.isVerified ? "Review Verified" : "Review Unverified",
          description: `The review has been ${updatedReview.isVerified ? 'verified' : 'unverified'}.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update review verification.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating review verification:', error);
      toast({
        title: "Error",
        description: "Failed to update review verification.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const success = await ReviewService.deleteReview(reviewId);
      if (success) {
        setReviews(reviews.filter(review => review._id !== reviewId));
        setIsDeleteDialogOpen(false);
        setSelectedReview(null);
        toast({
          title: "Review Deleted",
          description: "The review has been deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete review.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted stroke-muted-foreground"} 
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h1 className="text-2xl font-bold">Customer Reviews</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Review
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Reviews Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading reviews...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchReviews}>Retry</Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      <Star className="mx-auto h-10 w-10 mb-2 opacity-30" />
                      <p>No reviews found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{getInitials(review.username)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.username}</p>
                            <p className="text-xs text-muted-foreground">{review.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {getRatingStars(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{review.reviewTitle}</p>
                          <p className="truncate max-w-[240px] text-sm text-muted-foreground">{review.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {review.serviceUsed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(review.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {review.isVerified ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(review._id, 'approved')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(review._id, 'rejected')}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVerification(review._id, review.isVerified)}>
                              <Star className="mr-2 h-4 w-4" />
                              {review.isVerified ? 'Unverify' : 'Verify'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedReview(review);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reviews
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Dialogs */}
      <ReviewDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={(review) => {
          // Handle creating new review (you might want to implement this)
          setIsCreateDialogOpen(false);
          toast({
            title: "Review Created",
            description: "New customer review has been added successfully.",
          });
        }}
      />

      {selectedReview && (
        <ReviewDeleteDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          customerName={selectedReview.username}
          onDelete={() => handleDeleteReview(selectedReview._id)}
        />
      )}
    </div>
  );
};

export default Reviews;
