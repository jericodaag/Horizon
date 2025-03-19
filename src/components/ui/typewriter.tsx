import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Word {
    text: string;
    className?: string;
}

interface TypewriterEffectProps {
    words: Word[];
    className?: string;
    cursorClassName?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
    words,
    className = "",
    cursorClassName = "",
}) => {
    const wordsArray = words.map((word) => ({
        ...word,
        characters: Array.from(word.text),
    }));

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentWordIndex === wordsArray.length) {
            setIsComplete(true);
            return;
        }

        const currentWord = wordsArray[currentWordIndex];

        if (currentCharacterIndex === currentWord.characters.length) {
            const timeout = setTimeout(() => {
                setCurrentWordIndex(currentWordIndex + 1);
                setCurrentCharacterIndex(0);
            }, 500); // Pause between words

            return () => clearTimeout(timeout);
        }

        const timeout = setTimeout(() => {
            setCurrentCharacterIndex(currentCharacterIndex + 1);
        }, 100); // Typing speed

        return () => clearTimeout(timeout);
    }, [currentWordIndex, currentCharacterIndex, wordsArray]);

    return (
        <div className={`${className} flex flex-wrap justify-center items-center`}>
            {wordsArray.map((word, wordIndex) => (
                <div key={wordIndex} className="mr-1 sm:mr-2 flex items-center">
                    {word.characters.map((character, characterIndex) => {
                        const isCurrentWord = wordIndex === currentWordIndex;
                        const isTyped =
                            wordIndex < currentWordIndex ||
                            (isCurrentWord && characterIndex < currentCharacterIndex);

                        return (
                            <motion.span
                                key={characterIndex}
                                className={`${word.className} text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight`}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: isTyped ? 1 : 0,
                                }}
                                transition={{ duration: 0.1 }}
                            >
                                {character}
                            </motion.span>
                        );
                    })}
                </div>
            ))}
            {!isComplete && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                    className={`${cursorClassName} text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold`}
                >
                    |
                </motion.span>
            )}
        </div>
    );
};