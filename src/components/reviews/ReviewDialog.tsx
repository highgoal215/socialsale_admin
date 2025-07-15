
import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Review } from '@/types/review';

const formSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().url('Please enter a valid URL').or(z.string().length(0)).optional(),
      serviceType: z.enum(['followers', 'subscribers', 'likes', 'views', 'comments']),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  review: z.string().min(10, 'Review must be at least 10 characters'),
  featured: z.boolean().default(false),
  verified: z.boolean().default(true),
  location: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof formSchema>;

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review?: Review;
  onSave: (review: Review) => void;
}

export function ReviewDialog({ open, onOpenChange, review, onSave }: ReviewDialogProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      avatarUrl: '',
      serviceType: 'followers',
      rating: 5,
      review: '',
      featured: false,
      verified: true,
      location: '',
    },
  });

  useEffect(() => {
    if (review) {
      form.reset({
        customerName: review.customerName,
        avatarUrl: review.avatarUrl || '',
        serviceType: review.serviceType,
        rating: review.rating,
        review: review.review,
        featured: review.featured,
        verified: review.verified,
        location: review.location || '',
      });
    } else {
      form.reset({
        customerName: '',
        avatarUrl: '',
        serviceType: 'followers',
        rating: 5,
        review: '',
        featured: false,
        verified: true,
        location: '',
      });
    }
  }, [review, form, open]);

  const onSubmit = (values: ReviewFormValues) => {
    onSave({
      id: review?.id ?? '',
      customerName: values.customerName,
      avatarUrl: values.avatarUrl,
      serviceType: values.serviceType,
      rating: values.rating,
      review: values.review,
      date: review?.date ?? new Date().toISOString(),
      featured: values.featured,
      verified: values.verified,
      location: values.location,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{review ? 'Edit Review' : 'Add New Review'}</DialogTitle>
          <DialogDescription>
            {review ? 'Update the customer review details' : 'Add a new customer review'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, USA" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Customer's location for credibility
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Profile picture URL for the reviewer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="followers">Followers</SelectItem>
                        <SelectItem value="subscribers">Subscribers</SelectItem>
                        <SelectItem value="likes">Likes</SelectItem>
                        <SelectItem value="views">Views</SelectItem>
                        <SelectItem value="comments">Comments</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The service this review is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        min={1}
                        max={5}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-20"
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => field.onChange(star)}
                            className="focus:outline-none"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="24" 
                              height="24" 
                              viewBox="0 0 24 24" 
                              fill={star <= field.value ? "currentColor" : "none"}
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className={star <= field.value ? "text-yellow-400" : "text-muted-foreground"}
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write the customer review here..." 
                      {...field} 
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    The customer's feedback about our service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Highlight this review on the website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="verified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Verified Purchase</FormLabel>
                      <FormDescription>
                        Mark this as a verified customer review
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {review ? 'Update Review' : 'Add Review'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
