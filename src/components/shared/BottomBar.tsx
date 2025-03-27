import { Link, useLocation } from "react-router-dom";
import { bottombarLinks } from "@/constants";
import { motion } from "framer-motion";

const Bottombar = () => {
    const { pathname } = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Blurred background for glassmorphism effect */}
            <div className="absolute inset-0 bg-dark-2/80 backdrop-blur-md border-t border-dark-4"></div>

            <section className="bottom-bar relative flex items-center justify-around py-1">
                {bottombarLinks.map((link) => {
                    const isActive = pathname === link.route;
                    const isCreatePost = link.route === '/create-post';

                    if (isCreatePost) {
                        return (
                            <Link
                                key={`bottombar-${link.label}`}
                                to={link.route}
                                className="relative"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="w-12 h-12 -mt-4 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/20"
                                >
                                    <img
                                        src={link.imgURL}
                                        alt={link.label}
                                        className="w-5 h-5 invert-white"
                                    />
                                </motion.div>
                                <p className="text-[10px] text-center text-light-2 mt-0.5">{link.label}</p>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={`bottombar-${link.label}`}
                            to={link.route}
                            className={`${isActive ? "rounded-[10px] bg-primary-500" : ""} 
                                flex-center flex-col gap-0.5 p-2 transition`}
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="flex-center flex-col"
                            >
                                <img
                                    src={link.imgURL}
                                    alt={link.label}
                                    width={16}
                                    height={16}
                                    className={isActive ? "invert-white" : ""}
                                />

                                {/* Notification indicator example for Messages */}
                                {link.label === 'Messages' && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </motion.div>

                            <p className={`text-[10px] ${isActive ? "text-white" : "text-light-2"}`}>
                                {link.label}
                            </p>
                        </Link>
                    );
                })}
            </section>
        </div>
    );
};

export default Bottombar;