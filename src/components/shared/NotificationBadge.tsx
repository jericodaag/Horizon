import { motion, AnimatePresence } from "framer-motion";

interface NotificationBadgeProps {
    count: number;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const NotificationBadge = ({
    count,
    size = "md",
    className = ""
}: NotificationBadgeProps) => {
    if (count <= 0) return null;

    const sizeClasses = {
        sm: "w-4 h-4 text-[8px]",
        md: "w-5 h-5 text-xs",
        lg: "w-6 h-6 text-sm"
    };

    const badgeClass = sizeClasses[size];

    return (
        <AnimatePresence>
            <motion.div
                key="notification-badge"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={`absolute bg-violet-500 text-white font-medium rounded-full flex items-center justify-center shadow-md ${badgeClass} ${className}`}
            >
                {count > 9 ? '9+' : count}
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationBadge;