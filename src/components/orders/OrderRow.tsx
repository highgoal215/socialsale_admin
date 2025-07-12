import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderRowProps } from './types';
import ApiService from '@/services/api-services';
import { useEffect, useState } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

export const OrderRow =  ({ 
  order, 
  onRowClick, 
  serviceIcons, 
  statusVariants 
}: OrderRowProps) => {
 
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    if (order.serviceId) {
      ApiService.get<any>(`/services/${order.serviceId}`)
        .then((response) => {
          if (response && response.data) {
            setService(response.data);
            console.log('Service data:', response.data);
          }
        })
        .catch((error) => {
          console.warn('Could not fetch service data:', error);
          // Don't crash the component if service data fails to load
          setService(null);
        });
    }
  }, [order.serviceId]);

  // Category icons mapping
  const categoryIcons = {
    Instagram: <Instagram size={16} className="text-pink-500" />,
    YouTube: <Youtube size={16} className="text-red-500" />,
    TikTok: <FaTiktok size={16} className="text-purple-500" />
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(order._id)}
    >
      <TableCell className="font-medium">{order.orderNumber}</TableCell>
      <TableCell>@{order.socialUsername}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {service && categoryIcons[service.category as keyof typeof categoryIcons] ? (
            <>
              {categoryIcons[service.category as keyof typeof categoryIcons]}
              <span>{service.category}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Unknown</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {serviceIcons[order.serviceType]}
          <span className="capitalize">{order.serviceType}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">{order.quantity}</TableCell>
      <TableCell className="text-right hidden sm:table-cell">${order.price.toFixed(2)}</TableCell>
      <TableCell className="text-right">{order.quality}</TableCell>

      <TableCell className="text-center">
        <Badge 
          variant="outline"
          className={`${statusVariants[order.status]} capitalize`}
        >
          {order.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell">
        {new Date(order.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </TableCell>
    </TableRow>
  );
};
