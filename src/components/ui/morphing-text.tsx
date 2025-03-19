import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MorphingTextProps {
    texts: string[];
    className?: string;
    fontSize?: string;
    mobileSize?: string;
    tabletSize?: string;
}

const MorphingText: React.FC<MorphingTextProps> = ({
    texts,
    className,
    fontSize = 'text-4xl',
    mobileSize = 'text-3xl',
    tabletSize = 'text-5xl'
}) => {
    const textIndexRef = useRef<number>(0);
    const morphRef = useRef<number>(0);
    const cooldownRef = useRef<number>(0);
    const timeRef = useRef<Date>(new Date());
    const text1Ref = useRef<HTMLSpanElement | null>(null);
    const text2Ref = useRef<HTMLSpanElement | null>(null);

    // Adjusted timing values for balanced animation speed
    const morphTime = 1.2; // Morph transition duration
    const cooldownTime = 1.8; // How long each text stays visible

    const setStyles = useCallback(
        (fraction: number) => {
            const current1 = text1Ref.current;
            const current2 = text2Ref.current;

            if (!current1 || !current2) return;

            // Blur effect settings
            const maxBlur = 5;

            current2.style.filter = `blur(${Math.min(maxBlur / fraction - maxBlur, 100)}px)`;
            current2.style.opacity = `${Math.pow(fraction, 0.35) * 100}%`;

            const invertedFraction = 1 - fraction;

            current1.style.filter = `blur(${Math.min(maxBlur / invertedFraction - maxBlur, 100)}px)`;
            current1.style.opacity = `${Math.pow(invertedFraction, 0.35) * 100}%`;

            current1.textContent = texts[textIndexRef.current % texts.length];
            current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
        },
        [texts]
    );

    const doMorph = useCallback(() => {
        morphRef.current -= cooldownRef.current;
        cooldownRef.current = 0;
        let fraction = morphRef.current / morphTime;
        if (fraction > 1) {
            cooldownRef.current = cooldownTime;
            fraction = 1;
        }
        setStyles(fraction);
        if (fraction === 1) {
            textIndexRef.current++;
        }
    }, [setStyles]);

    const doCooldown = useCallback(() => {
        morphRef.current = 0;
        const current1 = text1Ref.current;
        const current2 = text2Ref.current;

        if (current1 && current2) {
            current2.style.filter = 'none';
            current2.style.opacity = '100%';
            current1.style.filter = 'none';
            current1.style.opacity = '0%';
        }
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        let active = true;

        const animate = () => {
            if (!active) return;

            animationFrameId = requestAnimationFrame(animate);
            const newTime = new Date();
            const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
            timeRef.current = newTime;
            cooldownRef.current -= dt;
            if (cooldownRef.current <= 0) doMorph();
            else doCooldown();
        };

        animate();

        return () => {
            active = false;
            cancelAnimationFrame(animationFrameId);
        };
    }, [doMorph, doCooldown]);

    return (
        <div
            className={cn(
                `relative mx-auto h-12 w-full max-w-screen-md text-center font-sans ${mobileSize} ${tabletSize} md:${fontSize} font-bold leading-none [filter:url(#threshold)_blur(0.6px)]`,
                className
            )}
        >
            <span
                className='absolute inset-x-0 top-0 m-auto inline-block w-full'
                ref={text1Ref}
            />
            <span
                className='absolute inset-x-0 top-0 m-auto inline-block w-full'
                ref={text2Ref}
            />
            <svg
                id='filters'
                className='fixed h-0 w-0'
                preserveAspectRatio='xMidYMid slice'
            >
                <defs>
                    <filter id='threshold'>
                        <feColorMatrix
                            in='SourceGraphic'
                            type='matrix'
                            values='1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140'
                        />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};

export default MorphingText;