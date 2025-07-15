import { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Search, 
  Tag,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  FileText
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
import { CategoryDialog } from '@/components/blog/CategoryDialog';
import { CategoryDeleteDialog } from '@/components/blog/CategoryDeleteDialog';
import { BlogCategory } from '@/types/blog';
import { BlogService } from '@/services/blog-service';
import { useToast } from '@/hooks/use-toast';

const Categories = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedCategories = await BlogService.getCategories();
      setCategories(fetchedCategories);
      
      // Load post counts for each category
      const counts: Record<string, number> = {};
      for (const category of fetchedCategories) {
        try {
          const count = await BlogService.getPostCount(category._id);
          counts[category._id] = count;
        } catch (error) {
          counts[category._id] = 0;
        }
      }
      setPostCounts(counts);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleCreateCategory = async (category: BlogCategory) => {
    try {
      // The CategoryDialog now handles the API call internally
      // We just need to refresh the categories list
      await loadCategories();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      // Error handling is done in the CategoryDialog component
    }
  };

  const handleEditCategory = async (category: BlogCategory) => {
    try {
      // The CategoryDialog now handles the API call internally
      // We just need to refresh the categories list
      await loadCategories();
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
      // Error handling is done in the CategoryDialog component
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      setIsDeleting(true);
      await BlogService.deleteCategory(selectedCategory._id);
      setCategories(categories.filter(cat => cat._id !== selectedCategory._id));
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category deleted successfully!",
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. It may be in use by blog posts.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (categoryId: string) => {
    try {
      const category = categories.find(cat => cat._id === categoryId);
      if (!category) return;

      // Update the category with the opposite active status
      const updatedCategory = await BlogService.updateCategory({
        id: categoryId,
        isActive: !category.isActive,
      });

      setCategories(categories.map(cat => cat._id === categoryId ? updatedCategory : cat));
      
      toast({
        title: "Success",
        description: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully!`,
      });
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      toast({
        title: "Error",
        description: "Failed to update category status. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Category
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
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
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading categories...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  <Tag className="mx-auto h-10 w-10 mb-2 opacity-30" />
                  <p>No categories found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {category.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {postCounts[category._id] || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.isActive ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(category.createdAt).toLocaleDateString()}
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
                            setSelectedCategory(category);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(category._id)}
                        >
                          {category.isActive ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedCategory(category);
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

      <CategoryDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateCategory}
      />

      {selectedCategory && (
        <CategoryDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          category={selectedCategory}
          onSave={handleEditCategory}
        />
      )}

      {selectedCategory && (
        <CategoryDeleteDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          categoryName={selectedCategory.name}
          onDelete={handleDeleteCategory}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default Categories; 