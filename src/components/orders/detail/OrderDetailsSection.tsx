
import { Separator } from '@/components/ui/separator';
import { ServiceIcon } from './ServiceIcon';

type ServiceType = 'followers' | 'subscribers' | 'likes' | 'views' | 'comments';

interface OrderDetailsSectionProps {
  serviceType: ServiceType;
  quantity: number;
  instagramHandle: string;
  postUrl?: string;
  notes?: string;
  customerEmail: string;
  paymentMethod: string;
}

export const OrderDetailsSection = ({
  serviceType,
  quantity,
  instagramHandle,
  postUrl,
  notes,
  customerEmail,
  paymentMethod,
}: OrderDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Order Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Service Type</p>
            <p className="flex items-center gap-1.5">
              <ServiceIcon serviceType={serviceType} />
              <span className="capitalize">{serviceType}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p>{quantity.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Instagram Handle</p>
            <p>@{instagramHandle}</p>
          </div>
          {postUrl && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Post URL</p>
              <a 
                href={postUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate block"
              >
                {postUrl}
              </a>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{customerEmail}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p>{paymentMethod}</p>
          </div>
        </div>
      </div>
      
      {notes && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
            <p className="text-sm p-3 bg-secondary rounded-md">{notes}</p>
          </div>
        </>
      )}
    </div>
  );
};
