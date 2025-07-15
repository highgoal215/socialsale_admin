
import { Heart, Eye, MessageCircle } from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { ServiceType } from '@/services/order-service';

interface ServiceIconProps {
  serviceType: ServiceType;
  size?: number;
}

export const ServiceIcon = ({ serviceType, size = 20 }: ServiceIconProps) => {
  const serviceDetails: Record<ServiceType, { icon: JSX.Element; color: string; bg: string }> = {
    followers: { icon: <FaInstagram size={size} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    subscribers: { icon: <FaYoutube size={size} />, color: 'text-red-500', bg: 'bg-red-50' },
    likes: { icon: <Heart size={size} />, color: 'text-red-500', bg: 'bg-red-50' },
    views: { icon: <Eye size={size} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    comments: { icon: <MessageCircle size={size} />, color: 'text-green-500', bg: 'bg-green-50' }
  };

  const detail = serviceDetails[serviceType];

  if (!detail) {
    return null; // Return null or a default UI if needed
  }

  return (
    <div className={`p-2.5 rounded-md ${detail.bg} ${detail.color}`}>
      {detail.icon}
    </div>
  );
};
