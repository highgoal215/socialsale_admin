
// This is a mock service for content management
// In a real application, this would connect to your backend API

export interface PageContent {
  id: string;
  pageId: string;
  title: string;
  subtitle?: string;
  description: string;
  features?: string[];
  lastUpdated: string;
}

// Mock content data
let mockContent: PageContent[] = [
  {
    id: '1',
    pageId: 'followers',
    title: 'Instagram Followers',
    subtitle: 'Grow your Instagram presence',
    description: 'Boost your Instagram profile with real followers. Our service provides high-quality followers to enhance your social proof and credibility.',
    features: [
      'Real and active followers',
      'Fast delivery',
      'No password required',
      '24/7 customer support',
      'Safe and secure'
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    pageId: 'likes',
    title: 'Instagram Likes',
    subtitle: 'Increase engagement on your posts',
    description: 'Get more likes on your Instagram posts to boost engagement and improve visibility in the algorithm.',
    features: [
      'High-quality likes',
      'Instant delivery',
      'No login required',
      'Affordable packages',
      'Completely safe'
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    pageId: 'views',
    title: 'Instagram Views',
    subtitle: 'Boost your video performance',
    description: 'Increase views on your Instagram videos and Reels to improve reach and engagement metrics.',
    features: [
      'Real views',
      'Quick delivery',
      'No password needed',
      'Affordable rates',
      'Secure process'
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    pageId: 'comments',
    title: 'Instagram Comments',
    subtitle: 'Enhance engagement with quality comments',
    description: 'Add thoughtful comments to your posts to increase engagement and make your content more appealing to new visitors.',
    features: [
      'Custom comments available',
      'Natural language',
      'Quick turnaround',
      'No login required',
      'Safe and reliable'
    ],
    lastUpdated: new Date().toISOString()
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ContentService = {
  // Get all content
  getAllContent: async (): Promise<PageContent[]> => {
    await delay(500);
    return [...mockContent];
  },
  
  // Get content by page ID
  getContentByPageId: async (pageId: string): Promise<PageContent | null> => {
    await delay(300);
    const content = mockContent.find(c => c.pageId === pageId);
    return content || null;
  },
  
  // Update content
  updateContent: async (updatedContent: PageContent): Promise<PageContent> => {
    await delay(800);
    
    // Find and update the content
    mockContent = mockContent.map(c => 
      c.id === updatedContent.id ? {
        ...updatedContent,
        lastUpdated: new Date().toISOString()
      } : c
    );
    
    return {
      ...updatedContent,
      lastUpdated: new Date().toISOString()
    };
  },
  
  // Add new content
  addContent: async (newContent: Omit<PageContent, 'id' | 'lastUpdated'>): Promise<PageContent> => {
    await delay(800);
    
    const content: PageContent = {
      id: Date.now().toString(),
      ...newContent,
      lastUpdated: new Date().toISOString()
    };
    
    mockContent.push(content);
    return content;
  }
};
