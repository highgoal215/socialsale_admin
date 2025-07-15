
import { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Star, 
  Calendar, 
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  MapPin
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
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "@/hooks/use-toast";
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import { ReviewDeleteDialog } from '@/components/reviews/ReviewDeleteDialog';
import { Review } from '@/types/review';

// Empty review data - will be populated from backend
const mockReviews: Review[] = [];

const Reviews = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const filteredReviews = reviews.filter(review => 
    review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.review.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateReview = (review: Review) => {
    const newReview = {
      ...review,
      id: (reviews.length + 1).toString(),
      date: new Date().toISOString(),
    };
    setReviews([newReview, ...reviews]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Review Created",
      description: "New customer review has been added successfully.",
    });
  };

  const handleEditReview = (review: Review) => {
    setReviews(reviews.map(r => r.id === review.id ? review : r));
    setIsEditDialogOpen(false);
    setSelectedReview(null);
    toast({
      title: "Review Updated",
      description: "The customer review has been updated successfully.",
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    setIsDeleteDialogOpen(false);
    setSelectedReview(null);
    toast({
      title: "Review Deleted",
      description: "The customer review has been deleted.",
      variant: "destructive",
    });
  };

  const handleToggleFeatured = (reviewId: string) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        const updated = { ...review, featured: !review.featured };
        toast({
          title: updated.featured ? "Review Featured" : "Review Unfeatured",
          description: `The review has been ${updated.featured ? 'featured' : 'removed from featured'}.`,
        });
        return updated;
      }
      return review;
    }));
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

  const serviceTypeLabels = {
    followers: 'Followers',
    likes: 'Likes',
    views: 'Views',
    comments: 'Comments'
  };

  const serviceTypeBadgeColors = {
    followers: 'bg-blue-100 text-blue-800',
    likes: 'bg-red-100 text-red-800',
    views: 'bg-purple-100 text-purple-800',
    comments: 'bg-green-100 text-green-800'
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

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  <Star className="mx-auto h-10 w-10 mb-2 opacity-30" />
                  <p>No reviews found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={review.avatarUrl} />
                        <AvatarFallback>{getInitials(review.customerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.customerName}</p>
                        {review.location && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin size={12} className="mr-1" />
                            {review.location}
                          </div>
                        )}
                      </div>
                      {review.verified && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {getRatingStars(review.rating)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="truncate max-w-[240px]">{review.review}</p>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${serviceTypeBadgeColors[review.serviceType]} capitalize whitespace-nowrap`}
                    >
                      {serviceTypeLabels[review.serviceType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={review.featured}
                      onCheckedChange={() => handleToggleFeatured(review.id)}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedReview(review);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFeatured(review.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          {review.featured ? 'Unfeature' : 'Feature'}
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
      </Card>

      <ReviewDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateReview}
      />

      {selectedReview && (
        <ReviewDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          review={selectedReview}
          onSave={handleEditReview}
        />
      )}

      {selectedReview && (
        <ReviewDeleteDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          customerName={selectedReview.customerName}
          onDelete={() => handleDeleteReview(selectedReview.id)}
        />
      )}
    </div>
  );
};

export default Reviews;
