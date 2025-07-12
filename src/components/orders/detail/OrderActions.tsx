import { Button } from '@/components/ui/button';
import { Check, X, Loader2, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

type OrderStatus = 'pending' | 'completed' | 'rejected' | 'processing';

interface OrderActionsProps {
  status: OrderStatus;
  onApprove: () => void;
  onReject: () => void;
  onSendToSupplier: () => void;
  isProcessing: boolean;
  isSendingToSupplier: boolean;
}

export const OrderActions = ({ 
  status, 
  onApprove, 
  onReject, 
  onSendToSupplier,
  isProcessing,
  isSendingToSupplier
}: OrderActionsProps) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const handleReject = () => {
    onReject();
    setIsRejectDialogOpen(false);
  };
  
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {status === 'pending' && (
        <>
          <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
                disabled={isProcessing || isSendingToSupplier}
              >
                <X size={16} className="mr-2" />
                Reject Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The customer will be notified and the order will be marked as rejected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reject Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            className="w-full sm:w-auto"
            onClick={onApprove}
            disabled={isProcessing || isSendingToSupplier}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Approve Order
              </>
            )}
          </Button>
        </>
      )}
      
      {status === 'processing' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              disabled={isProcessing || isSendingToSupplier}
            >
              <Check size={16} className="mr-2" />
              Mark as Completed
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change order status to completed?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark this processing order as completed. The customer will be notified of this change.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onApprove}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {status === 'completed' && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={isProcessing || isSendingToSupplier}
              >
                <X size={16} className="mr-2" />
                Mark as Rejected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Change order status to rejected?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark this completed order as rejected. The customer will be notified of this change.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            onClick={onSendToSupplier}
            disabled={isSendingToSupplier}
            className="w-full sm:w-auto"
          >
            {isSendingToSupplier ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send to Supplier
              </>
            )}
          </Button>
        </>
      )}
      
      {status === 'rejected' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              disabled={isProcessing || isSendingToSupplier}
            >
              <Check size={16} className="mr-2" />
              Mark as Completed
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change order status to completed?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark this rejected order as completed. The customer will be notified of this change.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onApprove}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
