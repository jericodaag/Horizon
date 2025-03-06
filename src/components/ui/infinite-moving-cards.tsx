"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const InfiniteMovingCards = ({
    items,
    direction = "left",
    speed = "fast",
    pauseOnHover = true,
    className,
}: {
    items: {
        quote: string;
        name: string;
        title: string;
    }[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        addAnimation();
    }, []);

    const [start, setStart] = useState(false);

    function addAnimation() {
        if (containerRef.current && scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children);

            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                if (scrollerRef.current) {
                    scrollerRef.current.appendChild(duplicatedItem);
                }
            });

            getDirection();
            getSpeed();
            setStart(true);
        }
    }

    const getDirection = () => {
        if (containerRef.current) {
            if (direction === "left") {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "forwards"
                );
            } else {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "reverse"
                );
            }
        }
    };

    const getSpeed = () => {
        if (containerRef.current) {
            if (speed === "fast") {
                containerRef.current.style.setProperty("--animation-duration", "20s");
            } else if (speed === "normal") {
                containerRef.current.style.setProperty("--animation-duration", "40s");
            } else {
                containerRef.current.style.setProperty("--animation-duration", "80s");
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "scroller relative z-20 max-w-7xl overflow-hidden",
                className
            )}
            style={{
                maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
            }}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    "flex min-w-full shrink-0 gap-4 py-4",
                    start && "animate-scroll",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
                style={{
                    animationDuration: "var(--animation-duration)",
                    animationDirection: "var(--animation-direction)"
                }}
            >
                {items.map((item, idx) => (
                    <li
                        className="w-[350px] max-w-full flex-shrink-0 rounded-2xl border border-slate-700 bg-black px-8 py-6 md:w-[450px]"
                        key={idx}
                    >
                        <blockquote className="text-white">
                            <span className="mb-2 block text-5xl text-violet-500">"</span>
                            <p className="text-lg leading-relaxed mb-5">{item.quote}</p>
                            <footer className="mt-4">
                                <p className="text-base font-semibold text-white">{item.name}</p>
                                <p className="text-sm text-gray-400">{item.title}</p>
                            </footer>
                        </blockquote>
                    </li>
                ))}
            </ul>
        </div>
    );
};