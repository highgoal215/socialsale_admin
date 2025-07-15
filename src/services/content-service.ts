
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

// Empty content data - will be populated from backend
let mockContent: PageContent[] = [];

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
