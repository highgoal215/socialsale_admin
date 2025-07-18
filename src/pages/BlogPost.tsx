
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit2, Calendar, User, Tag } from 'lucide-react';
import { BlogPost, BlogCategory } from '@/types/blog';
import { BlogService } from '@/services/blog-service';
import { useToast } from '@/hooks/use-toast';
import { BlogDialog } from '@/components/blog/BlogDialog';

const BlogPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadCategories();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      if (!postId) return;
      
      const fetchedPost = await BlogService.getPostById(postId);
      setPost(fetchedPost);
    } catch (error) {
      console.error('Failed to load blog post:', error);
      toast({
        title: "Error",
        description: "Failed to load blog post. Please try again.",
        variant: "destructive",
      });
      setPost(null);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await BlogService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.name === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const handleEditPost = async (updatedPost: BlogPost) => {
    try {
      // Update the local post state
      setPost(updatedPost);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Blog post updated successfully!",
      });
    } catch (error) {
      console.error('Failed to update post:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md"></div>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md"></div>
            <div className="h-6 w-1/2 bg-muted animate-pulse rounded-md"></div>
            <div className="h-64 w-full bg-muted animate-pulse rounded-md"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Post Not Found</h1>
        </div>
        <Card className="p-6 text-center py-12">
          <p className="text-muted-foreground mb-4">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/blog')}>
            Back to Blog
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Blog Post</h1>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Post
        </Button>
      </div>
      
      <Card className="p-6 relative">
        <Tabs defaultValue="preview">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-6">
            <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>{getCategoryName(post.categoryId)}</span>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
              
              <div className="prose max-w-none dark:prose-invert">
                {post.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{paragraph.slice(2)}</h1>;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{paragraph.slice(3)}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{paragraph.slice(4)}</h3>;
                  } else if (paragraph.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="mb-4">{paragraph}</p>;
                  }
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="editor">
            <div className="font-mono text-sm p-4 bg-muted rounded-md whitespace-pre-wrap overflow-x-auto">
              {post.content}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {post && (
        <BlogDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          categories={categories}
          post={post}
          onSave={handleEditPost}
        />
      )}
    </div>
  );
};

export default BlogPostPage;
