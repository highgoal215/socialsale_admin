import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { UIOrder } from "./types";

interface OrdersTableHeaderProps {
  sortField: keyof UIOrder;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof UIOrder) => void;
}

export const OrdersTableHeader = ({ 
  sortField, 
  sortDirection, 
  handleSort 
}: OrdersTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[120px]">
          <div className="flex items-center justify-start gap-1 cursor-pointer" onClick={() => handleSort('orderNumber')}>
            <span>OrderNumber</span>
            {sortField === 'orderNumber' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center justify-start gap-1 cursor-pointer" onClick={() => handleSort('socialUsername')}>
            <span>Username</span>
            {sortField === 'socialUsername' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center justify-start gap-1 cursor-pointer" onClick={() => handleSort('category')}>
            <span>Category</span>
            {sortField === 'category' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center justify-start gap-1 cursor-pointer" onClick={() => handleSort('serviceType')}>
            <span>Service</span>
            {sortField === 'serviceType' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead className="text-right">
          <div className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => handleSort('quantity')}>
            <span>Quantity</span>
            {sortField === 'quantity' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead className="text-right hidden sm:table-cell">
          <div className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => handleSort('price')}>
            <span>Price</span>
            {sortField === 'price' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead className="text-right hidden sm:table-cell">
          <div className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => handleSort('quality')}>
            <span>Quality</span>
            {sortField === 'quality' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
            <span>Status</span>
            {sortField === 'status' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
        <TableHead className="text-right hidden sm:table-cell">
          <div className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => handleSort('updatedAt')}>
            <span>Date</span>
            {sortField === 'updatedAt' && <ArrowUpDown size={14} className={`transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
