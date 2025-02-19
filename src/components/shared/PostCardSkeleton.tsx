import { motion } from "framer-motion";

const SkeletonLoader = () => {
    return (
        <div className="post-card w-full max-w-2xl p-5 rounded-3xl bg-dark-2">
            <div className="flex-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-14 h-14 rounded-full bg-light-4"
                        animate={{
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                        }}
                    />
                    <div className="flex flex-col gap-2">
                        <motion.div
                            className="h-6 w-32 bg-light-4 rounded"
                            animate={{
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0.2,
                            }}
                        />
                        <motion.div
                            className="h-4 w-48 bg-light-4 rounded"
                            animate={{
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: 0.4,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="py-5">
                <motion.div
                    className="h-6 w-full bg-light-4 rounded mb-4"
                    animate={{
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.6,
                    }}
                />
                <motion.div
                    className="h-6 w-4/5 bg-light-4 rounded"
                    animate={{
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.8,
                    }}
                />
            </div>

            <motion.div
                className="w-full aspect-square bg-light-4 rounded-2xl"
                animate={{
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 1,
                }}
            />

            <div className="flex justify-between items-center mt-5">
                <motion.div
                    className="h-8 w-24 bg-light-4 rounded"
                    animate={{
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 1.2,
                    }}
                />
                <motion.div
                    className="h-8 w-24 bg-light-4 rounded"
                    animate={{
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 1.4,
                    }}
                />
            </div>
        </div>
    );
};

export const PostCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-9">
            {[1, 2, 3].map((index) => (
                <SkeletonLoader key={index} />
            ))}
        </div>
    );
};

export default PostCardSkeleton;