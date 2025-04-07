import { Link, useLocation } from "react-router-dom";
import { bottombarLinks } from "@/constants";
import { motion } from "framer-motion";
import { useSocket } from "@/context/SocketContext";

const Bottombar = () => {
    const { pathname } = useLocation();
    const { totalUnreadMessages } = useSocket();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Improved background with smoother edges and better blur */}
            <div className="absolute inset-0 bg-dark-2/90 backdrop-blur-lg border-t border-dark-4 rounded-t-xl"></div>

            <section className="bottom-bar relative flex items-center justify-around py-3 px-2">
                {bottombarLinks.map((link) => {
                    const isActive = pathname === link.route;
                    const isCreatePost = link.route === '/create-post';
                    const isMessages = link.route === '/messages';
                    const showBadge = isMessages && totalUnreadMessages > 0;

                    if (isCreatePost) {
                        return (
                            <Link
                                key={`bottombar-${link.label}`}
                                to={link.route}
                                className="relative flex flex-col items-center"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/20"
                                >
                                    <img
                                        src={link.imgURL}
                                        alt={link.label}
                                        className="w-5 h-5 invert-white"
                                    />
                                </motion.div>
                                <p className="text-[10px] text-center text-light-2 mt-1">{link.label}</p>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={`bottombar-${link.label}`}
                            to={link.route}
                            className={`${isActive ? "rounded-xl bg-primary-500/20" : ""} 
                                flex-center flex-col gap-1 p-2 transition relative`}
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="flex-center flex-col relative"
                            >
                                <img
                                    src={link.imgURL}
                                    alt={link.label}
                                    width={18}
                                    height={18}
                                    className={isActive ? "invert-white" : "opacity-70"}
                                />

                                {/* Notification badge */}
                                {showBadge && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute -top-1 -right-1 bg-primary-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                                    >
                                        {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                                    </motion.div>
                                )}
                            </motion.div>

                            <p className={`text-[10px] ${isActive ? "text-primary-500 font-medium" : "text-light-2"}`}>
                                {link.label}
                            </p>
                        </Link>
                    );
                })}
            </section>

            {/* Safe area padding for notched devices */}
            <div className="h-safe-bottom bg-dark-2/90"></div>
        </div>
    );
};

export default Bottombar;