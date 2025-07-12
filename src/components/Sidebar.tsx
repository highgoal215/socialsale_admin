
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, Heart, Eye, MessageCircle, Wallet, Coins, User, Edit, FileText, Tag, Star, FolderOpen, ChevronDown, Briefcase, Bell, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { FaInstagram } from "react-icons/fa";


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(false);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile, setIsOpen]);

  // Auto-open dropdown when on orders page
  useEffect(() => {
    if (location.pathname === '/orders') {
      setOrdersDropdownOpen(true);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside
        initial={{ width: isOpen ? 256 : 80, x: 0 }}
        animate={{
          width: isOpen ? 256 : 80,
          x: isMobile && !isOpen ? -80 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed top-0 left-0 h-full z-20"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center overflow-hidden"
          >
            <FaInstagram className="text-primary" size={28} />
            <span className="ml-2 font-semibold text-xl">LikesIO Admin</span>
          </motion.div>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <FaInstagram className="text-primary" size={28} />
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" isOpen={isOpen} />
          
          {/* Orders with dropdown */}
          <OrdersNavItem 
            isOpen={isOpen} 
            dropdownOpen={ordersDropdownOpen}
            setDropdownOpen={setOrdersDropdownOpen}
          />

          <NavItem to="/pricing" icon={<Briefcase size={20} />} label="Services" isOpen={isOpen} />
          <NavItem to="/users" icon={<User size={20} />} label="User List" isOpen={isOpen} />
          <NavItem to="/content" icon={<Edit size={20} />} label="Content Editor" isOpen={isOpen} />
          <NavItem to="/supplier" icon={<Settings size={20} />} label="Supplier Setting" isOpen={isOpen} />
          
          {/* New menu items */}
          <NavItem to="/blog" icon={<FileText size={20} />} label="Blog" isOpen={isOpen} />
          <NavItem to="/categories" icon={<FolderOpen size={20} />} label="Categories" isOpen={isOpen} />
          <NavItem to="/coupons" icon={<Tag size={20} />} label="Coupons" isOpen={isOpen} />
          <NavItem to="/reviews" icon={<Star size={20} />} label="Reviews" isOpen={isOpen} />
          <NavItem to="/notifications" icon={<Bell size={20} />} label="Notifications" isOpen={isOpen} />
          <NavItem to="/notification-analytics" icon={<BarChart3 size={20} />} label="Notification Analytics" isOpen={isOpen} />

          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" isOpen={isOpen} />

          {!isOpen && (
            <div className="mt-6 flex justify-center">
              <div className="p-2 rounded-md bg-primary/10">
                <Wallet size={20} className="text-primary" />
              </div>
            </div>
          )}

          {isOpen && (
            <div className="mt-6 p-4 bg-primary/5 rounded-md border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-primary" />
                <p className="text-sm font-medium">Current Balance</p>
              </div>
              <p className="text-2xl font-bold text-primary">$25,000</p>
              <p className="text-xs text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          )}
        </nav>
      </motion.aside>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
}

interface ServiceNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'red' | 'green' | 'purple';
}

const NavItem = ({ to, icon, label, isOpen }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center p-3 rounded-md mb-1 transition-all
        ${isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
        }
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      {isOpen && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          transition={{ duration: 0.2 }}
          className="ml-3 whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </NavLink>
  );
};

const ServiceNavItem = ({ to, icon, label, color }: ServiceNavItemProps) => {
  // Define color variants for dropdown items with site's background color
  const colorVariants = {
    blue: 'bg-sidebar-accent text-blue-600 hover:bg-sidebar-accent/80 border-l-3 border-blue-400',
    red: 'bg-sidebar-accent text-red-600 hover:bg-sidebar-accent/80 border-l-3 border-red-400',
    green: 'bg-sidebar-accent text-green-600 hover:bg-sidebar-accent/80 border-l-3 border-green-400',
    purple: 'bg-sidebar-accent text-purple-600 hover:bg-sidebar-accent/80 border-l-3 border-purple-400',
  };

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center p-3 rounded-md text-sm transition-all duration-200 font-medium
        ${isActive
          ? `${colorVariants[color]} font-semibold`
          : `bg-sidebar-accent/30 hover:bg-sidebar-accent/50 text-sidebar-foreground/90 hover:text-sidebar-foreground`
        }
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="ml-3">{label}</span>
    </NavLink>
  );
};

interface OrdersNavItemProps {
  isOpen: boolean;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
}

const OrdersNavItem = ({ isOpen, dropdownOpen, setDropdownOpen }: OrdersNavItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === '/orders';

  const handleOrdersClick = () => {
    // Navigate to main orders page
    navigate('/orders');
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="mb-1">
      <div className="flex items-center">
        <button
          onClick={handleOrdersClick}
          className={`
            flex-1 flex items-center p-3 rounded-md transition-all
            ${isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
            }
          `}
        >
          <Package size={20} />
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 0.2 }}
              className="ml-3 whitespace-nowrap overflow-hidden"
            >
              Orders
            </motion.span>
          )}
        </button>
        {isOpen && (
          <button
            onClick={handleDropdownToggle}
            className="p-1 hover:bg-sidebar-accent/50 rounded-md transition-all"
          >
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>
        )}
      </div>

      {/* Dropdown content */}
      <AnimatePresence>
        {dropdownOpen && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-6 space-y-1.5 p-2 bg-sidebar-accent/20 rounded-md">
              <ServiceNavItem
                to="/orders?type=followers"
                icon={<FaInstagram size={16} />}
                label="Followers"
                color="blue"
              />
              <ServiceNavItem
                to="/orders?type=likes"
                icon={<Heart size={16} />}
                label="Likes"
                color="red"
              />
              <ServiceNavItem
                to="/orders?type=views"
                icon={<Eye size={16} />}
                label="Views"
                color="purple"
              />
              <ServiceNavItem
                to="/orders?type=comments"
                icon={<MessageCircle size={16} />}
                label="Comments"
                color="green"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


