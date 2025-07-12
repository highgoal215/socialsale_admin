
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface OrderSupplierResponseProps {
  supplierResponse?: {
    success: boolean;
    message?: string;
  };
}

export const OrderSupplierResponse = ({ supplierResponse }: OrderSupplierResponseProps) => {
  if (!supplierResponse) return null;
  
  return (
    <div className={`mb-6 p-4 rounded-md ${supplierResponse.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
      <div className="flex items-center gap-2">
        {supplierResponse.success ? (
          <CheckCircle size={18} />
        ) : (
          <AlertTriangle size={18} />
        )}
        <p>{supplierResponse.message}</p>
      </div>
    </div>
  );
};
