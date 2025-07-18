
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Calendar, 
  Tag,
  Edit2,
  Trash2,
  Eye,
  EyeOff
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
import { BlogDialog } from '@/components/blog/BlogDialog';
import { BlogDeleteDialog } from '@/components/blog/BlogDeleteDialog';
import { ImageModal } from '@/components/blog/ImageModal';
import { BlogPost, BlogCategory } from '@/types/blog';
import { BlogService } from '@/services/blog-service';
import { useToast } from '@/hooks/use-toast';

const Blog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Load blog posts and categories on component mount
  useEffect(() => {
    loadBlogPosts();
    loadCategories();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true);
      const fetchedPosts = await BlogService.getAllPosts();
      console.log('Fetched posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
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
      setIsLoadingCategories(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePost = async (post: BlogPost) => {
    try {
      // The BlogDialog now handles the API call internally
      // We just need to refresh the posts list
      await loadBlogPosts();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create post:', error);
      // Error handling is done in the BlogDialog component
    }
  };

  const handleEditPost = async (post: BlogPost) => {
    try {
      // The BlogDialog now handles the API call internally
      // We just need to refresh the posts list
      await loadBlogPosts();
      setIsEditDialogOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to update post:', error);
      // Error handling is done in the BlogDialog component
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await BlogService.deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      setIsDeleteDialogOpen(false);
      setSelectedPost(null);
      toast({
        title: "Success",
        description: "Blog post deleted successfully!",
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(()=>{
    // console.log('FilteredPOst>>>>:', filteredPosts[0].imageUrl);
    // console.log('Blog component rendered with categories:', categories);
  },[filteredPosts]);
  const handleTogglePublish = async (postId: string) => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      // Update the post with the opposite published status
      const updatedPost = await BlogService.updatePost({
        id: postId,
        published: !post.published,
      });

      setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      
      toast({
        title: "Success",
        description: `Post ${updatedPost.published ? 'published' : 'unpublished'} successfully!`,
      });
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update publish status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.name === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
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
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading posts...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10 mb-2 opacity-30" />
                  <p>No blog posts found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {post.imageUrl ? (
                      <ImageModal imageUrl={post.imageUrl} altText={post.title}>
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </ImageModal>
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryName(post.categoryId)}</Badge>
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {post.published ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Draft</Badge>
                    )}
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
                        <DropdownMenuItem onClick={() => navigate(`/blog/${post._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedPost(post);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(post._id)}
                        >
                          {post.published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedPost(post);
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

      <BlogDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        categories={categories}
        onSave={handleCreatePost}
      />

      {selectedPost && (
        <BlogDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          categories={categories}
          post={selectedPost}
          onSave={handleEditPost}
        />
      )}

      {selectedPost && (
        <BlogDeleteDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          postTitle={selectedPost.title}
          onDelete={() => handleDeletePost(selectedPost._id)}
        />
      )}
    </div>
  );
};

export default Blog;
