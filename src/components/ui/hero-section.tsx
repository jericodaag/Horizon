import React from 'react';
import { motion } from 'framer-motion';
import { TypewriterEffect } from '@/components/ui/typewriter';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SimplifiedBackground } from '@/components/ui/simplified-background';

interface HeroSectionProps {
    words: { text: string; className?: string }[];
    description: string;
    onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ words, description, onGetStarted }) => {
    return (
        <section className='relative h-screen flex items-center justify-center overflow-hidden'>
            <div className='absolute inset-0 z-0'>
                <SimplifiedBackground />
            </div>

            <div className='relative z-20 text-center px-4 max-w-5xl mx-auto'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className='mb-6 flex items-center justify-center'
                >
                    <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold text-center text-white px-4'>
                        <TypewriterEffect words={words} />
                    </h1>
                </motion.div>

                <div className='mt-8 max-w-3xl mx-auto'>
                    <TextGenerateEffect words={description} />

                    <div className='mt-10 flex justify-center'>
                        <motion.button
                            onClick={onGetStarted}
                            className='relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none'
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />
                            <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-base font-medium text-white backdrop-blur-3xl'>
                                Get Started
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;