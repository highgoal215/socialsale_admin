
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  title: string;
  to: string;
  isOpen?: boolean;
  badge?: number | string;
  badgeColor?: string;
}

const SidebarItem = ({ 
  icon: Icon, 
  title, 
  to, 
  isOpen = true,
  badge,
  badgeColor = 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground'
}: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
          "hover:bg-secondary hover:text-secondary-foreground",
          isActive 
            ? "bg-secondary text-secondary-foreground" 
            : "text-muted-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="mr-2 h-4 w-4" />
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap"
            >
              {title}
            </motion.span>
          )}
          
          {badge && (
            <span className={cn(
              "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
              badgeColor,
              isOpen ? "relative" : "absolute right-0 top-0 -mr-1 -mt-1"
            )}>
              {badge}
            </span>
          )}
          
          {isActive && (
            <motion.div 
              className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-primary"
              layoutId="sidebar-indicator"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
};

export { SidebarItem };
