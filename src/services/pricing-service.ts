
// This is a mock service for price tier management
// In a real application, this would connect to your backend API

export type ServiceType = 'followers' | 'subscribers' | 'likes' | 'views' | 'comments';

export interface PriceTier {
  id: string;
  service: ServiceType;
  quantity: number;
  price: number;
  originalPrice: number;
  popular?: boolean;
}

let mockPriceTiers: PriceTier[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const PricingService = {
  // Get all price tiers
  getAllPriceTiers: async (): Promise<PriceTier[]> => {
    await delay(500);
    return [...mockPriceTiers];
  },
  
  // Get price tiers by service type
  getPriceTiersByService: async (service: ServiceType): Promise<PriceTier[]> => {
    await delay(500);
    return mockPriceTiers.filter(tier => tier.service === service);
  },
  
  // Add new price tier
  addPriceTier: async (tier: Omit<PriceTier, 'id'>): Promise<PriceTier> => {
    await delay(700);
    const newTier = {
      id: Date.now().toString(),
      ...tier
    };
    mockPriceTiers.push(newTier);
    return newTier;
  },
  
  // Update existing price tier
  updatePriceTier: async (tier: PriceTier): Promise<PriceTier> => {
    await delay(700);
    mockPriceTiers = mockPriceTiers.map(t => 
      t.id === tier.id ? tier : t
    );
    return tier;
  },
  
  // Delete price tier
  deletePriceTier: async (id: string): Promise<boolean> => {
    await delay(700);
    const initialLength = mockPriceTiers.length;
    mockPriceTiers = mockPriceTiers.filter(t => t.id !== id);
    return mockPriceTiers.length < initialLength;
  }
};
