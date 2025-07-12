// src/components/TestNotificationButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { useNotificationContext } from '@/context/NotificationContext';
import { useToast } from '@/hooks/use-toast';

export const TestNotificationButton = () => {
  const [testing, setTesting] = useState(false);
  const { sendNotification } = useNotificationContext();
  const { toast } = useToast();

  const handleTestNotification = async () => {
    setTesting(true);
    
    try {
      // Get current user info
      const userStr = localStorage.getItem('admin_user');
      if (!userStr) {
        toast({
          title: 'Error',
          description: 'User not found. Please log in again.',
          variant: 'destructive'
        });
        return;
      }

      const user = JSON.parse(userStr);
      
      // Create a test notification
      await sendNotification({
        userId: user._id,
        type: 'system',
        title: 'Test Immediate Notification',
        message: `This notification was created at ${new Date().toLocaleTimeString()} and should appear immediately!`,
        link: '/test',
        bypassPreferences: true
      });

      toast({
        title: 'Test Sent',
        description: 'Test notification sent! Check if it appears immediately.',
        variant: 'default'
      });

    } catch (error) {
      console.error('Test notification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification.',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button
      onClick={handleTestNotification}
      disabled={testing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {testing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Bell size={16} />
      )}
      {testing ? 'Testing...' : 'Test Notification'}
    </Button>
  );
}; 