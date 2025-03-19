import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define interfaces for clear typings
interface CardItem {
    title: string;
    description: string;
    image?: string;
    category?: string;
}

interface AppleCardsCarouselProps {
    items: CardItem[];
}

// The main carousel component with individual card transitions
export const AppleCardsCarousel: React.FC<AppleCardsCarouselProps> = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle next slide with debounce
    const handleNext = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % items.length);
        // Reset animation state after transition completes
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating, items.length]);

    // Handle previous slide with debounce
    const handlePrev = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        // Reset animation state after transition completes
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating, items.length]);

    // Get indices for the three visible cards
    const getCardIndex = (offset: number): number => {
        return (currentIndex + offset) % items.length;
    };

    // Card transition variants
    const cardVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto px-4">
            {/* Grid with asymmetric layout - mobile optimized */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* First card (larger) - full width on mobile, 7 columns on desktop */}
                <div className="md:col-span-7 h-full">
                    <div className="relative h-[350px] sm:h-[320px] md:h-[380px] w-full rounded-xl overflow-hidden shadow-xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="absolute inset-0"
                                onAnimationComplete={() => setIsAnimating(false)}
                            >
                                {/* Background image without gradient */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center h-full w-full"
                                    style={{ backgroundImage: `url(${items[getCardIndex(0)].image})` }}
                                />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 z-10 w-full bg-black/50">
                                    {items[getCardIndex(0)].category && (
                                        <span className="text-xs sm:text-sm font-medium text-violet-400 mb-1 sm:mb-2 block">
                                            {items[getCardIndex(0)].category}
                                        </span>
                                    )}
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">
                                        {items[getCardIndex(0)].title}
                                    </h2>
                                    <p className="text-gray-300 text-sm sm:text-base max-w-xl line-clamp-2 sm:line-clamp-none">
                                        {items[getCardIndex(0)].description}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Second and third cards (smaller) - hidden on mobile, visible on md screens and up */}
                <div className="hidden md:block md:col-span-5 space-y-6">
                    {/* Second card */}
                    <div className="relative h-[180px] w-full rounded-xl overflow-hidden shadow-lg">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={getCardIndex(1)}
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="absolute inset-0"
                            >
                                {/* Background image without gradient */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center h-full w-full"
                                    style={{ backgroundImage: `url(${items[getCardIndex(1)].image})` }}
                                />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 p-6 z-10 w-full bg-black/50">
                                    {items[getCardIndex(1)].category && (
                                        <span className="text-sm font-medium text-violet-400 mb-1 block">
                                            {items[getCardIndex(1)].category}
                                        </span>
                                    )}
                                    <h2 className="text-xl font-bold mb-1 text-white">
                                        {items[getCardIndex(1)].title}
                                    </h2>
                                    <p className="text-gray-300 text-sm max-w-xl line-clamp-2">
                                        {items[getCardIndex(1)].description}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Third card */}
                    <div className="relative h-[180px] w-full rounded-xl overflow-hidden shadow-lg">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={getCardIndex(2)}
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="absolute inset-0"
                            >
                                {/* Background image without gradient */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center h-full w-full"
                                    style={{ backgroundImage: `url(${items[getCardIndex(2)].image})` }}
                                />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 p-6 z-10 w-full bg-black/50">
                                    {items[getCardIndex(2)].category && (
                                        <span className="text-sm font-medium text-violet-400 mb-1 block">
                                            {items[getCardIndex(2)].category}
                                        </span>
                                    )}
                                    <h2 className="text-xl font-bold mb-1 text-white">
                                        {items[getCardIndex(2)].title}
                                    </h2>
                                    <p className="text-gray-300 text-sm max-w-xl line-clamp-2">
                                        {items[getCardIndex(2)].description}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Navigation controls - improved touch targets for mobile */}
            <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end gap-3">
                <motion.button
                    onClick={handlePrev}
                    className="p-3 rounded-full bg-black/20 backdrop-blur-sm hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Previous item"
                    disabled={isAnimating}
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </motion.button>

                <motion.button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-black/20 backdrop-blur-sm hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Next item"
                    disabled={isAnimating}
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </motion.button>
            </div>

            {/* Pagination dots - improved spacing for mobile */}
            <div className="mt-3 sm:mt-4 flex justify-center gap-2">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            if (isAnimating) return;
                            setCurrentIndex(idx);
                            setIsAnimating(true);
                            setTimeout(() => setIsAnimating(false), 500);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                            ? "bg-violet-500 w-6"
                            : "bg-gray-600 hover:bg-gray-400"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default AppleCardsCarousel;