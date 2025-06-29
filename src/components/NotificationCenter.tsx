import React from 'react';
import { X, Trash2, CheckCheck, Bell, Goal, Newspaper, Trophy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkAsRead, useClearAllNotifications, useDeleteNotification, type Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const clearAll = useClearAllNotifications();
  const deleteNotification = useDeleteNotification();

  if (!isOpen) return null;

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id);
    }

    // Navigate to related content
    if (notification.type === 'article' && notification.article_id) {
      navigate(`/artikel/${notification.article_id}`);
      onClose();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification.mutate(notificationId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <Newspaper className="w-6 h-6 text-az-red" />;
      case 'goal': return <Goal className="w-6 h-6 text-az-red" />;
      case 'match': return <Trophy className="w-6 h-6 text-az-red" />;
      case 'breaking': return <AlertTriangle className="w-6 h-6 text-az-red" />;
      default: return <Bell className="w-6 h-6 text-az-red" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'article': return 'Artikel';
      case 'goal': return 'Goal';
      case 'match': return 'Wedstrijd';
      case 'breaking': return 'Breaking';
      default: return 'Notificatie';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-premium-gray-200 dark:border-gray-700 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-premium-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-premium-gray-600 dark:text-gray-300" />
            </Button>
            <h1 className="headline-premium text-headline-lg text-az-black dark:text-white">
              Notificaties
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-az-red text-white hover:bg-az-red/90 font-semibold">
                {unreadCount} nieuw
              </Badge>
            )}
          </div>
          
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAll.mutate()}
              disabled={clearAll.isPending}
              className="flex items-center gap-2 border-premium-gray-200 dark:border-gray-700 hover:bg-premium-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Alles gelezen
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-az-red mx-auto"></div>
            <p className="mt-4 body-premium text-premium-gray-600 dark:text-gray-400">
              Notificaties laden...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-16 h-16 text-premium-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="body-premium text-body-lg text-premium-gray-600 dark:text-gray-400 mb-2">
              Geen notificaties
            </p>
            <p className="body-premium text-body-md text-premium-gray-500 dark:text-gray-500">
              Je ontvangt hier updates over AZ nieuws en wedstrijden
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`card-premium cursor-pointer transition-all hover:shadow-md group relative ${
                  !notification.read
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50'
                    : 'hover:bg-premium-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`headline-premium text-headline-sm mb-1 ${
                            !notification.read 
                              ? 'text-az-black dark:text-white' 
                              : 'text-premium-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          {notification.description && (
                            <p className={`body-premium text-body-md mb-3 ${
                              !notification.read 
                                ? 'text-premium-gray-700 dark:text-gray-300' 
                                : 'text-premium-gray-600 dark:text-gray-400'
                            }`}>
                              {notification.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3">
                            <Badge 
                              className="bg-az-red text-white hover:bg-az-red/90 text-xs font-semibold"
                            >
                              {getTypeBadge(notification.type)}
                            </Badge>
                            
                            <span className="body-premium text-body-sm text-premium-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: nl,
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(e, notification.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-az-red rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
