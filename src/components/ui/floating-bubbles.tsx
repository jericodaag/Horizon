import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface FloatingBubblesProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  colors?: string[];
  className?: string;
}

export const FloatingBubbles: React.FC<FloatingBubblesProps> = ({
  count = 15,
  minSize = 10,
  maxSize = 80,
  colors = [
    'rgba(139, 92, 246, 0.15)', // violet
    'rgba(99, 102, 241, 0.15)', // indigo
    'rgba(244, 114, 182, 0.15)', // pink
    'rgba(16, 185, 129, 0.15)', // emerald
  ],
  className,
}) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate bubbles
  useEffect(() => {
    const newBubbles: Bubble[] = [];

    for (let i = 0; i < count; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: minSize + Math.random() * (maxSize - minSize),
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 20 + Math.random() * 40,
        delay: Math.random() * -20,
      });
    }

    setBubbles(newBubbles);
  }, [count, dimensions, minSize, maxSize, colors]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className='absolute rounded-full'
          style={{
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
            left: bubble.x,
            top: bubble.y,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            scale: [1, 1 + Math.random() * 0.3, 1 - Math.random() * 0.2, 1],
            opacity: [0.7, 0.9, 0.8, 0.7],
          }}
          transition={{
            duration: bubble.duration,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: bubble.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBubbles;
