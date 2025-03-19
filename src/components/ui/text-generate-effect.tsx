"use client";

import { useEffect, useState } from "react";

export const TextGenerateEffect = ({
    words,
    className = "",
}: {
    words: string;
    className?: string;
}) => {
    const [displayedContent, setDisplayedContent] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(true);

    useEffect(() => {
        if (!isGenerating) return;

        if (wordIndex < words.length) {
            const timeout = setTimeout(() => {
                setDisplayedContent((prev) => prev + words[wordIndex]);
                setWordIndex((prev) => prev + 1);
            }, 15); // Adjust speed as needed

            return () => clearTimeout(timeout);
        } else {
            setIsGenerating(false);
        }
    }, [displayedContent, wordIndex, isGenerating, words]);

    return (
        <div
            className={`text-sm sm:text-lg md:text-xl text-gray-300 font-inter leading-relaxed px-2 sm:px-0 ${className}`}
        >
            {displayedContent}
            {isGenerating && (
                <span className="inline-block w-1 h-3 sm:h-4 bg-violet-500 ml-0.5 sm:ml-1 animate-blink" />
            )}
        </div>
    );
};