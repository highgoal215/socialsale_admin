
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minCartValue: number;
  maxUses: number | null;
  usedCount: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  services: string[] | null; // Services this coupon can be applied to
}
