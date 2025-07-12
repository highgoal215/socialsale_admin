// src/components/orders/SearchFilterBar.tsx

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType, OrderStatus } from '@/services/order-service';
import { ServiceIcon } from '@/components/orders/detail/ServiceIcon';

export interface SearchFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: OrderStatus | 'all';
  setStatusFilter: (status: OrderStatus | 'all') => void;
  typeFilter: ServiceType | null;
  onCreateOrder?: () => void;
}

export const SearchFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  typeFilter,
  onCreateOrder
}: SearchFilterBarProps) => {
  return (
    <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search orders or usernames..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {typeFilter && (
          <Badge variant="outline" className="py-1.5">
            <ServiceIcon serviceType={typeFilter} size={16} />
            <span className="ml-1 capitalize">{typeFilter}</span>
          </Badge>
        )}
        
        <Button variant="outline" size="sm" className="hidden sm:flex">
          Export
        </Button>
        <Button size="sm" onClick={onCreateOrder}>New Order</Button>
      </div>
    </div>
  );
};