import React from 'react';

interface LoadingFallbackProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
    className = "w-full h-40",
    size = 'md'
}) => {
    const spinnerSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${spinnerSizes[size]} border-4 border-violet-500 border-t-transparent rounded-full animate-spin`}></div>
        </div>
    );
};

export default LoadingFallback;