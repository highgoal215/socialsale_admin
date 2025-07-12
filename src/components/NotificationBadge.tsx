// src/components/NotificationBadge.tsx

import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotificationContext } from "@/context/NotificationContext";

interface NotificationBadgeProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBadge = ({ onClick, className = "" }: NotificationBadgeProps) => {
  const { unreadCount } = useNotificationContext();

  return (
    <button 
      className={`p-2 rounded-full hover:bg-secondary transition-colors relative ${className}`}
      onClick={onClick}
      aria-label="Notifications"
    >
      <Bell size={20} />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"
          />
        )}
      </AnimatePresence>
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.span>
      )}
    </button>
  );
}; 