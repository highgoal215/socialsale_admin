
import { motion } from "framer-motion";
import { X, Bell, ArrowRight, Loader2, Trash2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNotificationContext } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
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

type NotificationPanelProps = {
  onClose: () => void;
};

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationContext();
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  // Reset to first page when notifications change
  useEffect(() => {
    setCurrentPage(1);
  }, [notifications.length]);

  // Handle click outside the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDeleteNotification = async (id: string) => {
    setDeletingId(id);
    await deleteNotification(id);
    setDeletingId(null);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "order_update":
        return <Bell size={16} className="text-blue-500" />;
      case "system":
        return <Bell size={16} className="text-purple-500" />;
      case "payment":
        return <Bell size={16} className="text-green-500" />;
      case "support":
        return <Bell size={16} className="text-orange-500" />;
      case "promo":
        return <Bell size={16} className="text-pink-500" />;
      default:
        return <Bell size={16} />;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="fixed right-4 top-20 w-80 md:w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[600px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        ref={panelRef}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalPages > 1 ? `Page ${currentPage} of ${totalPages}` : `${notifications.length} total`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-destructive">Error loading notifications</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          ) : notifications.length > 0 ? (
            <>
              {currentNotifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`p-4 border-b hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                disabled={deletingId === notification._id}
                              >
                                {deletingId === notification._id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this notification? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNotification(notification._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</span>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              <Check size={12} />
                            </Button>
                          )}
                          {notification.link && (
                            <Link 
                              to={notification.link}
                              onClick={onClose}
                              className="text-xs text-primary hover:underline"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="border-t bg-muted/20">
                  {/* Page Info */}
                  <div className="flex justify-center items-center p-2 text-xs text-muted-foreground border-b">
                    Showing {startIndex + 1}-{Math.min(endIndex, notifications.length)} of {notifications.length} notifications
                  </div>
                  
                  {/* Pagination Buttons */}
                  <div className="flex justify-center items-center gap-1 p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageClick(pageNumber)}
                            className="h-8 w-8 p-0 text-xs"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={24} className="mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t">
          <Link 
            to="/notifications" 
            className="flex items-center justify-center text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={onClose}
          >
            View all notifications
            <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>
      </motion.div>
    </>
  );
};
