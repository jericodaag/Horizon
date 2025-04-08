import { useEffect, useState } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useGetUserNotifications, useMarkNotificationsAsRead } from '@/lib/react-query/queries';
import NotificationItem from '@/components/shared/NotificationItem';
import Loader from '@/components/shared/Loader';
import { AnimatePresence, motion } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';
import { Bell, Calendar, Check, Clock } from 'lucide-react';
import { INotification } from '@/types';

const Notifications = () => {
    const { user } = useUserContext();
    const { clearAllNotifications } = useSocket();
    const { mutate: markAsRead } = useMarkNotificationsAsRead();
    const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all');

    const {
        data: notificationsData,
        isLoading,
        isError,
    } = useGetUserNotifications(user.id);

    const allNotifications = notificationsData?.documents.map(item => ({
        $id: item.$id,
        userId: item.userId || "",
        actorId: item.actorId || "",
        type: item.type as 'like' | 'comment' | 'follow',
        postId: item.postId || undefined,
        commentId: item.commentId || undefined,
        read: item.read === false ? false : true,
        createdAt: item.createdAt || item.$createdAt,
        actor: item.actor,
        post: item.post
    } as INotification)) || [];

    const notifications = allNotifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'today') {
            const today = new Date();
            const notifDate = new Date(notification.createdAt);
            return today.toDateString() === notifDate.toDateString();
        }
        return true;
    });

    const hasUnreadNotifications = allNotifications.some(notification => !notification.read);

    useEffect(() => {
        if (user.id && hasUnreadNotifications) {
            markAsRead(user.id);
            clearAllNotifications();
        }
    }, [user.id, hasUnreadNotifications, markAsRead, clearAllNotifications]);

    const groupedNotifications: { [date: string]: INotification[] } = {};
    notifications.forEach(notification => {
        const date = new Date(notification.createdAt).toLocaleDateString();
        if (!groupedNotifications[date]) {
            groupedNotifications[date] = [];
        }
        groupedNotifications[date].push(notification);
    });

    const sortedDates = Object.keys(groupedNotifications).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <div className="w-full h-screen flex justify-center">
            {/* Main content container */}
            <div className="flex-1 max-w-5xl h-screen flex flex-col overflow-hidden px-4 sm:px-6 md:px-8 py-6">
                {/* Fixed header that stays in place */}
                <div className="bg-dark-1 pt-2 pb-3 border-b border-dark-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="h3-bold md:h2-bold">Notifications</h2>

                        {notifications.length > 0 && (
                            <button
                                className="flex items-center gap-1 text-light-3 hover:text-light-2 text-sm transition bg-dark-3 px-3 py-1.5 rounded-full"
                                onClick={() => markAsRead(user.id)}
                            >
                                <Check size={14} />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary-500 text-light-1' : 'bg-dark-3 text-light-3 hover:bg-dark-4'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${filter === 'unread' ? 'bg-primary-500 text-light-1' : 'bg-dark-3 text-light-3 hover:bg-dark-4'}`}
                        >
                            <Bell size={14} />
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('today')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${filter === 'today' ? 'bg-primary-500 text-light-1' : 'bg-dark-3 text-light-3 hover:bg-dark-4'}`}
                        >
                            <Calendar size={14} />
                            Today
                        </button>
                    </div>
                </div>

                {/* Separate scrollable notifications area */}
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    <AnimatePresence>
                        {isLoading ? (
                            <div className="flex-center w-full h-40">
                                <Loader />
                            </div>
                        ) : isError ? (
                            <div className="flex-1 flex flex-col items-center justify-center h-40 p-4">
                                <p className="text-light-3 text-center">Something went wrong while fetching notifications.</p>
                                <button
                                    className="mt-4 bg-primary-500 hover:bg-primary-600 px-5 py-2 rounded-lg text-light-1 text-sm"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : notifications.length > 0 ? (
                            <>
                                {sortedDates.map(date => (
                                    <div key={date} className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={14} className="text-light-3" />
                                            <h3 className="text-light-3 text-sm font-medium">{date === new Date().toLocaleDateString() ? 'Today' : date}</h3>
                                            <div className="h-px bg-dark-4 flex-grow"></div>
                                        </div>

                                        <div className="space-y-2">
                                            {groupedNotifications[date].map(notification => (
                                                <NotificationItem
                                                    key={notification.$id}
                                                    notification={notification}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-16 text-center bg-dark-2 rounded-xl shadow-sm mt-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-dark-3 flex items-center justify-center mb-6">
                                    <Bell size={36} className="text-light-3" />
                                </div>
                                <h3 className="text-light-1 text-lg font-semibold mb-2">No notifications yet</h3>
                                <p className="text-light-3 text-sm max-w-sm">
                                    When someone likes your posts, comments, or follows you, you'll see it here.
                                </p>
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    Refresh
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Notifications;