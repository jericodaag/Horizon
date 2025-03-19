import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GlassCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
    title,
    description,
    icon,
    index
}) => {
    return (
        <motion.div
            className="relative group p-8 rounded-3xl backdrop-blur-md border border-white/10 overflow-hidden card-3d hover-glow transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            />

            <div className="relative z-10 card-3d-content">
                <div className="inline-flex items-center justify-center p-2 mb-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-gray-400/80 mb-4">{description}</p>
                <motion.a
                    href="/sign-in"
                    className="flex items-center text-sm text-violet-400 font-medium hover:text-violet-300 transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <span>Learn more</span>
                    <ArrowRight className="ml-1 w-4 h-4" />
                </motion.a>
            </div>
        </motion.div>
    );
};

export default GlassCard;