
import { useState, useEffect } from 'react';
import { ContentService, PageContent } from '@/services/content-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EggFried, Loader2, Plus, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  features: z.array(z.string()).optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

const ContentEditor = () => {
  const [contents, setContents] = useState<PageContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('followers');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFeature, setCurrentFeature] = useState('');

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      features: [],
    }
  });

  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const data = await ContentService.getAllContent();
        setContents(data);
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Update form when selected page changes
  useEffect(() => {
    if (contents.length > 0) {
      const selectedContent = contents.find(content => content.pageId === selectedPage);
      if (selectedContent) {
        form.reset({
          title: selectedContent.title,
          subtitle: selectedContent.subtitle || '',
          description: selectedContent.description,
          features: selectedContent.features || [],
        });
      }
    }
  }, [contents, selectedPage, form]);

  const handleAddFeature = () => {
    if (!currentFeature.trim()) return;

    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', [...currentFeatures, currentFeature.trim()]);
    setCurrentFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', currentFeatures.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ContentFormValues) => {
    setIsSaving(true);

    try {
      const currentContent = contents.find(content => content.pageId === selectedPage);

      if (currentContent) {
        // Update existing content
        const updatedContent = await ContentService.updateContent({
          ...currentContent,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          features: data.features,
        });

        setContents(prev => prev.map(c => c.id === updatedContent.id ? updatedContent : c));
        toast.success('Content updated successfully');
      } else {
        // Create new content (should not happen with our mock data, but included for completeness)
        const newContent = await ContentService.addContent({
          pageId: selectedPage,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          features: data.features,
        });

        setContents(prev => [...prev, newContent]);
        toast.success('New content created successfully');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">
          Edit your website's content for different services
        </p>
      </div>

      <Tabs defaultValue="followers" value={selectedPage} onValueChange={setSelectedPage}>
        <TabsList className="mb-6">
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
          <TabsTrigger value="views">Views</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">
                  {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)} Content
                </CardTitle>
                <CardDescription>
                  Manage content for your {selectedPage} service
                </CardDescription>
              </div>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Content
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => {
                  setIsEditing(false);
                  const selectedContent = contents.find(content => content.pageId === selectedPage);
                  if (selectedContent) {
                    form.reset({
                      title: selectedContent.title,
                      subtitle: selectedContent.subtitle || '',
                      description: selectedContent.description,
                      features: selectedContent.features || [],
                    });
                  }
                }}>
                  Cancel
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label>Features</Label>

                    {isEditing && (
                      <div className="flex mt-2 mb-4 gap-2">
                        <Input
                          value={currentFeature}
                          onChange={(e) => setCurrentFeature(e.target.value)}
                          placeholder="Add a feature..."
                          className="flex-1"
                        />
                        <Button type="button" onClick={handleAddFeature}>
                          <Plus size={16} className="mr-2" />
                          Add
                        </Button>
                      </div>
                    )}

                    <div className="mt-2 space-y-2">
                      {form.watch('features')?.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">No features added yet</p>
                      ) : (
                        form.watch('features')?.map((feature, index) => (
                          <div key={index} className="flex items-center bg-secondary p-2 rounded">
                            <span className="flex-1">{feature}</span>
                            {isEditing && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFeature(index)}
                              >
                                <X size={14} />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>

            {!isEditing && contents.find(c => c.pageId === selectedPage)?.lastUpdated && (
              <CardFooter className="border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(contents.find(c => c.pageId === selectedPage)!.lastUpdated).toLocaleString()}
                </p>
              </CardFooter>
            )}
          </Card>
        )}
      </Tabs>
    </div>
  );
};

export default ContentEditor;
