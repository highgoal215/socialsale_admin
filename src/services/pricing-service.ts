
// This is a mock service for price tier management
// In a real application, this would connect to your backend API

export type ServiceType = 'followers' | 'likes' | 'views' | 'comments';

export interface PriceTier {
  id: string;
  service: ServiceType;
  quantity: number;
  price: number;
  originalPrice: number;
  popular?: boolean;
}

let mockPriceTiers: PriceTier[] = [
  { id: '1', service: 'followers', quantity: 100, price: 2.3, originalPrice: 2.9 },
  { id: '2', service: 'followers', quantity: 500, price: 9.99, originalPrice: 12.99 },
  { id: '3', service: 'followers', quantity: 1000, price: 17.99, originalPrice: 24.99, popular: true },
  { id: '4', service: 'likes', quantity: 50, price: 1.5, originalPrice: 1.99 },
  { id: '5', service: 'likes', quantity: 100, price: 2.3, originalPrice: 2.9 },
  { id: '6', service: 'likes', quantity: 500, price: 9.99, originalPrice: 12.99, popular: true },
  { id: '7', service: 'views', quantity: 1000, price: 3.99, originalPrice: 5.99 },
  { id: '8', service: 'views', quantity: 5000, price: 15.99, originalPrice: 19.99, popular: true },
  { id: '9', service: 'comments', quantity: 10, price: 4.99, originalPrice: 6.99 },
  { id: '10', service: 'comments', quantity: 50, price: 19.99, originalPrice: 24.99, popular: true },
];

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
