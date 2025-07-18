import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Save, 
  Eye, 
  EyeOff, 
  Globe, 
  FileText, 
  Hash, 
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiGet, apiPost, apiPut } from '@/api/api-client';

const seoFormSchema = z.object({
  title: z.string().min(1, "Meta title is required").max(60, "Meta title cannot exceed 60 characters"),
  description: z.string().min(1, "Meta description is required").max(160, "Meta description cannot exceed 160 characters"),
  keywords: z.string().max(500, "Keywords cannot exceed 500 characters").optional(),
  ogTitle: z.string().max(60, "OG title cannot exceed 60 characters").optional(),
  ogDescription: z.string().max(160, "OG description cannot exceed 160 characters").optional(),
  ogImage: z.string().url("Please enter a valid URL").optional(),
  canonicalUrl: z.string().url("Please enter a valid URL").optional(),
  structuredData: z.string().optional(),
  isActive: z.boolean().default(true)
});

type SEOFormValues = z.infer<typeof seoFormSchema>;

interface SEOSetting {
  _id: string;
  pageId: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: string;
  isActive: boolean;
  lastUpdated: string;
}

const pageCategories = {
  'Main Pages': ['home', 'about', 'contact', 'blog', 'reviews', 'faq', 'privacy', 'terms'],
  'Instagram Services': ['instagram-followers', 'instagram-likes', 'instagram-views', 'instagram-comments'],
  'TikTok Services': ['tiktok-followers', 'tiktok-likes', 'tiktok-views', 'tiktok-comments'],
  'YouTube Services': ['youtube-subscribers', 'youtube-likes', 'youtube-views', 'youtube-comments']
};

const pageDisplayNames = {
  'home': 'Home Page',
  'about': 'About Page',
  'contact': 'Contact Page',
  'blog': 'Blog Page',
  'reviews': 'Reviews Page',
  'faq': 'FAQ Page',
  'privacy': 'Privacy Policy',
  'terms': 'Terms of Service',
  'instagram-followers': 'Instagram Followers',
  'instagram-likes': 'Instagram Likes',
  'instagram-views': 'Instagram Views',
  'instagram-comments': 'Instagram Comments',
  'tiktok-followers': 'TikTok Followers',
  'tiktok-likes': 'TikTok Likes',
  'tiktok-views': 'TikTok Views',
  'tiktok-comments': 'TikTok Comments',
  'youtube-subscribers': 'YouTube Subscribers',
  'youtube-likes': 'YouTube Likes',
  'youtube-views': 'YouTube Views',
  'youtube-comments': 'YouTube Comments'
};

const SEOSettings = () => {
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Main Pages');

  const form = useForm<SEOFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      canonicalUrl: '',
      structuredData: '',
      isActive: true
    }
  });

  // Fetch SEO settings
  useEffect(() => {
    const fetchSEOSettings = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<{ success: boolean; count: number; data: SEOSetting[] }>('/seo-settings');
        setSeoSettings(data.data);
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
        toast.error('Failed to load SEO settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSEOSettings();
  }, []);

  // Update form when selected page changes
  useEffect(() => {
    const selectedSetting = seoSettings.find(setting => setting.pageId === selectedPage);
    if (selectedSetting) {
      form.reset({
        title: selectedSetting.title,
        description: selectedSetting.description,
        keywords: selectedSetting.keywords || '',
        ogTitle: selectedSetting.ogTitle || '',
        ogDescription: selectedSetting.ogDescription || '',
        ogImage: selectedSetting.ogImage || '',
        canonicalUrl: selectedSetting.canonicalUrl || '',
        structuredData: selectedSetting.structuredData || '',
        isActive: selectedSetting.isActive
      });
    } else {
      form.reset({
        title: '',
        description: '',
        keywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonicalUrl: '',
        structuredData: '',
        isActive: true
      });
    }
  }, [seoSettings, selectedPage, form]);

  const onSubmit = async (data: SEOFormValues) => {
    setIsSaving(true);
    try {
      const selectedSetting = seoSettings.find(setting => setting.pageId === selectedPage);
      const body = selectedSetting ? data : { ...data, pageId: selectedPage };

      let result;
      if (selectedSetting) {
        result = await apiPut<{ success: boolean; data: SEOSetting }>(`/seo-settings/${selectedPage}`, body);
      } else {
        result = await apiPost<{ success: boolean; data: SEOSetting }>('/seo-settings', body);
      }
      
      if (selectedSetting) {
        setSeoSettings(prev => prev.map(setting => 
          setting.pageId === selectedPage ? result.data : setting
        ));
      } else {
        setSeoSettings(prev => [...prev, result.data]);
      }
      
      toast.success('SEO settings saved successfully');
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast.error('Failed to save SEO settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActiveStatus = async (pageId: string) => {
    try {
      const result = await apiPut<{ success: boolean; data: SEOSetting }>(`/seo-settings/${pageId}/toggle`);
      setSeoSettings(prev => prev.map(setting => 
        setting.pageId === pageId ? result.data : setting
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredPages = Object.entries(pageCategories)
    .filter(([category]) => 
      activeCategory === 'All' || category === activeCategory
    )
    .flatMap(([_, pages]) => pages)
    .filter(pageId => 
      pageDisplayNames[pageId as keyof typeof pageDisplayNames]
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const getCharacterCount = (field: keyof SEOFormValues) => {
    const value = form.watch(field);
    if (typeof value === 'string') {
      return value.length;
    }
    return 0;
  };

  const getMaxLength = (field: keyof SEOFormValues) => {
    const limits = {
      title: 60,
      description: 160,
      keywords: 500,
      ogTitle: 60,
      ogDescription: 160
    };
    return limits[field as keyof typeof limits] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading SEO settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SEO Settings</h1>
        <p className="text-muted-foreground">
          Manage meta titles, descriptions, and SEO data for all pages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pages</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="Main Pages">Main</TabsTrigger>
                  <TabsTrigger value="Instagram Services">Instagram</TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="TikTok Services">TikTok</TabsTrigger>
                  <TabsTrigger value="YouTube Services">YouTube</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {filteredPages.map((pageId) => {
                  const setting = seoSettings.find(s => s.pageId === pageId);
                  const displayName = pageDisplayNames[pageId as keyof typeof pageDisplayNames];
                  
                  return (
                    <div
                      key={pageId}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPage === pageId
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedPage(pageId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{displayName}</span>
                          {setting && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {setting && (
                          <Badge variant={setting.isActive ? "default" : "secondary"}>
                            {setting.isActive ? "Active" : "Inactive"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {pageDisplayNames[selectedPage as keyof typeof pageDisplayNames]}
                  </CardTitle>
                  <CardDescription>
                    Configure SEO settings for this page
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {seoSettings.find(s => s.pageId === selectedPage) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiveStatus(selectedPage)}
                    >
                      {seoSettings.find(s => s.pageId === selectedPage)?.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Meta Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Meta Title</span>
                          <Badge variant="outline">
                            {getCharacterCount('title')}/{getMaxLength('title')}
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter meta title (max 60 characters)"
                            {...field}
                            className={getCharacterCount('title') > getMaxLength('title') ? 'border-red-500' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Meta Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Meta Description</span>
                          <Badge variant="outline">
                            {getCharacterCount('description')}/{getMaxLength('description')}
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter meta description (max 160 characters)"
                            rows={3}
                            {...field}
                            className={getCharacterCount('description') > getMaxLength('description') ? 'border-red-500' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Keywords */}
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Hash className="h-4 w-4" />
                          <span>Keywords</span>
                          <Badge variant="outline">
                            {getCharacterCount('keywords')}/{getMaxLength('keywords')}
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter keywords separated by commas"
                            {...field}
                            className={getCharacterCount('keywords') > getMaxLength('keywords') ? 'border-red-500' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Open Graph Title */}
                  <FormField
                    control={form.control}
                    name="ogTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Open Graph Title</span>
                          <Badge variant="outline">
                            {getCharacterCount('ogTitle')}/{getMaxLength('ogTitle')}
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Open Graph title (optional)"
                            {...field}
                            className={getCharacterCount('ogTitle') > getMaxLength('ogTitle') ? 'border-red-500' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Open Graph Description */}
                  <FormField
                    control={form.control}
                    name="ogDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Open Graph Description</span>
                          <Badge variant="outline">
                            {getCharacterCount('ogDescription')}/{getMaxLength('ogDescription')}
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter Open Graph description (optional)"
                            rows={3}
                            {...field}
                            className={getCharacterCount('ogDescription') > getMaxLength('ogDescription') ? 'border-red-500' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Open Graph Image */}
                  <FormField
                    control={form.control}
                    name="ogImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Open Graph Image URL</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/og-image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Canonical URL */}
                  <FormField
                    control={form.control}
                    name="canonicalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4" />
                          <span>Canonical URL</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://likes.io/page-url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Structured Data */}
                  <FormField
                    control={form.control}
                    name="structuredData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Structured Data (JSON-LD)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter JSON-LD structured data (optional)"
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Active Status */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable or disable SEO settings for this page
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save SEO Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SEOSettings; 