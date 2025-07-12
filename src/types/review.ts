
export interface Review {
  id: string;
  customerName: string;
  avatarUrl?: string;
  serviceType: 'followers' | 'likes' | 'views' | 'comments';
  rating: number;
  review: string;
  date: string;
  featured: boolean;
  verified: boolean;
  location?: string;
}
