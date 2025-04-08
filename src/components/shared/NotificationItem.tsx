import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { INotification } from '@/types';
import { timeAgo } from '@/lib/utils';
import { Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDeleteNotification } from '@/lib/react-query/queries';

interface NotificationItemProps {
    notification: INotification;
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const { mutate: deleteNotification } = useDeleteNotification();

    if (!notification.actor) {
        return null;
    }

    const { actor, type, createdAt, read, postId, $id } = notification;

    const getMessage = () => {
        switch (type) {
            case 'like':
                return <span><b>{actor.name}</b> liked your post</span>;
            case 'comment':
                return <span><b>{actor.name}</b> commented on your post</span>;
            case 'follow':
                return <span><b>{actor.name}</b> started following you</span>;
            default:
                return <span><b>{actor.name}</b> interacted with your content</span>;
        }
    };

    const handleClick = () => {
        if (type === 'follow') {
            navigate(`/profile/${actor.$id}`);
        } else if (postId) {
            navigate(`/posts/${postId}`);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);

        deleteNotification($id, {
            onSuccess: () => {
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            layout
            className={`relative flex items-start gap-3 p-4 rounded-xl transition-colors cursor-pointer hover:bg-dark-3 ${!read ? 'bg-dark-3' : ''
                }`}
            onClick={handleClick}
        >
            <div className="flex-shrink-0">
                <img
                    src={actor.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    className="w-10 h-10 rounded-full object-cover border border-dark-4"
                    alt={actor.name}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="text-light-2 text-sm">{getMessage()}</div>

                <div className="text-light-3 text-xs mt-1">
                    {timeAgo(createdAt)}
                </div>

                {notification.post && (
                    <div className="mt-2 rounded-lg overflow-hidden w-12 h-12">
                        <img
                            src={notification.post.imageUrl}
                            alt="Post thumbnail"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {!read && (
                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
            )}

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute right-3 top-3 text-light-4 hover:text-light-1 transition-colors"
                aria-label="Delete notification"
            >
                <Trash size={16} className={isDeleting ? 'opacity-50' : ''} />
            </button>
        </motion.div>
    );
};

export default NotificationItem;