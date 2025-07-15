# Immediate Notifications Guide

## Overview

The notification system is designed to display notifications immediately when they are created, using Socket.IO for real-time communication between the backend and frontend.

## How It Works

### Backend (Node.js + Socket.IO)
1. **Notification Creation**: When a notification is created via `createNotification()`, it:
   - Saves the notification to the database
   - Emits a `new_notification` event via Socket.IO to the user's room
   - Includes the updated unread count

2. **Socket.IO Setup**: The server creates rooms for each user (`user_${userId}`) and admin users (`admin`)

### Frontend (React + Socket.IO Client)
1. **Real-time Connection**: The frontend connects to Socket.IO and joins the user's room
2. **Event Listening**: Listens for `new_notification` events
3. **Immediate Display**: When an event is received, it:
   - Adds the notification to the top of the list
   - Updates the unread count
   - Shows a toast notification immediately

## Testing Immediate Notifications

### Method 1: Using the Test Button (Recommended)
1. Log into the admin panel
2. Go to the Dashboard page
3. Click the "Test Notification" button in the top-right corner
4. The notification should appear immediately as a toast and in the notification panel

### Method 2: Using the API Endpoint
```bash
curl -X POST https://likes.io/api/notifications/admin/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "USER_ID_HERE",
    "type": "system",
    "title": "Test Immediate Notification",
    "message": "This should appear immediately!",
    "link": "/test"
  }'
```

### Method 3: Using the Test Script
```bash
cd likesio-backend
node test-immediate-notification.js
```

## Troubleshooting

### Notifications Not Appearing Immediately

#### 1. Check Socket.IO Connection
- Open browser developer tools
- Look for Socket.IO connection logs in the console
- Should see: "🔌 Connecting to Socket.IO for real-time notifications..."
- Should see: "✅ Socket.IO connected successfully"

#### 2. Check User Room Joining
- Look for: "👤 Joining user room: user_USER_ID"
- Verify the user ID matches the logged-in user

#### 3. Check Backend Logs
- Look for Socket.IO emission logs:
  - "📡 Emitting notification to user_USER_ID"
  - "✅ Notification emitted successfully to user_USER_ID"

#### 4. Check Frontend Event Reception
- Look for: "🔔 Received real-time notification:"
- Look for: "✅ Notification displayed immediately"

### Common Issues

#### Issue: Socket.IO Not Connecting
**Symptoms**: No connection logs in console
**Solutions**:
1. Check if backend server is running on port 5005
2. Verify CORS settings in server.js
3. Check network connectivity

#### Issue: User Room Not Joining
**Symptoms**: No "Joining user room" log
**Solutions**:
1. Check if user is properly authenticated
2. Verify user data in localStorage
3. Check if user._id exists

#### Issue: Notifications Not Emitted
**Symptoms**: No emission logs in backend
**Solutions**:
1. Check if `global.io` is available
2. Verify Socket.IO server setup
3. Check for errors in notification creation

#### Issue: Frontend Not Receiving Events
**Symptoms**: No "Received real-time notification" log
**Solutions**:
1. Check if user is in the correct room
2. Verify event listener setup
3. Check for JavaScript errors

### Debugging Steps

1. **Enable Debug Logging**
   - Backend logs are already enhanced with emojis and details
   - Frontend logs show connection status and event reception

2. **Check Browser Console**
   - Look for Socket.IO connection status
   - Check for JavaScript errors
   - Verify event reception

3. **Check Server Logs**
   - Look for Socket.IO connection logs
   - Check for notification emission logs
   - Verify user room joining

4. **Test Socket.IO Manually**
   ```javascript
   // In browser console
   socketService.getConnectionStatus() // Should return true
   socketService.getSocket() // Should return socket object
   ```

## Performance Considerations

### Rate Limiting
- Maximum 10 notifications per hour per user
- Prevents spam and abuse

### Quiet Hours
- Users can set quiet hours in preferences
- Notifications are blocked during quiet hours (unless bypassed)

### Preferences
- Users can disable specific notification types
- System notifications can bypass preferences

## Best Practices

1. **Use Appropriate Notification Types**
   - `order_update`: For order status changes
   - `payment`: For payment confirmations
   - `support`: For support ticket updates
   - `promo`: For promotional messages
   - `system`: For system-wide announcements

2. **Include Relevant Links**
   - Always include a `link` when the notification relates to a specific page
   - Helps users navigate to relevant content

3. **Bypass Preferences for Important Notifications**
   - Use `bypassPreferences: true` for critical system notifications
   - Ensures important messages are delivered

4. **Test Regularly**
   - Use the test button to verify the system works
   - Check both toast notifications and notification panel

## API Reference

### Creating Notifications
```javascript
// Backend
const notification = await createNotification(
  userId,
  type,
  title,
  message,
  {
    link: '/optional-link',
    relatedId: 'optional-related-id',
    onModel: 'optional-model',
    bypassPreferences: false
  }
);
```

### Frontend Context
```javascript
// React component
const { sendNotification, notifications, unreadCount } = useNotificationContext();

// Send notification
await sendNotification({
  userId: 'user-id',
  type: 'system',
  title: 'Title',
  message: 'Message',
  link: '/optional-link'
});
```

## Conclusion

The immediate notification system is fully implemented and should work out of the box. If you experience issues, follow the troubleshooting steps above. The system includes comprehensive logging to help identify and resolve any problems. 