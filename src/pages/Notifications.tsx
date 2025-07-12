// src/pages/Notifications.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell, 
  Filter, 
  Search, 
  Trash2, 
  Check, 
  Send, 
  Users, 
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useNotificationContext } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type NotificationType = 'all' | 'order_update' | 'payment' | 'support' | 'promo' | 'system';
type ReadStatus = 'all' | 'read' | 'unread';

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    refresh, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    sendNotification,
    broadcastNotification,
    sendMaintenanceNotification
  } = useNotificationContext();

  const { toast } = useToast();
  
  const [filterType, setFilterType] = useState<NotificationType>('all');
  const [filterRead, setFilterRead] = useState<ReadStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
      (filterRead === 'read' && notification.read) || 
      (filterRead === 'unread' && !notification.read);
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesRead && matchesSearch;
  });

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDeleteNotification = async (id: string) => {
    setDeletingId(id);
    await deleteNotification(id);
    setDeletingId(null);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "order_update":
        return "Order Update";
      case "system":
        return "System";
      case "payment":
        return "Payment";
      case "support":
        return "Support";
      case "promo":
        return "Promotion";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage and view all notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <Check size={16} className="mr-2" />
              Mark All Read
            </Button>
          )}
          <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Send size={16} className="mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to a specific user.
                </DialogDescription>
              </DialogHeader>
              <SendNotificationForm 
                onSubmit={async (data) => {
                  setSendingNotification(true);
                  await sendNotification(data);
                  setSendingNotification(false);
                  setShowSendDialog(false);
                }}
                loading={sendingNotification}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Users size={16} className="mr-2" />
                Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Broadcast Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to all users.
                </DialogDescription>
              </DialogHeader>
              <BroadcastNotificationForm 
                onSubmit={async (data) => {
                  setSendingNotification(true);
                  await broadcastNotification(data);
                  setSendingNotification(false);
                  setShowBroadcastDialog(false);
                }}
                loading={sendingNotification}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <AlertCircle size={16} className="mr-2" />
                Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Maintenance Notification</DialogTitle>
                <DialogDescription>
                  Send a maintenance notification to all users.
                </DialogDescription>
              </DialogHeader>
              <MaintenanceNotificationForm 
                onSubmit={async (data) => {
                  setSendingNotification(true);
                  await sendMaintenanceNotification(data);
                  setSendingNotification(false);
                  setShowMaintenanceDialog(false);
                }}
                loading={sendingNotification}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredNotifications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={(value: NotificationType) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="order_update">Order Updates</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="promo">Promotions</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterRead} onValueChange={(value: ReadStatus) => setFilterRead(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            {loading ? "Loading notifications..." : `${filteredNotifications.length} notifications found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin mr-2" />
              Loading notifications...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle size={24} className="mr-2" />
              {error}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Bell size={24} className="mr-2" />
              No notifications found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-muted/20 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getIconForType(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{notification.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTime(notification.createdAt)}</span>
                          {notification.link && (
                            <a 
                              href={notification.link}
                              className="text-primary hover:underline"
                            >
                              View Details
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            disabled={deletingId === notification._id}
                          >
                            {deletingId === notification._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
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
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Send Notification Form Component
function SendNotificationForm({ onSubmit, loading }: { onSubmit: (data: any) => Promise<void>, loading: boolean }) {
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    type: 'system' as const,
    title: '',
    message: '',
    link: ''
  });
  const [identifierType, setIdentifierType] = useState<'userId' | 'email'>('email');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data based on identifier type
    const submitData: any = {
      type: formData.type,
      title: formData.title,
      message: formData.message,
      link: formData.link
    };
    
    if (identifierType === 'userId') {
      submitData.userId = formData.userId;
    } else {
      submitData.email = formData.email;
    }
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>User Identifier</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={identifierType === 'email' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIdentifierType('email')}
          >
            Email
          </Button>
          <Button
            type="button"
            variant={identifierType === 'userId' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIdentifierType('userId')}
          >
            User ID
          </Button>
        </div>
      </div>
      
      {identifierType === 'email' ? (
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
            required
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            placeholder="Enter user ID"
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="order_update">Order Update</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="promo">Promotion</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Notification title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Notification message"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="link">Link (Optional)</Label>
        <Input
          id="link"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          placeholder="https://example.com"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
          Send Notification
        </Button>
      </DialogFooter>
    </form>
  );
}

// Maintenance Notification Form Component
function MaintenanceNotificationForm({ onSubmit, loading }: { onSubmit: (data: any) => Promise<void>, loading: boolean }) {
  const [formData, setFormData] = useState({
    type: 'maintenance' as const,
    message: '',
    scheduledTime: '',
    duration: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="maintenance-type">Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="maintenance">Scheduled Maintenance</SelectItem>
            <SelectItem value="update">System Update</SelectItem>
            <SelectItem value="outage">Service Outage</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="maintenance-message">Message</Label>
        <Textarea
          id="maintenance-message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Describe the maintenance, update, or outage..."
          required
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="scheduled-time">Scheduled Time (Optional)</Label>
        <Input
          id="scheduled-time"
          type="datetime-local"
          value={formData.scheduledTime}
          onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (Optional)</Label>
        <Input
          id="duration"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="e.g., 2 hours, 30 minutes"
        />
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={loading} variant="destructive">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <AlertCircle size={16} className="mr-2" />}
          Send Maintenance Notice
        </Button>
      </DialogFooter>
    </form>
  );
}

// Broadcast Notification Form Component
function BroadcastNotificationForm({ onSubmit, loading }: { onSubmit: (data: any) => Promise<void>, loading: boolean }) {
  const [formData, setFormData] = useState({
    type: 'system' as const,
    title: '',
    message: '',
    link: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="broadcast-type">Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="promo">Promotion</SelectItem>
            <SelectItem value="order_update">Order Update</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="broadcast-title">Title</Label>
        <Input
          id="broadcast-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Notification title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="broadcast-message">Message</Label>
        <Textarea
          id="broadcast-message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Notification message"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="broadcast-link">Link (Optional)</Label>
        <Input
          id="broadcast-link"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          placeholder="https://example.com"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Users size={16} className="mr-2" />}
          Broadcast to All Users
        </Button>
      </DialogFooter>
    </form>
  );
} 