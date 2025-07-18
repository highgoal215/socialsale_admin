import { useState, useEffect } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
} from '@/components/ui/tabs';
import { BlogCategory, BlogPost } from '@/types/blog';
import { BlogService } from '@/services/blog-service';
import FileUpload from '../ui/file-upload';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  imageUrl: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  published: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof formSchema>;

interface BlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: BlogCategory[];
  post?: BlogPost;
  onSave: (post: BlogPost) => void;
}

export function BlogDialog({ open, onOpenChange, categories, post, onSave }: BlogDialogProps) {
  const [previewImage, setPreviewImage] = useState<string>('/placeholder.svg');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      imageUrl: '/placeholder.svg',
      categoryId: '',
      published: false,
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        imageUrl: post.imageUrl,
        categoryId: post.categoryId,
        published: post.published,
      });
      setPreviewImage(post.imageUrl);
      setBannerImage(null); // Reset banner image when editing
    } else {
      form.reset({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        imageUrl: '/placeholder.svg',
        categoryId: '',
        published: false,
      });
      setPreviewImage('/placeholder.svg');
      setBannerImage(null);
    }
  }, [post, form, open]);

  const onSubmit = async (values: BlogFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create or update the blog post
      if (post) {
        // Update existing post
        const updatedPost = await BlogService.updatePost({
          id: post._id,
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content,
          categoryId: values.categoryId,
          published: values.published,
          bannerImage: bannerImage || undefined,
        });
        onSave(updatedPost);
      } else {
        // Create new post
        const newPost = await BlogService.createPost({
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content,
          categoryId: values.categoryId,
          published: values.published,
          bannerImage: bannerImage || undefined,
        });
        onSave(newPost);
      }

      toast({
        title: "Success",
        description: post ? "Blog post updated successfully!" : "Blog post created successfully!",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save blog post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);

    // Auto-generate slug if not manually edited
    if (!form.getValues('slug') || form.getValues('slug') === slugify(form.getValues('title').slice(0, -1))) {
      const slug = slugify(title);
      form.setValue('slug', slug);
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
console.log('BlogDialog rendered with bannerImage:', bannerImage);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          <DialogDescription>
            {post ? 'Update your blog post details' : 'Fill in the details for your new blog post'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="content">
              <TabsContent value="content" className="space-y-4 pt-4">
                <FileUpload
                  id="bannerImage"
                  label=""
                  accept="image/*"
                  currentFile={bannerImage}
                  onFileChange={setBannerImage}
                />
                <div className='space-x-4 grid md:grid-cols-[70%,30%] grid-cols-1'>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter post title"
                            {...field}
                            onChange={handleTitleChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground md:text-sm outline-none"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category, index) => (
                              <option key={index} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="post-url-slug"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter excerpt"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your post content here..."
                          {...field}
                          rows={12}
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Make this post visible to readers
                        </p>
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
              </TabsContent>

              {/* <TabsContent value="settings" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input placeholder="post-url-slug" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem 
                                    key={category.id} 
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/image.jpg" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  setPreviewImage(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Published</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Make this post visible to readers
                              </p>
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
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Image Preview</h4>
                        <div className="relative aspect-video overflow-hidden rounded-md border">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="h-full w-full object-cover"
                            onError={() => setPreviewImage('/placeholder.svg')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent> */}
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
